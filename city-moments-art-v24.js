const art=(id,alt)=>({src:'assets/v24/'+id+'.png',alt});
export const CITY_MOMENTS_ILLUSTRATIONS_V24={
 'v24-fountain-arrival':art('v24-fountain-arrival','诺恩与艾莉娅站在金泉南侧，仰望蓝色彩窗里的花树纹样与廊下真正的花枝。'),
 'v24-fountain-listen':art('v24-fountain-listen','两人在泉池东南侧并肩站着，安静听对面乐师演奏。'),
 'v24-fountain-parting':art('v24-fountain-parting','艾莉娅走到东廊后回头看带着花树纹样的蓝色高窗，诺恩停在一步外等她。'),
 'v24-book-awning':art('v24-book-awning','两人站在旧书摊的真实木桌旁，一起看打开的城景画册。'),
 'v24-book-page':art('v24-book-page','诺恩用两指压住被风掀起的页角，艾莉娅看画里歪开的窗。'),
 'v24-book-corridor':art('v24-book-corridor','艾莉娅在花窗前托着一张街景印画，诺恩站在穿堂风那一侧。'),
 'v24-lamp-workbench':art('v24-lamp-workbench','格蕾娜在冷作台检查尚未点亮的小铜灯，诺恩和艾莉娅在旁看新铜条。'),
 'v24-lamp-trial':art('v24-lamp-trial','艾莉娅在后廊握稳温凉的提环，诺恩在旁看灯玻璃里的旧裂纹。'),
 'v24-lamp-window':art('v24-lamp-window','小灯已归还并挂到檐下，两人空着手并肩望向灯和窗外的城。')
};
const cue=(from,to,id,holdThrough=[])=>({from,to,id,holdThrough});
export const CITY_MOMENTS_ILLUSTRATION_BEATS_V24={
 v24MomentFountainA:[cue(4,13,'v24-fountain-arrival',[9])],
 v24MomentFountainB:[cue(0,8,'v24-fountain-listen'),cue(17,21,'v24-fountain-parting')],
 v24MomentBookA:[cue(4,18,'v24-book-awning',[12])],
 v24MomentBookB:[cue(0,5,'v24-book-page'),cue(14,21,'v24-book-corridor',[18])],
 v24MomentLampA:[cue(4,10,'v24-lamp-workbench')],
 v24MomentLampB:[cue(3,11,'v24-lamp-trial',[6,11]),cue(16,21,'v24-lamp-window')]
};
