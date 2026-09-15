/** V12 medical staging: independent, no game imports. Root injects production registries.
 * Keeps dialogue IDs/line order. Requires installMedicalTransport and medicalPatientPose
 * in the renderer; does not move anything in the source checkout by itself.
 */
const clone = value => structuredClone(value);
const mv = (id,x,y,duration=.55,delay=0) => [id,x,y,duration,delay];
const bt = (line,moves=[],extra={}) => ({line,moves,...extra});
const add = (a,b) => [a[0]+b[0],a[1]+b[1]];
const mix = (a,b,t) => a+(b-a)*t;
const clamp = n => Math.max(0,Math.min(1,n));
export const MEDICAL_STAGING_V12 = {
  patientGround:[785,785],cot:[535,545],rescuePark:[955,805],campPark:[650,730],
  // Derived from the approved cart art, not guessed: (pullHandle-footAnchor)*84/576.9229 + hand height.
  pullerOffset:[-110.947,20.018],escortOffset:[80,60],handHeight:38,
  cartWorldScale:84/576.922871794,
};
export function groundPatientPose(x,y,fall=1){return {x:x-35,y:y-5,angle:clamp(fall)*1.43,size:84};}
function surfacePose(cine,a,surface,patientPosition,target=null){
  if(surface==='standing')return {x:target?.[0]??a.x,y:target?.[1]??a.y,angle:0,size:84};
  if(surface==='ground')return groundPatientPose(a.x,a.y,a.fall);
  const carrier=typeof target==='string'?cine.get(target):null;
  const q=Array.isArray(target)?target:carrier?[carrier.x,carrier.y]:[a.x,a.y];
  return patientPosition(q[0],q[1],surface==='cart');
}
function helpers(pose){
  // Both hands stay at the body's shoulder/leg ends. World feet are below the hands.
  const shoulder=[pose.x+Math.sin(pose.angle)*pose.size*.82,pose.y-Math.cos(pose.angle)*pose.size*.82];
  // Keep the leg helper outside the cot's near-left post, not directly inside that post.
  return {mechanist:[pose.x-34,pose.y+48],saint:[shoulder[0]+18,shoulder[1]+45]};
}
const binding=(target,offset=[0,0],walking=false)=>({attachedTo:target,transportBind:true,attachmentOffset:offset,transportWalk:walking});
const detach={attachedTo:null,transportBind:false,transportWalk:false};
const patientMeta=surface=>({standing:false,fall:1,patientSurface:surface,...binding(surface)});

