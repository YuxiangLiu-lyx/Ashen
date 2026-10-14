import {C3_GEAR_UPGRADES,C3_SCENES,C3_DEFERRED} from './rpg-chapter-three-data.js';
import {CH3_GEAR} from './chapter3-runtime-v14.js';
import {experienceSceneSafe} from './rpg-experience-triggers.js';
const inChapter=g=>g.chapter>=12&&g.chapter<21;
function upgrade(item){const row=C3_GEAR_UPGRADES[item?.id];if(!row)return;for(const k of ['atk','hp'])if(row[k]!==undefined)item[k]=Math.max(item[k]||0,row[k]);if(row.attrs){item.attrs||={};for(const [k,v]of Object.entries(row.attrs))item.attrs[k]=Math.max(item.attrs[k]||0,v);}}
export function installChapterThreeExperience(RPG,{DIALOGUES,stats}){
 Object.assign(DIALOGUES,C3_SCENES);for(const item of Object.values(CH3_GEAR))upgrade(item);
 const P=RPG.prototype,old={};for(const k of ['restore','beginScene','update','choose','npcOptions','apply','canDoor','hellAction','gainXP'])old[k]=P[k];
 // A projectile may earn XP after fatal damage in the same tick. Keep the death
 // state; living characters retain the chapter's normal level-up recovery.
 P.gainXP=function(...a){const actor=this.p,dead=inChapter(this)&&actor.hp<=0,v=old.gainXP.apply(this,a);if(dead&&this.p===actor)actor.hp=0;return v;};
 P.restore=function(...a){const v=old.restore.apply(this,a);for(const p of [this.p,this.ch3?.frozenHero,this.ch3?.saintBuild,this.ch3?.saintActor].filter(Boolean))for(const i of [...Object.values(p.gear),...p.bag])upgrade(i);for(const i of this.pendingRewards||[])upgrade(i);return v;};
 P.beginScene=function(id,then){const row=C3_DEFERRED[id];if(inChapter(this)&&row&&this.map===row[0]&&!experienceSceneSafe(this)){
   const q=this.ch3.experienceScenes||(this.ch3.experienceScenes=[]);if(!q.includes(id))q.push(id);this.saveEvent();return false;
  }return old.beginScene.call(this,id,then);};
 P.update=function(...a){if(inChapter(this)&&experienceSceneSafe(this)){const q=this.ch3?.experienceScenes||[],i=q.findIndex(id=>C3_DEFERRED[id]?.[0]===this.map);if(i>=0){const [id]=q.splice(i,1);old.beginScene.call(this,id,C3_DEFERRED[id][1]);this.saveEvent();return;} }return old.update.apply(this,a);};
 P.canDoor=function(d){if(inChapter(this)&&this.ch3?.experienceScenes?.some(id=>C3_DEFERRED[id]?.[0]===this.map))return this.map==='hellWall'?'先摆脱身边的追兵，伤者还不能移动。':'还有东西追在附近，先找个安全的地方停一下。';return old.canDoor.call(this,d);};
 P.c3AtDoctor=function(){const n=this.npcs.find(n=>n.id==='doctor');return inChapter(this)&&this.map==='hellCamp'&&n&&this.p.hp>0&&!this.pending&&!this.transition&&!this.enemies.some(e=>!e.dead)&&!this.bullets.some(b=>b.friendly===false)&&Math.hypot(n.x-this.p.x,n.y-this.p.y)<170&&this.clearLine(this.p,n,false);};
 P.npcOptions=function(id){const rows=old.npcOptions.call(this,id);if(id==='doctor'&&inChapter(this)){for(const r of rows)if(r.action==='ch3:rest'&&this.ch3?.stage==='medicine')r.label='坐下处理伤口。 · 寻药期间不收费';if(this.quests.v12WarmHerbs==='done')rows.push({label:'配一瓶中型疗伤药。 · 余温草2份、8金',action:'c3:brewMedicine',questState:'service'});}return rows;};
 P.choose=function(a){if(a==='c3:brewMedicine'){if(!this.c3AtDoctor()||this.quests.v12WarmHerbs!=='done'||this.p.gold<8||(this.p.items.emberHerb||0)<2)return false;this.ch3.experienceBrewPending=true;this.beginScene('c3BrewMedicine','c3:brewMedicine');this.saveEvent();return true;}
  if(a==='ch3:rest'){if(!this.c3AtDoctor())return false;const s=stats(this.p);if(this.p.hp>=s.hp&&this.p.mp>=s.mp)return false;}return old.choose.call(this,a);};
 P.apply=function(a){const id=typeof a==='string'?a:a?.id;
  if(id==='c3:brewMedicine'){const authorized=this.ch3?.experienceBrewPending;this.ch3.experienceBrewPending=false;if(!authorized||!this.c3AtDoctor()||this.quests.v12WarmHerbs!=='done'||this.p.gold<8||(this.p.items.emberHerb||0)<2)return false;this.p.gold-=8;this.p.items.emberHerb-=2;this.addItem('hpMedium');this.saveEvent();return true;}
  const was=this.quests.v12WarmHerbs==='done',v=old.apply.call(this,a);if(id==='v12q:claim:v12WarmHerbs'&&!was&&this.quests.v12WarmHerbs==='done')this.beginScene('c3HerbMedicine');return v;
 };
 // A forged item remains claimable in pendingRewards if the bag is full (core contract).
 P.hellAction=function(a,arg){if(inChapter(this)&&['craft','draw','offer','dismantle'].includes(a)){
   if(this.map!=='hellWorkshop'||this.pending||this.transition||this.p.hp<=0||this.enemies.some(e=>!e.dead)||this.bullets.some(b=>b.friendly===false))return false;
   const anchors=a==='draw'||a==='offer'?this.props.filter(p=>p.id==='soul-wheel'):this.props.filter(p=>p.id==='hell-bench');
   const people=this.npcs.filter(n=>a==='draw'||a==='offer'?['drawkeeper','mechanist'].includes(n.id):n.id==='mechanist');
   if(![...anchors.map(p=>({x:p.interactX??p.x,y:p.interactY??p.y})),...people].some(p=>Math.hypot(this.p.x-p.x,this.p.y-p.y)<190&&this.clearLine(this.p,p,false)))return false;
  }return old.hellAction.call(this,a,arg);};
}
