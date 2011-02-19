module('Little Schemer Functions');

test('atom? function, page 10', function() {
  p('(define atom? (lambda (a) (and (not (pair? a)) (not (null? a)))))');
  ok(p('(atom? \'Harry)'));
  ok(p('(atom? 12.34)'))
  ok(p('(atom? "foo")'))
  ok(!p('(atom? \'(Harry))'));
  ok(!p('(atom? \'(Harry had a heap of apples))'));
  ok(!p('(atom? \'())'));
});

test('`lat?\' function, page 16', function() {
  p('(define lat? (lambda (l) (cond ((null? l) #t) ((atom? (car l)) (lat? (cdr l))) (#t #f))))');
  ok(p('(lat? \'(foo))'));
  ok(p('(lat? \'())'));
  ok(!p('(lat? \'(foo ()))'));
  ok(!p('(lat? \'(()))'));
});

test('`member?\' function, page 22', function() {
  p('(define member? (lambda (a lat) (cond ((null? lat) #f) ((eq? a (car lat)) #t) (#t (member? a (cdr lat))))))');
  ok(!p('(member? \'foo \'())'));
  ok(p('(member? \'foo \'(foo))'));
  ok(!p('(member? \'foo \'(bar))'));
  ok(p('(member? \'foo \'(foo bar foo bar))'));
});

test('rember function, page 41', function() {
  p('(define rember (lambda (a lat) (if (null? lat) lat (let ((first (car lat)) (rest (cdr lat))) (if (eq? a first) rest (cons first (rember a rest)))))))');
  equals('()', p('(rember \'foo \'())'));
  equals('()', p('(rember \'foo \'(foo))'));
  equals('(bar)', p('(rember \'foo \'(bar))'));
  equals('(bar foo bar)', p('(rember \'foo \'(foo bar foo bar))'));
});

test('`firsts\' function, page 47', function() {
  p('(define firsts (lambda (l) (if (null? l) l (cons (car (car l)) (firsts (cdr l))))))');
  equals('(foo bar baz)', p('(firsts \'((foo bar) (bar (bar)) (baz 1)))'));
});

test('`insertR\' function, page 50', function() {
  p('(define insertR (lambda (new old lat) (cond ((null? lat) lat) ((eq? old (car lat)) (cons old (cons new (cdr lat)))) (#t (cons (car lat) (insertR new old (cdr lat)))))))');
  equals('(bar foo bar (bar))', p('(insertR \'foo \'bar \'(bar bar (bar)))'))
});

test('`insertL\' function, page 51', function() {
  p('(define insertL (lambda (new old lat) (cond ((null? lat) lat) ((eq? old (car lat)) (cons new lat)) (#t (cons (car lat) (insertL new old (cdr lat)))))))');
  equals('(foo bar bar (bar))', p('(insertL \'foo \'bar \'(bar bar (bar)))'))
});

test('`subst\' function, page 51', function() {
  p('(define subst (lambda (new old lat) (cond ((null? lat) lat) ((eq? old (car lat)) (cons new (cdr lat))) (#t (cons (car lat) (subst new old (cdr lat)))))))');
  equals('(bar foo foo)', p('(subst \'bar \'foo \'(foo foo foo))'));
});

test('`subst2\' function, page 52', function() {
  p('(define subst2 (lambda (new o1 o2 lat) (cond ((null? lat) lat) ((or (eq? o1 (car lat)) (eq? o2 (car lat))) (cons new (cdr lat))) (#t (cons (car lat) (subst new o1 o2 (cdr lat)))))))');
  equals('(baz foo bar)', p('(subst2 \'baz \'foo \'bar \'(foo foo bar))'));
  equals('(baz foo bar)', p('(subst2 \'baz \'foo \'bar \'(bar foo bar))'));
});

test('multirember function, page 53', function() {
  p('(define multirember (lambda (a lat) (cond ((null? lat) lat) ((eq? a (car lat)) (multirember a (cdr lat))) (else (cons (car lat) (multirember a (cdr lat)))))))');
  equals('()', p('(multirember \'foo \'())'));
  equals('()', p('(multirember \'foo \'(foo))'));
  equals('(bar)', p('(multirember \'foo \'(bar))'));
  equals('(bar bar)', p('(multirember \'foo \'(foo bar foo bar))'));
});

