module('Scope', {
  setup: function() {
    this.target = new Scope();
    this.target._values = {foo: 'bar', foobar: 'baz'};
  }
});


test('#getValue() and #setValue()', function() {
  this.target.setValue('new test value', 'new test value');
  equals('new test value', this.target.getValue('new test value'));
});

test('#clone() should return a copy of itself with the same values', function() {
  var clone = this.target.clone();
  equals(clone.getValue('foo'), this.target.getValue('foo'));
  equals(clone.getValue('foobar'), this.target.getValue('foobar'));
  ok(clone !== this.target);
  same(Scope, clone.constructor);
});
