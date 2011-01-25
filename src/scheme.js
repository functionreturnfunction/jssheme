/* Class List */
var List = function(level, arr, quoted, scope) {
  this._arr = (arr||null) instanceof Array ? arr : [];
  this.level = typeof(level||null) == 'number' ? level : 0;
  this.quoted = quoted || false;
  this.scope = scope;

  return true;
};

/* Private Methods */
List.prototype._copyAndEvalArr = function() {
  return List._copyAndEvalArr(this._arr, this.scope);
};

/* Priviledged Methods */
List.prototype.isNull = function() {
  return (this._arr.length == 0);
};

List.prototype.prepend = function(val) {
  return this._arr.unshift(val);
};

List.prototype.append = function(val) {
  return this._arr.push(val);
};

List.prototype.appendList = function(list) {
  return List._appendList(list, this);
};

List.prototype.subList = function(from, to) {
  return new List(this.level + 1, this._arr.slice(from, to), this.quoted,
                  this.scope);
};

List.prototype.getLen = function() {
  return this._arr.length;
};

List.prototype.toString = function() {
  return this.isNull() ? '()' : List._toString(this._arr);
};

List.prototype.evaluate = function() {
  return this.quoted ? this : List._evaluate(this._copyAndEvalArr(), this);
};

List.prototype.itemAt = function(i) {
  return this._arr[i];
};

List.prototype.objectAt = function(i) {
  return List._objectAt(this._arr, i, this.scope);
};

/* Private Methods */
List._copyAndEvalArr = function(arr, scope) {
  var ret = arr[0], curItem;
  if (ret.constructor == List) {
    ret.scope = scope;
  } else {
    ret = new Atom(ret, false, scope);
  }
  ret = [ret.evaluate()];
  for( var i = 1, len = arr.length; i < len; ++i ) {
    curItem = arr[i];
    // TODO:
    // test this vs. dynamically appending
    // using i
    if (curItem.constructor == List) {
      curItem.scope = scope;
    }
    ret.push(curItem);
  }
  return ret;
};

/* Priviledged Methods */
List._appendList = function(to, from) {
  for( var i = from.getLen() - 1; i >= 0; --i ) {
    to.prepend(from.itemAt(i));
  }
  return to;
};

List._toString = function(arr) {
  var sb = ['('];
  for( var i = 0, len = arr.length - 1; i < len; ++i ) {
    sb.push(arr[i].toString())
    sb.push(' ');
  }
  sb.push(arr[arr.length - 1]);
  sb.push(')');
  return sb.join('');
};

List._evaluate = function(arr, that) {
  return arr[0](that);
};

List._objectAt = function(arr, i, scope) {
  var obj = arr[i];
  switch( true ) {
    case obj instanceof Atom:
    case obj instanceof List:
      return obj;
    default:
      return new Atom(obj, false, scope);
  }
};

/* Class Atom */
var Atom = function(val, quoted, scope) {
  this._val = val;
  this.quoted = quoted || false;
  this.scope = scope;

  return true;
};

/* Priviledged Methods */
Atom.prototype.toString = function() {
  return this._val;
};

Atom.prototype.evaluate = function() {
  return this.quoted ? this : Interpreter._evalAtom(this._val, this.scope);
};

/* Class Scope */
var Scope = function() {
  this._values = {};

  return true;
};

/* Priviledged Methods */
Scope.prototype.getValue = function(str) {
  return this._values[str];
};

Scope.prototype.setValue = function(str, val) {
  return Scope._setValue(this._values, str, val);
};

/* Static Methods */
Scope._setValue = function(values, str, val) {
  switch( true ) {
    case val instanceof Atom:
    case val instanceof List:
      if( val.quoted ) {
        values[str] = val.evaluate();
        break;
      }
    default:
      values[str] = val;
  }
  return str;
};

/* Class FunctionCompiler */
var FunctionCompiler = function(argc, fn) {
  this.argc = argc;
  this.fn = fn;

  return true;
};

FunctionCompiler.prototype.compile = function() {
  var fn = this.fn, argc = this.argc;
  return function(list) {
    var args = [];
    for (var i = 1; i <= argc; ++i) {
      args.push(list.objectAt(i));
    }
    return fn.apply(list, args);
  };
};

FunctionCompiler.compileFunction = function(argc, fn) {
  return new FunctionCompiler(argc, fn).compile();
};

