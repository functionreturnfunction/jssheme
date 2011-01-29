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
