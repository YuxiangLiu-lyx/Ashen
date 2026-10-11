import fs from 'node:fs';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {MAPS,QUESTS} from '../../dist/core-v14.js';
import {DIALOGUES} from '../../dist/data-v14.js';
import {SCENERY} from '../../dist/world-v14.js';
import {STAGING} from '../../dist/staging-v14.js';
const hash=v=>crypto.createHash('sha256').update(v).digest('hex');
const values=table=>Object.fromEntries(Object.entries(table).map(([id,v])=>[id,hash(JSON.stringify(v))]));
const kept=['dist/chapter-one-pursuit-v31.js','dist/chapter-one-interaction-v31.js',
 'dist/chapter-one-art-v30.js','dist/chapter123-presentation-v30.js','dist/chapter23-art-v30.js',
 'dist/core-v14.js','dist/visuals-v14.js',
 ...['guard','elite','officer'].map(k=>'dist/assets/c1-incremental/pursuit-'+k+'.png')];
const report={head:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
 maps:values(MAPS),quests:values(QUESTS),dialogues:values(DIALOGUES),scenery:values(SCENERY),
 originalStaging:values(STAGING.scenes),retainedFiles:Object.fromEntries(kept.map(p=>[p,hash(fs.readFileSync(p))]))};
fs.writeFileSync(new URL('./BASELINE.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({maps:Object.keys(MAPS).length,dialogues:Object.keys(DIALOGUES).length,retainedFiles:kept.length}));
