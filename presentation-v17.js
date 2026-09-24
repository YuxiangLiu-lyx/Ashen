// Presentation state lives outside re-rendered UI nodes. No game inputs are intercepted.
export function capturePanelV17(root){
 if(!root)return null;
 const selectors=['.panel-body','.tabs','.inventory-grid','.skill-tree','.binding-library','.merc-bag','.merc-skill-list','.merc-tabs'];
 const scroll=selectors.flatMap(selector=>Array.from(root.querySelectorAll(selector),(el,index)=>({selector,index,top:el.scrollTop,left:el.scrollLeft})));
 const active=root.ownerDocument?.activeElement;
 const focus=active&&root.contains(active)&&active.matches?.('button,input,select')?{tag:active.tagName,data:Object.entries(active.dataset),type:active.type}:null;
 return {scroll,focus};
}
export function restorePanelV17(root,state){
 if(!root||!state)return;
 if(state.focus){const f=state.focus,el=Array.from(root.querySelectorAll('button,input,select')).find(el=>el.tagName===f.tag&&el.type===f.type&&f.data.length&&f.data.every(([k,v])=>el.dataset[k]===v));if(el&&!el.disabled)el.focus({preventScroll:true});}
 for(const s of state.scroll){const el=root.querySelectorAll(s.selector)[s.index];if(el){el.scrollTop=s.top;el.scrollLeft=s.left;}}
}

export const CHAPTER_CARDS_V17={
 1:{number:'第一章',title:'午钟之前',subtitle:'白榆城 · 灰烛会馆'},
 2:{number:'第二章',title:'灰桥封路',subtitle:'灰石驿站 · 追缉未歇'},
 3:{number:'第三章',title:'黑潮之下',subtitle:'灰烬渡口 · 越过人间的边界'},
 4:{number:'第四章',title:'地狱深处',subtitle:'黑曜阶道 · 向沉寂之地'},
 5:{number:'第五章',title:'阙灯余生',subtitle:'白槲旧道 · 远处仍有灯火'},
 6:{number:'第六章',title:'微服私访',subtitle:'芦湾村 · 亲眼所见'},
 7:{number:'第七章',title:'袒露真心',subtitle:'灯下旧事 · 风雨故人'},
 8:{number:'第八章',title:'镜泉留声',subtitle:'隐庭学剑 · 此后同行'}
};
export function storyChapterV17(g){
 if(!g)return 0;const f=g.flags||{};
 if(g.sagaV25?.started)return g.chapter>=38?8:g.chapter>=34?7:6;
 if(f.ch5Started||g.chapter>=25)return 5;
 if(f.ch4Started||g.chapter>=21)return 4;
 if(f.ch3Started||g.chapter>=12)return 3;
 if(f.chapterOneComplete||g.chapter>=5)return 2;
 return 1;
}
export class ChapterCardsV17{
 constructor(doc=globalThis.document){this.doc=doc;this.game=null;this.pending=0;this.node=null;this.remaining=0;}
 clear(){this.node?.remove();this.node=null;this.remaining=0;this.pending=0;}
 attach(g,{restored=false}={}){
  this.clear();this.game=g;const current=storyChapterV17(g);
  const prior=Array.isArray(g.flags.chapterCardsV17)?g.flags.chapterCardsV17.filter(n=>Number.isInteger(n)&&n>0&&n<=8):[];
  // Imported pre-V17 saves start quietly at their current chapter. Preview journeys
  // have their own RPG/save, so their opening can show without marking the main run.
  g.flags.chapterCardsV17=[...new Set([...prior,...Array.from({length:Math.max(0,current-(restored?0:1))},(_,i)=>i+1)])];
  if(!restored&&!g.flags.chapterCardsV17.includes(current))this.pending=current;
 }
 update(g,mode,dt){
  if(!g||['title','select','end'].includes(mode)){this.clear();return;}
  if(this.game!==g)this.attach(g);
  if(g.memoryV13?.active)return;
  const current=storyChapterV17(g);
  if(!g.flags.chapterCardsV17.includes(current))this.pending=current;
  if(this.remaining>0){this.remaining-=dt;if(this.remaining<=0){this.node?.remove();this.node=null;}}
  if(!this.pending||this.node||!['play','dialogue'].includes(mode))return;
  const chapter=this.pending,card=CHAPTER_CARDS_V17[chapter];this.pending=0;
  g.flags.chapterCardsV17=[...new Set([...g.flags.chapterCardsV17,chapter])];g.saveEvent?.();
  const el=this.doc.createElement('div');el.className='chapter-card-v17';el.setAttribute('role','status');el.setAttribute('aria-live','polite');
  const label=this.doc.createElement('small'),title=this.doc.createElement('h2'),sub=this.doc.createElement('p');label.textContent=card.number;title.textContent=card.title;sub.textContent=card.subtitle;el.append(label,title,sub);this.doc.body.appendChild(el);this.node=el;this.remaining=4.8;
 }
}
