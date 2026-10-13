// Persistent design contract: docs/harness/GAME_SETTINGS.md.
// A marker describes an executable conversation option, never a guessed label.
export const GAME_SETTINGS=Object.freeze({defaultTracking:'main',encounterRefresh:'map-entry',showDropRates:false});
export function questMarkerForOptions(options){
 const states=options.map(o=>o.questState);
 if(states.some(s=>s==='ready'||s==='advance'))return 'gold?';
 if(states.includes('available'))return '!';
 if(states.includes('waiting'))return '?';
 return '';
}

// Install after chapter overlays so their automatic sidequest tracking cannot
// silently replace a player's choice. Active trial directions remain explicit.
export function installGameSettings(RPG,{MAPS}){
 const previous=RPG.prototype.trackedGoal;
 RPG.prototype.trackedGoal=function(){
  const current=previous.call(this);if(current?.trial)return current;
  const id=this.flags.manualTrackedId;
  if(id&&this.quests[id]==='active'){const goal=this.questGoal(id);if(goal&&!goal.completed&&!goal.suspended)return goal;}
  const map=this.flags.mapGoal;
  if(map&&MAPS[map])return {text:'前往 '+MAPS[map].name,map,type:'探索目的地'};
  const goal=this.objective();return {...goal,type:goal.type||'主线任务'};
 };
}
