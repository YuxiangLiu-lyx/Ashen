// Proposal: call once AFTER the existing final V9/V10 dialogue-quality layer.
// No line additions/deletions. Refuse a stale base instead of silently overwriting it.
export const V10_REVIEW_PATCHES = [
  {
    "sceneId": "contract",
    "lineIndex": 2,
    "speaker": "薇蕾娜",
    "original": "还学会叫我干活了。过来，肩上挂着木屑呢——站这么远，是怕我拿你擦桌子？",
    "replacement": "还叫我陪你抓？过来，肩上全是木屑。……躲什么，我手里又没拿针。",
    "reason": "删掉莫名其妙的擦桌子比喻；调戏由掸木屑的实际距离产生。"
  },
  {
    "sceneId": "contract",
    "lineIndex": 15,
    "speaker": "薇蕾娜",
    "original": "名字分开传是我的安排。通行纸若被扣下，至少不会连驿站也一起暴露；你可以怪我，可这次得照这个办法办。",
    "replacement": "通行纸可能被搜走。那边的人是谁，先别跟这些东西放在一起。是我这样安排的，这次照办。",
    "reason": "降低规章说明语气，保留姐姐隐瞒与强硬。"
  },
  {
    "sceneId": "contract",
    "lineIndex": 17,
    "speaker": "薇蕾娜",
    "original": "封术印带上，它只对她的圣术起效。制住她就够了，不要伤人。我让你带回来的，是能自己走进驿站的艾莉娅。",
    "replacement": "封术印带上，只能封住她的圣术。够你带她离开了，别下重手。",
    "reason": "去除把人物当任务交付件的工整宣言。"
  },
  {
    "sceneId": "contract",
    "lineIndex": 19,
    "speaker": "薇蕾娜",
    "original": "通行纸收好，进城别用会里的名字。还有，晚饭吃了再走。奥伦给你留着炖肉——别瞪我，这一句是我管你，不算会里的命令。",
    "replacement": "纸收好，进城别提会馆。还有，奥伦炖了肉，吃完再走。……怎么，这也耽误你？我等了你一上午，总该陪我吃顿饭吧。",
    "reason": "保留姐姐生活里的调戏，去掉自我说明什么算命令的旁白口吻。"
  },
  {
    "sceneId": "sisterIdle",
    "lineIndex": 4,
    "speaker": "薇蕾娜",
    "original": "晚些有客人。你倒是先替我挑起毛病了？好了，刀鞘侧边裂着，去找奥伦拿根皮带缠好。",
    "replacement": "晚些有客人。你就只看出这个？算了，刀鞘裂了，先找奥伦拿根皮带缠好。",
    "reason": "原文把问客人误接成挑毛病；重新接住上一句。"
  },
  {
    "sceneId": "sisterBeforeDeparture",
    "lineIndex": 0,
    "speaker": "薇蕾娜",
    "original": "今儿又是这身黑的。你就不问问我，好不好看？",
    "replacement": "这件新披肩，我昨天才拿回来。怎么样？别又只顾着看那张路图。",
    "reason": "原来“又是这身黑的”指代不清，下一句误会生硬。"
  },
  {
    "sceneId": "sisterBeforeDeparture",
    "lineIndex": 1,
    "speaker": "诺恩",
    "original": "你连我的旧衣服也要夸？",
    "replacement": "比我这件贵。",
    "reason": "以衣料价钱回避夸赞，性格明确，不做陌生冷笑话。"
  },
  {
    "sceneId": "sisterBeforeDeparture",
    "lineIndex": 2,
    "speaker": "薇蕾娜",
    "original": "我说的是我这件。罢了，问你还不如问奥伦，他至少会猜一猜。",
    "replacement": "眼光倒准，别的呢？……行了，知道你急。先说正事。",
    "reason": "配合0、1形成自然短调戏，再转严肃任务。"
  },
  {
    "sceneId": "sisterBeforeDeparture",
    "lineIndex": 6,
    "speaker": "薇蕾娜",
    "original": "圣女若挣扎，你先护住她的手。她是活人，不能像包裹一样往墙上撞。",
    "replacement": "她若挣扎，别硬扯手腕。走侧门，别在人堆里挤。",
    "reason": "用具体行动提醒替代活人包裹式训话。"
  },
  {
    "sceneId": "sisterAfterBell",
    "lineIndex": 2,
    "speaker": "薇蕾娜",
    "original": "那就别逼她来见我。不是每个人都愿意听我说话，这点我还分得清。",
    "replacement": "那就让她在外面等。刚出了这样的事，她见到我只会更生气。",
    "reason": "去掉角色自我评述是否人人爱听她说话。"
  },
  {
    "sceneId": "sisterAfterBell",
    "lineIndex": 8,
    "speaker": "薇蕾娜",
    "original": "这趟事她没有答应过。你要防着她逃走，也别故意拿话伤她。她急，你不能跟着乱。",
    "replacement": "她急着回去，你拦着，她当然会恨你。看好人就是了，别再跟她争。",
    "reason": "保留她参与绑架的矛盾，不做抽象情绪管理讲解。"
  },
  {
    "sceneId": "sisterAfterEscape",
    "lineIndex": 2,
    "speaker": "薇蕾娜",
    "original": "鲁恩刚收到闸门增岗的消息，比你迟了一步。换岗纸是我给的，这件事不能算你运气不好。",
    "replacement": "鲁恩刚收到增岗消息，你已经撞上他们了。是我给你的旧换岗纸，怪我。",
    "reason": "把责任落在具体情报错误上。"
  },
  {
    "sceneId": "farewellSister",
    "lineIndex": 10,
    "speaker": "薇蕾娜",
    "original": "好了，板着脸的那句说完了。临走前，肯不肯给我一句好听的？",
    "replacement": "好啦，我说完了。临走前，哄我一句也不亏吧？",
    "reason": "删除自指“板着脸的那句说完了”，保留后续凉饭回应的小反差。"
  },
  {
    "sceneId": "saintBrief",
    "lineIndex": 8,
    "speaker": "艾莉娅",
    "original": "我没敢给她一个空日子。可她愿意到教堂来，就是还盼着我们能帮她。不能只让她回家等。",
    "replacement": "我没敢答应她。可她拉着我的手不肯放，我实在不知道该怎么劝她回去。",
    "reason": "“一个空日子”非自然口语；以具体相处表现温柔。"
  },
  {
    "sceneId": "saintBrief",
    "lineIndex": 10,
    "speaker": "艾莉娅",
    "original": "那演讲结束后，请让我见搜查的人。圣女的奉献是为了让百姓过好日子，我若连家属的去处都答不上，还怎么请他们安心？",
    "replacement": "礼拜以后，我能去搜查队问问吗？哪几条街找过了，哪里还缺人手，总得弄清楚。家属再问起来，我不能还是一句“等消息”。",
    "reason": "把教义宣讲改成她真正在意、想做的事。"
  },
  {
    "sceneId": "chapterEnd",
    "lineIndex": 10,
    "speaker": "艾莉娅",
    "original": "你若还有一点不愿害人的心思，就不要再逼这些百姓。他们跟你的委托没有关系。",
    "replacement": "别再去找他们了。城里已经够乱，他们只想回家。",
    "reason": "避免在被威胁现场做完整论说；立场仍明确。"
  },
  {
    "sceneId": "chapterEnd",
    "lineIndex": 12,
    "speaker": "艾莉娅",
    "original": "教义教我们照顾饥饿和无处可去的人，我亲眼看着卡德兰大人在做。你们拿到一张名单，就能把一个人判死吗？",
    "replacement": "卡德兰大人还在替他们找失踪的家人。你说是委托，可是谁让你杀人，你就去杀吗？",
    "reason": "保持她对受害者的信任，以直接问话代替价值观演讲。"
  },
  {
    "sceneId": "saintSealEarly",
    "lineIndex": 2,
    "speaker": "艾莉娅",
    "original": "是，我会阻止你继续杀人。可认罪不等于非得死在这里，你把刀交出来，我会求他们让你受审。",
    "replacement": "我当然要拦你。你先放下刀，好不好？我会跟巡卫说明，让他们带你回去受审。",
    "reason": "温柔而坚决，去掉认罪不等于死在这里的逻辑辩论。"
  },
  {
    "sceneId": "saintSealEarly",
    "lineIndex": 4,
    "speaker": "艾莉娅",
    "original": "你肯伤害别人，却连被审问都不肯。你若觉得教会错了，也该把话说清楚，而不是拿刀替自己回答。",
    "replacement": "你若有冤屈，就说出来。我愿意听，可你总得先把刀放下。",
    "reason": "去掉拿刀替自己回答的修辞口号。"
  },
  {
    "sceneId": "saintSealTalk",
    "lineIndex": 4,
    "speaker": "艾莉娅",
    "original": "一个名字、一幅画像，不会告诉你他救过谁，也不会让死去的人活过来。",
    "replacement": "你至少该去问一问那些认识他的人。只看画像就杀人，错了怎么办？",
    "reason": "去掉两段工整的不会句，保留对误杀的真实担忧。"
  },
  {
    "sceneId": "saintSealTalk",
    "lineIndex": 6,
    "speaker": "艾莉娅",
    "original": "请你这次把话说全。我若能劝住你，也少一个家属要去教堂等消息。",
    "replacement": "那就到了再说。这一次，你别只挑肯告诉我的讲。",
    "reason": "取消把每个交谈都上升到家属生死的说教结尾。"
  },
  {
    "sceneId": "saintRoadEarly",
    "lineIndex": 4,
    "speaker": "艾莉娅",
    "original": "我听见了。可你不能每次一提赶路，就当之前做的事没有发生。",
    "replacement": "我不是问你怎么逃。礼拜厅里死了人，你一点都不在乎吗？",
    "reason": "把抽象追究改为情绪明确的直接问话。"
  },
  {
    "sceneId": "saintRoadTalk",
    "lineIndex": 6,
    "speaker": "艾莉娅",
    "original": "我会把找零还你。帮人说句话，不等于我答应替你隐瞒来历。",
    "replacement": "把钱放柜上吧。我问问他，药还要等多久。",
    "reason": "药铺生活场景不用每句都声明不合作、不隐瞒。"
  },
  {
    "sceneId": "saintFarewellWait",
    "lineIndex": 4,
    "speaker": "艾莉娅",
    "original": "他们若问起，你别说是我愿意同行。我回去以后，会把发生的事原原本本告诉教会。",
    "replacement": "有人问起，请你照实说。我是被你带来的。",
    "reason": "保留被迫同行事实，压短机械的未来作证宣言。"
  },
  {
    "sceneId": "ch2Arrival",
    "lineIndex": 2,
    "speaker": "艾莉娅",
    "original": "是要告诉我，也要听我的回答。你不能替我答应。",
    "replacement": "我跟你走到这里了。下一件事，别再瞒着我。",
    "reason": "“是要告诉我，也要听我的回答”像会谈规范，改为当前不满。"
  },
  {
    "sceneId": "ch2Terms",
    "lineIndex": 3,
    "speaker": "诺恩",
    "original": "委托要我杀他。",
    "replacement": "是。",
    "reason": "明确承担行动意图，不借委托拟人卸责。"
  },
  {
    "sceneId": "ch2Terms",
    "lineIndex": 8,
    "speaker": "艾莉娅",
    "original": "你把我愿不愿意听成了价钱够不够。就算你肯放我，我也不会拿一个人的命来换。",
    "replacement": "你早就想好了，是不是？先把我带到这里，再让我拿他的命换自己回去。",
    "reason": "删除愿意/价钱的类比警句，保留交换条件的残酷。"
  },
  {
    "sceneId": "ch2Terms",
    "lineIndex": 10,
    "speaker": "艾莉娅",
    "original": "换个地方，我的回答也不会变。我宁愿劝你把刀放下，也不会帮你杀他。",
    "replacement": "我不会开门的。你把刀收起来，我们还有别的办法。",
    "reason": "不复述整段原则，保留最后一次劝止。"
  },
  {
    "sceneId": "ch2InnerDoor",
    "lineIndex": 5,
    "speaker": "艾莉娅",
    "original": "所以才不能让你过去。愿光照清你心里的恨，你若停下，就还有机会。",
    "replacement": "那就停在这里。你现在回头，还来得及。",
    "reason": "将突兀祈愿式净化台词改成她当面劝阻。"
  },
  {
    "sceneId": "ch2ExileEnd",
    "lineIndex": 4,
    "speaker": "艾莉娅",
    "original": "我会自己看路。若能出去，我仍要把你交给教会；这里再危险，你犯下的事也不会消失。",
    "replacement": "我会看路。先找出口，出去以后，你得跟我回教堂把事情说清楚。",
    "reason": "不再完整复述危险不能洗去罪行的主题。"
  },
  {
    "sceneId": "ch2ExileEnd",
    "lineIndex": 7,
    "speaker": "诺恩",
    "original": "不知道。我只看得清这几级台阶，得一步步试。",
    "replacement": "看不清。石阶还没断，我先往下探一段。",
    "reason": "摆脱一步步试的泛化哲理，说明实际行动。"
  },
  {
    "sceneId": "darkCommissionV9",
    "lineIndex": 4,
    "speaker": "薇蕾娜",
    "original": "值不值得，现在还说不准。我想知道他们在没人提点的时候，会怎么应付彼此。",
    "replacement": "看看他碰上一个不肯听他的，会怎么办。现在谁也说不准。",
    "reason": "隐藏目的讲清观察对象，不提前说恋爱或觉醒。"
  },
  {
    "sceneId": "darkCommissionV9",
    "lineIndex": 6,
    "speaker": "薇蕾娜",
    "original": "告诉了，他一路都会猜我们在等什么，连说句话都先想是不是命令。那样送回来的消息，还有多少是他自己的？",
    "replacement": "他一旦知道有人盯着，这一路都得先猜我们的意思。那就白安排了。",
    "reason": "去掉消息还有多少是自己的等绕口表述。"
  },
  {
    "sceneId": "darkCommissionV9",
    "lineIndex": 8,
    "speaker": "薇蕾娜",
    "original": "把这条补给塞琳。不能拿缺一张路图，去换我们想看的东西。",
    "replacement": "那就让人再去看，查清后给塞琳送信。退路这件事不能省。",
    "reason": "具体派工取代拿缺路图换想看的东西。"
  },
  {
    "sceneId": "darkExileV9",
    "lineIndex": 6,
    "speaker": "薇蕾娜",
    "original": "那地方没人回来过。你还要拿他多走几天，等一个连我们都没见过的结果？",
    "replacement": "人都进禁地了，你还顾着看反应？鲁恩，我现在只想知道怎么把他带回来。",
    "reason": "把抽象多走几天/等结果改为有当下压力的争执。"
  },
  {
    "sceneId": "darkExileV9",
    "lineIndex": 7,
    "speaker": "鲁恩",
    "original": "我没有把握，也不想等他死。只是这回没人给他们下一条命令了，若有什么变化，可能只剩这一次能看见。",
    "replacement": "我会派人。观察点本来就在外沿，让他们接着守，发现动静也能早点报。",
    "reason": "鲁恩仍坚持观察但给出可执行理由，不发表实验宣言。"
  },
  {
    "sceneId": "darkExileV9",
    "lineIndex": 8,
    "speaker": "薇蕾娜",
    "original": "观察点留下，救人的队伍照派。能接上他就接，不许为了多看一眼，把人留在雾里。",
    "replacement": "可以。有人出来先接人，问话以后再问。",
    "reason": "具体优先级替代多看一眼留在雾里的修辞。"
  },
  {
    "sceneId": "darkExileV9",
    "lineIndex": 9,
    "speaker": "鲁恩",
    "original": "我去办。接不上也按时回报，不把没消息写成平安。",
    "replacement": "我这就去。天黑前不管接没接到人，都让他们送信回来。",
    "reason": "“不把没消息写成平安”像作者警句，改成报告要求。"
  }
];
export function applyReviewedDialoguePatches(dialogues) {
  for (const p of V10_REVIEW_PATCHES) {
    const row = dialogues[p.sceneId]?.[p.lineIndex];
    if (!row || row[0] !== p.speaker || (row[1] !== p.original && row[1] !== p.replacement)) {
      throw new Error(`Narrative patch base mismatch: ${p.sceneId}[${p.lineIndex}]`);
    }
  }
  for (const p of V10_REVIEW_PATCHES) dialogues[p.sceneId][p.lineIndex][1] = p.replacement;
  return dialogues;
}
