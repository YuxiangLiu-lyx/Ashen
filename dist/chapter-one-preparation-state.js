import {C1_CORES,C1_RUNES,C1_ELITES} from './chapter-one-expansion-data.js';
export const c1PrepFresh=()=>({started:false,approved:false,saintSeen:false,legacy:false,hunt:'none',kills:[],stock:[],stockSequence:0,order:null,orderSequence:0,seed:362436069,potionSequence:0,drops:{}});
export function validatePreparation(v){
 const obj=x=>x&&typeof x==='object'&&!Array.isArray(x),uint=x=>Number.isInteger(x)&&x>=0&&x<=4294967295;
 const exact=(x,keys)=>obj(x)&&keys.length===Object.keys(x).length&&keys.every(k=>k in x);
 if(!exact(v,Object.keys(c1PrepFresh()))||['started','approved','saintSeen','legacy'].some(k=>typeof v[k]!=='boolean')||!['none','active','done'].includes(v.hunt)||!Array.isArray(v.kills)||new Set(v.kills).size!==v.kills.length||v.kills.some(id=>!C1_ELITES[id])||!uint(v.seed)||!v.seed||!uint(v.stockSequence)||!uint(v.orderSequence)||!uint(v.potionSequence)||!obj(v.drops))throw Error('会馆整备记录不正确。');
 if(!Array.isArray(v.stock)||![0,3].includes(v.stock.length)||new Set(v.stock.map(x=>x.serial)).size!==v.stock.length||new Set(v.stock.map(x=>x.id)).size!==v.stock.length||v.stock.some(x=>!exact(x,['serial','id'])||!uint(x.serial)||!x.serial||x.serial>v.stockSequence||!C1_RUNES[x.id]))throw Error('符文柜货架记录不正确。');
 const o=v.order;if(o!==null&&(!exact(o,['serial','core','amount','accepted'])||!uint(o.serial)||!o.serial||o.serial!==v.orderSequence||!C1_CORES[o.core]||!Number.isInteger(o.amount)||o.amount<3||o.amount>5||typeof o.accepted!=='boolean'))throw Error('核心订单记录不正确。');
 if(Object.entries(v.drops).some(([k,n])=>!/^[-A-Za-z0-9_:]{1,160}$/.test(k)||!uint(n)))throw Error('药材掉落记录不正确。');
 if(!v.approved&&(v.stock.length||o))throw Error('未解锁的整备服务含商品。');
}
