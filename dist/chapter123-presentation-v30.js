// Presentation only. Object IDs, feet, depth, collision, targets and quest state
// remain owned by the original world/runtime. Explicit host bindings avoid drawing
// a second pot on a well, or a second mechanism over an interactive scenery object.
import {chapter123V30} from './chapter23-design-v30.js';
const art=(sheet,index,w,h)=>({sheet,index,...(w?{w,h}:{})});
const furniture=(i,w,h)=>art('chapterFurnishings',i,w,h);
const settlement=(i,w,h)=>art('chapterSettlement',i,w,h);
const utility=(i,w,h)=>art('chapterUtilities',i,w,h);
const object=(i,w,h)=>art('chapterObjects',i,w,h);
const hell=(i,w,h)=>art('chapterHell',i,w,h);
const architecture=i=>art('chapterArchitecture',i);

export const CHAPTER123_HOSTS_V30=Object.freeze({
 well:'well-base','guest-bunk':'guest-cot','repair-shelf':'repair-north-shelf',
 'mill-door':'mill-building','echo-machine':'echo-machine-base','reset-bench':'reset-base',
 'inn-pump':'inn-pump-base','inn-rest':'inn-bench','inner-door':'manor-gate',
 'v9-well-rim':'manor-well','spill-sluice':'spill-pump',
 'exile-mark':'exile-monument','exile-deep':'exile-step-top'
});

const sceneryById={
 'pulpit':settlement(3),'mill-building':architecture(5),'mill-house':architecture(5),
 'guest-cot':utility(0),'guest-coats':object(4),'guest-desk':furniture(0),
 'guest-stool':object(6),'guest-lamp':furniture(3),'guest-bag':object(7),
 'guest-exit-frame':architecture(3),'shop-exit-frame':architecture(3),
 'repair-north-shelf':hell(14),'repair-east-shelf':hell(14),
 'v29-repair-cabinet':hell(14),'repair-main-table':utility(1),
 'v29-repair-stool':object(6),'reset-base':utility(1),
 'echo-machine-base':settlement(10),'echo-entrance':architecture(3),'echo-arch':architecture(3),
 'v9-check-cargo-stack':settlement(4),'v9-cellar-north-shelf':settlement(4),
 'v9-well-old-shelf':settlement(4),'v29-echo-shelf':hell(14),
 'chamber-table':object(9),'v11-chamber-sideboard':object(9),'v11-chamber-cabinet':object(5),
 'commission-paper':utility(18),'ceremony-notes':furniture(9),
 'v9-exile-abandoned-pack':object(7),'v9-ditch-trodden-grass':furniture(8),
 'exile-monument':utility(7),'road-sign':furniture(10)
};
const sceneryBySheet={
 world:{0:architecture(0),1:architecture(1),2:settlement(0),3:settlement(1),4:architecture(2),5:architecture(4),7:architecture(3),8:settlement(2),9:furniture(0),10:furniture(1),11:furniture(2),12:furniture(4),13:settlement(7),14:furniture(3),15:furniture(10)},
 details:{3:settlement(8),6:furniture(8),7:object(7),8:architecture(7),9:furniture(5),10:furniture(6)},
 chapterProps:{0:utility(6),1:utility(2),2:utility(4),3:utility(5),4:utility(7),5:utility(3),6:furniture(5),7:settlement(9)},
 qualityWorld:{1:architecture(3),3:settlement(9),6:settlement(2),7:architecture(6)},
 hellWorld:Object.fromEntries(Array.from({length:12},(_,i)=>[i+4,hell(i)]))
};
export function chapter123SceneryArtV30(o,map){
 if(!chapter123V30(map))return null;
 if(o.sheet==='spatialBridgeFront')return art('spatialBridgeFront',0);
 if(o.id.startsWith('stock-'))return settlement(4);
 return sceneryById[o.id]||sceneryBySheet[o.sheet]?.[o.asset]||null;
}
// The same fitted rectangle is used for drawing AND alpha-based occlusion.
export function chapter123SceneryV30(bank,o,map){
 const a=chapter123SceneryArtV30(o,map);if(!a)return null;
 if(o.sheet==='spatialBridgeFront')return {...o};
 const f=bank.frame(a.sheet,a.index),ratio=f?f.h/f.w:o.h/o.w;
 const lamp=a.sheet==='chapterFurnishings'&&a.index===3||a.sheet==='chapterHell'&&a.index===11;
 const h=lamp?o.h:Math.min(o.h*1.08,Math.max(o.h*.7,o.w*ratio));
 return {...o,sheet:a.sheet,asset:a.index,h};
}

