from pathlib import Path
import json,subprocess,sys
sys.path.insert(0,'tools/harness')
from common import inventory,fingerprint,write_json
from task import task_lock,sync_progress,now
p=Path('AGENTS.md');s=p.read_text();s=s.replace('# Ashen Agent 入口\n','# Ashen Agent 入口\n\n2026-10-14最新用户收束：“目前更新完前三章即可”。本轮只交付R01—R03及已有Harness；第四至八章保留审计、原运行与未来方向，不继续实装。前三章技术验收和真人待验见docs/rpg-experience/ACCEPTANCE.md，当前默认试玩入口为qa-export/release-build/Ashen-V28.1-Play.html；旧包保留，未发布网站。\n',1);p.write_text(s)
for f in ['README.md','source/README.md','source/GLOBAL_PROMPT.md','BACKUP_STATUS.md']:
 p=Path(f);s=p.read_text();prefix='2026-10-14当前交付：前三章RPG体验升级（R01—R03），第四至八章按用户最新指令暂缓。战斗成长、地下探索、任务结果、真实设施与安全剧情触发已实施；技术证据及真人待验见'+('../docs/rpg-experience/ACCEPTANCE.md' if f.startswith('source/') else 'docs/rpg-experience/ACCEPTANCE.md')+'。默认离线入口为qa-export/release-build/Ashen-V28.1-Play.html；旧包保存在qa-export/release-build-before-rpg-three-20261014，文件名沿用旧版。GitHub保存与网站发布分开；下面旧记录保留为历史。\n\n'
 s=prefix+s
 if f=='README.md':s=s.replace('当前默认包为2026-10-13的第一章0.9分层任务与通用规则版（源d9913f7，以同目录清单为准）','当前默认包为2026-10-14前三章RPG体验升级版（精确来源及输入哈希以同目录清单为准）')
 p.write_text(s)
p=Path('docs/harness/CHAPTER_03_RPG_EXPERIENCE.md');p.write_text(p.read_text().replace('1.0 / DEV_FROZEN /','1.0 / IMPLEMENTED /',1))
p=Path('docs/harness/NARRATIVE_ARCHITECTURE.md');s=p.read_text().replace('| DEV_FROZEN | rpg-c3-20261014；保留救治与不原谅，洞窟回路、制作与配药、安全触发正在验证 |','| IMPLEMENTED | rpg-c3-20261014；救治与不原谅保持，洞窟回路、制作与配药、安全触发已实施；真人待验 |');p.write_text(s)
p=Path('source/narrative/chapters/R03.json');d=json.loads(p.read_text());d['plan'].update(status='IMPLEMENTED',implementation='三职业正常UI分段原档接续到phase21；技术证据见docs/rpg-experience/c3，真人节奏待验。');write_json(p,d)
for tid in ['rpg-experience-20261014','rpg-delivery-20261014']:
 with task_lock(tid):
  p=Path('source/tasks/active')/(tid+'.json');d=json.loads(p.read_text())
  if tid=='rpg-experience-20261014':
   d.setdefault('original_goal',d['goal']);d.setdefault('original_acceptance',d['acceptance']);d['goal']='按用户最新范围完成前三章RPG体验升级及Harness交付；保留八章审计，第四至八章暂缓';d['acceptance']=['前三章逐章实际改造、正常输入、成长对照、兼容及地图三维证据；可试玩默认包、真人待验和GitHub核验'];d['experience_requirement']['chapters']=['R01','R02','R03']
  d['updated_at_utc']=now();write_json(p,d);sync_progress(d)
sources=json.loads(Path('source/narrative/sources.json').read_text())['sources'];ids=[k for k,r in sources.items() if r.get('path')=='docs/harness/CHAPTER_03_RPG_EXPERIENCE.md'];assert len(ids)==1
subprocess.run(['python3','tools/harness/narrative.py','acknowledge','--source',ids[0],'--note','第三章采用稿只将DEV_FROZEN改为IMPLEMENTED；运行正文及532旧场景未改，实际正常UI及技术证据已保留。'],check=True)
subprocess.run(['python3','tools/harness/narrative.py','index'],check=True)
subprocess.run(['python3','tools/harness/index.py'],check=True)
old=json.loads(Path('docs/rpg-experience/c3/SOURCE_FINAL_VERIFICATION.json').read_text());cur=inventory();diff=sorted(p for p in set(cur)|set(old['files'])if cur.get(p)!=old['files'].get(p))
allowed={'AGENTS.md','source/README.md','source/GLOBAL_PROMPT.md','docs/harness/CHAPTER_03_RPG_EXPERIENCE.md','docs/harness/NARRATIVE_ARCHITECTURE.md','source/narrative/chapters/R03.json','source/narrative/sources.lock.json'}
assert set(diff)<=allowed,diff
write_json(Path('docs/rpg-experience/c3/VERIFICATION_EQUIVALENCE.json'),{'original_fingerprint':old['fingerprint'],'final_fingerprint':fingerprint(cur),'differences':diff,'reason':'仅授权范围、章稿实施状态及入口接续资料；043完整集成后的全部生产代码和测试内容保持。另执行最终完整集成。'})