var Interpreter = {
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
    '/': function(x, y) { return x / y; },
    '=': function(x, y) { return x == y },
    '<': function(x, y) { return x < y },
    '>': function(x, y) { return x > y }
  },

  /* Defined Special Forms */
  specialForms: {
    'and': function(list) {
      for( var i = 1, len = list.getLen(); i < len; ++i ) {
        if( !list.objectAt(i).evaluate() ) {
          return false;
        }
      }
      return true;
    },

    'begin': function(list) {
      var i, last;
      for( i = 1, last = list.getLen() - 1; i < last; ++i ) {
        list.objectAt(i).evaluate();
      }
      return list.objectAt(last).evaluate();
    },

    'case': function(list) {
      var val = list.objectAt(1).evaluate();
      var cur, cList;
      for( var i = 2, len = list.getLen(); i < len; ++i ) {
        cur = list.objectAt(i);
        cList = cur.objectAt(0);
        switch( true ) {
          case cList instanceof List:
            for( var j = 0, len2 = cList.getLen(); j < len2; ++j ) {
              if( cList.objectAt(j).evaluate() == val ) {
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
      for( var i = 1, len = list.getLen(); i < len; ++i ) {
        cur = list.objectAt(i);
        l = cur.objectAt(0);
        r = cur.objectAt(1);
        switch( true ) {
          case l == 'else':
            return r;
          case l.evaluate():
            return r.evaluate();
        }
      }
    },

    'define': function(list) {
      return Interpreter._setUserVal(list.objectAt(1), list.objectAt(2));
    },

    'if': function(list) {
      switch( true ) {
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
          var name = argList.objectAt(i), value = arguments[i].evaluate();
          // if (name == 'i') {
          //   console.log('setting var i to ' + value.toString());
          // }
          body.scope.setValue(name, value);
        }
        return body.evaluate();
      });
    },

    'let': function(list) {
      var scope = new Scope();
      var bindings = list.objectAt(1);
      list = list.subList(2, list.getLen());
      var cur, val;
      for( var i = 0, len = bindings.getLen(); i < len; ++i ) {
        cur = bindings.objectAt(i);
        val = cur.objectAt(1);
        val.scope = list.scope;
        scope.setValue(cur.objectAt(0), val.evaluate());
      }
      for( var i = 0, len = list.getLen(); i < len; ++i ) {
        cur = list.objectAt(i);
        cur.scope = scope;
        if( i == (len - 1) ) {
          return cur.evaluate();
        } else {
          cur.evaluate();
        }
      }
    },

    'let*': function(list) {
      var scope = new Scope();
      var bindings = list.objectAt(1);
      list = list.subList(2, list.getLen());
      var cur, curVal;
      for( var i = 0, len = bindings.getLen(); i < len; ++i ) {
        cur = bindings.objectAt(i);
        curVal = cur.objectAt(1);
        curVal.scope = scope;
        scope.setValue(cur.objectAt(0),
                       curVal.evaluate());
      }
      for( var i = 0, len = list.getLen(); i < len; ++i ) {
        cur = list.objectAt(i);
        cur.scope = scope;
        if( i == (len - 1) ) {
          return cur.evaluate();
        } else {
          cur.evaluate();
        }
      }
    },

    'or': function(list) {
      for( var i = 1, len = list.getLen(); i < len; ++i ) {
        if( list.objectAt(i).evaluate() ) {
          return true;
        }
      }
      return false;
    },

    'quote': function(list) {
      var val = list.objectAt(1);
      switch( true ) {
        case val instanceof List:
        case val instanceof Atom:
          val.quoted = true;
          return val;
        default:
          return new Atom(val, true, list.scope);
      }
    },

    'set!': function(list) {
      var name = list.objectAt(1).toString();
      if( !Interpreter._userValIsSet(name) ) {
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
      // list could be an atom representing a variable which stores a list
      list = list instanceof List ? list : list.evaluate();
      return list.objectAt(0);
    }),

    'cdr': FunctionCompiler.compileFunction(1, function(list) {
      // list could be an atom representing a variable which stores a list
      list = list instanceof List ? list : list.evaluate();
      return list.subList(1, list.getLen());
    }),

    'cons': FunctionCompiler.compileFunction(2, function(a, list) {
      list.prepend(a);
      return list;
    }),

    'eq?': FunctionCompiler.compileFunction(2, function(l, r) {
      switch( true ) {
        case l instanceof List:
          if( r instanceof List ) {
            return (l.isNull() && r.isNull()) ||
              (l === r);
          } else {
            return false;
          }
        default:
          return (l.evaluate() == r.evaluate());
      }
    }),

    'null?': FunctionCompiler.compileFunction(1, function(obj) {
      if( obj instanceof List ) {
        return obj.isNull();
      }
      return false;
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
    switch( true ) {
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
    for( var i = 2, len = list.getLen(); i < len; ++i ) {
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

  _getLiteral: function(str) {
    var match;
    switch( true ) {
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
    switch( true ) {
      case (scope) && (match = scope.getValue(str)) != null:
      case (match = this._getUserVal(str)) != null:
      case (match = this._getPrimitive(str)) != null:
      case (match = this._getMathFunction(str)) != null:
      case (match = this._getSpecialForm(str)) != null:
      case (match = this._getCompiledFunction(str)) != null:
        return match;
    }
  },

  _evalAtom: function(str, scope) {
    var match;
    switch( true ) {
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
      if( ptrs.head > ptrs.tail ) {
        if( !list ) {
          list = new List(Interpreter.level + 1, null, quoted);
        }
        list.append(quoted ? new Atom(curStr, quoted) : curStr);
      }
    }

    while( ptrs.head < ptrs.max ) {
      curChar = Interpreter._getCurChar();
      curStr = Interpreter._getCurStr();
      switch( curChar ) {
        case chars.openParens:
          Interpreter.level++;
          ptrs.head++;
          ptrs.tail = ptrs.head;
          switch( true ) {
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
          switch( true ) {
            case !list:
              list = new List(Interpreter.level + 1, null, quoted);
              break;
            case list.level > Interpreter.level:
              return list;
          }
          break;
        case chars.space:
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
          while( ptrs.head++ < ptrs.max ) {
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
          while( ptrs.head++ < ptrs.max ) {
            curChar = this._getCurChar();
            if (curChar == chars.space || curChar == chars.closeParens) {
              break;
            }
          }
        break;
      }
    }
    if( ptrs.head > ptrs.tail ) {
      if( !list ) {
        return new Atom(Interpreter._getCurStr(), quoted);
      } else if( quoted ) {
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
    return Interpreter._run().evaluate();
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
