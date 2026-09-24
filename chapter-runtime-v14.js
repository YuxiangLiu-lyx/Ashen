import {exileTransitionV9} from './lifecycle-v14.js';
import {CHAPTER_DIALOGUES} from './chapter-dialogues-v14.js';
const C2=new Set(['post','inn','bridge','manor','spillway','exile','bridgecellar','wellcrypt']);
export function configureChapterData(dialogues,quests,items){Object.assign(dialogues,CHAPTER_DIALOGUES);Object.assign(quests,{
 relay:{name:'灰蜡封口的信',type:'主线',giver:'seline',map:'inn',desc:'离城后抵达灰石驿站。在旅店后屋见塞琳，问清枯井庄园的事。'},
 breakout:{name:'没有打开的门',type:'主线',map:'manor',desc:'穿过灰桥南沟，抵达庄园内门。警报响起后突破护卫，寻找泄水口。'},
 exile:{name:'界碑之后',type:'主线',map:'exile',desc:'灰桥被封，只能沿泄水沟向东撤离。前方的界碑后，是无人活着回来的禁地。'},
 pump:{name:'少一根连杆',type:'支线',giver:'seline',map:'inn',desc:'在灰桥南沟的坏车旁找到蓝布工具包，回旅店后院修好水泵。可选药品或皮衬绑带。警报后暂时无法返回。',xp:35,gold:25}});
 items.pumpPole={name:'蓝布包的连杆',desc:'灰石旅店水泵的铁连杆，带回给塞琳。',category:'quest'};
}
function scene(g,id,then=null){g.beginScene(id,then);}
function once(g,key,id,then=null){if(g.flags[key])return false;g.flags[key]=true;scene(g,id,then);return true;}
export function chapterRestore(g,s){if(s.version===7&&s.flags?.complete){g.flags.complete=false;g.flags.chapterOneComplete=true;g.chapter=5;g.map='post';g.p.x=680;g.p.y=660;g.pending={id:'ch2Arrival',then:'ch2_arrival'};g.quests.relay='active';g.flags.tracked=null;g.flags.mapGoal=null;}if(g.chapter>=5&&C2.has(g.map))g.flags.chapterOneComplete=true;}
export function chapterApply(g,a,stats){
 if(a==='end'){if(g.chapter!==4||g.flags.chapterOneComplete)return true;g.quests.escape='done';if(!g.flags.legacyV6Completed){g.gainXP(100);g.p.gold+=45;}g.flags.chapterOneComplete=true;g.flags.complete=false;g.flags.tracked=null;g.flags.mapGoal=null;g.chapter=5;g.quests.relay='active';g.enter('post',680,660);return true;}
 if(a==='ch2_arrival'){if(g.chapter!==5)return true;g.chapter=6;g.flags.postArrival=true;g.gainXP(20);g.flags.tracked=null;scene(g,'ch2SearchAside');return true;}
 if(a==='ch2_relay'){if(g.chapter!==6)return true;g.flags.relayRead=true;scene(g,'ch2Terms','ch2_terms');return true;}
 if(a==='ch2_terms'){if(g.chapter!==6)return true;g.chapter=7;g.quests.relay='done';g.quests.breakout='active';g.gainXP(35);g.addItem('mp');return true;}
 if(a==='ch2_inner'){if(g.chapter===7)scene(g,'ch2Alarm','ch2_alarm');return true;}
 if(a==='ch2_alarm'){if(g.chapter!==7)return true;g.chapter=8;g.flags.alarm=true;g.flags.tracked=null;g.flags.mapGoal=null;g.flags.manorWave=1;g.enemies.push(g.enemy('guard',1200,700,'ch2-alarm-1'),g.enemy('guard',970,790,'ch2-alarm-2'),g.enemy('guard',1290,815,'ch2-v9-alarm-3'));g.relocate(1110,555);g.p.invuln=1;g.say('警钟响了。护卫堵住内门，先突破井边的包围。');return true;}
 if(a==='ch2_breakout'){if(g.chapter!==9)return true;g.chapter=10;g.flags.spillOpen=true;g.quests.breakout='done';g.quests.exile='active';g.gainXP(65);g.enter('spillway',260,700);return true;}
 if(a==='ch2_target_after'){scene(g,'ch2TargetAfter','ch2_breakout');return true;}
 if(a==='ch2_cross'){if(g.chapter!==10)return true;g.flags.exileCrossed=true;g.chapter=11;g.relocate(1100,530);scene(g,'ch2PursuitStops','ch2_pursuit');return true;}
 if(a==='ch2_pursuit'){g.flags.pursuitStopped=true;g.saint={x:1020,y:560,visible:true,moving:false,angle:0};g.say('追兵停在界碑外。沿东南石阶离开他们的视线。');return true;}
 if(a==='ch2_end'){if(g.chapter!==11||g.flags.complete)return true;g.chapter=12;g.quests.exile='done';g.flags.complete=true;g.gainXP(100);g.p.gold+=35;g.emit('ending');return true;}
 if(a==='pump_accept'){if(g.chapter<8)g.quests.pump=g.quests.pump||'active';return true;}
 if(a==='pump_take'){if(g.flags.pumpTool)return true;g.flags.pumpTool=true;g.addItem('pumpPole');g.props.find(p=>p.id==='bridge-tools').used=true;return true;}
 if(a==='pump_work'){if(g.flags.pumpTool&&!g.flags.pumpFixed&&g.chapter<8){scene(g,'selineWorkReturn','pump_fixed');}return true;}
 if(a==='pump_fixed'){if(!g.flags.pumpTool||g.chapter>=8)return true;g.flags.pumpFixed=true;g.p.items.pumpPole=0;g.quests.pump=g.quests.pump||'active';scene(g,'selineWorkDone','pump_reward_menu');return true;}
 if(a==='pump_reward_menu'){if(!g.flags.pumpChoice)g.emit('mechanism',{kind:'pump'});return true;}
 if(a==='ch2_paid_rest'){if(g.chapter>=8)return true;if(g.p.gold<20){g.say('房钱还差一些。');return true;}g.p.gold-=20;g.p.hp=stats(g.p).hp;g.p.mp=stats(g.p).mp;g.say('在炉边坐了一会儿。生命与法力恢复。');return true;}
 return false;
}
export function chapterObjective(g){if(g.chapter<5)return null;if(g.chapter<=6)return {text:g.chapter===5?'走到旅店门前':'到旅店后屋，问塞琳那封信',map:g.chapter===5?'post':'inn',target:g.chapter===5?'inn':'seline'};if(g.chapter===7)return {text:'经灰桥南沟进入庄园，到东面内门前',map:'manor',target:'inner-door'};if(g.chapter===8)return {text:g.flags.manorWave===2?'突破小队长布伦与护卫的围堵':'击退井边护卫，寻找退路',map:'manor',target:g.enemies.find(e=>!e.dead&&e.squadLeader)?.id||g.enemies.find(e=>!e.dead)?.id};if(g.chapter===9)return {text:'西面的路也被封住，撤向泄水口',map:'manor',target:'spillway'};if(g.chapter===10)return {text:g.map==='exile'?'靠近前方的流放界碑':'沿泄水沟向东撤离 · 追兵会继续赶来',map:g.map==='exile'?'exile':'spillway',target:g.map==='exile'?'exile-mark':'exile'};if(g.chapter===11)return {text:'追兵停住了 · 走到东南的石阶',map:'exile',target:'exile-deep'};return {text:'第二章结束 · 雾中的旅途待续',map:null};}
export function chapterDoor(g,d){if(d.to==='chamber')return '这里没有可走的入口。';if(g.chapter>=5&&!C2.has(d.to)&&d.to!=='end')return '离开白榆城后，暂时无法返回。';if(d.gate==='ch2-road'&&g.chapter<7)return '先到后屋问清信里的事。';if(d.gate==='ch2-manor'&&g.chapter<7)return '先见驿站的接头人。';if(d.gate==='ch2-return'&&g.chapter>=8)return '桥口已被增援封住。必须突破护卫，从泄水口撤离。';if(d.gate==='ch2-spill'&&g.chapter<10)return '泄水口有铁栅。护卫正守着，暂时过不去。';if(d.gate==='ch2-sealed')return '铁栅从上面落下，回不了庄园了。';return null;}
export function chapterEnter(g,id){if(!C2.has(id))return false;if(id==='post'&&g.chapter===5){scene(g,'ch2Arrival','ch2_arrival');return true;}if(id==='bridge'&&g.chapter===7)return once(g,'bridgeSeen','ch2Bridge');if(id==='manor'&&g.chapter===7)return once(g,'courtSeen','ch2OuterCourt');if(id==='spillway'&&g.chapter===10)return once(g,'spillSeen','ch2Spillway');return false;}
export function chapterOptions(g,id){if(id==='seline'){const o=[];if(g.chapter===6)o.push({label:'那封灰蜡信。',action:'ch2:relay'});if(g.chapter<8){if(g.flags.pumpFixed&&!g.flags.pumpChoice)o.push({label:'让我看看那两样东西。',action:'ch2:pumpReward'});else if(g.flags.pumpTool&&!g.flags.pumpFixed)o.push({label:'坏车旁边捡到的，是这个？',action:'ch2:pumpReturn'});else if(!g.quests.pump)o.push({label:'院子里那台泵坏了？',action:'ch2:pumpAccept'});else if(!g.flags.pumpFixed)o.push({label:'连杆落在哪儿？',action:'scene:selineWorkProgress'});o.push({label:'歇一会儿，借个炉边的位置。 · 20 金',action:'ch2:rest'},{label:'来一瓶疗伤药。 · 12 金',action:'buyHp'},{label:'来一瓶清醒药。 · 12 金',action:'buyMp'},{label:'今天人很多？',action:'scene:'+(g.flags.pumpFixed?'selineIdleAfter':'selineIdleBefore')});}return o;}
 if(id==='bridgewatch')return [{label:'桥口还要查多久？',action:'ch2:watch'}];
 if(id==='saint'&&g.chapter>=5){return [{label:g.chapter>=10?'后面的人停住了？':g.chapter>=8?'沿着墙走。':'还要说什么？',action:'scene:'+(g.chapter>=11?'saintEscapeOnly':g.chapter>=8?'saintAlarmOnly':g.map==='inn'?'saintInnIdle':['bridge','manor'].includes(g.map)?'saintGateOnly':'saintPostIdle')}];}return null;}
