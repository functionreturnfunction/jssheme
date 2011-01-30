module('List');

test('Empty list should be created with proper values', function() {
  var list = new List();
  equals(0, list.level,
         'List created with no arguments should always have a level of 0.');
  ok(list._arr instanceof Array,
     'List created with no arguments should create its own inner _arr.');
  equals(0, list._arr.length,
        'List created with no arguments should use a default level of 0.');
  same(false, list.quoted,
     'List created with no arguments should default the quoted property to false.');
  equals(null, list.scope,
         'List created with no arguments should not have a scope.');
  ok(list.isNull(), 'List created with no arguments should always be null.');
  equals('()', list.toString(), 'List.toString() seems to be broken.');
});

test('Constructor should set values from arguments', function() {
  var level = 666;
  var arr = [];
  var quoted = new Object();
  var scope = new Object();

  var target = new List(level, arr, quoted, scope);

  equals(level, target.level,
         'Constructor should set level value from argument.');
  same(arr, target._arr,
       'Constructor should set inner _arr from argument.');
  same(quoted, target.quoted,
       'Constructor should set quoted value from argument.');
  same(scope, target.scope,
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
