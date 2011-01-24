var p = Interpreter.parse;

function doesThrow(fn, message) {
  var thrown = false;

  try {
    fn();
  } catch(e) {
    thrown = true;
  }

  ok(thrown, message);
}

function doesNotThrow(fn, message) {
  var thrown = false;

  try {
    fn();
  } catch(e) {
    thrown = true;
  }

  ok(!thrown, message);
}

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

module('Scheme Primitives');

test('`append\' should join two lists', function () {
  equals('(foo bar)',
         p('(append \'(foo) \'(bar))'), 'Basic append broken.');
  equals('(1 2 3 4 5 6)',
         p('(append \'(1 2 3) \'(4 5 6))'), 'Append appears broken.');
});

test('`apply\' should apply cdr of argument list to car of argument list', function() {
  equals('(foo bar)',
         p('(append \'(foo) \'(bar))'), 'Basic append broken.');
  equals('(1 2 3 4 5 6)',
         p('(append \'(1 2 3) \'(4 5 6))'), 'Append appears broken.');
});

test('Basic arithmetic operations', function() {
  equals(10, p('(+ 1 2 3 4)'), 'Addition is broken');
  equals(15, p('(- 100 50 25 10)'), 'Subtraction is broken');
  equals(24, p('(* 1 2 3 4)'), 'Multiplication is broken');
  equals(1, p('(/ 64 8 4 2)'), 'Division is broken');
  ok(p('(= 1 1)'), 'Numeric equality is broken');
  ok(!p('(= 1 2)'), 'Numeric equality is broken');
  ok(p('(< 1 2)'), 'Less than operator is broken');
  ok(!p('(< 2 1)'), 'Less than operator is broken');
  ok(!p('(< 1 1)'), 'Less than operator is broken');
  ok(p('(> 2 1)'), 'Less than operator is broken');
  ok(!p('(> 1 2)'), 'Less than operator is broken');
  ok(!p('(> 1 1)'), 'Less than operator is broken');
});

test('`car\' should return the first element of a list', function() {
  equals(1,
         p('(car \'(1 2 3))'), 'Basic car broken.');
  equals('(foo)',
         p('(car \'((foo) (bar) (baz)))'), 'Car on list of lists broken.');
});

test('`cdr\' should return everything but the first element of a list as a new list', function() {
  equals('(2 3)',
         p('(cdr \'(1 2 3))'), 'Basic cdr broken.');
  equals('((bar) (baz))',
         p('(cdr \'((foo) (bar) (baz)))'), 'Cdr on list of lists broken.');
});

test('`cons\' prepends items onto lists', function() {
  equals('(foobar)',
         p('(cons \'foobar \'())'), 'Consing onto empty list is broken.');
  equals('(foo bar)',
         p('(cons \'foo \'(bar))'), 'Consing onto non-empty list is broken.');
});

test('`eq?\' returns true if arguments are equal, else false', function() {
  // MIT Scheme reports false on this:
  ok(p('(eq? "foo" "foo")'), 'Equality function is broken');
  ok(!p('(eq? "foo" "bar")'), 'Equality function is broken');
  ok(p('(eq? 1 1)'), 'Equality function is broken');
  // TODO: this needs to work
  ok(p('(eq? \'foo \'foo)'), 'Equality function is broken')
});

test('`null?\' returns true if argument is the null list, else false', function() {
  ok(p('(null? \'())'), 'Null check function or null list seems to be broken.');
  ok(!p('(null? \'(1))'), 'Null check function failed.');
  ok(!p('(null? \'(1 2 3 4))'),
     'Null check function or quote functionality seems to be broken.');
  ok(!p('(null? 1)'),
     'Null check function failed, numbers are NOT equal to the null list.');
  ok(!p('(null? (+ 1 2))'),
     'Null check function failed.');
});

test('`number?\' return true if argument is a number, else false', function() {
  ok(p('(number? 1)'), 'Number type-check function failed.');
  ok(p('(number? (+ 1 2))'), 'Number type-check function failed.');
  ok(!p('(number? +)'), 'Number type-check function failed.');
});

