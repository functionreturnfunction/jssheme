var QUnit = {
  Module: function(name, opts) {
    this.name = name;
    this.testResults = [];
    opts = opts || {};
    this.setupFn = opts['setup'];
    this.teardownFn = opts['teardown'];
  },
  AssertFailException: function(message) {
    this.message = message;
  },
  Test: function(name, body) {
    this.name = name;
    this.body = body;
  },
  TestResult: function(testName, successful, exception, errorObj) {
    this.testName = testName;
    this.successful = successful;
    this.exception = exception;
    this.errorObj = errorObj;
  },
  ConsolePrinter: function() {
    this.verbose = QUnit.verbose;
    this.modules = QUnit.modules;
  },
  HtmlPrinter: function(element) {
    this.element = element;
    this.verbose = QUnit.verbose;
    this.modules = QUnit.modules;
    print = function(str) {
      element.innerHTML += str + '\n';
    };
  },

  currentModule: null,
  modules: [],
  verbose: false
};

QUnit.Module.prototype.toString = function() {
  return 'Module: ' + this.name;
};

QUnit.Module.prototype.setup = function() {
  this.testContext = {};
  if (this.setupFn && this.setupFn.constructor == Function) {
    this.setupFn.call(this.testContext);
  }
};

QUnit.Module.prototype.teardown = function() {
  if (this.teardownFn && this.teardownFn.constructor == Function) {
    this.teardownFn.call(this.testContext);
  }
};

QUnit.AssertFailException.prototype.toString = function() {
  return this.message;
};

QUnit.Test.prototype.run = function(context) {
  try {
    this.body.call(context);
  } catch (e) {
    if (e.constructor === QUnit.AssertFailException) {
      return new QUnit.TestResult(this.name, false, false, e);
    }
    return new QUnit.TestResult(this.name, false, true, e);
  }
  return new QUnit.TestResult(this.name, true);
};

QUnit.TestResult.prototype.toString = function() {
  if (this.successful) {
    return '"' + this.testName + '" successful.';
  } else {
    var sb = [];
    if (this.exception) {
      sb.push('"');
      sb.push(this.testName);
      sb.push('" failed with an exception.');
    } else {
      sb.push('"');
      sb.push(this.testName);
      sb.push('" failed.');
    }
    sb.push('\nMessage: ' + this.errorObj.toString());
    if (this.errorObj.stack) {
      sb.push('\nStack: ' + this.errorObj.stack);
    }
    return sb.join('');
  }
};

QUnit.ConsolePrinter.prototype.print = function() {
  var curModule, curResult, successes, failures, exceptions;
  var totalSuccesses, totalFailures, totalExceptions, totalTests;
  totalSuccesses = totalFailures = totalExceptions = totalTests = 0;
  for (var i = 0, leni = this.modules.length; i < leni; ++i) {
    successes = failures = exceptions = 0;
    curModule = this.modules[i];

    print(curModule.toString());

    for (var j = 0, lenj = curModule.testResults.length; j < lenj; ++j) {
      curResult = curModule.testResults[j];

      if (curResult.successful) {
        if (this.verbose) {
          print('  Test #' + (j + 1).toString() + ' ' + curResult.toString());
        }
        successes++;
      } else {
        print('\n  Test #' + (j + 1).toString() + ' ' +
              curResult.toString().replace(/\n/g, '\n    ') + '\n');

        if (curResult.exception) {
          exceptions++;
        } else {
          failures++;
        }
      }
    }

    print('  ' + lenj + ' tests, ' + successes + ' successful, ' +
          failures + ' failed, ' + exceptions + ' exception' +
          (exceptions == 1 ? '' : 's') + '.\n');

    totalSuccesses += successes;
    totalFailures += failures;
    totalExceptions += exceptions;
    totalTests += lenj;
  }

  print('Overall:\n' + '  ' + totalTests + ' tests, ' + totalSuccesses +
        ' successful, ' + totalFailures + ' failed, ' + totalExceptions +
        ' exception' + (totalExceptions == 1 ? '' : 's') + '.\n');
};

QUnit.HtmlPrinter.prototype.print = QUnit.ConsolePrinter.prototype.print;

function module(name, opts) {
  var module = new QUnit.Module(name, opts);
  QUnit.currentModule = module;
  QUnit.modules.push(module);
  return module;
}

function test(name, fn) {
  var module = QUnit.currentModule || module();
  module.setup();
  module.testResults.push(new QUnit.Test(name, fn).run(module.testContext));
  module.teardown();
}

function ok(obj, message) {
  if (!obj) {
    throw new QUnit.AssertFailException((message ? message + '\n' : '') +
      'Expected: true; Got: ' + obj.toString());
  }
}

function equals(a, b, message) {
  if (a != b) {
    a = a || (a === undefined ? 'undefined' : 'null');
    b = b || (b === undefined ? 'undefined' : 'null');
    throw new QUnit.AssertFailException((message ? message + '\n' : '') +
      'Expected: ' + a.toString() + '; Got: ' + b.toString());
  }
}

function same(a, b, message) {
  if (a !== b) {
    a = a || (a === undefined ? 'undefined' : 'null');
    b = b || (b === undefined ? 'undefined' : 'null');
    throw new QUnit.AssertFailException((message ? message + '\n' : '') +
      'Expected: ' + a.toString() + '; Got: ' + b.toString());
  }
}
