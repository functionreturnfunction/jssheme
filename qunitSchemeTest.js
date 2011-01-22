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
  //  ok(p('(eq? \'foo \'foo)'), 'Equality function is broken')
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

module('Interpreter');

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
