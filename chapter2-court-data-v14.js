export const COURT_REVISIONS = {
  "version": "V10-inner-room-replacement-1",
  "integration": {
    "replaceWholeScenes": [
      "ch2TargetBefore",
      "ch2TargetAfter"
    ],
    "replaceWholeStaging": true,
    "removeCG": true,
    "preserveFlagsAndTriggers": true,
    "knowledge": "两幕都只是玩家独立镜头；诺恩和艾莉娅不在场、不偷听、不知道。",
    "assetRule": "同一2D场景、小人、光影和大头像演出，不使用横幅剧情图或全屏CG。所有受压迫角色均成年、穿完整衣物。"
  },
  "cast": {
    "hester": "赫斯特，坐在内室长桌旁；保留当前头像。",
    "guard1": "守门护卫，背靠门侧面朝房内。",
    "guard2": "巡查护卫，立于舞者与门之间。",
    "messenger": "报信巡卫，第二幕进门后走到桌前。",
    "dancer1": "舞者，成年女性，步幅不稳，鞋带有磨损。",
    "dancer2": "舞者，成年女性，照看同伴但受呵斥后不得不停下。",
    "servant": "侍女，成年女性；新头像神情疲惫、眼下发青、唇色淡，脸侧有浅红痕、眼眶湿，衣领略乱但完整。严禁把受辱画成性感姿态。",
    "taxpayer": "成年女税户，在长凳边攥着原版回执。保留旧税务迫害线。",
    "relative": "女税户的成年家属，扶她坐下；此场不需要对白。"
  },
  "layout": {
    "table": "长桌靠房内北侧，赫斯特在桌后，桌前留能倒酒和让侍女跌坐的地面。",
    "danceFloor": "桌前偏西，两名舞者与主桌同一层级，不站桌上。",
    "bench": "东墙边，税户与家属不被墙和帐幔遮住。",
    "exit": "西南门，两名护卫分守门侧与舞区边；移动路线上不和演员重叠。",
    "props": "桌上两盏酒杯、托盘，地上破粮袋和少量粮粒，台边账本与回执；人物密度增加，留出自然过道。",
    "camera": "能同时看清权力中心、舞者和侍女。对话镜头只作轻微位移，不忽然弹出不同画风的图。"
  },
  "scenes": [
    {
      "id": "ch2TargetBefore",
      "map": "chamber",
      "characters": [
        "hester",
        "guard1",
        "guard2",
        "dancer1",
        "dancer2",
        "servant",
        "taxpayer",
        "relative"
      ],
      "beforeDialogue": [
        {
          "type": "groupMotion",
          "actors": [
            "dancer1",
            "dancer2"
          ],
          "motion": "被迫的小步转身与抬臂舞步",
          "duration": 2.4,
          "blocking": true
        },
        {
          "type": "stumble",
          "actor": "dancer1",
          "duration": 0.45,
          "endPose": "kneel",
          "blocking": true
        },
        {
          "type": "support",
          "actor": "dancer2",
          "target": "dancer1",
          "duration": 0.45,
          "blocking": true
        },
        {
          "type": "tableKnock",
          "actor": "hester",
          "duration": 0.25,
          "blocking": true
        }
      ],
      "dialogue": [
        [
          "赫斯特",
          "怎么停了？继续。"
        ],
        [
          "舞者",
          "大人，她脚扭了。能不能让她坐一会儿？"
        ],
        [
          "赫斯特",
          "她坐下，你接着跳。别都围在一起。"
        ],
        [
          "女税户",
          "大人，回执在这里。我们已经交过了，求您看一眼。"
        ],
        [
          "赫斯特",
          "账上没销，就还欠着。粮留下。"
        ],
        [
          "女税户",
          "那是家里最后一点了……"
        ],
        [
          "巡卫",
          "门外有人传话。"
        ],
        [
          "赫斯特",
          "叫他进来。你，酒倒上。"
        ],
        [
          "侍女",
          "是，大人。"
        ]
      ],
      "speakerActors": {
        "1": "dancer2",
        "6": "guard1",
        "8": "servant"
      },
      "atDialogueLine": [
        {
          "line": 3,
          "actions": [
            {
              "type": "slowDance",
              "actor": "dancer2",
              "loop": true
            },
            {
              "type": "showProp",
              "actor": "taxpayer",
              "prop": "tax_receipt"
            }
          ]
        },
        {
          "line": 4,
          "actions": [
            {
              "type": "dismissGesture",
              "actor": "hester"
            },
            {
              "type": "stepCloser",
              "actor": "guard2",
              "target": "taxpayer",
              "blocking": true
            }
          ]
        },
        {
          "line": 8,
          "actions": [
            {
              "type": "move",
              "actor": "servant",
              "anchor": "pouring_spot",
              "duration": 0.7,
              "blocking": true,
              "endPose": "idle"
            }
          ]
        }
      ],
      "portraitOverrides": {
        "8": {
          "portrait": "ch2_servant_distressed",
          "emotion": "疲惫、怕被责备，强忍泪意"
        }
      },
      "notes": [
        "正在说话的舞者停在站姿；不说话的舞者可做低幅度慢循环。",
        "角色压迫通过强迫动作、拦路、拒认回执表达，不靠旁白总结反派有多邪恶。"
      ]
    },
    {
      "id": "ch2TargetAfter",
      "map": "chamber",
      "characters": [
        "hester",
        "guard1",
        "guard2",
        "messenger",
        "dancer1",
        "dancer2",
        "servant",
        "taxpayer",
        "relative"
      ],
      "beforeDialogue": [
        {
          "type": "move",
          "actor": "messenger",
          "anchor": "reporting_spot",
          "duration": 1.1,
          "blocking": true,
          "endPose": "idle"
        }
      ],
      "dialogue": [
        [
          "巡卫",
          "西廊的人退到泄水口。布伦倒下，桥口已经加岗。"
        ],
        [
          "赫斯特",
          "骑队沿沟搜！圣女要活着带回来。外院的事，谁也不许往施粥点说。"
        ],
        [
          "巡卫",
          "是，大人。"
        ],
        [
          "赫斯特",
          "你抖什么？酒都洒在我袖子上了！"
        ],
        [
          "侍女",
          "对不起，我马上擦……"
        ],
        [
          "赫斯特",
          "滚开。把地上的捡干净，再去拿一壶。"
        ],
        [
          "侍女",
          "是……大人。"
        ],
        [
          "舞者",
          "手别按那里，有碎瓷。"
        ],
        [
          "赫斯特",
          "谁准你停的？接着跳。"
        ]
      ],
      "speakerActors": {
        "0": "messenger",
        "2": "messenger",
        "4": "servant",
        "6": "servant",
        "7": "dancer2"
      },
      "atDialogueLine": [
        {
          "line": 3,
          "actions": [
            {
              "type": "exit",
              "actor": "messenger",
              "anchor": "door",
              "blocking": true
            },
            {
              "type": "spillCup",
              "actor": "servant",
              "duration": 0.25,
              "blocking": true
            }
          ]
        },
        {
          "line": 5,
          "actions": [
            {
              "type": "pushAway",
              "actor": "hester",
              "target": "servant",
              "duration": 0.35,
              "blocking": true
            },
            {
              "type": "fallSeated",
              "actor": "servant",
              "anchor": "table_side_floor",
              "duration": 0.4,
              "blocking": true
            },
            {
              "type": "breakProp",
              "prop": "wine_cup",
              "blocking": true
            }
          ]
        },
        {
          "line": 7,
          "actions": [
            {
              "type": "reachToHelp",
              "actor": "dancer2",
              "target": "servant",
              "duration": 0.4,
              "blocking": true
            }
          ]
        },
        {
          "line": 8,
          "actions": [
            {
              "type": "stopHelping",
              "actor": "dancer2",
              "endPose": "idle",
              "blocking": true
            }
          ]
        }
      ],
      "portraitOverrides": {
        "4": {
          "portrait": "ch2_servant_distressed",
          "emotion": "惧怕、声音发颤"
        },
        "6": {
          "portrait": "ch2_servant_distressed",
          "emotion": "跌坐后强忍疼痛，眼眶泛红"
        }
      },
      "outro": [
        {
          "type": "slowDance",
          "actor": "dancer2",
          "duration": 1.5,
          "blocking": true
        },
        {
          "type": "collectShards",
          "actor": "servant",
          "duration": 1.1,
          "blocking": true
        }
      ],
      "notes": [
        "退场时税户与家属仍在长凳边，没有被男女主救出。",
        "先演洒酒，再责骂；先演推倒，再进入侍女回答。受伤表现用自然坐地/缩肩和头像，不加视觉上不一致的剧情图。",
        "不增加性行为、裸露、持续殴打或受伤特写。只表现权力压迫，保留人物尊严。"
      ]
    }
  ]
};
