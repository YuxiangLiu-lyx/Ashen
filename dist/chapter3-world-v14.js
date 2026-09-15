/**
 * 《烬誓》第三章 — 纯地图与美术布局数据；不依赖 core。
 * World size 1600 × 1080; legal actor feet x135..1465, y155..965.
 * Scenery x/y are FEET, never sprite top-left. Sort by depthY ?? y.
 * Integration: append scenery.box AND action-prop.box to each map's blocks.
 * Doors are geometric only: the runtime owns every ch3-* gate and story event.
 * hellWorld is a strict 4 × 4 atlas: ground 0..3, scenery/props 4..15.
 */
const SIZE = [1600, 1080];
const FOOT_BOUNDS = [135, 155, 1465, 965];
const door = (x, y, to, tx, ty, label, direction, gate) => ({
  x, y, to, tx, ty, label, direction, ...(gate ? {gate} : {})
});
const scenery = (id, asset, x, y, w, h, box = null, more = {}) => ({
  id, sheet: 'hellWorld', asset, x, y, w, h, box, ...more
});
const rock = (id, x, y, w = 170, h = 124, bw = 130, bh = 38) =>
  scenery(id, 4, x, y, w, h, [x - bw / 2, y - bh, bw, bh]);
const tree = (id, x, y, w = 154, h = 198) =>
  scenery(id, 5, x, y, w, h, [x - 22, y - 28, 44, 28]);
const lamp = (id, x, y, h = 110) =>
  scenery(id, 15, x, y, 42, h, [x - 11, y - 18, 22, 18]);
const fissure = (id, x, y, w = 200, h = 54) =>
  scenery(id, 6, x, y, w, h, null, {flat: true, depthY: 0});
const grass = (id, x, y, w = 62, h = 48) =>
  scenery(id, 14, x, y, w, h, null, {flat: true, depthY: 0});
const prop = (id, action, label, x, y, ix, iy, index, w, h, box, more = {}) => ({
  id, action, label, x, y, interactX: ix, interactY: iy,
  art: {sheet: 'hellWorld', index, w, h}, box, ...more
});
const npc = (id, name, x, y, sprite, angle = Math.PI / 2) => ({
  id, name, x, y, sprite, angle, interactionRadius: 100
});

// Leave a 220px aperture in the physical boundary at every side-door.
// The world's hard foot clamp still prevents walking out of the 1600×1080 map.
function boundary(doors) {
  const result = [];
  const segments = (start, end, centers) => {
    const gaps = centers.map(c => [Math.max(start, c - 110), Math.min(end, c + 110)])
      .sort((a, b) => a[0] - b[0]);
    let cursor = start;
    const out = [];
    for (const [a, b] of gaps) {
      if (a > cursor) out.push([cursor, a - cursor]);
      cursor = Math.max(cursor, b);
    }
    if (cursor < end) out.push([cursor, end - cursor]);
    return out;
  };
  for (const [a, n] of segments(0, 1600, doors.filter(d => d.y <= 200).map(d => d.x))) result.push([a, 0, n, 150]);
  for (const [a, n] of segments(0, 1600, doors.filter(d => d.y >= 920).map(d => d.x))) result.push([a, 965, n, 115]);
  for (const [a, n] of segments(150, 965, doors.filter(d => d.x <= 200).map(d => d.y))) result.push([0, a, 130, n]);
  for (const [a, n] of segments(150, 965, doors.filter(d => d.x >= 1400).map(d => d.y))) result.push([1470, a, 130, n]);
  return result;
}

const S = (type, x, y, id) => [type, x, y, id];
const group = (id, spawns, eliteIds = []) => ({
  id, spawns, members: spawns.map(s => s[3]), eliteIds,
  anchor: [Math.round(spawns.reduce((a, s) => a + s[1], 0) / spawns.length), Math.round(spawns.reduce((a, s) => a + s[2], 0) / spawns.length)],
  roamRadius: 65, leash: 310
});

