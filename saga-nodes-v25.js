// A node is either a staged scene, a playable objective, or scene then objective.
// Reward amounts are internal balancing data; the player sees only the opened parcel.
import {SAGA_WORLD_TASKS_V25,SAGA_ENCOUNTERS_V25} from './saga-world-v25.js';
const reward=(chapter,extra={})=>({xp:chapter===6?420:chapter===7?570:760,gold:chapter===6?90:chapter===7?125:160,...extra});
const scene=(id,map,title,objective,extra={})=>({id,scene:id,map,chapter:Number(id.match(/c([67])v25/)?.[1]||8),title,objective,...extra});
const task=(id,map,key,chapter,objective,extra={})=>({id,scene:null,map,task:key,chapter,title:objective,objective,...extra});
export const SAGA_SPIRIT_TOPICS_V25={cup:{title:'说说那只旧杯子',scene:'v25C8SpiritCup'},practice:{title:'请她再看看起手',scene:'v25C8SpiritPractice'},boundary:{title:'隐庭留下的界纹',scene:'v25C8SpiritBoundary'},companions:{title:'聊聊同行的行装',scene:'v25C8SpiritCompanions'}};
export const SAGA_NODES_V25=[
 scene('c6v25Musician','ch5Exit','微服私访','听完出口附近那位乐师的话。',{effects:['cloak'],travelTo:'ch6Outpost'}),
 scene('c6v25Checkpoint','ch6Outpost','篷下的密令','披着斗篷穿过外哨，留意车辙旁的声音。',{effects:['killOrder']}),
 scene('c6v25Gather','ch6ReedWild','换个模样','沿芦苇野径找齐乌叶果、赤根和细苇绒。',{task:'ch6CollectDisguise',reward:reward(6,{items:{hpGrand:2,mpGrand:2}})}),
 task('v25DisguiseBasin','ch6VillageLane','ch6MakeDisguise',6,'在村口门边的清水罐把东西调开。'),
 scene('c6v25Disguise','ch6VillageLane','村口梳洗','帮艾莉娅把最后一点浅发藏好。',{effects:['disguise']}),
 scene('c6v25Village','ch6VillageLane','借宿的人','跟着村妇的指点，去广场看新贴的税单。',{task:'ch6ReadTax',reward:reward(6)}),
 scene('c6v25Tax','ch6VillageSquare','秤砣另一边','去北侧盐税仓院找底册，设法放出受困的仓工。',{task:'ch6TaxLedger',reward:reward(6,{random:true,gearSlot:'hands',gearName:'搬盐人的护腕',items:{hpGrand:2,mpGrand:2}})}),
 scene('c6v25Conscription','ch6VillageSquare','来取人的车','截住北埠车道上的押送车，找出名册并打开铁锁。',{task:'ch6RescueConvoy',reward:reward(6,{random:true,items:{hpGrand:3,mpGrand:2}})}),
 scene('c6v25Rescue','ch6ConvoyRoad','没有名字的名册','带获救的人去南面的渡口旧屋。',{effects:['villageTruth','ticket'],reward:reward(6,{gearSlot:'chest',gearName:'渡口旧盟衣'})}),
 task('v25FerrySupply','ch6Riverside','ch6FerrySupply',6,'在渡口整理老人留下的行路包裹。',{reward:reward(6,{items:{hpGrand:3,mpGrand:3}})}),
 scene('c6v25Departure','ch6Riverside','渡口不熄灯','等最后一位村民上船，再回屋里歇下。'),
 scene('c6v25NightTalk','ch6Riverside','仍有灯火','把今晚的话说完；临河客舍就在东边的水路旁。',{reward:reward(6,{ap:3,sp:1})}),
 scene('c7v25Confide','ch7Camp','袒露真心','在窗边坐一会儿，回答艾莉娅的疑问。'),
 scene('c7v25ContractOne','ch7BrokerLane','第一段旧路','从石阶暗巷找到旧契密库的入口。',{task:'ch7BrokerApproach'}),
 task('v25BrokerContract','ch7BrokerVault','ch7BrokerContract',7,'打倒私契监押人，拿到账契并解救书吏。',{reward:reward(7,{random:true,items:{hpGrand:3,mpGrand:2}})}),
 scene('c7v25FirstEscape','ch7BrokerVault','追雨的人','带少年脱离密库，继续讲起另一条河上的事。',{reward:reward(7,{gearSlot:'feet',gearName:'穿雨旧履'}),travelTo:'ch7Camp'}),
 scene('c7v25ContractTwo','ch7GrainWharf','第二段旧路','穿过码头守卫，找到去底舱的舱牌。',{task:'ch7GrainApproach'}),
 task('v25GrainContract','ch7GrainHold','ch7GrainContract',7,'打开被拴住的底舱，留下运粮单，让百姓先离船。',{reward:reward(7,{random:true,items:{hpGrand:3,mpGrand:3}})}),
 scene('c7v25Granary','ch7GrainHold','粮船离岸','把岸上的人送走，再讲那条山道上的相逢。',{reward:reward(7,{ap:3,sp:1}),travelTo:'ch7Camp'}),
 scene('c7v25Odric','ch7OdricPass','风雨中的老兵','帮奥德里克清开山路，找回泥里的旧旗袋。',{task:'ch7HelpOdric',reward:reward(7,{random:true})}),
 scene('c7v25OdricFarewell','ch7OdricPass','老兵的约定','和奥德里克道别。',{reward:reward(7,{gearSlot:'relic',gearName:'老兵的铜扣',items:{hpGrand:2,mpGrand:2}})}),
 scene('c7v25Martha','ch7MarthaHospice','溪畔药炉','天亮后清开药舍外的危险，补齐玛尔塔需要的药。',{task:'ch7HelpMartha',reward:reward(7,{random:true})}),
 scene('c7v25MarthaFarewell','ch7MarthaHospice','药篓里的路费','临行前再和玛尔塔说几句。',{reward:reward(7,{items:{hpGrand:4,mpGrand:3},ap:3})}),
 scene('c7v25Severin','ch7SeverinBridge','桥上两边','和塞维尔守住旧桥，收好证人的口供。',{task:'ch7HelpSeverin',reward:reward(7,{random:true})}),
 scene('c7v25SeverinFarewell','ch7SeverinBridge','后来听见的消息','讲完分别后的消息，回到客舍灯下。',{reward:reward(7,{items:{hpGrand:3,mpGrand:3},sp:2}),effects:['ticket'],travelTo:'ch7Camp'}),
 scene('c7v25Truth','ch7Camp','没有说完的那一夜','把血魔降临后的事讲给艾莉娅听。',{effects:['bloodTruth'],reward:reward(7,{ap:4,sp:1})}),
 scene('v25C8Pursuit','ch8FlightRavine','雾外来客','挡住追来的裁誓骑士，替艾莉娅争取退路。',{task:'ch8Setback'}),
 scene('v25C8Defeat','ch8FlightRavine','这一刀的距离','带艾莉娅沿石缝逃进山雾，不必与追卫纠缠。',{task:'ch8Escape'}),
 scene('v25C8Sanctuary','ch8HiddenGate','镜泉隐庭','走过花隐溪门，听听那位女子的来意。',{routeMaps:['ch8FlowerCourt'],effects:['unmask']}),
 scene('v25C8Lodging','ch8GuestHouse','借宿一夜','安顿好艾莉娅，再去看看临溪客舍。',{routeMaps:['ch8FlowerCourt'],reward:reward(8,{items:{hpGrand:3,mpGrand:3}})}),
 scene('v25C8Dawn','ch8DawnTerrace','晨露未干','照澄璃所教起手，击败剑侍，再查看练剑木桩。',{task:'ch8DawnPractice',reward:reward(8,{ap:4,sp:2})}),
 task('v25StoneTrial','ch8StoneTrial','ch8StoneTrial',8,'清过折瀑石阶，查看尽头的残刻。',{reward:reward(8,{random:true,items:{hpGrand:3,mpGrand:2}})}),
 scene('v25C8StoneAfter','ch8StoneTrial','低处的一片羽毛','与澄璃一同查看石缝，再沿石阶去镜潭。',{effects:['training:stone'],reward:reward(8,{gearSlot:'weapon',gearName:'折瀑行锋'})}),
 task('v25MirrorTrial','ch8MirrorTrial','ch8MirrorTrial',8,'让镜潭残影安静下来，收回残缺的界片。',{reward:reward(8,{random:true,items:{hpGrand:3,mpGrand:3}})}),
 scene('v25C8MirrorAfter','ch8MirrorTrial','不肯丢下的碎片','把界片交还澄璃，再向风雨悬台前行。',{effects:['training:mirror'],reward:reward(8,{ap:5,sp:2})}),
 task('v25StormTrial','ch8StormTrial','ch8StormTrial',8,'战胜悬台守剑像，敲响风雨尽头的铜铃。',{reward:reward(8,{random:true,items:{hpGrand:4,mpGrand:3}})}),
 scene('v25C8TrialRescue','ch8StormTrial','风停以前','余波正从悬台下涌上来。',{effects:['training:storm'],reward:reward(8,{gearSlot:'relic',gearName:'镜泉留声'}),travelTo:'ch8FlowerCourt'}),
 scene('v25C8Recovery','ch8FlowerCourt','一碗温水','在花庭歇到气息平稳，别急着再练。'),
 scene('v25C8Table','ch8GuestHouse','三个人的晚饭','回客舍和她们吃一顿安静的饭。',{reward:reward(8,{items:{hpGrand:4,mpGrand:4}})}),
 scene('v25C8Warning','ch8FlowerCourt','旧印来访','守住花庭外的界石，为澄璃争取时间。',{task:'ch8DefendBoundary',reward:reward(8,{random:true,items:{hpGrand:3,mpGrand:3}})}),
 scene('v25C8Hold','ch8LastSanctum','最后一道界','在最后的界庭与澄璃会合。'),
 scene('v25C8Bind','ch8LastSanctum','把名字留下','握住仍有回应的武器，迎战赫洛恩。',{startEffects:['spirit'],task:'ch8FinalDuel',reward:reward(8,{random:true,gearSlot:'hands',gearName:'守泉之约',ap:5,sp:3})}),
 scene('v25C8After','ch8LastSanctum','仍有回应','听清武器里传来的声音。',{effects:['ticket']}),
 scene('v25C8Farewell','ch8FlowerCourt','山门之外','回花庭收拾行囊，与澄璃一起离开。',{effects:['finish'],reward:reward(8,{ap:4,sp:2})})
];
export const SAGA_TASKS_V25=structuredClone(SAGA_WORLD_TASKS_V25);
SAGA_TASKS_V25.ch6CollectDisguise.itemByProp={'v25-dye-leaf':'v25ReedDye','v25-dye-bark':'v25Bark','v25-dye-clay':'v25RiverClay'};
SAGA_TASKS_V25.ch8Setback={id:'ch8Setback',map:'ch8FlightRavine',kind:'duel',propIds:[],enemyIds:['v25-viser-setback'],spawns:[['v25PursuitKnight',1040,610,'v25-viser-setback']]};
Object.assign(SAGA_TASKS_V25.ch8Escape,{kind:'escape',requireClear:false,escapeAt:[1250,380,95]});
for(const n of SAGA_NODES_V25)if(n.task&&SAGA_TASKS_V25[n.task])SAGA_TASKS_V25[n.task].objective=n.objective;
