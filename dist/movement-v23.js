// Locomotion uses achieved displacement. Combat aim remains the gameplay angle;
// drawing a moving actor must not turn its body on every auto-attack tick.
const angleDelta=(a,b)=>Math.abs(Math.atan2(Math.sin(a-b),Math.cos(a-b)));
export function recordWalkFacingV23(actor,dx,dy){
 const distance=Math.hypot(dx,dy);
 if(!(distance>.05))return false;
 const old=actor.walkFacingV23,prior=Number.isFinite(actor.angle)?actor.angle:0;
 // Pure vertical movement retains its previous left/right view. Small lateral
 // corrections at a wall or a path waypoint must not mirror an entire body.
 const left=Math.abs(dx)/distance>.12?dx<0:old?.left??Math.cos(prior)<0;
 const ny=dy/distance,back=(old?.back??Math.sin(prior)<-.22)?ny<-.12:ny<-.32;
 const angle=Math.atan2(dy,Math.abs(dx)/distance<=.12?(left?-1:1)*distance*.000001:dx);
 actor.angle=angle;
 actor.walkFacingV23={angle,left,back};
 return true;
}

export function movementRenderAngleV23(actor,extra={}){
 const angle=extra.angle??actor.angle??0,face=extra.walkFacingV23??actor.walkFacingV23;
 if(!face||!Number.isFinite(face.angle))return angle;
 // A later authored look/attack while stationary owns facing. While walking,
 // the legs and torso follow movement and attacks keep their own aim/effects.
 if(!(extra.moving??actor.moving)&&angleDelta(angle,face.angle)>1e-7)return angle;
 return face.back?(face.left?-Math.PI*.75:-Math.PI*.25):(face.left?Math.PI*.75:Math.PI*.25);
}

// These directions were checked against the actual V20 raster. 'Rear' is a
// camera view, not a guarantee that every source cell points to the same side.
export const HERO_SOCIAL_SOURCE_FACING_V23=Object.freeze([1,1,1,-1,-1,1]);
export function heroSocialFrameV23(actor,extra={}){
 const angle=movementRenderAngleV23(actor,extra),moving=extra.moving??actor.moving;
 const back=Math.sin(angle)<-.22,raw=extra.walkDistance??actor.walkDistance??(extra.anim??actor.anim??0)*18;
 const distance=Math.abs(Number.isFinite(raw)?raw:0),phase=Math.floor(distance/16)%4;
 const index=moving?(back?[4,3,5,3]:[1,0,2,0])[phase]:back?3:0;
 const left=Math.cos(angle)<0,flip=left!==(HERO_SOCIAL_SOURCE_FACING_V23[index]<0);
 return {index,flip,left,back,phase,angle};
}
