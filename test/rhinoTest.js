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
load('./src/primitives.js');
load('./src/specialForms.js');
load('./src/compiledFunctions.js');
load('./lib/qunitRhino.js');
load('./test/testHelpers.js');
load('./test/unit/typesTest.js');
load('./test/unit/helpersTest.js');
load('./test/integration/interpreterTest.js');
load('./test/integration/primitivesTest.js');
load('./test/integration/specialFormsTest.js');
load('./test/integration/compiledFunctionsTest.js');
load('./test/integration/littleSchemerTest.js');

new QUnit.ConsolePrinter().print();
