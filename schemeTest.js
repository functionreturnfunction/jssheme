function ListTest() {
  var Assert = TestSuite.assert;
  var p = Interpreter.parse;

  this.testNewList = function() {
    var list = new List();
    Assert.isEqual(0, list.level, 'List created with no arguments should always have a level of 0.');
    Assert.isTrue(list.isNull(), 'List created with no arguments should always be null.');
    Assert.isEqual('()', list.toString(), 'List.toString() seems to be broken.');

    list = new List(1, ['+', 1, 1]);
    Assert.isEqual(1, list.level, 'Setting List level from constructor seems to be broken.');
    Assert.isFalse(list.isNull(), 'Generating List with array as argument seems to be broken.');
    Assert.isEqual('(+ 1 1)', list.toString(), 'List.toString() seems to be broken.');
    Assert.isEqual(2, list.evaluate(), 'General failure to evaluate.');

    list = new List(1, [1, 2, 3, 4], true);
    Assert.isTrue(list.quoted, 'Error creating new quoted list.');
    Assert.isEqual('(1 2 3 4)', list.toString(), 'Error with qouted list .toString().');
    Assert.isEqual(list, list.evaluate(), 'Evaluating a quoted list should return a reference to itself (I think).');
    var list2 = p('\'(1 2 3 4)');
    Assert.isTrue(list.quoted, 'Error creating new quoted list using the interpreter.');
    Assert.isEqual(list.toString(), list2.toString(), 'Error generating quoted list using the interpreter.');
    return true;
  };

  return true;
}

