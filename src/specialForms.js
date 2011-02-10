Interpreter.specialForms = {
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
      body.scope = this.scope ? this.scope.clone() : new Scope();
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
};
