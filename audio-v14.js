// Original modal score and layered impact synthesis. No downloads or paid audio API.
export class AudioDirector{
 constructor(){this.ctx=null;this.music=true;this.effects=true;this.next=0;this.step=0;this.track='village';this.lastFX={};try{const s=JSON.parse(localStorage.getItem('ashen-vow-audio'));if(s){this.music=s.music!==false;this.effects=s.effects!==false;}}catch{}}
 unlock(){try{if(!this.ctx){const C=globalThis.AudioContext||globalThis.webkitAudioContext;if(!C)return;this.ctx=new C();this.master=this.ctx.createGain();this.master.gain.value=.7;this.master.connect(this.ctx.destination);this.musicBus=this.ctx.createGain();this.musicBus.gain.value=this.music?.4:0;this.musicBus.connect(this.master);this.fxBus=this.ctx.createGain();this.fxBus.gain.value=this.effects?.7:0;this.fxBus.connect(this.master);this.noise=this.ctx.createBuffer(1,this.ctx.sampleRate,this.ctx.sampleRate);const a=this.noise.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=(Math.random()*2-1);this.next=this.ctx.currentTime+.08;}if(this.ctx.state==='suspended')this.ctx.resume().catch(()=>{});}catch{}}
 set(which,value){this[which]=value;if(this.ctx)(which==='music'?this.musicBus:this.fxBus).gain.setTargetAtTime(value?(which==='music'?.4:.7):0,this.ctx.currentTime,.05);try{localStorage.setItem('ashen-vow-audio',JSON.stringify({music:this.music,effects:this.effects}));}catch{}}
 tone(freq,time,duration,volume,type='triangle',bus=this.musicBus,slide=null){if(!this.ctx)return;const o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,time);if(slide)o.frequency.exponentialRampToValueAtTime(slide,time+duration);g.gain.setValueAtTime(.0001,time);g.gain.exponentialRampToValueAtTime(volume,time+Math.min(.02,duration*.15));g.gain.exponentialRampToValueAtTime(.0001,time+duration);o.connect(g);g.connect(bus);o.start(time);o.stop(time+duration+.01);}
 hiss(time,duration,volume,freq=1600,kind='bandpass'){const n=this.ctx.createBufferSource(),f=this.ctx.createBiquadFilter(),g=this.ctx.createGain();n.buffer=this.noise;f.type=kind;f.frequency.value=freq;f.Q.value=.7;g.gain.setValueAtTime(volume,time);g.gain.exponentialRampToValueAtTime(.0001,time+duration);n.connect(f);f.connect(g);g.connect(this.fxBus);n.start(time,Math.random()*.3);n.stop(time+duration);}
 note(midi,t,d=.6,v=.09){const f=440*2**((midi-69)/12);this.tone(f,t,d,v);this.tone(f*2,t+.003,d*.45,v*.19,'sine');this.tone(f*.999,t+.022,d*.8,v*.10,'sine');}
 update(track='village',quiet=false){if(!this.ctx||this.ctx.state!=='running')return;if(track!==this.track){this.track=track;this.step=0;this.next=this.ctx.currentTime+.2;}if(!this.music){this.next=this.ctx.currentTime+.15;return;}const t=this.ctx.currentTime;this.musicBus.gain.setTargetAtTime(quiet?.23:.4,t,.15);if(this.next<t-.5)this.next=t+.08;let guard=0;while(this.next<t+.15&&guard++<4){this.score(this.step++,this.next);this.next+=60/(this.track==='battle'?112:this.track==='tension'?82:88)/2;}}
 score(step,t){if(this.track==='hell'){const s=step%32;if(s%8===0){this.tone(55,t,4.8,.047,'sine');this.tone(s<16?82.41:77.78,t+.1,4.2,.026,'triangle');this.tone(58.27,t,3.6,.014,'sine');}if(s%6===0)this.tone([220,233.08,164.81,207.65][Math.floor(s/6)%4],t,2.3,.026,'sine');if(s%16===12)this.tone(73.42,t,1.5,.035,'triangle');return;}const seq=[0,7,12,10,7,3,5,7,0,3,7,10,12,10,7,-1,5,9,12,14,12,9,7,5,3,7,10,12,10,7,3,-1,0,7,15,14,12,10,7,3,5,7,10,14,12,7,5,-1,3,7,12,10,7,5,3,2,0,3,7,12,7,3,2,-1],s=step%64,combat=this.track==='battle',tension=this.track==='tension',root=50,chords=[[0,3,7],[8,12,15],[5,8,12],[7,10,14]],ch=chords[Math.floor(s/16)];
  if(s%8===0){for(const n of ch)this.tone(440*2**((root+n-12-69)/12),t,2.7,.04,'sine');this.note(root+ch[0]-12,t,1.4,.11);}
  if(seq[s]>=0&&(!tension||s%2===0))this.note(root+seq[s]+(combat?-12:0),t,combat?.45:.85,combat?.085:.075);
  if(s%4===2)this.note(root+ch[(s/2|0)%3],t,.9,.035);
  if(combat&&s%4===0){this.tone(95,t,.2,.17,'sine',this.musicBus,39);this.tone(170,t,.075,.05,'triangle',this.musicBus,72);}
  if(combat&&s%4===2)this.tone(330,t,.04,.035,'triangle',this.musicBus,110);
 }
 sfx(name){this.unlock();if(!this.ctx||!this.effects)return;const t=this.ctx.currentTime;if((this.lastFX[name]||-10)>t-.035)return;this.lastFX[name]=t;
  if(name==='hit'||name==='hurt'){this.tone(name==='hit'?130:88,t,.13,.3,'sine',this.fxBus,38);this.hiss(t,.085,.34,1150);this.tone(930,t,.045,.07,'triangle',this.fxBus,180);}
  else if(name==='swing'||name==='dash'){this.hiss(t,.13,.2,name==='swing'?2100:850);this.tone(250,t,.08,.08,'triangle',this.fxBus,80);}
  else if(name==='guard'||name==='enemySword'){this.hiss(t,.08,.15,2900);this.tone(1550,t,.21,.10,'sine',this.fxBus);this.tone(2220,t,.15,.04,'sine',this.fxBus);}
  else if(name==='wood'){this.tone(160,t,.08,.23,'triangle',this.fxBus,65);this.hiss(t,.14,.26,850);}
  else if(name==='bite'){this.hiss(t,.06,.14,2400);this.tone(600,t,.04,.05,'sine',this.fxBus,240);}
  else if(name==='skill'){this.hiss(t,.16,.17,1800);[310,465,620].forEach((f,i)=>this.tone(f,t+i*.018,.22,.08,'triangle',this.fxBus));}
  else if(name==='holy'){[587.33,880,1174.66].forEach((f,i)=>this.tone(f,t+i*.045,.5,.06,'sine',this.fxBus));this.hiss(t,.14,.055,3100);}else if(name==='chain_drag'||name==='chain_strike'||name==='cart_wheel'){this.hiss(t,.32,.13,850);[320,730,1040].forEach((f,i)=>this.tone(f,t+i*.06,.14,.04,'triangle',this.fxBus));}else if(name==='heal'||name==='level'){[523,659,784,1046].slice(0,name==='heal'?3:4).forEach((f,i)=>this.tone(f,t+i*.08,.45,.08,'sine',this.fxBus));}
  else if(name==='stamp'){this.tone(100,t,.45,.35,'sine',this.fxBus,32);this.hiss(t,.23,.3,470);}
  else this.tone(420,t,.035,.035,'sine',this.fxBus,260);
 }
 suspend(){if(this.ctx?.state==='running')this.ctx.suspend().catch(()=>{});}
}
