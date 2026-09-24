import {UTILITIES} from './attunement-v14.js';
import {SKILLS,ITEMS,CLASSES} from './data-v14.js';
const object=v=>v&&typeof v==='object'&&!Array.isArray(v);
const num=(n,a=0,b=1e7)=>Number.isFinite(n)&&n>=a&&n<=b;
const int=(n,a=0,b=1e7)=>Number.isInteger(n)&&num(n,a,b);
function frozenActor(p,saint=false){
 if(!object(p)||!(saint?['saint']:['shadow','oath','ember']).includes(p.cls)||!int(p.level,1,32)||!object(p.gear)||!object(p.attrs)||!object(p.skills)||!object(p.items)||!object(p.cd)||!object(p.skillSpent)||!Array.isArray(p.bag)||p.bag.length>60||!Array.isArray(p.knownBooks)||!Array.isArray(p.activeSkills)||p.activeSkills.length>5||new Set(p.activeSkills).size!==p.activeSkills.length||!Array.isArray(p.bar)||p.bar.length!==2)throw new Error('诺恩的救援前记录不完整。');
 for(const k of ['hp','mp','xp','gold','ap','sp','x','y'])if(!num(p[k]))throw new Error('诺恩的救援前数值不正确。');
 for(const k of ['str','dex','vit','wis'])if(!int(p.attrs[k],0,1000))throw new Error('诺恩的原有加点不正确。');
 for(const k of ['weapon','head','chest','hands','feet','relic'])if(!Object.hasOwn(p.gear,k))throw new Error('诺恩的原有装备位不完整。');
 for(const i of [...p.bag,...Object.values(p.gear).filter(Boolean)])if(!object(i)||typeof i.id!=='string'||typeof i.name!=='string'||!num(i.hp)||!num(i.atk))throw new Error('诺恩的原有装备不正确。');
 for(const [k,n] of Object.entries(p.skills))if(!SKILLS[k]||!int(n,0,SKILLS[k].rank))throw new Error('诺恩的原有战技不正确。');
 if(p.activeSkills.some(k=>!p.skills[k]||SKILLS[k]?.passive)||p.knownBooks.some(k=>!SKILLS[k]))throw new Error('诺恩的激活记录不正确。');
 if(p.bar.some(pg=>!Array.isArray(pg)||pg.length!==6||pg.some(k=>k!==null&&!UTILITIES.includes(k)&&!p.activeSkills.includes(k))))throw new Error('诺恩的快捷栏不正确。');
 for(const [k,n] of Object.entries(p.items))if(!ITEMS[k]||!int(n,0,100000))throw new Error('诺恩的原有物品不正确。');
 if(Object.values(p.cd).some(n=>!num(n,0,10000)))throw new Error('诺恩的战技冷却不正确。');
}
export function validateChapter3Save(s){
 const h=s.ch3;if(s.p?.cls==='saint'&&(!h?.frozenHero||h.controlActor!=='saint'||s.flags?.ch3TreatmentApplied))throw new Error('救援段缺少正确的诺恩记录。');
 if(h===undefined)return;if(!object(h)||!object(h.claims)||!object(h.crafts)||!object(h.visits)||!int(h.seed,0,4294967295)||!int(h.draws,0,7)||!num(h.xpEscrow,0,1e7))throw new Error('第三章旅程记录不完整。');
 if(h.frozenHero)frozenActor(h.frozenHero);if(h.saintBuild)frozenActor(h.saintBuild,true);
 for(const v of Object.values(h.claims))if(typeof v!=='boolean')throw new Error('一次性奖励标记不正确。');
 for(const v of Object.values(h.crafts))if(!int(v,0,8))throw new Error('制作次数不正确。');
 const options=(a,max)=>a==null||Array.isArray(a)&&a.length>0&&a.length<=max&&a.every(r=>object(r)&&(r.kind==='bundle'||r.kind==='book'&&ITEMS[r.id]?.skill||r.kind==='gear'&&typeof r.id==='string'&&r.id.startsWith('ch3-')));
 if(!options(h.offers,3)||!options(h.trialReward,2))throw new Error('尚未领取的结果不完整。');
 if(h.shutters&&(!Array.isArray(h.shutters)||h.shutters.length!==3||h.shutters.some(n=>!int(n,0,2))))throw new Error('墓室铜闸记录不正确。');
}
