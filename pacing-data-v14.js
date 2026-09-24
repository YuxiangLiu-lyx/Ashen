// V12 已集成的四章旅途任务。地图、NPC和道具 ID 对应 core-v12 实际注册结果。
// 每个任务在 g.v12.quests[id] 保存 { status, counts, misses, claimed }。
// available 为全 AND；flagsAll / flagsNone 为白名单，不执行字符串代码。
const q=(id,chapter,name,giver,giverMap,receiver,receiverMap,available,goals,reward,dialogue,extra={})=>({id,chapter,name,giver,giverMap,receiver,receiverMap,available,goals,reward,dialogue,optional:true,flagsOnClaim:[id+'Done'],...extra});
const talk=(map,target)=>({kind:'talk',map,target,count:1});
const gather=(map,target,label)=>({kind:'gather',map,target,count:1,label,creditOnPriorUse:true});
const kill=(map,enemyTypes,count)=>({kind:'kill',map,enemyTypes,count,excludeBosses:true,excludeSummons:true});
const drop=(map,enemyTypes,count,item,rate=.65,pity=2)=>({kind:'drop',map,enemyTypes,count,item,rate,pity,excludeBosses:true,excludeSummons:true,questOnly:true});
export const V12_PACING=[
 q('v12Water',1,'炉边的一壶水','steward','hall','steward','hall',
   {region:1,flagsNone:['chapterOneComplete']},
   [gather('guestroom','guest-basin','装好客房里晾凉的清水')],
   {xp:20,gold:5,items:{hp:1}},
   {accept:[['奥伦','先别脱外衣，再帮我跑一趟。客房里有一盆烧开后晾着的水，替我装一壶来，炉上这锅还太烫。'],['诺恩','你又烫着了？'],['奥伦','没烫着。鲁恩一直催茶，我让他吹了半天，他还嫌耽误写字。壶在盆边，拿那只盖子齐全的。']],progress:[['奥伦','客房就在会馆西边。装半壶就够，别让水从盖子里晃出来。']],goal:[[['旁白','水已经凉了。诺恩装了半壶，把壶盖转到缺口的另一侧。'],['诺恩','这只不漏。']]],complete:[['奥伦','放这儿就行。药也拿一瓶，你的外袋都瘪了。'],['诺恩','不过是帮你提壶水。'],['奥伦','所以只给你一瓶。下次坐下吃顿饭再走，别总空着肚子跑。']],after:[['奥伦','鲁恩那杯已经续过了。再催，我就把整壶送到他桌上。']]},
   {route:'灰烛会馆西侧房门 → 会馆客房，靠墙的清水陶盆；装好后原路回炉边找奥伦。',notes:['复用 guest-basin；额外计一次任务取水，不消耗、不禁用原有交互。','不声称画面中出现新炉台；奥伦日常位置仍按现有场景。']}),
 q('v12CourierRoad',1,'林边的投递路','courier','road','courier','road',
   {region:1,flagsNone:['chapterOneComplete']},
   [kill(['road','millpath'],['wolf'],4)],
   {xp:45,gold:15,items:{mp:1}},
   {accept:[['阿林','城门倒好过，林子边上那段路可不行。昨天有头狼一直跟我到矮墙边，今天又多了几头。'],['诺恩','你还走这条路？'],['阿林','林子里还有两户老人等着收信，他们又不进城。你若往那边去，能不能替我赶开路边那几头狼？我跟在你后面走。'],['诺恩','别跟着，在这里等我回来。']],progress:[['阿林','旧王道东段，还有通往旧磨坊的岔路。把贴着路走的几头清掉就好，林子深处不用追。']],complete:[['诺恩','路边的狼清掉了，趁天亮赶紧去。'],['阿林','我收好这捆就去。钱不多，你别嫌。'],['诺恩','信封别弄湿了。'],['阿林','知道。我这件外衣就是拿来包信的，自己淋点雨倒不碍事。']],after:[['阿林','那两户的信送到了。一位老太太还问我，是不是换了条不下雨的近路。']]},
   {route:'旧王道东段和东南岔路 → 旧磨坊小径，清理 4 头靠路的野狼；回旧王道西段找阿林。',notes:['不生成跟随信使；他明说在原处等，交付之后才叙述离线投递结果。','只计接取后的自然遭遇；两地图重进会刷新，任务最多 4 只，不要求特定狼王。']}),
 q('v12NorthDelivery',1,'改道的面粉车','clerk','hall','watch','town',
   {region:1,maxChapter:2,flagsNone:['chapterOneComplete']},
   [talk('town','watch')],
   {xp:25,gold:10,items:{}},
   {accept:[['鲁恩','你要进白榆城吧？替我告诉托马，面粉车下午从西门进。北门那段石板还没补好，车得改道。'],['诺恩','他认识我？'],['鲁恩','不必提你的名字。就说灰烛会馆的两袋面粉别再卸到礼拜厅。上回奥伦自己扛回来，骂了我一路。']],progress:[['鲁恩','托马就在礼拜厅外那条街上。他若问是哪辆车，说车帮上系着两根麻绳。']],complete:[['诺恩','会馆的面粉车下午走西门。别卸到礼拜厅。'],['托马','两根麻绳那辆？知道了。北门缺了几块石板，我也不敢再让重车压。'],['诺恩','那就麻烦你留意了。'],['托马','跑一趟辛苦了。车行留的脚钱，你拿着。北面那堆石头别踩，进城沿井边走。']],after:[['托马','面粉车我已经交代过了。你们管家不用再来扛那两袋。']]},
   {route:'会馆南门 → 旧王道向东 → 白榆城；沿井边向北，在礼拜厅前街找托马。',expiresOn:['chapterOneComplete'],notes:['A 鲁恩交代找 B 托马，接受后 B 立即是金色问号。','刺杀后不再新接；已接可交，托马不叫诺恩名字，不识破身份。']}),
 q('v12WatchHours',2,'桥口查到几时','seline','inn','bridgewatch','bridge',
   {region:2,minChapter:7,maxChapter:7,flagsNone:['alarm']},
   [talk('bridge','bridgewatch')],
   {xp:25,gold:0,items:{}},
   {accept:[['塞琳','先别急着走那道小门。今天桥口加了人，早上听他们说要换班，可我没听清是什么时候。'],['诺恩','我去问。'],['塞琳','去问巡卫，就说你要送修水泵的铁件。别带她过去，桥上正到处找圣女。你们两个一起露面，要是查到我这里，这店也别想开了。']],progress:[['塞琳','灰桥在驿站东边。巡卫站在桥口北侧，你一个人过去问。']],complete:[['诺恩','送到庄园的铁件，什么时候能过桥？'],['巡卫','正桥过不去，马车排到午后都未必查得完。小件从南沟走，运柴门那边有人点数。'],['诺恩','也要开包？'],['巡卫','当然得开包。最近接连出事，里面那位还嫌我们查得不够仔细。慢也得等，谁都一样。']],after:[['巡卫','我刚才怎么说的？正桥排队，小件走南沟。别再站在车辙里。']]},
   {optional:false,route:'灰石旅店后屋 → 驿站东口 → 灰桥关道，在桥口北侧询问巡卫；圣女在安全等候点停留。',gateRecommendation:{map:'bridge',to:'manor',requireFlag:'v12WatchHoursDone',bypassIfChapterAtLeast:8},flagsOnClaim:['v12WatchHoursDone'],notes:['第二章已启用这条短主线前置；已越过门禁的旧存档予以豁免。','不能透露内室虐待，也不能让巡卫认出诺恩或艾莉娅。','角色站位检查：询问时圣女保持隐藏，不能嘴上说一个人，画面却站在巡卫脸前。']}),
 q('v12QuietRoom',2,'后屋的脚步声','seline','inn','seline','inn',
   {region:2,minChapter:6,maxChapter:7,flagsNone:['alarm']},
   [{kind:'hide',map:'inn',target:'inn-rest',count:1,seconds:6,radius:70,interruptOnMove:true,interruptOnDamage:true}],
   {xp:30,gold:0,items:{hp:1}},
   {accept:[['塞琳','先在后屋待一会儿。前面有个巡卫，挨间问有没有住客，他一看见生面孔就没完。'],['诺恩','他要进来？'],['塞琳','我把卸货的账给他看，够他翻一阵。你们到长凳边去，门缝里看不见那里。别碰墙边的空桶。'],['艾莉娅','我有话要对他们说。'],['诺恩','你现在出去，他们首先就会盘问塞琳。'],['艾莉娅','……明明是你连累了她，倒拿她来劝我别出声。']],progress:[['塞琳','去西边长凳那儿等着。我还没送走他，先别往前廊探头。']],goal:[[['旁白','前廊有人翻动纸张，靴底在门外停了一下。塞琳报出一长串货价，那人终于走远。'],['塞琳','好了，他走了。出来吧，别都挤在门口。']]],complete:[['塞琳','他嫌账太乱，看了一半就走了。药放桌上，你带着。'],['诺恩','多谢。'],['塞琳','真想谢我，就别从这扇门把人再引回来。']],after:[['塞琳','前廊现在没人。走的时候轻点把门带上，门轴本来就松了。']]},
   {route:'旅店后屋西北的炉边长凳旁，安静等到前廊脚步远去；再和塞琳交谈。',notes:['这里只是一次可取消的短等待，不是假装完整潜行 AI。','需先检查 inn-rest 旁可站点，接取后使用现有长凳高亮；不新增几何遮挡。','隐藏开始后才播放门外脚步音；时间不在对话、暂停、物品栏内累计。','圣女仍想求救，诺恩的说法引发责备，不能演成圣女体贴配合。']}),
 q('v12CartBuckles',2,'被拖走的驮带','seline','inn','seline','inn',
   {region:2,minChapter:7,maxChapter:7,flagsNone:['alarm']},
   [drop('bridge',['wolf'],2,'v12HarnessBuckle',.7,2)],
   {xp:40,gold:18,items:{mp:1}},
   {accept:[['塞琳','南沟那辆坏车是来送货的。车夫好不容易换好轴，挂在车边的驮带又让狼叼走了。'],['诺恩','你还打算用？'],['塞琳','皮子不要了，铜扣得留。两只够把剩下的货捆住，不然今晚都得堆我门口。你路上碰见那群狼，替我看看有没有掉下来的扣子。']],progress:[['塞琳','灰桥南沟的狼把驮带拖得七零八落。找两只铜扣就好，咬坏的皮条不用带回来。']],complete:[['塞琳','正好一对，上面还留着牙印。这些狼咬得可够狠的。'],['诺恩','皮带没留。'],['塞琳','留了也没用。钱和药拿着，我去找车夫要两条旧带子。今晚门前总算能空出来。']],after:[['塞琳','车夫还在绑货。这回把驮带收到了车里，不肯再往外挂了。']]},
   {route:'驿站东口 → 灰桥关道南沟，击退车道附近的野狼，寻回 2 只铜扣；警报响起前回旅店。',expiresOn:['alarm'],notes:['只在任务已接且未满 2 时额外掉落；一次击杀最多 1，连续 2 次未出时第二次保证出。','受惊野狼衔来的铜扣掉在脚边，不制作剖动物取铜扣的表述。','2 个任务专用品，禁售禁拆，不占装备格，不改变普通装备/技能书掉落。']}),
 q('v12LoanedLamp',3,'给工坊带句话','doctor','hellCamp','mechanist','hellWorkshop',
   {region:3,flagsAll:['ch3HeroRecovered'],flagsNone:['ch3Complete']},
   [talk('hellWorkshop','mechanist')],
   {xp:50,gold:0,items:{mp:1}},
   {accept:[['莫里斯','帮我去工坊给芮妲带句话，就说人已经醒了，今晚不用再送热水来。'],['诺恩','她一直在送？'],['莫里斯','她怕我的炉子来不及烧，隔一阵就拎一桶来。你也该起来走走了，顺便替我谢她。走慢些，别把胸口的伤又扯开。']],progress:[['莫里斯','工坊在营地东南。告诉芮妲热水够了，让她顾好自己的炉子。']],complete:[['诺恩','莫里斯让我来告诉你，我醒了，热水不用再送了。'],['芮妲','看出来了，站得还挺稳。莫里斯还说什么了？'],['诺恩','让我谢你。'],['芮妲','他倒会让人传话。平时见了我，就只说把桶放远点，别碰他的纱布。药拿一瓶吧，下回进矿道缺灯也来找我，别摸黑进去。']],after:[['芮妲','我先把自己的炉子烧起来。你回去告诉莫里斯，空桶别又拿去泡布，我还得装水。']]},
   {route:'余烬营地东南出口 → 沉钟工坊，在北侧锻炉旁把医师的话带给芮妲。',notes:['只传口信，不读取或销毁 borrowedLamp；借灯已归还/仍持有两种情况都不会矛盾。','NPC 帮忙救人是其日常处事，不涉及圣女爱情或教会立场变化。','这个 A→B 任务接取后芮妲立即金色问号；有可交铜簧时两个交付同处顶部。']}),
 q('v12WarmHerbs',3,'留给下一位伤者','doctor','hellCamp','doctor','hellCamp',
   {region:3,flagsAll:['ch3HeroRecovered'],flagsNone:['ch3Complete']},
   [gather('hellGrotto','hellGrotto-gather-0','收一份盐苔洞口的余温草'),gather('hellFerry','hellFerry-gather-0','收一份渡岸背风处的余温草')],
   {xp:75,gold:10,items:{hp:2}},
   {accept:[['莫里斯','你自己的药还够，不用见着药草就全摘回来。这回要取两处的余温草，混着煮，气味没那么呛。'],['诺恩','哪两处？'],['莫里斯','北边盐骨苔窟和南边渡岸各取一份，留着给后面来的伤者用。看你能下床走动了，才让你帮这个忙。'],['诺恩','我会在路上采好带回来。']],progress:[['莫里斯','苔窟北路和渡岸背风处的草，各取一份，带回来还得分开晾。你包里那些混在一起的，这回用不上。']],goal:[[['旁白','诺恩只掐下几片长开的叶子，留下石缝里的嫩芽。']], [['旁白','渡岸的叶子上粘着细盐。诺恩抖净沙，另用一角干布包好。']]],complete:[['莫里斯','分开包了，正好。我得分别晾干、称好分量，再放进锅里煮。'],['诺恩','药放哪儿？'],['莫里斯','放台上，别压着纱布。新配的这两瓶给你，路上受了伤就用，别拖到伤口又裂开。']],after:[['莫里斯','草还得晾一会儿。你的绷带也该换了，伤口总捂着脏布可不行。']]},
   {route:'营地北口 → 盐骨苔窟；再从营地南口 → 黑潮渡岸。两处指定草丛各收一份，回医师处。',notes:['独立记两份分装药材，普通 emberHerb 仍按原逻辑给出；不能拿任意背包材料瞬交。','若对应草丛本次访问已 used，接受后允许额外一次任务取样；无需被迫重进随机碰运气。','只有苏醒后开放，绝不延长圣女急救阶段。']}),
 q('v12LampShields',3,'坡道上还有一盏灯','mechanist','hellApproach','mechanist','hellApproach',
   {region:3,ch3Stages:['arrival','road'],flagsNone:['ch3Unsealed','ch3Complete']},
   [gather('hellApproach','v11-approach-vein','取一片能给坡灯挡风的石皮'),kill(['hellApproach','hellQuarry'],['hellHound'],3)],
   {xp:70,gold:15,items:{hp:1,cinderIron:1}},
   {accept:[['芮妲','是活人？先让一让，别站在风口。这灯刚点起来，你的披风一碰又该灭了。'],['诺恩','前面能过去？'],['芮妲','绕过采场，再过一道旧闸，就是营地。路上那几头灰狗一直追着灯咬，我上去补个灯罩都费劲。'],['诺恩','要补什么？'],['芮妲','北边矿脉底下有薄石皮，掰一片就够挡风。你若往前走，顺手赶开三头靠路的灰狗，把石片拿回来。我得在这儿把最后一盏灯护住。']],progress:[['芮妲','薄石皮在坡道西北的冷烬矿脉下。灰狗就在坡道和采场低处，别追到石坪上去，那边有个大家伙。']],goal:[[['旁白','矿脉底下的石皮只有两指厚。诺恩沿着旧裂缝掰下一片，边缘还带着余温。']]],complete:[['芮妲','这片宽度正好。你把路边那几头也赶开了？'],['诺恩','三头。再往前还有。'],['芮妲','先把这盏灯修好吧。这瓶药拿着，前头真碰上那个大家伙，可别躲进木架底下，那架子挡不住它。'],['诺恩','营地有人治伤？'],['芮妲','有，叫莫里斯。你们手头要有药材，就带些给他，比光道谢管用。你们先走吧，我等风小一点再收工具。']],after:[['芮妲','灯这回不会灭了。我收好工具就去旧闸，你们路上当心，别往哭声最响的地方去。']]},
   {route:'焚骨坡道西北的冷烬矿脉下取石皮，清理坡道/断镐采场靠路的 3 只灰犬；回坡道入口灯边找芮妲。',receiverAfter:{flag:'ch3HeroRecovered',map:'hellWorkshop'},completeAfterRecovery:[['芮妲','那片石头你还带着呢？我已经把工具搬回工坊了。'],['诺恩','路边那三头灰狗也清掉了。'],['芮妲','知道了。先把药拿着，石片我下次去补灯时带上。你刚醒，别再为了这个往回跑一趟。']],notes:['芮妲在 hellApproach [350,820]，sprite 11，朝右上街道；路前两场 Boss 都未打时即可接取。','只在 ch3.stage 为 arrival/road 时留在坡道；进入 souls 后撤掉世界 NPC，之后救援镜头由 StoryFlow 独占她的演员。','ch3HeroRecovered 后，未交付任务的 receiver 改到 hellWorkshop；使用 completeAfterRecovery 避免一醒来就说要去营地。','工坊地图的芮妲仅在离开坡道后出现，不能两图同时驻留。','不发免费抽签券，不要求打额外 Boss；3 只犬和北路石片使第一次经过坡道形成一个短探索环。']}),
 q('v12CleanBottles',4,'缺了一只药瓶','deepMerchant','deepCamp','deepMerchant','deepCamp',
   {region:4,flagsAll:['ch4Started']},
   [talk('deepCamp','deepInnkeeper'),talk('deepCamp','deepMerchant')],
   {xp:65,gold:0,items:{hp:1}},
   {accept:[['薇塔','先别碰，那排瓶子刚灌满药。兰恩借走了一只宽口瓶，说是装盐，都三天了还没还我。'],['诺恩','他在哪儿？'],['薇塔','就是南边守炉的那个。帮我问问，瓶子没碎就拿回来；真碎了，让他自己来说，别又拿酒瓶抵数。顺便问问炉子夜里熄不熄，你们也得找个地方歇脚。']],progress:[['薇塔','兰恩就在营地南侧的歇脚棚边。宽口、短颈，瓶塞有一道刀痕，别抱错了。']],goal:[[['诺恩','薇塔让我来拿她的宽口瓶。'],['兰恩','我洗好了，正晾着呢。你拿去，告诉她没装酒。'],['诺恩','夜里能在这里歇？'],['兰恩','能，想铺草席就来找我，炉子有人守着，半夜也不会熄。可别睡在东边那条路上，那里虽然照得见火，路上的怪物也能看见你。']], [['诺恩','瓶子好好的。兰恩说，他没拿它装酒。'],['薇塔','他每回都先说这句。我闻闻……这回倒真没有。']]],complete:[['薇塔','给你留一瓶药。往东去之前先试试塞子紧不紧，洒在石头上可不给补。'],['诺恩','这里的人都睡棚里？'],['薇塔','总得有个能歇脚的地方。赫伦就在东边炉台旁，路他比我熟，你可以去问问。缺药了再来找我。']],after:[['薇塔','那只瓶子已经装药了。兰恩再借，你就当没听见。']]},
   {optional:false,route:'铁火营地南边找守炉人兰恩 → 回北边药商货台旁找薇塔。',gateRecommendation:{map:'deepCamp',to:'deepCourt',requireFlag:'v12CleanBottlesDone',bypassIfFlagsAny:['ch4Odric','ch4Martha','ch4Severin']},flagsOnClaim:['v12CleanBottlesDone'],notes:['第四章已启用这条短主线前置，用于认识商人和落脚处，不要求战斗刷材料。','接取后兰恩金色问号；第一段交谈后转移至薇塔金色问号。完成前薇塔为银色。','收尾 goal talk 与 complete 应在同一个对话事务合并，不重复见面/重复末句。']}),
 q('v12HearthStones',4,'别让炉边漏风','deepInnkeeper','deepCamp','deepInnkeeper','deepCamp',
   {region:4,flagsAll:['ch4Started']},
   [gather('deepGate','v11-deep-gate-ore','挑一片耐热的平黑石'),gather('deepCourt','v11-court-ash','挑一片带灰纹的硬石')],
   {xp:85,gold:25,items:{mp:2}},
   {accept:[['兰恩','脚别伸进去，炉脚那道缝漏火，会把鞋边烤卷的。原来垫着的石片裂了，我正找两块新的。'],['诺恩','营地里没有？'],['兰恩','有是有，可惜都太软，一烧就碎。西边黑曜阶道和东边灰冕前庭的石头耐火，你顺路各挑一片，要平的，才能把炉脚垫稳。']],progress:[['兰恩','黑曜阶道西侧那簇黑晶，灰冕前庭西边那片灰纹石，各挑一块平的就够。慢慢来，炉子还能撑。']],goal:[[['旁白','黑晶底下压着一片平整的石皮。诺恩沿边缘将它撬起，剔掉硌手的碎角。']], [['旁白','诺恩轻敲灰纹石，声音清脆，石面也没有崩裂。他挑下一片宽而薄的石片。']]],complete:[['兰恩','这两块平整。先放在这里，等炉膛冷一点，我再换上。'],['兰恩','总算不用再找石头了。药是薇塔配的，钱是我的，都给你。'],['诺恩','脚收回来些，炉沿还烫着。']],after:[['兰恩','靠炉的那张草席，我已经往外挪了些。还是你提醒得对，离太近了容易烫伤。']]},
   {route:'营地西口 → 黑曜阶道西侧黑晶；营地东口 → 灰冕前庭西侧灰纹结晶；挑齐两片，返回营地找守炉人。',notes:['普通资源开采奖励保持；任务取样独立计数，不消耗 ashGlass，也不复制一次性奖励。','当前交付只收下石片并约定冷炉后更换；没有搬炉脚或环境灯光变化演出，不声称已经当场完成。','首次已挖过资源时仍可额外取任务石片，不能要求赌重进刷新。']}),
 q('v12ForgeRivets',4,'还能咬住铁的齿','deepEnchanter','deepCamp','deepEnchanter','deepCamp',
   {region:4,flagsAll:['ch4EnchantUnlocked']},
   [drop(['deepCourt','deepBastion','deepCloister'],['deepGuard'],3,'v12ForgeJaw',.65,2)],
   {xp:110,gold:35,items:{ashGlass:2,soulAsh:1}},
   {accept:[['赫伦','把武器放这边，用没断的那头夹口。另一边的齿都磨平了，稍微一用力就滑。'],['诺恩','不能补？'],['赫伦','用普通铁能补，可一进炉子就受不住。外头那些旧守卫身上的甲扣倒还结实，你路上捡三枚带齿的回来，我拆开换上。不用专门去找，顺路留意就行。']],progress:[['赫伦','去灰冕前庭、残旗行馆或无钟回廊，找那些旧甲兵。我要带齿、没熔坏的甲扣，三枚就够了。']],complete:[['赫伦','这枚虽然烧黑了，齿倒没坏。几枚都能用，留下吧。'],['诺恩','夹口能用多久？'],['赫伦','换好以后，够我用上很久。你哪件东西刻坏了，先拿来让我看看，别一生气就扔进火里。'],['诺恩','谁扔过？'],['赫伦','有个年轻人，扔完了又后悔，伸手就想捞。第二天来找我，求着做两只新指套。']],after:[['赫伦','夹口已经换好了。你刻的时候看准落刀的地方，手稳住，别把名字刻歪了。']]},
   {route:'沿铁火营地东侧主路依次探索灰冕前庭、残旗行馆、无钟回廊；旧甲兵概率留下带齿甲扣，集齐 3 枚返回赫伦。',notes:['实际注册后的第四章敌人类型是 deepGuard；不能只监听原 world 源码里的 hellGuard。','最多 6 个有效击杀保底 3 枚；Boss 重战随从不计，不鼓励反复开祭痕。','2 烬晶砂 + 1 魂灰不足一次完整常规附魔费用，仅抵一部分成本。']})
];