test('`multiinsertR\' function, page 56', function() {
  p('(define multiinsertR (lambda (new old lat) (cond ((null? lat) lat) ((eq? old (car lat)) (cons old (cons new (multiinsertR new old (cdr lat))))) (#t (cons (car lat) (multiinsertR new old (cdr lat)))))))');
  equals('(bar foo bar foo (bar))',
         p('(multiinsertR \'foo \'bar \'(bar bar (bar)))'));
});

test('`(multiinsertL\' function, page 57', function() {
  p('(define multiinsertL (lambda (new old lat) (cond ((null? lat) lat) ((eq? old (car lat)) (cons new (cons old (multiinsertL new old (cdr lat))))) (#t (cons (car lat) (multiinsertL new old (cdr lat)))))))');
  equals('(foo bar foo bar (bar))',
         p('(multiinsertL \'foo \'bar \'(bar bar (bar)))'));
});

test('`multisubst\' function, page 57', function() {
  p('(define multisubst (lambda (new old lat) (cond ((null? lat) lat) ((eq? old (car lat)) (cons new (multisubst new old (cdr lat)))) (#t (cons (car lat) (multisubst new old (cdr lat)))))))');
  equals('(foo foo (bar))',
         p('(multisubst \'foo \'bar \'(bar bar (bar)))'));
});

test('`add1\' function, page 59', function() {
  p('(define add1 (lambda (n) (+ n 1)))');
  equals(1, p('(add1 0)'));
  equals(2, p('(add1 1)'));
});

test('`sub1\' function, page 59', function() {
  p('(define sub1 (lambda (n) (- n 1)))');
  equals(0, p('(sub1 1)'));
  equals(1, p('(sub1 2)'));
});

test('`o+\' function, page 60', function() {
  p('(define o+ (lambda (n m) (cond ((zero? m) n) (#t (add1 (o+ n (sub1 m)))))))');
  equals(2, p('(o+ 1 1)'));
  equals(4, p('(o+ 2 2)'));
});

test('`o-\' function, page 61', function() {
  p('(define o- (lambda (n m) (cond ((zero? m) n) (#t (sub1 (o- n (sub1 m)))))))');
  equals(0, p('(o- 1 1)'));
  equals(2, p('(o- 4 2)'));
});

test('`addtup\' function, page 64', function() {
  p('(define addtup (lambda (tup) (cond ((null? tup) 0) (#t (o+ (addtup (cdr tup)) (car tup))))))');
  equals(16, p('(addtup \'(1 2 3 4))'));
});

test('`o*\' function, page 65', function() {
  p('(define o* (lambda (n m) (cond ((zero? m) m) (#t (o+ n (o* n (sub1 m)))))))');
  equals(4, p('(o* 2 2)'));
  equals(16, p('(o* 4 4)'));
});

test('`tup+\' function, page 69', function() {
  p('(define tup+ (lambda (tup1 tup2) (cond ((null? tup1) tup2) ((null? tup2) tup1) (#t (cons (o+ (car tup1) (car tup2)) (tup+ (cdr tup1) (cdr tup2)))))))');
  equals('(2 2 2 2)', p('(tup+ \'(1 1 1 1) \'(1 1 1 1))'));
  equals('(2 2 2 1)', p('(tup+ \'(1 1 1 1) \'(1 1 1))'));
  equals('(2 2 2 1)', p('(tup+ \'(1 1 1) \'(1 1 1 1))'));
});

test('`o>\' function, page 73', function() {
  p('(define o> (lambda (n m) (cond ((zero? n) #f) ((zero? m) #t) (#t (o> (sub1 n) (sub1 m))))))');
  ok(p('(o> 2 1)'));
  ok(!p('(o> 1 2)'));
});

test('`o<\' function, page 73', function() {
  p('(define o< (lambda (n m) (cond ((zero? m) #f) ((zero? n) #t) (#t (o< (sub1 n) (sub1 m))))))');
  ok(!p('(o< 2 1)'));
  ok(p('(o< 1 2)'));
});

test('`o=\' function, page 74', function() {
  p('(define o= (lambda (n m) (and (not (o< n m)) (not (o> n m)))))');
  ok(p('(o= 1 1)'));
  ok(p('(o= 0 0)'));
  ok(!p('(o= 1 0)'));
  ok(!p('(o= 0 1)'));
});