/** Only three initial enemies are elite: mine-8, pass-9, tomb-8. */
export const CH3_ENEMY_GROUPS = {
  hellGate: [
    group('ch3-gate-shore', [S('hellHound', 600, 790, 'ch3-gate-1'), S('hellHound', 705, 760, 'ch3-gate-2'), S('hellSoul', 620, 680, 'ch3-gate-3')]),
    group('ch3-gate-ridge', [S('hellSoul', 930, 550, 'ch3-gate-4'), S('hellSoul', 1030, 570, 'ch3-gate-5'), S('hellGuard', 1000, 475, 'ch3-gate-6')]),
    group('ch3-gate-drift', [S('hellHound', 1230, 735, 'ch3-gate-7'), S('hellSoul', 1270, 650, 'ch3-gate-8')])
  ],
  hellWall: [
    group('ch3-wall-low-road', [S('hellHound', 490, 770, 'ch3-wall-1'), S('hellSoul', 540, 720, 'ch3-wall-2'), S('hellSoul', 620, 820, 'ch3-wall-3')]),
    group('ch3-wall-high-road', [S('hellSoul', 610, 350, 'ch3-wall-4'), S('hellSoul', 730, 290, 'ch3-wall-5'), S('hellGuard', 820, 350, 'ch3-wall-6')]),
    group('ch3-wall-weepers', [S('hellSoul', 1110, 650, 'ch3-wall-7'), S('hellSoul', 1225, 635, 'ch3-wall-8'), S('hellHound', 1160, 540, 'ch3-wall-9'), S('hellGuard', 1280, 575, 'ch3-wall-10')])
  ],
  hellCamp: [],
  hellGrotto: [
    group('ch3-grotto-lower-shelf', [S('hellHound', 460, 610, 'ch3-grotto-1'), S('hellSoul', 540, 650, 'ch3-grotto-2'), S('hellHound', 400, 670, 'ch3-grotto-3')]),
    group('ch3-grotto-salt-pool', [S('hellSoul', 990, 700, 'ch3-grotto-4'), S('hellSoul', 1080, 630, 'ch3-grotto-5'), S('hellGuard', 1170, 690, 'ch3-grotto-6')]),
    group('ch3-grotto-high-ledge', [S('hellSoul', 950, 300, 'ch3-grotto-7'), S('hellHound', 1060, 290, 'ch3-grotto-8'), S('hellGuard', 1120, 420, 'ch3-grotto-9')])
  ],
  hellWorkshop: [],
  hellMine: [
    group('ch3-mine-broken-track', [S('hellHound', 430, 500, 'ch3-mine-1'), S('hellGuard', 510, 450, 'ch3-mine-2'), S('hellHound', 440, 600, 'ch3-mine-3')]),
    group('ch3-mine-roof-fall', [S('hellSoul', 690, 280, 'ch3-mine-4'), S('hellSoul', 800, 260, 'ch3-mine-5'), S('hellGuard', 860, 330, 'ch3-mine-6')]),
    group('ch3-mine-brine-watch', [S('hellSoul', 1110, 590, 'ch3-mine-7'), S('hellGuard', 1210, 610, 'ch3-mine-8')], ['ch3-mine-8']),
    group('ch3-mine-blind-cut', [S('hellHound', 610, 820, 'ch3-mine-9'), S('hellSoul', 710, 810, 'ch3-mine-10')])
  ],
  hellFerry: [
    group('ch3-ferry-mid-shoal', [S('hellSoul', 760, 640, 'ch3-ferry-1'), S('hellHound', 820, 700, 'ch3-ferry-2'), S('hellSoul', 900, 660, 'ch3-ferry-3')]),
    group('ch3-ferry-low-tide', [S('hellHound', 1110, 760, 'ch3-ferry-4'), S('hellSoul', 1210, 720, 'ch3-ferry-5'), S('hellGuard', 1180, 840, 'ch3-ferry-6')]),
    group('ch3-ferry-east-bank', [S('hellSoul', 1110, 310, 'ch3-ferry-7'), S('hellGuard', 1180, 240, 'ch3-ferry-8')])
  ],
  hellPass: [
    group('ch3-pass-ash-turn', [S('hellHound', 480, 790, 'ch3-pass-1'), S('hellHound', 570, 825, 'ch3-pass-2'), S('hellSoul', 570, 720, 'ch3-pass-3')]),
    group('ch3-pass-high-turn', [S('hellSoul', 470, 390, 'ch3-pass-4'), S('hellSoul', 580, 330, 'ch3-pass-5'), S('hellGuard', 660, 400, 'ch3-pass-6')]),
    group('ch3-pass-chain-patrol', [S('hellHound', 870, 700, 'ch3-pass-7'), S('hellSoul', 960, 780, 'ch3-pass-8'), S('hellGuard', 1040, 700, 'ch3-pass-9')], ['ch3-pass-9']),
    group('ch3-pass-last-turn', [S('hellSoul', 1270, 615, 'ch3-pass-10'), S('hellGuard', 1150, 655, 'ch3-pass-11'), S('hellGuard', 1180, 715, 'ch3-pass-12')])
  ],
  hellArena: [
    group('ch3-arena-chain-guards', [S('hellGuard', 530, 590, 'ch3-arena-1'), S('hellGuard', 1100, 590, 'ch3-arena-2'), S('hellGuard', 1130, 810, 'ch3-arena-3')])
  ],
  hellTomb: [
    group('ch3-tomb-east-aisle', [S('hellSoul', 1110, 670, 'ch3-tomb-1'), S('hellGuard', 1130, 560, 'ch3-tomb-2'), S('hellSoul', 1040, 640, 'ch3-tomb-3')]),
    group('ch3-tomb-low-niches', [S('hellHound', 760, 810, 'ch3-tomb-4'), S('hellSoul', 860, 820, 'ch3-tomb-5'), S('hellGuard', 920, 760, 'ch3-tomb-6')]),
    group('ch3-tomb-lamp-watch', [S('hellSoul', 390, 460, 'ch3-tomb-7'), S('hellGuard', 420, 560, 'ch3-tomb-8')], ['ch3-tomb-8'])
  ],
  hellRift: [
    group('ch3-rift-low-ring', [S('hellHound', 620, 730, 'ch3-rift-1'), S('hellSoul', 705, 760, 'ch3-rift-2'), S('hellHound', 650, 660, 'ch3-rift-3')]),
    group('ch3-rift-old-echoes', [S('hellSoul', 350, 360, 'ch3-rift-4'), S('hellSoul', 410, 440, 'ch3-rift-5'), S('hellGuard', 480, 340, 'ch3-rift-6')]),
    group('ch3-rift-far-ring', [S('hellSoul', 1130, 630, 'ch3-rift-7'), S('hellGuard', 1210, 560, 'ch3-rift-8')])
  ]
};

