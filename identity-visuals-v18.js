import {drawFittedEquipmentV281,drawWeaponSignatureV281} from './equipment-art-v281.js';
import {IDENTITY_META_V18} from './identity-meta-v18.js';

// One stable identity controls exploration, staging, companion combat and paper dolls.
// Existing portrait art is untouched. Coordinates remain actor ground pivots.
export const VISUAL_IDENTITIES_V18=Object.freeze({
 aelia:{name:'艾莉娅',sheet:'identityCityV18',row:0,portrait:['portraits',1]},
 graena:{name:'格蕾娜',sheet:'identityCityV18',row:1,portrait:['v14Portraits',5]},
 miya:{name:'弥娅',sheet:'identityCityV18',row:2,portrait:['v14Portraits',6]},
 serena:{name:'瑟琳娜',sheet:'identityCityV18',row:3,portrait:['v14Portraits',7]},
 saiph:{name:'赛芙',sheet:'identityServiceV18',row:0,portrait:['v14ExtraPortraits',2]},
 merchant:{name:'行商',sheet:'identityServiceV18',row:1,portrait:['v14ServicePortraits',1]},
 arcadeHost:{name:'铜铃侍者',sheet:'identityServiceV18',row:2,portrait:['v14ServicePortraits',2]},
 vyra:{name:'薇菈',sheet:'identityPartyV18',row:0,portrait:['partyPortraitsV18',0]},
 linet:{name:'莉奈',sheet:'identityPartyV18',row:1,portrait:['partyPortraitsV18',1]},
 serin:{name:'薇瑟',sheet:'identityPartyV18',row:2,portrait:['partyPortraitsV18',2]}
});
const ALIASES={saint:'aelia',ch5Smith:'graena',ch5Alchemist:'miya',ch5Barkeep:'serena',ch5Recruiter:'saiph',ch5Merchant:'merchant',ch5GameHost:'arcadeHost'};
for(const [key,value] of Object.entries(VISUAL_IDENTITIES_V18)){ALIASES[key]=key;ALIASES[value.name]=key;}
export function visualIdentityV18(actor){
 if(typeof actor==='string')return ALIASES[actor]||null;
 if(!actor)return null;
 return ALIASES[actor.visualIdentity]||ALIASES[actor.mercenaryId]||ALIASES[actor.id]||(actor.cls==='saint'?'aelia':null);
}
export function identityPortraitV18(bank,name){const key=visualIdentityV18(name),d=VISUAL_IDENTITIES_V18[key];return d?bank.cropped(...d.portrait):null;}
const lifePoses={seated:8,sit:8,drink:9,listen:10,carried:11,lying:12,sleep:12,tired:13,care:14,'seated-listen':15};
const handCoordinates={
 0:[[16,-31],[-10,-30]],1:[[25,-37],[-9,-29]],2:[[19,-29],[-4,-38]],3:[[34,-49],[-5,-35]],
 4:[[15,-31],[-13,-29]],5:[[15,-30],[-15,-30]],6:[[16,-30],[-14,-29]],7:[[26,-48],[10,-44]]
};
export function identityPoseV18(actor,time=0,extra={}){
 if(extra.pose!==undefined)actor={...actor,pose:extra.pose};
 const key=visualIdentityV18(actor),def=VISUAL_IDENTITIES_V18[key];if(!def)return null;
 const moving=extra.moving??actor.moving,angle=extra.angle??actor.angle??0,attack=extra.attack??actor.attackAnim??0;
 const back=Math.sin(angle)<-.22,walk=Number.isFinite(actor.walkDistance)?actor.walkDistance:(extra.anim??actor.anim??0)*18;
 let column=back?4:0;
 if(moving)column=(back?4:0)+[1,0,2,0][Math.floor(Math.abs(walk)/13)%4];
 if(attack>0){const duration=actor.attackDuration||.36,t=Math.max(0,Math.min(1,1-attack/duration));column=t<.3?7:t<.78?3:0;}
 else if(['work','gesture','pour','offer','welcome','guard','practice'].includes(actor.pose))column=actor.pose==='guard'||actor.pose==='welcome'?7:3;
 let sheet=def.sheet,index=def.row*8+column,row=def.row,life=false;
 if(key==='aelia'&&Object.hasOwn(lifePoses,actor.pose)){sheet='saintLifeV18';index=lifePoses[actor.pose];row=1;life=true;}
 else if(key==='aelia'&&extra.hood){sheet='saintLifeV18';index=column;row=0;}
 const metadata=IDENTITY_META_V18[sheet],frame=metadata.items[index];
 return {key,sheet,index,column,frame,referenceHeight:metadata.rowReferenceHeights[row],flip:life&&typeof actor.poseFlip==='boolean'?actor.poseFlip:Math.cos(angle)<0,back:column>=4&&column<=6,life,attack:attack>0};
}
// Equipment uses its actual weapon type and the original hand-grip atlas metadata.
// The body keeps its portrait's costume; actual weapons, a brow piece and a relic are layered.
function weapon(c,bank,type,at,rotation,rarity,offhand=false){
 const index=type==='daggers'?0:['sword','greatsword'].includes(type)?1:rarity==='epic'?3:2;
 const f=bank.frame('layers',index);if(!f?.meta||!bank.images.layers)return;
 const m=f.meta,part=type==='daggers'?(offhand?1:0):null,grip=part===null?m.gripLocal:m.gripLocal[part],tip=part===null?m.tipLocal:m.tipLocal[part];
 if(!grip||!tip)return;
 const size=type==='daggers'?29:type==='greatsword'?57:type==='sword'?41:type==='wand'?32:49,k=size/f.h,source=Math.atan2(tip[1]-grip[1],tip[0]-grip[0]);
 c.save();c.translate(...at);c.rotate(rotation-source);
 if(part!==null){const poly=part===0?[[0,0],[362,0],[362,43],[43,362],[0,362]]:[[362,43],[362,362],[43,362]];c.beginPath();poly.forEach(([x,y],i)=>i?c.lineTo((x-grip[0])*k,(y-grip[1])*k):c.moveTo((x-grip[0])*k,(y-grip[1])*k));c.closePath();c.clip();}
 c.drawImage(bank.images.layers,f.x,f.y,f.w,f.h,(f.x-f.cell.x-grip[0])*k,(f.y-f.cell.y-grip[1])*k,f.w*k,f.h*k);c.restore();
}
function equipment(c,bank,actor,pose,extra){
 const g=actor.gear;if(!g||pose.life||extra.hideWeapon)return;
 const hands=handCoordinates[pose.column],primary=g.weapon||g.offhand,secondary=g.weapon?g.offhand:null;
 if(primary?.weaponType){const ranged=['wand','staff'].includes(primary.weaponType),rotation=pose.attack?(pose.column===7?-1.9:pose.column===3?-.15:.8):ranged?-1.35:.9;weapon(c,bank,primary.weaponType,hands[0],rotation,primary.rarity);drawWeaponSignatureV281(c,primary,hands[0],rotation,primary.weaponType==='wand'?32:49,hands[1]);}
 if(secondary?.weaponType){weapon(c,bank,secondary.weaponType,hands[1],pose.attack?.45:1.4,secondary.rarity,true);drawWeaponSignatureV281(c,secondary,hands[1],pose.attack?.45:1.4,32);}
 drawFittedEquipmentV281(c,g,{head:[0,-65],hand:hands[0],offhand:hands[1]},actor.cls||'saint',0,{back:pose.back});

 // A fitted metal brow piece, rather than the old generic men's whole-head sprite.

}
export function drawIdentityActorV18(c,bank,actor,time=0,extra={}){
 if(extra.pose!==undefined)actor={...actor,pose:extra.pose};
 const pose=identityPoseV18(actor,time,extra);if(!pose||!bank.images[pose.sheet])return false;
 const m=pose.frame,[sx,sy,sw,sh]=m.sourceRect,[ax,ay]=m.anchorInSourceRect,size=extra.size||82;
 let k=size/pose.referenceHeight,x=extra.x??actor.x??0,y=extra.y??actor.y??0;
 if(actor.pose==='carried'){k=size/300;x+=20;y-=32;}
 if(actor.pose==='lying'||actor.pose==='sleep')k=size/300;
 c.save();c.translate(Math.round(x),Math.round(y));if(pose.flip)c.scale(-1,1);
 if(actor.fall&&!pose.life)c.rotate(Math.min(1,actor.fall)*1.43);
 c.imageSmoothingEnabled=true;
 c.save();if(m.clipPolygon){c.beginPath();m.clipPolygon.forEach(([px,py],i)=>i?c.lineTo((px-ax)*k,(py-ay)*k):c.moveTo((px-ax)*k,(py-ay)*k));c.closePath();c.clip();}
 c.drawImage(bank.images[pose.sheet],sx,sy,sw,sh,-ax*k,-ay*k,sw*k,sh*k);
 c.restore();
 c.scale(size/82,size/82);equipment(c,bank,actor,pose,extra);c.restore();return true;
}
export function drawHeroSocialV18(c,bank,actor,x,y,time=0,extra={}){
 const pose=extra.pose??actor.pose,row={shadow:0,oath:1,ember:2}[actor.cls];
 if(row===undefined||actor.mercenaryId||!['seated','sit','drink','listen','carry'].includes(pose)||!bank.images.heroLifeV18)return false;
 const moving=extra.moving??actor.moving,walk=(extra.anim??actor.anim??0)*18;
 const column=pose==='carry'?(moving&&Math.floor(Math.abs(walk)/16)%2?3:2):pose==='drink'?1:0;
 const meta=IDENTITY_META_V18.heroLifeV18,m=meta.items[row*4+column],[sx,sy,sw,sh]=m.sourceRect,[ax,ay]=m.anchorInSourceRect,k=(extra.size||84)/meta.rowReferenceHeights[row];
 c.save();c.translate(Math.round(x),Math.round(y));if(Math.cos(extra.angle??actor.angle??0)<0)c.scale(-1,1);c.imageSmoothingEnabled=true;c.drawImage(bank.images.heroLifeV18,sx,sy,sw,sh,-ax*k,-ay*k,sw*k,sh*k);c.restore();return true;
}
export const IDENTITY_LOADS_V18=[
 ['identityCityV18','assets/v18/city-identities-v18.png',8,4,true],
 ['identityServiceV18','assets/v18/city-service-identities-v18.png',8,3,true],
 ['identityPartyV18','assets/v18/party-identities-v18.png',8,3,true],
 ['saintLifeV18','assets/v18/saint-life-v18.png',8,2,true],
 ['heroLifeV18','assets/v18/hero-life-v18.png',4,3,true],
 ['partyPortraitsV18','assets/v18/party-portraits-v18.png',3,1,true]
];
