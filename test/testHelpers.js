var p = Interpreter.parse;

function doesThrow(fn, message) {
  QUnit.currentModule.assertions++;
  var thrown = false;

  try {
    fn();
  } catch(e) {
    thrown = true;
  }

  ok(thrown, message);
}

function doesNotThrow(fn, message) {
  QUnit.currentModule.assertions++;
  var thrown = false;

  try {
    fn();
  } catch(e) {
    thrown = true;
  }

  ok(!thrown, message);
}