export const CH3_MAPS = {
  hellGate: {
    name: '灰烬渡口', sub: '倒塌的门朝着黑潮，灰白脚印绕过岩脊向东', entry: [340, 835],
    layout: 'crescent-landing',
    doors: [door(1430, 380, 'hellWall', 280, 740, '哭墙荒径', '东北')],
    npcs: [], props: []
  },
  hellWall: {
    name: '哭墙荒径', sub: '塌墙把荒径分成上下两股，哭声从背风面传来', entry: [280, 740],
    layout: 'split-ridge-loop', storyAnchors: {injury: [800, 740], rescueExit: [1300, 440]},
    doors: [door(170, 740, 'hellGate', 1320, 380, '灰烬渡口', '西南'), door(1430, 365, 'hellCamp', 280, 590, '余烬营地', '东北')],
    npcs: [], props: []
  },
  hellCamp: {
    name: '余烬营地', sub: '帐篷围着一片空地，医生台上仍有温热的水', safe: true, entry: [280, 590],
    layout: 'sheltered-courtyard', storyAnchors: {patient: [535, 545], saint: [660, 580], restored: [800, 600]},
    doors: [
      door(170, 590, 'hellWall', 1320, 365, '哭墙荒径', '西'),
      door(650, 180, 'hellGrotto', 510, 830, '盐骨苔窟', '北'),
      door(1430, 780, 'hellWorkshop', 280, 760, '沉钟工坊', '东南'),
      door(810, 940, 'hellFerry', 810, 290, '黑潮渡岸', '南'),
      door(1430, 350, 'hellPass', 280, 740, '焚风回廊', '东北', 'ch3-after-heal')
    ],
    npcs: [npc('doctor', '医生', 650, 470, 5)],
    props: [
      prop('hell-doctor', 'ch3-doctor', '医生台', 460, 450, 460, 530, 12, 180, 104, [380, 418, 160, 32]),
      prop('hell-altar', 'ch3-altar', '余烬祭坛', 1030, 330, 1030, 410, 13, 142, 122, [976, 294, 108, 36], {service: 'optional-departure-buff'})
    ]
  },
  hellGrotto: {
    name: '盐骨苔窟', sub: '蓝草沿盐痕生长，洞中的两道石脊之间留着旧路', entry: [510, 830],
    layout: 'crescent-salt-shelves',
    doors: [door(510, 940, 'hellCamp', 650, 285, '余烬营地', '西南'), door(1430, 400, 'hellMine', 280, 400, '无灯矿道', '东')],
    npcs: [],
    props: [prop('salt-moss', 'ch3-salt-moss', '盐骨苔', 730, 430, 730, 510, 14, 90, 68, [699, 414, 62, 16], {questMaterial: true})]
  },
  hellWorkshop: {
    name: '沉钟工坊', sub: '锻炉、抽签轮和蒸馏管各占一角，中央留着运料道', safe: true, entry: [280, 760],
    layout: 'three-island-industrial-yard',
    doors: [door(170, 760, 'hellCamp', 1320, 780, '余烬营地', '西南'), door(1100, 180, 'hellMine', 1100, 830, '无灯矿道', '北'), door(570, 940, 'hellFerry', 1320, 400, '黑潮渡岸', '南')],
    npcs: [npc('mechanist', '机械师', 1240, 530, 10, Math.PI), npc('drawkeeper', '抽签人', 640, 440, 7, Math.PI)],
    props: [
      prop('hell-bench', 'ch3-bench', '工坊制造台', 1100, 480, 1100, 565, 10, 166, 146, [1030, 435, 140, 45], {service: 'crafting'}),
      prop('soul-wheel', 'ch3-soul-wheel', '缚魂抽签轮', 490, 390, 490, 480, 11, 136, 164, [440, 350, 100, 40], {service: 'soul-draw'})
    ]
  },
  hellMine: {
    name: '无灯矿道', sub: '断轨在落石前分开，最深的渗液仍被旧蒸馏器接着', entry: [280, 400],
    layout: 'braided-excavation',
    doors: [door(170, 400, 'hellGrotto', 1320, 400, '盐骨苔窟', '西'), door(1100, 940, 'hellWorkshop', 1100, 290, '沉钟工坊', '东南')],
    npcs: [],
    props: [prop('black-brine', 'ch3-black-brine', '黑卤渗液', 1180, 330, 1180, 415, 9, 100, 126, [1144, 300, 72, 30], {questMaterial: true})]
  },
  hellFerry: {
    name: '黑潮渡岸', sub: '高岸通向工坊，摆渡灯下的小径贴着黑潮折向西面', entry: [810, 290],
    layout: 'curved-levee-and-two-piers',
    doors: [
      door(810, 180, 'hellCamp', 810, 830, '余烬营地', '北'),
      door(1430, 400, 'hellWorkshop', 570, 830, '沉钟工坊', '东'),
      {...door(170, 720, 'hellTomb', 1320, 720, '守灯墓室', '西南', 'ch3-tomb'), hidden: 'ch3TombOpen'}
    ],
    npcs: [npc('ferryman', '摆渡人', 410, 560, 8, 0)],
    props: [
      prop('ferry-lamp', 'ch3-ferry-lamp', '摆渡灯', 470, 700, 470, 780, 15, 56, 143, [455, 678, 30, 22], {sideQuest: true}),
      prop('tomb-clue', 'ch3-tomb-clue', '刻着灯纹的残门', 290, 355, 290, 445, 7, 148, 160, [235, 321, 110, 34], {revealsDoorFlag: 'ch3TombOpen'})
    ]
  },
  hellPass: {
    name: '焚风回廊', sub: '焦土路绕着三根岩脊折转，北面的裂隙发出回声', entry: [280, 740],
    layout: 'slalom-wind-canyon',
    doors: [door(170, 740, 'hellCamp', 1320, 350, '余烬营地', '西南', 'ch3-after-heal'), door(1430, 430, 'hellArena', 280, 760, '锁链祭场', '东'), door(1030, 180, 'hellRift', 460, 830, '回声裂隙', '北')],
    npcs: [], props: []
  },
  hellArena: {
    name: '锁链祭场', sub: '四座低矮石墩围着锁链印痕，中央没有遮挡', entry: [280, 760],
    layout: 'open-chain-circle',
    doors: [door(170, 760, 'hellPass', 1320, 430, '焚风回廊', '西南')],
    npcs: [],
    props: [prop('hell-boss-chain', 'ch3-boss-chain', '祭场锁链', 800, 305, 800, 400, 13, 168, 150, [736, 267, 128, 38], {triggerOnly: true})],
    bossTrigger: {action: 'ch3-boss-chain', spawn: [800, 580], clearRadius: 225, initialBoss: false, guardsMustBeCleared: true}
  },
  hellTomb: {
    name: '守灯墓室', sub: '墓道在低石龛间分作两股，一盏蓝灯守着旧祭台', entry: [1320, 720],
    layout: 'forked-crypt-aisle',
    doors: [door(1430, 720, 'hellFerry', 280, 720, '黑潮渡岸', '东南')],
    npcs: [],
    props: [prop('tomb-cache', 'ch3-tomb-cache', '守灯者的遗藏', 650, 330, 650, 420, 13, 138, 118, [596, 295, 108, 35], {hiddenReward: true})]
  },
  hellRift: {
    name: '回声裂隙', sub: '三道碎石坡绕着空旷裂环汇合，试炼石立在北面', entry: [460, 830],
    layout: 'three-spoke-crater',
    doors: [door(460, 940, 'hellPass', 1030, 290, '焚风回廊', '西南')],
    npcs: [],
    props: [prop('hell-trial', 'ch3-trial', '回声试炼石', 860, 350, 860, 440, 13, 146, 132, [806, 314, 108, 36], {repeatable: true})],
    trialTrigger: {action: 'ch3-trial', arenaCenter: [870, 650], arenaRadius: 190, initialGroups: 'ambient', ambientMustBeCleared: true, waveSpawnPoints: [[960, 590], [1030, 700], [810, 760], [755, 590]]}
  }
};

