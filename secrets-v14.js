// Dependency-injected exploration hooks. Importing this file never loads core,
// map state, renderer, browser globals or old echo quest code.
export const SECRET_DIALOGUES = {
  v9PostWheel:[['旁白','货车顺着斜坡退了半尺，车轮外的木楔滑在泥里。诺恩把木楔塞回轮下，用靴跟压紧。'],['艾莉娅','卸货的几位，请先站到车侧去。木楔刚塞回去，等车夫把轮子卡牢再搬，免得伤到脚。'],['诺恩','现在卡住了。要卸完这车，他们还得磨蹭一阵。']],
  v9CartRope:[['旁白','坏车的货箱已经空了。一截麻绳挂在断轴上，绳尾带着铁锈，长度足够垂进南边的石槽。'],['诺恩','这截还没烂。墙下那个铁环，用它正合适。']],
  v9CellarOpen:[['旁白','诺恩把绳索套进铁环，踩住墙根往后拉。石板露出一道缝，下面是一排窄小的踏孔。'],['艾莉娅','下面有风，应该没有积满水。你若要下去，先看看踏孔还牢不牢。'],['诺恩','第三级缺了半边。踩右侧，别把体重全放上去。']],
  v9CellarFirst:[['旁白','石台上还留着一架旧秤。墙角的水痕已经发黑，台面却是干的。'],['艾莉娅','门板刻着免收过桥钱的日子。那时候赶集的人，大概会特意挑这几天来。'],['诺恩','下面还刻着赊账的名字。这间屋子关了，账也没人来讨了。']],
  v9TollFound:[['旁白','木匣用细绳封着，匣盖上的字很淡：旧绳编的，给夜里守桥的人。里面是一枚磨得发亮的护符。'],['诺恩','还挺结实。收在这里，倒躲过了几场大水。']],
  v9TollScale:[['旁白','秤盘里没有钱，只有几块压纸的小石头。账本上写着：米车已过，车夫脚伤，钱等下回来再补。最后一笔停在二十年前。']],
  v9BridgeWater:[['旁白','货物边的陶壶见了底。艾莉娅把自己水囊里的水倒进去，递给靠墙等车的老人。'],['艾莉娅','先润润喉咙。等这辆车查完了，请车夫带您去驿站，那里有炉火。'],['诺恩','你把水分完，后面那段路喝什么？'],['艾莉娅','驿站打的水还有半囊。老人一直在这里等，分这一点给他，不会耽误你赶路。']],
  v9WellRim:[['旁白','井沿有三道浅槽，磨损都朝着西边。旧木牌写着：桶落底后再松三圈，守井人从壁孔进。'],['诺恩','井底还有一层。绳子不是只用来打水的。']],
  v9WellOpen:[['旁白','诺恩把绞盘松了三圈。链子在井壁后滑动，井台西边的一块薄石板降下去，露出踏孔。'],['艾莉娅','下面有喘气声。那不是空屋，先把火照过去。'],['诺恩','看见断链了。趁还没下去，我们可以先退回院子，等看清里面再作打算。']],
  v9WardenFirst:[['旁白','铁环嵌在墙上，链子已经断了。守井兽听见石屑落地，抬头望向踏孔。'],['艾莉娅','它把这里当窝了。两边的石柱还能挡一下，别挤进角落。']],
  v9WardenChain:[['旁白','诺恩拉动石环旁的旧链，另一头的碎石哗啦落地。守井兽转头扑向响声，脚下打了个滑。']],
  v9WardenReward:[['旁白','木盒里是一枚包着旧布的额扣。布上绣着一个井字，夹层还塞着磨薄的护头皮衬。'],['诺恩','这东西是给下井的人用的。碰到矮梁，至少能保住额头。'],['艾莉娅','盒子比那张床干净。住在这里的人，出门前应该总会把它收好。']],
  v9Waterline:[['旁白','墙上刻了两道短线，低处添着一行字：水退到这儿，再取盐。刻线一路延到东边石槽，槽口塞着浸透的布。'],['诺恩','不是刻着好看的。先放水，东西才拿得出来。']],
  v9DryNiche:[['旁白','存水流尽后，石槽里的暗格露出来。外面的布湿透了，里头蜡封的小盐罐却完好。罐底写着“澄心”，日期已经褪色。'],['艾莉娅','蜡封还没裂开。先把外面的泥擦掉，别和吃的放在一起。']],
};

