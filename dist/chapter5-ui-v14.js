import {commerceGrid,potionRow,potionSummary} from './commerce-ui.js';
import {ITEMS,SKILLS} from './data-v14.js';
import {POTIONS} from './systems-data-v14.js';
import {CH5_SETS,CH5_SET_RECIPES,CH5_ALCHEMY,CH5_DRINKS,chapter5SetBonuses} from './chapter5-economy-v14.js';
const escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const button=(text,act,arg='',disabled=false)=>`<button data-ch5="${act}" data-arg="${escape(arg)}" ${disabled?'disabled':''}>${escape(text)}</button>`;
const costText=cost=>Object.entries(cost).filter(([,n])=>n).map(([id,n])=>`${id==='gold'?'金币':ITEMS[id]?.name||id} ${n}`).join(' + ');
const enough=(g,cost)=>Object.entries(cost).every(([id,n])=>(id==='gold'?g.p.gold:g.p.items[id]||0)>=n);
export function ch5FacilityHTML(g,kind,{miniItemIcon=()=>'',iconHTML=()=>'',skillDetails=()=>''}={}){
 const h=g.ch5||{},p=g.p;
 const shell=(title,body)=>`<div class="modal"><section class="panel ch5-facility"><header class="panel-head"><div><small>阙灯城 · 灯火下的片刻</small><h2>${title}</h2></div><button data-act="resume">返回 ×</button></header><div class="panel-body"><div class="summary"><span>金币 <b>${p.gold}</b></span><span>金砂 <b>${p.items.ch5GoldSand||0}</b></span><span>凝灯芯 <b>${p.items.ch5LampCore||0}</b></span><span>凝露 <b>${p.items.ch5Dew||0}</b></span></div>${body}</div></section></div>`;
 if(kind==='forge'){const set=CH5_SETS[p.cls],bonus=chapter5SetBonuses(p);return shell('格蕾娜的职业铸炉',`<p>为你的职业铸造 <b>${set?.name||'合用的装备'}</b>。格蕾娜会按你的战法选材，成品的火候要等出炉才知道。你可以先选需要的部位，再看看她的手艺。</p><div class="note-card"><b>${escape(set?.name)} · 已装备 ${bonus.count}/4 件</b><p>${escape(set?.two)}</p><p>${escape(set?.four)}</p></div>${h.claims?.freeCraft?'<p class="tip">格蕾娜答应免去下一件的金币工费。</p>':''}<div class="teaching-grid">${CH5_SET_RECIPES.map(r=>{const cost={...r.cost,...(h.claims?.freeCraft?{gold:0}:{})};return `<article class="teaching-card"><h3>${r.name}</h3><p>${costText(cost)}</p><p>已打造 ${h.crafts?.[r.id]||0} 件 · 单次生成一件，保留原有装备。</p>${button('铸造', 'craft',r.id,!p.career?.id||!enough(g,cost))}</article>`;}).join('')}</div><p class="tip">新装备收入行囊，需手动穿戴；同一套装只计不同部位。可以混穿，也可只保留两件效果。</p>`);}
 if(kind==='alchemy')return shell('弥娅的铜露调配机',`<p>按配方投入材料，即可得到所列成品。疗伤药与清醒药各自冷却7秒，互不影响。</p><div class="teaching-grid">${CH5_ALCHEMY.map(r=>`<article class="teaching-card">${miniItemIcon(r.item)}<h3>${r.name}</h3><p>${escape(ITEMS[r.item]?.desc)}</p><p>${costText(r.cost)}</p>${button('调配','alchemy',r.id,!enough(g,r.cost))}</article>`).join('')}</div><p class="tip">水院分流器收集凝露；矿庭与练场提供金砂和凝灯芯，离开地图再进入后会重新生成。</p>`);
 if(kind==='shop'){const rows=g.potionStock().map(id=>potionRow(g,id,miniItemIcon(id),button('购买','buy',id,p.gold<POTIONS[id].cost)));
 if(ITEMS.mercenaryBook){const price=g.mercenaryStudyInfoV23().price;rows.push({id:'mercenaryBook',name:ITEMS.mercenaryBook.name,icon:miniItemIcon('mercenaryBook'),details:'<p>同伴研读后学习一项可用战技。</p>',price:price+' 金',button:button('购买','buy-merc-book','',p.gold<price)});}
 return shell('行路补给',commerceGrid(g,'ch5-shop',rows));}
 if(kind==='tavern'){const active=p.ch5Drink?.remaining>0?CH5_DRINKS[p.ch5Drink.id]:null;return shell('瑟琳娜的酒单',`<p>不必把酒喝完才算客人。热饮和蜜饮也一样能暖手。</p>${active?`<p class="tip">当前：${active.name} · 剩余 ${Math.ceil(p.ch5Drink.remaining)} 秒。换一杯会覆盖旧效果。</p>`:''}${commerceGrid(g,'ch5-tavern',Object.entries(CH5_DRINKS).map(([id,d])=>({id,name:d.name,icon:miniItemIcon('mp'),details:'<p>'+escape(d.desc)+'</p>',price:d.cost+' 金',button:button('购买并饮用','drink',id,p.gold<d.cost)})))}<div class="note-card"><h3>靠窗的位子</h3><p>艾莉娅把杯子拢在掌心里，隔着窗看广场上的人。</p><div class="row">${button('倒一点温酒，问问她','tavern-talk')}${button('换成热水，陪她坐一会儿','tavern-refuse')}</div></div><p class="tip">也可以只要一杯热饮，坐一会儿再走。</p>`);}
 if(kind==='books'){const offer=h.bookOffer;return shell('工坊练习册',`<p>格蕾娜从旧抄本里挑出三份，再由你选一份。只出现你还没学过、也没带在行囊里的技法；三份候选不足时显示实际数量。</p>${offer?`<div class="teaching-grid">${offer.items.map(id=>{const i=ITEMS[id];return `<article class="teaching-card">${iconHTML(i.skill)}<h3>${escape(i.name)}</h3><p>${escape(i.desc)}</p>${skillDetails(i.skill)}${button('带走这份','book-claim',id)}</article>`;}).join('')}</div><p class="tip">本次材料已支付。关闭后保留同样的候选，选好后才能再取。</p>`:`<p>75 金 + 凝灯芯 3 · 三选一 · 只收游戏内材料</p>${button('请她挑三份','book-draw','',!enough(g,{gold:75,ch5LampCore:3}))}`}<p class="tip">学会全部可选技法后停止收取材料。领到的书放入行囊，研读后才进入技能页。</p>`);}
 if(kind==='arcade'){const a=h.arcade,labels=['左灯','中灯','右灯'];let body='<p>记住三次灯亮的顺序，再按同样的顺序敲响铜铃。每局10金，成功返18金并得一枚回铃铜券；失败无额外扣款。</p>';
  if(!a||['won','lost'].includes(a.phase)){if(a)body+=`<div class="note-card"><h3>${a.phase==='won'?'三盏灯都亮了':'最后一声没有应答'}</h3><p>${a.phase==='won'?'奖品已经放进了行囊。':'慢一点也没关系，下次可以多看一会儿。'}</p></div>`;body+=button('开始一局 · 10 金','arcade-start','',p.gold<10);}
  else if(a.phase==='show')body+=`<div class="ch5-lamp-sequence" aria-label="记忆顺序">${a.pattern.map((v,i)=>`<span><small>第${i+1}声</small><b>${labels[v]}</b></span>`).join('')}</div><p>记住以后再收起提示，没有倒计时。</p>${button('记住了，收起提示','arcade-hide')}`;
  else body+=`<p>已经答对 ${a.answers.length}/3 声，现在敲第 ${a.answers.length+1} 声。</p><div class="ch5-lamp-buttons">${labels.map((t,i)=>button(t,'arcade-answer',i)).join('')}</div>`;
  return shell('三盏回铃',body+'<p class="tip">铜券可在游艺厅西侧兑奖柜换取药品、练习册或饰品。离开与保存会保留未完成的一局。</p>');}
 if(kind==='prizes'){const coins=p.items.ch5PrizeCoin||0,rows=[
 {id:'potions',name:'行路药品',icon:miniItemIcon('hpGrand'),details:'<p>特制疗伤药 ×1：'+potionSummary('hpGrand')+'</p><p>特制清醒药 ×1：'+potionSummary('mpGrand')+'</p>',cost:2},
 {id:'book',name:'未读过的练习册',icon:miniItemIcon('mercenaryBook'),details:'<p>获得一本未掌握战技书；全部掌握后换为材料。</p>',cost:5},
 {id:'relic',name:'回铃纪念坠',icon:miniItemIcon('ch5PrizeCoin'),details:'<p>获得一件随机纪念饰品。</p>',cost:7}
 ];return shell('回铃兑奖柜',`<p>铜券 ${coins}</p>`+commerceGrid(g,'ch5-prizes',rows.map(r=>({...r,price:r.cost+' 枚铜券',button:button('兑换','prize',r.id,coins<r.cost)}))));}
 return shell('灯下的片刻','<p>这里暂时没有要办的事。</p>');
}
