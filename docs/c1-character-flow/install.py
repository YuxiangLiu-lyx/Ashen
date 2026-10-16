import json,shutil
from pathlib import Path
R=Path(__file__).resolve().parents[2];script=json.loads((R/'docs/c1-character-flow/SCRIPT.json').read_text())
entries=[{'key':e['key'],'static':e['static'],'rows':e['after']}for e in script['entries']]
(R/'dist/chapter-one-conversations-data.js').write_text('// Adopted R01 1.5. Full before/after and editorial review: docs/c1-character-flow/SCRIPT.json.\nexport const C1_CONVERSATIONS='+json.dumps(entries,ensure_ascii=False,indent=1)+';\n')
p=R/'dist/core-v14.js';s=p.read_text();s="import {installC1Conversations} from './chapter-one-conversations.js';\n"+s;s=s.replace('installEncounterRestraint(RPG);','installEncounterRestraint(RPG);\ninstallC1Conversations(RPG,{MAPS,QUESTS,DIALOGUES});');p.write_text(s)
p=R/'dist/chapter-one-trial-runtime.js';s=p.read_text();s="import {sortQuestOptions} from './quest-service-v14.js';\n"+s;s=s.replace('  return rows;\n };\n P.choose=', '  return sortQuestOptions(this,id,rows);\n };\n P.choose=');p.write_text(s)
p=R/'dist/chapter-one-preparation-ui.js';s=p.read_text().replace('罗萨','商人').replace("shop?'c1Artisans':'c1Loom',0","shop?'c1Merchant':'c1Loom',shop?1:0").replace('商人，身穿工作围裙的女性商人','商人，栗色长发、绿色旅行裙的女性').replace('药水随时有货。挑中哪一件，再看详细用途。','药水和旅途用得上的小物。点选货格查看详情。');p.write_text(s)
p=R/'dist/chapter-one-natural-art.js';s=p.read_text().replace(" if(name==='c1Scenery')cells=regions;"," if(name==='c1Merchant')cells=[[0,0,600,data.height],[610,0,data.width-610,data.height]];\n else if(name==='c1Scenery')cells=regions;")
s=s.replace("export function c1LocalPortrait(bank,name){const p=name==='罗萨'?{sheet:'c1Artisans',index:0}:","export function c1LocalPortrait(bank,name){if(['商人','罗萨'].includes(name)&&bank.frame('c1Merchant',1))return bank.cropped('c1Merchant',1);const p=name==='罗萨'?{sheet:'c1Artisans',index:0}:");p.write_text(s)
p=R/'dist/chapter-one-expansion-art.js';s=p.read_text();old="export function drawC1Person(c,a,bank){if(drawC1LocalPerson(c,a,bank))return true;"
new="export function drawC1Person(c,a,bank){if(a.id==='c1rosa'&&bank.frame('c1Merchant',0)){const f=bank.frame('c1Merchant',0);bank.draw(c,'c1Merchant',0,a.x,a.y,82*f.w/f.h,82);return true;}if(drawC1LocalPerson(c,a,bank))return true;"
assert old in s;s=s.replace(old,new);p.write_text(s)
p=R/'dist/game-v14.js';s=p.read_text().replace("bank.load('c1Artisans'","bank.load('c1Merchant','assets/c1-character-flow/merchant.png',2,1,false),bank.load('c1Artisans'",1);p.write_text(s)
assets=R/'dist/assets/c1-character-flow';assets.mkdir(exist_ok=True)
shutil.copy2('/Users/liuyuxiang/.codex/generated_images/01a13faf-f5e7-7260-a5e0-23613f6f456e/exec-16575436-0882-4f06-b78d-184aaf9b8a5d.png',assets/'merchant.png')
