const abs=n=>n<0n?-n:n;
export function gcd(a,b){let x=abs(BigInt(a)),y=abs(BigInt(b));while(y)[x,y]=[y,x%y];return x||1n}
export class Rational{
  constructor(n,d=1){let a=BigInt(n),b=BigInt(d);if(!b)throw new RangeError("Nenner darf nicht null sein.");if(b<0n){a=-a;b=-b}const g=gcd(a,b);this.n=a/g;this.d=b/g;Object.freeze(this)}
  static from(v){if(v instanceof Rational)return v;if(typeof v==="bigint"||Number.isInteger(v))return new Rational(v);if(typeof v==="number"&&Number.isFinite(v))return Rational.parse(String(v));if(typeof v==="string")return Rational.parse(v);throw new TypeError("Keine Zahl")}
  static parse(v){const s=String(v).trim().replace(/−/g,"-").replace(/\s+/g,"");if(!s)throw new SyntaxError("Leere Zahl");const f=s.match(/^([+-]?\d+)\/([+-]?\d+)$/);if(f)return new Rational(f[1],f[2]);const m=s.replace(",",".").match(/^([+-]?)(\d+)(?:\.(\d+))?$/);if(!m)throw new SyntaxError("Ungültige Zahl");const dec=m[3]||"",den=10n**BigInt(dec.length),num=BigInt(m[2]+dec)*(m[1]==="-"?-1n:1n);return new Rational(num,den)}
  add(v){v=Rational.from(v);return new Rational(this.n*v.d+v.n*this.d,this.d*v.d)} sub(v){v=Rational.from(v);return new Rational(this.n*v.d-v.n*this.d,this.d*v.d)} mul(v){v=Rational.from(v);return new Rational(this.n*v.n,this.d*v.d)} div(v){v=Rational.from(v);if(!v.n)throw new RangeError("Division durch null");return new Rational(this.n*v.d,this.d*v.n)}
  equals(v){v=Rational.from(v);return this.n===v.n&&this.d===v.d} isZero(){return this.n===0n} toNumber(){return Number(this.n)/Number(this.d)} toString(){return this.d===1n?String(this.n):`${this.n}/${this.d}`} toJSON(){return this.toString()}
}
