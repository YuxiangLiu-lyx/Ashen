import {actorHeightV281} from './presentation-metrics-v281.js';
import {CHENGLI_ACTIONS_META_V27,WOMEN_WORLD_META_V27,ELYRIA_LIFE_META_V27,CHENGLI_WORLD_META_V27} from './character-art-meta-v27.js';
import {movementRenderAngleV23} from './movement-v23.js';
import {CLOAK_PAIR_META_V25} from './cloak-pair-meta-v25.js';
import {HERO_ACTIONS_META_V25} from './hero-actions-meta-v25.js';

export const SAGA_IMAGE_LOADS_V25=[
 ['sagaTeaV25','assets/v25/chengli-teacup-v25.png',1,1,false],
 ['sagaChengliActionsV25','assets/v281/chengli-actions.png',1,1,true],
 ['sagaWomenV25','assets/v281/women-world.png',1,1,true],
 ['sagaChengliWorldV27','assets/v281/chengli-world.png',1,1,true],
 ['sagaElyriaPortraitV27','assets/v27/elyria-portrait.png',1,1,true],
 ['sagaChengliPortraitV27','assets/v27/chengli-portrait.png',1,1,true],
 ['sagaChengliQuietPortraitV27','assets/v27/chengli-portrait-quiet.png',1,1,true],
 ['sagaElyriaLifeV27','assets/v281/elyria-life.png',1,1,true],
 ['sagaCloakV25','assets/v25/cloak-pair-v25.png',1,1,false],
 ['sagaHeroActionsV25','assets/v25/hero-actions-v25.png',1,1,false]
];
// Chapter-eight CG has been removed from the active presentation. Original files remain in the archive.
export const SAGA_ILLUSTRATIONS_V25=Object.freeze({});
export const SAGA_ILLUSTRATION_BEATS_V25=Object.freeze({});
const aliases={
 '哨兵':['npcPortraits5',6],'执旗官':['npcPortraits5',8],'征选使':['npcPortraits5',8],
 '获救姑娘':['npcPortraits5',9],'阿辛':['npcPortraits5',2],'账房':['npcPortraits5',1],
 '陶叔':['v14Portraits',4],'管事':['npcPortraits5',8],'搬夫':['npcPortraits5',2],
 '车夫':['v14Portraits',4],'护卫':['npcPortraits5',6],'药舍学徒':['npcPortraits5',2],'关卡军官':['npcPortraits5',8],
 '阿绢':['npcPortraits5',5],'老杜':['v14Portraits',4],'阿棠':['npcPortraits5',9],
 '税吏':['npcPortraits5',1],'书记员':['npcPortraits5',1],'货郎':['v14ServicePortraits',1],
 '渡船老人':['v14Portraits',4],'押送官':['npcPortraits5',8],'仓工':['npcPortraits5',2],
 '少年':['npcPortraits5',2],'维伦':['chapterPortraits',1],'卢铎':['npcPortraits5',8],
 '裁誓骑士·维瑟':['v14ExtraPortraits',1],'维瑟':['v14ExtraPortraits',1],
 '掌印审判使·赫洛恩':['v14Portraits',1],'赫洛恩':['v14Portraits',1],
 '士兵':['npcPortraits5',6],'老兵':['npcPortraits5',6],'军官':['npcPortraits5',8],
 '传令兵':['npcPortraits5',6],'妇人':['npcPortraits5',4],'跑腿少年':['npcPortraits5',2]
};
export function sagaSpeakerPortraitV25(bank,name){
 if(name==='澄璃')return bank.cropped('sagaChengliPortraitV27',0)||null;
 const pair=aliases[name];return pair?bank.cropped(...pair):null;
}
export function sagaDisguiseVisibleV25(g,cine=null){
 if(g?.sagaV25?.started&&String(cine?.map||g.map).startsWith('ch8'))return true;
 const actor=cine?.get?.('saint');
 if(typeof actor?.disguiseV25==='boolean')return actor.disguiseV25;
 return !!g?.sagaV25?.disguise;
}
export function sagaPortraitV25(bank,name,g,cine=null){
 if(name==='艾莉娅'&&sagaDisguiseVisibleV25(g,cine))return bank.cropped('sagaElyriaPortraitV27',0)||null;
 if(name==='澄璃'){
  const quiet=cine?!!cine.get?.('chengli')?.v25Spirit||['v25C8TrialRescue','v25C8Bind','v25C8After'].includes(cine.id):!!g?.sagaV25?.spirit?.unlocked;
  return bank.cropped(quiet?'sagaChengliQuietPortraitV27':'sagaChengliPortraitV27',0)||null;
 }
 return sagaSpeakerPortraitV25(bank,name)||bank.portrait(name);
}
function raster(ctx,bank,sheet,meta,a,size=84,alpha=1,anchor=null){
 const im=bank.images[sheet];if(!im||!meta)return false;
 const [x,y,w,h]=meta.sourceRect,[ax,ay]=anchor||meta.anchor,k=size/meta.referenceHeight;
 ctx.save();ctx.translate(Math.round(a.x),Math.round(a.y));
 if(Math.cos(a.angle||0)<0)ctx.scale(-1,1);
 if(a.fall&&!anchor)ctx.rotate(Math.min(1,a.fall)*1.43);
 ctx.globalAlpha*=alpha;ctx.imageSmoothingEnabled=true;
 ctx.drawImage(im,x,y,w,h,-ax*k,-ay*k,w*k,h*k);ctx.restore();return true;
}
// Shared drawActor owns depth, ground shadows, labels and quest marks.
export function sagaActorFrameV27(kind,a,g,cine=null){
 const hero=kind==='hero',saint=kind==='npc'&&a.id==='saint'||hero&&a.cls==='saint';
 if(!hero&&kind!=='npc')return null;
 const frame=(sheet,meta,size=84,alpha=1,anchor=null)=>({sheet,meta,size,alpha,anchor,angle:movementRenderAngleV23(a),shadowAlpha:anchor?0:.32*alpha,shadowRadius:size*.22});
 const cloak=cine?!!cine.get('hero')?.v25Cloak:!!g.sagaInvisibleV25?.();
 if(cloak&&(hero||saint)){
  if(!hero)return {hidden:true};
  const index=a.moving?Math.floor(Math.abs(a.walkDistance??((a.anim||0)*18))/20)%2:0;
  return frame('sagaCloakV25',CLOAK_PAIR_META_V25[index],89,cine?0.6:0.35);
 }
 if(hero&&!saint&&!a.moving&&['kneel','practice','token','seatedToken'].includes(a.v25Pose)){
  const index={kneel:0,practice:1,token:2,seatedToken:3}[a.v25Pose];
  return frame('sagaHeroActionsV25',HERO_ACTIONS_META_V25[index],84,1,a.v25SeatAnchor?HERO_ACTIONS_META_V25[index].seatAnchor:null);
 }
 const chengli=kind==='npc'&&['chengli','ch8Chengli','v25Chengli'].includes(a.id);
 const spirit=chengli&&(a.v25Spirit||a.v25Pose==='spirit'||g.sagaV25?.spirit?.unlocked&&!cine);
 if(chengli&&!a.moving&&['bandage','practice','protect','spiritSeated'].includes(a.v25Pose)){
  const index={bandage:0,practice:1,protect:2,spiritSeated:3}[a.v25Pose],m=CHENGLI_ACTIONS_META_V27.items[index];
  return frame('sagaChengliActionsV25',m,actorHeightV281(a,kind),Math.min(a.v25SpiritAlpha??1,(index===3||spirit)?0.72:1),a.v25SeatAnchor?m.seatAnchor:null);
 }
 if(!chengli&&!(saint&&sagaDisguiseVisibleV25(g,cine)))return null;
 if(saint&&!a.moving){
  if(a.pose==='sleep-bed'&&a.bedWorldV20){
   const m=ELYRIA_LIFE_META_V27.items[1],b=a.bedWorldV20;
   return {...frame('sagaElyriaLifeV27',m,(b.width||160)*m.referenceHeight/m.sourceRect[2],1,m.anchor),position:{x:b.x,y:b.y},angle:b.flip?Math.PI:0};
  }
  if(['seated','sit','drink','listen','seated-listen'].includes(a.pose))return frame('sagaElyriaLifeV27',ELYRIA_LIFE_META_V27.items[0],actorHeightV281(a,kind));
 }
 const back=Math.sin(movementRenderAngleV23(a))<-.22,row=(chengli?8:0)+(back?4:0);
 const distance=Math.abs(a.walkDistance??((a.anim||0)*18));
 const attack=!!(a.attackAnim>0||cine&&(a.attackUntil||0)>cine.time);
 const step=a.moving?[0,1,0,2][Math.floor(distance/20)%4]:attack||!chengli&&['practice','binding','heal'].includes(a.v25Pose)?3:0;
 return frame(chengli?'sagaChengliWorldV27':'sagaWomenV25',(chengli?CHENGLI_WORLD_META_V27:WOMEN_WORLD_META_V27).items[row+step],actorHeightV281(a,kind),Math.min(a.v25SpiritAlpha??1,spirit?0.72:1));
}
export function drawSagaActorV25(ctx,bank,kind,a,g,cine=null,visual=sagaActorFrameV27(kind,a,g,cine)){
 if(!visual)return false;
 if(visual.hidden)return true;
 return raster(ctx,bank,visual.sheet,visual.meta,{...a,...visual.position,angle:visual.angle},visual.size,visual.alpha,visual.anchor);
}
