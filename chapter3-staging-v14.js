/**
 * Pure staging data. No world/core import or mutation.
 * Coordinates are WORLD FOOT POSITIONS checked against final chapter3-world-v14.js.
 * Root integration additions required:
 *   actorMeta: merge into actor(); renderAs hero/saint MUST ignore current controlled build.
 *   renderAs prop + propKind cot/cart/lift/brokenBell/chain/wheel/lamp = scenery actor.
 *   focus:[x,y], commitActor:'hero'|'saint'|null, speaker_actor_per_line.
 *   beat.fall must accept 0 (use hasOwn, not truthiness); faceTargets after motion.
 *   beat.actorMeta and outro.fall merge once BEFORE/WHILE the beat, then face actors.
 *   cueEffects optional visual directives, blocking moves guarantee action before text.
 *   autoFace:false keeps bystanders facing their own work instead of every NPC turning.
 * A props actor is excluded from target-facing, dialogue focus averaging and blocking.
 * Important: queued moves for one actor are sequential with explicit delay values.
 */
const H={renderAs:'hero',forceStoryHero:true,name:'诺恩',standing:true,fall:0};
const A={renderAs:'saint',forceStorySaint:true,name:'艾莉娅',standing:true,fall:0};
const DOCTOR={renderAs:'npc',name:'莫里斯',sprite:2,standing:true};
const MECHANIST={renderAs:'npc',name:'芮妲',sprite:11,standing:true};
const MINER={renderAs:'npc',name:'阿芙',sprite:6,standing:true};
const SOUL={renderAs:'enemy',type:'hellSoul',name:'亡魂',standing:true};
const CHAIN_SOUL={renderAs:'enemy',type:'hellGuard',name:'拖链亡魂',standing:true};
const WARDEN={renderAs:'enemy',type:'hellJailer',name:'缚链守卫',standing:true};
const prop=(kind,w,h,extra={})=>({renderAs:'prop',propKind:kind,w,h,autoFace:false,standing:false,...extra});
const move=(id,x,y,duration=.55,delay=0)=>[id,x,y,duration,delay];
const beat=(line,moves=[],extra={})=>({line,moves,...extra});
const stage=(map,actors,beats=[],extra={})=>({map,actors,initiallyHidden:[],beats,commitActor:'hero',actorMeta:{hero:{...H},saint:{...A}},faceTargets:{hero:'saint',saint:'hero'},...extra});
const COT=[535,545];
const COT_META=prop('cot',132,60,{depthYOffset:3});
const CART_META=prop('cart',134,78,{depthYOffset:13});
const BED_ACTORS={hero:[...COT],cot:[...COT],saint:[615,595],doctor:[625,505]};
const BED_META={hero:{...H,standing:false,fall:1},cot:COT_META,saint:{...A},doctor:DOCTOR};

