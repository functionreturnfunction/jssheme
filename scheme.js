/* Class List */
var List = function(level, arr, quoted, scope) {
  /* Private Members */
  var arr = (arr||null) instanceof Array ? arr : [];

  /* Exposed Members */
  this.level = typeof(level||null) == 'number' ? level : 0;
  this.quoted = quoted || false;
  this.scope = scope;

  /* Private Methods */
  function copyAndEvalArr() {
    return List._copyAndEvalArr(arr, scope);
  };

  /* Priviledged Methods */
  this.isNull = function() {
    return (arr.length == 0);
  };

  this.prepend = function(val) {
    return arr.unshift(val);
  };

  this.append = function(val) {
    return arr.push(val);
  };

  this.appendList = function(list) {
    return List._appendList(list, this);
  };

  this.subList = function(from, to) {
    return new List(this.level + 1, arr.slice(from, to), quoted);
  };

  this.getLen = function() {
    return arr.length;
  };

  this.toString = function() {
    return this.isNull() ? '()' : List._toString(arr);
  };

  this.evaluate = function() {
    return this.quoted ? this : List._evaluate(copyAndEvalArr(), this);
  };

  this.itemAt = function(i) {
    return arr[i];
  };

  this.objectAt = function(i) {
    return List._objectAt(arr, i, this.scope);
  };

  return true;
};

/* Private Methods */
List._copyAndEvalArr = function(arr, scope) {
  var ret = arr[0];
  ret = new Atom(ret, false, scope);
  ret = [ret.evaluate()];
  for( var i = 1, len = arr.length; i < len; ++i ) {
    // TODO:
    // test this vs. dynamically appending
    // using i
    ret.push(arr[i]);
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
  var sb = '(';
  for( var i = 0, len = arr.length - 1; i < len; ++i ) {
    sb += arr[i].toString() + ' ';
  }
  return sb + arr[arr.length - 1] + ')';
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
  /* Private Members */
  var that = this;

  /* Exposed Members */
  this.quoted = quoted || false;
  this.scope = scope;

  /* Priviledged Methods */
  this.toString = function() {
    return val;
  };

  this.evaluate = function() {
    return this.quoted ? this : Interpreter._evalAtom(val, this.scope);
  };

  return true;
};

/* Class Scope */
var Scope = function() {
  /* Private Members */
  var values = {
  };

  /* Priviledged Methods */
  this.getValue = function(str) {
    return values[str];
  };

  this.setValue = function(str, val) {
    return Scope._setValue(values, str, val);
  };

  return true;
};

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

/* Class DefinedFunction */
var FunctionCompiler = function(argc, fn) {
  this.argc = argc;
  this.fn = fn;

  return true;
};

FunctionCompiler.prototype.getCode = function() {
  var sbOutside = 'function(list){';
  var sbInside = 'return ' + this.fn + '(';
  for( var i = 0; i < this.argc; ++i ) {
    sbOutside += 'var v' + i.toString() + '=list.objectAt(' + (i + 1).toString() + ').evaluate();';
    sbInside += 'v' + i.toString() + ((i < (this.argc - 1)) ? ',' : ');').toString();
  }
  return sbOutside + sbInside + '}';
};

FunctionCompiler.prototype.compile = function() {
  switch( this.argc ) {
    case -1:
    case 0:
    return this.fn;
    case 1:
    case 2:
    case 3:
    return FunctionCompiler['_compile' + this.argc.toString()](this.fn);
    default:
    return eval(this.getCode());
  }
};

FunctionCompiler._compile1 = function(fn) {
  return function(list) {
    var obj = list.objectAt(1);
    return fn(obj);
  };
};

FunctionCompiler._compile2 = function(fn) {
  return function(list) {
    var obj = list.objectAt(1);
    var obj2 = list.objectAt(2);
    return fn(obj, obj2);
  };
};

FunctionCompiler._compile3 = function(fn) {
  return function(list) {
    var obj = list.objectAt(1);
    var obj2 = list.objectAt(2);
    var obj3 = list.objectAt(3);
    return fn(obj, obj2, obj3);
  };
};

FunctionCompiler.compileFunction = function(argc, fn) {
  return new FunctionCompiler(argc, fn).compile();
};

var Interpreter = {
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
    '/': function(x, y) { return x / y; }
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

    'let': function(list) {
      var scope = new Scope();
      var bindings = list.objectAt(1);
      list = list.subList(2, list.getLen());
      var cur;
      for( var i = 0, len = bindings.getLen(); i < len; ++i ) {
	cur = bindings.objectAt(i);
	scope.setValue(cur.objectAt(0),
		       cur.objectAt(1).evaluate());
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
	return list.objectAt(0);
      }),

    'cdr': FunctionCompiler.compileFunction(1, function(list) {
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
  },

  /* Class Methods */
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
      case /^\d+\.\d+$/.test(str):
        return parseFloat(str, 10);
      case /^\d+$/.test(str):
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
        default:
          while( ptrs.head++ < ptrs.max ) {
            curChar = this._getCurChar();
            if( curChar == chars.space ||
                curChar == chars.closeParens ) {
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
    }
    Interpreter.exception = this;
    return true;
  }
};
