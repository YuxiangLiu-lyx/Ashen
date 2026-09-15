import {movementRenderAngleV23} from './movement-v23.js';
import {HERO_CALM_META_V24} from './hero-calm-meta-v24.js';

// A painted small-step cycle replaces the old high-knee/running poses. The
// physics, attack aim, collision solver and V23 facing hysteresis are untouched.
// Each row is an idle pose followed by four distinct right-facing walk poses.
export const HERO_CALM_SHEET_V24='heroCalmV24';
export const HERO_CALM_FRAME_DISTANCE_V24=20;
export function heroCalmPoseV24(actor,extra={}){
 if(actor.mercenaryId||actor.cls==='saint'||!['shadow','oath','ember'].includes(actor.cls))return null;
 if((extra.attack??actor.attackAnim??0)>0)return null;
 const angle=movementRenderAngleV23(actor,extra),back=Math.sin(angle)<-.22,left=Math.cos(angle)<0;
 const moving=!!(extra.moving??actor.moving);
 // Cinematic actors own their travelled distance; ordinary control owns anim.
 // Never let the controlled player's old walk distance advance a staged actor.
 const raw=extra.cinematic===false?(extra.anim??actor.anim??0)*18:
  extra.walkDistance??actor.walkDistance??(extra.anim??actor.anim??0)*18;
 const distance=Math.abs(Number.isFinite(raw)?raw:0),phase=Math.floor(distance/HERO_CALM_FRAME_DISTANCE_V24)%4;
 const index=(back?5:0)+(moving?phase+1:0);
 return {index,phase,back,left,flip:left,angle,moving,distance};
}
export function heroCalmFrameV24(bank,actor,extra={}){
 const pose=heroCalmPoseV24(actor,extra),m=pose&&HERO_CALM_META_V24.items[pose.index];
 if(!m||!bank.images[HERO_CALM_SHEET_V24])return null;
 const [x,y,w,h]=m.sourceRect;
 return {...pose,sheet:HERO_CALM_SHEET_V24,frame:{x,y,w,h,cell:{x,y,w,h},meta:{...m,footAnchorLocal:m.anchor,headAnchorLocal:m.head,primaryHandLocal:m.hand,secondaryHandLocal:m.offhand}},referenceHeight:m.referenceHeight};
}
export function drawCalmSocialHeroV24(c,bank,actor,extra={}){
 const calm=heroCalmFrameV24(bank,actor,extra);if(!calm)return false;
 const {frame:f,referenceHeight}=calm,[ax,ay]=f.meta.anchor,k=(extra.size||84)/referenceHeight;
 c.save();c.translate(Math.round(extra.x??actor.x),Math.round(extra.y??actor.y));if(calm.flip)c.scale(-1,1);
 c.imageSmoothingEnabled=true;
 c.drawImage(bank.images[calm.sheet],f.x,f.y,f.w,f.h,-ax*k,-ay*k,f.w*k,f.h*k);
 c.restore();return true;
}
