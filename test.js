function TestSuite() {
  this.testc = 0;
  this.assertc = 0;
  this.failc = 0;
  this.failures = [];
  this.currentTest = null;
  this._halt = false;
  this.start = null;
  this.end = null;

  return true;
};

TestSuite.prototype._recordFailure = function(message) {
  this.failc++;
  this.failures.push(this.currentTest + '():\n' + message + '\n');
};

TestSuite.prototype.runTest = function(test) {
  test();
  this.testc++;
};

TestSuite.prototype.getReport = function() {
  var sb = '';
  sb += 'Finished in ' + ((this.end - this.start) / 100).toString();
  sb += ' seconds.\n\n'
  for( var i = 0, len = this.failures.length; i < len; ++i ) {
    sb += this.failures[i] + '\n';
  }
  sb += this.testc.toString() + ' tests, ' + this.assertc.toString();
  sb += ' assertions, ' + this.failc.toString() + ' failures'
  return sb;
};

TestSuite.prototype.runAllTests = (function(global) {
  return function() {
    this.start = new Date();
    TestSuite.tester = this;
    var cur;
    for( var x in global ) {
      switch( true ) {
        case this._halt:
          this.end = new Date();
          return false;
        case /Test$/.test(x):
          cur = new global[x]();
          for( var y in cur ) {
            switch( true ) {
              case this._halt:
                this.end = new Date();
                return false;
              case /^test/.test(y):
                this.currentTest = y;
                this.runTest(cur[y]);
                break;
            }
          }
          break;
      }
    }
    this.end = new Date();
    return true;
  }
})(this);

TestSuite.tester = null;

TestSuite.assert = {
  isNull: function(obj, msg) {
    TestSuite.tester.assertc++;
    if( obj != null ) {
      TestSuite.tester._recordFailure('Expected null, got ' +
                                      obj.toString() + '\n' +
                                      (msg || ''));
      return false;
    }
    return true;
  },

  isNotNull: function(obj, msg) {
    TestSuite.tester.assertc++;
    if( obj != null ) {
      TestSuite.tester._recordFailure('Got null when not ' +
                                      'expected\n' + (msg || ''));
      return false;
    }
    return true;
  },

  isEqual: function(obj1, obj2, msg) {
    TestSuite.tester.assertc++;
    if( obj1 != obj2 ) {
      TestSuite.tester._recordFailure('Expected ' + obj1.toString() +
                                      'got ' + (obj2 || 'null').toString() +
                                      '\n' + (msg || ''));
      return false;
    }
    return true;
  },

  isNotEqual: function(obj1, obj2, msg) {
    TestSuite.tester.assertc++;
    if( obj1 == obj2 ) {
      TestSuite.tester._recordFailure('Value ' + obj1.toString() +
                                      'found when not expected\n' + (msg || ''));
      return false;
    }
    return true;
  },

  isTrue: function(obj, msg) {
    TestSuite.tester.assertc++;
    if( obj != true ) {
      TestSuite.tester._recordFailure('False condition encountered when not ' +
                                      'expected\n' + (msg || ''));
      return false;
    }
    return true;
  },

  isFalse: function(obj, msg) {
    TestSuite.tester.assertc++;
    if( obj != false ) {
      TestSuite.tester._recordFailure('True condition encountered when not ' +
                                      'expected\n' + (msg || ''));
      return false;
    }
    return true;
  },

  // rhino needs this to be quoted
  doesThrow: function(fn, msg) {
    TestSuite.tester.assertc++;
    var thrown = false;
    try {
      fn();
    } catch(e) {
      thrown = true;
    }
    if( !thrown ) {
      TestSuite.tester._recordFailure('Exception not thrown\n' + (msg || ''));
    }
    return thrown;
  },

  doesNotThrow: function(fn, msg) {
    TestSuite.tester.assertc++;
    var thrown = false;
    try {
      fn();
    } catch(e) {
      thrown = true;
    }
    if( thrown ) {
      TestSuite.tester._recordFailure('Exception thrown when not expected\n' + (msg || ''));
    }
    return !thrown;
  }
};