function SchemeTest() {
  var p = Interpreter.parse;
  var Assert = TestSuite.assert;

  /* Test Primitives */

  this.testAppend = function() {
    Assert.isEqual('(foo bar)', p('(append \'(foo) \'(bar))'), 'Basic append broken.');
    Assert.isEqual('(1 2 3 4 5 6)', p('(append \'(1 2 3) \'(4 5 6))'), 'Append appears broken.')
    return true;
  };

  this.testApply = function() {
    Assert.isEqual(3, p('(apply + \'(1 1 1))'), 'Basic apply function call broken.');
    Assert.isEqual(3, p('(apply + 1 1 1 \'())'), 'Apply with extra arguments besides list and function broken.');
    Assert.isEqual('(foo bar)', p('(apply cons \'foo \'((bar)))'), 'Apply using cons broken.');
    return true;
  };

  this.testArithmetic = function() {
    Assert.isEqual(10, p('(+ 1 2 3 4)'), 'Addition is broken');
    Assert.isEqual(15, p('(- 100 50 25 10)'), 'Subtraction is broken');
    Assert.isEqual(24, p('(* 1 2 3 4)'), 'Multiplication is broken');
    Assert.isEqual(1, p('(/ 64 8 4 2)'), 'Division is broken');
    return true;
  };

  this.testCar = function() {
    Assert.isEqual(1, p('(car \'(1 2 3))'), 'Basic car broken.');
    Assert.isEqual('(foo)', p('(car \'((foo) (bar) (baz)))'), 'Car on list of lists broken.');
    return true;
  };

  this.testCdr = function() {
    Assert.isEqual('(2 3)', p('(cdr \'(1 2 3))'), 'Basic cdr broken.');
    Assert.isEqual('((bar) (baz))', p('(cdr \'((foo) (bar) (baz)))'), 'Cdr on list of lists broken.');
    return true;
  };

  this.testCons = function() {
    Assert.isEqual('(foobar)', p('(cons \'foobar \'())'), 'Consing onto empty list is broken.');
    Assert.isEqual('(foo bar)', p('(cons \'foo \'(bar))'), 'Consing onto non-empty list is broken.');
    return true;
  };

  this.testEquals = function() {
    // MIT Scheme reports false on this:
    Assert.isTrue(p('(eq? "foo" "foo")'), 'Equality function is broken');
    Assert.isFalse(p('(eq? "foo" "bar")'), 'Equality function is broken');
    Assert.isTrue(p('(eq? 1 1)'), 'Equality function is broken');
    return true;
  };

  this.testNull = function() {
    Assert.isTrue(p('(null? \'())'), 'Null check function or null list seems to be broken.');
    Assert.isFalse(p('(null? \'(1))'), 'Null check function failed.');
    Assert.isFalse(p('(null? \'(1 2 3 4))'), 'Null check function or quote functionality seems to be broken.');
    Assert.isFalse(p('(null? 1)'), 'Null check function failed, numbers are NOT equal to the null list.');
    Assert.isFalse(p('(null? (+ 1 2))'), 'Null check function failed.');
    return true;
  };

  this.testNumber = function() {
    Assert.isTrue(p('(number? 1)'), 'Number type-check function failed.');
    Assert.isTrue(p('(number? (+ 1 2))'), 'Number type-check function failed.');
    Assert.isFalse(p('(number? +)'), 'Number type-check function failed.');
    return true;
  };

  /* Test Constants */

  this.testConstants = function() {
    Assert.isTrue(p('#t'), 'True constant is broken.');
    Assert.isFalse(p('#f'), 'False constant is broken.');
  };

  /* Test Special Forms */

  this.testAnd = function() {
    Assert.isTrue(p('(and #t #t)'), 'Basic and form broken.');
    Assert.isFalse(p('(and #t #f)'), 'Basic and form broken.');
    Assert.isFalse(p('(and #t #t #t #f #t)'), 'Multi-argument and form broken.');
    return true;
  };

  this.testBegin = function() {
    Assert.isEqual(7, p('(begin (+ 1 2) (+ 2 3) (+ 3 4))'), 'Basic begin call failed.');
    p('(define begin-tester 1)');
    Assert.isEqual(2, p('(begin (set! begin-tester 2) begin-tester)'), 'Begin function broken.');
    Assert.isEqual('begin-tester',
		   p('(begin (set! begin-tester (+ begin-tester 1)) (set! begin-tester (+ begin-tester 1)))'),
		   'Begin funciton broken.');
    Assert.isEqual(4, p('begin-tester'), 'Begin function broken.');
    return true;
  };

  this.testCase = function() {
    Assert.isEqual('foo', p('(case 1 ((1 1 1 1) \'foo) ((2 2 2 2) \'bar))'), 'Basic case call failed.');
    Assert.isEqual('bar', p('(case 2 ((1 1 1 1) \'foo) ((2 2 2 2) \'bar))'), 'Basic case call failed.');
    Assert.isEqual('foobar', p('(case 3 ((1 1 1 1) \'foo) ((2 2 2 2) \'bar) (else \'foobar))'),
		   'Else condition failed in case call.');
    return true;
  };

  this.testCond = function() {
    Assert.isEqual('foo', p('(cond (#t \'foo))'), 'Basic cond form broken.');
    Assert.isEqual('bar', p('(cond (#f \'foo) (#t \'bar))'), 'Two level cond form broken.');
    Assert.isEqual('baz', p('(cond (#f \'foo) (#f \'bar) (else \'baz))'), 'Else in cond form broken.');
    Assert.isEqual(undefined, p('(cond (#f \'foo))'), 'Cond form with no positive termination and no else' +
                   ' should return undefined.');
    return true;
  };

  this.testDefine = function() {
    Assert.isEqual('define-tester', p('(define define-tester 1)'), 'The define form should always return the name of the new value.');
    Assert.isEqual(1, p('define-tester'), 'The define form seems to be broken.');
    return true;
  };

  this.testIf = function() {
    Assert.isEqual('foo', p('(if #t \'foo)'), 'Basic if form broken.');
    Assert.isEqual('bar', p('(if #f \'foo \'bar)'), 'Two option if from broken');
    Assert.isEqual(undefined, p('(if #f \'foo)'), 'If form with false first statement' +
                   ' and no 3rd argument should return undefined.');
    return true;
  };

  this.testLet = function() {
    Assert.isEqual(3, p('(let ((x 2)) (+ 1 x))'), 'Basic let call failed.');
    Assert.isEqual('baz', p('(let ((foo \'bar) (foobar \'baz)) (+ 1 2) (+ (+ 1 1) 1) foobar)'), 'Let form failed.');
    Assert.doesThrow(function(){p('foobar')}, 'Let form has leaked, or the variable foobar has been set by a test');
    Assert.doesThrow(function(){p('(let ((foo 1) (bar (+ 1 foo))) (+ foo bar))')},
		     'Regular let form should not allow use of bindings created during its own evaluation.');
    
  };

  this.testLetStar = function() {
    Assert.isEqual(3, p('(let* ((x 2)) (+ 1 x))'), 'Basic let call failed.');
    Assert.isEqual('baz', p('(let* ((foo \'bar) (foobar \'baz)) (+ 1 2) (+ (+ 1 1) 1) foobar)'), 'Let form failed.');
    Assert.doesThrow(function(){p('foobar')}, 'Let form has leaked, or the variable foobar has been set by a test');
    Assert.doesNotThrow(function(){p('(let* ((foo 1) (bar (+ 1 foo))) (+ foo bar))')},
		     'Starred let form should allow use of bindings created during its own evaluation.');
    Assert.isEqual(3, p('(let* ((foo 1) (bar (+ 1 foo))) (+ foo bar))'), 'Let* call failed.');
    return true;
  };

  this.testOr = function() {
    Assert.isTrue(p('(or #t #f)'), 'Basic or form broken.');
    Assert.isFalse(p('(or #f #f)'), 'Basic or form broken.');
    Assert.isTrue(p('(or #f #f #f #t #f)'), 'Multi-argument or form broken.');
    return true;
  };

  this.testQuote = function() {
    Assert.isEqual('(1 2 3)', p('(quote (1 2 3))'), 'Basic quote form broken.');
    Assert.isEqual('((foo) bar)', p('(quote ((foo) bar))'), 'Two level quote failed.');
    Assert.isEqual('(((foo) bar) (baz))', p('(quote (((foo) bar) (baz)))'), 'Multi level quote failed.');
    return true;
  };

  this.testSet = function() {
    p('(define set-tester 1)');
    Assert.isEqual(1, p('set-tester'), 'Define form seems to have failed.');
    Assert.isEqual('set-tester', p('(set! set-tester 2)'), 'Set! form should return the name of the variable it set.');
    Assert.isEqual(2, p('set-tester'), 'Set! form is broken.');
    return true;
  };

  /* Test Interpreter Functionality */

  this.testSpecialChars = function() {
    Assert.isEqual('(foo bar)', p('\'(foo bar)').toString(), 'Error reading quoted list');
    Assert.isEqual('foobar', p('\'foobar').toString(), 'Error reading quoted s-expression');
    return true;
  };

  this.testNesting = function() {
    Assert.isEqual(6, p('(+ 1 1 1 1 1 1)'), 'Control is broken');

    Assert.isEqual(6, p('(+ 1 (+ 1 1 1 1 1))'), 'Nesting is broken.');
    Assert.isEqual(6, p('(+ 1 1 (+ 1 1 1 1))'), 'Nesting is broken.');
    Assert.isEqual(6, p('(+ 1 1 1 (+ 1 1 1))'), 'Nesting is broken.');
    Assert.isEqual(6, p('(+ 1 1 1 1 (+ 1 1))'), 'Nesting is broken.');
    Assert.isEqual(6, p('(+ 1 (+ 1 1 1 (+ 1 1)))'), 'Nesting is broken.');
    Assert.isEqual(6, p('(+ 1 1 (+ 1 1 (+ 1 1)))'), 'Nesting is broken.');
    Assert.isEqual(6, p('(+ 1 1 1 (+ 1 (+ 1 1)))'), 'Nesting is broken.');
    Assert.isEqual(6, p('(+ 1 (+ 1 1 (+ 1 (+ 1 1))))'), 'Nesting is broken.');
    Assert.isEqual(6, p('(+ 1 1 (+ 1 (+ 1 (+ 1 1))))'), 'Nesting is broken.');
    Assert.isEqual(6, p('(+ 1 (+ 1 (+ 1 (+ 1 (+ 1 1)))))', 'Tail nesting broken'));

    Assert.isEqual(6, p('(+ (+ 1 1 1 1 1) 1)'), 'Nesting is broken.');
    Assert.isEqual(6, p('(+ (+ 1 1 1 1) 1 1)'), 'Nesting is broken.');
    Assert.isEqual(6, p('(+ (+ 1 1 1) 1 1 1)'), 'Nesting is broken.');
    Assert.isEqual(6, p('(+ (+ 1 1) 1 1 1 1)'), 'Nesting is broken.');
    Assert.isEqual(6, p('(+ (+ (+ 1 1) 1 1 1) 1)'), 'Nesting is broken.');
    Assert.isEqual(6, p('(+ (+ (+ 1 1) 1 1) 1 1)'), 'Nesting is broken.');
    Assert.isEqual(6, p('(+ (+ (+ 1 1) 1) 1 1 1)'), 'Nesting is broken.');
    Assert.isEqual(6, p('(+ (+ (+ (+ 1 1) 1) 1 1) 1)'), 'Nesting is broken.');
    Assert.isEqual(6, p('(+ (+ (+ (+ 1 1) 1) 1) 1 1)'), 'Nesting is broken.');
    Assert.isEqual(6, p('(+ (+ (+ (+ (+ 1 1) 1) 1) 1) 1)', 'Head nesting broken'));

    Assert.isEqual(6, p('(+ (+ 1 1) (+ 1 1 1 1))', 'Nesting is broken.'));
    Assert.isEqual(6, p('(+ (+ 1 1) (+ 1 1) (+ 1 1))', 'Nesting is broken.'));
    Assert.isEqual(6, p('(+ (+ 1 1 1 1) (+ 1 1))', 'Nesting is broken.'));

    var list = '(foo)';
    Assert.isEqual(list, p('\'' + list), 'Single level nesting is broken.');
    list = '(' + list + ')';
    Assert.isEqual(list, p('\'' + list), 'Double level nesting is broken.');
    list = '(' + list + ')';
    Assert.isEqual(list, p('\'' + list), 'Triple level nesting is broken.');
    list = '(' + list + ')';
    Assert.isEqual(list, p('\'' + list), 'Multi-level nesting is broken.');
    list = '(' + list + ')';
    Assert.isEqual(list, p('\'' + list), 'Multi-level nesting is broken.');
    list = '(' + list + ')';
    Assert.isEqual(list, p('\'' + list), 'Multi-level nesting is broken.');
    list = '(' + list + ')';
    Assert.isEqual(list, p('\'' + list), 'Multi-level nesting is broken.');
    list = '(' + list + ')';
    Assert.isEqual(list, p('\'' + list), 'Multi-level nesting is broken.');
    list = '(' + list + ')';
    Assert.isEqual(list, p('\'' + list), 'Multi-level nesting is broken.');
    list = '(' + list + ')';
    Assert.isEqual(list, p('\'' + list), 'Multi-level nesting is broken.');
    list = '(' + list + ')';
    Assert.isEqual(list, p('\'' + list), 'Multi-level nesting is broken.');
    list = '(' + list + ')';
    Assert.isEqual(list, p('\'' + list), 'Multi-level nesting is broken.');

    return true;
  };
}
