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
