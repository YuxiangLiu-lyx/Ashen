// V28.1 visual contracts. All positions and sort depths are ground/foot pivots.
export const PRESENTATION_VERSION='28.1';
export const HUMAN_HEIGHT=Object.freeze({hero:84,saint:80,chengli:81,npc:82});
export const CREATURE_HEIGHT=Object.freeze({rat:38,bat:48,wolf:62,guard:82,captain:105,hellHound:65,hellSoul:83,hellGuard:88,hellJailer:132,deepHound:68,deepSoul:84,deepGuard:90,deepElite:98,ironScuttler:111,furnaceSentinel:129,odric:121,martha:114,severin:130,bloodDemon:166});
export const BOSS_ART_V281=Object.freeze({ch5Gatekeeper:'furnaceSentinel',v25PursuitKnight:'severin',v25FinalJudge:'severin',v25TrialMaster:'odric',v25BrokerChief:'severin',v25GrainChief:'captain',v25BridgeMarshal:'captain'});
export function nativeMonsterTypeV281(a,aliases={}){
 const t=String(a?.type||'guard');
 if(BOSS_ART_V281[t])return BOSS_ART_V281[t];
 if(/^trialBoss[1-5]$/.test(t))return ['ironScuttler','furnaceSentinel','odric','martha','severin'][Number(t.slice(-1))-1];
 // A wolf stays a wolf: V28's player-level-based visual replacement is not used.
 return aliases[t]||t;
}
export function actorHeightV281(a={},kind='npc',aliases={}){
 if(a.type){const t=nativeMonsterTypeV281(a,aliases),base=CREATURE_HEIGHT[t]||88;return Math.round(base*(a.elite&&!a.isBoss&&!['captain','deepElite'].includes(t)?1.12:1));}
 if(a.cls==='saint'||a.id==='saint')return HUMAN_HEIGHT.saint;
 if(['chengli','ch8Chengli','v25Chengli'].includes(a.id))return HUMAN_HEIGHT.chengli;
 if(kind==='hero'||a.id==='hero'||a.cls)return HUMAN_HEIGHT.hero;
 return Number.isFinite(a.size)?Math.max(76,Math.min(86,a.size)):HUMAN_HEIGHT.npc;
}
export function footRadiusV281(a={},aliases={}){
 if(a.type){const t=nativeMonsterTypeV281(a,aliases);if(t==='rat'||t==='bat')return 10;if(t==='bloodDemon')return 25;if(a.isBoss||['hellJailer','ironScuttler','furnaceSentinel','severin'].includes(t))return 20;if(t==='wolf'||/Hound$/.test(t))return 15;}
 return 12;
}
export function walkPhaseV281(a,stride=76,frames=4){
 const distance=Math.max(0,Number(a?.walkDistance??((a?.anim||0)*18))||0);
 return Math.floor(distance/(stride/frames))%frames;
}
export function movingPoseV281(a){return !!a?.moving&&!a.fall&&!a.patientSurface&&!a.geometryTransferV26&&!['sleep','sleep-bed','lying','carried'].includes(a.pose);}
export function chapterEightSceneV281(id='',map=''){
 return /^ch8/.test(String(map))||/^(?:v25C8|c8v26|v26C8|ch8)/i.test(String(id));
}
export function chapterEightArtV281(id=''){return /(?:^|[-_/])c8(?:[-_/]|$)/i.test(String(id))||/^v25-c8-/.test(String(id));}
