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

test('`subst\' function', function() {
  p('(define subst (lambda (new old lat) (cond ((null? lat) lat) ((eq? old (car lat)) (cons new (cdr lat))) (#t (cons (car lat) (subst new old (cdr lat)))))))');
  equals('(bar foo foo)', p('(subst \'bar \'foo \'(foo foo foo))'));
});

test('`subst2\' function', function() {
  p('(define subst2 (lambda (new o1 o2 lat) (cond ((null? lat) lat) ((or (eq? o1 (car lat)) (eq? o2 (car lat))) (cons new (cdr lat))) (#t (cons (car lat) (subst new o1 o2 (cdr lat)))))))');
  equals('(baz foo bar)', p('(subst2 \'baz \'foo \'bar \'(foo foo bar))'));
  equals('(baz foo bar)', p('(subst2 \'baz \'foo \'bar \'(bar foo bar))'));
});

test('multirember function', function() {
  p('(define multirember (lambda (a lat) (cond ((null? lat) lat) ((eq? a (car lat)) (multirember a (cdr lat))) (else (cons (car lat) (multirember a (cdr lat)))))))');
  equals('()', p('(multirember \'foo \'())'));
  equals('()', p('(multirember \'foo \'(foo))'));
  equals('(bar)', p('(multirember \'foo \'(bar))'));
  equals('(bar bar)', p('(multirember \'foo \'(foo bar foo bar))'));
});

test('`multiinsertR\' function', function() {
  p('(define multiinsertR (lambda (new old lat) (cond ((null? lat) lat) ((eq? old (car lat)) (cons old (cons new (multiinsertR new old (cdr lat))))) (#t (cons (car lat) (multiinsertR new old (cdr lat)))))))');
  equals('(bar foo bar foo (bar))',
         p('(multiinsertR \'foo \'bar \'(bar bar (bar)))'));
});

test('`(multiinsertL\' function', function() {
  p('(define multiinsertL (lambda (new old lat) (cond ((null? lat) lat) ((eq? old (car lat)) (cons new (cons old (multiinsertL new old (cdr lat))))) (#t (cons (car lat) (multiinsertL new old (cdr lat)))))))');
  equals('(foo bar foo bar (bar))',
         p('(multiinsertL \'foo \'bar \'(bar bar (bar)))'));
});

test('`multisubst\' function', function() {
  p('(define multisubst (lambda (new old lat) (cond ((null? lat) lat) ((eq? old (car lat)) (cons new (multisubst new old (cdr lat)))) (#t (cons (car lat) (multisubst new old (cdr lat)))))))');
  equals('(foo foo (bar))',
         p('(multisubst \'foo \'bar \'(bar bar (bar)))'));
});

test('`add1\' function', function() {
  p('(define add1 (lambda (n) (+ n 1)))');
  equals(1, p('(add1 0)'));
  equals(2, p('(add1 1)'));
});

test('`sub1\' function', function() {
  p('(define sub1 (lambda (n) (- n 1)))');
  equals(0, p('(sub1 1)'));
  equals(1, p('(sub1 2)'));
});

test('`o+\' function', function() {
  p('(define o+ (lambda (n m) (cond ((zero? m) n) (#t (add1 (o+ n (sub1 m)))))))');
  equals(2, p('(o+ 1 1)'));
  equals(4, p('(o+ 2 2)'));
});

test('`o-\' function', function() {
  p('(define o- (lambda (n m) (cond ((zero? m) n) (#t (sub1 (o- n (sub1 m)))))))');
  equals(0, p('(o- 1 1)'));
  equals(2, p('(o- 4 2)'));
});
