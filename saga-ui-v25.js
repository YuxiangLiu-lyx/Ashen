const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function sagaSpiritHTMLV25(g,{portrait=()=>''}={}){
 const s=g.sagaSpiritInfoV25(),b=s.bonus;
 if(!s.unlocked)return '';
 return `<div class="modal"><section class="panel saga-spirit-v25"><header class="panel-head"><h2>剑中留声</h2><button data-act="resume">返回 ×</button></header><div class="panel-body"><div class="saga-spirit-intro-v25"><img src="${esc(portrait('澄璃'))}" alt="器灵澄璃"><div><h3>澄璃</h3><p>银叶契片传来很轻的一声回应。</p><p>${s.weapon?'此刻寄于：'+esc(s.weapon):'还没有持用的武器，灵息暂且留在契片中。'}</p><p class="muted">换一件武器，她也会随你过去。</p></div></div><section><h3>温养 · ${s.level} 阶</h3><p>战力 +${b.power}　生命 +${b.hp}<br>攻速 +${(b.haste*100).toFixed(1)}%　减伤 +${(b.reduction*100).toFixed(1)}%</p><p class="muted">剑路与器灵共同生效；双持只计算一次。</p>${s.practiceAvailable?`<p>用一枚镜泉剑髓整理已练成的剑路，另需 ${s.practiceCost} 金。<br>持有剑髓：${s.shards}</p><button data-saga="practice" ${g.p.gold<s.practiceCost||s.shards<1?'disabled':''}>请她温养武器</button>`:'<p>已经练成的剑路，都已梳理妥当。</p>'}</section><section><h3>唤她说几句话</h3><p class="muted">在安全的地方停下脚步，再慢慢说。</p><div class="saga-topic-list-v25">${s.topics.map(t=>`<button data-saga="talk" data-topic="${esc(t.id)}">${esc(t.title)}</button>`).join('')}</div></section>${s.pendingGear?`<p>还有 ${s.pendingGear} 件包好的战利品。</p><button data-saga="claim">收进行囊</button>`:''}</div></section></div>`;
}
export function sagaJournalHTMLV25(g){
 const s=g.sagaV25;if(!s?.started)return '';
 return `<section class="saga-journal-v25"><h3>关外的旅程</h3><p>${esc((g.sagaExpansionObjectiveV26?.()||g.sagaObjectiveV25()).text)}</p>${s.cloak.owned&&g.map==='ch6Outpost'?`<button data-saga="cloak">${s.cloak.on?'收起共衣斗篷':'披上共衣斗篷'}</button>`:''}${s.spirit.unlocked?'<button data-saga="open">听听武器里的声音</button>':''}${s.pendingGear.length?`<p>有 ${s.pendingGear.length} 件尚未收进包里的战利品。</p><button data-saga="claim">收进行囊</button>`:''}</section>`;
}
