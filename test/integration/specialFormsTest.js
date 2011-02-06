module('Scheme Special Forms');

test('`and\' returns true if all arguments evaluate to true, else false', function() {
  ok(p('(and #t #t)'), 'Basic and form broken.');
  ok(!p('(and #t #f)'), 'Basic and form broken.');
  ok(!p('(and #t #t #t #f #t)'), 'Multi-argument and form broken.');
});

test('`not\' returns true if argument is false, else false', function() {
  ok(!p('(not \'foo)'), 'An atom is truthy');
  ok(!p('(not \'())'), 'An empty list is truthy');
  ok(!p('(not \'(foo))'), 'Any list is truthy');
  ok(!p('(not "foo")'), 'Any string truthy');
  ok(p('(not #f)'));
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
  equals(1, p('(let ((a 1)) (let ((b 2)) a))'), 'Let form should not carry values from parent scope.');
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
  equals(1, p('(let* ((a 1)) (let* ((b 2)) a))'), 'Let* form should not carry values from parent scope.');
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

test('`set!\' should set the value of variables which are already defined', function() {
  p('(define set-tester 1)');
  equals(1, p('set-tester'), 'Define form seems to have failed.');
  equals('set-tester',
         p('(set! set-tester 2)'),
         'Set! form should return the name of the variable it set.');
  equals(2,
         p('set-tester'), 'Set! form is broken.');
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

test('Recursive Fibonacci function without let form', function() {
  p('(define fib (lambda (i) (if (< i 2) i (+ (fib (- i 1)) (fib (- i 2))))))');
  equals(2, p('(fib 3)'), 'Recursive Fibonacci function failed.');
  equals(55, p('(fib 10)'), 'Recursive Fibonacci function failed.');
  equals(89, p('(fib 11)'), 'Recursive Fibonacci function failed.');
  equals(144, p('(fib 12)'), 'Recursive Fibonacci function failed.');
});

// just here to prove that this works:
test('Recursive Fibonacci function with let form', function() {
  p('(define fib (lambda (i) (if (< i 2) i (let ((first (fib (- i 1))) (second (fib (- i 2)))) (+ first second)))))');
  equals(2, p('(fib 3)'), 'Recursive Fibonacci function failed.');
  equals(55, p('(fib 10)'), 'Recursive Fibonacci function failed.');
  equals(89, p('(fib 11)'), 'Recursive Fibonacci function failed.');
  equals(144, p('(fib 12)'), 'Recursive Fibonacci function failed.');
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

test('Recursive multiplication function', function() {
  p('(define mult (lambda (x y) (if (= 1 y) x (+ x (mult x (- y 1))))))');
  equals(4, p('(mult 2 2)'));
  equals(6, p('(mult 2 3)'));
  equals(9, p('(mult 3 3)'));
  equals(12, p('(mult 3 4)'));
  equals(16, p('(mult 4 4)'));
  equals(20, p('(mult 4 5)'));
});

test('Recursive factorial function', function() {
  p('(define fac (lambda (n) (if (< n 2) 1 (* n (fac (- n 1))))))');
  equals(1, p('(fac 1)'));
  equals(2, p('(fac 2)'));
  equals(6, p('(fac 3)'));
  equals(24, p('(fac 4)'));
  equals(120, p('(fac 5)'));
});
