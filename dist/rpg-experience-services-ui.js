import {EXPERIENCE_SERVICES} from './rpg-experience-services.js';
import {equipmentPlan} from './equipment-v14.js';
import {characterStats} from './growth-v14.js';
import {CLASSES} from './data-v14.js';
const stats=p=>characterStats(p,CLASSES[p.cls]);
const selections=new WeakMap();
const view=g=>{if(!selections.has(g))selections.set(g,{selected:null,receipt:''});return selections.get(g);};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const button=(text,action,disabled=false)=>`<button data-c1="${esc(action)}" ${disabled?'disabled':''}>${esc(text)}</button>`;
const delta=(a,b)=>['atk','hp','mp','reduction'].map(k=>{const factor=k==='reduction'?100:1,d=(b[k]-a[k])*factor;return ({atk:'攻击',hp:'生命',mp:'法力',reduction:'减伤'})[k]+` ${d>=0?'+':''}${d.toFixed(1)}${k==='reduction'?'%':''}`;}).join(' · ');
function relayPanel(g,ui){
 const s=EXPERIENCE_SERVICES.seline,v=view(g),available=!!g.experienceService('seline'),stock=s.stock.map(id=>({key:'stock:'+id,id,...g.experiencePreview('seline',id)}));
 const bag=g.p.bag.map(item=>({key:'bag:'+item.id,id:item.id,item})),rows=[...stock,...bag],selected=rows.find(r=>r.key===v.selected);
 const icon=i=>{const src=ui.image?.('equipIcons',i.iconId??0);return src?`<img class="gear-icon" src="${src}" alt="" draggable="false">`:`<span class="vacant-icon">${esc({weapon:'武',chest:'衣',head:'帽',feet:'靴',hands:'手',relic:'饰'}[i.slot]||'装')}</span>`;};
 const grid=(items,kind)=>`<div class="inventory-grid preparation-grid">${items.map(r=>`<button class="inventory-cell preparation-cell ${v.selected===r.key?'chosen':''}" data-c1="outfit-inspect:seline:${esc(r.key)}" aria-label="查看${esc(r.item.name)}" aria-pressed="${v.selected===r.key}">${icon(r.item)}<span>${esc(r.item.name)}</span><small>${kind==='stock'?(r.owned?'已售出':r.item.cost+' 金'):'行囊'}</small></button>`).join('')}${Array.from({length:Math.max(0,8-items.length)},()=>'<div class="inventory-cell empty-cell" aria-hidden="true"></div>').join('')}</div>`;
 let detail='<div class="detail-empty">点选一格查看行装<br><small>查看属性和换装比较后，可以购买、装备或出售。</small></div>';
 if(selected){
  const i=selected.item,isStock=selected.key.startsWith('stock:'),plan=equipmentPlan({...g.p,level:Math.max(g.p.level,i.minLevel||1)},i),before=stats(g.p),after=stats({...g.p,gear:plan.gear});
  detail=`<div class="item-heading">${icon(i)}<h3>${esc(i.name)}</h3></div><p>需要等级 ${i.minLevel||1} · 攻击 +${i.atk||0} · 生命 +${i.hp||0}${i.experienceArmor?' · 护具减伤 '+Math.round(i.experienceArmor*100)+'%':''}</p><p>换装后：${delta(before,after)}</p>`;
  if(isStock){detail+=button(selected.owned?'已售出':'购买 · '+i.cost+'金','outfit-buy:seline:'+selected.id,!available||selected.owned||g.p.gold<i.cost||g.p.level<(i.minLevel||1)||g.p.bag.length>=60);
   if(!selected.owned&&g.p.bag.length>=60)detail+='<p>行囊已满，可以先出售一件装备。</p>';
  }else detail+=button('换上','outfit-equip:seline:'+i.id,!available||g.p.level<(i.minLevel||1))+button('出售 · '+g.experienceSellPrice(i)+'金','outfit-sell:seline:'+i.id,!available||!g.canSell(i));
 }
 const cost=g.experienceRestCost('seline');
 return {title:s.title,body:`<p>车队留下的寄卖行装。药品在旁边的药箱里。</p><p>手边有 ${g.p.gold} 金。</p>${!available?'<p>回到柜台旁才能交易。</p>':''}${v.receipt?`<p class="preparation-receipt" role="status">${esc(v.receipt)}</p>`:''}<div class="preparation-layout"><section><h3>寄卖货格</h3>${grid(stock,'stock')}<h3>行囊里的装备</h3>${bag.length?grid(bag,'bag'):'<p>行囊里没有备用装备。</p>'}</section><section class="selected-detail preparation-detail" aria-live="polite" tabindex="-1">${detail}</section></div><h3>炉边歇脚</h3>${button('恢复生命与法力 · '+(cost?cost+'金':'不收费'),'outfit-rest:seline:',!available||g.p.gold<cost||g.p.hp>=stats(g.p).hp&&g.p.mp>=stats(g.p).mp)}`};
}
export function experienceServicePanel(g,vendor,ui={}){const s=EXPERIENCE_SERVICES[vendor];if(!s)return {title:'行装柜',body:'<p>这里没有货架。</p>'};if(vendor==='seline')return relayPanel(g,ui);const available=!!g.experienceService(vendor),key=verb=>'outfit-'+verb+':'+vendor+':';
 let body=(vendor==='seline'?'<p>这些行装是过路车队留下寄卖的，塞琳按件收钱。药品仍在旁边的药箱里。</p>':'')+`<p>手边有 ${g.p.gold} 金。买好的行装会放进行囊，可在这里换上。</p>${!available?'<p>请先回到柜台旁。</p>':''}`;
 body+=s.stock.map(id=>{const p=g.experiencePreview(vendor,id),i=p.item;return `<article class="mechanism-choice"><h3>${esc(i.name)} · ${i.cost} 金</h3><p>需等级 ${i.minLevel} · 换装后：${delta(p.before,p.after)}</p><p>攻击 +${i.atk}，生命 +${i.hp}${i.experienceArmor?'，护具减伤 +'+Math.round(i.experienceArmor*100)+'%':''}</p>${button(p.owned?'已购入':'购买',key('buy')+id,!available||p.owned||g.p.gold<i.cost||g.p.level<i.minLevel||g.p.bag.length>=60)}</article>`;}).join('');
 if(s.potions)body+='<h3>药品</h3>'+button('疗伤药 · 12金',key('potion')+'hp',!available||g.p.gold<12)+button('清醒药 · 12金',key('potion')+'mp',!available||g.p.gold<12);
 if(s.rest!==undefined){const cost=g.experienceRestCost(vendor);body+='<h3>歇脚</h3>'+button('休息，恢复生命与法力 · '+(cost?cost+'金':'不收费'),key('rest'),!available||g.p.gold<cost);}
 body+='<h3>行囊里的装备</h3>'+g.p.bag.map(i=>`<article><h4>${esc(i.name)}</h4>${button('换上',key('equip')+i.id,!available||g.p.level<(i.minLevel||1))}${button('出售 · '+g.experienceSellPrice(i)+'金',key('sell')+i.id,!available||!g.canSell(i))}</article>`).join('');
 return {title:s.title,body};
}
export function experienceServiceAction(g,action){const [verb,vendor,...parts]=action.split(':'),id=parts.join(':');if(!verb.startsWith('outfit-'))return null;
 const v=view(g);
 if(verb==='outfit-inspect'&&vendor==='seline'){v.selected=id;return 'c1-outfit:seline';}
 if(verb==='outfit-buy'){
  const ok=g.experienceBuy(vendor,id);
  if(vendor==='seline'){v.receipt=ok?'已购入'+g.experiencePreview(vendor,id).item.name+'，放入行囊。':'购买未完成，请检查金币、等级和行囊。';if(ok)v.selected='bag:outfit-'+vendor+'-'+id;}
  else if(!ok)g.say('还不能买下这件行装。请检查等级、钱袋和行囊。');
 }
 if(verb==='outfit-potion')g.experienceBuyPotion(vendor,id);
 if(verb==='outfit-equip'){const name=g.p.bag.find(i=>i.id===id)?.name,ok=g.experienceEquip(vendor,id);if(vendor==='seline')v.receipt=ok?'已换上'+name+'。':'暂时不能换上这件装备。';}
 if(verb==='outfit-sell'){const item=g.p.bag.find(i=>i.id===id),price=g.experienceSellPrice(item),ok=g.experienceSell(vendor,id);if(vendor==='seline')v.receipt=ok?'已出售'+item.name+'，得到'+price+'金。':'这件物品未售出。';}
 if(verb==='outfit-rest'&&g.experienceRest(vendor))return 'scene';
 return 'c1-outfit:'+vendor;
}
