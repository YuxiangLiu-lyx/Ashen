// Read-only audit of the installed V30 runtime. Does not load a player's save.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {RPG, MAPS, QUESTS} from '../../dist/core-v14.js';
import {DIALOGUES} from '../../dist/data-v14.js';
import {STAGING} from '../../dist/staging-v14.js';
import {SCENERY} from '../../dist/world-v14.js';
import {CHAPTER_ONE_MAPS_V30} from '../../dist/chapter23-design-v30.js';

const hash = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const root = new URL('../../', import.meta.url);
function files(dir) {
  return fs.readdirSync(new URL(dir, root), {withFileTypes: true}).flatMap(entry => {
    const path = dir + '/' + entry.name;
    return entry.isDirectory() ? files(path) : [path];
  }).sort();
}
const runtimeFiles = files('dist').map(path => {
  const bytes = fs.readFileSync(new URL(path, root));
  return {path, bytes: bytes.length, sha256: crypto.createHash('sha256').update(bytes).digest('hex')};
});
// Derive the complete reachable map component from actual doors, stopping at
// the chapter-transition sentinel. Compare to the rendering inventory, rather
// than trusting an old count or a list of maps selected for visual polish.
const reachable = new Set(), queue = ['hall'];
while (queue.length) {
  const id = queue.shift();
  if (reachable.has(id)) continue;
  assert.ok(MAPS[id], `Missing map ${id}`);
  reachable.add(id);
  for (const door of MAPS[id].doors) if (door.to !== 'end') queue.push(door.to);
}
assert.deepEqual([...reachable].sort(), [...CHAPTER_ONE_MAPS_V30].sort());
const maps = CHAPTER_ONE_MAPS_V30.map(id => ({
  id, ...MAPS[id], scenery: SCENERY[id],
  mapSha256: hash(MAPS[id]), scenerySha256: hash(SCENERY[id])
}));
const checkpoints = [
  {name: 'new', phase: 0, flags: {}},
  {name: 'rats-complete', phase: 1, flags: {crack: true, rats: 6}},
  {name: 'commission-before-gate', phase: 2, flags: {pass: true}},
  {name: 'commission-after-gate', phase: 2, flags: {pass: true, gateTalk: true}},
  {name: 'escape-before-captain', phase: 3, flags: {assassination: true, gateTalk: true}},
  {name: 'escape-after-captain', phase: 4, flags: {assassination: true, gateTalk: true, captainStarted: true}},
  {name: 'chapter-two-start', phase: 5, flags: {chapterOneComplete: true, assassination: true}},
];
const gates = checkpoints.map(checkpoint => {
  const g = new RPG('shadow', null, () => .44);
  g.chapter = checkpoint.phase;
  Object.assign(g.flags, checkpoint.flags);
  const edges = maps.flatMap(({id, doors}) => {
    g.ensureMap(id); g.map = id;
    return doors.map(door => ({from: id, to: door.to, gate: door.gate ?? null,
      hiddenBy: door.hidden ?? null, reason: g.canDoor(door)}));
  });
  return {...checkpoint, edges};
});
const scenes = ['intro', 'ratAccept', 'ratDone', 'aside', 'contract', 'sisterBeforeDeparture',
  'sisterIdle', 'clerkIdle', 'ch1SisterBoots', 'saintBrief', 'watch', 'assassination',
  'canalStart', 'chapterEnd', 'saintSealTalk', 'saintSealEarly', 'saintRoadEarly',
  'saintRoadTalk', 'oilAcceptTalk', 'oilDone', 'herbsAccept', 'herbSelf', 'herbWoman',
  'practiceCopperFound', 'echoMachineIntro', 'farewellSteward', 'farewellSister',
  'farewellDolly', 'farewellLottie'].map(id => ({id, lines: DIALOGUES[id],
    dialogueSha256: hash(DIALOGUES[id] ?? null), staging: STAGING.scenes[id] ?? null}));
const missingSceneIds = scenes.filter(scene => !scene.lines).map(scene => scene.id);
assert.deepEqual(missingSceneIds, []);
assert.equal(maps.length, 12);
assert.equal(DIALOGUES.assassination.length, 18);
const allDialogueHashes = Object.fromEntries(Object.entries(DIALOGUES).map(([id, rows]) => [id, hash(rows)]));
const allMapHashes = Object.fromEntries(Object.entries(MAPS).map(([id, map]) => [id, hash(map)]));
const quests = Object.fromEntries(['rats','contract','escape','oil','letter','herbs','lantern','copper','echo','farewell']
  .map(id => [id, QUESTS[id] ?? null]));
fs.writeFileSync(new URL('./AUDIT.json', import.meta.url), JSON.stringify({
  scope: 'Installed V30 data and synthetic door-policy probes. No movement, combat, visual quality or normal playthrough is asserted. Gates use explicit fixture phases/flags; captain combat and optional hidden-route discoveries are not simulated.',
  runtimeFiles, graphDerivedChapterOneMaps: [...reachable], maps, gates, scenes, quests, allDialogueHashes, allMapHashes
}, null, 2) + '\n');
console.log(JSON.stringify({maps: maps.length, scenes: scenes.length,
  runtimeFiles: runtimeFiles.length, doorwayPhaseProbes: gates.length, assertions: 'PASS'}));