for (const [id, map] of Object.entries(CH3_MAPS)) {
  map.size = [...SIZE];
  map.footBounds = [...FOOT_BOUNDS];
  map.chapterRegion = 3;
  map.safe = map.safe === true;
  map.blocks = boundary(map.doors);
  map.spawns = CH3_ENEMY_GROUPS[id].flatMap(g => g.spawns.map(s => [...s]));
  map.enemyGroups = CH3_ENEMY_GROUPS[id].map(g => g.id);
}

export const CH3_SCENERY = {
  hellGate: [
    scenery('gate-broken-arch', 7, 385, 395, 200, 215, [315, 358, 140, 37]),
    rock('gate-black-ridge-n', 760, 440, 215, 150, 170, 42),
    rock('gate-black-ridge-s', 850, 700, 180, 116, 140, 35),
    rock('gate-landing-stone', 360, 690, 155, 100, 110, 30),
    rock('gate-east-scree', 1240, 465, 140, 94, 104, 29),
    rock('gate-drift-cache-rock', 1100, 860, 170, 106, 124, 33),
    tree('gate-dead-tree', 1170, 275, 172, 215),
    lamp('gate-route-lamp', 1190, 355), lamp('gate-landing-lamp', 490, 590, 98),
    fissure('gate-cold-crack', 950, 330, 250, 60),
    fissure('gate-low-crack', 1030, 900, 260, 45),
    grass('gate-first-blue-grass', 320, 845, 46, 36)
  ],
  hellWall: [
    rock('wall-ridge-w', 590, 550, 230, 155, 180, 48),
    rock('wall-ridge-mid', 780, 550, 245, 157, 195, 48),
    rock('wall-ridge-e', 970, 520, 228, 145, 180, 44),
    scenery('wall-door-fragment', 7, 1050, 280, 165, 183, [990, 246, 120, 34]),
    rock('wall-low-spur', 390, 600, 144, 100, 102, 32),
    rock('wall-south-pile', 1060, 870, 177, 110, 132, 34),
    tree('wall-west-dead-tree', 330, 325), tree('wall-east-dead-tree', 1320, 810, 122, 157),
    lamp('wall-upper-route-lamp', 470, 375, 106), lamp('wall-camp-route-lamp', 1290, 400, 108),
    fissure('wall-cold-gash', 820, 595, 410, 55), fissure('wall-north-gash', 680, 225, 220, 42)
  ],
  hellCamp: [
    scenery('camp-west-tent', 8, 360, 350, 242, 180, [255, 289, 210, 61]),
    scenery('camp-east-tent', 8, 1200, 655, 244, 181, [1095, 594, 210, 61]),
    scenery('camp-southwest-tent', 8, 370, 825, 224, 159, [274, 775, 192, 50]),
    scenery('camp-water-still', 9, 315, 480, 91, 113, [282, 450, 66, 30]),
    rock('camp-outer-rock-n', 1220, 240, 177, 108, 130, 34),
    rock('camp-outer-rock-sw', 590, 845, 126, 85, 90, 28),
    tree('camp-quiet-tree', 890, 270, 132, 175),
    lamp('camp-north-route-lamp', 760, 335, 106), lamp('camp-workshop-route-lamp', 1280, 725, 108),
    lamp('camp-ferry-route-lamp', 930, 855, 108),
    grass('camp-doctor-blue-grass', 350, 548, 66, 46), grass('camp-altar-blue-grass', 1150, 367, 73, 51)
  ],
  hellGrotto: [
    rock('grotto-west-rib', 420, 530, 165, 127, 120, 38),
    rock('grotto-low-rib', 775, 645, 198, 134, 146, 40),
    rock('grotto-east-rib', 930, 470, 187, 142, 136, 40),
    rock('grotto-upper-bones', 560, 300, 168, 122, 124, 34),
    rock('grotto-east-shelf', 1300, 595, 143, 98, 102, 30),
    rock('grotto-south-shelf', 1030, 870, 207, 121, 150, 35),
    scenery('grotto-old-pipe', 9, 300, 825, 94, 112, [265, 795, 70, 30]),
    lamp('grotto-mine-route-lamp', 1285, 335, 100),
    grass('grotto-moss-trail-1', 630, 505, 70, 53), grass('grotto-moss-trail-2', 690, 375, 75, 54),
    grass('grotto-moss-trail-3', 805, 415, 63, 48), grass('grotto-moss-trail-4', 535, 875, 50, 38),
    fissure('grotto-salt-crack', 1110, 535, 236, 47)
  ],
  hellWorkshop: [
    scenery('workshop-silent-bell-arch', 7, 775, 300, 195, 205, [705, 263, 140, 37]),
    scenery('workshop-east-still', 9, 1280, 325, 112, 140, [1239, 290, 82, 35]),
    scenery('workshop-west-shelter', 8, 330, 310, 214, 156, [238, 259, 184, 51]),
    rock('workshop-central-low-pile', 770, 670, 192, 111, 142, 35),
    rock('workshop-scrap-south', 1060, 840, 145, 95, 104, 30),
    scenery('workshop-spare-still', 9, 340, 625, 83, 102, [310, 598, 60, 27]),
    lamp('workshop-mine-lamp', 1010, 330, 108), lamp('workshop-camp-lamp', 360, 805, 96),
    lamp('workshop-ferry-lamp', 705, 840, 103),
    fissure('workshop-forge-floor', 1130, 650, 198, 45)
  ],
  hellMine: [
    rock('mine-main-roof-fall', 735, 420, 261, 171, 200, 48),
    rock('mine-track-fork', 800, 650, 215, 140, 156, 40),
    rock('mine-west-stone', 355, 730, 146, 115, 106, 32),
    rock('mine-east-face', 1305, 430, 158, 112, 116, 33),
    rock('mine-brine-backwall', 1100, 230, 177, 125, 128, 35),
    rock('mine-south-face', 940, 830, 169, 106, 124, 32),
    scenery('mine-dead-forge', 10, 510, 300, 129, 122, [460, 267, 100, 33]),
    scenery('mine-broken-pit-frame', 7, 330, 275, 133, 153, [282, 244, 96, 31]),
    lamp('mine-last-lamp', 1040, 490, 101),
    grass('mine-brine-blue-grass', 1250, 275, 53, 44),
    fissure('mine-upper-seam', 950, 360, 153, 40), fissure('mine-low-seam', 700, 915, 310, 45)
  ],
  hellFerry: [
    rock('ferry-mid-shoal-rock', 660, 610, 162, 105, 116, 31),
    rock('ferry-low-shoal-rock', 900, 855, 190, 108, 142, 34),
    rock('ferry-east-shoal-rock', 1210, 540, 150, 98, 110, 31),
    rock('ferry-quiet-shore-rock', 315, 840, 147, 98, 106, 29),
    tree('ferry-dead-mooring-tree', 560, 335, 145, 188),
    scenery('ferry-folded-shelter', 8, 285, 650, 155, 115, [219, 614, 132, 36]),
    lamp('ferry-camp-route-lamp', 935, 290, 106), lamp('ferry-workshop-route-lamp', 1290, 420, 99),
    grass('ferry-hidden-blue-grass', 265, 725, 49, 39), grass('ferry-lamp-blue-grass', 545, 750, 62, 46),
    fissure('ferry-tide-seam', 700, 880, 202, 43)
  ],
  hellPass: [
    rock('pass-first-spine', 555, 620, 220, 153, 160, 43),
    rock('pass-second-spine', 815, 505, 219, 158, 164, 44),
    rock('pass-third-spine', 1070, 560, 216, 145, 158, 42),
    rock('pass-north-spur', 835, 290, 160, 111, 116, 32),
    rock('pass-south-spur', 730, 870, 158, 96, 114, 30),
    rock('pass-far-south-spur', 1280, 780, 161, 106, 116, 31),
    scenery('pass-ruined-chain-gate', 7, 1270, 275, 142, 166, [1219, 243, 102, 32]),
    tree('pass-west-wind-tree', 340, 490, 127, 183),
    lamp('pass-rift-route-lamp', 1120, 280, 103), lamp('pass-arena-route-lamp', 1320, 545, 103),
    fissure('pass-gash-w', 655, 530, 194, 54), fissure('pass-gash-e', 1180, 660, 215, 52),
    fissure('pass-gash-s', 990, 910, 235, 46)
  ],
  hellArena: [
    rock('arena-nw-buttress', 405, 415, 180, 135, 134, 38),
    rock('arena-ne-buttress', 1200, 415, 180, 135, 134, 38),
    rock('arena-sw-buttress', 405, 880, 166, 114, 124, 35),
    rock('arena-se-buttress', 1230, 885, 166, 114, 124, 35),
    scenery('arena-north-chain-frame', 7, 1030, 250, 145, 164, [978, 220, 104, 30]),
    lamp('arena-lamp-nw', 565, 345, 102), lamp('arena-lamp-ne', 1040, 345, 102),
    lamp('arena-lamp-sw', 590, 840, 94), lamp('arena-lamp-se', 1050, 855, 94),
    fissure('arena-chain-scar-n', 800, 470, 254, 38),
    fissure('arena-chain-scar-s', 800, 805, 278, 39)
  ],
  hellTomb: [
    rock('tomb-cross-wall-w', 620, 655, 225, 133, 174, 42),
    rock('tomb-cross-wall-e', 870, 535, 220, 130, 170, 42),
    rock('tomb-west-niche', 280, 710, 142, 98, 104, 31),
    rock('tomb-north-niche', 1010, 280, 148, 109, 108, 33),
    rock('tomb-south-niche', 1070, 895, 158, 95, 118, 29),
    scenery('tomb-broken-door', 7, 370, 300, 143, 163, [318, 268, 104, 32]),
    lamp('tomb-kept-lamp', 535, 345, 109), lamp('tomb-east-lamp', 1240, 680, 102),
    lamp('tomb-south-lamp', 650, 850, 95),
    grass('tomb-blue-grass-1', 750, 340, 72, 51), grass('tomb-blue-grass-2', 505, 285, 51, 41)
  ],
  hellRift: [
    rock('rift-low-ring-stone', 890, 890, 183, 103, 134, 33),
    rock('rift-west-ring-stone', 535, 535, 177, 132, 128, 38),
    rock('rift-east-ring-stone', 1280, 760, 166, 104, 120, 31),
    rock('rift-upper-ring-stone', 1150, 350, 172, 125, 128, 35),
    rock('rift-lower-entry-stone', 290, 785, 145, 96, 106, 30),
    scenery('rift-broken-echo-frame', 7, 635, 280, 152, 169, [580, 248, 110, 32]),
    lamp('rift-entry-lamp', 560, 875, 97), lamp('rift-trial-lamp', 970, 365, 101),
    fissure('rift-open-ring', 890, 700, 328, 85),
    fissure('rift-north-fracture', 840, 230, 223, 45),
    fissure('rift-west-fracture', 360, 610, 184, 51),
    grass('rift-blue-echo', 1010, 470, 65, 49)
  ]
};

