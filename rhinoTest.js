var TO_STRING = [Number, Function, RegExp, Boolean];
var AS_OBJECT = [Error];

Object.prototype.insepct = function() {
  var sb = ['{'];
  for (var x in this) {
    sb.push(x.inspect() + ': ' + this[x].inspect());
    sb.push(', ');
  }
  sb[sb.length - 1 || 1] = '}';
  return sb.join('');
};

Array.prototype.inspect = function() {
  var sb = ['['];
  for (var i = 0, len = this.length; i < len; ++i) {
    sb.push(this[i].inspect());
    sb.push(', ');
  }
  sb[sb.length - 1 || 1] = ']';
  return sb.join('');
};

String.prototype.inspect = function() {
  return '"' + this + '"';
};

(function() {
  var i, len;
  for (i = 0, len = TO_STRING.length; i < len; ++i) {
    TO_STRING[i].prototype.inspect = TO_STRING[i].prototype.toString;
  }

  for (i = 0, len = AS_OBJECT.length; i < len; ++i) {
    AS_OBJECT[i].prototype.inspect = Object.prototype.insepct;
  }
})();

load('scheme.js');
load('qunitRhino.js');
load('qunitSchemeTest.js');

QUnit.verbose = true;
new QUnit.ConsolePrinter().print();
