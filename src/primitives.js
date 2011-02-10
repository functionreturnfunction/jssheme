Interpreter.primitives = {
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

  'cdr': FunctionCompiler.compileFunction(1, function(obj) {
    // obj could be an atom representing a variable which stores a list
    obj = obj instanceof List ? obj : obj.evaluate();
    return obj.subList(1, obj.getLen());
  }),

  'cons': FunctionCompiler.compileFunction(2, function(a, list) {
    a = a.evaluate();
    return list.evaluate().prepend(a);
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

  'list?': FunctionCompiler.compileFunction(1, function(obj) {
    return obj.evaluate() instanceof List;
  }),

  'null?': FunctionCompiler.compileFunction(1, function(obj) {
    obj = obj.evaluate();
    return obj instanceof List ? obj.isNull() : false;
  }),

  'number?': FunctionCompiler.compileFunction(1, function(obj) {
    obj = obj.evaluate();
    return !isNaN(obj.toString());
  }),

  'pair?': FunctionCompiler.compileFunction(1, function(obj) {
    obj = obj.evaluate();
    return obj instanceof List ? !obj.isNull() : false;
  }),

  'pp': FunctionCompiler.compileFunction(1, function(obj) {
    Interpreter.print(obj.evaluate());
  }),

  'zero?': FunctionCompiler.compileFunction(1, function(obj) {
    return obj.evaluate() == 0;
  })
};