test('`pp\' should print the given string through the interpreter and return nothing', function() {
  var printed = false;
  var correctStr = false;
  var toPrint = 'str';
  var oldPrint = Interpreter.print;
  Interpreter.print = function(str) {
    printed = true;
    correctStr = str == toPrint;
  };

  p('(pp "str")')

  Interpreter.print = oldPrint;
});

module('Scheme Constants');

test('Truth constants', function() {
  ok(p('#t'), 'True constant is broken.');
  ok(!p('#f'), 'False constant is broken.');
});

module('Scheme Special Forms');

test('`and\' returns true if all arguments evaluate to true, else false', function() {
  ok(p('(and #t #t)'), 'Basic and form broken.');
  ok(!p('(and #t #f)'), 'Basic and form broken.');
  ok(!p('(and #t #t #t #f #t)'), 'Multi-argument and form broken.');
});

test('`begin\' evaluates all of its arguments, returning the value from the last', function() {
  equals(7, p('(begin (+ 1 2) (+ 2 3) (+ 3 4))'), 'Basic begin call failed.');
  p('(define begin-tester 1)');
  equals(2, p('(begin (set! begin-tester 2) begin-tester)'), 'Begin function broken.');
  equals('begin-tester',
		     p('(begin (set! begin-tester (+ begin-tester 1)) (set! begin-tester (+ begin-tester 1)))'),
		     'Begin funciton broken.');
  equals(4, p('begin-tester'), 'Begin function broken.');
});

test('`case\' is really hard to define in a short string, but it should work', function() {
  equals('foo',
         p('(case 1 ((1 1 1 1) \'foo) ((2 2 2 2) \'bar))'),
         'Basic case call failed.');
  equals('bar',
         p('(case 2 ((1 1 1 1) \'foo) ((2 2 2 2) \'bar))'),
         'Basic case call failed.');
  equals('foobar',
         p('(case 3 ((1 1 1 1) \'foo) ((2 2 2 2) \'bar) (else \'foobar))'),
		     'Else condition failed in case call.');
});

test('`cond\' should work as expected', function() {
  equals('foo',
         p('(cond (#t \'foo))'), 'Basic cond form broken.');
  equals('bar',
         p('(cond (#f \'foo) (#t \'bar))'), 'Two level cond form broken.');
  equals('baz',
         p('(cond (#f \'foo) (#f \'bar) (else \'baz))'),
         'Else in cond form broken.');
  equals(undefined,
         p('(cond (#f \'foo))'),
         'Cond form with no positive termination and no else' +
         ' should return undefined.');
});

test('`define\' should define new variables', function() {
  equals('define-tester',
         p('(define define-tester 1)'),
         'The define form should always return the name of the new value.');
  equals(1, p('define-tester'), 'The define form seems to be broken.');
});

test('`if\' should return its second argument if the first is true, else its third', function() {
  equals('foo', p('(if #t \'foo)'), 'Basic if form broken.');
  equals('bar', p('(if #f \'foo \'bar)'), 'Two option if from broken');
  equals(undefined, p('(if #f \'foo)'), 'If form with false first statement' +
         ' and no 3rd argument should return undefined.');
});

test('`lambda\' should create anonymous functions', function() {
  same(Function, p('(lambda () \'())').constructor,
       'Failed to return anonymous function.');
  equals(3, p('((lambda () 3))'), 'Failed to evaluate anonymous function.');
  equals(5, p('((lambda (x y) (+ x y)) 2 3)'), 'Basic addition function failed.');
});

test('Functions created with `lambda\' should have access to the global scope', function() {
  p('(define lambda-tester 3)');
  equals(6, p('((lambda (x) (+ x lambda-tester)) 3)'),
         'Addition function with globally scoped variable failed.');
});

test('`let\' should define local variables', function() {
  equals(3, p('(let ((x 2)) (+ 1 x))'), 'Basic let call failed.');
  equals('baz', p('(let ((foo \'bar) (foobar \'baz)) (+ 1 2) (+ (+ 1 1) 1) foobar)'), 'Let form failed.');
  doesThrow(function(){p('foobar')}, 'Let form has leaked, or the variable foobar has been set by a test');
  doesThrow(function(){p('(let ((foo 1) (bar (+ 1 foo))) (+ foo bar))')},
		        'Regular let form should not allow use of bindings created during its own evaluation.');
});

