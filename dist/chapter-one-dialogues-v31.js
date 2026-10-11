import {StoryFlow} from './story-flow-v14.js';

// Short backstage additions, using the original dialogue renderer and staging.
// Keep the pending IDs, completion actions and viewed markers from revision 0.3.
export const C1_HIDDEN = {
 c1HiddenPairArrangement: [
  ['鲁恩','只为杀卡德兰，不必把她也带出来。'],
  ['薇蕾娜','上面要的，不止他的死。还要让诺恩和她同行一段。'],
  ['鲁恩','你觉得会有结果？'],
  ['薇蕾娜','我不知道。她不会顺着他，他也没学过怎么跟这样的人相处。'],
  ['鲁恩','他回来问你呢？'],
  ['薇蕾娜','我会答。先把答应我的退路留好，两个人都得回来。']
 ],
 c1HiddenSealEcho: [
  ['','印启用了。把旧记录取来。'],
  ['','是结果变了。旧案先留着，再算一次。'],
  ['','这次只响了一声。先记下来，别把人都叫来。']
 ]
};
const tailFor={contract:'c1HiddenPairArrangement',assassination:'c1HiddenSealEcho'};
const actionFor={contract:'contractAccept',assassination:'assassinate'};

export class ChapterOneStoryFlow extends StoryFlow {
 constructor(g,lines){
  super(g,lines);
  this.mainCine=this.cine;this.c1TailID=tailFor[this.id];
  const saved=g.pending?.c1Tail;
  if(this.c1TailID&&saved?.id===this.c1TailID){
   const oldLine=Math.max(0,Math.floor(Number(saved.line)||0));
   const line=saved.id==='c1HiddenSealEcho'&&saved.revision!==2?Math.floor(oldLine/2):oldLine;
   this.openTail(line);
  }
 }
 openTail(line=0){
  const last=C1_HIDDEN[this.c1TailID].length-1;
  this.c1Tail={id:this.c1TailID,line:Math.max(0,Math.min(last,Math.floor(Number(line)||0))),revision:2};
  this.phase='dialogue';this.closing=true;this.cine=null;
  this.revision++;this.sync();
 }
 sync(){
  if(!this.c1Tail){super.sync();return;}
  if(this.g.pending){this.g.pending.c1Tail={...this.c1Tail};this.g.pending.phase='dialogue';this.g.pending.closing=true;}
 }
 get current(){return this.c1Tail?C1_HIDDEN[this.c1Tail.id][this.c1Tail.line]:super.current;}
 complete(){
  if(this.finished)return;
  const g=this.g;
  if(this.c1TailID&&!this.c1Tail&&g.pending?.then===actionFor[this.id]&&!g.flags.c1Viewed?.[this.c1TailID]){
   this.openTail();return;
  }
  if(this.c1Tail)g.flags.c1Viewed={...g.flags.c1Viewed,[this.c1TailID]:true};
  this.cine=this.mainCine;
  super.complete();
 }
 advance(){
  if(this.finished)return false;
  if(!this.c1Tail)return super.advance();
  if(this.c1Tail.line===C1_HIDDEN[this.c1Tail.id].length-1)this.complete();
  else{this.c1Tail.line++;this.revision++;this.sync();}
  return true;
 }
 update(dt){return this.c1Tail?[]:super.update(dt);}
}

// Anonymous hood and cloak, using the original bust area. Explicit dark fills
// stay black even if text color is inherited before the stylesheet is ready.
// No face, insignia or identity is invented for these unnamed speakers.
export function hiddenPortraitHTML(){
 return `<svg class="portrait-art backstage-shadow" viewBox="0 0 360 480" preserveAspectRatio="xMidYMax meet" aria-hidden="true" focusable="false">
 <path fill="#06080c" d="M14 480 23 367Q28 322 48 291L103 264 119 235 107 205 109 143Q109 107 128 78L164 42Q178 33 190 40L219 67Q245 99 250 139L255 198 242 233 251 259 308 282Q329 302 337 344L351 480Z"/>
 <path fill="#11171e" d="M164 49Q128 99 124 146L120 204 142 230 128 178Q131 121 167 87L201 75 185 45 216 74Q244 114 244 163L250 197 222 239 205 225 227 185Q231 126 201 94L181 80Z"/>
 <path fill="#030509" d="M169 93 186 83Q224 120 227 163L220 194 199 219 174 229 148 209 135 179 136 148Q143 116 169 93Z"/>
 <path fill="#10151c" d="M111 247 166 270 226 238 243 264 208 305 174 289 140 308 103 270ZM50 300 125 282 144 313 112 354 132 480 110 421 92 349ZM252 277 307 299 283 342 291 433 278 480 266 357 235 315Z"/>
 <path fill="none" stroke="#1b232c" stroke-width="2" stroke-linecap="round" d="M126 95Q110 139 115 191M232 113Q246 157 248 185M54 303 97 290M270 292 307 306M145 315 157 394 151 450M209 313 194 385 208 460"/>
 </svg>`;
}