test('`power\' function, page 74', function() {
  p('(define power (lambda (n m) (cond ((zero? m) 1) (#t (o* n (power n (sub1 m)))))))');
  equals(4, p('(power 2 2)'));
  equals(8, p('(power 2 3)'));
});

test('`o/\' function, page 75', function() {
  p('(define o/ (lambda (n m) (cond ((o< n m) 0) (#t (add1 (o/ (o- n m) m))))))');
  equals(1, p('(o/ 2 2)'));
  equals(2, p('(o/ 4 2)'));
  equals(3, p('(o/ 9 3)'));
});

test('`olength\' function, page 76', function() {
  p('(define olength (lambda (lat) (cond ((null? lat) 0) (#t (add1 (olength (cdr lat)))))))');
  equals(1, p('(olength \'(a))'));
  equals(2, p('(olength \'(a s))'));
  equals(3, p('(olength \'(a s d))'));
  equals(4, p('(olength \'(a s d f))'));
});

test('`pick\' function, page 76', function() {
  p('(define pick (lambda (n lat) (cond ((zero? (sub1 n)) (car lat)) (#t (pick (sub1 n) (cdr lat))))))');
  equals('a', p('(pick 1 \'(a s d f))'));
  equals('s', p('(pick 2 \'(a s d f))'));
  equals('d', p('(pick 3 \'(a s d f))'));
  equals('f', p('(pick 4 \'(a s d f))'));
});

test('`rempick\' function, page 77', function() {
  p('(define rempick (lambda (n lat) (cond ((zero? (sub1 n)) (cdr lat)) (#t (cons (car lat) (rempick (sub1 n) (cdr lat)))))))');
  equals('(s d f)', p('(rempick 1 \'(a s d f))'));
  equals('(a d f)', p('(rempick 2 \'(a s d f))'));
  equals('(a s f)', p('(rempick 3 \'(a s d f))'));
  equals('(a s d)', p('(rempick 4 \'(a s d f))'));
});

test('`no-nums\' function, page 77', function() {
  p('(define no-nums (lambda (lat) (cond ((null? lat) lat) ((number? (car lat)) (no-nums (cdr lat))) (#t (cons (car lat) (no-nums (cdr lat)))))))');
  equals('()', p('(no-nums \'(1))'));
  equals('(a s d f)', p('(no-nums \'(1 a 2 s 3 d 4 f))'));
});

test('`all-nums\' function, page 78', function() {
  p('(define all-nums (lambda (lat) (cond ((null? lat) lat) ((number? (car lat)) (cons (car lat) (all-nums (cdr lat)))) (#t (all-nums (cdr lat))))))');
  equals('()', p('(all-nums \'(a))'));
  equals('(1 2 3 4)', p('(all-nums \'(1 a 2 s 3 d 4 f))'));
});

test('`eqan?\' function, page 78', function() {
  p('(define eqan? (lambda (a1 a2) (cond ((and (number? a1) (number? a2)) (o= a1 a2)) ((or (number? a1) (number? a2)) #f) (#t (eq? a1 a2)))))');
  ok(p('(eqan? 1 1)'), 'Numbers with the same value are equal.');
  ok(p('(eqan? \'a \'a)'), 'Atoms with the same value are equal.');
  ok(!p('(eqan? 1 2)'), 'Numbers with different values are not equal.');
  ok(!p('(eqan? \'a \'b)'), 'Atoms with different values are not equal.');
  ok(!p('(eqan? 1 \'a)'), 'Numeric atoms are not equal to alphabetical atoms.');
});

test('`occur\' function, page 78', function() {
  p('(define occur (lambda (a lat) (cond ((null? lat) 0) ((eqan? a (car lat)) (add1 (occur a (cdr lat)))) (#t (occur a (cdr lat))))))');
  equals(0, p('(occur \'bar \'(foo foo foo))'));
  equals(1, p('(occur \'bar \'(foo foo bar))'));
  equals(2, p('(occur \'bar \'(foo bar bar))'));
  equals(3, p('(occur \'bar \'(bar bar bar))'));
});

test('`one?\' function, page 79', function() {
  p('(define one? (lambda (n) (= 1 n)))');
  ok(p('(one? 1)'));
  ok(!p('(one? 0)'));
  ok(!p('(one? 2)'));
});

