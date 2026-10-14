"""Record the actual visual/editor review; not an automatic aesthetic test."""
import json, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'tools/harness'))
from common import inventory, fingerprint, digest
from map_quality import relevant, changed
PREFIX = 'docs/c1-care-ui/'
def evidence(path):
    return {'path': path, 'sha256': digest(ROOT / path)}
def result(reason, paths):
    return {'status': 'pass', 'reason': reason, 'evidence': [evidence(PREFIX + p) for p in paths]}
notes = [
    ('c1TrialFoyer', 'c1iden', '接待室登记桌、册架和候场长凳用途一致，伊登在桌外面对空地，各门及楼梯间保持宽通路。', '黑短发、胡须、青蓝外衣和钢肩甲与原第0帧对应，半身图头肩比例自然，面部清楚。'),
    ('c1TrialCrypt', 'c1hesha', '机械轴和蓄能槽保持作业用途，赫莎位于西南工具桌外；四个入口均能经回廊接近，没有新遮路物件。', '红褐盘发、暗红衬衣及工具皮围裙与原第8帧对应；双手和腰间工具清楚，裁切边缘没有邻人碎片。'),
    ('c1TrialVault', 'c1venn', '册架、木箱位于封存房，维恩守着楼梯旁登记桌；主廊与侧路保持，守卫岗位用途明确。', '白发白须、赭黄长衣、灰围巾与原第16帧对应；脸部比例符合老人身份，立绘不遮正文。'),
]
maps = []
for mid, npc, scene, character in notes:
    maps.append({
        'id': mid,
        'playability': result('当前实际blocked/clearLine/routeTo/moveActor验证入口到本地NPC，共9条路线且无不可达点；完整集成包含原战斗与走图回归。地图碰撞、NPC位置与24帧世界图保持，本轮只新增独立对话立绘和阅读UI。', ['NAVIGATION.json', f'maps-final-safe/{mid}-collision.png', f'maps-final-safe/{mid}-collision.json', 'final-checks/COMPLETED.json']),
        'scene_credibility': result(scene, [f'maps-final-safe/{mid}.png', f'baseline/{mid}.png']),
        'character_consistency': result(character + ' 已逐张查看实景与原24帧图，脚锚和遮挡沿用原世界图；三视口对白显示正常。真人审美反馈待验。', [f'maps-final-safe/{npc}-dialogue.png', f'baseline/{npc}-dialogue.png', f'browser-final/{npc}-390.png', 'assets/MANIFEST.json', 'browser-final/QA.json']),
    })
maps.append({
    'id': 'hall',
    'playability': result('完整37页委托经真实点击和原动作通过，回看不倒放角色或再次结算。真实离场后的鲁恩行走会面及读档继续通过；家具与碰撞保持。', ['flow-browser/hall-collision.png', 'flow-browser/QA.json', 'browser-final/QA.json']),
    'scene_credibility': result('实际查看炉火、桌架、衣架和两人会面；会馆背景始终可见，闲谈和留饭安排发生在熟悉的生活环境。回看不将演员移回旧位置。', ['flow-browser/hall.png', 'flow-browser/meeting-vilerena.png', 'browser-final/care-390.png']),
    'character_consistency': result('薇蕾娜黑紫长裙原立绘及世界形象保持；诺恩和鲁恩仍用原图，关系修订不改变身份。手机页中说话人、肖像、正文与两按钮均完整可见。', ['flow-browser/meeting-vilerena.png', 'browser-final/care-390.png', 'browser-final/review-390.png', 'portrait-regression/RESULT.json']),
})
assets = [r['path'] for r in json.loads((ROOT / PREFIX / 'assets/MANIFEST.json').read_text())['assets'][:2]]
assets += ['dist/assets/v6/vilerena-portrait-v6.png', 'dist/assets/v6/vilerena-world-v6.png', 'dist/assets/v5/npc-portraits-v5.png', 'dist/assets/v4/actors-world.png']
report = {
    'schema': 1, 'source_fingerprint': fingerprint(inventory()),
    'reviewer': 'Codex逐张查看地下三图、碰撞图、原24帧图、新三人实景立绘、会馆及手机对白。',
    'reviewed_paths': relevant(changed('60ce94bf3b72eec03a83d7aeb915be5e3534ba14')),
    'assets': [evidence(p) for p in assets], 'maps': maps,
    'limits': '截图使用真实渲染器的隔离状态；自动几何事实、编辑视觉判断和真人待验分别记录。本轮未宣称重新完成人类全章游玩。',
}
for p in [ROOT / PREFIX / 'MAP_QUALITY.json', ROOT / 'docs/map-quality/LATEST.json']:
    p.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
print(report['source_fingerprint'])
