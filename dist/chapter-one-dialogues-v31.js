import {StoryFlow} from './story-flow-v14.js';
import {Cinematic} from './cinematics-v14.js';

// Revision 0.5: familiar speakers after the commission; no anonymous seal scene.
// Original pending IDs and completion actions remain compatible with old saves.
export const C1_HIDDEN = {
 c1HiddenPairArrangement: [
  [
    "旁白",
    "诺恩走出了会馆。鲁恩放下手里的文书，走到薇蕾娜身边。她看了一眼门口，等脚步声远了才开口。"
  ],
  [
    "薇蕾娜",
    "门上的禁制，明明有别的办法解开。为什么还要让诺恩把圣女带走？"
  ],
  [
    "旁白",
    "鲁恩沉默了一会儿，才开口。"
  ],
  [
    "鲁恩",
    "这是上面的安排。薇蕾娜，别再问了。"
  ],
  [
    "薇蕾娜",
    "不管你们上面有什么计划，有一件事我得说清楚：别害诺恩。"
  ],
  [
    "鲁恩",
    "对不起……这件事，我做不了主。"
  ],
  [
    "旁白",
    "薇蕾娜盯着他，声音陡然抬高。"
  ],
  [
    "薇蕾娜",
    "做不了主？鲁恩，他是我们看着长大的！"
  ],
  [
    "薇蕾娜",
    "你就一点也不担心他吗？在你心里，除了服从命令，就没有别的了？"
  ],
  [
    "旁白",
    "鲁恩垂下眼。薇蕾娜等着他的回答，他却迟迟没有出声。"
  ],
  [
    "鲁恩",
    "对不起……"
  ]
]
};
const tailFor={contract:'c1HiddenPairArrangement'};

export class ChapterOneStoryFlow extends StoryFlow {
 constructor(g,lines){
  const saved=g.pending?.c1Tail;
  const retired=g.pending?.id==='assassination'&&saved?.id==='c1HiddenSealEcho';
  // This old tail began after every original line and the outro. Resume its
  // original completion, without displaying removed dialogue or paying twice.
  if(retired)Object.assign(g.pending,{line:lines.length-1,phase:'dialogue',closing:true});
  super(g,lines);
  this.mainCine=this.cine;this.c1TailID=tailFor[this.id];
  if(retired){
   delete g.pending.c1Tail;
   g.flags.c1Viewed={...g.flags.c1Viewed,c1HiddenSealEcho:true};
   super.complete();return;
  }
  if(this.c1TailID&&saved?.id===this.c1TailID){
   this.openTail(saved.revision===3?saved.line:0);
  }
 }
 openTail(line=0){
  const last=C1_HIDDEN[this.c1TailID].length-1;
  this.c1Tail={id:this.c1TailID,line:Math.max(0,Math.min(last,Math.floor(Number(line)||0))),revision:3};
  this.cine=new Cinematic(this.g,this.c1TailID,this.c1Tail.line);
  if(line>0)this.cine.fastForward();
  this.phase=this.cine.busy()?'action':'dialogue';this.closing=true;
  this.revision++;this.sync();
 }
 sync(){
  if(!this.c1Tail){super.sync();return;}
  if(this.g.pending){this.g.pending.c1Tail={...this.c1Tail};this.g.pending.phase=this.phase;this.g.pending.closing=true;}
 }
 get readingRows(){return this.c1Tail?C1_HIDDEN[this.c1Tail.id]:super.readingRows;}
 get readingIndex(){return this.c1Tail?this.c1Tail.line:super.readingIndex;}
 get current(){return this.c1Tail?C1_HIDDEN[this.c1Tail.id][this.c1Tail.line]:super.current;}
 complete(){
  if(this.finished)return;
  const g=this.g;
  // New contracts commit normally; the map-exit hook schedules the private scene.
  // Only saves already inside the old tail use openTail().
  if(this.c1Tail)g.flags.c1Viewed={...g.flags.c1Viewed,[this.c1TailID]:true};
  this.cine=this.mainCine;
  super.complete();
 }
 advance(){
  if(this.finished)return false;
  if(!this.c1Tail)return super.advance();
  if(this.c1Tail.line===C1_HIDDEN[this.c1Tail.id].length-1)this.complete();
  else{this.c1Tail.line++;this.cine?.setLine(this.c1Tail.line);this.revision++;this.sync();}
  return true;
 }
 update(dt){if(!this.c1Tail)return super.update(dt);const cues=this.cine?.update(dt)||[];if(this.phase==='action'&&!this.cine?.busy()){this.phase='dialogue';this.revision++;this.sync();}return cues;}
}