export const CH3_STAGING={
  ch3Arrival:stage('hellGate',{
    hero:[340,835],saint:[420,870]
  },[
    beat(0,[move('hero',465,790,.55),move('hero',530,690,.6,.55),move('hero',540,555,.8,1.15),
      move('saint',490,815,.55),move('saint',585,690,.65,.55),move('saint',605,600,.65,1.2)],{cue:'distant'}),
    beat(5,[],{faceTargets:{hero:[385,395],saint:[385,395]}}),
    beat(8,[],{faceTargets:{hero:'saint',saint:'hero'}})
  ],{focus:[525,610],notes:'开场路径绕过落脚石与路灯；二人在破门东南方停稳。这里只指向世界已有破门，不凭空说脚下是新台阶。'}),

  ch3ChainTrack:stage('hellGate',{
    hero:[625,775],saint:[565,825],brokenBell:[705,865],shoreChain:[665,835]
  },[
    beat(0,[move('hero',665,780,.5),move('saint',600,810,.5)],{cue:'chain_drag'}),
    beat(2,[],{faceTargets:{hero:'brokenBell',saint:'brokenBell'}}),
    beat(4,[],{faceTargets:{hero:'saint',saint:'hero'}})
  ],{focus:[665,770],actorMeta:{hero:H,saint:A,brokenBell:prop('brokenBell',122,110),shoreChain:prop('chain',125,28,{flat:true})},
    notes:'破钟/短拖链是明确要求显示的剧情物件，根需渲染；在此场原地张紧即可，不从别层覆盖整张图。'}),

  ch3Souls:stage('hellWall',{
    hero:[780,740],saint:[710,790],soulWoman:[990,730],soulMan:[1060,790],soulCrowd:[950,855]
  },[
    beat(0,[move('soulWoman',945,745,.7),move('soulMan',1030,795,.75,.1),move('soulCrowd',920,835,.75,.15)]),
    beat(4,[move('saint',750,790,.35)]),
    beat(5,[move('soulWoman',910,750,.35),move('hero',820,770,.25)]),
    beat(8,[move('saint',745,805,.35)])
  ],{focus:[835,775],initiallyHidden:['soulWoman','soulMan','soulCrowd'],
    actorMeta:{hero:H,saint:A,soulWoman:{...SOUL,faceTo:'saint'},soulMan:{...SOUL,faceTo:'saint'},soulCrowd:{...SOUL,faceTo:'saint'}},
    speaker_actor_per_line:{1:'soulWoman',3:'soulWoman',5:'soulMan'},
    faceTargets:{hero:'soulWoman',saint:'soulWoman',soulWoman:'saint',soulMan:'saint',soulCrowd:'saint'},
    notes:'对白期间不导入普通巡逻怪模型；结束时脚点[820,770]用于第一波诺恩战斗。'}),

  ch3Wound:stage('hellWall',{
    hero:[800,740],saint:[720,790],chainSoul:[985,795]
  },[
    beat(0,[move('chainSoul',905,790,.45)]),
    beat(2,[move('hero',780,785,.18),move('chainSoul',870,790,.3,.1),move('hero',785,785,.5,.4),move('saint',725,825,.35,.5)],
      {fall:{hero:.62},cue:'chain_strike'}),
    beat(4,[move('saint',715,800,.35)],{faceTargets:{hero:'saint',saint:'hero'}})
  ],{focus:[800,775],initiallyHidden:['chainSoul'],actorMeta:{hero:H,saint:A,chainSoul:CHAIN_SOUL},
    faceTargets:{hero:'chainSoul',saint:'chainSoul',chainSoul:'saint'},
    notes:'先显示圣女警告和诺恩喊趴下；第2行之前才完成挡击、受伤跪撑，避免事后才喊趴下。'}),

  ch3Unseal:stage('hellWall',{
    hero:[785,785],saint:[715,800],chainSoul:[970,790]
  },[
    beat(2,[move('saint',725,800,.25)]),
    beat(7,[move('hero',785,785,.5)],{cue:'unseal',actorMeta:{saint:{sealed:false}},faceTargets:{hero:'saint',saint:'hero'}}),
    beat(8,[move('hero',785,785,.65)],{fall:{hero:1},cue:'fall',actorMeta:{hero:{standing:false}}}),
    beat(10,[move('saint',815,825,.45)],{cue:'holy_ward',faceTargets:{saint:'chainSoul',chainSoul:'saint'}})
  ],{focus:[815,795],commitActor:'saint',actorMeta:{hero:{...H,fall:.62,standing:false},saint:{...A,sealed:true},chainSoul:CHAIN_SOUL},
    faceTargets:{hero:'saint',saint:'hero',chainSoul:'saint'},
    notes:'unseal必须比fall先发生，诺恩被强制画为原诺恩，不能因主控切到圣女而变成女主。commitActor取saint，不能把玩家移到785,785伤者点。'}),

  ch3RescueCart:stage('hellWall',{
    hero:[785,785],saint:[715,825],mechanist:[1270,475],cart:[1270,510]
  },[
    beat(1,[move('mechanist',1190,620,.7),move('mechanist',1050,720,.7,.7),move('mechanist',875,825,.85,1.4),
      move('cart',1215,635,.7),move('cart',1075,740,.7,.7),move('cart',820,820,1.05,1.4)],{cue:'cart_wheel'}),
    beat(7,[move('cart',785,785,.45),move('mechanist',725,755,.7),move('saint',785,845,.45)],{cue:'cloth'}),
    beat(8,[],{actorMeta:{hero:{attachedTo:'cart',standing:false,fall:1}},faceTargets:{saint:'mechanist',mechanist:'saint'}})
  ],{focus:[855,735],commitActor:null,initiallyHidden:['mechanist','cart'],
    actorMeta:{hero:{...H,standing:false,fall:1},saint:A,mechanist:MECHANIST,cart:CART_META},
    faceTargets:{saint:'mechanist',mechanist:'saint'},
    outro:{moves:[
      move('cart',1005,730,1.15),move('cart',1180,620,.95,1.15),move('cart',1290,495,.8,2.1),
      move('hero',1005,730,1.15),move('hero',1180,620,.95,1.15),move('hero',1290,495,.8,2.1),
      move('mechanist',955,770,1.15),move('mechanist',1130,655,.95,1.15),move('mechanist',1240,540,.8,2.1),
      move('saint',1005,800,1.15),move('saint',1190,680,.95,1.15),move('saint',1330,540,.8,2.1)
    ],cue:'cart_wheel'},
    notes:'整组走完才交给runtime转入营地。hero和cart同轨重合是承载关系；只有这两者允许同脚点，不要把病人当走路跟随者。'}),

  ch3Doctor:stage('hellCamp',{
    hero:[425,590],cart:[425,590],cot:[...COT],saint:[595,615],doctor:[650,470],mechanist:[475,645]
  },[
    beat(0,[move('doctor',625,505,.55)]),
    beat(1,[move('hero',535,545,.75),move('saint',615,595,.6),move('mechanist',465,565,.65)],{cue:'cloth',actorMeta:{hero:{attachedTo:'cot'}}}),
    beat(3,[move('doctor',620,525,.3)],{faceTargets:{doctor:'hero',saint:'hero'}}),
    beat(6,[],{faceTargets:{doctor:'saint',saint:'doctor'}}),
    beat(9,[move('mechanist',500,615,.45)],{faceTargets:{mechanist:'saint',saint:'mechanist'}}),
    beat(12,[],{faceTargets:{doctor:'saint',saint:'doctor'}})
  ],{focus:[565,550],commitActor:'saint',actorMeta:{...BED_META,cart:CART_META,mechanist:MECHANIST},
    faceTargets:{doctor:'saint',saint:'doctor',mechanist:'hero'},
    notes:'床固定535,545，医生台是world已有460,450，绝不把病人放在制造台/神坛上。第0句先命令抬床，第1句出现前完成从车到床。'}),

  ch3MedicineDeparture:stage('hellCamp',{
    ...BED_ACTORS,saint:[690,605],doctor:[640,520]
  },[
    beat(0,[move('saint',665,590,.35)]),
    beat(3,[move('doctor',635,530,.25)]),
    beat(6,[],{faceTargets:{saint:'doctor',doctor:'saint'}})
  ],{focus:[620,565],commitActor:'saint',actorMeta:BED_META,
    faceTargets:{saint:'doctor',doctor:'saint'},outro:{moves:[move('saint',765,605,.65)]},
    notes:'仍显示床上的诺恩，只让圣女离开；commit位置取她，不能在finish时移到伤者。'}),

  ch3SaltGrotto:stage('hellGrotto',{
    saint:[635,565],miner:[815,535]
  },[
    beat(0,[],{faceTargets:{saint:'miner',miner:'saint'}}),
    beat(1,[move('saint',690,540,.5)]),
    beat(3,[move('saint',745,555,.4),move('miner',805,560,.25)])
  ],{focus:[745,550],commitActor:'saint',actorMeta:{saint:A,miner:{...MINER,standing:true}},
    faceTargets:{saint:'miner',miner:'saint'},notes:'站位在盐苔交互点南侧的安全通路，不站在低岩脊或盐苔本体上。'}),

  ch3SaltGather:stage('hellGrotto',{
    saint:[720,520],miner:[815,540]
  },[
    beat(3,[move('saint',755,520,.3)],{faceTargets:{saint:'miner',miner:'saint'}}),
    beat(4,[],{cue:'holy_heal'}),
    beat(6,[move('saint',725,510,.3)],{faceTargets:{saint:[730,430],miner:[730,430]}})
  ],{focus:[755,500],commitActor:'saint',actorMeta:{saint:A,miner:MINER},faceTargets:{saint:'miner',miner:'saint'},
    outro:{moves:[move('miner',805,570,.3),move('miner',665,565,.75,.3),move('miner',620,690,.7,1.05)]},
    notes:'盐苔实体730,430，交互点730,510；医治动作发生在采集地旁。阿芙从岩脊西边绕行，不穿低岩脊。'}),

  ch3WorkshopLamp:stage('hellWorkshop',{
    saint:[1030,610],mechanist:[1240,530],lamp:[1090,455]
  },[
    beat(0,[move('saint',1090,585,.5),move('mechanist',1170,550,.5)]),
    beat(2,[],{cue:'metal_latch'}),
    beat(3,[move('saint',1090,545,.35)]),
    beat(7,[move('saint',1100,575,.3)],{faceTargets:{saint:'mechanist',mechanist:'saint'}})
  ],{focus:[1120,550],commitActor:'saint',actorMeta:{saint:A,mechanist:MECHANIST,lamp:prop('lamp',28,48,{onScenery:'hell-bench',depthY:481})},
    faceTargets:{saint:'mechanist',mechanist:'saint'},notes:'制造台实体1100,480，二人站台前545–585一带；不再说顶住不存在的门。矿灯摆在制造台上。'}),

  ch3MineCrystal:stage('hellMine',{
    saint:[1165,455]
  },[
    beat(0,[move('saint',1180,415,.35)]),
    beat(2,[],{cue:'prism_lamp'})
  ],{focus:[1175,405],commitActor:'saint',actorMeta:{saint:{...A,faceTo:[1180,330]}},faceTargets:{saint:[1180,330]},
    notes:'stable prop ID仍为black-brine，显示名由root统一乳白凝晶。女主站415交互点，不走进330的装置碰撞。'}),

  ch3Treatment:stage('hellCamp',{
    ...BED_ACTORS,saint:[710,605]
  },[
    beat(0,[move('saint',615,595,.65)],{cue:'paper'}),
    beat(3,[move('doctor',620,520,.3)],{actorMeta:{doctor:{pose:'work'}}}),
    beat(5,[],{cue:'holy_focus'}),
    beat(7,[],{cue:'purge_wound'}),
    beat(10,[move('saint',650,610,.35)]),
    beat(11,[],{actorMeta:{doctor:{pose:null}},faceTargets:{saint:'doctor',doctor:'saint'}})
  ],{focus:[565,550],commitActor:'saint',actorMeta:BED_META,faceTargets:{doctor:'hero',saint:'hero'},
    notes:'诺恩整幕卧在535,545，光与手术发生在床边。最后一行仍由圣女提交位置，不能把玩家移进病床。'}),

  ch3Wake:stage('hellCamp',{
    ...BED_ACTORS
  },[
    beat(0,[move('hero',535,545,.6)],{fall:{hero:.7},cue:'cloth',actorMeta:{hero:{standing:false,awake:true}}}),
    beat(4,[move('doctor',620,520,.25)]),
    beat(7,[],{faceTargets:{hero:'saint',saint:'hero'}}),
    beat(10,[move('hero',535,545,1)],{faceTargets:{hero:[555,610],saint:'hero'}}),
    beat(12,[move('doctor',355,535,1.1)],{faceTargets:{saint:'hero',hero:'saint'}})
  ],{focus:[560,555],commitActor:'hero',actorMeta:{...BED_META,hero:{...H,standing:false,fall:1,awake:false}},
    faceTargets:{hero:'saint',saint:'hero',doctor:'hero'},
    outro:{moves:[move('hero',580,605,1.0)],fall:{hero:0},actorMeta:{hero:{standing:true,attachedTo:null}}},
    notes:'沉默至少1秒，最后一句说完才缓慢下床到580,605。恢复控制时用诺恩终点，而不是她的快捷栏或床中心。outro.fall=0必须支持。'}),

  ch3CampDeparture:stage('hellCamp',{
    hero:[845,575],saint:[765,625],doctor:[650,470]
  },[
    beat(0,[move('doctor',765,535,.85)]),
    beat(3,[],{faceTargets:{hero:'saint',saint:'hero',doctor:'hero'}}),
    beat(8,[move('doctor',765,550,.2)],{cue:'cloth'})
  ],{focus:[805,580],actorMeta:{hero:H,saint:A,doctor:DOCTOR},
    faceTargets:{hero:'doctor',saint:'doctor',doctor:'hero'},notes:'在营地中央开阔路口交代方向，医生从真实医台处走来；所有对白结束时站稳。'}),

  ch3Pass:stage('hellPass',{
    hero:[705,630],saint:[665,710]
  },[
    beat(0,[move('hero',740,615,.35),move('saint',705,690,.35)],{cue:'furnace_wind'}),
    beat(3,[],{faceTargets:{hero:'saint',saint:'hero'}}),
    beat(6,[move('hero',740,615,.45)],{cue:'cloth'}),
    beat(7,[],{cue:'holy_lantern',faceTargets:{hero:[820,600],saint:[820,600]}})
  ],{focus:[725,635],notes:'演员在第一根岩脊东侧地面，风口显示在655,530现有裂槽；不是往人物脚下画一个临时粗扇形。'}),

  ch3ArenaBefore:stage('hellArena',{
    hero:[800,400],saint:[710,445],chainWarden:[800,580],liftWheel:[900,365]
  },[
    beat(0,[move('hero',825,415,.3)]),
    beat(2,[move('chainWarden',800,575,1.1)],{cue:'warden_rise'}),
    beat(4,[move('hero',760,430,.45),move('saint',665,475,.45)],{faceTargets:{hero:'chainWarden',saint:'chainWarden'}})
  ],{focus:[790,470],initiallyHidden:['chainWarden'],actorMeta:{hero:H,saint:A,chainWarden:WARDEN,liftWheel:prop('wheel',62,82)},
    faceTargets:{hero:'chainWarden',saint:'chainWarden',chainWarden:'hero'},
    notes:'Boss使用800,580附近既定净空区域，玩家结束点760,430保留约155距离。靠近操作台并非直接踩进首领身体。'}),

  ch3ArenaAfter:stage('hellArena',{
    hero:[815,415],saint:[735,465],liftWheel:[900,365],lift:[935,625]
  },[
    beat(1,[move('hero',850,415,.3)]),
    beat(2,[move('saint',930,445,.85)]),
    beat(4,[move('lift',935,495,1.5)],{cue:'lift_rise'})
  ],{focus:[865,435],initiallyHidden:['lift'],actorMeta:{hero:H,saint:A,liftWheel:prop('wheel',62,82),lift:prop('lift',184,100,{flat:true,depthY:0})},
    faceTargets:{hero:'saint',saint:'hero'},notes:'操作轮900,365，升降台真实升到935,495；胜后仍可回营地，只有后续离开确认才封回路。'}),

  ch3End:stage('hellArena',{
    hero:[915,490],saint:[985,510],lift:[935,505],liftWheel:[900,365]
  },[
    beat(0,[],{faceTargets:{hero:'saint',saint:'hero'}}),
    beat(3,[move('saint',970,515,.3)]),
    beat(5,[move('lift',935,695,2.5),move('hero',915,680,2.5),move('saint',970,700,2.5)],
      {cue:'lift_descend',actorMeta:{hero:{attachedTo:'lift'},saint:{attachedTo:'lift'}}}),
    beat(9,[],{cue:'deep_gate'})
  ],{focus:[940,545],commitActor:null,actorMeta:{hero:H,saint:A,lift:prop('lift',184,100,{flat:true,depthY:0}),liftWheel:prop('wheel',62,82)},
    faceTargets:{hero:'saint',saint:'hero'},notes:'只在离开确认后启动。同步台面/人物，不让两人各自跑下去；用升降音、遮暗完成下降，不强行画一个不存在的可行走第四章。'})
};

