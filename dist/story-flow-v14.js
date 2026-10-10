import {faceStory} from './orientation-v14.js';
import {Cinematic,CINEMATIC_SCENES} from './cinematics-v14.js';
export class StoryFlow{
 constructor(g,lines){this.g=g;this.lines=lines;this.id=g.pending.id;this.index=Math.max(0,Math.min(g.pending.line||0,lines.length-1));this.savedPhase=g.pending.phase;this.closing=!!g.pending.closing;this.cine=CINEMATIC_SCENES.has(this.id)?new Cinematic(g,this.id,this.index):null;if(this.savedPhase==='dialogue'||this.closing)this.cine?.fastForward();if(this.closing)this.cine?.startOutro();this.phase=this.cine?.busy()?'action':'dialogue';this.revision=0;this.finished=false;this.sync();}
 sync(){if(this.phase==='dialogue')faceStory(this.cine,this.lines[this.index]?.[0],this.lines[this.index-1]?.[0]);if(this.g.pending){this.g.pending.line=this.index;this.g.pending.phase=this.phase;this.g.pending.closing=this.closing;}}
 complete(){this.finished=true;this.phase='complete';this.cine?.finish();this.g.finishScene();this.revision++;}
 update(dt){if(this.finished)return [];const cues=this.cine?.update(dt)||[];if(this.phase==='action'&&!this.cine?.busy()){if(this.closing)this.complete();else{this.phase='dialogue';this.revision++;this.sync();}}return cues;}
 advance(){if(this.finished||this.phase!=='dialogue')return false;if(this.index+1>=this.lines.length){if(this.cine?.startOutro()){this.closing=true;this.phase='action';this.revision++;this.sync();return true;}this.complete();return true;}this.index++;this.cine?.setLine(this.index);this.phase=this.cine?.busy()?'action':'dialogue';this.revision++;this.sync();return true;}
 get current(){return this.phase==='dialogue'?this.lines[this.index]:null;}
}
