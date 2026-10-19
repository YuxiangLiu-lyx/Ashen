import {potionSummary} from './commerce-ui.js';
import {C1_RUNES,C1_CORES,C1_RECIPES,C1_EFFECT_TEXT} from './chapter-one-expansion-data.js';
import {C1_BREWS,C1_MEDICINE} from './chapter-one-trial-runtime.js';
import {POTIONS} from './systems-data-v14.js';
import {c1State} from './chapter-one-expansion-save.js';
import {c1Weapons,c1Item} from './chapter-one-expansion-gear.js';
import {equipmentIconURL} from './equipment-icons.js';
const views=new WeakMap();
const view=g=>{if(!views.has(g))views.set(g,{shop:null,loom:null,rune:null,weapon:c1Weapons(g.p.cls)[0],coupon:true,preview:false,result:null,transaction:null});return views.get(g);};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const button=(label,action,disabled=false)=>`<button data-c1="${action}" ${disabled?'disabled':''}>${esc(label)}</button>`;
const names={atk:'攻击',str:'力量',dex:'敏捷',vit:'体质',wis:'精神',mp:'最大法力'};
const weaponNames={daggers:'单手短刃',sword:'单手剑',greatsword:'双手重剑',wand:'单手短杖',staff:'双手法杖'};
function icon(id,ui){
 if(POTIONS[id])return ui.iconHTML?.(id)||'<span class="vacant-icon">药</span>';
 let sheet='discovery',index=4;
 if(C1_RECIPES[id])return `<img class="gear-icon" src="${equipmentIconURL(c1Item(ui.cls||'shadow',id,'icon',ui.weapon),ui.image)}" alt="" draggable="false">`;
 else if(C1_RUNES[id]){sheet='mechanisms';index=3;}
 else if(C1_CORES[id]){sheet='mechanisms';index={c1CoreBlade:7,c1CoreShell:2,c1CoreConduit:3}[id];}
 const src=ui.image?.(sheet,index);return src?`<img class="gear-icon" src="${src}" alt="" draggable="false">`:'<span class="vacant-icon">◇</span>';
}
export function brewIngredients(g,id,ui={}){
 const b=C1_BREWS[id];if(!b)return '';
 const rows=[{id:C1_MEDICINE,name:'药用精粹',have:g.p.items[C1_MEDICINE]||0,need:b.amount,art:ui.image?.('mechanisms',3)},{id:'gold',name:'金币',have:g.p.gold,need:b.fee}];
 return `<div class="ingredient-heading"><h4>合成材料</h4><small>持有 / 需要</small></div><div class="ingredient-grid">${rows.map(r=>`<div class="ingredient-cell ${r.have<r.need?'insufficient':'sufficient'}" data-ingredient="${r.id}" aria-label="${r.name}，持有${r.have}，需要${r.need}">${r.art?`<img src="${r.art}" alt="" draggable="false">`:r.id==='gold'?'<span class="ingredient-coin" aria-hidden="true">◆</span>':'<span class="ingredient-herb" aria-hidden="true">❧</span>'}<span>${r.name}</span><strong class="ingredient-count"><b>${r.have}</b><span> / ${r.need}</span></strong>${r.have<r.need?'<small>不足</small>':''}</div>`).join('')}</div>`;
}
function grid(rows,selected,kind,ui){return `<div class="inventory-grid preparation-grid">${rows.map(x=>`<button class="inventory-cell preparation-cell ${selected===x.key?'chosen':''}" data-c1="inspect:${kind}:${x.key}" aria-label="查看${esc(x.name)}" aria-pressed="${selected===x.key}">${icon(x.icon,ui)}<span>${esc(x.name)}</span><small>${esc(x.hint||'')}</small></button>`).join('')}${Array.from({length:Math.max(0,8-rows.length)},()=>'<div class="inventory-cell empty-cell" aria-hidden="true"></div>').join('')}</div>`;}
const changes=p=>['atk','hp','mp','manaRegen','speed'].map(k=>{const label={atk:'攻击',hp:'生命',mp:'法力',manaRegen:'回蓝/秒',speed:'移速'}[k],a=p.values[0].stats[k],b=p.values[1].stats[k];return `<tr><th>${label}</th><td>${p.before[k].toFixed(1)}</td><td>${a.toFixed(1)}${a===b?'':'～'+b.toFixed(1)}</td></tr>`;}).join('');
function craftDetail(g,v,ui){
 const h=c1State(g),r=C1_RECIPES[v.loom?.slice(7)];if(!r)return '';
 const owned=Object.keys(C1_RUNES).filter(id=>g.p.items[id]>0),selectable=h.preparation.legacy?Object.keys(C1_RUNES):owned;
 if(!selectable.includes(v.rune))v.rune=selectable[0]||null;
 const u=C1_RUNES[v.rune],fee=v.coupon&&g.p.items.c1FeeCoupon?0:6,p=u?g.c1Preview(r.id,u.id,v.weapon):null;
 let body=`<div class="item-heading">${icon(r.id,ui)}<h3>${r.name}</h3></div><p>稀有装备 · 需要等级 ${r.minLevel}</p><p>攻击 +${r.atk} · 生命 +${r.hp}</p><p>${C1_EFFECT_TEXT[r.effect]}</p>`;
 if(r.slot==='weapon')body+=`<div class="row">${c1Weapons(g.p.cls).map(k=>button((v.weapon===k?'✓ ':'')+weaponNames[k],'weapon:'+k)).join('')}</div>`;
 body+='<h4>嵌入符文</h4>'+(!selectable.length?'<p>还没有可用符文。商人的货柜可以买到，取得后即可回来制作。</p>':`<div class="preparation-runes">${selectable.map(id=>`<button class="inventory-cell ${v.rune===id?'chosen':''}" data-c1="rune:${id}" aria-label="选用${C1_RUNES[id].name}">${icon(id,ui)}<span>${C1_RUNES[id].name}</span><small>×${g.p.items[id]||0}</small></button>`).join('')}</div>`);
 if(u)body+=`<p>${u.name}：${names[u.stat]} +${u.min}～${u.max}</p>`;
 body+=`<p>需要 ${C1_CORES[r.core].name} ×1（持有 ${g.p.items[r.core]||0}）${u?'、'+u.name+' ×1（持有 '+(g.p.items[u.id]||0)+'）':''}、工费 ${fee} 金。</p>`;
 if(g.p.items.c1FeeCoupon)body+=button(v.coupon?'✓ 使用免工费券':'保留免工费券','coupon');
 body+=button('比较装备属性','preview',!u);
 if(v.preview&&p)body+=`<table class="preparation-comparison"><thead><tr><th>属性</th><th>当前</th><th>装备后</th></tr></thead><tbody>${changes(p)}</tbody></table><p class="muted">符文数值在制作时确定，预览显示最低至最高值。</p>`;
 if(h.preparation.legacy&&!h.worldChanges.loomGift){v.core||=r.core;body+=`<h4>旧存档保留的试作材料</h4><div class="row">${Object.keys(C1_CORES).map(id=>button((v.core===id?'✓ ':'')+C1_CORES[id].name,'core:'+id)).join('')}</div>${button('领取自选材料与工费券','gift',!v.preview||!u)}`;}
 const enough=u&&(g.p.items[r.core]||0)>0&&(g.p.items[u.id]||0)>0&&g.p.gold>=fee;
 body+=`<div class="row">${button('确认制作','craft',!v.preview||!enough||!!v.result)}${v.result?button('开始下一次制作','nextCraft'):''}</div>`;
 if(!enough)body+='<p class="muted">材料或工费不足，可以先查看配方。</p>';
 return body;
}
export function preparationPanel(g,kind,ui={}){
 const h=c1State(g),s=h.preparation,v=view(g),shop=kind==='c1-shop',field=shop?'shop':'loom',n=g.p.items[C1_MEDICINE]||0,rows=[];ui={...ui,cls:g.p.cls,weapon:v.weapon};
 for(const [id,b]of Object.entries(C1_BREWS))rows.push({key:(shop?'supply:':'brew:')+id,name:POTIONS[id].name,icon:id,hint:shop?POTIONS[id].cost+' 金':'合成配方'});
 if(s.approved){if(shop)for(const x of s.stock)rows.push({key:`stock:${x.id}:${x.serial}`,name:C1_RUNES[x.id].name,icon:x.id,hint:C1_RUNES[x.id].price+' 金 · 1件'});
 else{if(s.order)rows.push({key:'order:'+s.order.serial,name:C1_CORES[s.order.core].name,icon:s.order.core,hint:s.order.accepted?'订单 · 待交付':'核心订单'});for(const r of Object.values(C1_RECIPES))rows.push({key:'recipe:'+r.id,name:r.name,icon:r.id,hint:'装备配方'});}}
 if(!rows.some(x=>x.key===v[field]))v[field]=null;
 const selected=rows.find(x=>x.key===v[field]);let detail='<div class="detail-empty">点选一格查看详情<br><small>用途、属性和费用会显示在这里。</small></div>';
 if(selected){const [verb,id,serial]=selected.key.split(':');detail=`<div class="item-heading">${icon(selected.icon,ui)}<h3>${selected.name}</h3></div>`;
  if(verb==='supply'||verb==='brew'){const p=POTIONS[id],b=C1_BREWS[id];detail+=`<p>${potionSummary(id)}</p><p>持有 ${g.p.items[id]||0} 瓶</p>`+(shop?button('购买 · '+p.cost+'金','supply:'+id,g.p.gold<p.cost):`${brewIngredients(g,id,ui)}${button('确认合成',`brew:${id}:${s.potionSequence+1}`,n<b.amount||g.p.gold<b.fee)}`);}
  if(verb==='stock'){const r=C1_RUNES[id];detail+=`<p>T1符文 · ${names[r.stat]} +${r.min}～${r.max}</p><p>可用于各类缀纹装备。持有 ${g.p.items[id]||0} 枚。</p><p>当前这枚售出后，货格会补上新货。</p>${button('购买 · '+r.price+'金',`stock:${id}:${serial}`,g.p.gold<r.price)}`;}
  if(verb==='order'){const o=s.order;detail+=`<p>交付药用精粹 ${o.amount} 份，取得${C1_CORES[o.core].name} ×1。</p><p>可制作：${Object.values(C1_RECIPES).filter(r=>r.core===o.core).map(r=>r.name).join('、')}。</p><p>订单会为你保留，完成后再换下一单。</p>${o.accepted?button('交付材料，领取核心','coreComplete:'+o.serial,n<o.amount):button('了解并接下这份订单','coreAccept:'+o.serial)}`;}
  if(verb==='recipe')detail=craftDetail(g,v,ui);
 }
 const face=ui.image?.(shop?'c1Merchant':'c1Loom',0),result=v.result?`<p class="affix preparation-receipt" role="status">已完成：${esc(v.result.name)}。${h.escrow.some(i=>i.id===v.result.id)?'行囊已满，成品已暂存。':'已放入行囊。'}</p>`:v.notice?`<p class="preparation-receipt" role="status">${esc(v.notice)}</p>`:'';
 const intro=shop?'药水和旅途用得上的小物。点选货格查看详情。':'配药、换取核心与缀纹制作';
 const body=`<div class="preparation-heading">${face?`<img src="${face}" alt="${shop?'商人，棕发、橄榄色外衣和皮革腰袋的女性':'会馆的小型缀纹装置'}">`:''}<div><h3>${shop?'商人':'会馆工作台'}</h3><p>${intro}</p><p>${g.p.gold} 金 · 药用精粹 ${n} 份</p></div></div>${result}<div class="preparation-layout"><section><h3>${shop?(s.approved?'药水与符文':'随身药水'):'配方与订单'}</h3>${grid(rows,v[field],field,ui)}${!shop&&!s.approved?'<p class="muted">缀纹部件尚未启用，试炼汇报后开放。</p>':''}</section><section class="selected-detail preparation-detail" aria-live="polite" tabindex="-1">${detail}</section></div>`;
 return {title:shop?'商人的货柜':'会馆缀纹装置',body};
}
export function preparationAction(g,action){
 const v=view(g),s=c1State(g).preparation,[verb,id,serial]=action.split(':');
 if(verb==='inspect'){if(!['shop','loom'].includes(id))return null;v[id]=action.split(':').slice(2).join(':');v.preview=false;v.transaction=null;return id==='shop'?'c1-shop':'c1-loom';}
 if(['recipe','rune','weapon','core'].includes(verb)){if(verb==='recipe')v.loom='recipe:'+id;else v[verb]=id;v.preview=false;v.result=null;v.transaction=null;return 'c1-loom';}
 if(verb==='coupon'){v.coupon=!v.coupon;v.preview=false;return 'c1-loom';}
 if(verb==='preview'){const recipe=v.loom?.slice(7);if(C1_RECIPES[recipe]&&v.rune){v.preview=true;v.transaction='craft:'+(c1State(g).crafting.sequence+1);c1State(g).questSteps.c1LoomBrief={...c1State(g).questSteps.c1LoomBrief,previewed:true};g.saveEvent();}return 'c1-loom';}
 if(verb==='gift'){g.c1FreeMaterials(v.core,v.rune);return 'c1-loom';}
 if(verb==='craft'){if(v.preview&&v.transaction){v.result=g.c1Craft({recipeId:v.loom?.slice(7),runeId:v.rune,weaponType:v.weapon,useCoupon:v.coupon,transactionId:v.transaction});if(!v.result)v.notice='材料、工费或位置不足，尚未扣费。';}return 'c1-loom';}
 if(verb==='nextCraft'){v.result=null;v.preview=false;v.transaction=null;v.notice=null;return 'c1-loom';}
 if(verb==='supply'){const ok=g.c1BuySupply(id);v.notice=ok?'已购入'+POTIONS[id].name+' ×1。':'购买未完成，请检查金币和位置。';return 'c1-shop';}
 if(verb==='stock'){const ok=g.c1BuyRune(id,Number(serial));v.notice=ok?'已购入'+C1_RUNES[id].name+' ×1。':'这件货物已售出，或金币不足。';return 'c1-shop';}
 if(verb==='brew'){const ok=g.c1Brew(id,Number(serial));v.notice=ok?'已配好'+POTIONS[id].name+' ×1。':'配药未完成，原料与金币未重复扣除。';return 'c1-loom';}
 if(verb==='coreAccept')return g.c1AcceptCoreOrder(Number(id))?'scene':'c1-loom';
 if(verb==='coreComplete'){const core=s.order?.core,ok=g.c1CompleteCoreOrder(Number(id));v.notice=ok?'已取得'+C1_CORES[core].name+' ×1。':'订单尚未完成，请检查材料。';return 'c1-loom';}
 return null;
}
