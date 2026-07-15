import test from"node:test";import assert from"node:assert/strict";import{coprimePair,createRng,nz}from"../src/core/random.js";
test("Seed ist reproduzierbar",()=>{const a=createRng("x"),b=createRng("x");assert.deepEqual(Array.from({length:100},()=>a.int(-9,9)),Array.from({length:100},()=>b.int(-9,9)))});
test("Grenzen und nonzero",()=>{const r=createRng("range");for(let i=0;i<500;i++){const v=r.int(-4,7);assert.ok(v>=-4&&v<=7);assert.notEqual(nz(r,-3,3),0)}});
test("teilerfremde Paare",()=>{const r=createRng("gcd"),g=(a,b)=>b?g(b,a%b):Math.abs(a);for(let i=0;i<100;i++){const[a,b]=coprimePair(r);assert.equal(g(a,b),1)}});