export const SECRET_REWARDS = {
  toll:{id:'quest-v9-dry-knot',name:'干绳护符',slot:'relic',rarity:'rare',atk:0,hp:8,affix:'mercy',iconId:3,desc:'守桥人用旧绳编成的护符。击败敌人回复5生命；没有攻击加成。'},
  warden:{id:'quest-v9-well-brow',name:'守井人的额扣',slot:'head',rarity:'rare',atk:0,hp:14,affix:'ward',desc:'旧井工的护头额扣。受击后生命低于50%时获得18护盾，持续3秒；12秒冷却。'},
};

export function configureSecretData(dialogues, items) {
  Object.assign(dialogues, SECRET_DIALOGUES);
  items.v9Rope={name:'尚能用的旧麻绳',desc:'从灰桥南沟的坏车上取下。可以套住石墙下露出的铁环。',category:'quest'};
  // Existing reset-consumable identity; do not create a second incompatible salt.
  items.attributeReset ||= {name:'澄心盐',desc:'重新分配已投入的自由属性点；不会清除职业成长。',category:'consumable'};
}

const inRange = (g, id, radius=150) => {
  const p=g.props.find(p=>p.id===id);
  return p && Math.hypot(g.p.x-(p.interactX??p.x),g.p.y-(p.interactY??p.y))<=radius ? p : null;
};
const save = g => g.saveEvent?.();
const line = (g,text) => {g.say(text);return true;};
function scene(g,id,action=null) {g.beginScene(id,action);return true;}
function gearHeld(g,id) {return [...(g.p.bag||[]),...Object.values(g.p.gear||{})].some(i=>i?.id===id);}
function markUsed(g,id) {const p=g.props.find(p=>p.id===id);if(p)p.used=true;}

// Flags are the unique claim authority. A full bag leaves the container and
// claim flag untouched; content rewards never go through ordinary autosell.
function takeGear(g, key, reward, propId, sceneId) {
  if(g.flags[key])return line(g,'盒子已经空了，旧布还垫在底下。');
  if(gearHeld(g,reward.id)){g.flags[key]=true;markUsed(g,propId);save(g);return true;}
  if(g.p.bag.length>=60)return line(g,'先腾出一格。东西留在原处，不会换成金币。');
  g.flags[key]=true;
  const iconId=reward.iconId??({shadow:4,oath:5,ember:6}[g.p.cls]);
  g.p.bag.push({...reward,iconId,appearanceId:reward.slot+'-'+g.p.cls+'-'+reward.rarity});
  markUsed(g,propId);save(g);
  g.say('获得 '+reward.name+' · 尚未装备');
  return scene(g,sceneId);
}

