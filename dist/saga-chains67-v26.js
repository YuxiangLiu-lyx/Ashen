/** V26 six authored chapter 6/7 chains, 18 physical stages. Reward details are internal. */
export const SAGA_CHAINS67_V26 = [
  {
    "id": "c6xV26BorrowedRoof",
    "chapter": 6,
    "beforeNode": "c6v25Tax",
    "title": "屋檐下的药香",
    "introScene": "c6v26BorrowedRoofIntro",
    "routeMaps": [
      "ch6VillageSquare",
      "ch6VillageLane",
      "ch6ReedWild"
    ],
    "steps": [
      {
        "id": "herbs",
        "title": "老杜今晚的药",
        "map": "ch6ReedWild",
        "turnIn": {
          "map": "ch6VillageLane",
          "npc": "v25VillageHost",
          "name": "阿绢",
          "x": 830,
          "y": 615,
          "sprite": 7
        },
        "scene": "c6v26BorrowedRoofHerbs",
        "reward": {
          "xp": 520,
          "gold": 95,
          "items": {
            "hpGrand": 2,
            "mpGrand": 1
          },
          "random": false
        },
        "collect": [
          {
            "id": "v26C6LampLeaf",
            "name": "干灯芯草",
            "count": 8,
            "source": "gather",
            "points": [
              [
                465,
                555
              ],
              [
                530,
                705
              ],
              [
                665,
                810
              ],
              [
                835,
                550
              ],
              [
                990,
                485
              ],
              [
                1185,
                660
              ],
              [
                1270,
                740
              ],
              [
                1230,
                890
              ]
            ]
          },
          {
            "id": "v26C6WarmRoot",
            "name": "老杜药方里的赤根",
            "count": 4,
            "source": "gather",
            "points": [
              [
                490,
                770
              ],
              [
                800,
                855
              ],
              [
                1215,
                535
              ],
              [
                1370,
                760
              ]
            ]
          }
        ],
        "kills": {
          "type": "v25ReedWolf",
          "count": 8
        }
      },
      {
        "id": "boards",
        "title": "替借住的空屋补屋顶",
        "map": "ch6VillageLane",
        "turnIn": {
          "map": "ch6VillageLane",
          "npc": "v25VillageHost",
          "name": "阿绢",
          "x": 830,
          "y": 615,
          "sprite": 7
        },
        "scene": "c6v26BorrowedRoofBoards",
        "reward": {
          "xp": 600,
          "gold": 115,
          "items": {
            "hpGrand": 2,
            "mpGrand": 1
          },
          "random": false
        },
        "collect": [
          {
            "id": "v26C6RoofBoard",
            "name": "可用的旧木板",
            "count": 6,
            "source": "gather",
            "points": [
              [
                380,
                565
              ],
              [
                570,
                535
              ],
              [
                635,
                685
              ],
              [
                1010,
                765
              ],
              [
                1150,
                630
              ],
              [
                1310,
                750
              ]
            ]
          }
        ]
      },
      {
        "id": "tickets",
        "title": "找齐老杜留存的领药票",
        "map": "ch6VillageLane",
        "turnIn": {
          "map": "ch6VillageLane",
          "npc": "v25VillageHost",
          "name": "阿绢",
          "x": 830,
          "y": 615,
          "sprite": 7
        },
        "scene": "c6v26BorrowedRoofComplete",
        "reward": {
          "xp": 680,
          "gold": 135,
          "items": {
            "hpGrand": 2,
            "mpGrand": 1
          },
          "random": true
        },
        "collect": [
          {
            "id": "v26C6MedicineTicket",
            "name": "各月份的领药票",
            "count": 6,
            "source": "gather",
            "points": [
              [
                635,
                685
              ],
              [
                1010,
                765
              ],
              [
                1150,
                630
              ],
              [
                1310,
                750
              ],
              [
                870,
                525
              ],
              [
                435,
                825
              ]
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "c6xV26MissingNames",
    "chapter": 6,
    "beforeNode": "c6v25Conscription",
    "title": "账上少掉的人",
    "introScene": "c6v26MissingNamesIntro",
    "routeMaps": [
      "ch6VillageSquare",
      "ch6VillageLane",
      "ch6TaxWarehouse"
    ],
    "steps": [
      {
        "id": "receipts",
        "title": "向各户找齐交粮回执",
        "map": "ch6VillageLane",
        "turnIn": {
          "map": "ch6VillageLane",
          "npc": "v25VillageHost",
          "name": "阿绢",
          "x": 830,
          "y": 615,
          "sprite": 7
        },
        "scene": "c6v26MissingNamesReceipts",
        "reward": {
          "xp": 520,
          "gold": 95,
          "items": {
            "hpGrand": 2,
            "mpGrand": 1
          },
          "random": false
        },
        "collect": [
          {
            "id": "v26C6TaxReceipt",
            "name": "盖过收讫印的回执",
            "count": 6,
            "source": "gather",
            "points": [
              [
                380,
                565
              ],
              [
                570,
                535
              ],
              [
                635,
                685
              ],
              [
                1010,
                765
              ],
              [
                1150,
                630
              ],
              [
                1310,
                750
              ]
            ]
          }
        ]
      },
      {
        "id": "seals",
        "title": "追回被转移的押粮签",
        "map": "ch6TaxWarehouse",
        "turnIn": {
          "map": "ch6VillageLane",
          "npc": "v25VillageHost",
          "name": "阿绢",
          "x": 830,
          "y": 615,
          "sprite": 7
        },
        "scene": "c6v26MissingNamesSeals",
        "reward": {
          "xp": 600,
          "gold": 115,
          "items": {
            "hpGrand": 2,
            "mpGrand": 1
          },
          "random": false
        },
        "collect": [
          {
            "id": "v26C6CargoSeal",
            "name": "押粮车签",
            "count": 6,
            "source": "drop"
          }
        ],
        "kills": {
          "type": "v25TaxGuard",
          "count": 10
        }
      },
      {
        "id": "belongings",
        "title": "取回药袋和各家的工牌",
        "map": "ch6TaxWarehouse",
        "turnIn": {
          "map": "ch6VillageLane",
          "npc": "v25VillageHost",
          "name": "阿绢",
          "x": 830,
          "y": 615,
          "sprite": 7
        },
        "scene": "c6v26MissingNamesComplete",
        "reward": {
          "xp": 680,
          "gold": 135,
          "items": {
            "hpGrand": 2,
            "mpGrand": 1
          },
          "random": true
        },
        "collect": [
          {
            "id": "v26C6WorkerBelonging",
            "name": "药袋与被扣的工牌",
            "count": 6,
            "source": "gather",
            "points": [
              [
                580,
                530
              ],
              [
                715,
                510
              ],
              [
                870,
                550
              ],
              [
                1040,
                480
              ],
              [
                1185,
                635
              ],
              [
                1280,
                805
              ]
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "c6xV26LastWagon",
    "chapter": 6,
    "beforeNode": "c6v25Rescue",
    "title": "车辙尽头",
    "introScene": "c6v26LastWagonIntro",
    "routeMaps": [
      "ch6ConvoyRoad"
    ],
    "steps": [
      {
        "id": "keys",
        "title": "夺回分开保管的锁钥",
        "map": "ch6ConvoyRoad",
        "turnIn": {
          "map": "ch6ConvoyRoad",
          "npc": "v26ConvoyGirl",
          "name": "获救姑娘",
          "x": 825,
          "y": 805,
          "sprite": 6
        },
        "scene": "c6v26LastWagonKeys",
        "reward": {
          "xp": 520,
          "gold": 95,
          "items": {
            "hpGrand": 2,
            "mpGrand": 1
          },
          "random": false
        },
        "collect": [
          {
            "id": "v26C6ConvoyKey",
            "name": "押车锁钥",
            "count": 4,
            "source": "drop"
          }
        ],
        "kills": {
          "type": "v25TaxGuard",
          "count": 10
        }
      },
      {
        "id": "bags",
        "title": "找回饮水、鞋和外衣",
        "map": "ch6ConvoyRoad",
        "turnIn": {
          "map": "ch6ConvoyRoad",
          "npc": "v26ConvoyGirl",
          "name": "获救姑娘",
          "x": 825,
          "y": 805,
          "sprite": 6
        },
        "scene": "c6v26LastWagonBelongings",
        "reward": {
          "xp": 600,
          "gold": 115,
          "items": {
            "hpGrand": 2,
            "mpGrand": 1
          },
          "random": false
        },
        "collect": [
          {
            "id": "v26C6ConvoyBag",
            "name": "姑娘们被扣的行囊",
            "count": 6,
            "source": "gather",
            "points": [
              [
                545,
                505
              ],
              [
                690,
                750
              ],
              [
                815,
                450
              ],
              [
                1000,
                650
              ],
              [
                1240,
                610
              ],
              [
                1320,
                840
              ]
            ]
          }
        ]
      },
      {
        "id": "pursuers",
        "title": "清退堵住渡口坡道的追索兵",
        "map": "ch6ConvoyRoad",
        "turnIn": {
          "map": "ch6ConvoyRoad",
          "npc": "v26ConvoyGirl",
          "name": "获救姑娘",
          "x": 825,
          "y": 805,
          "sprite": 6
        },
        "scene": "c6v26LastWagonComplete",
        "reward": {
          "xp": 680,
          "gold": 135,
          "items": {
            "hpGrand": 2,
            "mpGrand": 1
          },
          "random": true
        },
        "kills": {
          "type": "v25RoadHunter",
          "count": 10
        }
      }
    ]
  },
  {
    "id": "c6xV26LastFerry",
    "chapter": 6,
    "beforeNode": "c6v25Departure",
    "title": "最后一班渡船",
    "introScene": "c6v26LastFerryIntro",
    "routeMaps": [
      "ch6Riverside",
      "ch6VillageSquare",
      "ch6VillageLane",
      "ch6ReedWild",
      "ch6ConvoyRoad"
    ],
    "steps": [
      {
        "id": "rope",
        "title": "采长苇重搓靠岸缆绳",
        "map": "ch6ReedWild",
        "turnIn": {
          "map": "ch6Riverside",
          "npc": "v25Ferryman",
          "name": "渡船老人",
          "x": 1060,
          "y": 560,
          "sprite": 2
        },
        "scene": "c6v26LastFerryReeds",
        "reward": {
          "xp": 520,
          "gold": 95,
          "items": {
            "hpGrand": 2,
            "mpGrand": 1
          },
          "random": false
        },
        "collect": [
          {
            "id": "v26C6LongReed",
            "name": "能搓绳的长苇",
            "count": 8,
            "source": "gather",
            "points": [
              [
                465,
                555
              ],
              [
                530,
                705
              ],
              [
                665,
                810
              ],
              [
                835,
                550
              ],
              [
                990,
                485
              ],
              [
                1185,
                660
              ],
              [
                1270,
                740
              ],
              [
                1230,
                890
              ]
            ]
          }
        ]
      },
      {
        "id": "tools",
        "title": "取回北埠扣下的船具",
        "map": "ch6ConvoyRoad",
        "turnIn": {
          "map": "ch6Riverside",
          "npc": "v25Ferryman",
          "name": "渡船老人",
          "x": 1060,
          "y": 560,
          "sprite": 2
        },
        "scene": "c6v26LastFerryTools",
        "reward": {
          "xp": 600,
          "gold": 115,
          "items": {
            "hpGrand": 2,
            "mpGrand": 1
          },
          "random": false
        },
        "collect": [
          {
            "id": "v26C6FerryTools",
            "name": "被扣的船具",
            "count": 6,
            "source": "drop"
          }
        ],
        "kills": {
          "type": "v25RoadHunter",
          "count": 12
        }
      },
      {
        "id": "rations",
        "title": "按各家人数备妥行粮",
        "map": "ch6Riverside",
        "turnIn": {
          "map": "ch6Riverside",
          "npc": "v25Ferryman",
          "name": "渡船老人",
          "x": 1060,
          "y": 560,
          "sprite": 2
        },
        "scene": "c6v26LastFerryComplete",
        "reward": {
          "xp": 680,
          "gold": 135,
          "items": {
            "hpGrand": 2,
            "mpGrand": 1
          },
          "random": true
        },
        "collect": [
          {
            "id": "v26C6FerryRation",
            "name": "已分好的行粮与药包",
            "count": 8,
            "source": "gather",
            "points": [
              [
                395,
                670
              ],
              [
                545,
                750
              ],
              [
                690,
                520
              ],
              [
                1130,
                585
              ],
              [
                1210,
                745
              ],
              [
                975,
                885
              ],
              [
                670,
                895
              ],
              [
                1190,
                340
              ]
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "c7xV26SecondWagon",
    "chapter": 7,
    "beforeNode": "c7v25OdricFarewell",
    "title": "山雨里的第二趟车",
    "introScene": "c7v26SecondWagonIntro",
    "routeMaps": [
      "ch7OdricPass"
    ],
    "steps": [
      {
        "id": "axles",
        "title": "夺回备用车轴套件",
        "map": "ch7OdricPass",
        "turnIn": {
          "map": "ch7OdricPass",
          "npc": "odric",
          "name": "奥德里克",
          "x": 890,
          "y": 595,
          "sprite": 8
        },
        "scene": "c7v26SecondWagonAxles",
        "reward": {
          "xp": 650,
          "gold": 120,
          "items": {
            "hpGrand": 2,
            "mpGrand": 1
          },
          "random": false
        },
        "collect": [
          {
            "id": "v26C7AxleSpare",
            "name": "备用车轴套件",
            "count": 6,
            "source": "drop"
          }
        ],
        "kills": {
          "type": "v25RidgeRaider",
          "count": 10
        }
      },
      {
        "id": "wedges",
        "title": "找木料补齐六块车轮楔",
        "map": "ch7OdricPass",
        "turnIn": {
          "map": "ch7OdricPass",
          "npc": "odric",
          "name": "奥德里克",
          "x": 890,
          "y": 595,
          "sprite": 8
        },
        "scene": "c7v26SecondWagonWedges",
        "reward": {
          "xp": 730,
          "gold": 140,
          "items": {
            "hpGrand": 2,
            "mpGrand": 1
          },
          "random": false
        },
        "collect": [
          {
            "id": "v26C7WheelWedge",
            "name": "可削作车轮楔的硬木",
            "count": 6,
            "source": "gather",
            "points": [
              [
                410,
                635
              ],
              [
                570,
                575
              ],
              [
                630,
                735
              ],
              [
                860,
                465
              ],
              [
                1010,
                785
              ],
              [
                1130,
                500
              ]
            ]
          }
        ]
      },
      {
        "id": "medicine",
        "title": "清开矮林取回散落的药包",
        "map": "ch7OdricPass",
        "turnIn": {
          "map": "ch7OdricPass",
          "npc": "odric",
          "name": "奥德里克",
          "x": 890,
          "y": 595,
          "sprite": 8
        },
        "scene": "c7v26SecondWagonComplete",
        "reward": {
          "xp": 810,
          "gold": 160,
          "items": {
            "hpGrand": 2,
            "mpGrand": 1
          },
          "random": true
        },
        "collect": [
          {
            "id": "v26C7WagonMedicine",
            "name": "散落的车载药包",
            "count": 8,
            "source": "gather",
            "points": [
              [
                410,
                635
              ],
              [
                570,
                575
              ],
              [
                630,
                735
              ],
              [
                860,
                465
              ],
              [
                1010,
                785
              ],
              [
                1130,
                500
              ],
              [
                1320,
                630
              ],
              [
                1130,
                815
              ]
            ]
          }
        ],
        "kills": {
          "type": "v25MoorWolf",
          "count": 8
        }
      }
    ]
  },
  {
    "id": "c7xV26MedicineRounds",
    "chapter": 7,
    "beforeNode": "c7v25MarthaFarewell",
    "title": "药炉不能熄",
    "introScene": "c7v26MedicineRoundsIntro",
    "routeMaps": [
      "ch7MarthaHospice"
    ],
    "steps": [
      {
        "id": "leaves",
        "title": "为伤者补齐干药",
        "map": "ch7MarthaHospice",
        "turnIn": {
          "map": "ch7MarthaHospice",
          "npc": "martha",
          "name": "玛尔塔夫人",
          "x": 795,
          "y": 610,
          "sprite": 11
        },
        "scene": "c7v26MedicineRoundsHerbs",
        "reward": {
          "xp": 650,
          "gold": 120,
          "items": {
            "hpGrand": 2,
            "mpGrand": 1
          },
          "random": false
        },
        "collect": [
          {
            "id": "v26C7DryHerb",
            "name": "药方里缺的干叶",
            "count": 8,
            "source": "gather",
            "points": [
              [
                415,
                565
              ],
              [
                555,
                670
              ],
              [
                750,
                540
              ],
              [
                885,
                795
              ],
              [
                995,
                460
              ],
              [
                1250,
                695
              ],
              [
                1310,
                825
              ],
              [
                865,
                885
              ]
            ]
          }
        ]
      },
      {
        "id": "packets",
        "title": "追回桥头要用的封药",
        "map": "ch7MarthaHospice",
        "turnIn": {
          "map": "ch7MarthaHospice",
          "npc": "martha",
          "name": "玛尔塔夫人",
          "x": 795,
          "y": 610,
          "sprite": 11
        },
        "scene": "c7v26MedicineRoundsPackets",
        "reward": {
          "xp": 730,
          "gold": 140,
          "items": {
            "hpGrand": 2,
            "mpGrand": 1
          },
          "random": false
        },
        "collect": [
          {
            "id": "v26C7SealedMedicine",
            "name": "红线封好的药包",
            "count": 6,
            "source": "drop"
          }
        ],
        "kills": {
          "type": "v25RidgeRaider",
          "count": 10
        }
      },
      {
        "id": "repairs",
        "title": "备好防雨用具并修牢井盖",
        "map": "ch7MarthaHospice",
        "turnIn": {
          "map": "ch7MarthaHospice",
          "npc": "martha",
          "name": "玛尔塔夫人",
          "x": 795,
          "y": 610,
          "sprite": 11
        },
        "scene": "c7v26MedicineRoundsComplete",
        "reward": {
          "xp": 810,
          "gold": 160,
          "items": {
            "hpGrand": 2,
            "mpGrand": 1
          },
          "random": true
        },
        "collect": [
          {
            "id": "v26C7Oilcloth",
            "name": "包药用的油布",
            "count": 4,
            "source": "gather",
            "points": [
              [
                415,
                565
              ],
              [
                555,
                670
              ],
              [
                750,
                540
              ],
              [
                885,
                795
              ]
            ]
          },
          {
            "id": "v26C7WellFasteners",
            "name": "修井盖的木钉与扎绳",
            "count": 4,
            "source": "gather",
            "points": [
              [
                995,
                460
              ],
              [
                1250,
                695
              ],
              [
                1310,
                825
              ],
              [
                865,
                885
              ]
            ]
          }
        ]
      }
    ]
  }
];
