import {preparePhysicalStageV26,queuePhysicalMoveV26} from './scene-geometry-v26.js';
import {prepareSagaStageRuntimeV25} from './saga-staging-runtime-v25.js';
import {recordWalkFacingV23} from './movement-v23.js';
import {prepareSocialStageV20,syncSocialActorsV20} from './social-staging-v20.js';
import {prepareSceneArrivalV19,commitOptionalCompanionV19} from './scene-arrival-v19.js';
import {NARRATIVE_STAGING_V9,adjustExistingNarrativeStagingV9} from './narrative-staging-v14.js';
import {CHAPTER_STAGING} from './chapter-staging-v14.js';
Object.assign(CHAPTER_STAGING,NARRATIVE_STAGING_V9);Object.assign(STAGING.scenes,CHAPTER_STAGING);adjustExistingNarrativeStagingV9(STAGING);
import {STAGING} from './staging-v14.js';
const lerp=(a,b,t)=>a+(b-a)*t,clamp=t=>Math.max(0,Math.min(1,t));
const actor=(id,x,y,extra={})=>({id,x,y,sprite:{roadElder:7,saint:0,sister:1,steward:2,clerk:3,prelate:5,guard1:7,guard2:7,captain:7,victim1:6,victim2:11}[id],angle:0,visible:true,fall:0,...extra});
export const CINEMATIC_SCENES=new Set(['intro','aside','contract','saintBrief','assassination','canalStart','chapterEnd',...Object.keys(CHAPTER_STAGING)]);
export class Cinematic{
 constructor(g,id,line=0){this.id=id;this.g=g;this.map=STAGING.scenes[id]?.map||(['saintBrief','assassination'].includes(id)?'chapel':['canalStart','chapterEnd'].includes(id)?'canal':'hall');this.time=0;this.actionUntil=0;this.moves=[];this.events=[];this.line=-1;this.actors=[];
  const stage=this.stage=prepareSocialStageV20(prepareSceneArrivalV19(prepareSagaStageRuntimeV25(structuredClone(STAGING.scenes[id]),g,id),g,id),g,id);this.map=stage.map;if(id==='chapterEnd'&&g.map==='canal'){const saved=g.pending?.sceneOrigin,hero=saved?.hero||[g.p.x,g.p.y],saint=saved?.saint||[g.saint.x,g.saint.y];stage.actors={hero,saint};stage.initiallyHidden=[];const near=g.safePoint(hero[0]-78,hero[1]+32);stage.beats=[{line:0,moves:[['saint',near.x,near.y,.75]]},{line:13,moves:[['hero',1410,370,1.6],['saint',1410,455,1.5,.35]]}];}if(id==='selineWorkReturn'){stage.actors.hero=[g.p.x,g.p.y];stage.actors.seline=[1020,620];stage.beats=[{line:0,moves:[['hero',450,660,2],['seline',540,660,1.9]]}];}if(id.startsWith('ch3Teaching')){this.map=stage.map=g.map;const at=g.safePoint(g.p.x+88,g.p.y+30);stage.actors={hero:[g.p.x,g.p.y],saint:[at.x,at.y]};stage.focus=[g.p.x+40,g.p.y-20];} preparePhysicalStageV26(stage,g);this.actors=Object.entries(stage.actors).map(([key,[x,y]])=>actor(key,x,y,{visible:!stage.initiallyHidden?.includes(key),...stage.actorMeta?.[key]}));
  this.faceTargets={...stage.faceTargets};this.faceActors();
  if(['ch2TargetBefore','ch2TargetAfter'].includes(id)&&this.get('victim2'))this.get('victim2').sprite=3;
  for(let i=0;i<line;i++){this.setLine(i);this.fastForward();}this.setLine(line);
 }
 get(id){return this.actors.find(a=>a.id===id);}
 move(id,x,y,duration=1,delay=0,extra={}){return queuePhysicalMoveV26(this,this.rawMoveV26,id,x,y,duration,delay,extra);}
 rawMoveV26(id,x,y,duration=1,delay=0,extra={}){const a=this.get(id);if(!a)return;a.visible=true;const prev=this.moves.filter(m=>m.id===id&&m.end<=this.time+delay+.001).at(-1);this.moves.push({id,from:{x:prev?.to.x??a.x,y:prev?.to.y??a.y,fall:prev?.to.fall??a.fall},to:{x,y,...extra},start:this.time+delay,end:this.time+delay+duration});}
 cue(name,delay=0,extra={}){this.events.push({name,at:this.time+delay,...extra});}
 setLine(i){if(i===this.line)return;this.fastForward();this.line=i;const id=this.id;
  const b=this.stage.beats.find(b=>b.line===i);if(b){if(b.screenFadeV20)this.screenFadeV20={at:this.time,duration:Number(b.hold)||1.5};this.actionUntil=Math.max(this.actionUntil,this.time+(Number(b.hold)||0));for(const [key,value] of Object.entries(b.actorMeta||{})){const a=this.get(key);if(a){a.poseBeforeMoveV26=a.pose;Object.assign(a,value);if(value.gesture)a.gestureAt=this.time;}}Object.assign(this.faceTargets,b.faceTargets||{});for(const [key,x,y,duration,delay=0,arrivalMeta] of b.moves)this.move(key,x,y,duration,delay,{...(Object.hasOwn(b.fall||{},key)?{fall:b.fall[key]}:{}),...(arrivalMeta?{arrivalMeta}: {})});if(b.cue)this.cue(b.cue,(b.cueDelay||0)+(b.cue==='stab'?.38:b.cue==='seal'?.3:.2));if(b.cue==='seal')this.get('saint').sealed=true;}syncSocialActorsV20(this);
 }
 faceActors(){for(const a of this.actors){if(a.moving||this.moves.some(m=>m.id===a.id&&m.end>this.time+1e-6)||a.autoFace===false||a.renderAs==='prop')continue;const target=this.faceTargets?.[a.id]||a.faceTo;const to=Array.isArray(target)?{x:target[0],y:target[1]}:this.get(target);if(to)a.angle=Math.atan2(to.y-a.y,to.x-a.x);}}
 startOutro(){const outro=this.stage.outro;if(!outro)return false;for(const [id,value] of Object.entries(outro.actorMeta||{})){const a=this.get(id);if(a){a.poseBeforeMoveV26=a.pose;Object.assign(a,value);if(value.gesture)a.gestureAt=this.time;}}for(const [id,x,y,duration,delay] of outro.moves)this.move(id,x,y,duration,delay,Object.hasOwn(outro.fall||{},id)?{fall:outro.fall[id]}:{});this.cue(outro.cue||'door',.3);return true;}
 busy(){return this.actionUntil>this.time||this.moves.some(m=>m.end>this.time+1e-6);}
 fastForward(){this.time=Math.max(this.time,this.actionUntil,...this.moves.map(m=>m.end));this.update(0,true);}
 update(dt,silent=false){this.time+=dt;const travelled=new Map();for(const a of this.actors)a.moving=false;for(const m of this.moves){const a=this.get(m.id);if(this.time<m.start)continue;const t=clamp((this.time-m.start)/(m.end-m.start));a.geometrySeatV26=m.to.geometrySeatV26||null;a.geometryTransferV26=m.to.geometryTransferV26||null;if(m.to.walkPoseV26)a.pose=m.to.walkPoseV26;const oldX=a.x,oldY=a.y;a.x=lerp(m.from.x,m.to.x,t);a.y=lerp(m.from.y,m.to.y,t);const moved=Math.hypot(a.x-oldX,a.y-oldY);a.walkDistance=(a.walkDistance||0)+moved;travelled.set(a.id,(travelled.get(a.id)||0)+moved);recordWalkFacingV23(a,a.x-oldX,a.y-oldY);if(m.to.fall!==undefined)a.fall=lerp(m.from.fall,m.to.fall,t);if(t>=1&&m.to.arrivalMeta){Object.assign(a,m.to.arrivalMeta);delete m.to.arrivalMeta;}}
  this.moves=this.moves.filter(m=>m.end>this.time+1e-6);for(const a of this.actors)a.moving=!a.geometryTransferV26&&(travelled.get(a.id)||0)>.05&&this.moves.some(m=>m.id===a.id&&m.start<this.time&&Math.hypot(m.to.x-m.from.x,m.to.y-m.from.y)>.05);this.faceActors();syncSocialActorsV20(this);const cues=[];this.events=this.events.filter(e=>{if(e.at<=this.time){if(!silent)cues.push(e);return false;}return true;});return cues;
 }
 finish(){this.fastForward();if(this.map===this.g.map&&(['intro','contract','assassination','canalStart','chapterEnd'].includes(this.id)||Object.hasOwn(CHAPTER_STAGING,this.id))){const h=this.get(this.stage.commitActor===undefined?'hero':this.stage.commitActor);if(h&&!h.fall)this.g.relocate(h.x,h.y);commitOptionalCompanionV19(this);}}
}
