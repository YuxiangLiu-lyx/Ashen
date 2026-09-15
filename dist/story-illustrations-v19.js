import {SAGA_ILLUSTRATIONS_V25} from './saga-art-v25.js';
import {CHARACTER_ART_V24} from './character-art-v24.js';
import {CITY_MOMENTS_ILLUSTRATIONS_V24} from './city-moments-art-v24.js';
import {STORY_ILLUSTRATIONS_V22,illustrationCueV22} from './presentation-v22.js';
import {ROMANCE_ILLUSTRATIONS_V20} from './romance-illustrations-v20.js';
// Optional scene illustrations load when their scene starts, never on the title screen.
export const STORY_ILLUSTRATIONS_V19=Object.freeze({
 ...ROMANCE_ILLUSTRATIONS_V20,
 tavern:{src:'assets/v19/tavern-v19.png',alt:'烛光映着酒馆的木桌，诺恩把铜杯递给艾莉娅。'},
 riverside:{src:'assets/v19/riverside-v19.png',alt:'两人在暗河边俯身放下水灯，远处石桥映着蓝金色夜光。'},
 marketgame:{src:'assets/v23-reconstruction/marketgame.png',alt:'夜市的小摊前，艾莉娅试着投出木环，诺恩拿着剩下的环站在旁边。'},
 rain:{src:'assets/v23-reconstruction/rain.png',alt:'两人在雨檐下暂避，艾莉娅低头替诺恩缝好袖口。'},
 care:{src:'assets/v23-reconstruction/care.png',alt:'暖灯照着客床，诺恩抱着困倦的艾莉娅走近，瑟琳娜在旁整理枕头。'},
 observatory:{src:'assets/v23-reconstruction/observatory.png',alt:'两人并肩站在铜钟与星镜旁，俯看整座城的灯火。'},
 ...STORY_ILLUSTRATIONS_V22,
 ...CITY_MOMENTS_ILLUSTRATIONS_V24,
 ...SAGA_ILLUSTRATIONS_V25,
 ...CHARACTER_ART_V24
});
const images=new Map();
let visibleIllustration=null;
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function sceneIllustrationV19(flow,beats){
 const cue=illustrationCueV22(flow,beats);
 return cue&&STORY_ILLUSTRATIONS_V19[cue.id]?{id:cue.id,...STORY_ILLUSTRATIONS_V19[cue.id]}:null;
}

export function loadStoryIllustrationV19(id,onReady){
 const art=STORY_ILLUSTRATIONS_V19[id];if(!art||typeof Image==='undefined')return false;
 const current=images.get(id);if(current){if(current.state==='loading')current.onReady=onReady;return current.state==='ready';}
 const img=new Image(),entry={state:'loading',img,onReady};images.set(id,entry);
 img.decoding='async';img.onload=()=>{entry.state=img.naturalWidth>0&&img.naturalHeight>0?'ready':'failed';const notify=entry.onReady;entry.onReady=null;if(entry.state==='ready')notify?.();};
 img.onerror=()=>{entry.state='failed';entry.onReady=null;};img.src=art.src;
 return entry.state==='ready';
}

export function prepareSceneIllustrationsV19(sceneId,beats,onReady){
 for(const id of new Set((beats?.[sceneId]||[]).map(c=>c.id)))loadStoryIllustrationV19(id,onReady);
}

export function storyIllustrationHTMLV19(art){
 if(!art||images.get(art.id)?.state!=='ready'){visibleIllustration=null;return '';}
 const entering=visibleIllustration!==art.id;visibleIllustration=art.id;
 return `<figure class="story-illustration-v19${entering?' is-new':''}" data-scene-art="${escape(art.id)}"><img src="${escape(art.src)}" alt="${escape(art.alt)}" decoding="async" draggable="false"></figure>`;
}

export function saintMemoriesHTMLV19(g){
 const journal=g?.saintStoryJournalV19?.();if(!journal||!journal.memories?.length&&!journal.unfinished)return '';
 return `<section class="saint-memories-v19"><h3>城中片刻</h3>${journal.memories.length?`<ul>${journal.memories.map(m=>`<li><span>${escape(m.title)}</span><small>${escape(m.place)}</small></li>`).join('')}</ul>`:''}${journal.unfinished?`<p>${escape(journal.unfinished.text)}</p>`:''}</section>`;
}