const INNER_META={
  hester:{renderAs:'npc',name:'赫斯特',sprite:5,standing:true,faceTo:'dancer2'},
  guard1:{renderAs:'npc',name:'巡卫',sprite:7,standing:true,autoFace:false,faceTo:[900,670]},
  guard2:{renderAs:'npc',name:'巡卫',sprite:7,standing:true,autoFace:false,faceTo:'dancer2'},
  messenger:{renderAs:'npc',name:'巡卫',sprite:7,standing:true},
  dancer1:{renderAs:'npc',name:'舞者',sprite:11,standing:true,adult:true,idleAnimation:'dance',autoFace:false,faceTo:'hester'},
  dancer2:{renderAs:'npc',name:'舞者',sprite:6,standing:true,adult:true,idleAnimation:'dance',autoFace:false,faceTo:'hester'},
  servant:{pose:'tray',renderAs:'npc',name:'侍女',sprite:6,standing:true,adult:true,portrait:'ch2_servant_distressed'},
  victim1:{renderAs:'npc',name:'女税户',sprite:6,standing:true,faceTo:'hester'},
  victim2:{renderAs:'npc',name:'家属',sprite:3,standing:true,autoFace:false,faceTo:'victim1'}
};

export const CH2_REVISED_STAGING={
  ch2TargetBefore:stage('chamber',{
    hester:[1190,570],guard1:[390,705],guard2:[1010,815],dancer1:[865,745],dancer2:[965,720],servant:[1085,575],victim1:[650,645],victim2:[655,725]
  },[
    beat(0,[move('dancer1',885,740,.4),move('dancer1',875,760,.4,.4),move('dancer1',895,750,.4,.8),move('dancer1',900,765,.45,1.2),
      move('dancer2',985,725,.4),move('dancer2',970,740,.4,.4),move('dancer2',990,730,.4,.8),move('dancer2',955,755,.5,1.2)],
      {fall:{dancer1:.5},cue:'table_knock',actorMeta:{dancer1:{idleAnimation:null,standing:false}}}),
    beat(1,[move('dancer2',1040,675,.65)],{faceTargets:{dancer2:'hester',hester:'dancer2'}}),
    beat(3,[move('dancer2',945,735,.6)],{actorMeta:{dancer2:{idleAnimation:'dance'}},faceTargets:{hester:'victim1',victim1:'hester'}}),
    beat(4,[move('guard2',930,800,.45)],{faceTargets:{hester:'victim1'}}),
    beat(6,[move('guard1',440,690,.35)],{faceTargets:{guard1:'hester',hester:'guard1'}}),
    beat(8,[move('servant',1085,550,.35)],{faceTargets:{servant:'hester',hester:'servant'}})
  ],{focus:[965,650],commitActor:null,noCG:true,actorMeta:INNER_META,
    speaker_actor_per_line:{0:'hester',1:'dancer2',2:'hester',3:'victim1',4:'hester',5:'victim1',6:'guard1',7:'hester',8:'servant'},
    faceTargets:{hester:'dancer2',dancer2:'hester',servant:'hester',victim1:'hester',victim2:'victim1'},
    notes:'真实桌脚930..1150,458..510；所有人物在桌前或桌侧。女税户及家属在bench左端，不被630高的凳子盖脸。两名成年人舞者和两名护卫同时可见，受扭伤舞者停舞。'}),

  ch2TargetAfter:stage('chamber',{
    hester:[1190,570],guard1:[390,705],guard2:[930,800],messenger:[1390,800],dancer1:[900,765],dancer2:[965,720],servant:[1085,550],victim1:[650,645],victim2:[655,725]
  },[
    beat(0,[move('messenger',1285,650,.9)],{cue:'footstep'}),
    beat(3,[move('messenger',1390,800,1),move('servant',1095,570,.25)],{cue:'wine_spill',faceTargets:{hester:'servant',servant:'hester'}}),
    beat(5,[move('hester',1160,580,.2),move('servant',1040,650,.5,.15)],{fall:{servant:1},cue:'tray',actorMeta:{servant:{standing:false}}}),
    beat(6,[],{faceTargets:{servant:'hester',hester:'servant'}}),
    beat(7,[move('dancer2',990,665,.5)],{faceTargets:{dancer2:'servant'}}),
    beat(8,[move('dancer2',975,735,.6)],{actorMeta:{dancer2:{idleAnimation:'dance'}},faceTargets:{hester:'dancer2'}})
  ],{focus:[1040,650],commitActor:null,noCG:true,actorMeta:{...INNER_META,dancer1:{...INNER_META.dancer1,fall:.5,standing:false,idleAnimation:null}},
    speaker_actor_per_line:{0:'messenger',1:'hester',2:'messenger',3:'hester',4:'servant',5:'hester',6:'servant',7:'dancer2',8:'hester'},
    faceTargets:{hester:'messenger',messenger:'hester',servant:'hester',victim1:'hester',victim2:'victim1'},
    outro:{moves:[move('servant',1040,655,.6)],fall:{servant:.65},actorMeta:{servant:{standing:false,pose:'collect_shards'}}},
    notes:'先报信→离开→洒酒→责骂→推倒→侍女应是→旁人提醒碎瓷。侍女用疲惫受惊头像，不能被hero类渲染或弹出CG。'})
};