test('`rempick\' function (refactored), page 79', function() {
  p('(define rempick (lambda (n lat) (cond ((one? n) (cdr lat)) (#t (cons (car lat) (rempick (sub1 n) (cdr lat)))))))');
  equals('(s d f)', p('(rempick 1 \'(a s d f))'));
  equals('(a d f)', p('(rempick 2 \'(a s d f))'));
  equals('(a s f)', p('(rempick 3 \'(a s d f))'));
  equals('(a s d)', p('(rempick 4 \'(a s d f))'));
});

test('`rember*\' function, page 81', function() {
  p('(define rember* (lambda (a l) (cond ((null? l) l) ((list? (car l)) (cons (rember* a (car l)) (rember* a (cdr l)))) ((eqan? a (car l)) (rember* a (cdr l))) (#t (cons (car l) (rember* a (cdr l)))))))');
  equals('()', p('(rember* \'foo \'())'));
  equals('()', p('(rember* \'foo \'(foo))'));
  equals('(bar)', p('(rember* \'foo \'(bar))'));
  equals('(bar bar)', p('(rember* \'foo \'(foo bar foo bar))'));
  equals('((bar) (() bar))', p('(rember* \'foo \'((foo bar) ((foo) bar)))'));
});

test('`insertR*\' function, page 82', function() {
  p('(define insertR* (lambda (new old l) (cond ((null? l) l) ((atom? (car l)) (if (eq? old (car l)) (cons old (cons new (insertR* new old (cdr l)))) (cons (car l) (insertR* new old (cdr l))))) (#t (cons (insertR* new old (car l)) (insertR* new old (cdr l)))))))');
  equals('()', p('(insertR* \'foo \'bar \'())'));
  equals('(bar foo)', p('(insertR* \'foo \'bar \'(bar))'));
  equals('(foo bar foo)', p('(insertR* \'foo \'bar \'(foo bar))'));
  equals('(foo bar foo foo bar foo)',
         p('(insertR* \'foo \'bar \'(foo bar foo bar))'));
  equals('((foo bar foo) ((foo) bar foo))',
         p('(insertR* \'foo \'bar \'((foo bar) ((foo) bar)))'));
});

test('`occur*\' function, page 85', function() {
  p('(define occur* (lambda (a l) (if (null? l) 0 (let ((first (car l)) (recur-rest (occur* a (cdr l)))) (if (atom? first) (if (eq? a first) (add1 recur-rest) recur-rest) (o+ (occur* a first) recur-rest))))))');
  equals(0, p('(occur* \'bar \'(foo foo foo))'));
  equals(1, p('(occur* \'bar \'(foo foo (bar)))'));
  equals(2, p('(occur* \'bar \'(foo (bar (bar))))'));
  equals(3, p('(occur* \'bar \'(bar (bar (bar))))'));
  equals(4, p('(occur* \'bar \'(bar (bar (bar) bar)))'));
});

test('`subst*\' function, page 85', function() {
  p('(define subst* (lambda (new old l) (cond ((null? l) l) ((atom? (car l)) (if (eq? old (car l)) (cons new (subst* new old (cdr l))) (cons (car l) (subst* new old (cdr l))))) (#t (cons (subst* new old (car l)) (subst* new old (cdr l)))))))');
  equals('(baz)',
         p('(subst* \'foo \'bar \'(baz))'));
  equals('(foo foo (foo))',
         p('(subst* \'foo \'bar \'(bar bar (bar)))'));
  equals('((foo foo) ((foo) foo) foo)',
         p('(subst* \'foo \'bar \'((foo bar) ((foo) bar) bar))'));
});

test('`insertL*\' function, page 86', function() {
  p('(define insertL* (lambda (new old l) (cond ((null? l) l) ((atom? (car l)) (if (eq? old (car l)) (cons new (cons old (insertL* new old (cdr l)))) (cons (car l) (insertL* new old (cdr l))))) (#t (cons (insertL* new old (car l)) (insertL* new old (cdr l)))))))');
  equals('()', p('(insertL* \'foo \'bar \'())'));
  equals('(foo bar)', p('(insertL* \'foo \'bar \'(bar))'));
  equals('(foo foo bar)', p('(insertL* \'foo \'bar \'(foo bar))'));
  equals('(foo foo bar foo foo bar)',
         p('(insertL* \'foo \'bar \'(foo bar foo bar))'));
  equals('((foo foo bar) ((foo) foo bar) foo bar)',
         p('(insertL* \'foo \'bar \'((foo bar) ((foo) bar) bar))'));
});

