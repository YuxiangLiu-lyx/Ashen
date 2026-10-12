import {configureC1World,installC1World} from './chapter-one-expansion-world.js';
import {installC1Save} from './chapter-one-expansion-save.js';
import {installC1Gear} from './chapter-one-expansion-gear.js';
import {installC1Quests} from './chapter-one-expansion-quests.js';
import {installC1Combat} from './chapter-one-expansion-combat.js';
export function installChapterOneExpansion(RPG,api){configureC1World(api);installC1Save(RPG);installC1World(RPG);installC1Gear(RPG,api);installC1Quests(RPG,api);installC1Combat(RPG,api);}
