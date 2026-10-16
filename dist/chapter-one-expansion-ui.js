import {preparationPanel,preparationAction} from './chapter-one-preparation-ui.js';
import {C1_LOCAL_QUESTS} from './chapter-one-story-world.js';
import {experienceServicePanel,experienceServiceAction} from './rpg-experience-services-ui.js';
import {C1_OBJECTIVES} from './chapter-one-objectives.js';
import {C1_RECIPES,C1_RUNES,C1_CORES,C1_ELITES,C1_PARTS,C1_EFFECT_TEXT,C1_MAIN,C1_SIDE,C1_GEAR} from './chapter-one-expansion-data.js';
import {c1State} from './chapter-one-expansion-save.js';
const names={atk:'攻击',hp:'生命',mp:'最大法力',str:'力量',dex:'敏捷',vit:'体质',wis:'精神'};
const mapNames={c1TrialFoyer:'地下接待室',c1TrialCrypt:'二层蓄能廊',c1TrialVault:'三层封存库',c1RiversideCamp:'河畔营地',c1KilnCourt:'窑工院',hall:'灰烛会馆',road:'旧王道',grove:'溪边林地',millpath:'旧磨坊小径',echo:'回声机房',town:'白榆城',workshop:'洛缇修理铺',canal:'地下水渠',guestroom:'会馆客房',c1TrainingYard:'灰烛练武庭',c1DrillGallery:'一层旧试炼廊',c1LoomRoom:'缀纹工坊',c1NorthWalk:'北渠检修道',c1ReedKiln:'苇湾废窑'};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const button=(text,action,disabled=false)=>`<button data-c1="${action}" ${disabled?'disabled':''}>${esc(text)}</button>`;
export function c1Panel(g,kind,ui={}){const h=c1State(g);let body='',title='缀纹工坊';
 if(kind.startsWith('c1-outfit:'))({title,body}=experienceServicePanel(g,kind.slice(10),ui));
 if(['c1-loom','c1-shop'].includes(kind))({title,body}=preparationPanel(g,kind,ui));
 if(kind==='c1-drill-assist'){title='鲁恩的练习记录';body='<p>已经响过两次警铃。可以保持原节奏，或把铃绳预警延长0.3秒。奖励相同。</p>'+button('正常演练','drill:normal')+button('辅助演练 · 预警+0.3秒','drill:assist');}
 if(kind==='c1-leak-diagnosis'){title='两片符纹的差别';body='<p>西片亮得平稳，东片从接头向外偏。机器本身并没有同向偏移。</p>'+button('收紧东侧接头','leak:joint')+button('重刻西片刻槽','leak:groove');}
 if(kind==='c1-search'){title='岔路泥迹';body='<p>布片挂在断车东侧。浅车辙继续向东，较深的兽爪向北。</p>'+button('顺车辙向东','search:east')+button('追兽爪向北','search:north');}
 if(kind==='c1-night'){title='城门外的车棚';body='<p>通行纸已放好。可以继续郊外探索，也可以睡下，天亮进城。</p>'+button('天亮进城','morning');}
 if(kind==='c1-guide'){title='首章手记';body=c1Journal(g);}
 return `<div class="modal"><section class="panel"><header class="panel-head"><h2>${title}</h2><button data-act="resume">返回 ×</button></header><div class="panel-body">${body}</div></section></div>`;
}
export function c1UIAction(g,action){const prepared=preparationAction(g,action);if(prepared)return prepared;const [verb,id]=action.split(':');
 if(verb.startsWith('outfit-'))return experienceServiceAction(g,action);
 if(verb==='drill'){g.c1StartTraining('drill',id==='assist');return 'resume';}
 if(verb==='leak'){g.c1RepairLeak(id);return 'resume';}
 if(verb==='search'){g.c1SearchDirection(id);return 'resume';}
 if(verb==='morning'){g.c1Morning();return 'scene';}
 if(verb==='collect'){g.c1Collect();return 'bag';}
 if(verb==='guide')return 'c1-guide';
 return 'resume';
}
export function c1Journal(g){const h=c1State(g),quests=[...C1_MAIN,...C1_SIDE,...C1_LOCAL_QUESTS].filter(q=>g.quests[q.id]==='active'&&!['claimed','waived'].includes(h.mainStages[q.id]));return `<p>金色感叹号表示可以接取；灰色问号表示仍有事情待办；金色问号表示可以交付或继续主线交接。默认跟踪主线，也可在任务页选择支线。与委托人交谈后接取，完成后回来报告。走近路牌或门口可查看目的地。</p>${quests.length?quests.map(q=>{const goal=g.questGoal(q.id),o=C1_OBJECTIVES[q.id];return `<article class="quest"><h3>${q.type} · ${q.name}${g.c1Ready(q.id)?' · 可交付':''}</h3><p>${esc(goal?.text||'进行中')}</p><p>${esc(mapNames[goal?.map]||goal?.map||'')} · ${q.xp}经验 / ${q.gold}金</p>${o?.chance?'<p>任务材料只在接取后掉落，自动放入任务袋；不占装备背包。再次进入区域时会遇到新一轮常驻敌群。</p>':''}</article>`;}).join(''):'<p>当前没有待办委托。可以继续主线或向带金色感叹号的人交谈。</p>'}<details><summary>已办妥的首章事务</summary>${[...C1_MAIN,...C1_SIDE,...C1_LOCAL_QUESTS].filter(q=>g.quests[q.id]==='done'||h.mainStages[q.id]==='waived').map(q=>'<p>'+esc(q.name)+(h.mainStages[q.id]==='waived'?' · 旧档保留':' · 已完成')+'</p>').join('')}</details>${g.quests.c1AlchemistSamples?`<h3>命名精英</h3>${Object.entries(C1_ELITES).filter(([,e])=>e.part).map(([id,e])=>`<p>${e.name} · ${mapNames[e.map]} · 首杀样本${h.elite[id]?.firstPartGranted?'已取得':'未取得'}。可能携有专属器物；再次进入所在地可以继续挑战，已取得的样本会保留。</p>`).join('')}`:''}`;}
