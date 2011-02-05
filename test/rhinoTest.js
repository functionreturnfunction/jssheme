if (typeof(console) == 'undefined') {
  console = {log: print};
}

// hack in node support
var load = load || function(path) {
  require('.' + path);
}

load('./src/types.js');
load('./src/helpers.js');
load('./src/interpreter.js');
load('./lib/qunitRhino.js');
load('./test/testHelpers.js');
load('./test/unit/typesTest.js');
load('./test/unit/helpersTest.js');
load('./test/integration/schemeTest.js');
load('./test/integration/littleSchemerTest.js');

new QUnit.ConsolePrinter().print();
