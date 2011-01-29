var console = {
  log: print
};

load('src/scheme.js');
load('lib/qunitRhino.js');
load('test/schemeTest.js');

new QUnit.ConsolePrinter().print();
