import {sceneryAlphaV26} from './scene-geometry-v26.js';
import {sagaSpeakerPortraitV25} from './saga-art-v25.js';
import {installRomanceWorldFramesV20,drawRomanceFrameV20,drawRomancePropV20} from './romance-world-v20.js';
import {movementRenderAngleV23} from './movement-v23.js';
import {heroCalmFrameV24} from './movement-v24.js';
import {drawSocialActorV20,drawSocialFurnitureV20} from './social-staging-v20.js';
import {installCityArtFramesV19,drawCityArtFrameV19} from './world-art-meta-v19.js';
import {drawNativeCitySceneryV19} from './world-art-v19.js';
import {drawIdentityActorV18,drawHeroSocialV18,identityPortraitV18} from './identity-visuals-v18.js';
import {CH5_VISUAL_FAMILIES} from './chapter5-world-v14.js';
import {V14_CITY_PROP_META} from './art-meta-v14.js';
import {installHellFrames,hellGround,drawHellMonster,drawHellNPC} from './hell-visuals-v14.js';
import {ENVIRONMENT_META_V9} from './art-quality-meta-v14.js';
import {MONSTER_WALK_META,MONSTER_CYCLES} from './monster-walk-meta-v14.js';
import {CHAPTER_WORLD_META} from './chapter-world-meta-v14.js';
import {LOTTI_META} from './lotti-meta-v14.js';
import {SISTER_META} from './sister-meta-v14.js';
import {IDLE_META} from './idle-meta-v14.js';
export function normalizeCell(c){return Array.isArray(c)?{x:c[0],y:c[1],w:c[2],h:c[3]}:c;}
import {NEW_ART_META} from './new-art-meta-v14.js';
import {ASSET_META,MONSTER_META,STORY_WALK_META} from './asset-data-v14.js';
import {appearance} from './equipment-v14.js';
import {SCENERY,WATERS,BRIDGES,BOUNDARIES,groundCell} from './world-v14.js';
import {installV11Frames,drawV11Monster,drawV11Frame} from './art-v14.js';
export const NPC_INDEX={ch5Archivist:3,ch5Smith:11,ch5Alchemist:5,ch5Barkeep:6,ch5Recruiter:1,ch5GateHost:2,ch5Merchant:5,ch5GameHost:11,ch5SquareMusician:4,saint:0,sister:1,steward:2,clerk:3,courier:4,herbalist:5,woman:6,oldwoman:7,watch:8,prelate:9,captain:10,dolly:11,guard1:8,guard2:8,'fallen-prelate':9};
const SPEAKERS={'修钟匠':['npcPortraits5',1],'引灯人':['v14ServicePortraits',0],'行商':['v14ServicePortraits',1],'铜铃侍者':['v14ServicePortraits',2],'乐师':['v14ServicePortraits',3],'雷昂':['v14Portraits',0],'维斯卡':['v14Portraits',1],'巴尔伦':['v14Portraits',2],'格蕾娜':['v14Portraits',5],'弥娅':['v14Portraits',6],'瑟琳娜':['v14Portraits',7],'教廷调查官':['v14ExtraPortraits',0],'第一近卫':['v14ExtraPortraits',1],'赛芙':['v14ExtraPortraits',2],'维兰':['v14ExtraPortraits',3],'教廷督使':['v14Portraits',1],'村妇':['v14Portraits',3],'老农':['v14Portraits',4],'传令员':['npcPortraits5',1],'卖饼人':['npcPortraits5',3],'受伤舞者':['hellPortraits',0],'奥德里克':['deepPortraits',0],'玛尔塔夫人':['deepPortraits',1],'塞维尔':['deepPortraits',2],'赫伦':['deepPortraits',3],'薇塔':['deepPortraits',4],'兰恩':['deepPortraits',5],'舞者':['hellPortraits',0],'女侍':['hellPortraits',0],'受伤侍女':['hellPortraits',0],'侍女':['hellPortraits',0],'被囚女侍':['hellPortraits',0],'莫里斯':['hellPortraits',1],'芮妲':['hellPortraits',2],'女亡魂':['hellPortraits',3],'亡魂':['hellPortraits',3],'伊芙':['hellPortraits',4],'乌洛':['hellPortraits',5],'阿芙':['hellPortraits',0],'女税户':['npcPortraits5',4],'塞琳':['chapterPortraits',0],'赫斯特':['chapterPortraits',1],'布伦':['npcPortraits5',8],'诺恩':['portraits',0],'艾莉娅':['portraits',1],'薇蕾娜':['sisterPortrait',0],'奥伦':['npcPortraits5',0],'鲁恩':['npcPortraits5',1],'阿林':['npcPortraits5',2],'米拉':['npcPortraits5',3],'蕾娜':['npcPortraits5',4],'修钟人的妹妹':['npcPortraits5',5],'托马':['npcPortraits5',6],'巡卫':['npcPortraits5',6],'卡德兰':['npcPortraits5',7],'追缉官':['npcPortraits5',8],'罗德':['npcPortraits5',8],'朵莉':['npcPortraits5',9],'洛缇':['lottiPortrait',0]};
export class ArtBank{
 constructor(){this.images={};this.frames={};this.urls={};this.grounds={};}
 async load(name,url,cols=1,rows=1,key=false){const im=new Image();im.src=url;await im.decode();const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const cx=c.getContext('2d',{willReadFrequently:true});cx.drawImage(im,0,0);const data=cx.getImageData(0,0,c.width,c.height);
  if(key){for(let i=0;i<data.data.length;i+=4){const r=data.data[i],g=data.data[i+1],b=data.data[i+2];if(r>170&&b>165&&g<Math.min(r,b)*.55)data.data[i+3]=0;}for(let pass=0;pass<2;pass++){const previous=new Uint8ClampedArray(data.data);for(let i=4;i<previous.length-4;i+=4){if(!previous[i+3])continue;const edge=!previous[i-1]||!previous[i+7]||(i>=c.width*4&&!previous[i-c.width*4+3])||(i+c.width*4<previous.length&&!previous[i+c.width*4+3]);if(edge&&previous[i]>previous[i+1]*1.25&&previous[i+2]>previous[i+1]*1.25&&previous[i]+previous[i+2]>150)data.data[i+3]=0;}}cx.putImageData(data,0,0);}
  this.images[name]=c;this.frames[name]=[];
  for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){const x=Math.round(col*c.width/cols),y=Math.round(row*c.height/rows),ex=Math.round((col+1)*c.width/cols),ey=Math.round((row+1)*c.height/rows);let x0=ex,y0=ey,x1=x,y1=y;for(let yy=y;yy<ey;yy++)for(let xx=x;xx<ex;xx++)if(data.data[(yy*c.width+xx)*4+3]>120){x0=Math.min(xx,x0);y0=Math.min(yy,y0);x1=Math.max(xx,x1);y1=Math.max(yy,y1);}this.frames[name].push({x:x0,y:y0,w:Math.max(1,x1-x0+1),h:Math.max(1,y1-y0+1),cell:{x,y,w:ex-x,h:ey-y}});}
  if(name==='chapterPortraits'){Object.assign(this.frames[name][0],{x:220,y:2,w:438,h:560});Object.assign(this.frames[name][1],{x:865,y:5,w:568,h:580});}
  for(const [i,m] of ((name==='qualityWorld'?ENVIRONMENT_META_V9:name==='chapterBodies'?CHAPTER_WORLD_META:MONSTER_WALK_META[name]|| (name==='lottiBodies'?LOTTI_META:name==='sisterBodies'?SISTER_META:name==='idleBodies'?IDLE_META:null))||NEW_ART_META[name]||(name==='storyWalk'?STORY_WALK_META:ASSET_META[name]||[])).entries()){const f=this.frames[name][i];if(m.sourceRect){[f.x,f.y,f.w,f.h]=m.sourceRect;}if(m.cell)f.cell=normalizeCell(m.cell);f.meta=m;}
 if(name==='cityWorld'){this.frames[name]=V14_CITY_PROP_META.items.map(m=>({x:m.sourceRect[0],y:m.sourceRect[1],w:m.sourceRect[2],h:m.sourceRect[3],cell:{x:m.sourceRect[0],y:m.sourceRect[1],w:m.sourceRect[2],h:m.sourceRect[3]},meta:m}));}
 installHellFrames(this,name);installV11Frames(this,name);installCityArtFramesV19(this,name);installRomanceWorldFramesV20(this,name);
 }
 frame(name,index){return this.frames[name]?.[index];}
 cropped(name,index){const key=name+':'+index;if(this.urls[key])return this.urls[key];const f=this.frame(name,index);if(!f)return '';const c=document.createElement('canvas');c.width=f.w;c.height=f.h;c.getContext('2d').drawImage(this.images[name],f.x,f.y,f.w,f.h,0,0,f.w,f.h);return this.urls[key]=c.toDataURL();}
 portrait(name){const saga=sagaSpeakerPortraitV25(this,name);if(saga)return saga;const identity=identityPortraitV18(this,name);if(identity)return identity;name=name.replace(/^(管家|书记官|信使|药师|门卫|主祭)/,'');const p=SPEAKERS[name];return p?this.cropped(...p):null;}
 draw(c,name,index,x,y,w,h,anchor=.5){if(drawRomanceFrameV20(c,this,name,index,x,y,w))return;if(drawCityArtFrameV19(c,this,name,index,x,y,w))return;const f=this.frame(name,index);if(!f)return;if(name==='cityWorld'){const k=w/f.w,a=f.meta.anchorInSourceRect;c.drawImage(this.images[name],f.x,f.y,f.w,f.h,Math.round(x-a[0]*k),Math.round(y-a[1]*k),f.w*k,f.h*k);return;}if(['medicalProps','deepProps'].includes(name)){drawV11Frame(c,this,name,index,x,y,w/f.w);return;}c.drawImage(this.images[name],f.x,f.y,f.w,f.h,Math.round(x-w*anchor),Math.round(y-h),w,h);}
 ground(id){if(!this.grounds[id]){const hell=hellGround(this,id);if(hell){this.grounds[id]=hell;while(Object.keys(this.grounds).length>3)delete this.grounds[Object.keys(this.grounds)[0]];return hell;}}if(this.grounds[id]){const hit=this.grounds[id];delete this.grounds[id];this.grounds[id]=hit;return hit;}const c=document.createElement('canvas');c.width=1600;c.height=1080;const cx=c.getContext('2d');cx.imageSmoothingEnabled=false;for(let y=0;y<1080;y+=64)for(let x=0;x<1600;x+=64){const f=this.frame('terrain',groundCell(id,x,y));cx.drawImage(this.images.terrain,f.cell.x,f.cell.y,f.cell.w,f.cell.h,x,y,64,64);}for(const [x,y,w,h] of WATERS[id]||[]){const f=this.frame('details',12),banked=['bridge','spillway'].includes(id);cx.save();if(banked)cx.filter='saturate(.35) brightness(.67)';cx.drawImage(this.images.details,f.x,f.y,f.w,f.h,x,y,w,h);cx.restore();if(banked){for(const edge of [x,x+w]){cx.fillStyle='#343c30aa';cx.fillRect(edge-11,y,22,h);for(let yy=y+18,i=0;yy<y+h;yy+=22,i++){const wide=28+(i%3)*5;this.draw(cx,'details',3,edge+(i%2?2:-2),yy,wide,25+(i%2)*3);}}}}for(const [x,y,w,h] of BOUNDARIES[id]||[]){cx.save();cx.beginPath();cx.rect(x,y,w,h);cx.clip();cx.fillStyle=['hall','warehouse','chapel','canal','guestroom','workshop','echo','inn','spillway','chamber','bridgecellar','wellcrypt'].includes(id)?'#282c2e':'#243128';if(['hall','warehouse','chapel','canal','guestroom','workshop','echo','inn','spillway','chamber','bridgecellar','wellcrypt'].includes(id))cx.fillRect(x,y,w,h);const indoor=['hall','warehouse','chapel','canal','guestroom','workshop','echo','inn','spillway','chamber','bridgecellar','wellcrypt'].includes(id);if(indoor)for(let yy=y+80;yy<y+h+80;yy+=65)for(let xx=x+35;xx<x+w+80;xx+=indoor?115:110)this.draw(cx,'world',indoor?5:4,xx,yy,indoor?125:155,indoor?80:180);cx.restore();}if(id==='exile'){const fade=cx.createLinearGradient(750,0,1480,0);fade.addColorStop(0,'#24363800');fade.addColorStop(1,'#30474b99');cx.fillStyle=fade;cx.fillRect(750,150,850,810);}const b=BRIDGES[id];if(b)this.draw(cx,'details',8,b.x+b.w/2,b.y+b.h,b.w,b.h);this.grounds[id]=c;while(Object.keys(this.grounds).length>3)delete this.grounds[Object.keys(this.grounds)[0]];return c;}
}
// Gradient geometry/color is immutable and transformed when painted.
// Reuse native vector paint so fractional coordinates and DPR are preserved.
const shadowPaintV13=new WeakMap();
function shadowGradientV13(c,w,alpha){
 let paint=shadowPaintV13.get(c);if(!paint){paint=new Map();shadowPaintV13.set(c,paint);}
 const key=w+':'+alpha;let gr=paint.get(key);if(gr)return gr;
 gr=c.createRadialGradient(0,0,1,0,0,w);gr.addColorStop(0,'rgba(15,16,18,'+alpha+')');gr.addColorStop(1,'rgba(15,16,18,0)');
 if(paint.size>=128)paint.delete(paint.keys().next().value);paint.set(key,gr);return gr;
}
export function footShadow(c,x,y,w=22,alpha=.3){c.save();c.translate(x,y);c.scale(1,.32);const gr=shadowGradientV13(c,w,alpha);c.fillStyle=gr;c.beginPath();c.arc(0,0,w,0,7);c.fill();c.restore();}
export function drawScenery(c,bank,o,player=null){
 if(o.sheet==='details'&&o.asset===15)return;
 c.save();c.globalAlpha*=sceneryAlphaV26(bank,o,player);
 try{
  if(drawRomancePropV20(c,bank,o))return;
  if(drawSocialFurnitureV20(c,bank,o,player))return;
  if(drawNativeCitySceneryV19(c,bank,o))return;
  if(!o.flat)footShadow(c,o.x,o.y,o.w*.43,.2);
  if(o.cold)c.filter='saturate(.25) brightness(.8)';
  bank.draw(c,o.sheet,o.asset,o.x,o.y,o.w,o.h);
 }finally{c.restore();}
}
function attach(c,bank,index,at,anchor,size,rotation=0,part=null){const f=bank.frame('layers',index);if(!f)return;const k=size/f.h;c.save();c.translate(at[0],at[1]);c.rotate(rotation);if(part!==null){c.beginPath();const polygon=part===0?[[0,0],[362,0],[362,43],[43,362],[0,362]]:[[362,43],[362,362],[43,362]];polygon.forEach(([x,y],i)=>{const px=(x-anchor[0])*k,py=(y-anchor[1])*k;i?c.lineTo(px,py):c.moveTo(px,py);});c.closePath();c.clip();}c.drawImage(bank.images.layers,f.x,f.y,f.w,f.h,(f.x-f.cell.x-anchor[0])*k,(f.y-f.cell.y-anchor[1])*k,f.w*k,f.h*k);c.restore();}
function ctxGlove(c,bank,sx,sy,sw,sh,at,k){c.drawImage(bank.images.layers,sx,sy,sw,sh,at[0]-sw*k/2,at[1]-sh*k/2,sw*k,sh*k);}
export function drawHero(c,bank,p,x,y,time=0,extra={}){
 extra={...extra,angle:movementRenderAngleV23(p,extra)};
 if(drawSocialActorV20(c,bank,{...p,id:'hero',x,y},time,extra))return;
 if(drawHeroSocialV18(c,bank,p,x,y,time,extra)||drawIdentityActorV18(c,bank,{...p,x,y},time,extra))return;
 if(p.cls==='saint'){drawNPC(c,bank,{id:'saint',x,y,angle:extra.angle??p.angle,moving:extra.moving??p.moving,walkDistance:(extra.anim??p.anim)*18},time,{size:extra.size||84});return;}
 const noen=!p.mercenaryId&&['shadow','oath','ember'].includes(p.cls),look=appearance(p),cls={shadow:0,oath:1,ember:2}[p.cls],duration=extra.cinematic?(p.cls==='oath'?.44:.36):p.attackKind==='attack'?(p.attackDuration||.36):p.attackKind==='cleave'?.48:p.cls==='oath'?.44:.36,attack=extra.attack??p.attackAnim,phase=Math.max(0,Math.min(3,Math.floor((duration-attack)/duration*4))),back=Math.sin(extra.angle??p.angle)<-.22,idle=!(extra.moving??p.moving)&&!(attack>0),calm=heroCalmFrameV24(bank,p,extra),bodyName=calm?.sheet||(idle?'idleBodies':back?'backBodies':'bodies'),frame=calm?.index??(idle?cls+(back?3:0):back?cls*4+((extra.moving??p.moving)||attack>0?Math.floor(extra.anim??p.anim)%4:1):cls*8+(attack>0?4+phase:(extra.moving??p.moving)?Math.floor(extra.anim??p.anim)%4:0)),f=calm?.frame||bank.frame(bodyName,frame);if(!f)return;
 const meta=f.meta,foot=meta.footAnchorLocal,unit=84/(calm?calm.referenceHeight:idle?f.h:Math.max(...bank.frames[bodyName].slice(cls*(back?4:8),cls*(back?4:8)+4).map(a=>a.h))),local=a=>[(a[0]-foot[0])*unit,(a[1]-foot[1])*unit];
 c.save();c.translate(Math.round(x),Math.round(y));const zoom=(extra.size||84)/84;c.scale((Math.cos(extra.angle??p.angle)<0?-1:1)*zoom,zoom);c.imageSmoothingEnabled=!!calm;
 const head=local(meta.headAnchorLocal),hand=local(meta.primaryHandLocal),offhand=local(meta.secondaryHandLocal);
 // Generic legacy hood/cape/paired boots do not follow a living body.
 // Noen keeps authored clothing/feet during movement and attack transitions;
 // inventory stats/slots and the three original class attack bodies are unchanged.
 if(look.chest&&!noen){const cf=bank.frame('layers',look.chest.layer);attach(c,bank,look.chest.layer,[head[0]-9,head[1]+16],cf.meta.shoulderAttachLocal,59);}
 c.save();if(look.chest?.tier==='epic')c.filter='brightness(1.12) saturate(1.12)';c.drawImage(bank.images[bodyName],f.x,f.y,f.w,f.h,(f.x-f.cell.x-foot[0])*unit,(f.y-f.cell.y-foot[1])*unit,f.w*unit,f.h*unit);c.restore();
 if(look.feet&&!noen)bank.draw(c,'layers',11,3,0,28,20);
 if(look.head!==null&&!noen){const hf=bank.frame('layers',look.head);attach(c,bank,look.head,head,hf.meta.faceOpeningCenterLocal||hf.meta.headAttachLocal,33);}
 if(look.hands){const glove=bank.frame('layers',10),k=11/glove.h;for(const [i,at] of [offhand,hand].entries()){if(calm?.back&&i===0)continue;const sx=glove.cell.x+(i?197:74),sy=glove.cell.y+101;ctxGlove(c,bank,sx,sy,109,132,at,k);}}
 if(look.weapon&&!extra.hideWeapon){const layer=look.weapon==='daggers'?0:['greatsword','sword'].includes(look.weapon)?1:look.weaponTier==='epic'?3:2,wf=bank.frame('layers',layer),wm=wf.meta;let grip=wm.gripLocal,tip=wm.tipLocal;if(layer===0){grip=grip[0];tip=tip[0];}const sourceAngle=Math.atan2(tip[1]-grip[1],tip[0]-grip[0]);const target=['staff','wand'].includes(look.weapon)?(attack>0&&p.attackKind==='cleave'?[-2,-1.2,.3,.9][phase]:attack>0?[-1.3,-1.65,-.55,-1.3][phase]:-1.3):attack>0?[-1.9,-1.1,.3,.8][phase]:calm&&look.weapon==='greatsword'?-.85:calm&&look.weapon==='sword'?.3:.9;const size=look.weapon==='daggers'?30:look.weapon==='greatsword'?59:look.weapon==='sword'?42:look.weapon==='wand'?32:49;c.save();if(look.weaponTier==='rare')c.filter='brightness(1.12)';if(look.weaponTier==='epic')c.filter='brightness(1.2) saturate(1.25)';attach(c,bank,layer,hand,grip,size,target-sourceAngle,layer===0?0:null);if(layer===0&&look.offhand&&!calm?.back){const offGrip=wm.gripLocal[1],offTip=wm.tipLocal[1],oa=Math.atan2(offTip[1]-offGrip[1],offTip[0]-offGrip[0]);attach(c,bank,0,offhand,offGrip,size,(attack>0?-target:1.4)-oa,1);}c.restore();}
 if(look.offhand&&look.weapon!=='daggers'&&!extra.hideWeapon&&!calm?.back){const layer=['sword','greatsword'].includes(look.offhand)?1:2,wf=bank.frame('layers',layer),wm=wf.meta,grip=wm.gripLocal,tip=wm.tipLocal,source=Math.atan2(tip[1]-grip[1],tip[0]-grip[0]);attach(c,bank,layer,offhand,grip,look.offhand==='wand'?30:39,(attack>0?-.9:calm?.4:1.4)-source);}
 if(look.relic&&!calm?.back)bank.draw(c,'equipIcons',3,head[0],head[1]+31,9,9);c.restore();
}
function anchored(c,bank,name,index,x,y,size,flip=false,fall=0){const f=bank.frame(name,index);if(!f)return;const m=f.meta,k=size/(m.bodyHeight||f.h);c.save();c.translate(x,y);if(flip)c.scale(-1,1);if(fall)c.rotate(fall*1.43);c.drawImage(bank.images[name],f.x,f.y,f.w,f.h,(f.x-f.cell.x-m.footAnchorLocal[0])*k,(f.y-f.cell.y-m.footAnchorLocal[1])*k,f.w*k,f.h*k);c.restore();}
export function drawNPC(c,bank,a,time=0,{hood=false,size=82}={}){if(drawSocialActorV20(c,bank,a,time,{hood,size}))return;if(drawIdentityActorV18(c,bank,a,time,{hood,size}))return;if(['mentor','leon'].includes(a.id)){drawMonster(c,bank,{...a,type:'captain',walkDistance:a.walkDistance||0},time);return;}if(drawHellNPC(c,bank,a,time,size))return;const back=Math.sin(a.angle||0)<-.22,flip=Math.cos(a.angle||0)<0,index=hood?12:NPC_INDEX[a.id]??a.sprite??3;if(['seline','hester'].includes(a.id)){anchored(c,bank,'chapterBodies',(a.id==='hester'?4:0)+(a.moving&&!back?2+Math.floor((a.walkDistance||time*60)/18)%2:back?1:0),a.x,a.y,size,flip,a.fall||0);return;}if(['guard1','guard2','messenger','bridgewatch','bren','bodyguard1','bodyguard2','bodyguard3'].includes(a.id)){drawMonster(c,bank,{...a,type:['bren','bodyguard1'].includes(a.id)?'captain':'guard',walkDistance:a.walkDistance||time*75},time);return;}if(a.id==='lotti'){anchored(c,bank,'lottiBodies',(back?4:0)+(a.moving?1+Math.floor(time*8)%3:0),a.x,a.y,size,flip);return;}if(a.id==='sister'){anchored(c,bank,'sisterBodies',(back?4:0)+(a.moving?1+Math.floor(time*8)%3:0),a.x,a.y,size,flip);return;}if(back){anchored(c,bank,'backNPC',index,a.x,a.y,size,flip,a.fall||0);return;}if(a.id==='sister'){anchored(c,bank,a.moving?'darkWalk':'backNPC',a.moving?Math.floor((a.walkDistance||time*65)/18)%4:13,a.x,a.y,size,flip);return;}if(a.id==='saint'&&a.moving){const row=hood?1:0,frame=row*4+(a.moving?Math.floor((a.walkDistance||time*65)/18)%4:1),f=bank.frame('storyWalk',frame);if(f){const m=f.meta,k=m.worldScale*size/80;c.save();c.translate(a.x,a.y);if(flip)c.scale(-1,1);c.drawImage(bank.images.storyWalk,f.x,f.y,f.w,f.h,(f.x-f.cell.x-m.footAnchorLocal[0])*k,(f.y-f.cell.y-m.footAnchorLocal[1])*k,f.w*k,f.h*k);c.restore();return;}}const f=bank.frame('actors',index);if(!f)return;c.save();c.translate(a.x,a.y);if(flip)c.scale(-1,1);if(a.fall)c.rotate(a.fall*1.43);bank.draw(c,'actors',index,0,0,f.w*size/f.h,size);c.restore();}
export function monsterPoseV8(a,time=0){
  const cfg=MONSTER_CYCLES[a.type]||MONSTER_CYCLES.guard;
  const isGuard=a.type==='guard'||a.type==='captain';
  const back=isGuard&&Math.sin(a.angle||0)<-.22;
  const attacking=a.attackAnim>0;
  const phase=attacking?7:a.type==='bat'?1+Math.floor(time*8+(a.flapOffset||0))%6:a.moving&&!a.wind?1+Math.floor((a.walkDistance||0)/cfg.stride*6)%6:0;
  return {cfg,index:cfg.offset+(back?8:0)+phase,phase};
}

