import {ITEMS} from './data-v14.js';
import {POTIONS,POTION_CD} from './systems-data-v14.js';
const views=new WeakMap();
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function potionSummary(id){const p=POTIONS[id];return p?`恢复 ${p.amount} ${p.kind==='hp'?'生命':'法力'} · 冷却 ${POTION_CD} 秒`:ITEMS[id]?.desc||'';}
export function selectCommerce(g,key,id){let v=views.get(g);if(!v){v={};views.set(g,v);}v[key]=id;}
export function commerceGrid(g,key,rows){
 const selected=rows.find(r=>String(r.id)===views.get(g)?.[key]);
 const cells=rows.map(r=>`<button class="inventory-cell commerce-cell ${esc(r.quality||'')} ${r===selected?'chosen':''}" data-shop-select="${esc(r.id)}" data-shop-key="${esc(key)}" aria-label="查看${esc(r.name)}" aria-pressed="${r===selected}">${r.icon||'<span class="commerce-parcel" aria-hidden="true">▣</span>'}<span>${esc(r.name)}</span></button>`).join('');
 const detail=selected?`<div class="item-heading">${selected.icon||''}<h3>${esc(selected.name)}</h3></div><div class="commerce-properties">${selected.details||''}</div><p class="commerce-price">价格 <strong>${esc(selected.price)}</strong></p>${selected.button}`:'<div class="detail-empty">选择一件商品<br><small>价格与属性显示在这里</small></div>';
 return `<div class="commerce-layout"><section><div class="inventory-grid commerce-grid">${cells}${Array.from({length:Math.max(0,12-rows.length)},()=>'<div class="inventory-cell empty-cell"></div>').join('')}</div><p class="commerce-wallet">金币 <b>${g.p.gold}</b></p></section><section class="selected-detail commerce-detail" aria-live="polite" tabindex="-1">${detail}</section></div>`;
}
export function potionRow(g,id,icon,button,{price=POTIONS[id]?.cost,amount=1}={}){const p=POTIONS[id]||ITEMS[id];return {id,name:p.name+(amount>1?' ×'+amount:''),icon,details:`<p>${esc(potionSummary(id))}</p><p>持有 ${g.p.items[id]||0}</p>`,price:price+' 金',button};}
