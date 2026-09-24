import {AudioDirector as ImpactAudioDirector} from './audio-v14.js';

// Original, deterministic 16-beat phrases; each location has its own motif,
// harmony, tempo and instrumentation. Randomness is used only by legacy impacts.
export const MUSIC_THEMES_V17={
 river:{bpm:68,root:55,chords:[[0,4,7],[2,5,9],[5,9,12],[0,4,7]],lead:[7,-1,9,-1,12,-1,9,7,5,-1,9,-1,7,-1,5,-1,5,9,12,-1,14,-1,12,9,7,-1,4,-1,2,-1,0,-1],instrument:'sine',bass:.023,melody:.035,hold:1.55,arpeggio:true},
 nightSky:{bpm:54,root:57,chords:[[0,4,7],[4,7,11],[5,9,12],[0,4,7]],lead:[12,-1,-1,11,9,-1,7,-1,11,-1,7,-1,4,-1,-1,-1,9,-1,12,-1,14,-1,12,-1,7,-1,4,-1,0,-1,-1,-1],instrument:'sine',bass:.018,melody:.032,hold:2.4},
 hearth:{bpm:72,root:50,chords:[[0,3,7],[5,9,12],[3,7,10],[0,3,7]],lead:[7,-1,10,12,10,-1,7,5,3,-1,5,7,5,-1,3,-1,5,-1,9,12,9,-1,7,5,3,-1,2,3,0,-1,-1,-1],instrument:'triangle',bass:.035,melody:.044,hold:1.3},
 road:{bpm:88,root:57,chords:[[0,3,7],[5,9,12],[7,10,14],[0,3,7]],lead:[0,3,7,-1,10,7,5,-1,3,5,9,-1,12,9,7,-1,7,10,14,12,10,7,5,-1,3,7,5,3,2,-1,0,-1],instrument:'triangle',bass:.04,melody:.042,hold:.7,arpeggio:true},
 sanctuary:{bpm:58,root:53,chords:[[0,4,7],[5,9,12],[2,5,9],[0,4,7]],lead:[12,-1,-1,-1,7,-1,9,-1,12,-1,-1,-1,9,-1,7,-1,5,-1,9,-1,7,-1,5,-1,4,-1,-1,-1,0,-1,-1,-1],instrument:'sine',bass:.028,melody:.035,hold:2.3},
 ash:{bpm:62,root:40,chords:[[0,1,7],[5,8,12],[1,5,8],[0,1,7]],lead:[12,-1,-1,-1,13,-1,-1,-1,19,-1,17,-1,13,-1,-1,-1,17,-1,-1,-1,20,-1,19,-1,13,-1,-1,-1,12,-1,-1,-1],instrument:'sine',bass:.026,melody:.035,hold:2,drone:true},
 city:{bpm:82,root:50,chords:[[0,4,7],[9,12,16],[5,9,12],[7,11,14]],lead:[7,-1,9,11,12,-1,11,9,7,-1,4,7,9,-1,7,-1,5,-1,9,12,14,-1,12,9,7,-1,11,9,7,-1,2,-1],instrument:'triangle',bass:.032,melody:.046,hold:.9,arpeggio:true},
 tavern:{bpm:104,root:55,chords:[[0,4,7],[5,9,12],[7,10,14],[0,4,7]],lead:[7,9,7,4,2,-1,0,-1,5,7,9,12,9,7,5,-1,7,10,14,10,9,7,5,2,4,7,9,7,4,2,0,-1],instrument:'triangle',bass:.03,melody:.036,hold:.42,arpeggio:true},
 memory:{bpm:56,root:50,chords:[[0,3,7],[8,12,15],[5,8,12],[0,3,7]],lead:[12,-1,10,-1,7,-1,-1,-1,8,-1,12,-1,15,-1,12,-1,10,-1,8,-1,5,-1,-1,-1,7,-1,3,-1,0,-1,-1,-1],instrument:'sine',bass:.021,melody:.038,hold:2.1},
 tension:{bpm:92,root:49,chords:[[0,1,7],[0,5,8],[1,5,8],[0,1,7]],lead:[0,-1,7,-1,1,-1,7,-1,0,-1,8,-1,5,-1,8,-1,1,-1,8,-1,5,-1,7,-1,0,-1,7,-1,1,-1,0,-1],instrument:'triangle',bass:.044,melody:.028,hold:.32,pulse:true},
 battle:{bpm:120,root:50,chords:[[0,3,7],[8,12,15],[5,8,12],[7,10,14]],lead:[0,7,0,10,7,3,5,7,8,12,8,15,12,10,8,7,5,8,5,12,10,8,7,5,7,10,14,12,10,7,5,2],instrument:'triangle',bass:.047,melody:.035,hold:.23,pulse:true}
};

const CITY=new Set(['ch5CityGate','ch5GrandSquare','ch5Forge','ch5Market','ch5Reservoir']);
const HEARTH=new Set(['hall','guestroom','workshop','post','inn','hellCamp','hellWorkshop','deepCamp']);
export function sceneMusicV17(g,{maps={},mode='play',scene=null}={}){
 if(!g)return 'hearth';
 if(mode==='play'&&!g.sagaInvisibleV25?.()&&g.enemies?.some(e=>!e.dead&&Math.hypot(e.x-g.p.x,e.y-g.p.y)<350))return 'battle';
 if(g.memoryV13?.active||maps[g.map]?.privateMemory||/Memory|V13Private|V13Blood|V13Leon/.test(scene||''))return 'memory';
 if(g.map==='ch5LanternQuay')return 'river';
 if(g.map==='ch5BellTerrace')return 'nightSky';
 if(g.map==='ch5GuestRooms')return 'hearth';
 if(g.map==='ch5NightMarket')return 'tavern';
 if(MUSIC_THEMES_V17[maps[g.map]?.v18Music])return maps[g.map].v18Music;
 if(['assassination','canalStart','ch2Alarm','ch2InnerDoor','ch2TargetBefore','ch5ExitScene'].includes(scene)||g.map==='ch5Gate'||g.map==='ch5V17Calibration'||g.map==='chamber'||g.map==='manor'||g.map==='spillway'||g.map==='canal')return 'tension';
 if(g.map==='ch5Tavern'||g.map==='ch5Arcade')return 'tavern';
 if(g.map==='chapel'||g.map==='ch5Memorial')return 'sanctuary';
 if(CITY.has(g.map)||g.map==='town')return 'city';
 if(HEARTH.has(g.map))return 'hearth';
 if(/^(hell|deep|ch5)/.test(g.map))return 'ash';
 return 'road';
}

