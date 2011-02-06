/* Class Scope */
Scope = function() {
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

Scope.prototype.clone = function() {
  return Scope._clone(this);
};

Scope.prototype.toString = function() {
  var sb = ['{'], val;
  for (var x in this._values) {
    sb.push('\"' + x + '\":');
    val = this.getValue(x);
    sb.push(val.constructor === String ? '\"' + val + '\"' : val.toString());
    sb.push(',');
  }
  return sb.join('') + '}';
};

/* Static Methods */
Scope._setValue = function(values, str, val) {
  switch (true) {
    case val instanceof Atom:
    case val instanceof List:
      if (val.quoted) {
        values[str] = val.evaluate();
        break;
      }
    default:
      values[str] = val;
  }
  return str;
};

Scope._clone = function(scope) {
  var values = {}, ret = new Scope();
  for (var x in scope._values) {
    values[x] = scope._values[x];
  }
  ret._values = values;
  return ret;
};

/* Class FunctionCompiler */
FunctionCompiler = function(argc, fn) {
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
