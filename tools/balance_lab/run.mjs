#!/usr/bin/env node
import fs from 'node:fs';import path from 'node:path';import {parseArgs} from 'node:util';
import {simulate,summarize,normalizeConfig} from './simulator.mjs';
import {effectCatalog,queryEffects} from './effects.mjs';
import {economyExperiment,ECONOMY_PATHS} from './economy.mjs';
import {provenance,sha} from './provenance.mjs';

const {values,positionals}=parseArgs({allowPositionals:true,options:{
  config:{type:'string'},output:{type:'string',default:'qa-export/balance-lab'},
  trials:{type:'string',default:'20'},seed:{type:'string',default:'42'},query:{type:'string'},
  candidates:{type:'string'},evaluation:{type:'string'},path:{type:'string',default:'partial'},matrix:{type:'boolean',default:false},
}});
const command=positionals[0]||'combat',trials=Number(values.trials),seed=Number(values.seed);
if(!Number.isInteger(trials)||trials<1||trials>10000)throw Error('trials must be 1..10000');
if(!Number.isInteger(seed)||seed<0||seed+trials-1>0xffffffff)throw Error('Invalid seed range');
const config=values.config?JSON.parse(fs.readFileSync(values.config,'utf8')):{};
const code=provenance(),read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
function batch(c){const runs=Array.from({length:trials},(_,i)=>simulate({...c,seed:seed+i},{trace:i===0}));return {config:normalizeConfig({...c,seed}),seeds:runs.map(x=>x.config.seed),summary:summarize(runs),runs};}
let experiment;
if(command==='combat'){
  const sets=values.matrix?['shadow','oath','ember'].flatMap(cls=>['guard','deepElite','captain'].map(enemy=>batch({...config,cls,enemy}))):[batch(config)];
  experiment={kind:'combat',parameters:{config,trials,seed,matrix:values.matrix},batches:sets};
}else if(command==='effects')experiment={kind:'effects',catalog:values.query?queryEffects(values.query):effectCatalog()};
else if(command==='economy')experiment={kind:'economy',paths:ECONOMY_PATHS,result:economyExperiment({...config,path:values.path,seed})};
else if(command==='search'){
  const candidates=values.candidates?read(values.candidates):['blood','storm','echo','ward','fire','mercy'].map(affix=>({...config,gear:{weapon:{affix}}}));
  if(!Array.isArray(candidates)||!candidates.length||candidates.length>200)throw Error('Expected 1..200 candidate configs');
  const evaluation=values.evaluation?read(values.evaluation):{weights:{winRate:100,ttk:-1,survival:.05},minimumWinRate:0};
  const ranked=candidates.map(c=>{
    const result=batch(c),s=result.summary,w=evaluation.byClass?.[result.config.cls]||evaluation.weights;
    if(!w||!Object.values(w).every(Number.isFinite))throw Error('Finite evaluation weights required');
    const score=(w.winRate||0)*s.winRate+(w.ttk||0)*(s.ttk.median??result.config.duration)+(w.survival||0)*s.meanRemainingHP;
    return {candidate:c,score,eligible:s.winRate>=(evaluation.minimumWinRate||0),result};
  }).sort((a,b)=>Number(b.eligible)-Number(a.eligible)||b.score-a.score);
  experiment={kind:'candidate-search',parameters:{seed,trials,evaluation},ranked,bestCandidate:ranked.find(x=>x.eligible)?.candidate||null,
    diversity:{uniqueCandidates:new Set(candidates.map(c=>JSON.stringify(c))).size,eligibleCandidates:ranked.filter(c=>c.eligible).length},
    limits:['Grid search compares common seed ranges; candidates only, no production rule writes',
      'Default objective is an example, configure per-class weights and scenarios rather than forcing equal DPS']};
}else throw Error('Commands: combat | effects | economy | search');
const result={schema:1,createdAtUTC:new Date().toISOString(),code,experiment};
const out=path.resolve(values.output);fs.mkdirSync(out,{recursive:true});
const data=JSON.stringify(result,null,2)+'\n';fs.writeFileSync(path.join(out,'result.json'),data);
const rows=experiment.batches||experiment.ranked?.map(r=>r.result)||[];
const report=['# Ashen Balance Lab',`Code commit: ${code.headCommit}`,`Content SHA256: ${code.contentSHA256}`,`Kind: ${experiment.kind}`,`JSON SHA256: ${sha(data)}`,''];
for(const r of rows)report.push(`${r.config.cls}/${r.config.enemy}/${r.config.strategy}: ${r.summary.count} runs, win ${r.summary.winRate}, TTK median ${r.summary.ttk.median}, p90 ${r.summary.ttk.p90}, mean received ${r.summary.meanDamageReceived.toFixed(2)}`);
if(experiment.result)report.push(`Economy ${experiment.result.path}: gold delta ${experiment.result.metrics.goldDelta}, raw XP ${experiment.result.metrics.rawXP}, failed actions ${experiment.result.metrics.failedActions}`);
report.push('','Limits:',...(experiment.limits||experiment.result?.limits||rows[0]?.runs[0]?.limits||experiment.catalog?.limits||[]).map(x=>'- '+x));
fs.writeFileSync(path.join(out,'REPORT.md'),report.join('\n')+'\n');
if(experiment.bestCandidate)fs.writeFileSync(path.join(out,'candidate.json'),JSON.stringify(experiment.bestCandidate,null,2)+'\n');
console.log(report.join('\n'));