test('`member*\' function, page 86', function() {
  p('(define member* (lambda (a l) (cond ((null? l) #f) ((atom? (car l)) (if (eq? a (car l)) #t (member* a (cdr l)))) (#t (or (member* a (car l)) (member* a (cdr l)))))))');
  ok(!p('(member* \'foo \'())'));
  ok(p('(member* \'foo \'(foo))'));
  ok(!p('(member* \'foo \'(bar))'));
  ok(p('(member* \'foo \'(foo bar foo bar))'));
  ok(p('(member* \'foo \'(bar bar (foo) bar))'));
  ok(!p('(member* \'foo \'(bar bar (bar) bar))'));
});

test('`leftmost\' function, page 88', function() {
  p('(define leftmost (lambda (l) (cond ((null? l) l) ((atom? (car l)) (car l)) (#t (leftmost (car l))))))');
  equals('potato', p('(leftmost \'((potato) (chips ((with) fish) (chips))))'));
  equals('hot', p('(leftmost \'(((hot) (tuna (and))) cheese))'));
});

test('`eqlist?\' function, page 92', function() {
  p('(define eqlist? (lambda (l1 l2) (cond ((null? l1) (null? l2)) ((null? l2) #f) ((and (atom? (car l1)) (atom? (car l2))) (if (eqan? (car l1) (car l2)) (eqlist? (cdr l1) (cdr l2)) #f)) (#t (and (eqlist? (car l1) (car l2)) (eqlist? (cdr l1) (cdr l2)))))))');
  ok(!p('(eqlist? \'(strawberry ice cream) \'(strawberry cream ice))'));
  ok(!p('(eqlist? \'(banana ((split))) \'((banana) (split)))'));
  ok(!p('(eqlist? \'(beef ((sausage)) (and (soda))) \'(beef ((salami)) (and (soda))))'));
  ok(p('(eqlist? \'(beef ((sausage)) (and (soda))) \'(beef ((sausage)) (and (soda))))'));
});

test('`equal?\' function, page 92', function() {
  p('define equal? (lambda (s1 s2) (cond ((and (atom? s1) (atom? s2)) (eqan? s1 s2)) ((or (atom? s1) (atom? s2)) #f) (#t (eqlist? s1 s2)))))');
  ok(p('(equal? 1 1)'));
  ok(!p('(equal? 1 2)'))
  ok(!p('(equal? 1 \'foo)'))
  ok(p('(equal? \'foo \'foo)'))
  ok(!p('(equal? \'foo \'bar)'))
  ok(!p('(equal? \'foo \'())'))
  ok(p('(equal? \'() \'())'))
  ok(!p('(equal? \'() \'(foo))'))
  ok(p('(equal? \'(foo) \'(foo))'))
  ok(!p('(equal? \'(foo) \'(bar))'))

  p('(define foo 2)');
  ok(p('(equal? foo foo)'));
  ok(p('(equal? foo 2)'));

  ok(!p('(equal? \'(beef ((sausage)) (and (soda))) \'(beef ((salami)) (and (soda))))'));
  ok(p('(equal? \'(beef ((sausage)) (and (soda))) \'(beef ((sausage)) (and (soda))))'));
});

test('`rember\' function, page 94', function() {
  p('(define rember (lambda (s l) (cond ((null? l) l) ((equal? (car l) s) (cdr l)) (#t (cons (car l) (rember s (cdr l)))))))');
  equals('()', p('(rember \'foo \'())'));
  equals('()', p('(rember \'foo \'(foo))'));
  equals('(bar)', p('(rember \'foo \'(bar))'));
  equals('(bar foo bar)', p('(rember \'foo \'(foo bar foo bar))'));
});

test('`numbered?\' function, page 99', function() {
  p('(define numbered? (lambda (aexp) (cond ((atom? aexp) (number? aexp)) ((or (eq? \'+ (car (cdr aexp))) (eq? \'x (car (cdr aexp))) (eq? \'up (car (cdr aexp)))) (and (numbered? (car aexp)) (numbered? (car (cdr (cdr aexp)))))))))');
  ok(p('(numbered? 1)'));
  ok(p('(numbered? \'(3 + (4 x 5)))'));
  ok(!p('(numbered? \'(2 x sausage))'));
});
