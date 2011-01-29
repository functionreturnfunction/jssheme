module('List');

test('Empty list should be created with proper values', function() {
  var list = new List();
  equals(0, list.level, 'List created with no arguments should always have a level of 0.');
  ok(list.isNull(), 'List created with no arguments should always be null.');
  equals('()', list.toString(), 'List.toString() seems to be broken.');
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
