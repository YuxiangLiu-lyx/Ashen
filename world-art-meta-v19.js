// Original generated artwork. Rectangles are measured on the final 1774 × 887 atlas.
// The authored arrangement is deliberately NOT treated as equal grid cells.
export const CITY_ARCHITECTURE_META_V19 = [
 {id:'copperGate',sourceRect:[20,7,439,406],anchor:[220,406]},
 {id:'stoneGuild',sourceRect:[488,8,383,414],anchor:[191,414]},
 {id:'oakBar',sourceRect:[902,57,413,352],anchor:[206,352]},
 {id:'copperForge',sourceRect:[1338,7,424,421],anchor:[211,421]},
 {id:'glassConservatory',sourceRect:[22,433,423,425],anchor:[211,425]},
 {id:'clothStall',sourceRect:[460,476,425,364],anchor:[212,364]},
 {id:'whiteBridge',sourceRect:[898,542,514,255],anchor:[257,208]},
 {id:'bellTower',sourceRect:[1467,429,263,445],anchor:[131,445]}
];
export const CITY_FURNISHINGS_META_V19 = [
 {id:'carvedOakWindow',sourceRect:[18,55,406,326],anchor:[203,326]},
 {id:'twoChairOakTable',sourceRect:[462,89,411,290],anchor:[205,290]},
 {id:'stoneBalustrade',sourceRect:[897,89,426,254],anchor:[213,250]},
 {id:'astronomyTable',sourceRect:[1355,54,397,340],anchor:[198,335]},
 {id:'ironLantern',sourceRect:[145,440,158,411],anchor:[46,405]},
 {id:'flowerStall',sourceRect:[466,461,389,373],anchor:[195,369]},
 {id:'rainBench',sourceRect:[925,458,386,374],anchor:[194,369]},
 {id:'rosePlanter',sourceRect:[1344,545,417,260],anchor:[208,242]}
];
const atlas=name=>name==='cityArchitectureV19'?CITY_ARCHITECTURE_META_V19:name==='cityFurnishingsV19'?CITY_FURNISHINGS_META_V19:null;
export function installCityArtFramesV19(bank,name){
 const rows=atlas(name);if(!rows)return;
 bank.frames[name]=rows.map(m=>({x:m.sourceRect[0],y:m.sourceRect[1],w:m.sourceRect[2],h:m.sourceRect[3],cell:{x:m.sourceRect[0],y:m.sourceRect[1],w:m.sourceRect[2],h:m.sourceRect[3]},meta:m}));
}
export function drawCityArtFrameV19(c,bank,name,index,x,y,w){
 if(!atlas(name))return false;const f=bank.frame(name,index);if(!f)return true;
 const k=w/f.w,a=f.meta.anchor;c.drawImage(bank.images[name],f.x,f.y,f.w,f.h,x-a[0]*k,y-a[1]*k,f.w*k,f.h*k);return true;
}
