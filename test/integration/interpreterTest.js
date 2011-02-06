module('Scheme Constants');

test('Truth constants', function() {
  ok(p('#t'), 'True constant is broken.');
  ok(!p('#f'), 'False constant is broken.');
});

module('Interpreter');

test('string interpretation', function() {
  equals('string', p('"string"'), 'Basic string parsing broken');
  equals('string with spaces', p('"string with spaces"'),
        'Parsing string with spaces broken');
  
  var list = p('\'(pp "foo " bar " baz " foobar)');
  equals(5, list.getLen());
  equals('pp', list.objectAt(0).toString());
  equals('"foo "', list.objectAt(1).toString());
  equals('bar', list.objectAt(2).toString());
  equals('" baz "', list.objectAt(3).toString());
  equals('foobar', list.objectAt(4).toString());
});

test('number interpretation', function() {
  equals(1, p('1'), 'Basic number parsing broken');
  equals(1.1, p('1.1'), 'Parsing number with decimals broken');
  equals(-1, p('-1'), 'Parsing negative number broken');
  equals(-1.1, p('-1.1'), 'Parsing negative number with decimals broken');
});

test('Special characters', function() {
  equals('(foo bar)', p('\'(foo bar)'), 'Error reading quoted list');
  equals('foobar', p('\'foobar'), 'Error reading quoted s-expression');
});

test('Extra whitespace', function() {
  equals('(foo bar)', p('\'(foo bar) '));
  equals(6, p('(+ 1\t2\n3)'));
});

test('Nesting', function() {
  equals(6, p('(+ 1 1 1 1 1 1)'), 'Control is broken');

  equals(6, p('(+ 1 (+ 1 1 1 1 1))'), 'Nesting is broken.');
  equals(6, p('(+ 1 1 (+ 1 1 1 1))'), 'Nesting is broken.');
  equals(6, p('(+ 1 1 1 (+ 1 1 1))'), 'Nesting is broken.');
  equals(6, p('(+ 1 1 1 1 (+ 1 1))'), 'Nesting is broken.');
  equals(6, p('(+ 1 (+ 1 1 1 (+ 1 1)))'), 'Nesting is broken.');
  equals(6, p('(+ 1 1 (+ 1 1 (+ 1 1)))'), 'Nesting is broken.');
  equals(6, p('(+ 1 1 1 (+ 1 (+ 1 1)))'), 'Nesting is broken.');
  equals(6, p('(+ 1 (+ 1 1 (+ 1 (+ 1 1))))'), 'Nesting is broken.');
  equals(6, p('(+ 1 1 (+ 1 (+ 1 (+ 1 1))))'), 'Nesting is broken.');
  equals(6, p('(+ 1 (+ 1 (+ 1 (+ 1 (+ 1 1)))))', 'Tail nesting broken'));

  equals(6, p('(+ (+ 1 1 1 1 1) 1)'), 'Nesting is broken.');
  equals(6, p('(+ (+ 1 1 1 1) 1 1)'), 'Nesting is broken.');
  equals(6, p('(+ (+ 1 1 1) 1 1 1)'), 'Nesting is broken.');
  equals(6, p('(+ (+ 1 1) 1 1 1 1)'), 'Nesting is broken.');
  equals(6, p('(+ (+ (+ 1 1) 1 1 1) 1)'), 'Nesting is broken.');
  equals(6, p('(+ (+ (+ 1 1) 1 1) 1 1)'), 'Nesting is broken.');
  equals(6, p('(+ (+ (+ 1 1) 1) 1 1 1)'), 'Nesting is broken.');
  equals(6, p('(+ (+ (+ (+ 1 1) 1) 1 1) 1)'), 'Nesting is broken.');
  equals(6, p('(+ (+ (+ (+ 1 1) 1) 1) 1 1)'), 'Nesting is broken.');
  equals(6, p('(+ (+ (+ (+ (+ 1 1) 1) 1) 1) 1)', 'Head nesting broken'));

  equals(6, p('(+ (+ 1 1) (+ 1 1 1 1))', 'Nesting is broken.'));
  equals(6, p('(+ (+ 1 1) (+ 1 1) (+ 1 1))', 'Nesting is broken.'));
  equals(6, p('(+ (+ 1 1 1 1) (+ 1 1))', 'Nesting is broken.'));

  var list = '(foo)';
  equals(list, p('\'' + list), 'Single level nesting is broken.');
  list = '(' + list + ')';
  equals(list, p('\'' + list), 'Double level nesting is broken.');
  list = '(' + list + ')';
  equals(list, p('\'' + list), 'Triple level nesting is broken.');
  list = '(' + list + ')';
  equals(list, p('\'' + list), 'Multi-level nesting is broken.');
  list = '(' + list + ')';
  equals(list, p('\'' + list), 'Multi-level nesting is broken.');
  list = '(' + list + ')';
  equals(list, p('\'' + list), 'Multi-level nesting is broken.');
  list = '(' + list + ')';
  equals(list, p('\'' + list), 'Multi-level nesting is broken.');
  list = '(' + list + ')';
  equals(list, p('\'' + list), 'Multi-level nesting is broken.');
  list = '(' + list + ')';
  equals(list, p('\'' + list), 'Multi-level nesting is broken.');
  list = '(' + list + ')';
  equals(list, p('\'' + list), 'Multi-level nesting is broken.');
  list = '(' + list + ')';
  equals(list, p('\'' + list), 'Multi-level nesting is broken.');
  list = '(' + list + ')';
  equals(list, p('\'' + list), 'Multi-level nesting is broken.');
});

test('.print(str) throws an exception if printing has not been initialized', function() {
//  Interpreter.initPrinter(null);
  var oldPrintFn = Interpreter._printFn;
  Interpreter._printFn = null;

  doesThrow(function() {
    Interpreter.print('foo');
  }, 'Printing should fail if printer has not yet been initialized.');

  Interpreter._printFn = oldPrintFn;
});

test('.print(str) should call the printer function with the given string and an extra newline', function() {
  var oldPrintFn = Interpreter._printFn;
  var printed = false;
  var correctStr = false;
  var toPrint = 'this is the str to print';
  var printFn = function(str) {
    printed = true;
    correctStr = (str == toPrint + '\n');
  };

  Interpreter.initPrinter(printFn);
  Interpreter.print(toPrint);

  ok(printed, '.print did not use the printFn');
  ok(correctStr, '.print did not use the correct string');

  Interpreter.initPrinter(null);
  Interpreter._printFn = oldPrintFn;
});