// 上一版剧情不做真相前置；只为已走过的路补环境过渡。
export const V12_AMBIENT_PATCHES={
  afterFirstRoadCache:[['旁白','行囊里没有能辨认姓名的东西，只有几块硬得掰不开的干粮。诺恩把还能用的药瓶挑出来。'],['艾莉娅','也许失主还会回来。'],['诺恩','袋口早烧穿了。'],['艾莉娅','那至少把空袋放好。别丢在路中间。']],
  beforeDeepCampFirstExit:[['艾莉娅','这里还有人等着用药。你要买多少，先问清楚。'],['诺恩','我们也需要。'],['艾莉娅','我没说不让你买。伤口再裂开，你自己走不回来。']]
};

export const V12_QUEST_ITEMS={
 v12HarnessBuckle:{name:'咬出牙痕的铜扣',kind:'quest',desc:'驮带上脱下的铜扣。塞琳要两只捆好坏车上的货。',sell:0},
 v12ForgeJaw:{name:'带齿的旧甲扣',kind:'quest',desc:'耐炉火的旧甲扣。赫伦能拆下齿条修补夹口。',sell:0}
};

export const V12_PACING_RULES={
 state:'g.v12.quests[id] = {status:"active"|"ready"|"done",counts:[...],misses:[...],claimed:boolean}',
 goalOrder:'数组代表呈现次序。kill/drop/gather 可同时累计；talk/hide 严格按当前段推进，以免提前领奖。',
 acceptedButUnfinished:'最终 receiver 银色 ?；当前 talk 段 target 金色 ?；合并时金色优先 !，! 优先银色。',
 available:'只有可实际接取的任务才显示 !；不可回区域不显示新任务。',
 claim:'每段推进 / 最终交付采用对话完成事务；先验证条件，再保存 consumed/claimed，再给一次奖励。',
 random:'rate 只抽任务 RNG；pity=2 意味连续第 2 次有效击杀保证得到一枚。不要解释成 2 次未出之后第 3 次。',
 maxKills:'count=2 -> 最多4只；count=3 -> 最多6只。',
 death:'击杀、掉落、采集进度与 claimed 跨重进/死亡/保存保留。不会倒退，也不能重复结算。',
 items:'任务专用物品单独分类、不占装备格、不出售、不拆解。满装备背包不阻塞这些任务。',
 beforeAcceptance:'kill/drop 不追溯；指定 gather 节点若原本已使用，允许一次任务额外取样；不得重新发原节点的一次奖励。',
 optionalExit:'第1章不可返回/第2章警报前，列出未完可选任务。离开需要一次明确确认，不用挨个弹窗。过期任务显示暂不可返回，不回滚主线。',
 migration:'旧存档已越过门禁时自动豁免该门禁，只补迁移标记，不伪造做过任务、不自动发奖励。',
 stages:'对话字面与姿势一致。任务系统仅请求场景，不得抢占关键演出；排队后由 StoryFlow 统一启动。',
 hide:'停留计时只在玩家主动开始躲藏、正常玩法、处于范围、未受伤且没有对话时累计。移动可取消并重新开始。',
 newProps:0,
 difficulty:'不提高任务怪属性、不刷额外大群；所有进度利用原有场景自然战斗，避免任务升级变额外难度。'
};

export default {version:12,tasks:V12_PACING,items:V12_QUEST_ITEMS,rules:V12_PACING_RULES,ambient:V12_AMBIENT_PATCHES};
