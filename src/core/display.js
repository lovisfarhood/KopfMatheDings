const esc=v=>String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
export const minus=v=>String(v).replace(/-/g,"−");
export const frac=(a,b)=>`<span class="fraction"><span>${esc(minus(a))}</span><span>${esc(minus(b))}</span></span>`;
export const context=s=>`<span class="context">${s}</span>`;
export const math=s=>`<span class="math">${s}</span>`;
export function matrix(rows){const cols=rows[0]?.length||1,cells=rows.flat().map(v=>`<span>${esc(minus(v))}</span>`).join("");return`<span class="matrix-wrap"><span class="bracket left"></span><span class="matrix" style="grid-template-columns:repeat(${cols},auto)">${cells}</span><span class="bracket right"></span></span>`}
export const vector=v=>matrix(v.map(x=>[x]));
