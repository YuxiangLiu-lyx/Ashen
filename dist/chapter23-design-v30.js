// Complete first-three-chapter inventory, including optional rooms and cutaways.
// QA independently derives this set from the registered maps and staging, so a
// missing entry cannot silently remove a map from both implementation and tests.
export const CHAPTER_ONE_MAPS_V30=Object.freeze(['hall','warehouse','road','town','chapel','alley','canal','grove','guestroom','millpath','echo','workshop']);
export const CHAPTER_TWO_MAPS_V30=Object.freeze(['post','inn','bridge','manor','spillway','exile','chamber','bridgecellar','wellcrypt']);
export const CHAPTER_THREE_MAPS_V30=Object.freeze(['hellGate','hellApproach','hellQuarry','hellSluice','hellWall','hellCamp','hellGrotto','hellWorkshop','hellMine','hellFerry','hellPass','hellArena','hellTomb','hellRift']);
export const CHAPTER23_MAPS_V30=Object.freeze([...CHAPTER_TWO_MAPS_V30,...CHAPTER_THREE_MAPS_V30]);
const second=new Set(CHAPTER_TWO_MAPS_V30),third=new Set(CHAPTER_THREE_MAPS_V30);
export const chapterTwoV30=id=>second.has(id);
export const chapterThreeV30=id=>third.has(id);
export const chapter23V30=id=>second.has(id)||third.has(id);
const first=new Set(CHAPTER_ONE_MAPS_V30);
export const chapterOneV30=id=>first.has(id);
export const CHAPTER123_MAPS_V30=Object.freeze([...CHAPTER_ONE_MAPS_V30,...CHAPTER23_MAPS_V30]);
export const chapter123V30=id=>first.has(id)||second.has(id)||third.has(id);
const route=(width,points)=>({width,points});
// Worn ground follows the existing gates and crossing apertures. These are paint,
// never navigation authority, new barriers, spawn positions or progression gates.
export const CHAPTER_TWO_PATHS_V30={
 post:[route(174,[[800,400],[800,565],[1070,640],[1430,650]]),route(105,[[230,580],[500,570],[800,565]])],
 bridge:[route(142,[[170,600],[420,600],[685,570],[800,570],[960,645],[1430,650]]),route(88,[[960,645],[1020,820],[1220,820]]),route(82,[[800,570],[865,435],[1020,420],[1300,445]])],
 manor:[route(148,[[170,720],[390,740],[760,655],[1000,600],[1160,545]]),route(105,[[390,740],[280,815],[280,935]]),route(86,[[760,655],[835,510],[900,485]])],
 spillway:[route(126,[[170,700],[370,725],[565,580],[725,565],[930,605],[1170,615],[1430,620]]),route(84,[[930,605],[900,760],[1200,835]])],
 exile:[route(124,[[230,700],[565,675],[830,570],[1090,605],[1320,750]])]
};
// Palette and focal surfaces are authored per place, rather than recolouring enemies.
export const CHAPTER_THREE_PALETTES_V30={
 hellGate:{base:'#46484a',lane:'#8b887e',light:'#d2c19a'},
 hellApproach:{base:'#51453f',lane:'#a39883',light:'#d8b582'},
 hellQuarry:{base:'#464c4e',lane:'#93978b',light:'#c7c6a0'},
 hellSluice:{base:'#394c4b',lane:'#859791',light:'#a7d1c7'},
 hellWall:{base:'#494750',lane:'#93908d',light:'#c6bdd1'},
 hellCamp:{base:'#514b43',lane:'#a39a82',light:'#ecc389'},
 hellGrotto:{base:'#3e5254',lane:'#a0b2ab',light:'#99d9dd'},
 hellWorkshop:{base:'#514843',lane:'#a29582',light:'#e8ac71'},
 hellMine:{base:'#3f454b',lane:'#8d979a',light:'#acd0ce'},
 hellFerry:{base:'#394c53',lane:'#869d9e',light:'#b4cbd0'},
 hellPass:{base:'#57483f',lane:'#a89881',light:'#e9b47e'},
 hellArena:{base:'#4f4846',lane:'#a39a87',light:'#dfb28f'},
 hellTomb:{base:'#44494d',lane:'#959e98',light:'#b9d0c8'},
 hellRift:{base:'#494752',lane:'#9993a6',light:'#c9b9de'}
};
export const BRIDGE_WATER_ANCHOR_V30=Object.freeze({interactX:1040,interactY:495});
// The old notice sat behind the south shop roof. Put the board beside the street,
// outside the existing building footprint; this does not create/remove solids.
export const TOWN_NOTICE_ANCHOR_V30=Object.freeze({x:990,y:840});
export function repairChapter23AnchorsV30(g){
 // Coordinate-only migration, including already visited maps in an old save.
 // Claims, used/broken flags, and the player's location are never reset.
 const p=g.states?.bridge?.props.find(p=>p.id==='v9-bridge-water');
 if(p)Object.assign(p,BRIDGE_WATER_ANCHOR_V30);
 const notice=g.states?.town?.props?.find(p=>p.id==='townbook');
 if(notice)Object.assign(notice,TOWN_NOTICE_ANCHOR_V30);
}

// Existing painted contact/attack frames, with a recovery phase instead of holding
// the full strike for the entire attack. No combat clock or hit timing changes.
export function hellMonsterFrameV30(a){
 if(a.wind>0)return 0;
 if(a.attackAnim>0)return a.attackAnim>.12?3:0;
 if(!a.moving)return 0;
 const stride=a.type==='hellHound'?24:30;
 return [1,1,0,2,2,0][Math.floor((a.walkDistance||0)/stride)%6];
}