test('`let*\' should define local variables in terms of other local variables', function() {
  equals(3, p('(let* ((x 2)) (+ 1 x))'), 'Basic let call failed.');
  equals('baz',
         p('(let* ((foo \'bar) (foobar \'baz)) (+ 1 2) (+ (+ 1 1) 1) foobar)'),
         'Let form failed.');
  doesThrow(function(){p('foobar')},
            'Let form has leaked, or the variable foobar has been set by a test');
  doesNotThrow(function(){p('(let* ((foo 1) (bar (+ 1 foo))) (+ foo bar))')},
		           'Starred let form should allow use of bindings created during its own evaluation.');
  equals(3, p('(let* ((foo 1) (bar (+ 1 foo))) (+ foo bar))'), 'Let* call failed.');
});

test('`or\' should return true if any of its arguments evaluates to true, else false', function() {
  ok(p('(or #t #f)'), 'Basic or form broken.');
  ok(!p('(or #f #f)'), 'Basic or form broken.');
  ok(p('(or #f #f #f #t #f)'), 'Multi-argument or form broken.');
});

test('`quote\' should return its argument quoted', function() {
  equals('(1 2 3)', p('(quote (1 2 3))'), 'Basic quote form broken.');
  equals('((foo) bar)', p('(quote ((foo) bar))'), 'Two level quote failed.');
  equals('(((foo) bar) (baz))',
         p('(quote (((foo) bar) (baz)))'), 'Multi level quote failed.');
});

test('`set!\' should set the value of variables which are already defined.', function() {
  p('(define set-tester 1)');
  equals(1, p('set-tester'), 'Define form seems to have failed.');
  equals('set-tester',
         p('(set! set-tester 2)'),
         'Set! form should return the name of the variable it set.');
  equals(2,
         p('set-tester'), 'Set! form is broken.');
});

module('Scheme Compiled Functions');

test('`number->string\' should return the given number converted to a string', function() {
  for (var f = -1; f < 2; f += 0.5) {
    f = f.toString()
    equals(f, p('(number->string ' + f + ')'),
           'Error converting ' + f + ' to string');
  }
});

test('`string-append\' should return a string built from all its arguments', function() {
  equals('foobar', p('(string-append "foo" "bar")'),
         'Failed to build two part string');
  equals('foobarbaz', p('(string-append "foo" "bar" "baz")'),
         'Failed to build three part string');
});

test('`string->number\' should convert the given string to a number using 10 as the default radix', function() {
  equals(1, p('(string->number "1")'),
         'Error parsing number with the default radix');
  equals(5, p('(string->number "5")'),
         'Error parsing number with the default radix');
  equals(10, p('(string->number "10")'),
         'Error parsing number with the default radix');
  equals(16, p('(string->number "16")'),
         'Error parsing number with the default radix');
});

test('`string->number\' should convert the given string to a number using the given radix', function() {
  // TODO: wire this up
  // var radix;
  // for (var i = 0; i < 26; ++i) {
  //   for (var j = 0, len = Interpreter.VALID_RADII.length; j < len; ++j) {
  //     radix = Interpreter.VALID_RADII[j];
  //   }
  // }
  // base 2
  equals(1, p('(string->number "1" 2)'),
         'Error parsing number with radix of 2');
  equals(5, p('(string->number "101" 2)'),
         'Error parsing number with radix of 2');
  equals(10, p('(string->number "1010" 2)'),
         'Error parsing number with radix of 2');
  equals(16, p('(string->number "10000" 2)'),
         'Error parsing number with radix of 2');

  // base 8
  equals(1, p('(string->number "1" 8)'),
         'Error parsing number with radix of 8');
  equals(5, p('(string->number "5" 8)'),
         'Error parsing number with radix of 8');
  equals(10, p('(string->number "12" 8)'),
         'Error parsing number with radix of 8');
  equals(16, p('(string->number "20" 8)'),
         'Error parsing number with radix of 8');

  // base 10
  equals(1, p('(string->number "1" 10)'),
         'Error parsing number with radix of 10');
  equals(5, p('(string->number "5" 10)'),
         'Error parsing number with radix of 10');
  equals(10, p('(string->number "10" 10)'),
         'Error parsing number with radix of 10');
  equals(16, p('(string->number "16" 10)'),
         'Error parsing number with radix of 10');

  // base 16
  equals(1, p('(string->number "1" 16)'),
         'Error parsing number with radix of 16');
  equals(5, p('(string->number "5" 16)'),
         'Error parsing number with radix of 16');
  equals(10, p('(string->number "a" 16)'),
         'Error parsing number with radix of 16');
  equals(16, p('(string->number "10" 16)'),
         'Error parsing number with radix of 16');
});

