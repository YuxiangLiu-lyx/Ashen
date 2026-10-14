import {C1_PEOPLE} from './chapter-one-story-world.js';
// The generated scenery atlas uses authored unequal cells; no image is stretched
// across a different object's region. Original alpha and image files stay intact.
const regions=[[0,0,620,315],[625,0,590,315],[1230,0,306,315],[0,320,620,310],[625,320,590,310],[1220,320,316,335],[0,645,615,379],[620,660,420,364],[1060,665,476,359]];
export function installC1NaturalFrames(bank,name,data){let cells;
 if(name==='c1Scenery')cells=regions;
 else if(name==='c1UnderPortraits')cells=[[0,0,512,1024],[527,0,477,1024],[1024,0,512,1024]];
 else if(name==='c1QuestMarks')cells=Array.from({length:3},(_,i)=>[i*data.width/3,0,data.width/3,data.height].map(Math.floor));
 else if(name==='c1Walls')cells=[[0,0,512,340],[512,0,512,340],[0,340,512,605],[512,340,512,605],[0,950,512,586],[512,950,512,586]];
 else if(name==='c1Construct')cells=Array.from({length:8},(_,i)=>[i%4*384,i<4?0:490,384,i<4?490:534]);
 else if(name==='c1VaultGuardian')cells=Array.from({length:8},(_,i)=>[i%4*384,i<4?0:444,i===4||i===6?370:384,i<4?444:580]);
 else if(name==='c1UnderNPC'){const ys=[0,249,494,751,1006,1251,1536];cells=Array.from({length:24},(_,i)=>[i%4*256,ys[Math.floor(i/4)],256,ys[Math.floor(i/4)+1]-ys[Math.floor(i/4)]]);}
 else return;
 bank.frames[name]=cells.map(([x,y,w,h])=>{let a=x+w,b=y+h,z=x,t=y;for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)if(data.data[(yy*data.width+xx)*4+3]>120){a=Math.min(a,xx);b=Math.min(b,yy);z=Math.max(z,xx);t=Math.max(t,yy);}return {x:a,y:b,w:Math.max(1,z-a+1),h:Math.max(1,t-b+1),cell:{x,y,w,h}};});}
export function c1NaturalSprite(c,bank,index,x,y,w,h){const f=bank.frame('c1Scenery',index);if(!f)return;bank.draw(c,'c1Scenery',index,x,y,w,h??w*f.h/f.w);}
const mutedMarkers=new WeakMap();
export function drawC1QuestMark(c,bank,mark,x,y){
 const index={'!':0,'?':1,'gold?':1}[mark],f=bank.frame('c1QuestMarks',index);if(index===undefined||!f)return;
 if(mark==='?'){bank.draw(c,'c1QuestMarks',1,x,y,24*f.w/f.h,24);return;}
 let cache=mutedMarkers.get(bank);if(!cache){cache={};mutedMarkers.set(bank,cache);}
 if(!cache[mark]){const surface=document.createElement('canvas');surface.width=f.w;surface.height=f.h;const p=surface.getContext('2d');p.drawImage(bank.images.c1QuestMarks,f.x,f.y,f.w,f.h,0,0,f.w,f.h);const data=p.getImageData(0,0,f.w,f.h);for(let i=0;i<data.data.length;i+=4){const l=(data.data[i]*.2126+data.data[i+1]*.7152+data.data[i+2]*.0722)/255;const shade=.63+l*.27;data.data[i]=198*shade;data.data[i+1]=176*shade;data.data[i+2]=127*shade;}p.putImageData(data,0,0);cache[mark]=surface;}
 c.drawImage(cache[mark],x-12*f.w/f.h,y-24,24*f.w/f.h,24);
}
export function drawC1LocalPerson(c,a,bank){const p=C1_PEOPLE[a.id];if(!p)return false;const cosine=Math.cos(a.angle||0),side=!a.moving&&Math.abs(cosine)>.8,back=Math.sin(a.angle||0)<-.25,ix=p.index+(side?3:(back?4:0)+(a.moving?1+Math.floor((a.walkDistance||0)/23)%2:0)),f=bank.frame(p.sheet,ix),ref=bank.frame(p.sheet,p.index);if(!f||!ref)return false;const k=82/ref.h;c.save();c.translate(a.x,a.y);if(side&&(cosine<0)!==(p.sheet==='c1UnderNPC'&&p.index!==8))c.scale(-1,1);c.imageSmoothingEnabled=true;c.drawImage(bank.images[p.sheet],f.x,f.y,f.w,f.h,-f.w*k/2,-f.h*k,f.w*k,f.h*k);c.restore();return true;}
export function c1LocalPortrait(bank,name){const p=Object.values(C1_PEOPLE).find(p=>p.name===name);if(!p)return null;if(p.sheet==='c1UnderNPC'&&bank.frame('c1UnderPortraits',p.index/8))return bank.cropped('c1UnderPortraits',p.index/8);const key='c1Portrait:'+name;if(bank.urls[key])return bank.urls[key];const f=bank.frame(p.sheet,p.index);if(!f)return null;const c=document.createElement('canvas');c.width=180;c.height=200;const k=f.h*.43,w=k*.9;c.getContext('2d').drawImage(bank.images[p.sheet],f.x+(f.w-w)/2,f.y,w,k,0,0,180,200);return bank.urls[key]=c.toDataURL();}


// Crop the last wall section to its remaining length rather than squeezing a
// whole stone wall into a thin strip at each corner.
export function c1WallPiece(c,bank,index,x,y,length){const f=bank.frame('c1Walls',index);if(!f)return;const vertical=index>1,unit=vertical?190:200,span=Math.min(length,unit),ratio=span/unit;const w=vertical?52:span,h=vertical?span:index===0?78:44;c.drawImage(bank.images.c1Walls,f.x,f.y,f.w*(vertical?1:ratio),f.h*(vertical?ratio:1),x,y-h,w,h);}