export function secretProp(g,id) {
  const p=g.props.find(p=>p.id===id);
  if(!p?.action?.startsWith('v9-'))return false;
  if(p.used||p.broken)return true;
  if(!inRange(g,id))return line(g,'走近一些，再看看这个地方。');
  switch(p.action) {
    case 'v9-post-wedge': return g.flags.v9CartBraced ? line(g,'木楔紧紧卡在车轮下。') : scene(g,'v9PostWheel','v9:brace-cart');
    case 'v9-cart-rope': return g.flags.v9RopeTaken ? line(g,'断轴上的绳索已经取下。') : scene(g,'v9CartRope','v9:take-rope');
    case 'v9-cellar-wall':
      if(g.flags.v9CellarOpen)return line(g,'绳子已经系牢，下面的踏孔可以落脚。');
      if(!g.flags.v9RopeTaken)return line(g,'石槽下面有踏孔，但石板太滑，徒手拉不起来。坏车上垂着一截还算完整的绳子。');
      return scene(g,'v9CellarOpen','v9:open-cellar');
    case 'v9-toll-box': return takeGear(g,'v9TollClaimed',SECRET_REWARDS.toll,id,'v9TollFound');
    case 'v9-toll-scale': return scene(g,'v9TollScale');
    case 'v9-bridge-water': return g.flags.v9WaterShared ? line(g,'壶里还剩一点水，壶口盖着一块干净布。') : scene(g,'v9BridgeWater','v9:share-water');
    case 'v9-well-rim': return g.flags.v9WellRead ? line(g,'木牌写着：桶落底后再松三圈。磨出的浅槽都朝着西边的绞盘。') : scene(g,'v9WellRim','v9:read-well');
    case 'v9-well-pulley':
      if(g.flags.v9WellOpen)return line(g,'石板已经降下，绞盘卡在第三道槽里。');
      if(!g.flags.v9WellRead)return line(g,'盘上的三道缺口磨得很光。井沿也有相同的凹槽，先看看那里。');
      if(g.chapter>=8)return line(g,'上面的铁链已经被警报闸卡死，转不动了。');
      return scene(g,'v9WellOpen','v9:open-well');
    case 'v9-warden-box':
      if(!g.flags.v9WardenDefeated)return line(g,'守井兽守在铁链边。现在伸手，只会把胳膊送过去。');
      return takeGear(g,'v9WardenClaimed',SECRET_REWARDS.warden,id,'v9WardenReward');
    case 'v9-warden-chain':
      if(g.flags.v9ChainDropped)return line(g,'旧链已经脱出了石环，碎石堆在底下。');
      if(!g.enemies.some(e=>e.id==='secret-warden'&&!e.dead))return line(g,'链子的另一头压着碎石，现在用不着再拉它了。');
      return scene(g,'v9WardenChain','v9:drop-chain');
    case 'v9-waterline': return g.flags.v9WaterlineRead ? line(g,'低处那条刻线指向东边石槽：水退到这里，再取盐。') : scene(g,'v9Waterline','v9:read-waterline');
    case 'v9-dry-niche':
      if(g.flags.v9NicheClaimed)return line(g,'暗格里只剩泡湿的外层布。');
      if(!g.flags.v9WaterlineRead)return line(g,'石槽里有一团湿布，水压得很紧。西边墙上留着和这里一样的刻线。');
      if(!g.flags.sluiceReleased)return line(g,'暗格还在水下。东南的闸杆能把这段沟里的存水放掉。');
      return scene(g,'v9DryNiche','v9:take-salt');
  }
  return true;
}