/**
 * Ground rendering contract: draw `base` first, then patches, then paths.
 * A patch is a top-left rect/ellipse. A path is a round-joined polyline of width.
 * All indices here belong to hellWorld 0..3. These are ground, never y-sorted.
 */
const path = (asset, width, points) => ({asset, width, points});
const patch = (asset, x, y, w, h, shape = 'ellipse') => ({asset, x, y, w, h, shape});
const ground = (base, paths, patches = []) => ({sheet: 'hellWorld', base, paths, patches});

export const CH3_GROUND_STYLE = {
  hellGate: ground(0, [
    path(1, 152, [[340, 965], [400, 810], [580, 710], [850, 580], [1140, 390], [1470, 380]]),
    path(1, 94, [[580, 710], [790, 820], [1110, 750], [1280, 650], [1140, 390]])
  ], [patch(1, 240, 690, 520, 240), patch(2, 730, 290, 400, 215)]),
  hellWall: ground(2, [
    path(1, 141, [[130, 740], [380, 745], [630, 705], [870, 740], [1140, 735], [1300, 520], [1470, 365]]),
    path(1, 111, [[380, 745], [340, 445], [490, 310], [790, 300], [1140, 355], [1300, 520]])
  ], [patch(0, 510, 415, 570, 190), patch(0, 1090, 760, 210, 130)]),
  hellCamp: ground(1, [
    path(3, 140, [[130, 590], [400, 590], [800, 600], [1130, 530], [1470, 350]]),
    path(3, 122, [[650, 150], [650, 290], [790, 440], [800, 600], [810, 965]]),
    path(3, 122, [[800, 600], [1080, 790], [1470, 780]]),
    path(1, 90, [[430, 590], [460, 525], [650, 490]])
  ], [patch(3, 540, 395, 520, 405), patch(0, 240, 270, 245, 95), patch(0, 1080, 580, 240, 105)]),
  hellGrotto: ground(0, [
    path(1, 133, [[510, 965], [580, 785], [665, 720], [920, 770], [1160, 585], [1470, 400]]),
    path(1, 108, [[580, 785], [330, 590], [375, 375], [730, 305], [1020, 390], [1160, 585]]),
    path(1, 90, [[730, 305], [730, 520], [665, 720]])
  ], [patch(1, 600, 345, 235, 230), patch(2, 1010, 725, 205, 115)]),
  hellWorkshop: ground(3, [
    path(1, 142, [[130, 760], [440, 760], [650, 635], [925, 580], [1100, 575]]),
    path(1, 118, [[1100, 150], [1100, 310], [940, 440], [925, 580], [825, 765], [570, 965]]),
    path(1, 100, [[650, 635], [490, 490], [670, 450], [940, 440]])
  ], [patch(2, 965, 370, 350, 285), patch(0, 365, 260, 250, 170)]),
  hellMine: ground(0, [
    path(3, 130, [[130, 400], [350, 400], [590, 555], [950, 555], [1100, 735], [1100, 965]]),
    path(3, 103, [[590, 555], [595, 300], [920, 235], [1180, 410], [1275, 635], [1100, 735]]),
    path(1, 94, [[590, 555], [560, 780], [790, 815], [950, 555]])
  ], [patch(1, 1020, 265, 290, 250), patch(2, 320, 660, 310, 180)]),
  hellFerry: ground(0, [
    path(1, 157, [[810, 150], [810, 400], [1080, 420], [1470, 400]]),
    path(1, 131, [[810, 400], [600, 430], [455, 585], [440, 780], [130, 720]]),
    path(1, 94, [[810, 400], [950, 615], [1070, 845], [1280, 785]]),
    path(1, 78, [[455, 585], [290, 445]])
  ], [patch(1, 265, 455, 310, 360), patch(1, 1080, 665, 255, 210), patch(2, 790, 720, 205, 120)]),
  hellPass: ground(2, [
    path(1, 131, [[130, 740], [360, 740], [720, 690], [800, 600], [940, 405], [1170, 455], [1470, 430]]),
    path(1, 107, [[360, 740], [345, 445], [660, 310], [940, 405], [1030, 285], [1030, 150]]),
    path(1, 104, [[720, 690], [985, 815], [1200, 745], [1295, 600], [1170, 455]])
  ], [patch(0, 435, 525, 255, 125), patch(0, 725, 410, 210, 145), patch(0, 990, 475, 235, 140)]),
  hellArena: ground(3, [
    path(1, 139, [[130, 760], [360, 745], [575, 675], [800, 580]]),
    path(1, 112, [[800, 400], [570, 450], [495, 670], [645, 780], [955, 795], [1160, 670], [1080, 450], [800, 400]])
  ], [patch(2, 560, 400, 480, 395), patch(0, 270, 220, 205, 155), patch(0, 1140, 240, 205, 155)]),
  hellTomb: ground(3, [
    path(1, 130, [[1470, 720], [1125, 720], [900, 660], [735, 545], [650, 420]]),
    path(1, 94, [[735, 545], [480, 430], [400, 680], [690, 790], [900, 660]]),
    path(1, 94, [[1125, 720], [1180, 430], [865, 330], [650, 420]])
  ], [patch(0, 520, 570, 220, 120), patch(0, 770, 455, 215, 110), patch(0, 1030, 800, 150, 125)]),
  hellRift: ground(0, [
    path(1, 133, [[460, 965], [460, 815], [705, 605], [860, 440]]),
    path(1, 99, [[705, 605], [460, 570], [330, 435], [560, 310], [860, 440]]),
    path(1, 105, [[705, 605], [795, 795], [1145, 765], [1240, 485], [1040, 440], [860, 440]])
  ], [patch(2, 670, 475, 500, 370), patch(0, 760, 570, 310, 185), patch(2, 320, 280, 300, 210)])
};
