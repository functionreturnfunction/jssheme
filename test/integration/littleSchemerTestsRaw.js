test('`leftmost\' function', function() {
  p('(define leftmost (lambda (l) (cond ((null? l) l) ((atom? (car l)) (car l)) (#t (leftmost (car l))))))');
});

test('`eqlist?\' function', function() {
  p('(define eqlist? (lambda (l1 l2) (cond ((null? l1) (null? l2)) ((null? l2) #f) ((and (atom? (car l1)) (atom? (car l2))) (if (eqan? (car l1) (car l2)) (eqlist? (cdr l1) (cdr l2)) #f)) (#t (and (eqlist? (car l1) (car l2)) (eqlist? (cdr l1) (cdr l2)))))))');
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
