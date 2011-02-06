Interpreter.compiledFunctions = {
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
};
