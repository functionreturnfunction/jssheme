Interpreter = {
  VALID_RADII: [2, 8, 10, 16],
  /* Class Variables */
  // if this is set, the last thrown
  // was generated from inside the scheme
  // code being processed, not the
  // interpreter or related classes.
  exception: null,
  ptrs: {head:0, tail:0, max:0},
  specialChars: {
    openParens: '(',
    closeParens: ')',
    space: ' ',
    tab: '\t',
    carriageReturn: '\r',
    newLine: '\n',
    singleQuote: '\'',
    doubleQuote: '"'
  },
  level: 0,
  str: '',
  userVals: {},
  // done so that all math operations work
  // in a uniform manner, from the same
  // math runner function.
  mathFuncs: {
    '+': function(x, y) { return x + y; },
    '-': function(x, y) { return x - y; },
    '*': function(x, y) { return x * y; },
    '/': function(x, y) { return x / y; }
  },

  // done so that all equality operations
  // work in a uniform manner, from the
  // same equality runner function.
  equalityFuncs: {
    '=': function(x, y) { return x == y; },
    '<': function(x, y) { return x < y; },
    '>': function(x, y) { return x > y; }
  },

  /* Defined Special Forms */
  specialForms: {
    'and': function(list) {
      for (var i = 1, len = list.getLen(); i < len; ++i) {
        if (!list.objectAt(i).evaluate()) {
          return false;
        }
      }
      return true;
    },

    'begin': function(list) {
      var i, last;
      for (i = 1, last = list.getLen() - 1; i < last; ++i) {
        list.objectAt(i).evaluate();
      }
      return list.objectAt(last).evaluate();
    },

    'case': function(list) {
      var val = list.objectAt(1).evaluate();
      var cur, cList;
      for (var i = 2, len = list.getLen(); i < len; ++i) {
        cur = list.objectAt(i);
        cList = cur.objectAt(0);
        switch (true) {
          case cList instanceof List:
            for (var j = 0, len2 = cList.getLen(); j < len2; ++j) {
              if (cList.objectAt(j).evaluate() == val) {
                return cur.objectAt(1).evaluate();
              }
            }
            break;
          case cList == 'else':
            return cur.objectAt(1).evaluate();
        }
      }
    },

    'cond': function(list) {
      var cur, l, r;
      for (var i = 1, len = list.getLen(); i < len; ++i) {
        cur = list.objectAt(i);
        l = cur.objectAt(0);
        r = cur.objectAt(1);
        l.scope = list.scope ? list.scope.clone() : null;
        switch (true) {
          case l == 'else':
          case l.evaluate():
            r.scope = list.scope ? list.scope.clone() : null;
            return r.evaluate();
        }
      }
    },

    'define': function(list) {
      return Interpreter._setUserVal(list.objectAt(1), list.objectAt(2));
    },

    'if': function(list) {
      switch (true) {
        case list.objectAt(1).evaluate():
          return list.objectAt(2).evaluate();
        case list.getLen() == 4:
          return list.objectAt(3).evaluate();
      }
    },

    'lambda': function(list) {
      var argList = list.objectAt(1);
      var body = list.objectAt(2);
      var argc = argList.getLen();
      return FunctionCompiler.compileFunction(argc, function() {
        body.scope = new Scope();
        for (var i = 0; i < argc; ++i) {
          var name = argList.objectAt(i).toString(), value = arguments[i].evaluate();
          body.scope.setValue(name, value);
        }
        return body.evaluate();
      });
    },

    'let': function(list) {
      var scope = list.scope ? list.scope.clone() : new Scope();
      var bindings = list.objectAt(1);
      list = list.subList(2, list.getLen());
      var cur, val;
      for (var i = 0, len = bindings.getLen(); i < len; ++i) {
        cur = bindings.objectAt(i);
        val = cur.objectAt(1);
        val.scope = list.scope ? list.scope.clone() : null;
        scope.setValue(cur.objectAt(0), val.evaluate());
      }
      for (var i = 0, len = list.getLen(); i < len; ++i) {
        cur = list.objectAt(i);
        cur.scope = scope;
        if (i == (len - 1)) {
          return cur.evaluate();
        } else {
          cur.evaluate();
        }
      }
    },

    'let*': function(list) {
      var scope = list.scope ? list.scope.clone() : new Scope();
      var bindings = list.objectAt(1);
      list = list.subList(2, list.getLen());
      var cur, curVal;
      for (var i = 0, len = bindings.getLen(); i < len; ++i) {
        cur = bindings.objectAt(i);
        curVal = cur.objectAt(1);
        curVal.scope = scope;
        scope.setValue(cur.objectAt(0),
                       curVal.evaluate());
      }
      for (var i = 0, len = list.getLen(); i < len; ++i) {
        cur = list.objectAt(i);
        cur.scope = scope;
        if (i == (len - 1)) {
          return cur.evaluate();
        } else {
          cur.evaluate();
        }
      }
    },

    'not': function(list) {
      return !list.objectAt(1).evaluate();
    },

    'or': function(list) {
      for (var i = 1, len = list.getLen(); i < len; ++i) {
        if (list.objectAt(i).evaluate()) {
          return true;
        }
      }
      return false;
    },

    'quote': function(list) {
      var val = list.objectAt(1);
      switch (true) {
        case val instanceof List:
        case val instanceof Atom:
          val.quoted = true;
          return val;
        default:
          return new Atom(val, true, list.scope ? list.scope.clone() : null);
      }
    },

    'set!': function(list) {
      var name = list.objectAt(1).toString();
      if (!Interpreter._userValIsSet(name)) {
        throw new InterpreterExceptions.variableNotSet(name);
      }
      // do not evaluate the object,
      // _setUserVal will do that for us
      var val = list.objectAt(2);
      return Interpreter._setUserVal(name, val);
    }
  },

  /* Defined Primitives */
  primitives: {
    'append': FunctionCompiler.compileFunction(2, function(l1, l2) {
      return l1.appendList(l2);
    }),

    'apply': FunctionCompiler.compileFunction(-1, function(list) {
      var last = list.getLen() - 1;
      var argList = list.subList(1, last);
      list = list.objectAt(last);
      list.quoted = false;
      list = argList.appendList(list);
      return list.evaluate();
    }),

    'car': FunctionCompiler.compileFunction(1, function(list) {
      return list.evaluate().objectAt(0);
    }),

    'cdr': FunctionCompiler.compileFunction(1, function(list) {
      // list could be an atom representing a variable which stores a list
      list = list instanceof List ? list : list.evaluate();
      return list.subList(1, list.getLen());
    }),

    'cons': FunctionCompiler.compileFunction(2, function(a, list) {
      return list.evaluate().prepend(a.evaluate());
    }),

    'eq?': FunctionCompiler.compileFunction(2, function(l, r) {
      switch (true) {
        case l instanceof List:
          if (r instanceof List) {
            return (l.isNull() && r.isNull()) ||
              (l === r);
          } else {
            return false;
          }
        case l instanceof Atom:
          return l.evaluate().toString() == r.evaluate().toString();
        default:
          return (l.evaluate() == r.evaluate());
      }
    }),

    'null?': FunctionCompiler.compileFunction(1, function(obj) {
      obj = obj.evaluate();
      return obj instanceof List ? obj.isNull() : false;
    }),

    'pair?': FunctionCompiler.compileFunction(1, function(obj) {
      obj = obj.evaluate();
      return obj instanceof List ? !obj.isNull() : false;
    }),

    'number?': FunctionCompiler.compileFunction(1, function(obj) {
      obj = obj.evaluate();
      return (typeof(obj) == 'number');
    }),

    'pp': FunctionCompiler.compileFunction(1, function(obj) {
      Interpreter.print(obj.evaluate());
    })
  },

  /* Compiled Functions */
  compiledFunctions: {
    'number->string': function(list) {
      return list.objectAt(1).evaluate().toString();
    },

    'string-append': function(list) {
      var sb = [], argc = list.getLen();
      for (var i = 1; i < argc; ++i) {
        sb.push(list.objectAt(i).evaluate());
      }
      return sb.join('');
    },

    'string->number': function(list) {
      var num = list.objectAt(1).evaluate();
      var radix = list.getLen() > 2 ? list.objectAt(2).evaluate() : false;
      var ret;
      if (radix !== false) {
        if (Interpreter.VALID_RADII.indexOf(radix) == -1) {
          throw new InterpreterExceptions.objectOutOfRange(radix, 'string->number');
        }

        if (/^\d+\.\d+$/.test(num)) {
          return false;
        }

        ret = parseInt(num, radix);
        return isNaN(ret) ? false : ret;
      }

      ret = parseFloat(num);
      return isNaN(ret) ? false : ret;
    }
  },

  /* Class Methods */
  initPrinter: function(printFn) {
    Interpreter._printFn = printFn;
  },

  print: function(str) {
    if (!Interpreter._printFn) {
      throw 'Print function not yet initialized.';
    }
    Interpreter._printFn(str + '\n');
  },

  _initPtrs: function() {
    var ptrs = Interpreter.ptrs;
    ptrs.head = 0;
    ptrs.tail = 0;
    ptrs.max = Interpreter.str.length;
  },

  _getCurChar: function() {
    return Interpreter.str.charAt(Interpreter.ptrs.head);
  },

  _getCurStr: function() {
    return Interpreter.str.substring(Interpreter.ptrs.tail,
                                     Interpreter.ptrs.head);
  },

  _getUserVal: function(str) {
    return Interpreter.userVals[str];
  },

  _setUserVal: function(str, val) {
    switch (true) {
      case (val instanceof List && val.quoted):
      case (val == undefined):
        Interpreter.userVals[str] = val;
        break;
      default:
        Interpreter.userVals[str] = val.evaluate();
    }
    return str;
  },

  _userValIsSet: function(str) {
    return (Interpreter._getUserVal(str) != undefined);
  },

  _getCompiledFunction: function(str) {
    return Interpreter.compiledFunctions[str];
  },

  _getSpecialForm: function(str) {
    return Interpreter.specialForms[str];
  },

  _getPrimitive: function(str) {
    return Interpreter.primitives[str];
  },

  _doMath: function(fn, list) {
    var ret = list.objectAt(1).evaluate();
    ret = ret instanceof Atom ? ret.evaluate() : ret;
    for (var i = 2, len = list.getLen(); i < len; ++i) {
      var left = ret;
      var right = list.objectAt(i);
      right = right.evaluate();
      right = right instanceof Atom ? right.evaluate() : right;
      ret = fn(left, right);
    }
    return ret;
  },

  _doEquality: function(fn, list) {
    var ret = list.objectAt(1).evaluate();
    for (var i = 2, len = list.getLen(); i < len; ++i) {
      ret = fn(ret, list.objectAt(i).evaluate());
    }
    return ret;
  },

  _getMathFunction: function(str) {
    var fn = Interpreter.mathFuncs[str];
    return (typeof(fn) != 'function') ? fn : (function(fn) {
      return function(list) {
        return Interpreter._doMath(fn, list);
      };
    })(fn);
  },

  _getEqualityFunction: function(str) {
    var fn = Interpreter.equalityFuncs[str];
    return (typeof(fn) != 'function') ? fn : (function(fn) {
      return function(list) {
        return Interpreter._doEquality(fn, list);
      };
    })(fn);
  },

  _getLiteral: function(str) {
    var match;
    switch (true) {
      case /^-?\d+\.\d+$/.test(str):
        return parseFloat(str, 10);
      case /^-?\d+$/.test(str):
        return parseInt(str, 10);
      case (match = str.match(/^"(.*)"$/)) != null:
        return match[1]; // string
      case (match = str.match(/^#(t|f)$/)) != null:
        return match[1] == 't'; // boolean
    }
  },

  _getDefined: function(str, scope) {
    var match;
    switch (true) {
      case (scope) && (match = scope.getValue(str)) != null:
      case (match = this._getUserVal(str)) != null:
      case (match = this._getPrimitive(str)) != null:
      case (match = this._getMathFunction(str)) != null:
      case (match = this._getEqualityFunction(str)) != null:
      case (match = this._getSpecialForm(str)) != null:
      case (match = this._getCompiledFunction(str)) != null:
        return match;
    }
  },

  _evalAtom: function(str, scope) {
    var match;
    switch (true) {
      case (match = this._getLiteral(str)) != null:
      case (match = this._getDefined(str, scope)) != null:
        return match;
      default:
        throw new InterpreterExceptions.variableNotSet(str);
    }
  },

  _run: function(quoted, list) {
    var ptrs = Interpreter.ptrs;
    var chars = Interpreter.specialChars;
    var quoted = quoted || false;
    var list = list instanceof List ? list : null;
    var curChar, curStr;


    function tryAppend() {
      if (ptrs.head > ptrs.tail) {
        if (!list) {
          list = new List(Interpreter.level + 1, null, quoted);
        }
        list.append(quoted ? new Atom(curStr, quoted) : curStr);
      }
    }

    while (ptrs.head < ptrs.max) {
      curChar = Interpreter._getCurChar();
      curStr = Interpreter._getCurStr();
      switch (curChar) {
        case chars.openParens:
          Interpreter.level++;
          ptrs.head++;
          ptrs.tail = ptrs.head;
          switch (true) {
            case !list:
              list = new List(Interpreter.level, null, quoted);
              break;
            default:
              list.append(Interpreter._run(false, new List(Interpreter.level, null, quoted)));
              break;
          }
          quoted = false;
          break;
        case chars.closeParens:
          Interpreter.level--;
          tryAppend();
          ptrs.head++;
          ptrs.tail = ptrs.head;
          switch (true) {
            case !list:
              list = new List(Interpreter.level + 1, null, quoted);
              break;
            case list.level > Interpreter.level:
              return list;
          }
          break;
        case chars.space:
        case chars.tab:
        case chars.carriageReturn:
        case chars.newLine:
          tryAppend();
          quoted = false;
          ptrs.head++;
          ptrs.tail = ptrs.head;
          break;
        case chars.singleQuote:
          quoted = true;
          ptrs.head++;
          ptrs.tail = ptrs.head;
          break;
        case chars.doubleQuote:
          // 'readString()'
          while (ptrs.head++ < ptrs.max) {
            curChar = this._getCurChar();
            if (curChar == chars.doubleQuote) {
              // need to move past the end double quote
              ptrs.head++;
              break;
            }
          }
          break;
        default:
          // 'readAtom()'
          while (ptrs.head++ < ptrs.max) {
            curChar = this._getCurChar();
            if ([chars.space, chars.closeParens, chars.newLine, chars.tab, chars.carriageReturn]
                .indexOf(curChar) > -1) {
              break;
            }
          }
        break;
      }
    }
    if (ptrs.head > ptrs.tail) {
      if (!list) {
        return new Atom(Interpreter._getCurStr(), quoted);
      } else if (quoted) {
        list.append(new Atom(Interpreter._getCurStr(), quoted));
      } else {
        list.append(Interpreter._getCurStr());
      }
    }
    return list;
  },

  /* Exposed Class Methods */
  parse: function(str) {
    Interpreter.str = str;
    Interpreter._initPtrs();
    Interpreter.level = 0;
    var result = Interpreter._run();
    return result.evaluate();
  },

  compileFunction: function(argc, fn) {
    return new DefinedFunction(argc, fn).compileFunc();
  }
};

var InterpreterExceptions = {
  variableNotSet: function(obj) {
    this.toString = function() {
      return 'The variable ' + obj.toString() + ' is not set.';
    };
    Interpreter.exception = this;
    return true;
  },

  objectOutOfRange: function(obj, fnName) {
    this.toString = function() {
      return 'The object ' + obj.toString() + ', passed as an argument to ' +
        fnName + ', is not in the correct range.'
    };
    Interpreter.exception = this;
    return true;
  }
};
