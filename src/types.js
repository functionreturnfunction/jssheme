/* Class List */
var List = function(level, arr, quoted, scope) {
  this._arr = (arr||null) instanceof Array ? arr : [];
  this.level = typeof(level||null) == 'number' ? level : 0;
  this.quoted = quoted || false;
  this.scope = scope;
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
  this._arr.unshift(val);
  return this;
};

List.prototype.append = function(val) {
  this._arr.push(val);
  return this;
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
  for (var i = 1, len = arr.length; i < len; ++i) {
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
  for (var i = from.getLen() - 1; i >= 0; --i) {
    to.prepend(from.itemAt(i));
  }
  return to;
};

List._toString = function(arr) {
  var sb = ['('];
  for (var i = 0, len = arr.length - 1; i < len; ++i) {
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
  switch (true) {
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
