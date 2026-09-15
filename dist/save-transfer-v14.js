import {migrateDialogueSaveV26} from './dialogue-save-migration-v26.js';
import {validateSagaSaveV26} from './saga-state-v26.js';
import {validateSagaSaveV25} from './saga-state-v25.js';
import {sagaSavedLevelCapV25} from './saga-stats-v25.js';
import {assertSupportedSavedProgressV23} from './save-protection-v23.js';
import {validateCityMomentsSaveV24} from './city-moments-v24.js';
import {validateArrivalSaveV22} from './world-entry-v22.js';
import {validateRomanceSaveV20} from './romance-runtime-v20.js';
import {validateDiscoverySaveV19} from './discovery-runtime-v19.js';
import {validateSaintStorySaveV18} from './saint-story-v18.js';
import {validateCitySaveV18} from './city-runtime-v18.js';
import {validateChapter5Save} from './chapter5-runtime-v14.js';
import {validateHellExpeditionsSaveV18} from './hell-expeditions-v18.js';
import {validateHellActivitiesSaveV17} from './hell-activities-v17.js';
import {validateSaintBondSaveV17} from './saint-bonds-v17.js';
import {validateHellActivitiesSaveV15} from './hell-activities-v15.js';
import {validateMercenarySave} from './mercenary-v14.js';
import {validMemoryResume} from './memory-runtime-v14.js';
import {validateSystemsSave} from './systems-runtime-v14.js';
import {validatePacingSave} from './pacing-runtime-v14.js';
import {validateV11Save} from './save-v14.js';
import {validateChapter3Save} from './chapter3-save-v14.js';
import {DIALOGUES} from './data-v14.js';
import {StoryFlow} from './story-flow-v14.js';
import {RPG,MAPS,CLASSES,SKILLS,ITEMS} from './core-v14.js';
export function exportSave(game){if(!game.canSave())throw new Error(game.saveBlockReason());return JSON.stringify({format:'ashen-vow-save',exportedAt:new Date().toISOString(),save:game.snapshot()},null,2);}
export function parseSave(text,depth=0){
 if(depth>1)throw new Error('离城前记录不能相互嵌套。');
 if(typeof text!=='string'||text.length>2000000)throw new Error('存档过大或内容为空。');
 const envelope=JSON.parse(text),s=migrateDialogueSaveV26(envelope?.format==='ashen-vow-save'?envelope.save:envelope);
 if(!s||![2,3,4,5,6,7,8,9,10,11,12,13,14,15].includes(s.version)||!CLASSES[s.p?.cls]||!MAPS[s.map])throw new Error('这不是兼容的烬誓存档。');
 assertSupportedSavedProgressV23(s,DIALOGUES);validateSagaSaveV25(s);validateSagaSaveV26(s);
 validateCitySaveV18(s);validateHellActivitiesSaveV17(s);validateHellExpeditionsSaveV18(s);validateSaintBondSaveV17(s);validateSaintStorySaveV18(s);validateRomanceSaveV20(s);validateArrivalSaveV22(s);validateCityMomentsSaveV24(s);validateDiscoverySaveV19(s);validateHellActivitiesSaveV15(s);validateChapter5Save(s);validateMercenarySave(s);validateSystemsSave(s);if(!validMemoryResume(s))throw new Error('回忆检查点不完整。');validateChapter3Save(s);validateV11Save(s);validatePacingSave(s);
 const p=s.p,num=(n,min,max)=>Number.isFinite(n)&&n>=min&&n<=max;
 if(!num(p.level,1,sagaSavedLevelCapV25(s))||!Number.isInteger(p.level)||!num(p.x,0,1600)||!num(p.y,0,1080)||!num(s.chapter,0,40)||!Array.isArray(p.bag)||p.bag.length>60||!p.gear||!p.skills||!p.items||!p.attrs||!Array.isArray(p.bar)||!Array.isArray(p.knownBooks))throw new Error('人物数据不完整。');
 if(s.version>=7&&(!Array.isArray(p.activeSkills)||p.activeSkills.length>5||new Set(p.activeSkills).size!==p.activeSkills.length||p.activeSkills.some(k=>!SKILLS[k]||SKILLS[k].passive||!p.skills[k])))throw new Error('激活技能数据不正确。');
 if(s.beforeDeparture){if(depth||s.beforeDeparture.chapter!==4||s.beforeDeparture.flags?.complete||s.beforeDeparture.beforeDeparture)throw new Error('离城前记录不正确。');s.beforeDeparture=parseSave(JSON.stringify(s.beforeDeparture),depth+1);}
 for(const k of ['hp','mp','xp','gold','ap','sp'])if(!num(p[k],0,10000000))throw new Error('人物数值不正确。');
 for(const k of ['ap','sp'])if(!Number.isInteger(p[k]))throw new Error('成长点数必须为整数。');
 if(!s.flags||typeof s.flags!=='object'||Array.isArray(s.flags))throw new Error('旅程记录不正确。');
 if(s.flags.echoBookOrder&&(!Array.isArray(s.flags.echoBookOrder)||s.flags.echoBookOrder.length!==5||new Set(s.flags.echoBookOrder).size!==5||s.flags.echoBookOrder.some(k=>!['tetherBook','frostBook','sprintBook','cleaveBook','fireboltBook'].includes(k))))throw new Error('刻录筒记录不正确。');
 if(s.flags.resetCrafted&&(typeof s.flags.resetCrafted!=='object'||Array.isArray(s.flags.resetCrafted)||Object.entries(s.flags.resetCrafted).some(([k,n])=>!['attributeReset','skillReset'].includes(k)||![0,1].includes(n))))throw new Error('封药管记录不正确。');
 if(p.skillSpent&&(typeof p.skillSpent!=='object'||Object.entries(p.skillSpent).some(([k,n])=>!SKILLS[k]||!Number.isInteger(n)||n<0||n>SKILLS[k].rank*SKILLS[k].cost)))throw new Error('技能投入记录不正确。');
 if(s.pending?.sceneOrigin)for(const key of ['hero','saint']){const at=s.pending.sceneOrigin[key];if(!Array.isArray(at)||at.length!==2||!num(at[0],0,1600)||!num(at[1],0,1080))throw new Error('离城演出位置不正确。');}
 for(const [k,n] of Object.entries(p.skills))if(!SKILLS[k]||!Number.isInteger(n)||!num(n,0,SKILLS[k].rank))throw new Error('技能数据不正确。');
 for(const [k,n] of Object.entries(p.items))if(!ITEMS[k]||!Number.isInteger(n)||!num(n,0,100000))throw new Error('物品数据不正确。');
 for(const k of ['str','dex','vit','wis'])if(!Number.isInteger(p.attrs[k])||!num(p.attrs[k],0,1000))throw new Error('属性数据不正确。');
 if(s.companion&&(!num(s.companion.x,0,1600)||!num(s.companion.y,0,1080)||!num(s.companion.angle,-100,100)||typeof s.companion.visible!=='boolean'))throw new Error('同行者站位不正确。');
 if(s.pendingRewards&&(!Array.isArray(s.pendingRewards)||s.pendingRewards.length>32))throw new Error('待收物品记录不正确。');
 for(const gear of [...p.bag,...Object.values(p.gear).filter(Boolean),...(s.pendingRewards||[])])if(typeof gear.name!=='string'||gear.name.length>100||typeof gear.id!=='string'||!num(gear.atk,0,10000)||!num(gear.hp,0,100000))throw new Error('装备数据不正确。');
 if(!s.states||typeof s.states!=='object'||Object.keys(s.states).some(k=>!MAPS[k]))throw new Error('地图数据不正确。');
 for(const st of Object.values(s.states))if(!Array.isArray(st.enemies)||!Array.isArray(st.props)||st.enemies.length>200||st.props.length>200)throw new Error('地图记录不完整。');
 for(const k of ['angle','anim','attackAnim','invuln','dash','dx','dy','guard','empower','shield','shieldTime','resonance','sprint','combo','comboLife','stamina','emotion'])if(p[k]!==undefined&&!num(p[k],-100000,10000000))throw new Error('动作数据不正确。');
 for(const n of Object.values(p.cd||{}))if(!num(n,0,10000))throw new Error('冷却数据不正确。');
 for(const st of Object.values(s.states))for(const o of [...st.enemies,...st.props]){if(!num(o.x,0,1600)||!num(o.y,0,1080)||typeof o.id!=='string')throw new Error('场景坐标不正确。');if(o.anim!==undefined&&o.anim<0)throw new Error('场景动画不正确。');for(const k of ['angle','anim','hp','maxHP','homeX','homeY','wind','stun','slow','bleed','burn','cd','respawn','roamWait','attackAnim'])if(o[k]!==undefined&&!num(o[k],-100000,10000000))throw new Error('场景动作数据不正确。');}
 if(s.pending){const q=s.pending,lines=q.lines||DIALOGUES[q.id];if(!Array.isArray(lines)||!lines.length||lines.length>200||lines.some(v=>!Array.isArray(v)||v.length!==2||v.some(x=>typeof x!=='string'||x.length>2000)))throw new Error('对白记录不完整。');if(q.line!==undefined&&(!Number.isInteger(q.line)||q.line<0||q.line>=lines.length))throw new Error('对白位置不正确。');if(q.phase&&!['action','dialogue'].includes(q.phase))throw new Error('对白阶段不正确。');if(q.then&&typeof q.then!=='string')throw new Error('剧情记录不正确。');}
 // Construct before replacing the current save: migration and geometry must also succeed.
 const restored=new RPG(p.cls,s);if(restored.pending)new StoryFlow(restored,restored.pending.lines||DIALOGUES[restored.pending.id]);const clean=restored.snapshot();if(!num(clean.p.hp,0,100000)||!num(clean.p.mp,0,100000))throw new Error('存档无法恢复。');return clean;
}
