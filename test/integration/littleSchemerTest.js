module('Little Schemer')

test('atom? function', function() {
  p('(define atom? (lambda (a) (and (not (pair? a)) (not (null? a)))))');
  ok(p('(atom? \'Harry)'));
  ok(p('(atom? 12.34)'))
  ok(p('(atom? "foo")'))
  ok(!p('(atom? \'(Harry))'));
  ok(!p('(atom? \'(Harry had a heap of apples))'));
  ok(!p('(atom? \'())'));
});

test('`lat?\' function', function() {
  p('(define lat? (lambda (l) (cond ((null? l) #t) ((atom? (car l)) (lat? (cdr l))) (#t #f))))');
  ok(p('(lat? \'(foo))'));
  ok(p('(lat? \'())'));
  ok(!p('(lat? \'(foo ()))'));
  ok(!p('(lat? \'(()))'));
});

test('`member?\' function', function() {
  p('(define member? (lambda (a lat) (cond ((null? lat) #f) ((eq? a (car lat)) #t) (#t (member? a (cdr lat))))))');
  ok(!p('(member? \'foo \'())'));
  ok(p('(member? \'foo \'(foo))'));
  ok(!p('(member? \'foo \'(bar))'));
  ok(p('(member? \'foo \'(foo bar foo bar))'));
});

test('rember function', function() {
  p('(define rember (lambda (a lat) (if (null? lat) lat (let ((first (car lat)) (rest (cdr lat))) (if (eq? a first) rest (cons first (rember a rest)))))))');
  equals('()', p('(rember \'foo \'())'));
  equals('()', p('(rember \'foo \'(foo))'));
  equals('(bar)', p('(rember \'foo \'(bar))'));
  equals('(bar foo bar)', p('(rember \'foo \'(foo bar foo bar))'));
});

test('`firsts\' function', function() {
  p('(define firsts (lambda (l) (if (null? l) l (cons (car (car l)) (firsts (cdr l))))))');
  equals('(foo bar baz)', p('(firsts \'((foo bar) (bar (bar)) (baz 1)))'));
});

test('`insertR\' function', function() {
  p('(define insertR (lambda (new old lat) (cond ((null? lat) lat) ((eq? old (car lat)) (cons old (cons new (cdr lat)))) (#t (cons (car lat) (insertR new old (cdr lat)))))))');
  equals('(bar foo bar (bar))', p('(insertR \'foo \'bar \'(bar bar (bar)))'))
});

test('`insertL\' function', function() {
  p('(define insertL (lambda (new old lat) (cond ((null? lat) lat) ((eq? old (car lat)) (cons new lat)) (#t (cons (car lat) (insertL new old (cdr lat)))))))');
  equals('(foo bar bar (bar))', p('(insertL \'foo \'bar \'(bar bar (bar)))'))
});

///

test('multirember function', function() {
  p('(define multirember (lambda (a lat) (cond ((null? lat) lat) ((eq? a (car lat)) (multirember a (cdr lat))) (else (cons (car lat) (multirember a (cdr lat)))))))');
  equals('()', p('(multirember \'foo \'())'));
  equals('()', p('(multirember \'foo \'(foo))'));
  equals('(bar)', p('(multirember \'foo \'(bar))'));
  equals('(bar bar)', p('(multirember \'foo \'(foo bar foo bar))'));
});