export class AudioDirector extends ImpactAudioDirector{
 constructor(){super();this.volume=.7;this.track=null;this.scoreBus=null;this.oldBuses=[];this.quiet=false;this.lastTarget=null;this.pendingTrack=null;this.pendingSince=0;
  try{const s=JSON.parse(localStorage.getItem('ashen-vow-audio'));if(Number.isFinite(s?.volume))this.volume=Math.max(0,Math.min(1,s.volume));}catch{}
 }
 unlock(){super.unlock();if(this.ctx){this.master.gain.setTargetAtTime(.7*this.volume,this.ctx.currentTime,.04);if(this.ctx.state==='interrupted')this.ctx.resume().catch(()=>{});}}
 persist(){try{localStorage.setItem('ashen-vow-audio',JSON.stringify({music:this.music,effects:this.effects,volume:this.volume}));}catch{}}
 set(which,value){
  if(which==='volume'){this.volume=Math.max(0,Math.min(1,Number(value)||0));if(this.ctx)this.master.gain.setTargetAtTime(.7*this.volume,this.ctx.currentTime,.04);}
  else if(which==='music'||which==='effects'){this[which]=!!value;if(this.ctx){const bus=which==='music'?this.musicBus:this.fxBus;bus.gain.setTargetAtTime(this[which]?(which==='music'?(this.quiet?.23:.4):.7):0,this.ctx.currentTime,.05);}if(which==='music')this.lastTarget=null;}
  this.persist();
 }
 switchTrack(track,t){
  if(this.scoreBus){const gain=this.scoreBus.gain;if(gain.cancelAndHoldAtTime)gain.cancelAndHoldAtTime(t);else{const current=gain.value;gain.cancelScheduledValues(t);gain.setValueAtTime(current,t);}gain.setTargetAtTime(0,t,.45);this.oldBuses.push({bus:this.scoreBus,end:t+6});}
  const bus=this.ctx.createGain();bus.gain.setValueAtTime(0,t);bus.gain.linearRampToValueAtTime(1,t+1.5);bus.connect(this.musicBus);this.scoreBus=bus;this.track=track;this.step=0;this.next=t+.08;this.pendingTrack=null;
 }
 update(track='hearth',quiet=false){
  if(!this.ctx||this.ctx.state!=='running')return;const t=this.ctx.currentTime;track=MUSIC_THEMES_V17[track]?track:'hearth';this.quiet=!!quiet;
  for(const old of this.oldBuses)if(old.end<t)old.bus.disconnect();this.oldBuses=this.oldBuses.filter(old=>old.end>=t);
  // Briefly crossing an enemy's detection radius does not restart the score.
  if(track!==this.track){if(this.pendingTrack!==track){this.pendingTrack=track;this.pendingSince=t;}if(!this.track||t-this.pendingSince>=(track==='battle'?.25:1.4))this.switchTrack(track,t);}else this.pendingTrack=null;
  const target=this.music?(quiet?.23:.4):0;if(target!==this.lastTarget){this.musicBus.gain.setTargetAtTime(target,t,.15);this.lastTarget=target;}
  if(!this.music){this.next=t+.08;return;}
  if(this.next<t-.2)this.next=t+.08;
  let guard=0;while(this.next<t+.15&&guard++<4){this.score(this.step++,this.next);this.next+=60/MUSIC_THEMES_V17[this.track].bpm/2;}
 }
 musicNote(midi,t,d,v,type='triangle'){
  const f=440*2**((midi-69)/12);this.tone(f,t,d,v,type,this.scoreBus);if(type==='triangle')this.tone(f*2,t+.005,d*.4,v*.1,'sine',this.scoreBus);
 }
 score(step,t){
  const a=MUSIC_THEMES_V17[this.track],s=step%32,ch=a.chords[Math.floor(s/8)],beat=60/a.bpm,phrase=Math.floor(step/32)%2;
  if(s%8===0){for(const n of ch)this.musicNote(a.root+n-12,t,Math.min(4,beat*3.7),a.bass/3,'sine');this.musicNote(a.root+ch[0]-12,t,beat*1.7,a.bass,'sine');}
  if(a.lead[s]>=0)this.musicNote(a.root+a.lead[s]+(phrase&&s>=24?12:0),t,a.hold,a.melody,a.instrument);
  if(a.arpeggio&&s%4===2)this.musicNote(a.root+ch[(s/2|0)%3],t,beat*.65,.015,'triangle');
  if(a.drone&&s%16===0)this.musicNote(a.root-12,t,4,.026,'sine');
  if(a.pulse&&s%4===0){this.tone(92,t,.19,this.track==='battle'?.09:.035,'sine',this.scoreBus,42);this.musicNote(a.root+ch[0]-12,t,beat*.5,.035,'triangle');}
  if(this.track==='battle'&&s%4===2)this.tone(260,t,.055,.016,'triangle',this.scoreBus,110);
 }
}
