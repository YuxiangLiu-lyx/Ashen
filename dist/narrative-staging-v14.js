/** Existing Cinematic consumes map, actors, initiallyHidden, beats, outro directly.
 * metadata camera / props / notes need no runtime extension; they specify art placement.
 */
export const NARRATIVE_STAGING_V9={
  darkCommissionV9:{
    map:'hall',
    actors:{sister:[1180,635],clerk:[1050,735]},
    beats:[
      {line:0,moves:[['clerk',1080,665,.9]],cue:'paper'},
      {line:4,moves:[['sister',1150,660,.45]]},
      {line:7,moves:[['clerk',1060,660,.35]]}
    ],
    notes:'独立会馆切镜，只生成薇蕾娜与鲁恩；不要继承游戏中的圣女伙伴，也不要转移 g.map。白纸回执留在旧委托桌，不画魔力反应或爱情符号。摄像机沿用可见演员均值聚焦。'
  },
  darkExileV9:{
    map:'hall',
    actors:{sister:[1180,635],clerk:[1080,735]},
    beats:[
      {line:0,moves:[['clerk',1080,660,.75]],cue:'paper'},
      {line:4,moves:[['sister',1135,665,.45]]},
      {line:8,moves:[['sister',1150,640,.35]]},
      {line:10,moves:[['clerk',1030,735,.55],['clerk',900,780,.9,.55]]}
    ],
    notes:'第二幕灯色比首幕冷，仍能看清纸与两人。最后鲁恩离开镜头，薇蕾娜留在桌边；不把远方安全情况画在纸上，图只到界碑。'
  }
};
export function registerNarrativeStagingV9(staging,scenes){
  Object.assign(staging.scenes,NARRATIVE_STAGING_V9);
  for(const id of Object.keys(NARRATIVE_STAGING_V9))scenes.add(id);
}
/** Explicit saved flags + actions preserve next scene and ending rewards on resume.
 * Call BEFORE chapterApply in RPG.apply. Return true when handled.
 * ch2_end action is chained back once darkExileV9 completes.
 */
export function narrativeApplyV9(g, action){
  if(action==='ch2_relay'&&g.chapter===6&&!g.flags.darkCommissionV9){
    g.flags.relayRead=true;
    g.flags.darkCommissionV9=true;
    g.beginScene('darkCommissionV9','v9_dark_commission_done');
    return true;
  }
  if(action==='v9_dark_commission_done'){
    if(g.chapter===6)g.beginScene('ch2Terms','ch2_terms');
    return true;
  }
  if(action==='ch2_end'&&g.chapter===11&&!g.flags.complete&&!g.flags.darkExileV9){
    g.flags.darkExileV9=true;
    g.beginScene('darkExileV9','ch2_end');
    return true;
  }
  return false;
}
export const NARRATIVE_SCENE_LABELS_V9={darkCommissionV9:'与此同时 · 会馆议事间',darkExileV9:'稍后 · 会馆议事间'};

// Apply these to the existing scene specs after the V8 chapter staging is installed.
// No line insertion or removal: every old timed line stays the same.
export function adjustExistingNarrativeStagingV9(staging){if(staging.scenes.ch2Arrival)staging.scenes.ch2Arrival.actors.roadElder=[580,630];
  const before=staging.scenes.ch2TargetBefore;
  if(before){
    before.actors={hester:[1100,620],victim1:[975,675],victim2:[890,700],guard1:[790,735]};
    before.beats=[{line:2,moves:[['victim2',930,700,.4],['guard1',875,745,.55]]}];
    before.notes='仅玩家视角。victim1 为女税户，victim2 为扶她的成年男性家属；CG 的面粉与粮袋匹配对白。line 2 家属靠近，护卫再逼近，不演色情或伤口特写。';
  }
  const after=staging.scenes.ch2TargetAfter;
  if(after){
    after.actors={hester:[1100,620],guard1:[1200,680],victim1:[980,660],victim2:[920,700]};
    after.beats=[{line:2,moves:[['guard1',1360,840,1.1],['victim1',935,690,.5],['victim2',890,710,.5]],cue:'tray'},{line:4,moves:[['guard1',1430,900,.7]]}];
    after.notes='报信兵退出，家属陪女税户退向长凳。保留托盘的现有 cue，勿重复播放首幕CG。';
  }
}
