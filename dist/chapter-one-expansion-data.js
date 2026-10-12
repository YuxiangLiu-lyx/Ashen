// Chapter 0.6 numeric source. Fixed budgets never pass through random gear growth.
export const C1_VERSION=1;
export const C1_MAIN=[
 ['rats','库房异响',65,25,'hall','steward',[]],
 ['c1CommissionBrief','委托与行前准备',15,10,'hall','sister',['rats']],
 ['c1Readiness','久行归来的例检',20,12,'c1TrainingYard','c1-record',['c1CommissionBrief']],
 ['c1ExitDrill','带负重走出试炼廊',20,12,'c1DrillGallery','c1-drill-exit',['c1Readiness']],
 ['c1LoomBrief','看清手上的纹路',15,10,'c1LoomRoom','c1-loom',['v12CourierRoad']],
 ['v12CourierRoad','旧王道巡查',45,15,'road','courier',['c1ExitDrill']],
 ['v12NorthDelivery','维护班次的封套',25,10,'town','watch',['c1CommissionBrief']],
 ['c1GateCheck','午钟后的门',20,10,'town','watch',['v12CourierRoad']],
 ['c1CanalPrep','先看清退路',20,12,'c1NorthWalk','c1-mark',['v12NorthDelivery']],
 ['c1Assassination','午钟',65,20,'chapel','chapel',['c1LoomBrief','v12NorthDelivery','c1GateCheck','c1CanalPrep']],
 ['c1CanalBreak','打开东闸',15,15,'canal','c1-sluice',['c1Assassination']],
 ['c1Departure','离城',100,45,'canal','end',['c1CanalBreak']]
].map(([id,name,xp,gold,map,target,requires],i)=>({id,name,xp,gold,map,target,requires,index:i+1,type:'主线'}));
export const C1_SIDE=[
 ['oil','不漏的灯',30,15,'hall','steward'],['v12Water','炉边的旧伤',20,5,'hall','steward'],
 ['letter','被水浸过的信',40,20,'road','courier'],['herbs','先给谁的药',45,20,'town','herbalist'],
 ['lantern','晚归的路',35,12,'town','dolly'],['copper','铜圈传力',30,12,'workshop','repair-bench'],
 ['echo','旧机芯的回声',45,20,'workshop','lotti'],['c1ClockMemory','留在石下的名字',30,15,'town','oldwoman'],
 ['farewell','临行之前',10,5,'town','dolly'],['c1RuneWear','走偏的纹路',30,18,'c1LoomRoom','c1rosa'],
 ['c1RuneKiln','窑里不该有的风',35,20,'c1LoomRoom','c1rosa'],['c1AlchemistSamples','三处异变',50,30,'c1LoomRoom','c1saido']
].map(([id,name,xp,gold,map,target])=>({id,name,xp,gold,map,target,type:'支线'}));
export const C1_PATROL={id:'c1RunePatrol',name:'线路巡检',xp:10,gold:18,map:'c1LoomRoom',target:'c1rosa',type:'支线',routes:[['road','millpath'],['grove','c1ReedKiln']]};
export const C1_QUESTS=Object.fromEntries([...C1_MAIN,...C1_SIDE,C1_PATROL].map(q=>[q.id,q]));
export const C1_CORES={c1CoreBlade:{name:'刃型工艺核心',chance:.4},c1CoreShell:{name:'壳型工艺核心',chance:.35},c1CoreConduit:{name:'导型工艺核心',chance:.25}};
export const C1_RUNES=Object.fromEntries([
 ['c1RuneEdge','锋纹',24,'atk',1,2],['c1RuneStrength','力纹',20,'str',1,2],['c1RuneDexterity','轻纹',20,'dex',1,2],['c1RuneVitality','厚纹',22,'vit',1,2],['c1RuneWisdom','静纹',20,'wis',1,2],['c1RuneMana','蓄纹',18,'mp',10,18]
].map(([id,name,price,stat,min,max])=>[id,{id,name,price,stat,min,max,tier:1}]));
export const C1_RECIPES=Object.fromEntries([
 ['c1LoomWeapon','缀纹制式武器','weapon','c1CoreBlade',9,0,'skill',.03],
 ['c1LoomGloves','缀纹护手','hands','c1CoreBlade',1,6,'attack',.02],
 ['c1LoomChest','衬线轻甲','chest','c1CoreShell',0,30,'directReduction',.02],
 ['c1LoomBoots','双线短靴','feet','c1CoreShell',0,10,'speed',.03],
 ['c1LoomHood','静线兜帽','head','c1CoreConduit',0,16,'regen',.06],
 ['c1LoomCharm','蓄线坠','relic','c1CoreConduit',0,8,'mana',8]
].map(([id,name,slot,core,atk,hp,effect,value])=>[id,{id,name,slot,core,atk,hp,effect,value,rarity:'rare',level:3,minLevel:2,fee:6,sell:6}]));
export const C1_GEAR={
 c1FangWeapon:{name:'裂齿制式武器',slot:'weapon',atk:12,primary:1,effect:'opener'},
 c1TrailBoots:{name:'逐迹短靴',slot:'feet',hp:16,attrs:{dex:1},effect:'trail'},
 c1EchoHood:{name:'回声兜帽',slot:'head',hp:20,attrs:{wis:1},mp:10,effect:'killMana'},
 c1QuietRing:{name:'定声环',slot:'relic',hp:10,attrs:{vit:1},effect:'skillMana'},
 c1WingGloves:{name:'夜翼护手',slot:'hands',atk:2,attrs:{dex:1},effect:'threeHits'},
 c1VeinChest:{name:'静脉披甲',slot:'chest',hp:48,attrs:{vit:1},effect:'potionGuard'},
 c1StableChest:{name:'固脉胸衣',slot:'chest',hp:42,rarity:'rare',effect:'lowGuard'},
 c1FilterCharm:{name:'滤雾坠',slot:'relic',hp:8,attrs:{wis:1},rarity:'rare',effect:'regen',value:.10},
 c1CaptainSeal:{name:'追缉官的封缄',slot:'relic',atk:1,hp:18,effect:'evasion'}
};
export const C1_ELITES={
 'c1-elite-rat':{name:'裂齿渠鼠',type:'rat',map:'grove',hp:540,hit:16,heavy:27,wind:.9,part:'c1PartJaw',pool:['c1FangWeapon','c1TrailBoots'],x:1150,y:540},
 'echo-warden':{name:'灰脊守兽',type:'wolf',map:'echo',hp:720,hit:19,heavy:30,wind:1,part:'c1PartTendon',pool:['c1EchoHood','c1QuietRing']},
 'c1-elite-bat':{name:'苇窑夜翼',type:'bat',map:'c1ReedKiln',hp:660,hit:17,heavy:25,wind:.9,part:'c1PartMembrane',pool:['c1WingGloves','c1VeinChest'],x:1140,y:450}
};
export const C1_PARTS={c1PartJaw:'裂齿下颌',c1PartTendon:'灰脊腱束',c1PartMembrane:'夜翼膜片'};
export const C1_NEW_MAPS=['c1TrainingYard','c1DrillGallery','c1LoomRoom','c1NorthWalk','c1ReedKiln'];
export const C1_EFFECT_TEXT={skill:'主动技能直接伤害 +3%（同组取最高）',attack:'普攻直接伤害 +2%',directReduction:'直接承伤 ×0.98',speed:'移速 +3%',regen:'每秒法力恢复增加',mana:'最大法力 +8',opener:'目标生命高于70%时直接命中 +15%；冷却8秒',trail:'4秒未受伤后移速 +6%，受伤结束',killMana:'亲自击杀有效敌人恢复3 MP；冷却3秒',skillMana:'主动技能直接命中恢复2 MP；冷却8秒',threeHits:'3次有效普攻后下一主动技能首次直接命中 +12%；冷却8秒',potionGuard:'疗伤药后4秒承伤 ×0.92；冷却12秒',lowGuard:'生命低于35%时直接承伤 ×0.96',evasion:'避开实际威胁的重击后，6秒内下一主动技能首次直接命中 +18%；冷却10秒'};
export function c1DropIndex(u){if(!Number.isFinite(u)||u<0||u>=1)throw Error('Invalid uniform draw');return u<.075?0:u<.15?1:-1;}
export function c1CoreAt(u){return u<.4?'c1CoreBlade':u<.75?'c1CoreShell':'c1CoreConduit';}