/** Call after all previous staging installers. Pass CHAPTER_STAGING too: they share scene objects. */
export function applyMedicalStagingV12(STAGING,CHAPTER_STAGING,patientPosition,{MAPS=null,SCENERY=null,pullerOffset=MEDICAL_STAGING_V12.pullerOffset}={}){
  const scenes=STAGING.scenes||STAGING;
  const put=(id,patch)=>{const old=clone(scenes[id]);if(!old)throw new Error('Missing medical scene '+id);const st={...old,...patch};scenes[id]=st;if(CHAPTER_STAGING)CHAPTER_STAGING[id]=st;return st;};
  const H=clone(scenes.ch3RescueCart.actorMeta.hero),A=clone(scenes.ch3RescueCart.actorMeta.saint),M=clone(scenes.ch3RescueCart.actorMeta.mechanist),D=clone(scenes.ch3Doctor.actorMeta.doctor);
  const cartMeta={renderAs:'prop',propKind:'cart',standing:false,autoFace:false,depthYOffset:-10};
  const cotMeta={renderAs:'prop',propKind:'cot',standing:false,autoFace:false,depthYOffset:-10};
  const C=MEDICAL_STAGING_V12.cot,P=MEDICAL_STAGING_V12.rescuePark,CP=MEDICAL_STAGING_V12.campPark;
  const ground=helpers(groundPatientPose(...MEDICAL_STAGING_V12.patientGround));
  const load=helpers(patientPosition(...P,true));
  const campLoad=helpers(patientPosition(...CP,true));
  const bed=helpers(patientPosition(...C,false));
  const start=[1260,590],startPull=add(start,pullerOffset),parkPull=add(P,pullerOffset);
  const escort=add(P,MEDICAL_STAGING_V12.escortOffset);
  put('ch3RescueCart',{
    actors:{hero:[785,785],saint:[715,825],mechanist:startPull,cart:start},
    actorMeta:{hero:{...H,...detach,fall:1,standing:false,patientSurface:'ground'},saint:{...A},mechanist:{...M,...binding('cart',pullerOffset,true)},cart:cartMeta},
    initiallyHidden:['mechanist','cart'],commitActor:null,focus:[875,780],
    faceTargets:{saint:'mechanist',mechanist:'saint'},
    beats:[
      // First her call is answered at a distance. The longer pull begins after she says she is bringing it.
      bt(1,[mv('cart',1210,620,.55),mv('mechanist',...add([1210,620],pullerOffset),.55)],{cue:'cart_wheel'}),
      bt(4,[mv('cart',1110,710,.8),mv('cart',...P,1.1,.8)],{cue:'cart_wheel'}),
      bt(7,[mv('mechanist',...ground.mechanist,.75),mv('saint',710,900,.35),mv('saint',ground.saint[0],900,.65,.35),mv('saint',...ground.saint,.45,1)],{actorMeta:{mechanist:{...detach,pose:'work'},saint:{pose:'support_patient'}}}),
      bt(8,[mv('hero',...P,1.35),mv('mechanist',...load.mechanist,1.35),mv('saint',...load.saint,1.35)],{
        cue:'cloth',patientTransfers:[{actor:'hero',from:'ground',to:'cart',target:'cart',duration:1.35}],
        afterActorMeta:{hero:patientMeta('cart'),mechanist:{pose:null},saint:{pose:null}},
      }),
      // Walk around the near side of the wheel. She does not cross the mattress or the low rock pile.
      bt(9,[mv('mechanist',...parkPull,.8),mv('saint',965,805,.3),mv('saint',970,865,.5,.3),mv('saint',...escort,.45,.8)],{
        afterActorMeta:{mechanist:{...binding('cart',pullerOffset,true),pose:'pull_cart'}},
        faceTargets:{mechanist:'saint',saint:'mechanist'},
      }),
    ],
    outro:{moves:[mv('cart',865,850,.9),mv('cart',790,887,.8,.9),mv('saint',945,910,.9),mv('saint',870,947,.8,.9)],cue:'cart_wheel',fadeOut:.4},
    notes:'双手端按原图锚点标定。到场和离场均向左下；最后 0.4 秒淡出表示抵营途中省略，不冒充地图东北出口。伤者仅绑定车，不另写一套重复路径。'},
  );

  put('ch3Doctor',{
    actors:{hero:[...CP],cart:[...CP],cot:[...C],saint:[760,745],doctor:[650,470],mechanist:add(CP,pullerOffset)},
    actorMeta:{hero:{...H,...patientMeta('cart')},cart:cartMeta,cot:cotMeta,saint:{...A},doctor:{...D},mechanist:{...M}},
    commitActor:'saint',focus:[555,580],
    beats:[
      bt(0,[mv('doctor',625,505,.55)]),
      bt(1,[
        mv('doctor',665,510,.4),
        mv('mechanist',...campLoad.mechanist,.5),mv('saint',...campLoad.saint,.5),
        mv('hero',...C,1.2,.5),mv('mechanist',...bed.mechanist,1.2,.5),mv('saint',...bed.saint,1.2,.5),
        mv('mechanist',440,585,.45,1.7),mv('saint',635,595,.5,1.7),mv('doctor',625,505,.5,2.2),
      ],{cue:'cloth',patientTransfers:[{actor:'hero',from:'cart',to:'cot',target:'cot',duration:1.2,delay:.5}],
        actorMeta:{mechanist:{pose:'work'},saint:{pose:'support_patient'}},afterActorMeta:{hero:patientMeta('cot'),mechanist:{pose:null},saint:{pose:null}}}),
      bt(3,[mv('doctor',620,525,.3)],{faceTargets:{doctor:'hero',saint:'hero'}}),
      bt(6,[],{faceTargets:{doctor:'saint',saint:'doctor'}}),
      // Clear the bed's southern edge. The empty cart stays southeast, outside this route.
      bt(9,[mv('mechanist',440,605,.25),mv('mechanist',540,605,.6,.25)],{faceTargets:{mechanist:'saint',saint:'mechanist'}}),
      bt(12,[],{faceTargets:{doctor:'saint',saint:'doctor'}}),
    ],
    faceTargets:{doctor:'saint',saint:'doctor',mechanist:'hero'},
    notes:'车停病床东南的空地，双方先托住肩与脚再抬到固定病床。patientTransfers 在动作完毕后挂接 cot；无附着提前切换、无病人独自平移。'},
  );

  for(const id of ['ch3MedicineDeparture','ch3Treatment','ch3Wake']){
    const st=scenes[id];st.actorMeta.hero={...st.actorMeta.hero,...patientMeta('cot')};st.actorMeta.cot={...st.actorMeta.cot,...cotMeta};
  }
  const wake=scenes.ch3Wake;
  wake.beats=wake.beats.map(b=>b.line===12?{...b,moves:[mv('doctor',685,645,.7),mv('doctor',435,645,1.25,.7),mv('doctor',355,535,.75,1.95)]}:b);
  wake.outro={moves:[mv('hero',580,605,1.15)],patientTransfers:[{actor:'hero',from:'cot',to:'standing',target:[580,605],duration:1.15}],afterActorMeta:{hero:{...detach,patientSurface:null,standing:true,fall:0}},cue:'cloth'};
  wake.notes='诺恩始终固定在床面；最后一句后才以连续身体姿态下床。医生走床脚南侧，再去西侧水炉，不再穿床。';
  // The same low rock remains in the scene, moved out of the ambulance's actual silhouette.
  if(MAPS&&SCENERY){const rock=SCENERY.hellWall?.find(o=>o.id==='wall-south-pile');if(rock&&!rock.v12MedicalClearance){const old=rock.box?.slice();rock.x=1160;rock.y=900;rock.box=[1094,866,132,34];rock.v12MedicalClearance=true;const list=MAPS.hellWall.blocks,index=list.findIndex(b=>old&&b.every((n,i)=>n===old[i]));if(index>=0)list[index]=rock.box.slice();}}
  return ['ch3RescueCart','ch3Doctor','ch3MedicineDeparture','ch3Treatment','ch3Wake'];
}

