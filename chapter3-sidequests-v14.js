export const CH3_SIDE = {
  "version": "V10-optional-content-1",
  "integrationNotes": [
    "所有scene id以ch3开头；dialogue直接使用当前[speaker,text]格式。以下conditions是声明条件，需映射实际旗标。",
    "新增技能、装备、合成配方的具体数值与经济成本由战斗系统统一。这里的rewardRef是建议语义ID，不得当作已经存在的ITEMS key。",
    "任务完整可选，不能卡住救治、出营或祭场首领。主线药材是确定采集，不掺进随机奖励池。",
    "对话中的借灯返还必须检查是否持有；没有完成告别不能让章末人物说已经告别。"
  ],
  "quests": [
    {
      "id": "ch3_tutor_machine",
      "name": "不肯停的旧轮子",
      "map": "hellWorkshop",
      "giver": "mechanic",
      "availableWhen": "ch3HeroRecovered && !ch3MachineFixed",
      "stages": [
        {
          "id": "accept",
          "scene": "ch3MachineAccept",
          "objective": "从沉钟工坊北侧进入无灯矿道，在断轨尽头的旧检修间寻找教习机的缓冲铜簧。"
        },
        {
          "id": "find",
          "scene": "ch3MachineSpringFound",
          "prop": "ch3_machine_spring",
          "objective": "将缓冲铜簧带回沉钟工坊。"
        },
        {
          "id": "return",
          "scene": "ch3MachineReturn",
          "objective": "协助芮妲装回铜簧，再试一次教习机。"
        },
        {
          "id": "complete",
          "scene": "ch3MachineFirstUse",
          "set": [
            "ch3MachineFixed",
            "ch3MachineTrialUsed"
          ]
        }
      ],
      "reward": {
        "type": "oneTime",
        "refs": [
          "quest_xp_small",
          "echo_tutor_free_three_options_choose_one"
        ],
        "delivery": "未学技能书优先可见；可出现其他职业适合的技能。三项结果生成后保存，重开对话不刷新。装备/书先入背包，不自动学习、穿戴或激活。"
      },
      "unlocks": "教习机可用有限材料重复印制招式铜页，次数受真实消耗约束。主线不要求使用。"
    },
    {
      "id": "ch3_ferry_lamp",
      "name": "岸边的旧灯",
      "map": "hellFerry",
      "giver": "ferryman",
      "availableWhen": "ch3PatientStable && !ch3FerryLampFixed",
      "stages": [
        {
          "id": "accept",
          "scene": "ch3FerryAccept",
          "objective": "沿黑潮渡岸北边的浅滩走到搁浅小船，取回尚完好的灯芯架。潮声变低时再下滩。"
        },
        {
          "id": "find",
          "scene": "ch3FerryWreck",
          "prop": "ch3_ferry_wick_frame",
          "objective": "将灯芯架送回渡岸的乌洛。"
        },
        {
          "id": "return",
          "scene": "ch3FerryReturn",
          "set": [
            "ch3FerryLampFixed"
          ],
          "objective": "选取旧灯留下的镜片用途。"
        },
        {
          "id": "reward",
          "choices": [
            {
              "id": "relic",
              "label": "把镜片做成随身护符。",
              "rewardRef": "hell_fog_lens_relic",
              "scene": "ch3FerryRelic"
            },
            {
              "id": "skill",
              "label": "照着铜页学它引光的办法。",
              "rewardRef": "book_guiding_lamp",
              "scene": "ch3FerryBook"
            }
          ],
          "once": true
        }
      ],
      "worldChange": "岸灯修好后真实亮起，滩上的灯标出现；满潮时照出一条侧阶，玩家可自行发现守灯墓室入口。无论奖励选择哪项，修灯效果相同。",
      "reward": {
        "type": "choice_once",
        "balance": "护符提供有限防护/探索便利；技能提供引灯/小范围控制功能。二者是不同构筑方向，不成为全职业无代价伤害最优解。",
        "delivery": "背包满时保留待领取，不扣掉唯一选择。"
      }
    }
  ],
  "facilities": [
    {
      "id": "ch3_echo_tutor",
      "name": "余音教习机",
      "map": "hellWorkshop",
      "unlock": "ch3MachineFixed",
      "look": "旧铜轮、可插换的薄铜页、往复机械臂与低亮符线。同一场内物件，启动时小幅运转、叮声后出页。",
      "use": "投入淬声铜与灰晶，生成三张技能结果，让玩家选一张；有小概率出稀有或其他职业适合的招式。",
      "antiExploit": "生成结果与扣费在同一保存状态，退出不重抽；持有结果不允许再次扣费。已学技能有明确替代产出规则，不直接免费无限增加技能点。",
      "ui": "确认前看到材料成本、奖池范围和稀有规则；出结果后能看属性公式、职业适配和是否已学。不得让NPC念概率说明。"
    },
    {
      "id": "ch3_temper_furnace",
      "name": "沉钟退火炉",
      "map": "hellWorkshop",
      "unlock": "ch3HeroRecovered",
      "look": "低矮有门的炉膛、鼓风柄、冷却槽。先关炉门，后点火，再开槽取物。",
      "use": "拆解普通多余装备得有限材料；选择一件装备只调整一条允许变更的词缀。候选结果可预览，再决定保留原样或采用。",
      "limits": "唯一隐藏装备不能误拆；基础品质/词缀槽数不被无限堆高。重新投料才有新结果，取消对比不返材料重抽。",
      "storyUse": "这是芮妲常用修械工具，不因玩家到来突然出现全能神炉。"
    },
    {
      "id": "ch3_medicine_bench",
      "name": "营地药台",
      "map": "hellCamp",
      "unlock": "ch3InfectionRemoved",
      "look": "莫里斯的真实药桌，能看到药臼、干布和小瓶。",
      "use": "解锁两种章节药方：耐焚药与澄焰敷剂，处理地狱环境伤害或短时侵蚀；可作为快捷栏消耗品。",
      "limits": "有限材料、非永久属性、共享合理的消耗品冷却；不让药品形成永动治疗。圣女寻找主线药时不用掌握此制作系统。"
    }
  ],
  "optionalChallenges": [
    {
      "id": "ch3_lamplighter_tomb",
      "name": "守灯墓室",
      "map": "hellTomb",
      "discover": "修复岸灯后，满潮灯光照到被盐壳遮住的侧阶；靠近才记录入口。",
      "interaction": "三座罩灯共用有限的供光轨。玩家移动铜闸，保持至少一灯明亮才能打开尽头的旧柜。每次正确移动只出现一小组守灯残影，普通攻击为主。",
      "reward": "首次解谜固定章节特色遗物或技能书；后续重入只刷新普通材料。唯一柜不再抽一件唯一装备。",
      "narrative": "门牌旧刻字说明操作与维修痕迹，记录是普通守灯人的工作，不突然解释光明教会犯罪。",
      "environmentText": [
        "铜牌：检修时，至少留一盏灯。",
        "铜闸上的漆磨掉了一半，下面露着反复改过的刻度。",
        "柜内有一套包好的旧工具。布边上缝着：换班时还回来。"
      ]
    },
    {
      "id": "ch3_echo_rift",
      "name": "回声裂隙",
      "map": "hellRift",
      "discover": "矿道深处敲击声引向封板后的检修口；携矿灯可见固定插槽。",
      "interaction": "将一片普通铜页放进插槽，选择一种可读的试炼条件，进入三波短战斗。奖励偏技能材料和构筑变化。",
      "limits": "条件、资源消耗、波次数和首通奖励在确认前展示。三波结束给阶段奖励；失败可以离开，不损失主线药材。奖励种子在入场时保存，防止读档重抽。",
      "reward": "首通给一份明显有价值的构筑奖励；重复挑战给有上限的常规材料，不把无限刷技能点/永久属性作为奖励。",
      "environmentText": [
        "空铜页旁刻着三道短线。每一道末尾，都有一处锤击过的凹痕。",
        "机架仍有微弱振动。把铜页放进去之前，可以先拨动上面的档位。"
      ]
    }
  ],
  "scenes": [
    {
      "id": "ch3MachineAccept",
      "map": "hellWorkshop",
      "characters": [
        "hero",
        "mechanic"
      ],
      "dialogue": [
        [
          "芮妲",
          "别踩那块铜片！我刚把它敲平，又让你一个鞋印给压弯了。"
        ],
        [
          "诺恩",
          "没踩。它自己翻过来的。"
        ],
        [
          "芮妲",
          "……还真是。那你替我按住，旧轮子今天发了半天疯。"
        ],
        [
          "诺恩",
          "哪里坏了？"
        ],
        [
          "芮妲",
          "缓冲簧断了。矿道检修间有一根旧的，我上次只扛得动灯，没拿出来。"
        ],
        [
          "诺恩",
          "换上就能用？"
        ],
        [
          "芮妲",
          "能。第一张铜页给你挑，当搬东西的工钱。可别看印着招式就闭眼往身上学，拿杖子的跟抡锤子的，使的力气也不一样。"
        ],
        [
          "诺恩",
          "检修间在哪边？"
        ],
        [
          "芮妲",
          "进矿道，过断轨往东。门挂着三个扁铁环，扯中间那个，别硬踹。"
        ]
      ]
    },
    {
      "id": "ch3MachineProgress",
      "map": "hellWorkshop",
      "characters": [
        "hero",
        "mechanic"
      ],
      "dialogue": [
        [
          "芮妲",
          "铜簧在检修间。到了断轨往东，门上有三个铁环。"
        ],
        [
          "诺恩",
          "扯中间那个。"
        ],
        [
          "芮妲",
          "记得就好。旁边两个是钉死的，我自己也拽错过。"
        ]
      ]
    },
    {
      "id": "ch3MachineSpringFound",
      "map": "hellMine",
      "characters": [
        "hero"
      ],
      "dialogue": [
        [
          "旁白",
          "柜底压着一根粗铜簧，外面包了两层浸油的布。旁边两根已经断裂，被人仔细拴在一起。"
        ],
        [
          "诺恩",
          "这一根没断。"
        ],
        [
          "旁白",
          "诺恩把铜簧提出来。油布下面压着一块小铁牌，上面刻着“教习轮缓冲簧”。"
        ]
      ]
    },
    {
      "id": "ch3MachineReturn",
      "map": "hellWorkshop",
      "characters": [
        "hero",
        "mechanic"
      ],
      "dialogue": [
        [
          "芮妲",
          "还包着呢？正好，不用重新上油。"
        ],
        [
          "诺恩",
          "压在哪儿？"
        ],
        [
          "芮妲",
          "下面的凹口。你往里送，我卡住上头。别突然松手，弹到下巴可不好看。"
        ],
        [
          "诺恩",
          "卡好了。"
        ],
        [
          "芮妲",
          "嗯……松。"
        ],
        [
          "旁白",
          "铜轮慢慢转过半圈。机器响了一声，旁边的小托盘向外伸出。"
        ],
        [
          "芮妲",
          "成了。你往这边站，这次只会吐铜页，不会吐螺钉。"
        ],
        [
          "诺恩",
          "以前吐过？"
        ],
        [
          "芮妲",
          "昨天。打穿了我挂在后面的锅。"
        ]
      ],
      "staging": "两人在同一机器两侧，放簧→按住→慢慢松→铜轮启动→出托盘。先完成动作，后显示对应行。"
    },
    {
      "id": "ch3MachineFirstUse",
      "map": "hellWorkshop",
      "characters": [
        "hero",
        "mechanic"
      ],
      "dialogue": [
        [
          "芮妲",
          "这三张都能用。你先看清楚，挑一张。"
        ],
        [
          "诺恩",
          "每次出来的都不一样？"
        ],
        [
          "芮妲",
          "轮里存的多。材料够，能再印；手艺不适合，也别勉强。上次我想学抡大锤，差点把腰扭了。"
        ],
        [
          "诺恩",
          "我看看。"
        ]
      ],
      "after": "显示三选一奖励面板：实际名称、公式、已学状态、取得按钮。面板接管时不要反复播放对白。"
    },
    {
      "id": "ch3FerryAccept",
      "map": "hellFerry",
      "characters": [
        "hero",
        "ferryman"
      ],
      "dialogue": [
        [
          "乌洛",
          "别往下走，滩上那排石头马上就要淹了。"
        ],
        [
          "诺恩",
          "你在等水退？"
        ],
        [
          "乌洛",
          "等了两次。北边那条船上有只灯，我得把灯芯架拿回来。我的腿碰不了冷水。"
        ],
        [
          "诺恩",
          "岸上这盏坏了？"
        ],
        [
          "乌洛",
          "灯芯架锈断了。入夜以后谁来都看不见渡头，一脚踩空，就顺着潮走了。"
        ],
        [
          "诺恩",
          "我去看看。"
        ],
        [
          "乌洛",
          "别一下就答应。听见水声低下去再下滩，绕右边那块平石。东西拿到就回来，船里别的物件不值当你多待。"
        ]
      ],
      "speakerResolution": "主控诺恩用dialogueByControlledActor.hero，主控圣女用dialogueByControlledActor.saint；两套已展开成真实角色名。",
      "dialogueByControlledActor": {
        "hero": [
          [
            "乌洛",
            "先别下去！滩上那排石头眼看就要淹了。"
          ],
          [
            "诺恩",
            "你在等水退？"
          ],
          [
            "乌洛",
            "等了两回了。北边那条船上有盏灯，我想取回里面的灯芯架，可这双腿实在碰不了冷水。"
          ],
          [
            "诺恩",
            "要修岸上这盏灯？"
          ],
          [
            "乌洛",
            "是啊，灯芯架锈断了。入夜看不见渡头，来个人踩空了，就得被潮水卷走。"
          ],
          [
            "诺恩",
            "我去看看。"
          ],
          [
            "乌洛",
            "听我说完再去。等水声低下去，绕过右边那块平石再下滩。拿到灯芯架就回来，船里别的东西都不值钱，不值得冒险。"
          ]
        ],
        "saint": [
          [
            "乌洛",
            "先别下去！滩上那排石头眼看就要淹了。"
          ],
          [
            "艾莉娅",
            "您在等水退吗？"
          ],
          [
            "乌洛",
            "等了两回了。北边那条船上有盏灯，我想取回里面的灯芯架，可这双腿实在碰不了冷水。"
          ],
          [
            "艾莉娅",
            "岸上这盏灯是坏了吗？"
          ],
          [
            "乌洛",
            "是啊，灯芯架锈断了。入夜看不见渡头，来个人踩空了，就得被潮水卷走。"
          ],
          [
            "艾莉娅",
            "我去替你找找。"
          ],
          [
            "乌洛",
            "听我说完再去。等水声低下去，绕过右边那块平石再下滩。拿到灯芯架就回来，船里别的东西都不值钱，不值得冒险。"
          ]
        ]
      },
      "charactersByControlledActor": {
        "hero": [
          "hero",
          "ferryman"
        ],
        "saint": [
          "saint",
          "ferryman"
        ]
      }
    },
    {
      "id": "ch3FerryWreck",
      "map": "hellFerry",
      "characters": [
        "hero"
      ],
      "dialogue": [
        [
          "旁白",
          "小船歪在浅滩上。灯壳破了，里面的铜架还完整，两片磨花的镜片被布条缠在一起。"
        ],
        [
          "诺恩",
          "拿到了。"
        ],
        [
          "旁白",
          "潮水已经漫过最外边那排脚印。岸灯的方向，传来两声短促的敲盆声。"
        ]
      ],
      "speakerResolution": "主控诺恩用dialogueByControlledActor.hero，主控圣女用dialogueByControlledActor.saint；两套已展开成真实角色名。",
      "dialogueByControlledActor": {
        "hero": [
          [
            "旁白",
            "小船歪在浅滩上，破灯壳里的铜架还完好，两片磨花的镜片用布条缠在一起。"
          ],
          [
            "诺恩",
            "拿到了。"
          ],
          [
            "旁白",
            "潮水漫过了最外边那排脚印，岸灯那边传来两声急促的敲盆声。"
          ]
        ],
        "saint": [
          [
            "旁白",
            "小船歪在浅滩上，破灯壳里的铜架还完好，两片磨花的镜片用布条缠在一起。"
          ],
          [
            "艾莉娅",
            "灯芯架找到了。"
          ],
          [
            "旁白",
            "潮水漫过了最外边那排脚印，岸灯那边传来两声急促的敲盆声。"
          ]
        ]
      },
      "charactersByControlledActor": {
        "hero": [
          "hero"
        ],
        "saint": [
          "saint"
        ]
      }
    },
    {
      "id": "ch3FerryReturn",
      "map": "hellFerry",
      "characters": [
        "hero",
        "ferryman"
      ],
      "dialogue": [
        [
          "乌洛",
          "给我看看。……就是这个。再晚些，水就过舷了。"
        ],
        [
          "诺恩",
          "镜片也带回来了。"
        ],
        [
          "乌洛",
          "镜片你留着，旧灯只缺架。往这儿一放……帮我举一下灯罩。"
        ],
        [
          "旁白",
          "新灯芯慢慢吸满油。乌洛转动旋钮，细光越过浅滩，照到对岸一段窄石阶。"
        ],
        [
          "诺恩",
          "那里还有路。"
        ],
        [
          "乌洛",
          "以前守灯的人走的。涨潮时灯照得过去，水一低，就全藏进岩缝里。想去看，先把脚下的路认清。"
        ],
        [
          "诺恩",
          "这两片要怎么用？"
        ],
        [
          "乌洛",
          "我会包铜边，做个随身灯坠。你要想学引光的法子，这里也有以前留下的铜页。挑一样吧，另一片我正好拿去补窗。"
        ]
      ],
      "speakerResolution": "主控诺恩用dialogueByControlledActor.hero，主控圣女用dialogueByControlledActor.saint；两套已展开成真实角色名。",
      "after": "只出现一次二选一面板，展示护符与技能书的具体效果；任务已完成但奖励未领时保留金色问号。",
      "dialogueByControlledActor": {
        "hero": [
          [
            "乌洛",
            "给我看看……对，就是它。幸好赶上了，再晚一点，水都要漫过船舷了。"
          ],
          [
            "诺恩",
            "镜片也带回来了。"
          ],
          [
            "乌洛",
            "镜片你留着，修这盏旧灯有架子就够。来，帮我举一下灯罩，我把它装进去。"
          ],
          [
            "旁白",
            "灯芯慢慢吸满了油。乌洛转动旋钮，一道细光越过浅滩，照亮对岸窄窄的一段石阶。"
          ],
          [
            "诺恩",
            "那边原来还有条路。"
          ],
          [
            "乌洛",
            "是从前守灯的人走的。涨潮时灯还能照见，水退后就不好辨认了。想过去，先认清岩缝里那段台阶。"
          ],
          [
            "诺恩",
            "这两片镜片能做什么？"
          ],
          [
            "乌洛",
            "我可以包上铜边，做成随身带的灯坠。你要想学引光，也有以前留下的铜页。挑一样吧，剩下那片正好给我补窗。"
          ]
        ],
        "saint": [
          [
            "乌洛",
            "给我看看……对，就是它。幸好赶上了，再晚一点，水都要漫过船舷了。"
          ],
          [
            "艾莉娅",
            "镜片也还好，我一起带回来了。"
          ],
          [
            "乌洛",
            "镜片你留着，修这盏旧灯有架子就够。来，帮我举一下灯罩，我把它装进去。"
          ],
          [
            "旁白",
            "灯芯慢慢吸满了油。乌洛转动旋钮，一道细光越过浅滩，照亮对岸窄窄的一段石阶。"
          ],
          [
            "艾莉娅",
            "那里似乎还有条路。"
          ],
          [
            "乌洛",
            "是从前守灯的人走的。涨潮时灯还能照见，水退后就不好辨认了。想过去，先认清岩缝里那段台阶。"
          ],
          [
            "艾莉娅",
            "这两片镜片还能做什么？"
          ],
          [
            "乌洛",
            "我可以包上铜边，做成随身带的灯坠。你要想学引光，也有以前留下的铜页。挑一样吧，剩下那片正好给我补窗。"
          ]
        ]
      },
      "charactersByControlledActor": {
        "hero": [
          "hero",
          "ferryman"
        ],
        "saint": [
          "saint",
          "ferryman"
        ]
      }
    },
    {
      "id": "ch3FerryRelic",
      "map": "hellFerry",
      "characters": [
        "hero",
        "ferryman"
      ],
      "dialogue": [
        [
          "乌洛",
          "边包好了。挂在外衣上，别让扣子压住镜面。"
        ],
        [
          "诺恩",
          "多谢。"
        ],
        [
          "乌洛",
          "是我该谢你。天黑了也能看见渡头，今晚总能少摔几个人。"
        ]
      ],
      "speakerResolution": "主控诺恩用dialogueByControlledActor.hero，主控圣女用dialogueByControlledActor.saint；两套已展开成真实角色名。",
      "dialogueByControlledActor": {
        "hero": [
          [
            "乌洛",
            "铜边包好了，挂在外衣上就行。留心扣子，别挡住镜面。"
          ],
          [
            "诺恩",
            "多谢。"
          ],
          [
            "乌洛",
            "该我谢你才是。这下天黑也照得见渡头了，今晚总能少几个人摔进水里。"
          ]
        ],
        "saint": [
          [
            "乌洛",
            "铜边包好了，挂在外衣上就行。留心扣子，别挡住镜面。"
          ],
          [
            "艾莉娅",
            "谢谢你。"
          ],
          [
            "乌洛",
            "该我谢你才是。这下天黑也照得见渡头了，今晚总能少几个人摔进水里。"
          ]
        ]
      },
      "charactersByControlledActor": {
        "hero": [
          "hero",
          "ferryman"
        ],
        "saint": [
          "saint",
          "ferryman"
        ]
      }
    },
    {
      "id": "ch3FerryBook",
      "map": "hellFerry",
      "characters": [
        "hero",
        "ferryman"
      ],
      "dialogue": [
        [
          "乌洛",
          "铜页和镜片都收好。上面有前人练习的划痕，别当脏东西磨掉。"
        ],
        [
          "诺恩",
          "这里的小缺口也是？"
        ],
        [
          "乌洛",
          "嗯，那是给手指找位置的。我只会点灯，往外引光这一手，你慢慢试。"
        ]
      ],
      "speakerResolution": "主控诺恩用dialogueByControlledActor.hero，主控圣女用dialogueByControlledActor.saint；两套已展开成真实角色名。",
      "dialogueByControlledActor": {
        "hero": [
          [
            "乌洛",
            "铜页和镜片一起收好。上头那些划痕是以前的人练习时留的，可别当脏东西磨掉。"
          ],
          [
            "诺恩",
            "这个小缺口也是给练习用的？"
          ],
          [
            "乌洛",
            "嗯，手指摸着它就知道该放在哪儿了。我也只会点灯，引光出去的法子，还得你照着慢慢练。"
          ]
        ],
        "saint": [
          [
            "乌洛",
            "铜页和镜片一起收好。上头那些划痕是以前的人练习时留的，可别当脏东西磨掉。"
          ],
          [
            "艾莉娅",
            "这个小缺口也是给练习用的吗？"
          ],
          [
            "乌洛",
            "嗯，手指摸着它就知道该放在哪儿了。我也只会点灯，引光出去的法子，还得你照着慢慢练。"
          ]
        ]
      },
      "charactersByControlledActor": {
        "hero": [
          "hero",
          "ferryman"
        ],
        "saint": [
          "saint",
          "ferryman"
        ]
      }
    },
    {
      "id": "ch3DoctorIdleSaint",
      "map": "hellCamp",
      "characters": [
        "saint",
        "doctor"
      ],
      "condition": "ch3PatientStable && !ch3HeroRecovered",
      "dialogue": [
        [
          "艾莉娅",
          "我想再看一眼他的伤。"
        ],
        [
          "莫里斯",
          "还稳着。你看这条线，没过我画的记号，就不用重新拆布。"
        ],
        [
          "艾莉娅",
          "他要是醒了，请先给他一点水。"
        ],
        [
          "莫里斯",
          "小杯子已经摆在床边了。你自己也喝点，别空着肚子出去。"
        ]
      ]
    },
    {
      "id": "ch3DoctorIdleHero",
      "map": "hellCamp",
      "characters": [
        "hero",
        "doctor"
      ],
      "condition": "ch3HeroRecovered",
      "dialogue": [
        [
          "莫里斯",
          "把肩抬起来我看看。"
        ],
        [
          "诺恩",
          "这样？"
        ],
        [
          "莫里斯",
          "行，能动了。可别今天刚能举手，明天就又让我给你缝。"
        ],
        [
          "诺恩",
          "药还剩多少？"
        ],
        [
          "莫里斯",
          "够换两回。药台上的方子你可以学，来路上的普通苔也能用，不必总进深洞。"
        ]
      ]
    },
    {
      "id": "ch3MechanicIdle",
      "map": "hellWorkshop",
      "characters": [
        "hero",
        "mechanic"
      ],
      "condition": "ch3HeroRecovered",
      "dialogue": [
        [
          "芮妲",
          "恢复得挺快。那天躺车上，还以为你得在床上过一旬。"
        ],
        [
          "诺恩",
          "听说是你的车。"
        ],
        [
          "芮妲",
          "是啊。平时拉铁，头一回拉这么好看的人，可惜一句话也不会说。"
        ],
        [
          "诺恩",
          "车板我帮你洗。"
        ],
        [
          "芮妲",
          "已经洗了。你要过意不去，出门把靠墙的桶挪进来，别让灰落满。"
        ]
      ]
    },
    {
      "id": "ch3SaintAfterRecovery",
      "map": "hellCamp",
      "characters": [
        "hero",
        "saint"
      ],
      "condition": "ch3HeroRecovered && !ch3Complete",
      "dialogue": [
        [
          "艾莉娅",
          "抬一下手，药布的边卷进去了。"
        ],
        [
          "诺恩",
          "我自己来。"
        ],
        [
          "艾莉娅",
          "你够不到后面。站好，一下就行。"
        ],
        [
          "诺恩",
          "……好了？"
        ],
        [
          "艾莉娅",
          "好了。今晚记得换新的，这条不能再用了。"
        ]
      ],
      "staging": "近距离站姿换绷带，人物看向手臂和布结。普通医疗照顾，不画脸红、爱心或暧昧特写。"
    },
    {
      "id": "ch3SaintSoulQuestion",
      "map": "hellCamp",
      "characters": [
        "hero",
        "saint"
      ],
      "condition": "ch3HeroRecovered",
      "dialogue": [
        [
          "艾莉娅",
          "在墙边的时候，它们是在喊我，对吗？"
        ],
        [
          "诺恩",
          "它们看的是圣徽。"
        ],
        [
          "艾莉娅",
          "可我从没去过它们所在的地方。她们为什么那么怕我……又那么恨我。"
        ],
        [
          "诺恩",
          "我不知道。"
        ],
        [
          "艾莉娅",
          "我想再找个能开口的问问。要是有人还记得自己的家，或许还能替他们传个消息。"
        ]
      ],
      "notes": "保持她的关切落在受难者，不能接上教会有罪/诺恩早就知道/你终于明白等答案。"
    },
    {
      "id": "ch3MinerIdle",
      "map": "hellCamp",
      "characters": [
        "hero",
        "miner"
      ],
      "condition": "ch3GrottoRescueDone",
      "dialogue": [
        [
          "阿芙",
          "苔晒好了。别捏，看着干，里面还软呢。"
        ],
        [
          "诺恩",
          "你今天不进洞？"
        ],
        [
          "阿芙",
          "歇一天。腿上的伤刚好，再划开，莫里斯又该念我。锅边有热汤，想喝自己舀。"
        ]
      ],
      "speakerResolution": "主控诺恩用dialogueByControlledActor.hero，主控圣女用dialogueByControlledActor.saint；两套已展开成真实角色名。",
      "dialogueByControlledActor": {
        "hero": [
          [
            "阿芙",
            "苔已经晒好了。哎，别捏，看着是干的，里面还软着呢。"
          ],
          [
            "诺恩",
            "你今天不进洞？"
          ],
          [
            "阿芙",
            "今天歇歇，腿才刚好。再给划破了，莫里斯又得念叨我。锅边有热汤，你想喝就自己舀。"
          ]
        ],
        "saint": [
          [
            "阿芙",
            "苔已经晒好了。哎，别捏，看着是干的，里面还软着呢。"
          ],
          [
            "艾莉娅",
            "今天不进洞了？腿还疼不疼？"
          ],
          [
            "阿芙",
            "今天歇歇，腿才刚好。再给划破了，莫里斯又得念叨我。锅边有热汤，你想喝就自己舀。"
          ]
        ]
      },
      "charactersByControlledActor": {
        "hero": [
          "hero",
          "miner"
        ],
        "saint": [
          "saint",
          "miner"
        ]
      }
    },
    {
      "id": "ch3ReturnLamp",
      "map": "hellWorkshop",
      "characters": [
        "hero",
        "mechanic"
      ],
      "condition": "has(ch3_prism_lamp) && ch3InfectionRemoved",
      "dialogue": [
        [
          "诺恩",
          "借的灯，擦干净了。"
        ],
        [
          "芮妲",
          "底下还有点灰……算了，已经比我拿出去时干净。先放着，我换根灯芯。"
        ],
        [
          "诺恩",
          "以后还能借？"
        ],
        [
          "芮妲",
          "当然。灯是拿来用的，又不是摆柜里看的。你要再进矿道，过来拿就是。"
        ]
      ],
      "speakerResolution": "主控诺恩用dialogueByControlledActor.hero，主控圣女用dialogueByControlledActor.saint；两套已展开成真实角色名。",
      "after": "记录返灯和告别；允许以后从台上免费重借以保留矿道/隐藏地图可达，不能交还后永久锁住探索。",
      "dialogueByControlledActor": {
        "hero": [
          [
            "诺恩",
            "灯还你，已经擦过了。"
          ],
          [
            "芮妲",
            "底下还沾着点灰……行了，比我借出去时都干净。先放这儿吧，我给它换根灯芯。"
          ],
          [
            "诺恩",
            "以后进矿道还能借吗？"
          ],
          [
            "芮妲",
            "当然能。搁在柜子里又没用，进矿道前过来拿就是了。"
          ]
        ],
        "saint": [
          [
            "艾莉娅",
            "灯我擦干净了，还给你。"
          ],
          [
            "芮妲",
            "底下还沾着点灰……行了，比我借出去时都干净。先放这儿吧，我给它换根灯芯。"
          ],
          [
            "艾莉娅",
            "要是以后还得进矿道，我能再来借吗？"
          ],
          [
            "芮妲",
            "当然能。搁在柜子里又没用，进矿道前过来拿就是了。"
          ]
        ]
      },
      "charactersByControlledActor": {
        "hero": [
          "hero",
          "mechanic"
        ],
        "saint": [
          "saint",
          "mechanic"
        ]
      }
    },
    {
      "id": "ch3CampFarewell",
      "map": "hellCamp",
      "characters": [
        "hero",
        "saint",
        "doctor"
      ],
      "condition": "ch3BossDefeated",
      "dialogue": [
        [
          "莫里斯",
          "准备下去了？"
        ],
        [
          "诺恩",
          "升降台能用了。"
        ],
        [
          "莫里斯",
          "那把剩下的药带上。别嫌瓶子重，出了这里不一定还有地方配。"
        ],
        [
          "艾莉娅",
          "这几天麻烦您了。"
        ],
        [
          "莫里斯",
          "你留下的苔也帮了我。路上碰见缺药的，能分就分一点，自己那份也得留够。"
        ],
        [
          "诺恩",
          "记住了。"
        ],
        [
          "莫里斯",
          "去吧。我就送到这里，锅还在火上。"
        ]
      ],
      "after": "设置ch3FarewellSaid；药是有限告别奖励，重复聊天不再给。"
    }
  ],
  "artNeeds": [
    "莫里斯、芮妲、阿芙、乌洛与亡魂的同风格半身大头像。",
    "小人姿势：诺恩挡击、跪撑、车上卧姿、床上昏迷/醒来；圣女圣光攻击、简短持续施疗、扶抬动作。",
    "半沉破钟和拖链、运料车、可见诊床与药台、矿灯和发光晶脉、教习铜轮与出页槽、渡岸灯。",
    "第二章侍女惨状头像，以疲惫、害怕、轻微擦红表现，无性感化或严重伤口。"
  ]
};
