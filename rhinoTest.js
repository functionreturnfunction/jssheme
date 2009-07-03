load('scheme.js');
load('test.js');
load('schemeTest.js');

var tester = new TestSuite();
tester.runAllTests();
print(tester.getReport());