function assignMeta(cine,map){for(const[id,patch]of Object.entries(map||{})){const a=cine.get(id);if(a)Object.assign(a,patch);}}
function syncBindings(cine){
  for(const a of cine.actors){if(!a.transportBind||!a.attachedTo||a._medicalTween)continue;const carrier=cine.get(a.attachedTo);if(!carrier)throw new Error('Missing stage carrier '+a.attachedTo);const oldX=a.x,oldY=a.y,[ox,oy]=a.attachmentOffset||[0,0];a.x=carrier.x+ox;a.y=carrier.y+oy;a.visible=carrier.visible;
    a.moving=!!(a.transportWalk&&carrier.moving);if(a.moving){a.walkDistance=(a.walkDistance||0)+Math.hypot(a.x-oldX,a.y-oldY);a.angle=carrier.angle;}else if(!a.transportWalk){a.moving=false;a.attackUntil=0;}
  }
}
function queueMedical(cine,payload,patientPosition){
  for(const tr of payload?.patientTransfers||[]){const a=cine.get(tr.actor),from=surfacePose(cine,a,tr.from,patientPosition),to=surfacePose(cine,a,tr.to,patientPosition,tr.target),targetActor=typeof tr.target==='string'?cine.get(tr.target):null;
    a._medicalTween={start:cine.time+(tr.delay||0),end:cine.time+(tr.delay||0)+tr.duration,from,to,target:targetActor?[targetActor.x,targetActor.y]:tr.target,toSurface:tr.to,targetID:targetActor?.id};Object.assign(a,detach);a.moving=false;a.standing=false;a.fall=1;
  }
  if(payload?.afterActorMeta||payload?.afterFaceTargets){const end=Math.max(cine.time,...cine.moves.map(m=>m.end),...cine.actors.filter(a=>a._medicalTween).map(a=>a._medicalTween.end));(cine._medicalAfter||=[]).push({end,meta:payload.afterActorMeta,faceTargets:payload.afterFaceTargets});}
}
function settleMedical(cine){
  for(const a of cine.actors){const tw=a._medicalTween;if(!tw||cine.time<tw.end)continue;if(Array.isArray(tw.target)){a.x=tw.target[0];a.y=tw.target[1];}delete a._medicalTween;
    if(tw.toSurface==='standing')Object.assign(a,{...detach,patientSurface:null,standing:true,fall:0,moving:false});
    else Object.assign(a,{...binding(tw.targetID||tw.toSurface),patientSurface:tw.toSurface,standing:false,fall:1,moving:false});
  }
  for(const pending of cine._medicalAfter||[])if(cine.time>=pending.end){assignMeta(cine,pending.meta);Object.assign(cine.faceTargets,pending.faceTargets||{});}
  cine._medicalAfter=(cine._medicalAfter||[]).filter(p=>p.end>cine.time);syncBindings(cine);cine.faceActors();
}
/** This small engine adapter is also used by the verification runner on real production Cinematic. */
export function installMedicalTransport(Cinematic,patientPosition){
  const P=Cinematic.prototype;if(P.__medicalTransportV12)return;Object.defineProperty(P,'__medicalTransportV12',{value:true});
  const old={setLine:P.setLine,update:P.update,startOutro:P.startOutro,busy:P.busy};
  P.setLine=function(i){if(i===this.line)return;old.setLine.call(this,i);queueMedical(this,this.stage.beats.find(b=>b.line===i),patientPosition);settleMedical(this);};
  P.startOutro=function(){const eventCount=this.events.length,result=old.startOutro.call(this);if(!result)return false;queueMedical(this,this.stage.outro,patientPosition);this._medicalOutro={start:this.time,end:Math.max(this.time,...this.moves.map(m=>m.end),...this.actors.filter(a=>a._medicalTween).map(a=>a._medicalTween.end))};if(this.stage.outro.cue)for(const event of this.events.slice(eventCount))if(event.name==='door')event.name=this.stage.outro.cue;settleMedical(this);return true;};
  P.update=function(dt,silent=false){const result=old.update.call(this,dt,silent);settleMedical(this);return result;};
  P.busy=function(){return old.busy.call(this)||this.actors.some(a=>a._medicalTween&&a._medicalTween.end>this.time);};
  P.fastForward=function(){const end=Math.max(this.time,this.actionUntil||0,...this.moves.map(m=>m.end),...this.actors.filter(a=>a._medicalTween).map(a=>a._medicalTween.end),...(this._medicalAfter||[]).map(p=>p.end));this.time=end;this.update(0,true);};
}

