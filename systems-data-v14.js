// V13 canonical values. No DOM, save state or random work at module load.
export const POTION_CD=7;
export const POTIONS=Object.fromEntries(['hp','mp'].flatMap(kind=>[0,1,2,3].map(i=>{
 const id=kind+['','Medium','Large','Grand'][i],amount=(kind==='hp'?[90,180,320,480]:[60,100,160,240])[i];
 return [id,{name:['小型','中型','大型','特制'][i]+(kind==='hp'?'疗伤药':'清醒药'),kind,amount,tier:i+1,region:i+1,cost:(kind==='hp'?[12,22,36,52]:[12,24,40,60])[i],category:'consumable',desc:`恢复 ${amount} ${kind==='hp'?'生命':'法力'}。疗伤药与清醒药分别计算 ${POTION_CD} 秒冷却，同类不同规格共用；对应状态已满时不消耗。`}];
})));
export const QUALITIES={
 common:{name:'普通',color:'#d5d2cc',power:1},uncommon:{name:'精良',color:'#71bc83',power:2},rare:{name:'稀有',color:'#70a9eb',power:3},epic:{name:'史诗',color:'#b08cea',power:4},legendary:{name:'传说',color:'#eda656',power:5},abyssal:{name:'黑曜',color:'#16151c',power:6}
};
export const QUALITY_ORDER=Object.keys(QUALITIES);
export const POTION_IDS=Object.keys(POTIONS);
export const DROP_RATES={ordinary:{gear:.12,book:.03},elite:{gear:.4,book:.10},boss:{gear:1,book:.25}};
export function gearQuality(region,kind,rng){
 const weights=kind==='boss'?(region>=4?[0,0,45,43,11.5,.5]:region===3?[0,5,62,30,3,0]:[0,25,67,8,0,0]):kind==='elite'?(region>=4?[0,24,52,22,2,0]:[10,42,44,4,0,0]):region>=4?[35,42,20,2.8,.2,0]:region===3?[40,42,17,1,0,0]:[55,35,9.5,.5,0,0];
 let value=rng()*100;for(let i=0;i<weights.length;i++){value-=weights[i];if(value<0)return QUALITY_ORDER[i];}return 'common';
}
export const SYSTEM_SKILLS=[
 {id:'fieldMend',bookId:'fieldMendBook',name:'止血术',bookName:'《行军止血术》',level:2,region:1,rank:3,skillPointCost:1,mp:24,cd:24,base:0,school:'healing',mechanic:{kind:'selfHeal',healFormula:{constant:24,vit:1,wis:.65},maxHpCap:.20},description:'用法力止住自己的伤势。体质与精神共同影响治疗，不超过最大生命20%。'},
 {id:'battleTempo',bookId:'battleTempoBook',name:'催刃',bookName:'《催刃》',level:3,region:1,rank:3,skillPointCost:1,mp:18,cd:20,base:0,school:'buff',mechanic:{kind:'tempoBuff',duration:5},description:'5秒内攻速加成 +25%，每阶延长1秒；不提高移速。'},
 {id:'stoneSkin',bookId:'stoneSkinBook',name:'岩肤',bookName:'《岩肤》',level:4,region:2,rank:3,skillPointCost:1,mp:20,cd:22,base:0,school:'protection',mechanic:{kind:'defenceBuff',duration:6},description:'6秒内敌方伤害减免 +12%，每阶延长1秒；与职业、被动相加后总减免不超过42%。'},
 {id:'focusBreath',bookId:'focusBreathBook',name:'定息',bookName:'《定息法》',level:5,region:2,rank:3,skillPointCost:1,mp:8,cd:28,base:0,school:'support',mechanic:{kind:'manaOverTime',duration:6},description:'6秒内额外恢复法力。每秒4 + 精神×0.03，每阶再加0.5；不能在满法力时使用。'},
 {id:'bladeRain',bookId:'bladeRainBook',name:'疾刃连切',bookName:'《疾刃连切》',level:7,region:3,rank:3,skillPointCost:1,mp:22,cd:7,base:.5,str:1.1,dex:2.5,school:'melee',requiresWeapon:true,mechanic:{kind:'meleeArc',range:142,arc:.9,maxTargets:3},description:'向前方连切，敏捷为主要加成；法杖也能施展近身连击。'},
 {id:'chainFetters',bookId:'chainFettersBook',name:'重缚',bookName:'《重缚》',level:8,region:3,rank:3,skillPointCost:1,mp:23,cd:15,base:.4,vit:1.1,wis:1.1,school:'control',mechanic:{kind:'target',range:240,rootDuration:2.2,bossSlowDuration:1.8,bossSlowFactor:.75},description:'束缚一名普通敌人2.2秒；精英与首领只减速25%，不取消蓄力。'},
 {id:'ashBurst',bookId:'ashBurstBook',name:'灼羽',bookName:'《灼羽》',level:10,region:4,rank:3,skillPointCost:1,mp:28,cd:10,base:.6,wis:2.4,school:'spell',mechanic:{kind:'selfPulse',radius:178,pulses:1,maxTargets:5,slowDuration:1,slowFactor:.8},description:'灼热羽片扫过身周，至多命中5个目标；适合接控制战技。'},
 {id:'iceShard',bookId:'iceShardBook',name:'霜刺',bookName:'《霜刺》',level:12,region:4,rank:3,skillPointCost:1,mp:24,cd:6,base:.7,wis:3,dex:.4,school:'spell',mechanic:{kind:'projectile',range:340,speed:400,radius:8,pierce:1,secondaryMultiplier:.7,slowDuration:2,slowFactor:.75},description:'发射霜刺穿透至多2个目标，次目标伤害70%；命中减速25%，持续2秒。'}
];
export const TRIAL_FLOORS=[
 {id:'trial1',name:'铁牙残影',type:'ironScuttler',level:10,hp:5000,damage:40,quality:'rare',slot:'weapon',xp:170,gold:40},
 {id:'trial2',name:'炉心残影',type:'furnaceSentinel',level:12,hp:6500,damage:45,quality:'epic',slot:'chest',xp:220,gold:55},
 {id:'trial3',name:'断旗残影',type:'odric',level:14,hp:8500,damage:50,quality:'epic',slot:'hands',xp:280,gold:70},
 {id:'trial4',name:'无声残影',type:'martha',level:16,hp:11000,damage:55,quality:'legendary',slot:'relic',xp:350,gold:90},
 {id:'trial5',name:'裂井守望',type:'severin',level:18,hp:14000,damage:60,quality:'abyssal',slot:'weapon',xp:440,gold:120}
];
export const ARCANE_SKILLS=new Set(['firebolt','frost','emberLance','graveBell','saintRay','saintNova','iceShard','ashBurst']);
export function arcaneBonus(p,k){return p.cls==='ember'&&p.emberReady&&(ARCANE_SKILLS.has(k)||k==='e')?{damage:1.18,cost:.8}:null;}

export const GEAR_SELL_PRICE={common:6,uncommon:9,rare:14,epic:30,legendary:52,abyssal:80};

export const potionCDKey=id=>POTIONS[id]?.kind==='hp'?'hpPotion':'mpPotion';