/** Apply after content registration; IDs and row counts remain unchanged. */
export const CH3_STAGING_DIALOGUE_PATCHES={
  ch3Arrival:{
    0:['艾莉娅','刚才的路呢？进来的时候，明明还能看见界碑。'],
    1:['诺恩','门洞还在。外面全是雾，看不见界碑了。'],
    3:['诺恩','别再往门洞走。那根横梁已经裂了。']
  },
  ch3Doctor:{
    0:['莫里斯','床上的东西挪开。把他抬这儿，头朝里面。'],
    8:['莫里斯','苔窟在营地北口，贴着矮灯桩走。凝晶在矿道，先到东南边的工坊借灯。芮妲，你把路画给她。']
  },
  ch3WorkshopLamp:{
    0:['芮妲','来得正好，替我扶住这根铜杆。它一松，整根轴就掉了。'],
    2:['芮妲','行，别动……好了。莫里斯要的灯就在台边，我已经装好灯芯了。'],
    7:['艾莉娅','我会带回来。另一边那台，一直在响。'],
    10:['芮妲','这才对。拿好灯，从工坊北口进矿道，沿断轨往东北走。凝晶在旧蒸馏管旁，别碰发绿的渗水。']
  },
  ch3MineCrystal:{
    2:['旁白','矿灯移近旧管下的岩缝，凝晶里的细线随光亮起。头顶不断滴水，空管里传来低低的回响。']
  },
  ch3MachineAccept:{
    8:['芮妲','从工坊北口进矿道，沿断轨往西走。旧检修柜在塌石前，门上挂着三个铁环，扯中间那个。']
  },
  ch3MachineProgress:{
    0:['芮妲','从北口进矿道，沿断轨往西。塌石前那只旧检修柜，门上挂着三个铁环。']
  }
};

export const CH3_STAGING_SPEAKER_ACTORS={
  '诺恩':'hero','艾莉娅':'saint','莫里斯':'doctor','芮妲':'mechanist','阿芙':'miner','乌洛':'ferryman',
  '亡魂':'soulWoman','赫斯特':'hester','侍女':'servant','舞者':'dancer2','女税户':'victim1','家属':'victim2'
};

export function applyCh3StagingDialoguePatches(dialogues){
  for(const [id,rows] of Object.entries(CH3_STAGING_DIALOGUE_PATCHES)){
    if(!dialogues[id])continue; // optional quest may not be included in this runtime yet.
    for(const [index,row] of Object.entries(rows)){
      if(!Array.isArray(dialogues[id][Number(index)]))throw new Error('V10 staging dialogue index missing: '+id+'['+index+']');
      dialogues[id][Number(index)]=[...row];
    }
  }
  return dialogues;
}
