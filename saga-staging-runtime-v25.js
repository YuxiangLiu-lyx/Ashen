let spiritStage=null;
export function configureSagaStageRuntimeV25(factory){spiritStage=factory;}
export function prepareSagaStageRuntimeV25(stage,g,id){
 if(!/^v25C8Spirit/.test(id)||!spiritStage)return stage;
 const h=[g.p.x,g.p.y],s=g.saint?.visible?[g.saint.x,g.saint.y]:null;
 const result=spiritStage(id,g.map,h,s);
 if(!result)return stage;
 const at=g.safePoint(g.p.x+76,g.p.y-24);
 result.actors.chengli=[at.x,at.y];result.focus=[(g.p.x+at.x)/2,(g.p.y+at.y)/2-40];
 return result;
}
