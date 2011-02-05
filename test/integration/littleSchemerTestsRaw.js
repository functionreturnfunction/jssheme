test('`subst\' function', function() {
  p('(define subst (lambda (new old lat) (cond ((null? lat) lat) ((eq? old (car lat)) (cons new (cdr lat))) (#t (cons (car lat) (subst new old (cdr lat)))))))');
});

test('`subst2\' function', function() {
  p('(define subst2 (lambda (new o1 o2 lat) (cond ((null? lat) lat) ((or (eq? o1 (car lat)) (eq? o2 (car lat))) (cons new (cdr lat))) (#t (cons (car lat) (subst new o1 o2 (cdr lat)))))))');
});

test('`multirember\' function', function() {
  p('(define multirember (lambda (a lat) (cond ((null? lat) lat) ((eq? a (car lat)) (multirember a (cdr lat))) (#t (cons (car lat) (multirember a (cdr lat)))))))');
});

test('`multiinsertR\' function', function() {
  p('(define multiinsertR (lambda (new old lat) (cond ((null? lat) lat) ((eq? old (car lat)) (cons old (cons new (multiinsertR new old (cdr lat))))) (#t (cons (car lat) (multiinsertR new old (cdr lat)))))))');
});

test('`(defiinsertL\' function', function() {
  p('ne multiinsertL (lambda (new old lat) (cond ((null? lat) lat) ((eq? old (car lat)) (cons new (cons old (multiinsertL new old (cdr lat))))) (#t (cons (car lat) (multiinsertL new old (cdr lat)))))))');
});

test('`multisubst\' function', function() {
  p('(define multisubst (lambda (new old lat) (cond ((null? lat) lat) ((eq? old (car lat)) (cons new (multisubst new old (cdr lat)))) (#t (cons (car lat) (multisubst new old (cdr lat)))))))');
});

test('`add1\' function', function() {
  p('(define add1 (lambda (n) (+ n 1)))');
});

test('`sub1\' function', function() {
  p('(define sub1 (lambda (n) (- n 1)))');
});

test('`o+\' function', function() {
  p('(define o+ (lambda (n m) (cond ((zero? m) n) (#t (add1 (o+ n (sub1 m)))))))');
});

test('`o-\' function', function() {
  p('(define o- (lambda (n m) (cond ((zero? m) n) (#t (sub1 (o- n (sub1 m)))))))');
});

test('`addtup\' function', function() {
  p('(define addtup (lambda (tup) (cond ((null? tup) 0) (#t (o+ (addtup (cdr tup)) (car tup))))))');
});

test('`o*\' function', function() {
  p('(define o* (lambda (n m) (cond ((zero? m) m) (#t (o+ n (o* n (sub1 m)))))))');
});

test('`tup+\' function', function() {
  p('(define tup+ (lambda (tup1 tup2) (cond ((and (null? tup1) (null? tup2)) tup1) (#t (cons (o+ (car tup1) (car tup2)) (tup+ (cdr tup1) (cdr tup2)))))))');
});

test('`tup+\' function', function() {
  p('(define tup+ (lambda (tup1 tup2) (cond ((null? tup1) tup2) ((null? tup2) tup1) (#t (cons (o+ (car tup1) (car tup2)) (tup+ (cdr tup1) (cdr tup2)))))))');
});

test('`o>\' function', function() {
  p('(define o> (lambda (n m) (cond ((zero? n) #f) ((zero? m) #t) (#t (o> (sub1 n) (sub1 m))))))');
});

test('`o<\' function', function() {
  p('(define o< (lambda (n m) (cond ((zero? m) #f) ((zero? n) #t) (#t (o< (sub1 n) (sub1 m))))))');
});

test('`o=\' function', function() {
  p('(define o= (lambda (n m) (and (not (o< n m)) (not (o> n m)))))');
});

test('`power\' function', function() {
  p('(define power (lambda (n m) (cond ((zero? m) 1) (#t (o* n (power n (sub1 m)))))))');
});

test('`o/\' function', function() {
  p('(define o/ (lambda (n m) (cond ((o< n m) 0) (#t (add1 (o/ (o- n m) m))))))');
});

test('`olength\' function', function() {
  p('(define olength (lambda (lat) (cond ((null? lat) 0) (#t (add1 (olength (cdr lat)))))))');
});

test('`pick\' function', function() {
  p('(define pick (lambda (n lat) (cond ((zero? (sub1 n)) (car lat)) (#t (pick (sub1 n) (cdr lat))))))');
});

test('`rempick\' function', function() {
  p('(define rempick (lambda (n lat) (cond ((zero? (sub1 n)) (cdr lat)) (#t (cons (car lat) (rempick (sub1 n) (cdr lat)))))))');
});