test('`string->number\' should return false if given a number with decimals and a radix', function() {
  ok(!p('(string->number "1.1" 2)'));
  ok(!p('(string->number "1.1" 2)'));
});

test('`string->number\' should throw an exception if given an invalid radix', function() {
  for (var i = 100; i >= 1; --i) {
    if (Interpreter.VALID_RADII.indexOf(i) > -1) {
      continue;
    }

    doesThrow(function() {
      p('(string->number "1000" ' + i + ')');
    }, 'Failed to error on invalid radix');
  }
});

module('Lambda Recursion');

test('Recursive exponent function', function() {
  p('(define power (lambda (x y) (if (= 1 y) x (* x (power x (- y 1))))))');
  equals(4, p('(power 2 2)'), 'Recursive exponent function failed.');
  equals(8, p('(power 2 3)'), 'Recursive exponent function failed.');
  equals(16, p('(power 2 4)'), 'Recursive exponent function failed.');
  equals(9, p('(power 3 2)'), 'Recursive exponent function failed.');
  equals(27, p('(power 3 3)'), 'Recursive exponent function failed.');
  equals(81, p('(power 3 4)'), 'Recursive exponent function failed.');
});

test('Recursive fibonacci function', function() {
  p('(define fib (lambda (i) (if (< i 2) i (+ (fib (- i 1)) (fib (- i 2))))))');
  // for printing
//  p('(define fib (lambda (i) (begin (pp (string-append "running with i = " (number->string i))) (if (< i 2) i (let ((first (fib (- i 1))) (second (fib (- i 2)))) (begin (pp (string-append "adding " (number->string first) " to " (number->string second))) (+ first second)))))))');
  equals(2, p('(fib 3)'), 'Recursive Fibonacci function failed.');
  // equals(55, p('(fib 10)'), 'Recursive Fibonacci function failed.');
  // equals(89, p('(fib 11)'), 'Recursive Fibonacci function failed.');
  // equals(144, p('(fib 12)'), 'Recursive Fibonacci function failed.');
});

test('Recursive add function', function() {
  p('(define add (lambda (x y) (if (= 0 y) x (+ 1 (add x (- y 1))))))');
  equals(4, p('(add 2 2)'));
  equals(5, p('(add 2 3)'));
  equals(8, p('(add 4 4)'));
  equals(9, p('(add 4 5)'));
  equals(16, p('(add 8 8)'));
  equals(17, p('(add 8 9)'));
});

test('Recursive factorial function', function() {
  p('(define fac (lambda (n) (if (< n 2) 1 (* n (fac (- n 1))))))');
  equals(1, p('(fac 1)'));
  equals(2, p('(fac 2)'));
  equals(6, p('(fac 3)'));
  equals(24, p('(fac 4)'));
  equals(120, p('(fac 5)'));
});

module('Interpreter');

test('string interpretation', function() {
  equals('string', p('"string"'), 'Basic string parsing broken');
  equals('string with spaces', p('"string with spaces"'),
        'Parsing string with spaces broken');
});

test('number interpretation', function() {
  equals(1, p('1'), 'Basic number parsing broken');
  equals(1.1, p('1.1'), 'Parsing number with decimals broken');
  equals(-1, p('-1'), 'Parsing negative number broken');
  equals(-1.1, p('-1.1'), 'Parsing negative number with decimals broken');
});

test('Special characters', function() {
  equals('(foo bar)', p('\'(foo bar)').toString(), 'Error reading quoted list');
  equals('foobar', p('\'foobar').toString(), 'Error reading quoted s-expression');
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