/** In drawActor(hero): pose=medicalPatientPose(cine,a,patientPosition); render any returned pose
 * with translate(pose.x,pose.y), rotate(pose.angle), drawHero(size:pose.size,attack:0,moving:false,angle:0,hideWeapon:true).
 * For non-cinematic camp patient use patientSurface:'cot', attachedTo:'cot' explicitly.
 */
export function medicalPatientPose(cine,a,patientPosition){
  const tw=a._medicalTween;
  if(tw){const t=clamp(((cine?.time??tw.start)-tw.start)/(tw.end-tw.start));return Object.fromEntries(['x','y','angle','size'].map(k=>[k,mix(tw.from[k],tw.to[k],t)]));}
  if(!a.fall)return null;
  const kind=a.patientSurface||(a.attachedTo==='cart'?'cart':a.attachedTo==='cot'?'cot':'ground');
  return kind==='cart'||kind==='cot'?patientPosition(a.x,a.y,kind==='cart'):groundPatientPose(a.x,a.y,a.fall);
}
/** Use for both gameplay and cinematic sorting. Passenger depth tracks its support rather than an unrelated map y. */
export function medicalDepth(a,kind='npc',cine=null){
  if(a._medicalTween)return Math.max(a.y,a._medicalTween.target?.[1]??a.y)-9.8;
  if(!a.transportWalk&&a.fall&&['cart','cot'].includes(a.patientSurface||a.attachedTo)){const support=cine?.get(a.attachedTo);return (support?.y??a.y)+(support?.depthYOffset??-10)+.2;}
  return a.depthY??a.y+(a.depthYOffset??(kind==='stageprop'?-10:0));
}
/** Draw a plain black scene transition in screen coordinates after scene art, only during the action outro. */
export function medicalCurtainAlpha(cine){const out=cine?._medicalOutro,d=cine?.stage.outro?.fadeOut;if(!out||!d)return 0;return clamp((cine.time-(out.end-d))/d);}
