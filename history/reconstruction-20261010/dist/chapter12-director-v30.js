// Shot state is derived from the saved scene/line/phase, never from wall-clock time.
export const CHAPTER12_ILLUSTRATIONS_V30={chapelMorningV30:{src:'assets/v30-narrative/chapel-morning.png',alt:'白榆礼拜厅的晨光，红毯通向祭台，文书长桌与侧门在右侧。'}};
export const CHAPTER12_ILLUSTRATION_BEATS_V30={
 saintBrief:[{from:0,to:12,id:'chapelMorningV30'}],
 assassination:[{from:0,to:1,id:'chapelMorningV30'},{from:9,to:9,id:'chapelMorningV30'},{from:11,to:13,id:'chapelMorningV30'}]
};
const shot=(from,to,size,subject,tone='warm')=>({from,to,size,subject,tone});
export const CHAPTER12_SHOTS_V30={
 saintBrief:[shot(0,1,'wide'),shot(2,7,'medium'),shot(8,10,'close','艾莉娅'),shot(11,12,'medium')],
 assassination:[shot(0,1,'medium'),shot(9,9,'close','艾莉娅','cold'),shot(11,13,'close','艾莉娅','cold')],
 ch2InnerDoor:[shot(0,2,'medium',null,'cold'),shot(3,5,'close','艾莉娅','cold')]
};
export function chapter12ShotV30(flow){
 if(!flow||flow.finished||flow.closing||flow.phase!=='dialogue')return null;
 return CHAPTER12_SHOTS_V30[flow.id]?.find(s=>flow.index>=s.from&&flow.index<=s.to)||null;
}
export const chapter12SkipControlV30=(token)=>`<button class="scene-skip-v30" data-act="skip-scene-v30" data-scene-token="${token}" title="跳过当前这一段，保留剧情结果">跳过本段</button>`;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function chapter12DirectorHTMLV30(flow,{artHTML='',portrait,label,token}){
 const frame=chapter12ShotV30(flow);if(!frame)return '';
 const [speaker,line]=flow.current,subject=frame.subject||(speaker==='旁白'?null:speaker);
 return `<div class="dialogue-wrap director-v30 director-${frame.size}-v30 director-${frame.tone}-v30 ${artHTML?'director-painted-v30':''}" data-director-shot="${frame.size}">
  <div class="director-backdrop-v30">${artHTML}</div><div class="director-light-v30" aria-hidden="true"></div>
  ${subject?`<div class="director-subject-v30">${portrait(subject)}</div>`:''}
  <p class="scene-label">${esc(label)}</p>${chapter12SkipControlV30(token)}
  <section class="dialogue-card"><div class="dialogue-copy"><p class="speaker">${esc(speaker)}</p><p class="line">${esc(line)}</p>
  <div class="dialogue-bottom"><span></span><button data-act="next" data-scene-token="${token}">继续 ▸</button></div></div></section></div>`;
}
// Finish exactly one pending scene through the same movement/outro/callback path.
// A chained scene is deliberately left for the player to read or skip separately.
export function skipStorySegmentV30(flow){
 if(!flow||flow.finished)return false;
 for(let n=0;!flow.finished&&n<flow.lines.length*3+6;n++){
  if(flow.phase==='action'){flow.cine?.fastForward();flow.update(0);}
  else flow.advance();
 }
 if(!flow.finished)throw Error('Story segment did not finish: '+flow.id);
 return true;
}
