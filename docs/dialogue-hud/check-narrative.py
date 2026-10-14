import json,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];sys.path.insert(0,str(ROOT/'tools/harness'))
from narrative import audit,task_errors
from common import inventory,fingerprint
record=json.loads((ROOT/'source/tasks/active/dialogue-hud-20261014.json').read_text());report=audit(live=True);assert not report['errors'],report['errors'];errors=task_errors(record);assert not errors,errors
out={'status':'passed','source_fingerprint':fingerprint(inventory()),'attached_scenes':len(record['narrative_reviews']),'live_audit':report,'scope':'Full installed text, source provenance, all 111 exact baseline/current comparisons, seven editorial dimensions and contextual retention notes. No numerical literary score.'}
(ROOT/'docs/dialogue-hud/NARRATIVE_QA.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print('Live audit and all 111 scene reviews passed current task gates.')
