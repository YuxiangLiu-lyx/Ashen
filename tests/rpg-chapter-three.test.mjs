import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {RPG,stats,MAPS,needXP} from '../dist/core-v14.js';import {parseSave} from '../dist/save-transfer-v14.js';
import {CH3_GEAR} from '../dist/chapter3-runtime-v14.js';import {hellFacilityHTML} from '../dist/chapter3-ui-v14.js';
const game=(cls='shadow')=>{const s=JSON.parse(fs.readFileSync(`docs/rpg-experience/c2/natural-005/${cls}/10-chapter-two-end-save.json`));const g=new RPG(cls,s,()=>.44);g.chapter=17;g.ch3.stage='recovered';g.flags.ch3HeroRecovered=true;g.enter('hellCamp');g.pending=null;g.active=true;return g;};
const finish=g=>{for(let i=0;g.pending&&i<30;i++)g.finishScene();g.active=true;};
const near=(g,id)=>{const p=g.npcs.find(p=>p.id===id)||g.props.find(p=>p.id===id);g.relocate(p.interactX??p.x,(p.interactY??p.y)+(p.interactY?0:55));};
const restore=g=>new RPG(g.p.cls,parseSave(JSON.stringify(g.snapshot())),()=>.44);

test('XP earned after fatal damage cannot heal a dead actor; living level-up recovery remains',()=>{
 for(const alive of [false,true]){const g=game();g.p.hp=alive?1:0;g.active=alive;const level=g.p.level;g.p.xp=needXP(level)-1;g.gainXP(1);assert.equal(g.p.level,level+1);assert.equal(g.p.hp,alive?stats(g.p).hp:0);assert.equal(restore(g).p.hp,g.p.hp);}
});

