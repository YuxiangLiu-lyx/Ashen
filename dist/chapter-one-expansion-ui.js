import {C1_LOCAL_QUESTS} from './chapter-one-story-world.js';
import {C1_OBJECTIVES} from './chapter-one-objectives.js';
import {C1_RECIPES,C1_RUNES,C1_CORES,C1_ELITES,C1_PARTS,C1_EFFECT_TEXT,C1_MAIN,C1_SIDE,C1_GEAR} from './chapter-one-expansion-data.js';
import {c1State} from './chapter-one-expansion-save.js';
import {c1Weapons} from './chapter-one-expansion-gear.js';
const names={atk:'攻击',hp:'生命',mp:'最大法力',str:'力量',dex:'敏捷',vit:'体质',wis:'精神'};
const mapNames={c1TrialFoyer:'地下接待室',c1TrialCrypt:'二层蓄能廊',c1TrialVault:'三层封存库',c1RiversideCamp:'河畔营地',c1KilnCourt:'窑工院',hall:'灰烛会馆',road:'旧王道',grove:'溪边林地',millpath:'旧磨坊小径',echo:'回声机房',town:'白榆城',workshop:'洛缇修理铺',canal:'地下水渠',guestroom:'会馆客房',c1TrainingYard:'灰烛练武庭',c1DrillGallery:'一层旧试炼廊',c1LoomRoom:'缀纹工坊',c1NorthWalk:'北渠检修道',c1ReedKiln:'苇湾废窑'};
const views=new WeakMap(),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const button=(text,action,disabled=false)=>`<button data-c1="${action}" ${disabled?'disabled':''}>${esc(text)}</button>`;
const view=g=>{if(!views.has(g))views.set(g,{recipe:'c1LoomWeapon',rune:'c1RuneEdge',weapon:c1Weapons(g.p.cls)[0],coupon:true,core:'c1CoreBlade',result:null,preview:false,transaction:null});return views.get(g);};
const delta=(before,after)=>['atk','hp','mp','manaRegen','speed'].map(k=>`${({atk:'攻击',hp:'生命',mp:'法力上限',manaRegen:'每秒回蓝',speed:'移速'})[k]} ${after[k].toFixed(2)}（${after[k]-before[k]>=0?'+':''}${(after[k]-before[k]).toFixed(2)}）`).join(' · ');
export function c1Panel(g,kind){const h=c1State(g),v=view(g);let body='',title='缀纹工坊';
 if(kind==='c1-loom'){
  const r=C1_RECIPES[v.recipe],u=C1_RUNES[v.rune],p=g.c1Preview(v.recipe,v.rune,v.weapon);
  body=`<p>核心稳定基础，符文只浮动一项。无失败率，无额外随机附魔。工费含胚料。</p><h3>1 · 配方</h3><div class="row">${Object.values(C1_RECIPES).map(r=>button(r.name,'recipe:'+r.id)).join('')}</div><p>已选：${r.name} · ${C1_CORES[r.core].name} · 蓝色 · 需等级${r.minLevel}</p>${r.slot==='weapon'?`<div class="row">${c1Weapons(g.p.cls).map(k=>button(({daggers:'单手短刃',sword:'单手剑',greatsword:'双手重剑',wand:'单手短杖',staff:'双手法杖'})[k],'weapon:'+k)).join('')}</div>`:''}<h3>2 · T1符文</h3><div class="row">${Object.values(C1_RUNES).map(r=>button(r.name+'（持有'+(g.p.items[r.id]||0)+'）','rune:'+r.id)).join('')}</div><p>当前${u.name}：${names[u.stat]} +${u.min}～${u.max}，以实际制作为准。</p><p>固定基础：攻击+${r.atk}、生命+${r.hp}；${C1_EFFECT_TEXT[r.effect]}</p>${button('比较装备后的真实属性','preview')} ${button(v.coupon?'使用免工费券':'保留券，支付6金','coupon')}<p>完整成本：${C1_CORES[r.core].name} ×1（${g.p.items[r.core]||0}）＋${u.name} ×1（${g.p.items[v.rune]||0}）＋${v.coupon&&g.p.items.c1FeeCoupon?0:6}金；当前${g.p.gold}金。${v.coupon&&g.p.items.c1FeeCoupon?'消耗一次免工费券。':''}</p>`;
  if(v.preview&&p)body+=`<section class="skill-math"><h3>最低值装备后</h3><p>${delta(p.before,p.values[0].stats)}</p><h3>最高值装备后</h3><p>${delta(p.before,p.values[1].stats)}</p><p>预览包含体质与精神派生，固定效果同组取最高。正式制作时才抽值。</p></section>`;
  if(!h.worldChanges.loomGift)body+=`<h3>试作材料 · 本存档一次</h3><p>看完预览后，自选核心和当前符文，领取一张免工费券。可以带走，不必当场制作。</p><div class="row">${Object.entries(C1_CORES).map(([id,t])=>button(t.name,'core:'+id)).join('')}</div><p>选择：${C1_CORES[v.core].name}＋${u.name}</p>${button('领取自选材料与工费券','gift',!v.preview)}`;
  body+=`<div class="row">${button('确认制作','craft',!v.preview||!!v.result)}${v.result?button('开始下一次制作','nextCraft'):''}</div><p>背包 ${g.p.bag.length}/60；满包时成品保存在待领取区，材料只扣一次。</p>`;
  if(v.result)body+=`<p class="affix">已完成：${esc(v.result.name)} · ${C1_RUNES[v.result.c1Rune.id].name} +${v.result.c1Rune.value}。${h.escrow.some(i=>i.id===v.result.id)?'背包已满，已安全暂存。':'已放入背包。'}</p>`;
 }
 if(kind==='c1-shop'){
  title='罗萨的符文柜';body=`<p>首章只售T1。更多核心来自渠鼠符片、废窑蝠群与可重复沿线讨伐；不需要精英材料。</p><p>当前${g.p.gold}金</p><div class="mechanism-choices">${Object.values(C1_RUNES).map(r=>`<article><h3>${r.name} · T1</h3><p>${names[r.stat]} +${r.min}～${r.max}；六种配方通用</p>${button('购买 · '+r.price+'金','buy:'+r.id,g.p.gold<r.price)} ${button('出售一枚 · '+Math.floor(r.price/4)+'金','sellRune:'+r.id,!(g.p.items[r.id]>0))}</article>`).join('')}</div><h3>三个未用核心换一个自选核心</h3><p>兑换按刃型、壳型、导型依次取出三枚，确认前显示；不会收取旧机芯。</p><p>${Object.entries(C1_CORES).map(([id,c])=>c.name+' ×'+(g.p.items[id]||0)).join(' · ')}</p>${Object.entries(C1_CORES).map(([id,c])=>button('换取'+c.name,'exchangePreview:'+id)).join('')}`;
  if(v.exchange){body+=`<p>将交出：${v.exchange.selected.map(id=>C1_CORES[id].name).join('、')}；换取${C1_CORES[v.exchange.target].name}。</p>${button('确认兑换','exchange')}`;}
 }
 if(kind==='c1-drill-assist'){title='鲁恩的练习记录';body='<p>已经响过两次警铃。可以保持原节奏，或把铃绳预警延长0.3秒。奖励相同。</p>'+button('正常演练','drill:normal')+button('辅助演练 · 预警+0.3秒','drill:assist');}
 if(kind==='c1-leak-diagnosis'){title='两片符纹的差别';body='<p>西片亮得平稳，东片从接头向外偏。机器本身并没有同向偏移。</p>'+button('收紧东侧接头','leak:joint')+button('重刻西片刻槽','leak:groove');}
 if(kind==='c1-search'){title='岔路泥迹';body='<p>布片挂在断车东侧。浅车辙继续向东，较深的兽爪向北。</p>'+button('顺车辙向东','search:east')+button('追兽爪向北','search:north');}
 if(kind==='c1-night'){title='城门外的车棚';body='<p>通行纸已放好。可以继续郊外探索，也可以睡下，天亮进城。</p>'+button('天亮进城','morning');}
 if(kind==='c1-guide'){title='首章手记';body=c1Journal(g);}
 return `<div class="modal"><section class="panel"><header class="panel-head"><h2>${title}</h2><button data-act="resume">返回 ×</button></header><div class="panel-body">${body}</div></section></div>`;
}
export function c1UIAction(g,action){const v=view(g),[verb,id]=action.split(':');
 if(['recipe','rune','weapon','core'].includes(verb)){v[verb]=id;v.preview=false;v.result=null;v.transaction=null;return 'c1-loom';}
 if(verb==='drill'){g.c1StartTraining('drill',id==='assist');return 'resume';}
 if(verb==='coupon'){v.coupon=!v.coupon;return 'c1-loom';}
 if(verb==='preview'){v.preview=true;v.transaction='craft:'+(c1State(g).crafting.sequence+1);c1State(g).questSteps.c1LoomBrief={...c1State(g).questSteps.c1LoomBrief,previewed:true};g.saveEvent();return 'c1-loom';}
 if(verb==='gift'){g.c1FreeMaterials(v.core,v.rune);return 'c1-loom';}
 if(verb==='craft'){v.result=g.c1Craft({recipeId:v.recipe,runeId:v.rune,weaponType:v.weapon,useCoupon:v.coupon,transactionId:v.transaction});if(!v.result)g.say('材料、工费或位置不满足，尚未扣费。');return 'c1-loom';}
 if(verb==='nextCraft'){v.result=null;v.preview=false;v.transaction=null;return 'c1-loom';}
 if(verb==='buy'){g.c1BuyRune(id);return 'c1-shop';}
 if(verb==='sellRune'){if(C1_RUNES[id]&&g.c1AtService('rosa')&&g.p.items[id]>0){g.p.items[id]--;g.p.gold+=Math.floor(C1_RUNES[id].price/4);g.saveEvent();}return 'c1-shop';}
 if(verb==='exchangePreview'){const selected=[];for(const key of Object.keys(C1_CORES))for(let n=0;n<(g.p.items[key]||0)&&selected.length<3;n++)selected.push(key);if(selected.length===3)v.exchange={selected,target:id};else g.say('还需要三个未用核心。');return 'c1-shop';}
 if(verb==='exchange'){if(v.exchange)g.c1Exchange(v.exchange.target,v.exchange.selected);v.exchange=null;return 'c1-shop';}
 if(verb==='leak'){g.c1RepairLeak(id);return 'resume';}
 if(verb==='search'){g.c1SearchDirection(id);return 'resume';}
 if(verb==='morning'){g.c1Morning();return 'scene';}
 if(verb==='collect'){g.c1Collect();return 'bag';}
 if(verb==='guide')return 'c1-guide';
 return 'resume';
}
export function c1Journal(g){const h=c1State(g),quests=[...C1_MAIN,...C1_SIDE,...C1_LOCAL_QUESTS].filter(q=>g.quests[q.id]==='active'&&!['claimed','waived'].includes(h.mainStages[q.id]));return `<p>金色感叹号表示可以接取；灰色问号表示仍有事情待办；金色问号表示可以交付或继续主线交接。默认跟踪主线，也可在任务页选择支线。与委托人交谈后接取，完成后回来报告。右上角列出出口方位，走近路牌或门口可查看目的地。</p>${quests.length?quests.map(q=>{const goal=g.questGoal(q.id),o=C1_OBJECTIVES[q.id];return `<article class="quest"><h3>${q.type} · ${q.name}${g.c1Ready(q.id)?' · 可交付':''}</h3><p>${esc(goal?.text||'进行中')}</p><p>${esc(mapNames[goal?.map]||goal?.map||'')} · ${q.xp}经验 / ${q.gold}金</p>${o?.chance?'<p>任务材料只在接取后掉落，自动放入任务袋；不占装备背包。再次进入区域时会遇到新一轮常驻敌群。</p>':''}</article>`;}).join(''):'<p>当前没有待办委托。可以继续主线或向带金色感叹号的人交谈。</p>'}<details><summary>已办妥的首章事务</summary>${[...C1_MAIN,...C1_SIDE,...C1_LOCAL_QUESTS].filter(q=>g.quests[q.id]==='done'||h.mainStages[q.id]==='waived').map(q=>'<p>'+esc(q.name)+(h.mainStages[q.id]==='waived'?' · 旧档保留':' · 已完成')+'</p>').join('')}</details>${g.quests.c1AlchemistSamples?`<h3>命名精英</h3>${Object.entries(C1_ELITES).map(([id,e])=>`<p>${e.name} · ${mapNames[e.map]} · 首杀样本${h.elite[id]?.firstPartGranted?'已取得':'未取得'}。可能携有专属器物；再次进入所在地可以继续挑战，已取得的样本会保留。</p>`).join('')}`:''}`;}
