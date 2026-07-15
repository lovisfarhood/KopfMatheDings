import test from"node:test";import assert from"node:assert/strict";import{gcd,Rational}from"../src/core/rational.js";
test("Brüche kürzen und Vorzeichen",()=>{assert.equal(new Rational(6,8).toString(),"3/4");assert.equal(new Rational(6,-8).toString(),"-3/4");assert.equal(gcd(54,24),6n)});
test("exakte Bruchrechnung",()=>{const a=new Rational(2,3),b=new Rational(5,6);assert.equal(a.add(b).toString(),"3/2");assert.equal(a.sub(b).toString(),"-1/6");assert.equal(a.mul(b).toString(),"5/9");assert.equal(a.div(b).toString(),"4/5")});
test("Komma, Punkt und äquivalente Brüche",()=>{assert.equal(Rational.parse("0,5").toString(),"1/2");assert.equal(Rational.parse("-1.250").toString(),"-5/4");assert.ok(Rational.parse("2/4").equals("0.5"))});
test("Nenner null abweisen",()=>assert.throws(()=>new Rational(1,0),/Nenner/));
