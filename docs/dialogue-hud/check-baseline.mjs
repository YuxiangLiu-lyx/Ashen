import assert from 'node:assert/strict';import fs from 'node:fs';import {execFileSync} from 'node:child_process';
const root='/tmp/ashen-dialogue-baseline-e82';assert.equal(execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),'e82ca67c6693900b83ee58ea031933047f3a531f');
const actual=JSON.parse(execFileSync('node',['tools/harness/dialogue_corpus.mjs'],{cwd:root,encoding:'utf8',maxBuffer:8*1024*1024})),saved=JSON.parse(fs.readFileSync('docs/dialogue-hud/baseline/full-corpus.json'));
assert.deepEqual(actual,saved);console.log('Baseline: all 716 producer variants match isolated committed e82ca67 runtime.');