test('`no-nums\' function', function() {
  p('(define no-nums (lambda (lat) (cond ((null? lat) lat) ((number? (car lat)) (no-nums (cdr lat))) (#t (cons (car lat) (no-nums (cdr lat)))))))');
});

test('`all-nums\' function', function() {
  p('(define all-nums (lambda (lat) (cond ((null? lat) lat) ((number? (car lat)) (cons (car lat) (all-nums (cdr lat)))) (#t (all-nums (cdr lat))))))');
});

test('`eqan?\' function', function() {
  p('(define eqan? (lambda (a1 a2) (cond ((and (number? a1) (number? a2)) (o= a1 a2)) ((or (number? a1) (number? a2)) #f) (#t (eq? a1 a2)))))');
});

test('`(\' function', function()defi {
  p('ne occur (lambda (a lat) (cond ((null? lat) 0) ((eqan? a (car lat)) (add1 (occur a (cdr lat)))) (#t (occur a (cdr lat))))))');
});

test('`one?\' function', function() {
  p('(define one? (lambda (n) (= 1 n)))');
});

test('`rempick\' function', function() {
  p('(define rempick (lambda (n lat) (cond ((one? n) (cdr lat)) (#t (cons (car lat) (rempick (sub1 n) (cdr lat)))))))');
});

test('`rember*\' function', function() {
  p('(define rember* (lambda (a l) (cond ((null? l) l) ((list? (car l)) (cons (rember* a (car l)) (rember* a (cdr l)))) ((eqan? a (car l)) (rember* a (cdr l))) (#t (cons (car l) (rember* a (cdr l)))))))');
});

test('`insertR*\' function', function() {
  p('(define insertR* (lambda (new old l) (cond ((null? l) l) ((atom? (car l)) (if (eq? old (car l)) (cons old (cons new (insertR* new old (cdr l)))) (cons (car l) (insertR* new old (cdr l))))) (#t (cons (insertR* new old (car l)) (insertR* new old (cdr l)))))))');
});

test('`occur*\' function', function() {
  p('(define occur* (lambda (a l) (if (null? l) 0 (let ((first (car l)) (recur-rest (occur* a (cdr l)))) (if (atom? first) (if (eq? a first) (add1 recur-rest) recur-rest) (o+ (occur* a first) recur-rest))))))');
});

test('`subst*\' function', function() {
  p('(define subst* (lambda (new old l) (cond ((null? l) l) ((atom? (car l)) (if (eq? old (car l)) (cons new (subst* new old (cdr l))) (cons (car l) (subst* new old (cdr l))))) (#t (cons (subst* new old (car l)) (subst* new old (cdr l)))))))');
});

test('`insertL*\' function', function() {
  p('(define insertL* (lambda (new old l) (cond ((null? l) l) ((atom? (car l)) (if (eq? old (car l)) (cons new (cons old (insertL* new old (cdr l)))) (cons (car l) (insertL* new old (cdr l))))) (#t (cons (insertL* new old (car l)) (insertL* new old (cdr l)))))))');
});

test('`member*\' function', function() {
  p('(define member* (lambda (a l) (cond ((null? l) #f) ((atom? (car l)) (if (eq? a (car l)) #t (member a (cdr l)))) (#t (or (member* a (car l)) (member* a (cdr l)))))))');
});

test('`leftmost\' function', function() {
  p('(define leftmost (lambda (l) (cond ((null? l) l) ((atom? (car l)) (car l)) (#t (leftmost (car l))))))');
});

test('`(d)\' function', function()efine eqlist? (lambda (l1 l2) (cond ((null? l1) (null? l2)) ((null? l2) #f) ((and (atom? (car l1)) (atom? ( {
  p('car l2))) (if (eqan? (car l1) (car l2)) (eqlist? (cdr l1) (cdr l2)) #f)) (#t (and (eqlist? (car l1) (car l2)) (eqlist? (cdr l1) (cdr l2)))))))');
});

test('`equal?\' function', function() {
  p('define equal? (lambda (s1 s2) (cond ((and (atom? s1) (atom? s2)) (eqan? s1 s2)) ((or (atom? s1) (atom? s2)) #f) (#t (eqlist? s1 s2)))))');
});

test('`rember\' function', function() {
  p('(define rember (lambda (s l) (cond ((null? l) l) ((equal? (car l) s) (cdr l)) (#t (cons (car l) (rember s (cdr l)))))))');
});

test('`numbered?\' function', function() {
  p('(define numbered? (lambda (aexp) (cond ((atom? aexp) (number? aexp)) ((or (eq? \'+ (car (cdr aexp))) (eq? \'x (car (cdr aexp))) (eq? \'up (car (cdr aexp)))) (and (numbered? (car aexp)) (numbered? (car (cdr (cdr aexp)))))))))');
});