export function secretApply(g,a) {
  if(typeof a!=='string'||!a.startsWith('v9:'))return false;
  const allowed={
    'v9:brace-cart':['post','v9-post-wedge'], 'v9:take-rope':['bridge','v9-cart-rope'],
    'v9:open-cellar':['bridge','v9-cellar-wall'], 'v9:share-water':['bridge','v9-bridge-water'],
    'v9:read-well':['manor','v9-well-rim'], 'v9:open-well':['manor','v9-well-pulley'],
    'v9:drop-chain':['wellcrypt','v9-warden-chain'], 'v9:read-waterline':['spillway','v9-waterline'],
    'v9:take-salt':['spillway','v9-dry-niche'],
  }[a];
  if(!allowed||g.map!==allowed[0]||!inRange(g,allowed[1]))return true;
  switch(a) {
    case 'v9:brace-cart': if(!g.flags.v9CartBraced){g.flags.v9CartBraced=true;markUsed(g,'v9-post-wedge');}break;
    case 'v9:take-rope': if(!g.flags.v9RopeTaken){g.flags.v9RopeTaken=true;g.addItem('v9Rope');markUsed(g,'v9-cart-rope');}break;
    case 'v9:open-cellar': if(!g.flags.v9CellarOpen&&g.flags.v9RopeTaken){g.flags.v9CellarOpen=true;g.p.items.v9Rope=0;g.portCD=1.5;g.say('石墙下露出一道窄口。');}break;
    case 'v9:share-water': g.flags.v9WaterShared=true;break;
    case 'v9:read-well':g.flags.v9WellRead=true;break;
    case 'v9:open-well':if(g.flags.v9WellRead&&g.chapter<8){g.flags.v9WellOpen=true;g.portCD=1.5;g.say('井台西侧的踏孔已经露出来。');}break;
    case 'v9:drop-chain':if(!g.flags.v9ChainDropped){const e=g.enemies.find(e=>e.id==='secret-warden'&&!e.dead);if(e){g.flags.v9ChainDropped=true;e.stun=Math.max(e.stun||0,1.2);e.slow=Math.max(e.slow||0,3);e.alertUntil=Math.max(e.alertUntil||0,g.time+5);g.effect?.('sparks',e.x,e.y-20,28,'#b8ad90',.35);}}break;
    case 'v9:read-waterline':g.flags.v9WaterlineRead=true;break;
    case 'v9:take-salt':if(g.flags.v9WaterlineRead&&g.flags.sluiceReleased&&!g.flags.v9NicheClaimed){g.flags.v9NicheClaimed=true;g.addItem('attributeReset');markUsed(g,'v9-dry-niche');}break;
  }
  save(g);return true;
}

export function secretDoor(g,d) {
  if(d.to==='wellcrypt'&&g.chapter>=8)return '警报落闸压住了井壁入口，现在进不去了。';
  if(d.gate==='v9-warden-exit'&&g.enemies.some(e=>e.id==='secret-warden'&&!e.dead))return '守井兽挡在踏孔下面，先把它逼退。';
  return null;
}

export function secretEnter(g,id) {
  if(id==='bridgecellar'&&!g.flags.v9CellarVisited){g.flags.v9CellarVisited=true;return scene(g,'v9CellarFirst');}
  if(id==='wellcrypt'&&!g.flags.v9WellVisited){g.flags.v9WellVisited=true;return scene(g,'v9WardenFirst');}
  return false;
}

// MUST run before the legacy elite -> echoCore branch. Even repeated calls
// return true: this ID never belongs to the main captain or the old echo quest.
export function secretEnemyKilled(g,e) {
  if(e.id!=='secret-warden')return false;
  if(!g.flags.v9WardenDefeated){g.flags.v9WardenDefeated=true;g.say('断链落回地上。踏孔和铁链后的小木盒都能靠近了。');}
  save(g);return true;
}

export function secretRestore(g) {
  g.flags ||= {};
  for(const [key,item] of [['v9TollClaimed',SECRET_REWARDS.toll],['v9WardenClaimed',SECRET_REWARDS.warden]]) if(gearHeld(g,item.id))g.flags[key]=true;
  const warden=g.states?.wellcrypt?.enemies?.find(e=>e.id==='secret-warden');
  if(warden?.dead)g.flags.v9WardenDefeated=true;
  if(g.flags.v9WardenDefeated&&warden){warden.dead=true;warden.hp=0;warden.respawn=0;}
  for(const [map,id,key] of [
    ['post','v9-post-wedge','v9CartBraced'],['bridge','v9-cart-rope','v9RopeTaken'],
    ['bridgecellar','v9-toll-box','v9TollClaimed'],['wellcrypt','v9-warden-box','v9WardenClaimed'],
    ['spillway','v9-dry-niche','v9NicheClaimed'],
  ]) {const p=g.states?.[map]?.props?.find(p=>p.id===id);if(p&&g.flags[key])p.used=true;}
}

// Exposed predicate lets the generic revisit system preserve unique encounters.
export function isUniqueSecretEnemy(e) {return e?.id==='secret-warden';}