export function drawMonster(c,bank,a,time=0){
  c.save();
  try{
    if(a.v28Filter)c.filter=a.v28Filter;
    if(a.v28VisualType)a={...a,type:a.v28VisualType};
    if(CH5_VISUAL_FAMILIES[a.type])a={...a,type:CH5_VISUAL_FAMILIES[a.type]};
    if(drawHellMonster(c,bank,a,time))return;
    const {cfg,index}=monsterPoseV8(a,time),f=bank.frame(cfg.sheet,index);
    if(!f?.meta)return;
    const m=f.meta,k=cfg.size/m.bodyHeight,lift=a.type==='bat'?29+Math.sin(time*2.4+(a.flapOffset||0))*.7:0;
    c.save();
    c.translate(Math.round(a.x),Math.round(a.y-lift));
    if(Math.cos(a.angle||0)<0)c.scale(-1,1);
    if(a.fall&&(a.type==='guard'||a.type==='captain'))c.rotate(a.fall*1.43);
    c.imageSmoothingEnabled=false;
    c.drawImage(bank.images[cfg.sheet],f.x,f.y,f.w,f.h,(f.x-f.cell.x-m.footAnchorLocal[0])*k,(f.y-f.cell.y-m.footAnchorLocal[1])*k,f.w*k,f.h*k);
    c.restore();
  }finally{c.restore();}
}

export {SCENERY};