export function chapterChoose(g,a){const C=a.startsWith('ch2:');if(!C)return false;const id=a.slice(4);if(id==='relay'&&g.chapter===6)scene(g,'ch2Relay','ch2_relay');else if(id==='pumpAccept'&&g.chapter<8&&!g.quests.pump)scene(g,'selineWork','pump_accept');else if(id==='pumpReturn'&&g.flags.pumpTool&&!g.flags.pumpFixed&&g.chapter<8){if(!g.quests.pump)scene(g,'selineFoundFirst','pump_work');else scene(g,'selineWorkReturn','pump_fixed');}else if(id==='pumpReward')g.emit('mechanism',{kind:'pump'});else if(id==='rest'&&g.chapter<8)scene(g,'innRestTalk','ch2_paid_rest');else if(id==='watch')scene(g,'bridgeWatchIdle');return true;}
export function chapterProp(g,id){const p=g.props.find(p=>p.id===id);if(!p||p.used||!p.action?.startsWith('ch2-'))return false;switch(p.action){
 case 'ch2-door':if(g.chapter===7){scene(g,'ch2InnerDoor','ch2_inner');}else g.say('内门紧锁，铜盘没有亮起。');break;
 case 'ch2-tools':if(!g.flags.pumpTool)scene(g,'selinePoleFound','pump_take');break;
 case 'ch2-pump':if(g.flags.pumpFixed){if(!g.flags.pumpChoice)g.emit('mechanism',{kind:'pump'});else scene(g,'selineIdleAfter');}else if(g.flags.pumpTool){scene(g,'selineWorkReturn','pump_fixed');}else scene(g,'selineWork',g.quests.pump?null:'pump_accept');break;
 case 'ch2-rest':scene(g,'innRestTalk','ch2_paid_rest');break;
 case 'ch2-paper':if(g.chapter===6)scene(g,'ch2Relay','ch2_relay');else g.say('庄园外墙与南沟标在路图上，内门没有别的入口。');break;
 case 'ch2-sign':g.beginScene('_post_sign');g.pending.lines=[['旁白','木牌指向东面的灰桥，新钉上去的布告压着一行旧字：入桥摘帽，行李开包。']];break;
 case 'ch2-sluice':if(g.flags.sluiceReleased){g.say('闸杆已经落到底，存水放尽了。');break;}g.flags.sluiceReleased=true;for(const e of g.enemies.filter(e=>!e.dead&&Math.hypot(e.x-p.x,e.y-p.y)<480)){e.slow=6;e.stun=Math.max(e.stun,1);g.effect('frost',e.x,e.y,65,'#9bced6',.5);}g.say('闸杆压下，积水冲进沟底。附近追兵暂时放慢了脚步。');g.saveEvent();break;
 case 'ch2-cache':p.used=true;g.addItem('mp');g.addItem('hp');break;
 case 'ch2-mark':if(g.chapter===10)scene(g,'ch2ExileApproach','ch2_cross');else g.say('字迹被旧刀痕划过：越界者，不得归。');break;
 case 'ch2-deep':if(g.chapter===11&&g.flags.pursuitStopped)scene(g,'ch2ExileEnd','ch2_end');else g.say('东南石阶隐进雾里。先看看界碑。');break;
 }return true;}
