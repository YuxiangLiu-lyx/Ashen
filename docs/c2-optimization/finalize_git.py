"""Record a GitHub main save only after checking the actual remote SHA."""
import subprocess,json,datetime,hashlib
from pathlib import Path
run=lambda args:subprocess.check_output(args,text=True).strip()
sha=run(['git','rev-parse','HEAD']);remote=run(['git','ls-remote','origin','refs/heads/main']).split()[0];assert sha==remote
p=Path('source/CURRENT_STATE.json');s=json.loads(p.read_text());s['runtime_source_commit']=sha;s['checked_at_utc']=datetime.datetime.now(datetime.timezone.utc).isoformat();s['c2_optimization_20261016'].update(status='technical_verification_complete_default_build_updated_github_main_verified',implementation_commit=sha,git_receipt='docs/c2-optimization/GIT_SAVE.json')
p.write_text(json.dumps(s,ensure_ascii=False,indent=2)+'\n')
receipt={'repository':'https://github.com/YuxiangLiu-lyx/Ashen','branch':'main','implementation_commit':sha,'remote_main_verified':remote,'checked_at_utc':s['checked_at_utc'],'scope':'Second-chapter 0.5, first-chapter endurance 1.6, complete source and byte-verified evidence; receipt closeout may follow as a documentation-only commit.','default_entry':'qa-export/release-build/Ashen-V28.1-Play.html','old_build':'qa-export/release-build-before-c2-optimization-20261016','website_published':False,'human_status':'pending'}
Path('docs/c2-optimization/GIT_SAVE.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
p=Path('.codex/progress.md');p.write_text('2026-10-16本轮：第二章0.5自然对白、任务交接与寄卖格子；第一章普通怪HP+50%、精英/Boss+150%至2.5倍。技术验收、三职业正常UI、默认离线/HTTP/手机与5174通过；实现'+sha[:7]+'已推送GitHub main并ls-remote核验。真人文风/难度/节奏待验，旧0.6人工任务独立；未发布网站。详见docs/c2-optimization/ACCEPTANCE.md。\n\n'+p.read_text())
print(json.dumps(receipt,ensure_ascii=False))
