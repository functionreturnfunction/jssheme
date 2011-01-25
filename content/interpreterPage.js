var CODE = '(define fib (lambda (i) (if (< i 2) i (+ (fib (- i 1)) (fib (- i 2))))))';
//var CODE = '(define fib (lambda (i) (begin (pp (string-append "running with i = " (number->string i))) (if (< i 2) i (let ((first (fib (- i 1))) (second (fib (- i 2)))) (begin (pp (string-append "adding " (number->string first) " to " (number->string second))) (+ first second)))))))';

function $(id) { return document.getElementById(id); }

$('txtInput').value = CODE;

function trapErrors() {
  return $('chkTrapErrors').checked;
}

function verboseTests() {
  return $('chkVerbose').checked;
}

function runCount() {
  return parseInt($('txtRunCount').value, 10);
}

function txtInputKeydown(e) {
  if (e.keyCode == 13) {
    e.preventDefault();
    return false;
  }
  return true;
}

function txtInputKeyup(e) {
  if (e.keyCode == 13) {
    if (!e.ctrlKey) {
      $('btnGo').click();
      e.preventDefault();
      return false;
    }
    $('txtInput').value += '\n';
  }
  return true;
}

$('txtInput').onkeydown = txtInputKeydown;
$('txtInput').onkeyup = txtInputKeyup;

function interpret() {
  var output = $('result'), result;
  output.innerHTML = '';

  if (trapErrors()) {
    interpretSafe(output);
  } else {
    result = Interpreter.parse($('txtInput').value);
    result = (result == undefined) ?
      ';Unspecified return value' : ';Value: ' + result.toString();
    output.innerHTML += result;
  }
}

function interpretSafe(output) {
  var result;

  try {
    result = Interpreter.parse($('txtInput').value);
    result = (result == undefined) ?
      ';Unspecified return value' : ';Value: ' + result.toString();
  } catch(e) {
    if (!Interpreter.exception) {
      throw(e);
    }
    result = '<span class=bold>Exception:</span><br/>;' + e.toString();
  }
  output.innerHTML += result;
}

function displayResults() {
  var result = $('result');
  result.innerHTML = '';
  QUnit.verbose = verboseTests();
  new QUnit.HtmlPrinter(result).print();
}

function benchmark() {
  var times = runCount();
  var code = $('txtInput').value;
  var result;
  var date = new Date();
  for( var i = 0; i < times; i++ ) {
    Interpreter.parse(code);
  }
  result = Interpreter.parse(code);
  date = new Date() - date;
  $('result').innerHTML = ';Value: ' + result.toString() + '<br>Took ' +
    date.toString() + 'ms to run ' + times.toString() + ' times.'
}

Interpreter.initPrinter(function (str) {
  $('result').innerHTML += str;
});
