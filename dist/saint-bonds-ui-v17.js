import {SAINT_BOND_PRACTICE_V17} from './saint-bonds-story-v17.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const button=(label,act,arg='',disabled=false)=>`<button data-bond17="${act}" data-arg="${esc(arg)}" ${disabled?'disabled':''}>${esc(label)}</button>`;
const titles={drink:'靠窗歇一会儿',game:'两个人的筹牌',practice:'护罩合练'};
const places={drink:'ch5Tavern',game:'ch5Arcade',practice:'ch5GrandSquare'};
const names={ch5Tavern:'长夜酒馆',ch5Arcade:'回铃游艺厅',ch5GrandSquare:'万灯广场西侧'};
const faces=['提灯','银鱼','槲叶'];

export function saintBondHTMLV17(g){
 const progress=g.saintBondProgressV17(),a=progress.active,s=g.saintBondV17;
 const here=Object.keys(places).find(k=>places[k]===g.map),kind=a?.kind||here;
 let body='';
 if(a&&places[a.kind]!==g.map){body=`<p>上次的${titles[a.kind]}还没有结束，回到${names[places[a.kind]]}可以从原处继续。</p>${button('收起这次活动','abandon')}`;}
 else if(!a){
  const description={drink:'一起挑杯饮品，再聊聊路上或眼前的事。可以只喝花露，选择薄酒也不会劝她喝完。',game:'翻开两张木牌，找出三对相同图案。没有赌注，也没有倒计时，没记住就再试一次。',practice:'艾莉娅用微弱的光模拟三种攻势。看着光标的节拍承接护罩、离开蓄力光带，再抓住空当回击；每轮都可以重试。'}[kind];
  body=`${s.lastResult?`<div class="note-card"><b>${s.lastResult.first?'这一份默契已经记下':'又一起歇了一会儿'}</b><p>${s.lastResult.first?'生命上限 +10，受到伤害减免 +0.5%。':'已经取得的相处加成保持，重复不会增加属性或发放物品。'}</p></div>`:''}<p>${description||'先到酒馆的双人桌、游艺厅的筹牌桌，或广场西侧的小石标旁。'}</p><div class="row">${kind?button(progress.completed.includes(kind)?'再来一次':'开始','start',kind):''}${kind==='drink'?button('和她聊聊最近的事','legacy-talk'):''}</div>`;
 }
 else if(a.kind==='drink'){
  if(a.phase==='cup')body=`<p>瑟琳娜请你们尝尝桌上的饮品。艾莉娅把空杯放到面前，等你把壶递过来。</p><div class="row">${button('问她要不要尝一点薄酒','cup','wine')}${button('给两人都倒上热花露','cup','flower')}</div><p class="tip">两种选择都有完整对话，相处奖励相同。不会消耗金币，也不会覆盖已购买的饮品效果。</p>`;
  else if(a.phase==='topic')body=`<p>两只杯子已经放稳。窗外还传来广场上的说话声，眼下没有人催你们赶路。</p><div class="row">${button('先不谈赶路，随便聊聊','topic','quiet')}${button('聊聊伤口和绷带','topic','wound')}</div>`;
  else body='<p>这段谈话还没有结束。回到场景里继续听她说完。</p>';
 }
 else if(a.kind==='game'){
  const mismatch=a.phase==='pair'&&a.deck[a.flipped[0]]!==a.deck[a.flipped[1]],matched=a.matched.length/2;
  body=`<p>已找齐 <b>${matched}/3</b> 对 · 翻看 ${a.attempts} 次。艾莉娅坐在桌子另一边，替你留意刚才翻过的牌。</p><div class="teaching-grid" style="grid-template-columns:repeat(3,minmax(0,1fr));gap:12px">${a.deck.map((v,i)=>{const done=a.matched.includes(i),open=done||a.flipped.includes(i);return `<button data-bond17="flip" data-arg="${i}" ${done||open||a.phase!=='playing'?'disabled':''} aria-label="第${i+1}张${open?'，'+faces[v]+(done?'，已配对':''):'，背面'}" style="min-height:105px;white-space:normal;border:1px solid ${done?'#9cbf95':'#947b53'};background:${done?'#26382c':open?'#504232':'#242c31'};color:#f5e7c9"><small>第 ${i+1} 张</small><br><b style="font-size:1.2em">${open?faces[v]:'翻开'}</b>${done?'<br><small>已配对</small>':''}</button>`;}).join('')}</div>`;
  if(a.phase==='pair')body+=`<p role="status">${matched===3?'三对都找到了，艾莉娅伸手把最后两张收在一起。':mismatch?'艾莉娅：“这两张不一样。先记住它们在哪儿，再翻下一对。”':'艾莉娅：“是一对，就放在旁边吧。剩下的我们接着找。”'}</p>${button(matched===3?'一起收好木牌':'记住了，继续','fold')}`;
  else body+='<p class="tip">每次翻两张；图案相同就配成一对。离开或保存会保留牌面和配对进度。</p>';
 }
 else if(a.kind==='practice'){
  const cue=SAINT_BOND_PRACTICE_V17[a.order[Math.min(2,a.round)]];
  body=`<p>完成 <b>${a.round}/3</b> 轮 · 重试 ${a.misses} 次。练习不消耗生命、法力或药品。</p><article class="note-card"><h3>${cue.title}</h3><p>${cue.text}</p></article>`;
  if(a.phase==='ready')body+=`<p>按“准备好了”后，光标会沿刻度移动。看清攻势，在光标进入金色亮带时做出配合动作；错过可以等它再走一圈。</p>${button('准备好了，开始这一轮','practice-ready')}`;
  else if(a.phase==='playing')body+=`<div data-bond17-clock role="meter" aria-label="合练节拍" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" style="position:relative;height:36px;background:#17242c;border:1px solid #73848b;border-radius:5px;overflow:hidden;margin:20px 4px"><div style="position:absolute;left:${cue.window[0]*100}%;width:${(cue.window[1]-cue.window[0])*100}%;height:100%;background:#9b803d88;border-left:2px solid #e8ce80;border-right:2px solid #e8ce80"></div><i data-bond17-cursor style="position:absolute;left:0;height:100%;width:5px;background:#fff1bf;box-shadow:0 0 12px #edd185"></i></div><p data-bond17-timing role="status" aria-live="off">等光标进入金色亮带……</p><div class="row">${button('留在护罩内接下光点','practice','guard')}${button('退出正在蓄力的光带','practice','step')}${button('趁护罩收起回击靶心','practice','strike')}</div><p class="tip">每圈 3 秒，有约 1 秒的配合时机。普通光点跟随目标；只有地面有蓄力预警的光束可以避开。关闭面板会暂停练习，读档后本轮从准备开始。</p>`;
  else body+='<p>艾莉娅正在示范刚才那一下，回到场景继续。</p>';
 }
 return `<div class="modal"><section class="panel ch5-facility"><header class="panel-head"><div><small>阙灯城 · 灯下相处</small><h2>${titles[kind]||'灯下相处'}</h2></div><button data-act="resume">返回场景 ×</button></header><div class="panel-body"><div class="summary"><span>共同经历 <b>${progress.count}/3</b></span><span>生命上限 <b>+${progress.count*10}</b></span><span>受到伤害减免 <b>${(progress.count*.5).toFixed(1)}%</b></span></div>${body}<hr><p class="tip">一起喝饮品、配齐筹牌、完成三轮合练，各自首次完成得到一次相处加成：生命上限 +10、受到伤害减免 +0.5%。三项合计最多 +30 与 +1.5%；重复不增加，不按日期重置。</p>${a?`<div class="row">${button('先收起这次活动','abandon')}<button data-act="resume">暂时离开，保留进度</button></div>`:''}</div></section></div>`;
}

// Call from the existing game loop, only while this mechanism is actually displayed.
// No independent timer survives closing the panel, loading a save or changing scenes.
export function updateSaintBondPanelV17(g,dt,root=globalThis.document){
 const meter=root?.querySelector?.('[data-bond17-clock]');if(!meter||!g?.advanceSaintBondPracticeV17?.(dt))return false;
 const a=g.saintBondV17.active,cue=SAINT_BOND_PRACTICE_V17[a.order[a.round]],at=a.elapsed/3;
 const cursor=meter.querySelector('[data-bond17-cursor]');if(cursor)cursor.style.left=(at*100)+'%';
 meter.setAttribute('aria-valuenow',String(Math.round(at*100)));
 const status=root.querySelector('[data-bond17-timing]'),text=at<cue.window[0]?'还没到，留意艾莉娅的光。':at<=cue.window[1]?'就是现在，做出配合动作！':'这一拍过去了，可以等下一圈。';
 if(status&&status.textContent!==text)status.textContent=text;
 return true;
}
