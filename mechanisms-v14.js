// A small, finite exploration loop. Content rewards never join random monster loot.
export const ECHO_QUEST={name:'别让它停在午钟前',type:'支线',giver:'lotti',map:'workshop',desc:'洛缇想修好旧磨坊底下的回声机。沿旧王道东南的小径走，到磨坊东南石拱下进入回水机房；清除盘踞的兽群，带机芯回来。',xp:45,gold:20};
export const FAREWELL_QUEST={name:'临行的几句话',type:'支线',giver:'sister',map:'hall',desc:'闸门外就是离城的路，暂时不能回来。可以先向薇蕾娜、奥伦、朵莉和洛缇道别；想直接出发也可以。',xp:0,gold:0};
export const FAREWELL_IDS=['sister','steward','dolly','lotti'];
export const ECHO_RING={id:'quest-offbeat-ring',name:'偏拍指环',slot:'relic',rarity:'rare',atk:0,hp:6,uniqueEffect:'offbeat',affix:null};
export const ECHO_BOOK_POOL=['tetherBook','frostBook','sprintBook','cleaveBook','fireboltBook'];
export function echoBook(game){const order=game.flags.echoBookOrder||ECHO_BOOK_POOL;return order.find(id=>!game.knowsOrHolds(id))||null;}
export function configureMechanisms(maps,scenery,waters,bridges){
 maps.echo={name:'回水机房',sub:'水还在流，机轮却一动不动',atlas:'interior',cell:3,ground:'stone',doors:[{x:300,y:890,to:'millpath',tx:1180,ty:800,label:'旧磨坊小径'}],npcs:[],spawns:[['bat',460,490],['wolf',980,770],['wolf',1110,465,'echo-warden']],blocks:[[0,0,1600,190],[0,190,150,890],[1450,190,150,890],[150,945,1300,135]],props:[{id:'echo-machine',action:'echoMachine',type:'machine',x:1210,y:350,interactX:1210,interactY:450,label:'旧回声机'},{id:'echo-notes',action:'echoNotes',type:'book',x:450,y:260,depthY:331,interactX:450,interactY:370,label:'留在石台上的检修簿'},{id:'echo-crystal-west',action:'echoCrystal',type:'crystal',x:385,y:635,label:'墙缝里的回声晶簇'},{id:'echo-crystal-east',action:'echoCrystal',type:'crystal',x:1200,y:810,label:'水轮旁的回声晶簇'},{id:'echo-valve',action:'echoValve',type:'wheel',x:850,y:315,interactX:850,interactY:385,label:'配重泄压阀'},{id:'echo-pot',type:'pot',x:545,y:840}]};
 maps.millpath.doors.push({x:1180,y:870,to:'echo',tx:300,ty:810,label:'回水机房 · 建议Lv.3'});
 maps.workshop.npcs.push({id:'lotti',name:'洛缇',x:880,y:650,angle:Math.PI*.7});
 maps.workshop.props.push({id:'reset-bench',action:'resetBench',type:'machine',x:390,y:585,interactX:390,interactY:665,label:'炼洗台'});
 maps.workshop.sub='新添的茶杯还冒着热气';
 scenery.millpath.push({id:'echo-entrance',sheet:'mechanisms',asset:2,x:1180,y:904,w:160,h:170});
 scenery.workshop.push({id:'reset-base',sheet:'mechanisms',asset:1,x:390,y:585,w:160,h:143,box:[325,540,130,45]});
 scenery.echo=[{id:'echo-arch',sheet:'mechanisms',asset:2,x:300,y:937,w:145,h:138},{id:'echo-machine-base',sheet:'mechanisms',asset:0,x:1210,y:350,w:195,h:195,box:[1135,290,150,60]},{id:'echo-left-table',sheet:'world',asset:9,x:450,y:330,w:185,h:98,box:[368,290,164,40]},{id:'echo-lamp1',sheet:'world',asset:14,x:530,y:270,w:44,h:127,box:[519,252,22,18]},{id:'echo-lamp2',sheet:'world',asset:14,x:900,y:850,w:44,h:127,box:[889,832,22,18]},{id:'echo-ruin1',sheet:'world',asset:5,x:680,y:470,w:132,h:83},{id:'echo-ruin2',sheet:'world',asset:5,x:680,y:700,w:132,h:83}];
 waters.echo=[[655,190,100,300],[655,670,100,275]];
 bridges.echo={x:635,y:490,w:140,h:180};
}
