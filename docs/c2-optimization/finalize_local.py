"""Record completed local checks, without claiming an unverified remote push."""
import json,datetime
from pathlib import Path
P=Path('docs/c2-optimization')
def read(p):return json.loads(Path(p).read_text())
def write(p,x):Path(p).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
normal=read(P/'NORMAL_EQUIVALENCE.json');assert normal['passed'] and len(normal['runs'])==6
assert read(P/'INTEGRATION.json')['exit_code']==0
assert read(P/'package/WEB_QA.json')['passed']
assert read(P/'LOCAL_SERVER.json')['status']=='passed'
assert read(P/'DEFAULT_BUILD.json')['status']=='verified-default'
s=read('source/CURRENT_STATE.json');s['checked_at_utc']=datetime.datetime.now(datetime.timezone.utc).isoformat();s['known_limits']='R02 0.5 and R01 1.6 technically verified. Human voice, first-chapter endurance difficulty, pacing and fun pending; historical 0.6 gate independent. No website deployed.'
s['browser_qa_status']='Current full integration plus second-chapter 64 scenes / 310 pages at three viewports, three-class normal UI routes in both chapters, service transactions, maps, offline/HTTP/mobile build and local 5174 byte checks passed. Ember C1 proof joins the original normal new-game run to a normal-UI import of its unchanged checkpoint after a harness crafting-material assumption.'
s['c2_optimization_20261016'].update(status='technical_verification_complete_local_build_promoted_git_pending',default_build='docs/c2-optimization/DEFAULT_BUILD.json',normal_input='docs/c2-optimization/NORMAL_EQUIVALENCE.json',map_quality='docs/c2-optimization/MAP_QUALITY.json',experience=['docs/c2-optimization/EXPERIENCE_R01.json','docs/c2-optimization/EXPERIENCE_R02.json'],human_status='pending',human_observation='docs/c2-optimization/HUMAN_OBSERVATION.md',website_published=False)
s['local_launch_recovery']['current_offline_entry']='qa-export/release-build/Ashen-V28.1-Play.html'
write('source/CURRENT_STATE.json',s)
p=P/'ACCEPTANCE.md';t=p.read_text().replace('当前为验证中，最终检查、包和Git回执另在本文追加；以下历史原件保持。','本轮技术验收及默认本地包已完成；Git回执另附GIT_SAVE.json，真人体验待验。以下历史原件保持。')
t+='\n最终验收：67项Harness、225项核心（含三职业18条经济路线）、完整integration和本轮专项通过。第二章64场310页三视口、八张可玩图73条移动与内室画面、第一章当前画面/碰撞及22图移动回归已分别审查。43场七维编辑审查、R01战斗局部和R02整章技术报告已挂接；真人待验未被技术结果替代。\n\n三职业第一章及第二章正常UI流程均有成功证据；第一章烬术士由原标题起跑至试炼回报的记录，与未经修改的检查点经正常导入、合法补材料/配药/购买武器后继续通章的记录共同验证。失败起因、死亡档和失败脚本输出全部保留，NORMAL_EQUIVALENCE逐一核对运行模块。\n\n新离线/HTTP/手机包已提升至qa-export/release-build/Ashen-V28.1-Play.html，原包完整保存在qa-export/release-build-before-c2-optimization-20261016。5174当前245个脚本、7个样式及商人原图逐字节相符。没有发布网站。大型JSON的完整字节、路径和哈希保存于archives/c2-optimization-evidence/manifest.json，可用RESTORE_EVIDENCE.py恢复；展开原件仍留本地。\n'
p.write_text(t)
p=Path('docs/c1-endurance/ACCEPTANCE.md');p.write_text(p.read_text()+'\n最终：影刃、誓卫的完整正常新游戏流程到post/phase6；烬术士原标题至试炼回报、正常导入未修改检查点后至post/phase6共同通过。所有步骤使用实际材料、金币、休息与正常键鼠，生产模块哈希已核对。增加生命、旧档迁移和三职业18条经济路线通过最终集成；默认离线包已更新，真人难度和时长仍待观察。\n')
print('Local acceptance recorded; Git push remains separately verified.')
