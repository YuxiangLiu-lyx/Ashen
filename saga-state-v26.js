// Additive progress: the published V25 node order and all old scene indices stay stable.
let contract={chains:[],nodes:[],maps:{},items:{},dialogues:{}};
const copy=x=>structuredClone(x),plain=x=>!!x&&typeof x==='object'&&!Array.isArray(x)&&Object.getPrototypeOf(x)===Object.prototype;
const only=(o,keys)=>plain(o)&&Object.keys(o).every(k=>keys.includes(k));
const int=(n,a,b)=>Number.isInteger(n)&&n>=a&&n<=b;
const list=(a,test,max=128)=>Array.isArray(a)&&a.length<=max&&new Set(a).size===a.length&&a.every(test);
export function configureSagaValidationV26(c){contract=c;}
export function freshSagaV26(base={stage:0,phase:'awaiting'}){const legacyThrough=(base.stage||0)-(base.phase==='awaiting'?1:0);return {schema:1,legacyThrough,serial:0,completed:[],grandfathered:contract.chains.filter(c=>contract.nodes.findIndex(n=>n.id===c.beforeNode)<=legacyThrough).map(c=>c.id),active:null,rewards:{}};}
export const sagaStateV26=g=>g.sagaV26||(g.sagaV26=freshSagaV26(g.sagaV25));
export const sagaCallbackV26=a=>'v26:sceneDone:'+a.token+':'+a.scene;
export const sagaRewardKeyV26=(c,step)=>c.id+':'+step.id;
export const sagaGatherIdV26=(step,item,index)=>'v26-gather:'+step.id+':'+item.id+':'+index;
export const sagaEnemyIdV26=(step,index)=>'v26-enemy:'+step.id+':'+index;
export function validateSagaSaveV26(save){
 const s=save?.sagaV26,b=save?.sagaV25,{chains,nodes,maps,items,dialogues}=contract;
 const fail=()=>{throw Error('新增旅程的任务记录不完整，原始存档已保留。');};
 if(s===undefined){if(save?.pending?.then?.startsWith('v26:'))fail();return;}
 if(!only(s,['schema','legacyThrough','serial','completed','grandfathered','active','rewards'])||s.schema!==1||!int(s.legacyThrough,-1,nodes.length)||!int(s.serial,0,1000000)||!list(s.completed,id=>chains.some(c=>c.id===id),chains.length)||!list(s.grandfathered,id=>chains.some(c=>c.id===id),chains.length)||s.completed.some(id=>s.grandfathered.includes(id))||!plain(s.rewards))fail();
 const idx=c=>nodes.findIndex(n=>n.id===c.beforeNode),past=c=>s.completed.includes(c.id)||s.grandfathered.includes(c.id);
 if(s.legacyThrough>(b?.stage||0)||s.grandfathered.some(id=>idx(chains.find(c=>c.id===id))>s.legacyThrough))fail();
 if(chains.some(c=>idx(c)<(b?.stage||0)&&!past(c)))fail();
 if(chains.some(c=>s.completed.includes(c.id)&&idx(c)>(b?.stage||0)))fail();
 const a=s.active,c=chains.find(c=>c.id===a?.id),step=c?.steps[a?.step];
 if(a!==null){
  if(!only(a,['id','step','phase','kills','gathered','bag','drops','activeScene'])||!c||past(c)||!b?.started||b.phase!=='awaiting'||idx(c)!==b.stage||!int(a.step,0,c.steps.length-1)||!['intro','task','handoff'].includes(a.phase)||!list(a.kills,id=>Array.from({length:step.kills?.count||0},(_,i)=>sagaEnemyIdV26(step,i)).includes(id),64)||!list(a.gathered,id=>(step.collect||[]).filter(i=>i.source==='gather').some(i=>Array.from({length:i.count},(_,j)=>sagaGatherIdV26(step,i,j)).includes(id)),128)||!plain(a.bag)||!plain(a.drops))fail();
  for(const [id,n]of Object.entries(a.bag)){const item=step.collect?.find(i=>i.id===id);if(!item||!int(n,0,item.count))fail();}
  for(const [id,d]of Object.entries(a.drops)){if(!a.kills.includes(id)||!only(d,['x','y','items','picked'])||!Number.isFinite(d.x)||!Number.isFinite(d.y)||d.x<135||d.x>1465||d.y<155||d.y>965||typeof d.picked!=='boolean'||!plain(d.items)||Object.entries(d.items).some(([k,n])=>!step.collect?.some(i=>i.id===k&&i.source==='drop')||!int(n,1,32)))fail();}
  for(const i of step.collect||[]){const earned=i.source==='gather'?a.gathered.filter(id=>id.startsWith('v26-gather:'+step.id+':'+i.id+':')).length:Object.values(a.drops).filter(d=>d.picked).reduce((n,d)=>n+(d.items[i.id]||0),0);if((a.bag[i.id]||0)!==(a.phase==='handoff'?0:earned)||earned>i.count)fail();}
  if(a.phase==='intro'&&(a.step!==0||a.kills.length||a.gathered.length||Object.keys(a.bag).length||Object.keys(a.drops).length))fail();
  if(a.phase==='handoff'&&((step.kills?.count||0)!==a.kills.length||(step.collect||[]).some(i=>(i.source==='gather'?a.gathered.filter(id=>id.startsWith('v26-gather:'+step.id+':'+i.id+':')).length:Object.values(a.drops).filter(d=>d.picked).reduce((n,d)=>n+(d.items[i.id]||0),0))!==i.count)))fail();
  if(a.activeScene!==null){const q=a.activeScene,expected=a.phase==='intro'?c.introScene:a.phase==='handoff'?step.scene:null,map=a.phase==='intro'?nodes[b.stage].map:step.turnIn.map;if(!only(q,['scene','token'])||q.scene!==expected||!dialogues[q.scene]||!int(q.token,1,s.serial)||q.token!==s.serial||save.map!==map||save.pending?.id!==q.scene||save.pending?.then!==sagaCallbackV26(q))fail();}else if(a.phase!=='task')fail();
 }else if(save?.pending?.then?.startsWith('v26:'))fail();
 const validRewards=new Set();for(const chain of chains){if(s.completed.includes(chain.id))for(const st of chain.steps)validRewards.add(sagaRewardKeyV26(chain,st));if(a?.id===chain.id)for(let i=0;i<=a.step;i++)if(i<a.step||a.phase!=='intro')validRewards.add(sagaRewardKeyV26(chain,chain.steps[i]));}
 if(Object.keys(s.rewards).length!==validRewards.size)fail();
 for(const [key,r]of Object.entries(s.rewards)){if(!validRewards.has(key)||!only(r,['seed','claimed','xp','gold','ap','sp','items','ticket'])||!int(r.seed,0,4294967295)||typeof r.claimed!=='boolean'||typeof r.ticket!=='boolean'||!['xp','gold','ap','sp'].every(k=>int(r[k],0,10000))||!plain(r.items)||Object.entries(r.items).some(([id,n])=>!items[id]||!int(n,1,100)))fail();const current=!!a&&sagaRewardKeyV26(c,step)===key;if(r.claimed!==(!current||a.phase==='handoff'))fail();}
 if(save.memoryV13&&a)fail();
}
export function savedSagaV26(g){return copy(g.memoryV13?.active?(g.memoryV13.reality.sagaV26||freshSagaV26(g.memoryV13.reality.sagaV25)):sagaStateV26(g));}