export function chapterEnemyKilled(g,e){if(e.id==='ch2-bren'){g.flags.brenDefeated=true;g.obtainGear({id:'quest-bren-boots',name:'巡队钉底靴',slot:'feet',rarity:'rare',atk:1,hp:14,affix:null});return true;}return false;}
export function chapterTick(g,dt){if(g.chapter===7&&g.map==='manor'&&g.p.x>910&&!g.flags.targetCutaway){once(g,'targetCutaway','ch2TargetBefore');return;}if(g.chapter===8&&g.map==='manor'&&!g.enemies.some(e=>!e.dead)){if(g.flags.manorWave===1){g.flags.manorWave=2;g.enemies.push(g.enemy('captain',850,675,'ch2-bren'),g.enemy('guard',1150,810,'ch2-wave2-guard'),g.enemy('guard',1040,560,'ch2-v9-wave2-guard'));g.say('布伦带着两名护卫从东廊赶来，挡住了退路。');g.saveEvent();}else if(g.flags.brenDefeated){g.chapter=9;g.bullets=[];g.zones=[];scene(g,'ch2Breakout','ch2_target_after');}return;}
 if(g.chapter===10&&g.map==='spillway'&&g.p.x>860&&!g.flags.spillReinforcements){g.flags.spillReinforcements=true;g.enemies.push(g.enemy('guard',350,700,'ch2-spill-late1'),g.enemy('guard',390,780,'ch2-spill-late2'));g.say('两名巡卫翻过了落栅。东面的荒地就在前方。');g.saveEvent();}
 if(g.chapter===10&&g.map==='exile'&&g.p.x>730&&!g.pending)g.requestTransition(exileTransitionV9());
}
export function takePumpReward(g,choice){if(!['medicine','wrap'].includes(choice)||!g.flags.pumpFixed||g.flags.pumpChoice||g.map!=='inn'||g.chapter>=8)return false;if(choice==='wrap'&&g.p.bag.length>=60){g.say('先在行囊里腾一格，绑带给你留着。');return false;}g.flags.pumpChoice=choice;g.complete('pump');if(choice==='medicine')g.addItem('hp',2);else g.obtainGear({id:'quest-pump-wrap',name:'皮衬绑带',slot:'hands',rarity:'rare',atk:1,hp:12,affix:null});scene(g,choice==='medicine'?'selineRewardMedicine':'selineRewardWrap');return true;}
