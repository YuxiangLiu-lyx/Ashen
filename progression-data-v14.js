export const BLOODBLADE_BLEED_MAX_STACKS=30;
// Pure progression registry. Importable before RPG registration; no DOM or state mutation.
export const NORMAL_LEVEL_CAP=32;
export const CAREERS={
 bloodblade:{id:'bloodblade',cls:'shadow',name:'血刃',summary:'持续流血、引爆创口；适合贴身周旋。',growth:{str:2,dex:2,vit:1,wis:0},bonus:{str:3,dex:3,vit:2,wis:0},trait:'刻骨',traitDesc:`普攻每次施加一层裂伤，最多${BLOODBLADE_BLEED_MAX_STACKS}层；每次叠加刷新6秒持续时间。每秒每层造成 基础战力×0.08 + 敏捷×0.12 + 力量×0.08 伤害。裂伤不会触发吸血或装备连锁。`,skills:['bloodCarve','bloodFan','bloodHarvest','bloodRenew','bloodBinding']},
 assassin:{id:'assassin',cls:'shadow',name:'暗杀者',summary:'标记破绽，集中爆发；选择正确的出手时机。',growth:{str:2,dex:3,vit:0,wis:0},bonus:{str:3,dex:5,vit:0,wis:0},trait:'要害',traitDesc:'直接伤害对生命低于35%的敌人提高15%；暴击率额外+8%，仍受总上限45%约束。',skills:['assassinMark','assassinSever','assassinVeil','assassinFan','assassinFinish']},
 nightmare:{id:'nightmare',cls:'shadow',name:'夜魇',summary:'以密集而迅速的短刃攻击压住对手。',growth:{str:1,dex:3,vit:1,wis:0},bonus:{str:1,dex:5,vit:2,wis:0},trait:'不息刃',traitDesc:'攻速额外+20%；每次有效普攻回复2 MP，每0.45秒最多一次。移动速度不变。',skills:['nightFrenzy','nightMomentum','nightPursuit','nightBreaker','nightThirst']},
 dreadguard:{id:'dreadguard',cls:'oath',name:'铸誓卫',summary:'靠护盾承受攻击，以格挡反击和控制稳步推进。',growth:{str:1,dex:0,vit:3,wis:1},bonus:{str:1,dex:0,vit:6,wis:1},trait:'壁垒',traitDesc:'最大生命+12%，最终总减伤额外+8%（全来源最高60%）；有护盾时普攻伤害+12%。',skills:['guardAegis','guardBash','guardReprisal','guardMend','guardVerdict']},
 berserker:{id:'berserker',cls:'oath',name:'狂战士',summary:'挥动重刃连续作战，负伤时爆发更强，但要留意自身生命。',growth:{str:3,dex:1,vit:1,wis:0},bonus:{str:5,dex:1,vit:2,wis:0},trait:'鏖战',traitDesc:'每损失1%生命，直接伤害提高0.35%，最高+25%；攻速额外+15%。',skills:['rageAwaken','rageSunder','rageWhirl','rageExecute','rageReturn']},
 spellbreaker:{id:'spellbreaker',cls:'oath',name:'破咒骑士',summary:'精神重刃、破法与法力护体；允许战法混搭。',growth:{str:2,dex:0,vit:1,wis:2},bonus:{str:2,dex:0,vit:2,wis:4},trait:'咒钢',traitDesc:'普攻附加精神×0.65伤害；每次有效普攻回复3 MP，每0.7秒最多一次。',skills:['breakerEdge','breakerSeal','breakerWard','breakerSurge','breakerBrand']},
 pyromancer:{id:'pyromancer',cls:'ember',name:'焚星者',summary:'烈焰爆发、灼烧与范围清场。',growth:{str:0,dex:1,vit:1,wis:3},bonus:{str:0,dex:1,vit:1,wis:6},trait:'余火',traitDesc:'法术直接伤害提高12%；对灼烧目标再提高8%。不会让持续伤害递归触发。',skills:['pyroLance','pyroCrown','pyroBrand','pyroFeed','pyroMeteor']},
 frostweaver:{id:'frostweaver',cls:'ember',name:'霜缚师',summary:'冰霜减速、护盾与安全输出。',growth:{str:0,dex:1,vit:2,wis:2},bonus:{str:0,dex:1,vit:3,wis:4},trait:'冷凝',traitDesc:'对处于减速、束缚或眩晕中的敌人，直接伤害提高18%；最大法力+10%。',skills:['frostNeedle','frostPrison','frostMantle','frostBreath','frostShatter']},
 riftmage:{id:'riftmage',cls:'ember',name:'星渊术师',summary:'擅长蓄能、穿透弹与重力领域，威力强，但法力消耗较多。',growth:{str:0,dex:1,vit:0,wis:4},bonus:{str:0,dex:1,vit:1,wis:6},trait:'星核',traitDesc:'每次施放直接伤害的转职法术积1枚星核，最多3枚；下次伤害法术消耗满层，伤害+45%、消耗−25%。',skills:['riftLance','riftFocus','riftGravity','riftWard','riftCollapse']}
};
const skill=(id,career,name,kind,mp,cd,icon,formula,description,extra={})=>({id,career,name,kind,mp,cd,icon,formula,description,rank:3,level:1,school:['buff','shield','heal','mana','stance'].includes(kind)?'buff':['pyromancer','frostweaver','riftmage'].includes(career)?'spell':'melee',...extra});
const list=[
 skill('bloodCarve','bloodblade','剔骨刻痕','target',24,6,1,{B:.9,str:1.6,dex:2.5},`近身斩击并施加3层裂伤，最多${BLOODBLADE_BLEED_MAX_STACKS}层；刷新6秒持续时间。`,{range:155,bleed:3,fx:'cut',weapon:true}),
 skill('bloodFan','bloodblade','绯刃散华','pulse',34,12,10,{B:1.1,dex:2.3},'周围至多6个目标受到伤害并增加2层裂伤。',{range:190,maxTargets:6,bleed:2,fx:'spin',weapon:true}),
 skill('bloodHarvest','bloodblade','终红','target',32,14,2,{B:1.1,str:2,dex:2},'引爆目标裂伤：每层额外造成本次基础伤害的18%；消耗全部裂伤。',{range:170,consumeBleed:true,fx:'impact',weapon:true}),
 skill('bloodRenew','bloodblade','回红','heal',30,22,14,{vit:2,wis:1,constant:45},'恢复生命，上限为最大生命18%；附近有裂伤敌人时治疗提高30%，仍受上限约束。',{hpCap:.18,bleedHeal:true,fx:'holyHeal'}),
 skill('bloodBinding','bloodblade','血线缚足','target',28,16,7,{B:.6,dex:1.8},'普通敌人束缚2秒；首领只减速25%持续2.5秒。附加1层裂伤。',{range:270,bleed:1,control:2,fx:'soulBind'}),
 skill('assassinMark','assassin','死线标记','target',18,16,7,{B:.35,dex:.8},'标记持续8秒，你对此目标的直接伤害提高25%。',{range:310,mark:8,fx:'soulBind'}),
 skill('assassinSever','assassin','无声断喉','target',30,7,1,{B:1.7,str:2.3,dex:3.2},'刺击目标；命中自己标记的目标时，本次伤害再提高20%。不穿过墙壁。',{range:170,markedBonus:1.2,fx:'streak',weapon:true}),
 skill('assassinVeil','assassin','暗幕','buff',22,24,3,{},'6秒内受到伤害减少20%，下一次直接伤害提高40%；不是无敌或闪避。',{duration:6,buff:'assassinVeil',fx:'ashShield'}),
 skill('assassinFan','assassin','骤雨刃','pulse',30,11,0,{B:1.1,str:1.2,dex:2.4},'前方扇形至多5个目标；普通目标短暂失衡0.7秒。',{range:185,arc:1.15,maxTargets:5,control:.7,fx:'spin',weapon:true}),
 skill('assassinFinish','assassin','落幕','target',40,20,2,{B:2.2,str:2.5,dex:3.5},'目标生命低于35%时，伤害乘1.65；只提高本次伤害，不会直接处决首领。',{range:180,execute:1.65,fx:'impact',weapon:true}),
 skill('nightFrenzy','nightmare','夜行狂袭','buff',28,16,8,{},'8秒内攻速加成+60%；2–3阶每阶延长1秒，4–8阶每阶延长0.35秒；不增加移速。',{duration:8,buff:'nightFrenzy',fx:'bloodPact'}),
 skill('nightMomentum','nightmare','无尽追刃','buff',24,20,10,{},'12秒内普攻伤害+10%；每次有效普攻再叠+2%，最多10层，最高+30%。每一挥最多叠1层。',{duration:12,buff:'nightMomentum',fx:'streak'}),
 skill('nightThirst','nightmare','饮夜','buff',26,22,14,{},'10秒内普攻按实际损伤的10%回复生命；单次最多回复最大生命1.5%，两次回复至少间隔0.45秒。群攻每一挥最多治疗一次。',{duration:10,buff:'nightThirst',fx:'bloodPact'}),
 skill('nightPursuit','nightmare','钉影','target',22,9,7,{B:.8,dex:2.6},'向近中程目标掷刃并减速35%持续3秒；用于接近远程敌人。',{range:285,slow:3,slowFactor:.65,fx:'streak',weapon:true}),
 skill('nightBreaker','nightmare','破夜连锋','pulse',34,13,2,{B:1.2,str:1.2,dex:2.3},'前方至多5名目标受到重击；使其4秒内受到直接伤害提高12%。首领提高6%。',{range:185,arc:1.15,maxTargets:5,fracture:4,fx:'impact',weapon:true}),
 skill('guardAegis','dreadguard','不坠壁垒','shield',30,20,3,{vit:3.8,wis:1.1,constant:50},'获得持续8秒护盾，上限为最大生命28%。',{duration:8,hpCap:.28,fx:'ashShield'}),
 skill('guardBash','dreadguard','震垒','pulse',24,9,2,{B:1,str:1.5,vit:1.8},'打击身周至多5名目标；普通敌人眩晕1.3秒，首领减速20%，持续1.8秒。',{range:160,maxTargets:5,control:1.3,fx:'impact',weapon:true}),
 skill('guardReprisal','dreadguard','守誓反击','stance',20,16,0,{B:1.4,str:1.5,vit:2},'持续6秒，受到有效伤害时向身周反击；最多反击3次，每次间隔至少1秒。',{duration:6,buff:'guardReprisal',range:180,charges:3,fx:'guard'}),
 skill('guardMend','dreadguard','坚忍','heal',30,24,14,{vit:2.5,wis:.8,constant:55},'恢复生命，上限为最大生命22%。',{hpCap:.22,fx:'holyHeal'}),
 skill('guardVerdict','dreadguard','裂城重誓','pulse',42,17,6,{B:1.8,str:2,vit:2.6},'前方至多6名目标受到重击；有护盾时伤害提高25%。',{range:205,arc:1.25,maxTargets:6,shieldBonus:1.25,fx:'impact',weapon:true}),
 skill('rageAwaken','berserker','狂战之血','buff',26,20,10,{},'消耗当前生命10%（不会致死）；8秒内直接伤害+30%、攻速+45%，受到伤害+10%。',{duration:8,buff:'rageAwaken',hpCost:.1,fx:'bloodPact'}),
 skill('rageSunder','berserker','崩甲','target',26,7,2,{B:1.2,str:3.4},'重斩并令敌人4秒内受到直接伤害提高12%，首领提高6%。',{range:180,fracture:4,fx:'impact',weapon:true}),
 skill('rageWhirl','berserker','断岩回旋','pulse',34,10,0,{B:1.4,str:2.8,dex:.7},'扫过身周至多7名目标。',{range:200,maxTargets:7,fx:'spin',weapon:true}),
 skill('rageReturn','berserker','浴血返身','target',28,14,14,{B:1.1,str:2.4,vit:.8},'命中时回复实际伤害的18%，最多为最大生命10%。',{range:175,drain:.18,drainCap:.1,fx:'cut',weapon:true}),
 skill('rageExecute','berserker','碎岳终斩','target',44,18,6,{B:2.1,str:4,vit:.8},'目标生命低于35%时伤害乘1.5。',{range:190,execute:1.5,fx:'impact',weapon:true}),
 skill('breakerEdge','spellbreaker','咒钢刃','buff',24,17,8,{},'10秒内普攻额外附加精神×1.2伤害。该伤害只算一次，不会自行连锁。',{duration:10,buff:'breakerEdge',fx:'streak'}),
 skill('breakerSeal','spellbreaker','断咒封印','target',28,12,7,{B:.8,str:1.2,wis:2.4},'普通敌人眩晕1.6秒；首领减速25%持续2秒，不取消首领蓄力。',{range:285,control:1.6,fx:'soulBind'}),
 skill('breakerWard','spellbreaker','咒蚀护体','shield',32,22,3,{vit:2.2,wis:2.4,constant:40},'获得8秒护盾，上限为最大生命25%。',{duration:8,hpCap:.25,fx:'ashShield'}),
 skill('breakerSurge','spellbreaker','夺法','target',18,11,12,{B:.9,str:1.8,wis:1.8},'斩中后回复 12 + 精神×0.08 MP，单次最高30 MP。',{range:190,manaHit:true,fx:'cut',weapon:true}),
 skill('breakerBrand','spellbreaker','逆咒裁断','pulse',40,16,6,{B:1.4,str:2,wis:3.2},'前方至多6名敌人受到力量与精神共同增幅的冲击。',{range:225,arc:1.2,maxTargets:6,fx:'graveBell',weapon:true}),
 skill('pyroLance','pyromancer','焚星枪','projectile',26,5,4,{B:1.1,wis:3.8},'发射穿透火枪，最多命中2个目标，后续目标承受70%。',{range:450,speed:520,pierce:1,secondary:.7,fx:'flame'}),
 skill('pyroCrown','pyromancer','焰冕','pulse',40,13,5,{B:1.3,wis:3.1},'身周至多7名目标受到爆焰并灼烧6秒；灼烧每秒为本次基础伤害10%。',{range:220,maxTargets:7,burn:6,fx:'flame'}),
 skill('pyroBrand','pyromancer','赤烙','target',24,9,10,{B:.7,wis:2.4},'引燃一名敌人，灼烧6秒；灼烧每秒为本次基础伤害15%。',{range:380,burn:6,burnFactor:.15,fx:'flame'}),
 skill('pyroFeed','pyromancer','吞烬','mana',8,25,12,{wis:.45,constant:32},'回复法力，最高为最大法力25%；施放时附近有灼烧敌人，额外回复10 MP，仍受上限约束。',{mpCap:.25,burnMana:10,fx:'soulBind'}),
 skill('pyroMeteor','pyromancer','陨火裁决','targetPulse',52,19,6,{B:2,wis:4.5},'轰击目标所在区域，至多6名敌人受伤；对灼烧目标提高25%。',{range:410,radius:145,maxTargets:6,burnBonus:1.25,fx:'flame'}),
 skill('frostNeedle','frostweaver','穿霜','projectile',24,5,7,{B:1,wis:3.3},'发射贯穿冰枪，最多命中3个目标；第二目标伤害70%，第三目标49%。命中减速30%，持续2秒。',{range:450,speed:510,pierce:2,secondary:.7,fx:'frost'}),
 skill('frostPrison','frostweaver','寒狱','targetPulse',34,14,6,{B:.8,wis:2},'范围内至多6名普通敌人冻结2秒；首领减速30%持续3秒。',{range:360,radius:150,maxTargets:6,control:2,slowFactor:.7,fx:'frost'}),
 skill('frostMantle','frostweaver','冰衣','shield',28,20,3,{vit:1.5,wis:2.8,constant:45},'获得8秒护盾，上限为最大生命28%。',{duration:8,hpCap:.28,fx:'ashShield'}),
 skill('frostBreath','frostweaver','静雪','buff',20,24,12,{},'8秒内每秒恢复 4 + 精神×0.035 MP；不刷新药水冷却。',{duration:8,buff:'frostBreath',fx:'soulBind'}),
 skill('frostShatter','frostweaver','碎冬','targetPulse',44,15,5,{B:1.5,wis:4},'对范围内至多6个敌人造成伤害；目标被控制或减速时，本次伤害再提高25%。',{range:380,radius:145,maxTargets:6,frozenBonus:1.25,fx:'frost'}),
 skill('riftFocus','riftmage','开眼','buff',26,22,8,{},'10秒内转职直接伤害法术提高25%，耗蓝提高10%；不影响普通攻击。',{duration:10,buff:'riftFocus',fx:'soulBind'}),
 skill('riftLance','riftmage','贯星','projectile',30,5,4,{B:1.3,wis:4},'发射星光束，最多命中3个目标；第二目标伤害80%，第三目标64%。',{range:490,speed:600,pierce:2,secondary:.8,fx:'holyCast'}),
 skill('riftGravity','riftmage','坠星引力','targetPulse',38,12,7,{B:1,wis:2.8},'至多7名目标减速40%持续4秒；首领减速25%。',{range:410,radius:165,maxTargets:7,slow:4,slowFactor:.6,fx:'soulBind'}),
 skill('riftWard','riftmage','星壳','shield',32,21,3,{vit:1,wis:3.2,constant:35},'获得7秒护盾，上限为最大生命24%。',{duration:7,hpCap:.24,fx:'ashShield'}),
 skill('riftCollapse','riftmage','星渊崩落','targetPulse',58,17,6,{B:2.2,wis:5.2},'对目标周围至多7名敌人造成大范围星光伤害。可消耗满层星核。',{range:430,radius:185,maxTargets:7,fx:'holyNova'})
];
export const PROGRESSION_SKILLS=Object.fromEntries(list.map(s=>[s.id,s]));
export function careerFor(p){const c=CAREERS[p.career?.id];return c?.cls===p.cls?c:null;}
// Stage 1 is the only advancement gift. Four independent rewards belong to
// the activity progression, not levels, skill points, generic books or loadouts.
export const CAREER_STAGE_LABELS={1:'转职即得',2:'裂灯巡猎',3:'矿庭寻宝',4:'无赎死斗',5:'三灯试炼'};
export function careerSkillStage(p,k){const c=careerFor(p);return c?c.skills.indexOf(k)+1:0;}
export function careerSkillUnlocked(p,k){
 if(!PROGRESSION_SKILLS[k])return true;
 const stage=careerSkillStage(p,k);if(!stage)return false;
 if(p.career.preview===true)return true;
 return Array.isArray(p.career.unlockedStages)?p.career.unlockedStages.includes(stage):stage===1;
}
export function careerUnlockedSkills(p){return (careerFor(p)?.skills||[]).filter(k=>careerSkillUnlocked(p,k)&&(p.skills?.[k]||0)>0);}
export function careerTimers(p){return Object.fromEntries(Object.entries(p.careerState?.timers||{}).filter(([k])=>PROGRESSION_SKILLS[k]&&careerSkillUnlocked(p,k)&&(p.skills?.[k]||0)>0));}
export function careerGrowthBonus(p,key,baseGrowth){const c=careerFor(p);if(!c)return 0;const from=p.career.preview?1:Math.max(1,p.career.levelAtUnlock||p.level);return (c.bonus[key]||0)+Math.max(0,p.level-from)*((c.growth[key]||0)-(baseGrowth||0));}
export function applyCareerStats(p,s,a){
 const c=careerFor(p),t=careerTimers(p);if(!c)return s;
 let haste=c.id==='nightmare'?.2:c.id==='berserker'?.15:0;
 if(t.nightFrenzy>0)haste+=.6;if(t.rageAwaken>0)haste+=.45;
 s.attackRate=Math.max(.105,s.attackRate*(1+s.haste)/(1+s.haste+haste));s.haste+=haste;
 if(c.id==='dreadguard'){s.hp=Math.round(s.hp*1.12);s.reduction=Math.min(.6,s.reduction+.08);}
 if(t.assassinVeil>0)s.reduction=Math.min(.6,s.reduction+.2);
 if(c.id==='assassin')s.crit=Math.min(.45,s.crit+.08);
 if(c.id==='frostweaver')s.mp=Math.round(s.mp*1.1);
 if(c.id==='spellbreaker')s.atk+=a.wis*.65;
 if(t.breakerEdge>0)s.atk+=a.wis*1.2;
 return s;
}
export const MEMORY_CAREERS={shadow:'nightmare',oath:'berserker',ember:'riftmage'};
