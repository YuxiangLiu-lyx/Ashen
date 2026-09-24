// Generated atlas metadata. Images remain original imagegen outputs.
export const V14_PORTRAIT_META = {
  "path": "/workspace/scratch/9af9bfcb7d1c/v14/art/portraits-v14-key.png",
  "file": "portraits-v14-key.png",
  "width": 1774,
  "height": 887,
  "grid": [
    4,
    2
  ],
  "xBoundaries": [
    0,
    444,
    887,
    1331,
    1774
  ],
  "yBoundaries": [
    0,
    444,
    887
  ],
  "keying": {
    "enabled": true,
    "mode": "existing ArtBank.load key=true",
    "requestedBackground": "#ff00ff",
    "note": "生成像素为近洋红色，非每像素精确255/0/255；现有宽容色键通过角落抽样。不得用精确相等255,0,255检测。",
    "rule": "r > 170 && b > 165 && g < min(r,b) * 0.55; preserve existing two edge passes"
  },
  "items": [
    {
      "index": 0,
      "id": "leon",
      "name": "雷昂",
      "role": "退役圣骑战士",
      "sourceRect": [
        0,
        0,
        444,
        444
      ],
      "cell": [
        0,
        0,
        444,
        444
      ],
      "anchorInSourceRect": [
        222.0,
        444
      ],
      "anchorType": "portrait-bottom-center, not a world actor foot",
      "referenceHeight": 444,
      "referenceWidth": 444
    },
    {
      "index": 1,
      "id": "viska",
      "name": "维斯卡",
      "role": "教廷督使",
      "sourceRect": [
        444,
        0,
        443,
        444
      ],
      "cell": [
        444,
        0,
        443,
        444
      ],
      "anchorInSourceRect": [
        221.5,
        444
      ],
      "anchorType": "portrait-bottom-center, not a world actor foot",
      "referenceHeight": 444,
      "referenceWidth": 443
    },
    {
      "index": 2,
      "id": "barlun",
      "name": "巴尔伦",
      "role": "枢密长",
      "sourceRect": [
        887,
        0,
        444,
        444
      ],
      "cell": [
        887,
        0,
        444,
        444
      ],
      "anchorInSourceRect": [
        222.0,
        444
      ],
      "anchorType": "portrait-bottom-center, not a world actor foot",
      "referenceHeight": 444,
      "referenceWidth": 444
    },
    {
      "index": 3,
      "id": "village_granny",
      "name": "白槲村老妇",
      "role": "善良老妇",
      "sourceRect": [
        1331,
        0,
        443,
        444
      ],
      "cell": [
        1331,
        0,
        443,
        444
      ],
      "anchorInSourceRect": [
        221.5,
        444
      ],
      "anchorType": "portrait-bottom-center, not a world actor foot",
      "referenceHeight": 444,
      "referenceWidth": 443
    },
    {
      "index": 4,
      "id": "village_farmer",
      "name": "白槲村老农",
      "role": "年迈农夫",
      "sourceRect": [
        0,
        444,
        444,
        443
      ],
      "cell": [
        0,
        444,
        444,
        443
      ],
      "anchorInSourceRect": [
        222.0,
        443
      ],
      "anchorType": "portrait-bottom-center, not a world actor foot",
      "referenceHeight": 443,
      "referenceWidth": 444
    },
    {
      "index": 5,
      "id": "graena",
      "name": "格蕾娜",
      "role": "锻匠",
      "sourceRect": [
        444,
        444,
        443,
        443
      ],
      "cell": [
        444,
        444,
        443,
        443
      ],
      "anchorInSourceRect": [
        221.5,
        443
      ],
      "anchorType": "portrait-bottom-center, not a world actor foot",
      "referenceHeight": 443,
      "referenceWidth": 443
    },
    {
      "index": 6,
      "id": "miya",
      "name": "弥娅",
      "role": "药剂师",
      "sourceRect": [
        887,
        444,
        444,
        443
      ],
      "cell": [
        887,
        444,
        444,
        443
      ],
      "anchorInSourceRect": [
        222.0,
        443
      ],
      "anchorType": "portrait-bottom-center, not a world actor foot",
      "referenceHeight": 443,
      "referenceWidth": 444
    },
    {
      "index": 7,
      "id": "serena",
      "name": "瑟琳娜",
      "role": "新亡灵城酒馆老板娘；原画稿提示词名Lotti，最终故事名瑟琳娜",
      "sourceRect": [
        1331,
        444,
        443,
        443
      ],
      "cell": [
        1331,
        444,
        443,
        443
      ],
      "anchorInSourceRect": [
        221.5,
        443
      ],
      "anchorType": "portrait-bottom-center, not a world actor foot",
      "referenceHeight": 443,
      "referenceWidth": 443
    }
  ]
};
export const V14_CITY_PROP_META = {
  "path": "/workspace/scratch/9af9bfcb7d1c/v14/art/city-props-v14-key.png",
  "file": "city-props-v14-key.png",
  "width": 1448,
  "height": 1086,
  "grid": [
    4,
    3
  ],
  "keying": {
    "enabled": true,
    "mode": "existing ArtBank.load key=true",
    "requestedBackground": "#ff00ff",
    "note": "生成像素为近洋红色，非每像素精确255/0/255；现有宽容色键通过角落抽样。不得用精确相等255,0,255检测。",
    "rule": "r > 170 && b > 165 && g < min(r,b) * 0.55; preserve existing two edge passes"
  },
  "cropRule": "Use individual sourceRect only. Nominal 362px grid is ordering metadata; generated shapes extend across nominal boundaries but remain visually separate. Uniform grid slicing truncates towers/bases.",
  "worldAnchorRule": "drawImage(sourceRect, worldX-anchorInSourceRect[0]*unit, worldY-anchorInSourceRect[1]*unit, w*unit,h*unit); sort by worldY; do not use sprite top as worldY.",
  "items": [
    {
      "index": 0,
      "id": "city_gate",
      "name": "金铜城门",
      "nominalCell": [
        0,
        0,
        362,
        362
      ],
      "sourceRect": [
        12,
        3,
        369,
        376
      ],
      "footAnchor": [
        200,
        356
      ],
      "anchorInSourceRect": [
        188,
        353
      ],
      "anchorDescription": "双门柱前沿落地接触点之间的中点；空拱洞保持可透视，不把整幅矩形用作碰撞",
      "referenceHeight": 376,
      "referenceWidth": 369,
      "suggestedWorldWidth": 330,
      "suggestedUnit": 0.894309
    },
    {
      "index": 1,
      "id": "luxury_shop",
      "name": "精致店铺门面",
      "nominalCell": [
        362,
        0,
        362,
        362
      ],
      "sourceRect": [
        387,
        3,
        325,
        364
      ],
      "footAnchor": [
        553,
        357
      ],
      "anchorInSourceRect": [
        166,
        354
      ],
      "anchorDescription": "入口前阶与地面接触处中点",
      "referenceHeight": 364,
      "referenceWidth": 325,
      "suggestedWorldWidth": 270,
      "suggestedUnit": 0.830769
    },
    {
      "index": 2,
      "id": "gothic_tavern",
      "name": "哥特酒馆",
      "nominalCell": [
        724,
        0,
        362,
        362
      ],
      "sourceRect": [
        717,
        11,
        381,
        371
      ],
      "footAnchor": [
        905,
        370
      ],
      "anchorInSourceRect": [
        188,
        359
      ],
      "anchorDescription": "前门阶底沿中心",
      "referenceHeight": 371,
      "referenceWidth": 381,
      "suggestedWorldWidth": 290,
      "suggestedUnit": 0.761155
    },
    {
      "index": 3,
      "id": "forge",
      "name": "锻造台",
      "nominalCell": [
        1086,
        0,
        362,
        362
      ],
      "sourceRect": [
        1105,
        10,
        331,
        367
      ],
      "footAnchor": [
        1274,
        359
      ],
      "anchorInSourceRect": [
        169,
        349
      ],
      "anchorDescription": "锻台与炉体共同底座前沿中点",
      "referenceHeight": 367,
      "referenceWidth": 331,
      "suggestedWorldWidth": 180,
      "suggestedUnit": 0.543807
    },
    {
      "index": 4,
      "id": "alchemy_machine",
      "name": "药剂机器",
      "nominalCell": [
        0,
        362,
        362,
        362
      ],
      "sourceRect": [
        32,
        380,
        325,
        363
      ],
      "footAnchor": [
        193,
        725
      ],
      "anchorInSourceRect": [
        161,
        345
      ],
      "anchorDescription": "机器柜体落地前沿中心",
      "referenceHeight": 363,
      "referenceWidth": 325,
      "suggestedWorldWidth": 170,
      "suggestedUnit": 0.523077
    },
    {
      "index": 5,
      "id": "streetlamp",
      "name": "华丽街灯",
      "nominalCell": [
        362,
        362,
        362,
        362
      ],
      "sourceRect": [
        430,
        367,
        187,
        370
      ],
      "footAnchor": [
        522,
        726
      ],
      "anchorInSourceRect": [
        92,
        359
      ],
      "anchorDescription": "灯柱底座前沿中心",
      "referenceHeight": 370,
      "referenceWidth": 187,
      "suggestedWorldWidth": 54,
      "suggestedUnit": 0.28877
    },
    {
      "index": 6,
      "id": "fountain",
      "name": "华丽喷泉",
      "nominalCell": [
        724,
        362,
        362,
        362
      ],
      "sourceRect": [
        679,
        381,
        392,
        363
      ],
      "footAnchor": [
        876,
        738
      ],
      "anchorInSourceRect": [
        197,
        357
      ],
      "anchorDescription": "圆形池沿最前缘接地点中心",
      "referenceHeight": 363,
      "referenceWidth": 392,
      "suggestedWorldWidth": 245,
      "suggestedUnit": 0.625
    },
    {
      "index": 7,
      "id": "purple_tent",
      "name": "紫金帐篷",
      "nominalCell": [
        1086,
        362,
        362,
        362
      ],
      "sourceRect": [
        1090,
        378,
        347,
        358
      ],
      "footAnchor": [
        1265,
        722
      ],
      "anchorInSourceRect": [
        175,
        344
      ],
      "anchorDescription": "前柜台与两前立柱落地边中点",
      "referenceHeight": 358,
      "referenceWidth": 347,
      "suggestedWorldWidth": 220,
      "suggestedUnit": 0.634006
    },
    {
      "index": 8,
      "id": "tavern_table",
      "name": "酒桌椅",
      "nominalCell": [
        0,
        724,
        362,
        362
      ],
      "sourceRect": [
        21,
        788,
        352,
        265
      ],
      "footAnchor": [
        197,
        1042
      ],
      "anchorInSourceRect": [
        176,
        254
      ],
      "anchorDescription": "桌子中央底足前端；两侧椅子与桌子作为同一组物体",
      "referenceHeight": 265,
      "referenceWidth": 352,
      "suggestedWorldWidth": 130,
      "suggestedUnit": 0.369318
    },
    {
      "index": 9,
      "id": "clockwork_game",
      "name": "机械游戏机",
      "nominalCell": [
        362,
        724,
        362,
        362
      ],
      "sourceRect": [
        416,
        740,
        264,
        320
      ],
      "footAnchor": [
        550,
        1048
      ],
      "anchorInSourceRect": [
        134,
        308
      ],
      "anchorDescription": "游戏柜最下部横底座中心",
      "referenceHeight": 320,
      "referenceWidth": 264,
      "suggestedWorldWidth": 95,
      "suggestedUnit": 0.359848
    },
    {
      "index": 10,
      "id": "mercenary_counter",
      "name": "佣兵柜台",
      "nominalCell": [
        724,
        724,
        362,
        362
      ],
      "sourceRect": [
        703,
        748,
        349,
        321
      ],
      "footAnchor": [
        883,
        1052
      ],
      "anchorInSourceRect": [
        180,
        304
      ],
      "anchorDescription": "前柜体最下部脚座中点",
      "referenceHeight": 321,
      "referenceWidth": 349,
      "suggestedWorldWidth": 165,
      "suggestedUnit": 0.472779
    },
    {
      "index": 11,
      "id": "bridge_railing",
      "name": "金属桥栏",
      "nominalCell": [
        1086,
        724,
        362,
        362
      ],
      "sourceRect": [
        1078,
        756,
        363,
        302
      ],
      "footAnchor": [
        1262,
        1001
      ],
      "anchorInSourceRect": [
        184,
        245
      ],
      "anchorDescription": "中央桥栏立柱底部中心；左右脚沿斜向地平线分布，勿强制改锚到图片最底部",
      "referenceHeight": 302,
      "referenceWidth": 363,
      "suggestedWorldWidth": 220,
      "suggestedUnit": 0.606061
    }
  ]
};
export const V14_EXTRA_PORTRAIT_META = {
  "path": "/workspace/scratch/9af9bfcb7d1c/v14/art/portraits-extra-v14.png",
  "file": "portraits-extra-v14.png",
  "width": 1254,
  "height": 1254,
  "grid": [
    2,
    2
  ],
  "keying": {
    "enabled": false,
    "mode": "native RGBA alpha",
    "alphaExtrema": [
      0,
      255
    ]
  },
  "items": [
    {
      "index": 0,
      "id": "v14_inquisitor",
      "name": "教廷调查官",
      "sourceRect": [
        0,
        0,
        627,
        627
      ],
      "cell": [
        0,
        0,
        627,
        627
      ],
      "anchorInSourceRect": [
        313.5,
        627
      ],
      "anchorType": "portrait-bottom-center, not a world actor foot",
      "referenceHeight": 627,
      "referenceWidth": 627
    },
    {
      "index": 1,
      "id": "v14_bodyguard",
      "name": "第一近卫",
      "sourceRect": [
        627,
        0,
        627,
        627
      ],
      "cell": [
        627,
        0,
        627,
        627
      ],
      "anchorInSourceRect": [
        313.5,
        627
      ],
      "anchorType": "portrait-bottom-center, not a world actor foot",
      "referenceHeight": 627,
      "referenceWidth": 627
    },
    {
      "index": 2,
      "id": "v14_broker",
      "name": "赛芙",
      "sourceRect": [
        0,
        627,
        627,
        627
      ],
      "cell": [
        0,
        627,
        627,
        627
      ],
      "anchorInSourceRect": [
        313.5,
        627
      ],
      "anchorType": "portrait-bottom-center, not a world actor foot",
      "referenceHeight": 627,
      "referenceWidth": 627
    },
    {
      "index": 3,
      "id": "v14_archivist",
      "name": "维兰",
      "sourceRect": [
        627,
        627,
        627,
        627
      ],
      "cell": [
        627,
        627,
        627,
        627
      ],
      "anchorInSourceRect": [
        313.5,
        627
      ],
      "anchorType": "portrait-bottom-center, not a world actor foot",
      "referenceHeight": 627,
      "referenceWidth": 627
    }
  ]
};
