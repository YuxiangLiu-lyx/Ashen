// One authored plan supplies cave floor, rock mass, collision and encounter placement.
export const C3_CAVES={
 hellGrotto:{name:'入口低棚 · 盐苔台 · 矿口 · 南侧材料环路',rooms:[[320,600,360,360],[480,280,400,300],[480,500,200,220],[960,220,500,300],[800,320,300,180],[960,600,420,260],[1220,460,200,220],[600,760,440,160]],moves:{'ch3-grotto-7':[1040,300]}},
 hellMine:{name:'东侧凝晶道 · 北侧断轨 · 西侧检修间',rooms:[[140,320,360,180],[300,480,360,360],[340,380,240,260],[480,220,520,180],[1000,220,400,360],[900,320,240,180],[1020,480,260,480],[560,740,600,180]],moves:{'ch3-mine-1':[430,560],'ch3-mine-2':[510,500],'ch3-mine-3':[430,680],'ch3-mine-7':[1150,550],'ch3-mine-8':[1210,430]}}
};
export const c3Land=(id,x,y)=>C3_CAVES[id]?.rooms.some(([a,b,w,h])=>x>=a&&x<=a+w&&y>=b&&y<=b+h);
export function c3Boundary(id){const rows=[],step=20;for(let y=0;y<1080;y+=step){let start=null;for(let x=0;x<=1600;x+=step){const solid=x<1600&&!c3Land(id,x+10,y+10);if(solid&&start===null)start=x;if(!solid&&start!==null){const prev=rows.findLast(r=>r[0]===start&&r[2]===x-start&&r[1]+r[3]===y);if(prev)prev[3]+=step;else rows.push([start,y,x-start,step]);start=null;}}}return rows;}
export function installChapterThreeCaves(RPG,{MAPS,SCENERY,BOUNDARIES}){
 for(const [id,plan]of Object.entries(C3_CAVES)){
  const m=MAPS[id];m.sub=plan.name;m.c3Layout=1;SCENERY[id]=SCENERY[id].filter(o=>c3Land(id,o.x,o.y));
  if(id==='hellMine'){const p=m.props.find(p=>p.id==='ch3-machine-spring');Object.assign(p,{x:520,y:740,interactX:520,interactY:795});}
  for(const s of m.spawns){const pos=plan.moves[s[3]];if(pos){s[1]=pos[0];s[2]=pos[1];}}
  BOUNDARIES[id]=c3Boundary(id);m.blocks=[...BOUNDARIES[id],...SCENERY[id].filter(o=>o.box&&c3Land(id,o.x,o.y)).map(o=>o.box),...m.props.filter(o=>o.box).map(o=>o.box)];
  for(const group of m.encounters){const members=m.spawns.filter(s=>group.spawnIds.includes(s[3]));if(members.length)group.anchor=[members.reduce((n,s)=>n+s[1],0)/members.length,members.reduce((n,s)=>n+s[2],0)/members.length];}
 }
 const P=RPG.prototype,ensure=P.ensureMap,enter=P.enter,restore=P.restore;
 function align(g,id){const m=MAPS[id],st=g.states[id];if(!C3_CAVES[id]||!st||st.c3Layout===1)return;st.c3Layout=1;
  const props=new Map(st.props.map(p=>[p.id,p]));st.props=m.props.map(p=>({...props.get(p.id),...p,used:props.get(p.id)?.used||false,broken:props.get(p.id)?.broken||false,geometryV26:false,collisionV281:false}));
  for(const e of st.enemies){const s=m.spawns.find(s=>s[3]===e.id);if(s)Object.assign(e,{x:s[1],y:s[2],homeX:s[1],homeY:s[2],roamTarget:null,leashBounds:null,activationBounds:null});}
 }
 P.ensureMap=function(id){const v=ensure.call(this,id);align(this,id);return v;};
 P.enter=function(...a){const v=enter.apply(this,a);align(this,this.map);if(C3_CAVES[this.map])this.repairEntities();return v;};
 P.restore=function(...a){const v=restore.apply(this,a);for(const id of Object.keys(C3_CAVES))align(this,id);if(C3_CAVES[this.map]){this.repairEntities();if(this.blocked(this.p.x,this.p.y))this.relocate(this.p.x,this.p.y);}return v;};
}
