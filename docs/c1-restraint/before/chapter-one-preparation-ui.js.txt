import {C1_RUNES,C1_CORES} from './chapter-one-expansion-data.js';
import {C1_BREWS,C1_MEDICINE} from './chapter-one-trial-runtime.js';
import {POTIONS} from './systems-data-v14.js';
import {c1State} from './chapter-one-expansion-save.js';
const button=(label,action,disabled=false)=>`<button data-c1="${action}" ${disabled?'disabled':''}>${label}</button>`;
export function preparationPanel(g,kind){const s=c1State(g).preparation,n=g.p.items[C1_MEDICINE]||0;let body=`<p>持有 ${g.p.gold} 金 · 药用精粹 ${n} 份</p>`;
 if(kind==='c1-shop'){
  body+='<h3>随身药水</h3><div class="mechanism-choices">'+Object.entries(C1_BREWS).map(([id])=>{const p=POTIONS[id];return `<article><h3>${p.name}</h3><p>${p.desc}</p>${button('购买 · '+p.cost+'金','supply:'+id,g.p.gold<p.cost)}</article>`;}).join('')+'</div>';
  if(s.approved){body+='<h3>这次到的符文</h3><p>每枚库存一件，售出后补上新货。</p><div class="mechanism-choices">'+s.stock.map(x=>{const r=C1_RUNES[x.id];return `<article><h3>${r.name}</h3><p>${({atk:'攻击',str:'力量',dex:'敏捷',vit:'体质',wis:'精神',mp:'最大法力'})[r.stat]} +${r.min}～${r.max}；可用于各类缀纹装备。</p>${button('购买 · '+r.price+'金',`stock:${x.id}:${x.serial}`,g.p.gold<r.price)}</article>`;}).join('')+'</div>';}
  return {title:'罗萨的货柜',body};
 }
 body+='<h3>配制药水</h3><p>药用精粹可从这一路的野兽和旧构装体上收集。装置备有药引与空瓶，按配方放入原料即可。</p><div class="mechanism-choices">'+Object.entries(C1_BREWS).map(([id,b])=>`<article><h3>${POTIONS[id].name}</h3><p>${POTIONS[id].desc}</p>${button(`${b.amount}份精粹＋${b.fee}金 · 合成`,`brew:${id}:${s.potionSequence+1}`,n<b.amount||g.p.gold<b.fee)}</article>`).join('')+'</div>';
 if(s.approved&&s.order){const o=s.order;body+=`<h3>核心加工订单</h3><p>本单需要药用精粹 ${o.amount} 份，完成后获得${C1_CORES[o.core].name} ×1。装置用精粹稳定核心，交付后才会列出下一单。</p>${o.accepted?button('交付材料，领取核心','coreComplete:'+o.serial,n<o.amount):button('了解并接下这份订单','coreAccept:'+o.serial)}`;}
 else body+='<p>缀纹部件还封着。薇蕾娜会在试炼汇报后说明它的用途。</p>';
 return {title:'会馆缀纹装置',body};
}
export function preparationAction(g,action){const [verb,id,serial]=action.split(':');
 if(verb==='supply'){g.c1BuySupply(id);return 'c1-shop';}
 if(verb==='stock'){g.c1BuyRune(id,Number(serial));return 'c1-shop';}
 if(verb==='brew'){g.c1Brew(id,Number(serial));return 'c1-loom';}
 if(verb==='coreAccept')return g.c1AcceptCoreOrder(Number(id))?'scene':'c1-loom';
 if(verb==='coreComplete'){g.c1CompleteCoreOrder(Number(id));return 'c1-loom';}
 return null;
}
