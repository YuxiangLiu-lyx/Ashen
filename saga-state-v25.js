export const SAGA_SCHEMA_V25=1;
const clone=x=>structuredClone(x);
export const freshSagaV25=()=>({schema:1,started:false,stage:0,phase:'awaiting',serial:0,completed:[],activeScene:null,task:null,visits:[],rewards:{},pendingGear:[],cloak:{owned:false,on:false},disguise:false,training:[],spirit:{unlocked:false,level:0,topics:[],practiceClaims:[]},checkpoint:null});
export const sagaStateV25=g=>g.sagaV25||(g.sagaV25=freshSagaV25());
export const sagaSceneCallbackV25=a=>'v25:sceneDone:'+a.token+':'+a.scene;
export const sagaMapV25=id=>/^ch[678]/.test(id||'');
const plain=x=>!!x&&typeof x==='object'&&!Array.isArray(x)&&Object.getPrototypeOf(x)===Object.prototype;
const integer=(x,a,b)=>Number.isInteger(x)&&x>=a&&x<=b;
const finite=(x,a,b)=>Number.isFinite(x)&&x>=a&&x<=b;
const only=(x,keys)=>plain(x)&&Object.keys(x).every(k=>keys.includes(k));
const list=(a,valid,max=128)=>Array.isArray(a)&&a.length<=max&&new Set(a).size===a.length&&a.every(valid);
let contract={nodes:[],tasks:{},maps:{},talks:{},items:{}};
export function configureSagaValidationV25(value){contract=value;}
export function validateSagaSaveV25(save){
 const s=save?.sagaV25,p=save?.pending,{nodes,tasks,maps,talks,items}=contract;
 const bad=()=>{throw new Error('第六至八章的旅程记录不完整，原始存档已保留。');};
 if(s===undefined){if(sagaMapV25(save?.map)||/^(?:c[67]v25|v25C8)/.test(p?.id||''))bad();return;}
 if(!only(s,Object.keys(freshSagaV25()))||s.schema!==1||typeof s.started!=='boolean'||!integer(s.stage,0,nodes.length)||!['awaiting','scene','task','finished'].includes(s.phase)||!integer(s.serial,0,1000000)||!list(s.completed,id=>nodes.some(n=>n.id===id),nodes.length)||s.completed.length!==s.stage||s.completed.some((id,i)=>nodes[i]?.id!==id)||!list(s.visits,id=>!!maps[id]||id==='ch5Exit',40)||!only(s.cloak,['owned','on'])||typeof s.cloak.owned!=='boolean'||typeof s.cloak.on!=='boolean'||s.cloak.on&&!s.cloak.owned||typeof s.disguise!=='boolean'||!list(s.training,id=>['stone','mirror','storm'].includes(id),3)||!only(s.spirit,['unlocked','level','topics','practiceClaims'])||typeof s.spirit.unlocked!=='boolean'||!integer(s.spirit.level,s.spirit.unlocked?1:0,s.spirit.unlocked?4:0)||!list(s.spirit.topics,id=>!!talks[id],8)||!list(s.spirit.practiceClaims,id=>['stone','mirror','storm'].includes(id),3)||s.spirit.practiceClaims.length!==(s.spirit.unlocked?s.spirit.level-1:0)||s.spirit.practiceClaims.some(id=>!s.training.includes(id))||!plain(s.rewards)||Object.keys(s.rewards).length>180||!Array.isArray(s.pendingGear)||s.pendingGear.length>96)bad();
 if(!s.started&&(s.stage||s.completed.length||s.activeScene||s.task||s.visits.length||s.cloak.owned||s.disguise||s.training.length||s.spirit.unlocked||Object.keys(s.rewards).length||s.pendingGear.length))bad();
 if(s.started&&!save.flags?.ch5BossDefeated)bad();
 if(s.checkpoint!==null&&(!only(s.checkpoint,['map','x','y'])||!maps[s.checkpoint.map]||!finite(s.checkpoint.x,135,1465)||!finite(s.checkpoint.y,155,965)))bad();
 const gearOk=i=>plain(i)&&typeof i.id==='string'&&i.id.startsWith('quest-v25-')&&typeof i.name==='string'&&i.name.length<=100&&['weapon','offhand','head','chest','hands','feet','relic'].includes(i.slot)&&finite(i.atk,0,10000)&&finite(i.hp,0,100000)&&(!i.attrs||Object.entries(i.attrs).every(([k,v])=>['str','dex','vit','wis'].includes(k)&&integer(v,0,1000)));
 if(s.pendingGear.some(i=>!gearOk(i))||new Set(s.pendingGear.map(i=>i.id)).size!==s.pendingGear.length)bad();
 const rewardKeys=new Set([...nodes.map(n=>'node:'+n.id),...Object.values(maps).filter(m=>m.sagaV25).flatMap(m=>(m.props||[]).filter(p=>p.id.endsWith('-cache')).map(p=>'cache:'+p.id)),...Object.values(tasks).flatMap(t=>(t.enemyIds||[]).map(id=>'kill:'+id))]);
 for(const [key,r]of Object.entries(s.rewards))if(!rewardKeys.has(key)||!only(r,['seed','claimed','xp','gold','ap','sp','items','gear','ticket'])||!integer(r.seed,0,4294967295)||typeof r.claimed!=='boolean'||typeof r.ticket!=='boolean'||!['xp','gold','ap','sp'].every(k=>integer(r[k],0,100000))||!plain(r.items)||Object.entries(r.items).some(([id,n])=>!items[id]||!integer(n,0,1000))||!Array.isArray(r.gear)||r.gear.length>2||r.gear.some(i=>!gearOk(i)))bad();
 if(s.activeScene!==null){const a=s.activeScene,n=nodes[s.stage],isTalk=a?.node==='spirit';if(!only(a,['node','scene','token'])||!integer(a.token,1,s.serial)||a.token!==s.serial||s.phase!=='scene'||(!isTalk&&(a.node!==n?.id||a.scene!==n.scene||save.map!==n.map))||(isTalk&&(!s.spirit.unlocked||!Object.values(talks).some(t=>t.scene===a.scene)||!maps[save.map]?.safe))||p?.id!==a.scene||p?.then!==sagaSceneCallbackV25(a)||save.memoryV13)bad();}
 else if(s.phase==='scene'||/^(?:c[67]v25|v25C8)/.test(p?.id||''))bad();
 if(s.task!==null){const t=s.task,n=nodes[s.stage],spec=tasks[t.id];if(!only(t,['id','collected','defeated','elapsed','attempt'])||!spec||n?.task!==t.id||s.phase!=='task'||!list(t.collected,id=>(spec.propIds||[]).includes(id),32)||!list(t.defeated,id=>(spec.enemyIds||[]).includes(id),64)||!finite(t.elapsed,0,100000)||!integer(t.attempt,0,9999))bad();}else if(s.phase==='task')bad();
 if(s.stage===nodes.length&&s.phase!=='finished'&&s.activeScene?.node!=='spirit')bad();
 if(s.stage<nodes.length&&s.phase==='finished')bad();
 if(save.memoryV13&&(s.activeScene||s.task||sagaMapV25(save.map)))bad();
 const experienced=nodes.slice(0,s.stage),effects=experienced.flatMap(n=>[...(n.effects||[]),...(n.startEffects||[])]).concat(s.phase==='task'?(nodes[s.stage]?.startEffects||[]):[]);
 if(s.started){if(experienced.some(n=>!s.rewards['node:'+n.id]?.claimed))bad();if(s.cloak.owned!==effects.includes('cloak')||s.disguise!==(effects.includes('disguise')&&!effects.includes('unmask'))||s.spirit.unlocked!==effects.includes('spirit'))bad();const trained=effects.filter(e=>e.startsWith('training:')).map(e=>e.slice(9));if(JSON.stringify(s.training)!==JSON.stringify(trained))bad();if(sagaMapV25(save.map)&&!s.visits.includes(save.map))bad();}
 if(s.task&&tasks[s.task.id]?.kind!=='duel'&&s.task.defeated.some(id=>!s.rewards['kill:'+id]?.claimed))bad();
 if(s.cloak.on&&save.map!=='ch6Outpost')bad();
}
export function savedSagaV25(g){return clone(g.memoryV13?.active?(g.memoryV13.reality.sagaV25||freshSagaV25()):sagaStateV25(g));}
export function hashSagaV25(text){let h=2166136261;for(const c of String(text)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
export function seededSagaV25(seed){let n=seed>>>0;return ()=>{n=(n+0x6D2B79F5)>>>0;let t=n;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}