const propsById={
 'oil':object(8,28,43),'letter':furniture(7,46,38),'frost':object(11,56,43),
 'stone':settlement(8,59,38),'guest-basin':utility(13,58,33),
 'mill-copper':object(7,58,38),'mill-wheel':object(1,80,73),
 'v29-mill-tracks':utility(17,48,35),'v29-mill-channel':object(2,65,36),
 'v29-echo-core':utility(14,46,24),'v29-repair-core':utility(14,42,22),
 'v9-post-wedge':utility(9,38,27),'v9-cart-rope':utility(10,48,32),
 'v9-cellar-wall':utility(11,52,45),'v9-bridge-water':object(0,32,41),
 'v9-well-pulley':object(1,70,76),'v9-waterline':utility(19,37,27),
 'v9-dry-niche':object(2,65,42),'v9-toll-box':settlement(11,61,45),
 'v9-toll-scale':utility(12,48,44),'v9-warden-box':settlement(11,59,44),
 'v9-warden-chain':utility(11,78,65),'v13-camp-bed':utility(0,149,110),
 'black-brine':utility(15,60,68),'ch3-machine-spring':hell(14,68,82),
 'ch3-wick-frame':hell(12,165,135),'ch3-chain-track':hell(13,87, 70),
 'hell-boss-chain':utility(11,93,78),'tomb-cache':settlement(11,72,54),
 'v11-approach-vein':utility(15,69,73),'v11-approach-bundle':object(7,64,43),
 'v11-quarry-winch':object(1,100,95),'v11-quarry-scar':utility(19,68,38),
 'v11-sluice-pump':settlement(10,110,100),'v11-sluice-scar':utility(19,68,38)
};

const propsByAction={
 notice:furniture(10,65,88),v29RoadSign:furniture(10,50,74),workshopSign:furniture(10,56,76),
 guestJournal:furniture(9,42,29),copperBench:utility(18,42,29),repairInvoice:utility(18,40,29),
 practiceBench:furniture(9,45,30),pointBook:furniture(9,36,24),
 echoNotes:furniture(9,37,25),echoCrystal:utility(15, 60,60),echoValve:furniture(11,64,74),
 'ch2-sign':furniture(10,56,76),'ch2-paper':utility(18,36,25),
 'ch2-tools':utility(8, 60,42),'ch2-cache':object(7,46,34),
 'ch3-doctor':hell(8,150,105),'ch3-altar':hell(9, 90,100),
 'ch3-lamp':hell(11,47,92),'ch3-salt-moss':hell(10, 60,48),
 'ch3-bench':hell(6,170,170),'ch3-soul-wheel':hell(7,100,130),
 'ch3-ferry-lamp':hell(11,52,105),'ch3-tomb-clue':hell(3, 90,105),
 'ch3-trial':hell(9, 80,90)
};

export function chapter123PropArtV30(p,map,legacy=null,g=null){
 if(!chapter123V30(map))return legacy;
 if(CHAPTER123_HOSTS_V30[p.id])return null;
 if(p.id==='crack')return g?.quests?.rats==='done'?object(3,58,86):settlement(5,58,86);
 if(propsById[p.id])return propsById[p.id];
 // Action semantics precede generic type: a notice with type 'book' is a sign.
 if(propsByAction[p.action])return propsByAction[p.action];
 if(p.action==='ch3-gather')return p.resource==='cinderIron'?hell(15,60, 50):hell(10,47,39);
 if(p.training)return utility(16,62,105);
 if(p.type==='herb')return furniture(8,32,29);
 if(!p.action&&p.type==='crate')return furniture(4,44,45);
 if(!p.action&&p.type==='barrel')return furniture(6,38,46);
 if(!p.action&&p.type==='pot')return settlement(7,30,34);
 return legacy;
}

// The carried medical cot/cart use the existing patient surface rig. All other
// cutaway props opt into the same new art as their interactive world counterparts.
export function chapter123StageArtV30(p,map){
 if(!chapter123V30(map)||['cot','cart'].includes(p.propKind))return null;
 const a={brokenBell:hell(13),chain:utility(11),wheel:object(1),lift:architecture(7),lamp:hell(16)}[p.propKind];
 return a?{...a,w:p.w||70,h:p.h||65}:null;
}
