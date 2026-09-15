// Testing is a session capability, not a character attribute or a normal-save flag.
export const STORY_TEST_SAVE_V25='ashen-vow-rpg-v10-story-test-v25';
export const STORY_TEST_FORMAT_V25='ashen-vow-story-test-v25';
export const isStoryTestV25=g=>g?.storyTestModeV25===true;
export const storyTestChapterSaveKeyV26=chapter=>[6,7,8].includes(Number(chapter))?STORY_TEST_SAVE_V25+'-chapter'+Number(chapter):null;
export const isStoryTestSaveKeyV26=key=>key===STORY_TEST_SAVE_V25||[6,7,8].some(ch=>key===storyTestChapterSaveKeyV26(ch));

export function enableStoryTestV25(g,stats,key=STORY_TEST_SAVE_V25){
 if(!isStoryTestSaveKeyV26(key))throw Error('请选择有效的剧情测试存档。');
 g.storyTestModeV25=true;
 g.storyTestSaveKeyV26=key;
 g.p.hp=stats(g.p).hp;
 for(const p of Object.values(g.mercenaryState?.().roster||{})){
  p.hp=stats(p).hp;p.downed=false;
 }
 g.events=g.events.filter(e=>e.type!=='death');
 return g;
}

export function storyTestSaveTextV25(g,pretty=false){
 const snapshot=g.snapshot();
 return JSON.stringify(isStoryTestV25(g)?{format:STORY_TEST_FORMAT_V25,save:snapshot}:snapshot,null,pretty?2:undefined);
}

export function parseStoryTestSaveV25(text,parseSave,testing=false){
 if(typeof text!=='string'||text.length>2000000)throw Error('存档过大或内容为空。');
 const data=JSON.parse(text);
 if(data?.format===STORY_TEST_FORMAT_V25){
  if(!testing)throw Error('这是剧情测试存档。请先打开“剧情测试 · 免伤”，再导入。');
  return parseSave(JSON.stringify(data.save));
 }
 // A normal save can be copied into testing; the original bytes stay untouched.
 return parseSave(text);
}
