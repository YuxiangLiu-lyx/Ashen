import {commerceGrid,potionRow,selectCommerce} from './commerce-ui.js';
import {equipmentDesign} from './equipment-icons.js';
import {EXPERIENCE_SERVICES} from './rpg-experience-services.js';
const selections=new WeakMap();
const view=g=>{if(!selections.has(g))selections.set(g,{receipt:''});return selections.get(g);};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const button=(text,action,disabled=false)=>`<button data-c1="${esc(action)}" ${disabled?'disabled':''}>${esc(text)}</button>`;
const delta=(a,b)=>['atk','hp','mp','reduction'].map(k=>{const factor=k==='reduction'?100:1,d=(b[k]-a[k])*factor;return ({atk:'攻击',hp:'生命',mp:'法力',reduction:'减伤'})[k]+` ${d>=0?'+':''}${d.toFixed(1)}${k==='reduction'?'%':''}`;}).join(' · ');
export function experienceServicePanel(g,vendor,ui={}){
 const s=EXPERIENCE_SERVICES[vendor];if(!s)return {title:'行装柜',body:'<p>这里没有货架。</p>'};
 const available=!!g.experienceService(vendor),key=verb=>'outfit-'+verb+':'+vendor+':';
 const icon=i=>{const art=equipmentDesign(i),src=ui.image?.(art.sheet,art.index);return src?`<img class="gear-icon" src="${src}" alt="">`:'';};
 const rows=s.stock.map(id=>{const p=g.experiencePreview(vendor,id),i=p.item;return {id,name:i.name,icon:icon(i),quality:i.rarity,price:i.cost+' 金',details:`<p>需要等级 ${i.minLevel}</p><p>攻击 +${i.atk||0} · 生命 +${i.hp||0}${i.experienceArmor?' · 减伤 '+Math.round(i.experienceArmor*100)+'%':''}</p><p>换装后：${delta(p.before,p.after)}</p>`,button:button(p.owned?'已售出':'购买',key('buy')+id,!available||p.owned||g.p.gold<i.cost||g.p.level<i.minLevel||g.p.bag.length>=60)};});
 if(s.potions)for(const id of ['hp','mp'])rows.push(potionRow(g,id,`<span class="commerce-potion ${id}"></span>`,button('购买',key('potion')+id,!available||g.p.gold<12),{price:12}));
 const receipt=view(g).receipt;let body=(!available?'<p>回到柜台旁才能交易。</p>':'')+commerceGrid(g,'c1-outfit:'+vendor,rows)+(receipt?'<p role="status">'+esc(receipt)+'</p>':'');
 if(s.rest!==undefined){const cost=g.experienceRestCost(vendor);body+='<h3>歇脚</h3>'+button('恢复生命与法力 · '+(cost?cost+' 金':'不收费'),key('rest'),!available||g.p.gold<cost);}
 body+=`<details class="commerce-owned" ${receipt?'open':''}><summary>行囊里的装备</summary>`+g.p.bag.map(i=>`<article class="commerce-owned-item">${icon(i)}<b>${esc(i.name)}</b>${button('换上',key('equip')+i.id,!available||g.p.level<(i.minLevel||1))}${button('出售 · '+g.experienceSellPrice(i)+' 金',key('sell')+i.id,!available||!g.canSell(i))}</article>`).join('')+'</details>';
 return {title:s.title,body};
}
export function experienceServiceAction(g,action){const [verb,vendor,...parts]=action.split(':'),id=parts.join(':');if(!verb.startsWith('outfit-'))return null;
 const v=view(g);
 if(verb==='outfit-inspect'){selectCommerce(g,'c1-outfit:'+vendor,id.replace(/^stock:/,''));return 'c1-outfit:'+vendor;}
 if(verb==='outfit-buy'){const ok=g.experienceBuy(vendor,id);v.receipt=ok?'已购入'+g.experiencePreview(vendor,id).item.name+'，放入行囊。':'购买未完成，请检查金币、等级和行囊。';}
 if(verb==='outfit-potion'){const ok=g.experienceBuyPotion(vendor,id);v.receipt=ok?'药品已放入行囊。':'金币不足或不在柜台附近。';}
 if(verb==='outfit-equip'){const name=g.p.bag.find(i=>i.id===id)?.name,ok=g.experienceEquip(vendor,id);v.receipt=ok?'已换上'+name+'。':'暂时不能换上这件装备。';}
 if(verb==='outfit-sell'){const item=g.p.bag.find(i=>i.id===id),price=g.experienceSellPrice(item),ok=g.experienceSell(vendor,id);v.receipt=ok?'已出售'+item.name+'，得到'+price+'金。':'这件物品未售出。';}
 if(verb==='outfit-rest'&&g.experienceRest(vendor))return 'scene';
 return 'c1-outfit:'+vendor;
}
