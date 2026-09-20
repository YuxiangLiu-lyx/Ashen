// Small fitted details are anchored to the existing body rig, not a second floating costume.
const PALETTES=Object.freeze({common:['#433d36','#8a8170'],uncommon:['#39443b','#8c987f'],rare:['#3a4851','#8296a0'],epic:['#48414f','#9c8aab'],legendary:['#554434','#baa071'],abyssal:['#25232b','#8f809c']});
const SIGNATURES=Object.freeze({
 'v28-greyfang-edge':'fang','v28-cinder-cuff':'ember','v28-road-charm':'knot','v28-night-runner':'wing','v28-stonewatch':'plate','v28-spark-grip':'spark',
 'v28-bonebrand':'bone','v28-ash-hood':'hood','v28-soul-knot':'knot','v28-tide-mail':'scale','v28-rift-boots':'split','v28-oath-ember':'ember',
 'v28-bloodwell':'fang','v28-lantern-crown':'crown','v28-executor-shell':'plate','v28-frost-bite':'frost','v28-prayer-thread':'chain','v28-black-iron-step':'plate',
 'v28-voidfang':'split','v28-mirrorflame':'mirror','v28-greycrown':'crown','v28-ashen-vow':'eclipse','v28-nameless-echo':'orbit','v28-last-guard':'raven'
});
export function gearAppearanceV281(item){
 if(!item)return null;return {id:item.id||'',rarity:PALETTES[item.rarity]?item.rarity:'common',palette:PALETTES[item.rarity]||PALETTES.common,signature:SIGNATURES[item.id]||item.affix||'plain',weaponType:item.weaponType||null};
}
function path(c,points,fill,stroke,width=1){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
function line(c,points,color,width=1){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=color;c.lineWidth=width;c.lineJoin='round';c.stroke();}
export function weaponAngleV281(type,hand,other,fallback){
 if(!['greatsword','staff'].includes(type)||!hand||!other)return fallback;
 const dx=hand[0]-other[0],dy=hand[1]-other[1];
 // Preserve authored attack direction; two-handed support is drawn along this shaft.
 const angle=Math.atan2(dy,dx),delta=Math.atan2(Math.sin(angle-fallback),Math.cos(angle-fallback));
 return Math.hypot(dx,dy)>7&&Math.hypot(dx,dy)<24&&Math.abs(delta)<.55?angle:fallback;
}
export function drawWeaponSignatureV281(c,item,hand,angle,length=36,offhand=null){
 const s=gearAppearanceV281(item);if(!s||!hand)return;
 c.save();c.translate(...hand);c.rotate(angle);const [dark,light]=s.palette;
 if(['greatsword','staff'].includes(item.weaponType)&&offhand){
  const dx=offhand[0]-hand[0],dy=offhand[1]-hand[1],along=dx*Math.cos(angle)+dy*Math.sin(angle),cross=-dx*Math.sin(angle)+dy*Math.cos(angle);
  // Extend only a plausible grip; never draw a bar across the torso to reach a distant hand.
  if(along<0&&along>-23&&Math.abs(cross)<5)line(c,[[along,0],[0,0]],'#564633',2.5);
 }
 if(s.rarity!=='common'){
  const l=Math.min(31,length*.66);line(c,[[4,0],[l,0]],light,s.rarity==='abyssal'?1.35:.85);
  path(c,[[2,-3],[4,0],[2,3],[0,0]],dark,light,.45);
 }
 switch(s.signature){
  case 'fang':for(const x of [length*.3,length*.52])path(c,[[x,-1],[x+3,-4],[x+2,0]],'#d5c5a6','#756958',.6);break;
  case 'bone':
   // The bone-wrapped blade has bindings and a blunt spine, not the fang's teeth.
   path(c,[[length*.16,-1.8],[length*.62,-1],[length*.71,0],[length*.16,1.8]],'#c6baa0','#766950',.5);
   for(const x of [3,6,9])line(c,[[x,-2.2],[x+1.6,2.2]],'#d7cdb6',1.15);break;
  case 'ember':case 'fire':line(c,[[7,0],[length*.40,-1.4],[length*.57,.8],[length*.78,0]],'#d38f58',1.1);break;
  case 'frost':path(c,[[length*.5,0],[length*.6,-3],[length*.7,0],[length*.6,2]],'#adcbd1',null);break;
  case 'split':line(c,[[length*.25,-1.4],[length*.60,-1.4]],light,1);line(c,[[length*.25,1.4],[length*.52,1.4]],light,1);break;
  case 'eclipse':path(c,[[5,-2],[length*.7,-1],[length*.88,0],[length*.7,1],[5,2]],'#1d1a26','#b79bbd',.7);for(const x of [9,14,19])line(c,[[x,-1],[x+1.4,1]],'#d5b3c4',.75);break;
 }
 c.restore();
}
export function drawFittedEquipmentV281(c,gear,rig,cls='shadow',time=0,{back=false,hideWeapon=false}={}){
 if(!gear||!rig?.head||!rig?.hand)return;
 const h=rig.head,hand=rig.hand,off=rig.offhand||[h[0]-13,h[1]+35],torsoY=h[1]+11;
 c.save();c.lineJoin='round';
 if(gear.chest){
  const s=gearAppearanceV281(gear.chest),[dark,light]=s.palette,w=cls==='oath'?10:8.5;
  // Shoulders and a fitted fastening, not the old full men's body pasted over the portrait.
  path(c,[[h[0]-w+2,torsoY-2],[h[0]-w-2,torsoY],[h[0]-w-2.5,torsoY+4],[h[0]-w+1,torsoY+5],[h[0]-4,torsoY+2],[h[0]-4.5,torsoY-1]],dark,light,.45);
  path(c,[[h[0]+4,torsoY-1],[h[0]+w-1,torsoY-2],[h[0]+w+2,torsoY],[h[0]+w+3,torsoY+4],[h[0]+w,torsoY+5],[h[0]+4,torsoY+2]],dark,light,.45);
  if(!back){line(c,[[h[0]-4,torsoY+5],[h[0]-3,torsoY+19],[h[0]+4,torsoY+18]],light,.7);path(c,[[h[0]-2,torsoY+8],[h[0]+1,torsoY+6],[h[0]+3,torsoY+9],[h[0],torsoY+12]],dark,light,.65);}
  if(s.signature==='raven'){for(const side of [-1,1])path(c,[[h[0]+side*9,torsoY],[h[0]+side*13,torsoY+2],[h[0]+side*13,torsoY+5],[h[0]+side*12,torsoY+9],[h[0]+side*8,torsoY+6]],'#252330','#998aa5',.6);}
  if(s.signature==='scale')for(let i=0;i<3;i++)line(c,[[h[0]-3,torsoY+10+i*3],[h[0]+1,torsoY+12+i*3],[h[0]+5,torsoY+10+i*3]],light,.6);
 }
 if(gear.head){
  const s=gearAppearanceV281(gear.head),[dark,light]=s.palette,y=h[1]-10;
  // Face anchor is the skin centre, not the top of the skull. Keep the eyes clear.
  if(cls==='shadow'){
   line(c,[[h[0]-10,h[1]+1],[h[0]-10,y-1],[h[0]-4,y-5],[h[0]+4,y-4]],dark,1.5);
   line(c,[[h[0]-9,y-1],[h[0]-4,y-4]],light,.5);
  }else{
   line(c,[[h[0]-8,y],[h[0]-2,y+1],[h[0]+5,y],[h[0]+8,y-2]],dark,1.8);
   line(c,[[h[0]-7,y-1],[h[0]-2,y],[h[0]+5,y-1]],light,.5);
  }
  if(s.signature==='crown')path(c,[[h[0]-6,y-1],[h[0]-5,y-4],[h[0]-2,y-2],[h[0]+1,y-5],[h[0]+3,y-2],[h[0]+6,y-4],[h[0]+6,y]],dark,light,.5);
  if(!back&&s.rarity!=='common')path(c,[[h[0]-1.2,y],[h[0],y-2],[h[0]+1.2,y],[h[0],y+1]],light,null);
 }
 if(gear.hands){const [dark,light]=gearAppearanceV281(gear.hands).palette;for(const p of [hand,off]){path(c,[[p[0]-2.5,p[1]-3],[p[0]+2,p[1]-3.5],[p[0]+2,p[1]-1],[p[0]-2,p[1] ]],dark,light,.4);}}
 if(gear.feet&&rig.feet){const s=gearAppearanceV281(gear.feet);for(const f of rig.feet)line(c,[[f[0]-3,f[1]-4],[f[0]+2,f[1]-4],[f[0]+3,f[1]-1]],s.palette[1],1);}
 if(gear.relic){
  const s=gearAppearanceV281(gear.relic),[dark,light]=s.palette,x=h[0]+6,y=torsoY+24;
  line(c,[[x-2,y-4],[x+1,y]],'#99866a',.8);path(c,[[x+1,y],[x+4,y+3],[x+1,y+7],[x-2,y+3]],dark,light,.9);
  if(s.signature==='orbit'){c.beginPath();c.ellipse(x+1,y+3,5,3,-.5,0,Math.PI*2);c.strokeStyle=light;c.lineWidth=.65;c.stroke();c.fillStyle=light;c.fillRect(x+6,y,1.5,1.5);}
  if(s.signature==='mirror')path(c,[[x+1,y+1],[x+3,y+3],[x+1,y+5],[x-1,y+3]],'#b7bacc',null);
 }
 c.restore();
}
export const V281_GEAR_SIGNATURES=SIGNATURES;
