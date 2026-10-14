import {EXPERIENCE_SERVICES} from './rpg-experience-services.js';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const button=(text,action,disabled=false)=>`<button data-c1="${esc(action)}" ${disabled?'disabled':''}>${esc(text)}</button>`;
const delta=(a,b)=>['atk','hp','mp','reduction'].map(k=>{const factor=k==='reduction'?100:1,d=(b[k]-a[k])*factor;return ({atk:'攻击',hp:'生命',mp:'法力',reduction:'减伤'})[k]+` ${d>=0?'+':''}${d.toFixed(1)}${k==='reduction'?'%':''}`;}).join(' · ');
export function experienceServicePanel(g,vendor){const s=EXPERIENCE_SERVICES[vendor];if(!s)return {title:'行装柜',body:'<p>这里没有货架。</p>'};const available=!!g.experienceService(vendor),key=verb=>'outfit-'+verb+':'+vendor+':';
 let body=(vendor==='seline'?'<p>这些行装是过路车队留下寄卖的，塞琳按件收钱。药品仍在旁边的药箱里。</p>':'')+`<p>手边有 ${g.p.gold} 金。买好的行装会放进行囊，可在这里换上。</p>${!available?'<p>请先回到柜台旁。</p>':''}`;
 body+=s.stock.map(id=>{const p=g.experiencePreview(vendor,id),i=p.item;return `<article class="mechanism-choice"><h3>${esc(i.name)} · ${i.cost} 金</h3><p>需等级 ${i.minLevel} · 换装后：${delta(p.before,p.after)}</p><p>攻击 +${i.atk}，生命 +${i.hp}${i.experienceArmor?'，护具减伤 +'+Math.round(i.experienceArmor*100)+'%':''}</p>${button(p.owned?'已购入':'购买',key('buy')+id,!available||p.owned||g.p.gold<i.cost||g.p.level<i.minLevel||g.p.bag.length>=60)}</article>`;}).join('');
 if(s.potions)body+='<h3>药品</h3>'+button('疗伤药 · 12金',key('potion')+'hp',!available||g.p.gold<12)+button('清醒药 · 12金',key('potion')+'mp',!available||g.p.gold<12);
 if(s.rest!==undefined){const cost=g.experienceRestCost(vendor);body+='<h3>歇脚</h3>'+button('休息，恢复生命与法力 · '+(cost?cost+'金':'不收费'),key('rest'),!available||g.p.gold<cost);}
 body+='<h3>行囊里的装备</h3>'+g.p.bag.map(i=>`<article><h4>${esc(i.name)}</h4>${button('换上',key('equip')+i.id,!available||g.p.level<(i.minLevel||1))}${button('出售 · '+g.experienceSellPrice(i)+'金',key('sell')+i.id,!available||!g.canSell(i))}</article>`).join('');
 return {title:s.title,body};
}
export function experienceServiceAction(g,action){const [verb,vendor,...parts]=action.split(':'),id=parts.join(':');if(!verb.startsWith('outfit-'))return null;
 if(verb==='outfit-buy'&&!g.experienceBuy(vendor,id))g.say('还不能买下这件行装。请检查等级、钱袋和行囊。');
 if(verb==='outfit-potion')g.experienceBuyPotion(vendor,id);
 if(verb==='outfit-equip')g.experienceEquip(vendor,id);
 if(verb==='outfit-sell')g.experienceSell(vendor,id);
 if(verb==='outfit-rest'&&g.experienceRest(vendor))return 'scene';
 return 'c1-outfit:'+vendor;
}
