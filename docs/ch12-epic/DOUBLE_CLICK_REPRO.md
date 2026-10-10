# 连续点击复现

在仓库根目录执行。仅临时Chrome与合成存档，不访问玩家档。第一次跳过内门对白后，第二次紧接着点击不能继续跳过ch2Alarm；chapter仍为7，警报结果待该场完成后执行。

```sh
node --input-type=module - <<'JS'
import assert from 'node:assert/strict';import {browserSession,delay} from './tools/browser_session.mjs';
const b=await browserSession(process.cwd(),`window.__SKIPQA={ready:()=>assetsReady,begin:()=>{g=new RPG('shadow',null,()=>.44);g.chapter=7;g.enter('manor',1110,555);g.flags.targetCutaway=true;g.flags.chapterCardsV17=[1,2,3,4,5,6,7,8];chapterCards.attach(g,{restored:true});g.events=[];g.pending=null;flow=null;cine=null;flowPending=null;SAVE='ashen-skip-qa';g.beginScene('ch2InnerDoor','ch2_inner');showScene();},state:()=>({id:g.pending?.id,chapter:g.chapter})};`);
try{await b.wait('window.__SKIPQA?.ready()',120000);await b.evaluate('__SKIPQA.begin()');await delay(300);const pos=await b.evaluate(`(()=>{const r=document.querySelector('[data-act="skip-scene-v30"]').getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2]})()`);await b.click(...pos);await b.click(...pos);const state=await b.evaluate('__SKIPQA.state()');assert.equal(state.id,'ch2Alarm');assert.equal(state.chapter,7);assert.deepEqual(b.errors,[]);console.log(JSON.stringify({passed:true,doubleClickLeftNextSceneReadable:state}));}finally{await b.close();}
JS
```
