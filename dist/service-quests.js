import {C1_QUESTS} from './chapter-one-expansion-data.js';
import {C1_GIVERS,C1_NPC_NAMES} from './chapter-one-objectives.js';
import {STAGING} from './staging-v14.js';
import {SERVICE_QUEST_DIALOGUES} from './service-quest-dialogues.js';
export function installServiceQuests(RPG,{MAPS,QUESTS,DIALOGUES}){
 Object.assign(DIALOGUES,SERVICE_QUEST_DIALOGUES);
 const hunter={id:'c1hunter',name:'赏金猎人',x:855,y:385,angle:Math.PI/2,sprite:4,serviceRole:'bountyHunter'};
 if(!MAPS.hall.npcs.some(n=>n.id===hunter.id))MAPS.hall.npcs.push(hunter);
 C1_NPC_NAMES.c1hunter='赏金猎人';C1_GIVERS.c1EliteHunt='c1hunter';
 for(const table of [C1_QUESTS,QUESTS])Object.assign(table.c1EliteHunt,{target:'c1hunter',giver:'c1hunter'});
 QUESTS.c1EliteHunt.desc=QUESTS.c1EliteHunt.desc.replace('鲁恩','赏金猎人');
 for(const id of ['c1HuntOffer','c1HuntProgress','c1HuntReport']){
  const s=STAGING.scenes[id];s.actors={hero:[hunter.x+80,hunter.y+70],c1hunter:[hunter.x,hunter.y]};s.conversationPairs=[[0,'hero','c1hunter',110]];s.actorMeta={c1hunter:{sprite:4}};
 }
 const P=RPG.prototype,old={};for(const k of ['beginScene','restore','questGoal'])old[k]=P[k];
 const accept=g=>{if(g.chapter===0&&!g.quests.rats)g.c1Accept('rats');};
 P.beginScene=function(id,...args){if(id==='intro')accept(this);return old.beginScene.call(this,id,...args);};
 P.restore=function(s){const r=old.restore.call(this,s);accept(this);return r;};
 P.questGoal=function(id){const goal=old.questGoal.call(this,id);if(id==='c1EliteHunt'&&goal){if(goal.target==='clerk')goal.target='c1hunter';goal.text=goal.text?.replaceAll('鲁恩','赏金猎人');}return goal;};
}
