// Reconstructed presentation; exact illustration bytes are supplied by the root art pass.
import {CITY_MOMENTS_ILLUSTRATION_BEATS_V24} from './city-moments-art-v24.js';
import {ROMANCE_ILLUSTRATION_BEATS_V20} from './romance-illustrations-v20.js';
const art=(key,alt)=>({src:(key==='stars-looking'?'assets/v24/':'assets/v23-reconstruction/')+key+'.png',alt});
export const STORY_ILLUSTRATIONS_V22={
 'city-arrival':art('city-arrival','诺恩与艾莉娅走进铜门后的繁华石街，望向亮着灯的长窗与花摊。'),
 'stars-telescope':art('stars-telescope','艾莉娅看完目镜，神情平静地转头让诺恩来看；没有笑容。'),
 care:art('care','诺恩避开膝伤抱着困倦的艾莉娅走向床边，瑟琳娜在旁整理枕头。'),
 marketgame:art('marketgame','艾莉娅站在投环线后，手里拿着尚未投出的木环，诺恩在旁看木桩。'),
 rain:art('rain','艾莉娅与诺恩坐在雨檐下同一张长凳上，她低头缝补他已经放稳的袖口。'),
 observatory:art('observatory','两人站在星图石桌旁辨认微光，神情专注自然。'),
 'tavern-window':art('tavern-window','两人在酒馆窗边两把椅子上落座，尚未上酒，向瑟琳娜询问餐点。'),
 'tavern-sleep':art('tavern-sleep','艾莉娅已盖好薄被睡在客床上，诺恩站在床侧，瑟琳娜在旁照料。'),
 'bridge-reflection':art('bridge-reflection','两人在白石桥心的宽栏旁，望向水面与船头的灯。'),
 'market-pastry':art('market-pastry','夜市炉边，诺恩和艾莉娅各自托着一份纸包热馅饼，木雕小鸟已经收好。'),
 'garden-sleeve':art('garden-sleeve','两人并坐在温室雨檐下，艾莉娅检查诺恩刚刚缝好的袖口。'),
 'stars-looking':art('stars-looking','艾莉娅俯身看铜望远镜的目镜，诺恩在侧面留意支架，二人都没有笑容。'),
 'arcade-entry':art('arcade-entry','两人停在游艺厅门边，望向室内铜铃滚珠桌旁的客人。'),
 'arcade-seated':art('arcade-seated','两人在藤架露台的两把椅子上并坐，手中托着点心，听下层乐师调弦。')
};
// Stable V20 IDs/rows remain unchanged. Each distinct image occupies one contiguous
// span per story. Hold-through is explicitly authored, never inferred from a timer.
const cue=(from,to,id,holdThrough=[])=>({from,to,id,holdThrough});
export const ILLUSTRATION_BEATS_V22={
 ...ROMANCE_ILLUSTRATION_BEATS_V20,
 ...CITY_MOMENTS_ILLUSTRATION_BEATS_V24,
 v22CityArrival:[cue(4,10,'city-arrival',[7])],
 v20RomanceTavernA:[cue(8,13,'tavern-window'),cue(19,22,'tavern-arrival')],
 v20RomanceTavernB:[cue(15,18,'tavern-blush')],
 v20RomanceTavernC:[{...cue(14,15,'care',[15]),carryTravel:true},cue(19,22,'tavern-sleep')],
 v20RomanceBridgeA:[cue(18,18,'bridge-walk')],
 v20RomanceBridgeB:[cue(0,7,'bridge-reflection'),cue(15,19,'bridge-view',[19])],
 v20RomanceBridgeC:[cue(13,17,'bridge-farewell',[16])],
 v20RomanceMarketA:[cue(15,17,'marketgame')],
 v20RomanceMarketB:[cue(0,3,'market-play'),cue(15,18,'market-pastry')],
 v20RomanceMarketC:[cue(16,17,'market-arrival')],
 // Doors and real walking anchors must stay visible, so the arrival picture starts
// after the corresponding walk has actually completed rather than before it.
 v20RomanceGardenA:[cue(3,5,'garden-arrival'),cue(11,18,'garden-tending',[16])],
 v20RomanceGardenB:[cue(7,16,'rain',[12,16])],
 v20RomanceGardenC:[cue(0,6,'garden-sleeve')],
 v20RomanceStarsA:[cue(7,9,'stars-looking'),cue(11,13,'stars-telescope')],
 v20RomanceStarsB:[cue(0,8,'observatory',[8])],
 v20RomanceStarsC:[cue(7,15,'stars-rest',[11,15])],
 v20RomanceArcadeA:[cue(0,2,'arcade-entry'),cue(11,19,'arcade-game',[14,17])],
 v20RomanceArcadeB:[cue(10,12,'arcade-success')],
 v20RomanceArcadeC:[cue(5,8,'arcade-seated'),cue(13,17,'arcade-music',[17])]
};
export function illustrationCueV22(flow,beats){
 if(!flow||flow.finished||flow.closing)return null;
 const current=beats?.[flow.id]?.find(c=>flow.index>=c.from&&flow.index<=c.to);
 if(!current)return null;
 if(flow.phase==='dialogue')return current;
 if(flow.phase!=='action'||!current.holdThrough?.includes(flow.index)||flow.index<=current.from)return null;
 const beat=flow.cine?.stage?.beats?.find(b=>b.line===flow.index);
 if(!beat||beat.screenFadeV20||beat.cue||Object.values(beat.actorMeta||{}).some(m=>m.pose||Number.isFinite(m.x)||Number.isFinite(m.y)))return null;
 if(beat.moves?.length){
  // A single short carrying step keeps the already-shown carrying painting.
  // Pickup, laying down, seating, doors, long travel and every other move use world.
  if(!current.carryTravel||flow.cine?.get('hero')?.pose!=='carry'||flow.cine?.get('saint')?.pose!=='carried'||beat.moves.some(m=>m[0]!=='hero'||m[5]||m[3]>1.6))return null;
 }
 const previous=beats?.[flow.id]?.find(c=>flow.index-1>=c.from&&flow.index-1<=c.to);
 return previous?.id===current.id?current:null;
}
export function noticeDurationV22(text){
 return /失败|无法|不足|已满|不够|不能|请先|不完整|刷新|重试/.test(text)?3000:1700;
}
export function queueNoticeV22(queue,text,now){
 const value=String(text),live=queue.filter(t=>t.until>now),existing=live.find(t=>t.text===value);
 // Repeated combat/reward events never keep the same message permanently alive.
 if(existing)return live;
 return [...live,{text:value,until:now+noticeDurationV22(value)}].slice(-2);
}
