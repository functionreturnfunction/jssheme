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