test('class crafting improves actual stats, keeps costs, and queues a full-bag unique without losing it',()=>{
 for(const [cls,id]of [['shadow','ch3-ashfang'],['oath','ch3-burden'],['ember','ch3-wickstaff']]){const g=game(cls);g.enter('hellWorkshop');g.pending=null;near(g,'mechanist');g.p.gold=100;g.p.items.cinderIron=5;g.p.items.blackGlass=3;const before=stats(g.p).atk;assert.ok(g.hellAction('craft','forge-class-weapon'));assert.equal(g.p.gold,10);assert.equal(g.p.items.cinderIron,0);assert.equal(g.p.items.blackGlass,0);assert.ok(g.equip(id));assert.ok(stats(g.p).atk>before);assert.equal(g.hellAction('craft','forge-class-weapon'),false);const r=restore(g);assert.equal(r.p.gear.weapon.id,id);assert.equal(r.ch3.crafts['forge-class-weapon'],1);}
 const g=game();g.enter('hellWorkshop');g.pending=null;near(g,'mechanist');g.p.gold=100;g.p.items.cinderIron=5;g.p.items.blackGlass=3;g.p.bag=Array.from({length:60},(_,i)=>({...g.p.gear.weapon,id:'full'+i}));assert.ok(g.hellAction('craft','forge-class-weapon'));assert.equal(g.pendingRewards[0].id,'ch3-ashfang');assert.equal(g.p.gold,10);assert.equal(g.hellAction('craft','forge-class-weapon'),false);
});
test('legacy forged gear migrates upward across shared and frozen actors without duplication or healing',()=>{
 const g=game();g.p.bag.push({...CH3_GEAR['ch3-ashfang'],atk:8,attrs:{dex:2}});g.p.hp=10;const r=restore(g);const a=r.p.bag.filter(i=>i.id==='ch3-ashfang');assert.equal(a.length,1);assert.equal(a[0].atk,30);assert.equal(a[0].attrs.dex,4);assert.equal(r.p.hp,10);assert.equal(r.p.gold,g.p.gold);
 const saved=JSON.parse(fs.readFileSync('docs/rpg-experience/c3/normal-007/shadow/07-saint-prepared-save.json'));saved.ch3.frozenHero.bag.push({...CH3_GEAR['ch3-ashfang'],atk:8,attrs:{dex:2}});const f=new RPG('saint',parseSave(JSON.stringify(saved)));assert.equal(f.ch3.frozenHero.bag.find(i=>i.id==='ch3-ashfang').atk,30);assert.equal(f.p.cls,'saint');assert.equal(f.p.hp,saved.p.hp);assert.equal(f.ch3.frozenHero.hp,saved.ch3.frozenHero.hp);
});
test('herb service requires the completed two-site task, real doctor and one pending payment',()=>{
 const g=game();near(g,'doctor');g.p.gold=100;g.p.items.emberHerb=4;assert.equal(g.choose('c3:brewMedicine'),false);g.quests.v12WarmHerbs='done';assert.ok(g.choose('c3:brewMedicine'));assert.equal(g.p.gold,100);const n=g.p.items.hpMedium||0,r=restore(g);finish(r);assert.equal(r.p.gold,92);assert.equal(r.p.items.emberHerb,2);assert.equal(r.p.items.hpMedium,n+1);assert.equal(r.apply('c3:brewMedicine'),false);assert.equal(r.p.gold,92);r.enter('hellWorkshop');r.pending=null;assert.equal(r.choose('c3:brewMedicine'),false);r.enter('hellCamp');r.pending=null;near(r,'doctor');r.bullets.push({friendly:false});assert.equal(r.choose('c3:brewMedicine'),false);
});
test('safe doctor rest is correctly priced, full resources are not charged, and old medical materials stay distinct',()=>{
 const g=game();near(g,'doctor');g.p.hp=stats(g.p).hp;g.p.mp=stats(g.p).mp;const gold=g.p.gold;assert.equal(g.choose('ch3:rest'),false);assert.equal(g.p.gold,gold);g.p.hp=1;g.choose('ch3:rest');assert.equal(g.p.gold,gold-15);assert.equal(g.p.hp,stats(g.p).hp);g.p.hp=1;g.ch3.stage='medicine';g.choose('ch3:rest');finish(g);assert.equal(g.p.gold,gold-15);assert.ok(g.p.hp>=stats(g.p).hp*.7);g.relocate(1400,900);assert.equal(g.choose('ch3:rest'),false);
});
test('required deferred rescue survives save and does not overwrite pending or replay twice',()=>{
 const g=game();g.map='hellWall';g.ensureMap(g.map);g.ch3.stage='wound';g.pending={id:'ch3ChainTrack',then:null};const before=structuredClone(g.pending);g.beginScene('ch3Wound','ch3:wound');assert.deepEqual(g.pending,before);assert.deepEqual(g.ch3.experienceScenes,['ch3Wound']);assert.match(g.canDoor(MAPS.hellWall.doors[0]),/伤者/);g.beginScene('ch3Wound','ch3:wound');assert.equal(g.ch3.experienceScenes.length,1);g.pending=null;const r=restore(g);r.states.hellWall.enemies=[];r.bullets=[{friendly:false,life:1,x:50,y:50,vx:0,vy:0}];r.active=true;r.update(.001,{});assert.equal(r.pending,null);r.bullets=[];r.update(.001,{});assert.equal(r.pending.id,'ch3Wound');assert.deepEqual(r.ch3.experienceScenes,[]);assert.ok(r.canDoor(MAPS.hellWall.doors[0])!==undefined);const bad=r.snapshot();bad.ch3.experienceScenes=['arbitrary-scene'];assert.throws(()=>parseSave(JSON.stringify(bad)),/延后事件/);
});
test('two cave layouts migrate locations once while retaining death, HP, used props and original exits',()=>{
 const g=game();g.map='hellMine';g.ensureMap(g.map);const s=g.snapshot(),st=s.states.hellMine,e=st.enemies[0];delete st.c3Layout;e.hp=17;e.x=850;e.y=650;st.enemies[1].dead=true;st.enemies[1].hp=0;st.props.find(p=>p.id==='ch3-machine-spring').used=true;const r=new RPG('shadow',parseSave(JSON.stringify(s)));assert.equal(r.enemies[0].hp,17);assert.ok(r.enemies[1].dead);assert.deepEqual([r.enemies[0].homeX,r.enemies[0].homeY],[430,560]);assert.ok(r.props.find(p=>p.id==='ch3-machine-spring').used);assert.deepEqual(MAPS.hellMine.doors.map(d=>d.to),['hellGrotto','hellWorkshop']);r.enemies[0].x=450;const z=restore(r);assert.equal(z.enemies[0].x,450);
});
test('forge menu shows the actual result and equipped comparison and cannot spend missing materials',()=>{
 const g=game();g.enter('hellWorkshop');g.pending=null;near(g,'mechanist');const html=hellFacilityHTML(g,'forge',{iconHTML:()=>'',miniItemIcon:()=>'',skillDetails:()=>'',escape:String,gearIcon:()=>''});assert.ok(html.includes('攻击 +30'));assert.ok(html.includes('当前武器'));g.p.items.cinderIron=0;const gold=g.p.gold;assert.equal(g.hellAction('craft','forge-class-weapon'),false);assert.equal(g.p.gold,gold);g.enter('hellCamp');assert.equal(g.hellAction('draw','melee'),false);
});
