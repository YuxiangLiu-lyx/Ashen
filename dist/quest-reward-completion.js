import {C1_QUESTS} from './chapter-one-expansion-data.js';
// Mainline aliases display the same settlement, without paying it a second time.
export function installQuestRewardCompletion(RPG,{QUESTS}){
 const metadata={contract:C1_QUESTS.c1Assassination,escape:C1_QUESTS.c1Departure,relay:{xp:35,gold:10},breakout:{xp:65,gold:15},exile:{xp:100,gold:35},ch3:{xp:150,gold:50},ch4:{xp:300,gold:80},ch5:{xp:850,gold:180}};
 for(const [id,r]of Object.entries(metadata))Object.assign(QUESTS[id],{xp:r.xp,gold:r.gold});
 // This removed journal placeholder has no accepting/completing action. It is a memory, not a quest.
 // ch5V18SaintTime stays as an inert legacy lookup for old saves; no live journal entry.
 const P=RPG.prototype;
 for(const method of ['apply','startChapterFour','startChapterFive']){const old=P[method];P[method]=function(...args){
  const before={ch3:this.quests.ch3,ch4:this.quests.ch4},result=old.apply(this,args);
  for(const id of ['ch3','ch4'])if(before[id]==='active'&&this.quests[id]==='done'&&!this.flags['completionReward:'+id]){
   this.flags['completionReward:'+id]=true;const r=metadata[id];this.gainXP(r.xp);this.p.gold+=r.gold;this.saveEvent();
  }
  return result;
 };}
}
