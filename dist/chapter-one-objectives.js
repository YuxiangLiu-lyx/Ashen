import {C1_STORY_ACCEPT,C1_PEOPLE} from './chapter-one-story-world.js';
// Authored quest objectives; presentation, credit and completion read this table.
export const C1_OBJECTIVES={
 rats:{kind:'kill',map:'warehouse',count:8,types:['rat'],name:'库房灰鼠',inspect:'crack'},
 c1Readiness:{kind:'kill',map:'c1TrainingYard',count:8,prefix:'c1-moss-',name:'苔壳爬兽'},
 c1ExitDrill:{kind:'kill',map:'c1DrillGallery',count:8,prefix:'c1-sentry-',cause:'c1-trial-warden',name:'旧廊哨兵'},
 v12CourierRoad:{kind:'kill',map:'road',count:8,types:['wolf','rat'],name:'袭路野兽'},
 c1CanalPrep:{kind:'kill',map:'c1NorthWalk',count:8,types:['rat'],name:'啃木渠鼠'},
 oil:{kind:'drop',map:'warehouse',count:5,types:['rat'],chance:.7,name:'灯油囊',monster:'库房灰鼠',item:'oil'},
 v12Water:{kind:'drop',map:'c1TrainingYard',count:5,prefix:'c1-moss-',chance:.7,name:'清心苔',monster:'苔壳爬兽'},
 letter:{kind:'drop',map:'road',count:1,types:['wolf'],chance:.7,name:'被咬破的信囊',monster:'王道灰狼',item:'letter'},
 herbs:{kind:'gather',map:'grove',maps:['grove','road'],count:3,name:'银叶草',item:'herb'},
 lantern:{kind:'kill',map:'c1NorthWalk',count:8,types:['bat'],name:'占灯夜蝠'},
 copper:{kind:'drop',map:'millpath',count:5,types:['wolf'],chance:.7,name:'传力铜圈',monster:'磨坊灰狼'},
 c1RuneWear:{kind:'drop',map:'c1NorthWalk',count:3,types:['rat'],chance:.7,name:'受潮符片',monster:'啃木渠鼠'},
 c1RuneKiln:{kind:'drop',map:'c1ReedKiln',count:3,types:['bat'],chance:.7,name:'堵烟翼尘',monster:'窑蝠',cause:'c1-elite-bat'},
 c1ClockMemory:{kind:'investigate',map:'grove',count:1,name:'石下银环',cause:'c1-elite-rat',inspect:'stone'},
 echo:{kind:'investigate',map:'echo',count:1,name:'旧机芯',cause:'echo-warden',inspect:'v29-echo-core'},
 c1RunePatrol:{kind:'kill',map:'road',count:8,name:'沿线野兽',patrol:true},
};
export const C1_GIVERS={c1Readiness:'clerk',c1ExitDrill:'c1iden',c1LoomBrief:'c1rosa',v12NorthDelivery:'watch',c1GateCheck:'watch',c1CanalPrep:'watch',c1CanalBreak:'saint',c1CryptRepair:'c1hesha',c1VaultWatch:'c1venn',c1CampHunt:'c1blake',c1CampHerbs:'c1eve',c1KilnRoost:'c1mada',c1TrialSalvage:'c1iden',rats:'steward',oil:'steward',v12Water:'steward',letter:'courier',v12CourierRoad:'courier',herbs:'herbalist',lantern:'dolly',copper:'lotti',echo:'lotti',c1ClockMemory:'oldwoman',c1RuneWear:'c1rosa',c1RuneKiln:'c1rosa',c1AlchemistSamples:'c1saido',c1RunePatrol:'c1rosa'};
export const C1_NPC_NAMES={steward:'奥伦',sister:'薇蕾娜',clerk:'鲁恩',courier:'阿林',herbalist:'米拉',woman:'蕾娜',watch:'托马',dolly:'朵莉',lotti:'洛缇',oldwoman:'修钟人的妹妹',c1rosa:'罗萨',c1saido:'赛铎'};
export const C1_ACCEPT_TEXT={
 oil:'库房灰鼠把包油的皮囊拖进了货堆。处理鼠群时找回一袋灯油，带给我。',
 v12Water:'庭院苔壳兽背上的清心苔能缓旧伤。带一份回来，我替你换药；别再硬撑肩膀。',
 v12CourierRoad:'四只野兽反复袭击东段车道。清掉它们，我才能叫人把断车拉回来。',
 letter:'狼把信囊叼走了。在旧王道东段找狼，拿到信后回来交给我。',
 herbs:'银叶草在旧王道和溪边林地随机成丛，取三株。药可以交给我，也可先帮蕾娜。',
 lantern:'北渠的夜蝠占了路灯，傍晚谁也不敢过。赶走三只，回来告诉我灯路安全了。',
 copper:'磨坊的狼叼走了装铜圈的皮包。找回两个传力铜圈，我替你装成练武环。',
 echo:'机房后槽的旧机芯还用得上。守兽咬住了传动带，先处理它，再从后槽卸下机芯。',
 c1ClockMemory:'哥哥把银环藏在溪边刻名石下。如今裂齿渠鼠盘踞在那里，先除掉它再去找。',
 c1RuneWear:'渠鼠咬断检修符线，还把符片拖进窝里。带回三片，我看看还能不能修。',
 c1RuneKiln:'废窑烟道被蝠群的翼尘堵了。带回三份翼尘，再击败巢里的苇窑夜翼，确认源头。',
 c1AlchemistSamples:'裂齿渠鼠的下颌、灰脊守兽的腱束、苇窑夜翼的翼膜，各留一份。先拿到的也算，我只查这里的异变。',
};

Object.assign(C1_OBJECTIVES,{
 c1CryptRepair:{kind:'kill',map:'c1TrialCrypt',count:8,prefix:'c1-crypt-',name:'蓄能构装体'},
 c1VaultWatch:{kind:'kill',map:'c1TrialVault',count:8,prefix:'c1-vault-sentry-',cause:'c1-vault-warden',name:'封存库守卫'},
 c1CampHunt:{kind:'kill',map:'grove',count:8,types:['rat','wolf','bat'],name:'堵路野兽'},
 c1CampHerbs:{kind:'gather',map:'grove',maps:['grove','road'],count:4,name:'银叶草'},
 c1KilnRoost:{kind:'kill',map:'c1ReedKiln',count:8,types:['bat'],name:'窑蝠'},
 c1TrialSalvage:{kind:'drop',map:'c1DrillGallery',count:5,prefix:'c1-sentry-',chance:.7,name:'完整铆钉',monster:'旧廊哨兵'},
});
Object.assign(C1_NPC_NAMES,{saint:'艾莉娅',...Object.fromEntries(Object.entries(C1_PEOPLE).map(([id,p])=>[id,p.name]))});
Object.assign(C1_ACCEPT_TEXT,C1_STORY_ACCEPT,{oil:'灰鼠拖走了五袋灯油。处理粮仓鼠群时留意油囊，带齐五袋回来修门廊的灯。',v12Water:'苔壳兽身上的清心苔能缓解肩伤。带五份回来，我替你配药换好绷带。',v12CourierRoad:'八只野兽占了东段车道。清掉它们，再回来找我，车夫们等着回去收断车。',lantern:'北渠八只夜蝠占了灯路，晚归的人不敢过桥。帮忙驱走它们，再回来告诉我，我去添灯油。',copper:'磨坊狼群咬走了五个传力铜圈。找回铜圈交给我，我替你做个练武环，也能把铺子的工具修好。'});
