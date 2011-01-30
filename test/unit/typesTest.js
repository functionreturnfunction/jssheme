module('List', {
  setup: function() {
    this.level = 666;
    this.arr = ['foo'];
    this.quoted = new Object();
    this.scope = new Object();
    this.target = new List(this.level, this.arr, this.quoted, this.scope);
  }
});

test('Empty list should be created with proper values', function() {
  this.target = new List();
  equals(0, this.target.level,
         'List created with no arguments should always have a level of 0.');
  ok(this.target._arr instanceof Array,
     'List created with no arguments should create its own inner _arr.');
  equals(0, this.target._arr.length,
        'List created with no arguments should use a default level of 0.');
  same(false, this.target.quoted,
     'List created with no arguments should default the quoted property to false.');
  equals(null, this.target.scope,
         'List created with no arguments should not have a scope.');
  ok(this.target.isNull(), 'List created with no arguments should always be null.');
  equals('()', this.target.toString(), 'List#toString() seems to be broken.');
});

test('Constructor should set values from arguments', function() {
  equals(this.level, this.target.level,
         'Constructor should set level value from argument.');
  same(this.arr, this.target._arr,
       'Constructor should set inner _arr from argument.');
  same(this.quoted, this.target.quoted,
       'Constructor should set quoted value from argument.');
  same(this.scope, this.target.scope,
       'Constructor should set scope from argument.');
});

test('#prepend(val) should prepend the given val to the beginning of the inner array, and return the list itself', function() {
  var val = new Object();
  var target = new List(0, ['foo']);

  same(target, target.prepend(val), 'List#prepend should return the list itself.');
  same(val, target._arr[0],
       'List#prepend should prepend the value to the front of the list.');
});

test('#append(val) should append the given val to the end of the inner array, and return the list itself', function() {
  var val = new Object();
  var target = new List(0, ['foo']);

  same(target, target.append(val), 'List#append should return the list itself.');
  same(val, target._arr[1],
       'List#append should append the value to the back of the list.');
});

test('Unquoted list should evaluate properly', function() {
  var list = new List(1, ['+', 1, 1]);
  equals(1, list.level, 'Setting List level from constructor seems to be broken.');
  ok(!list.isNull(), 'Generating List with array as argument seems to be broken.');
  equals('(+ 1 1)', list.toString(), 'List.toString() seems to be broken.');
  equals(2, list.evaluate(), 'General failure to evaluate.');
});

test('Quoted list should evaluate to itself', function() {
  var list = new List(1, [1, 2, 3, 4], true),
  list2 = p('\'(1 2 3 4)');
  
  ok(list.quoted, 'Error creating new quoted list.');
  equals('(1 2 3 4)', list.toString(), 'Error with qouted list .toString().');
  equals(list, list.evaluate(), 'Evaluating a quoted list should return a reference to itself (I think).');
  ok(list2.quoted, 'Error creating new quoted list using the interpreter.');
  equals(list.toString(), list2.toString(), 'Error generating quoted list using the interpreter.');
});
