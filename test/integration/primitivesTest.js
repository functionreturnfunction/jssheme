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

// WARNING: meta test building
// test the mathFuncs using a uniform set of arguments
for (var x in Interpreter.mathFuncs) {
  // '/' is a special case, see TODO file
  if (x == '/') {
    continue;
  }

  var argList = [
    [2, 2],
    [1, 2, 3, 4],
    [4, 3, 2, 1]
  ];
  var fnName;
  switch (x) {
    case '+':
      fnName = 'add';
      break;
    case '-':
      fnName = 'subtract';
      break;
    case '*':
      fnName = 'multiply';
      break;
  }

  var doMath = function(fn, args) {
    var ret = args[0];
    for (var i = 1, len = args.length; i < len; ++i) {
      ret = Interpreter.mathFuncs[fn](ret, args[i]);
    }
    return ret;
  }

  test(x + ' function should ' + fnName + ' all of its arguments together', function() {
    for (var i = 0, len = argList.length; i < len; ++i) {
      var sb = ['(', x];
      for (var j = 0, jLen = argList[i].length; j < jLen; ++j) {
        sb.push(' ');
        sb.push(argList[i][j]);
      }
      var code = sb.join('') + ')';

      equals(doMath(x, argList[i]), p(code),
             'Failed to evaluate ' + code + ' properly.');
    }
  });

  argList = [
    ['(car \'(4))', '(car \'(4))'],
    ['(car \'(4))', '(car \'(2))'],
    ['(car \'(2))', '(car \'(4))']
  ];

  doMath = function(fn, args) {
    var ret = parseInt(args[0].match(/\((\d+)\)/, '\1')[1]);
    var cur;
    for (var i = 1, len = args.length; i < len; ++i) {
      cur = parseInt(args[i].match(/\((\d+)\)/, '\1')[1]);
      ret = Interpreter.mathFuncs[fn](ret, cur);
    }
    return ret;
  };

  test(x + ' function should evaluate each of its arguments and then ' + fnName + ' them all together', function() {
    for (var i = 0, len = argList.length; i < len; ++i) {
      var sb = ['(', x];
      for (var j = 0, jLen = argList[i].length; j < jLen; ++j) {
        sb.push(' ');
        sb.push(argList[i][j]);
      }
      var code = sb.join('') + ')';

      equals(doMath(x, argList[i]), p(code),
             'Failed to evaluate ' + code + ' properly.');
    }
  });
}

test('Basic division', function() {
  equals(1, p('(/ 64 8 4 2)'), 'Division is broken');
});

test('Basic equality', function() {
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
  equals('foo', p('(let ((l \'(foo bar))) (car l))'),
         'Car on variable set with let broken.');
  equals('foo', p('(car (car \'((foo bar))))'),
         'Car should evaluate its argument.');
});

test('`cdr\' should return everything but the first element of a list as a new list', function() {
  equals('(2 3)',
         p('(cdr \'(1 2 3))'), 'Basic cdr broken.');
  equals('((bar) (baz))',
         p('(cdr \'((foo) (bar) (baz)))'), 'Cdr on list of lists broken.');
  equals('(bar baz)',
         p('(let ((l \'(foo bar baz))) (cdr l))'),
         'Cdr on variable set with let broken.');
});

test('`cons\' prepends items onto lists', function() {
  equals('(foobar)',
         p('(cons \'foobar \'())'), 'Consing onto empty list is broken.');
  equals('(foo bar)',
         p('(cons \'foo \'(bar))'), 'Consing onto non-empty list is broken.');
  equals('(foo bar)',
         p('(cons \'foo (cdr \'(foobar bar)))'),
         'Consing onto list which needs to be evaluated is broken.');
  equals('(foo)', 
         p('(cons (car \'(foo)) \'())'),
         'Consing item which needs to be evaluated onto list is broken.');
  equals('(foo bar)',
         p('(cons (car \'(foo)) (cdr \'(foo bar)))'),
         'Consing item which needs to be evaluated onto list which needs to be evaluated is broken.');
});

test('`eq?\' returns true if arguments are equal, else false', function() {
  // MIT Scheme reports false on this:
  ok(p('(eq? "foo" "foo")'), 'Equality function is broken');
  ok(!p('(eq? "foo" "bar")'), 'Equality function is broken');
  ok(p('(eq? 1 1)'), 'Equality function is broken');
  ok(p('(eq? \'foo \'foo)'), 'Equality function is broken')
  p('(define a \'foo)');
  ok(p('(eq? \'foo a)'), 'Equality function is broken');
  ok(p('(eq? a \'foo)'), 'Equality function is broken');
  ok(p('(eq? a (car \'(foo)))'), 'Equality function is broken');
});

test('`list?\' returns true if argument is a list, else false', function() {
  ok(p('(list? \'())'));
  ok(p('(list? \'(a s d f))'));
  ok(!p('(list? \'a)'));
  ok(!p('(list? 1)'));
  ok(!p('(list? "foo")'));
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
  ok(p('(null? (cdr \'(foo)))'), 
     'Null check on argument which needs to be evaluated failed.');
});

test('`pair?\' returns true if argument is a non-null list, else false', function() {
  ok(p('(pair? \'(foo))'),
     'A list containing at least one element is a pair');
  ok(p('(pair? \'(()))'),
     'A list containing at least one element is a pair, even if that element is the null list');
  ok(!p('(pair? \'())'), 'An empty (null) list is not a pair');
  ok(!p('(pair? \'atom)'), 'An atom is not a pair');
  ok(!p('(pair? 1)'), 'A number is not a pair');
  ok(!p('(pair? "foo")'), 'A string is not a pair');
});

test('`number?\' return true if argument is a number, else false', function() {
  ok(p('(number? 1)'), 'Number type-check function failed.');
  ok(p('(number? (+ 1 2))'), 'Number type-check function failed.');
  ok(!p('(number? +)'), 'Number type-check function failed.');
  ok(p('(number? (car \'(1)))'), 'Number type-check function failed.');
  ok(!p('(number? (car \'(foo)))', 'Number type-check function falied.'));
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

test('`zero?\' should return true if given argument is 0, else false', function() {
  ok(p('(zero? 0)'));
  ok(!p('(zero? -1)'));
  ok(!p('(zero? 1)'));
});
