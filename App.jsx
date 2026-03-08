import { useState, useMemo } from "react";


const PERF_PERIODS = [
  { key:"1y", label:"1\u5e74" },{ key:"6m", label:"6\u30f6\u6708" },{ key:"3m", label:"3\u30f6\u6708" },
  { key:"1m", label:"1\u30f6\u6708" },{ key:"10d", label:"10\u65e5" },{ key:"1d", label:"1\u65e5" },
];
const CHART_TYPES = [
  { key:"monthly", label:"\u6708\u8db3" },{ key:"weekly", label:"\u9031\u8db3" },{ key:"daily", label:"\u65e5\u8db3" },
];


const SM = {
  // AI\u30fbGPU
  NVDA:{n:"\u30a8\u30cc\u30d3\u30c7\u30a3\u30a2",      p:180, v:312000000,rsi:72,perf:{"1y":215,"6m":78,"3m":35,"1m":14.2,"10d":5.8,"1d":1.8},d:"AI\u30a2\u30af\u30bb\u30e9\u30ec\u30fc\u30bfGPU\u3067\u5e02\u5834\u30b7\u30a7\u30a280%\u8d85\u3002CUDA\u30a8\u30b3\u30b7\u30b9\u30c6\u30e0\u3067AI\u5b66\u7fd2\u306e\u6a19\u6e96\u57fa\u76e4\u3002"},
  AMD: {n:"AMD",               p:191, v:89000000, rsi:54,perf:{"1y":95,"6m":34,"3m":15,"1m":5.1,"10d":2.1,"1d":0.6},d:"CPU\u3068GPU\u53cc\u65b9\u3067\u7af6\u5408\u529b\u3092\u6301\u3064\u552f\u4e00\u306e\u30e1\u30fc\u30ab\u30fc\u3002MI300X\u3067AI\u63a8\u8ad6\u5e02\u5834\u306b\u9032\u51fa\u4e2d\u3002"},
  INTC:{n:"\u30a4\u30f3\u30c6\u30eb",           p:43,  v:198000000,rsi:38,perf:{"1y":-28,"6m":-14,"3m":-7,"1m":-2.2,"10d":-0.9,"1d":-0.2},d:"x86 CPU\u306e\u767a\u660e\u8005\u3002\u30d5\u30a1\u30a6\u30f3\u30c9\u30ea\u4e8b\u696d\u518d\u5efa\u3068AI PC\u30c1\u30c3\u30d7\u3067\u5dfb\u304d\u8fd4\u3057\u3092\u56f3\u308b\u3002"},
  ARM: {n:"ARM",               p:127, v:18000000, rsi:62,perf:{"1y":142,"6m":48,"3m":21,"1m":8.1,"10d":3.2,"1d":1.0},d:"\u30b9\u30de\u30fc\u30c8\u30d5\u30a9\u30f3\u30fbIoT\u30fbAI\u30c1\u30c3\u30d7\u306e\u8a2d\u8a08\u30e9\u30a4\u30bb\u30f3\u30b9\u4f01\u696d\u3002"},
  MRVL:{n:"\u30de\u30fc\u30d9\u30eb\u30fb\u30c6\u30af\u30ce\u30ed\u30b8\u30fc",p:78,v:24000000, rsi:58,perf:{"1y":62,"6m":24,"3m":10,"1m":3.8,"10d":1.5,"1d":0.4},d:"\u30ab\u30b9\u30bf\u30e0AI\u30c1\u30c3\u30d7(ASIC)\u3068\u30c7\u30fc\u30bf\u30bb\u30f3\u30bf\u30fc\u5411\u3051\u30cd\u30c3\u30c8\u30ef\u30fc\u30af\u534a\u5c0e\u4f53\u3092\u63d0\u4f9b\u3002"},
  // \u534a\u5c0e\u4f53\u88c5\u7f6e\u30fb\u8a2d\u8a08
  AVGO:{n:"\u30d6\u30ed\u30fc\u30c9\u30b3\u30e0",       p:314,v:42000000, rsi:68,perf:{"1y":125,"6m":45,"3m":21,"1m":7.4,"10d":3.2,"1d":0.8},d:"\u30ab\u30b9\u30bf\u30e0AI\u30c1\u30c3\u30d7\u30fb\u30cd\u30c3\u30c8\u30ef\u30fc\u30af\u534a\u5c0e\u4f53\u3092\u958b\u767a\u3002Apple\u30fbGoogle\u30fbMeta\u3068\u5927\u578b\u5951\u7d04\u3002"},
  QCOM:{n:"\u30af\u30a2\u30eb\u30b3\u30e0",         p:142, v:28000000, rsi:48,perf:{"1y":42,"6m":15,"3m":7,"1m":2.3,"10d":0.9,"1d":0.2},d:"\u30b9\u30de\u30fc\u30c8\u30d5\u30a9\u30f3\u5411\u3051Snapdragon\u30c1\u30c3\u30d7\u3067\u4e16\u754c\u9996\u4f4d\u3002\u8eca\u8f09\u30fb\u30a8\u30c3\u30b8AI\u306b\u62e1\u5927\u4e2d\u3002"},
  TXN: {n:"\u30c6\u30ad\u30b5\u30b9\u30fb\u30a4\u30f3\u30b9\u30c4\u30eb\u30e1\u30f3\u30c4",p:212,v:8000000,rsi:52,perf:{"1y":12,"6m":4,"3m":1.8,"1m":0.6,"10d":0.3,"1d":0.1},d:"\u30a2\u30ca\u30ed\u30b0\u534a\u5c0e\u4f53\u3068\u7d44\u307f\u8fbc\u307f\u30d7\u30ed\u30bb\u30c3\u30b5\u306e\u4e16\u754c\u6700\u5927\u30e1\u30fc\u30ab\u30fc\u3002\u7523\u696d\u30fb\u81ea\u52d5\u8eca\u5e02\u5834\u306b\u5f37\u307f\u3002"},
  AMAT:{n:"\u30a2\u30d7\u30e9\u30a4\u30c9\u30fb\u30de\u30c6\u30ea\u30a2\u30eb\u30ba",p:351,v:12000000,rsi:58,perf:{"1y":62,"6m":22,"3m":10,"1m":3.4,"10d":1.4,"1d":0.4},d:"\u534a\u5c0e\u4f53\u88fd\u9020\u88c5\u7f6e\u30fb\u6750\u6599\u306e\u4e16\u754c\u6700\u5927\u30e1\u30fc\u30ab\u30fc\u3002AI\u30c1\u30c3\u30d7\u88fd\u9020\u306b\u4e0d\u53ef\u6b20\u306a\u5148\u7aef\u88c5\u7f6e\u3092\u63d0\u4f9b\u3002"},
  LRCX:{n:"\u30e9\u30e0\u30ea\u30b5\u30fc\u30c1",       p:217, v:4800000,  rsi:62,perf:{"1y":68,"6m":24,"3m":10,"1m":3.8,"10d":1.5,"1d":0.4},d:"\u534a\u5c0e\u4f53\u30a8\u30c3\u30c1\u30f3\u30b0\u30fb\u5806\u7a4d\u88c5\u7f6e\u30e1\u30fc\u30ab\u30fc\u3002\u5148\u7aef\u30c1\u30c3\u30d7\u88fd\u9020\u306b\u4e0d\u53ef\u6b20\u306a\u88c5\u7f6e\u3067\u9ad8\u30b7\u30a7\u30a2\u3002"},
  KLAC:{n:"KLA\u30b3\u30fc\u30dd\u30ec\u30fc\u30b7\u30e7\u30f3", p:1525, v:4200000,  rsi:64,perf:{"1y":78,"6m":28,"3m":12,"1m":4.4,"10d":1.8,"1d":0.5},d:"\u534a\u5c0e\u4f53\u691c\u67fb\u88c5\u7f6e\u306e\u30ea\u30fc\u30c0\u30fc\u3002\u88fd\u9020\u30d7\u30ed\u30bb\u30b9\u306e\u4e0d\u826f\u691c\u51fa\u30fb\u6e2c\u5b9a\u3067\u5fc5\u9808\u306e\u88c5\u7f6e\u3092\u63d0\u4f9b\u3002"},
  ASML:{n:"ASML",              p:748, v:2800000,  rsi:61,perf:{"1y":28,"6m":10,"3m":4.2,"1m":1.5,"10d":0.6,"1d":0.2},d:"EUV\u30ea\u30bd\u30b0\u30e9\u30d5\u30a3\u88c5\u7f6e\u306e\u72ec\u5360\u7684\u4f9b\u7d66\u8005\u3002\u6700\u5148\u7aef\u534a\u5c0e\u4f53\u88fd\u9020\u306b\u4ee3\u66ff\u4e0d\u53ef\u80fd\u306a\u5b58\u5728\u3002"},
  MU:  {n:"\u30de\u30a4\u30af\u30ed\u30f3",         p:380, v:24000000, rsi:61,perf:{"1y":82,"6m":28,"3m":12,"1m":4.4,"10d":1.8,"1d":0.5},d:"HBM3E\u9700\u8981\u3067AI\u5411\u3051DRAM\u30fbNAND\u5e02\u5834\u3092\u30ea\u30fc\u30c9\u3002\u30c7\u30fc\u30bf\u30bb\u30f3\u30bf\u30fc\u5411\u3051\u304c\u6025\u62e1\u5927\u4e2d\u3002"},
  ON:  {n:"\u30aa\u30f3\u30fb\u30bb\u30df\u30b3\u30f3\u30c0\u30af\u30bf\u30fc",p:42, v:12000000, rsi:44,perf:{"1y":-18,"6m":-8,"3m":-2,"1m":-0.8,"10d":-0.3,"1d":-0.1},d:"EV\u30fb\u96fb\u529b\u7ba1\u7406\u5411\u3051\u30d1\u30ef\u30fc\u534a\u5c0e\u4f53\u30e1\u30fc\u30ab\u30fc\u3002SiC\u30d1\u30ef\u30fc\u30c7\u30d0\u30a4\u30b9\u3067EV\u5e02\u5834\u3092\u30ea\u30fc\u30c9\u3002"},
  SMCI:{n:"\u30b9\u30fc\u30d1\u30fc\u30de\u30a4\u30af\u30ed",    p:30, v:18000000, rsi:48,perf:{"1y":148,"6m":32,"3m":-8,"1m":-4.1,"10d":-2.2,"1d":-0.8},d:"AI\u30b5\u30fc\u30d0\u30fc\u30e9\u30c3\u30af\u306e\u8a2d\u8a08\u30fb\u88fd\u9020\u5927\u624b\u3002NVIDIA\u306eGPU\u3092\u642d\u8f09\u3059\u308b\u30b5\u30fc\u30d0\u30fc\u3067\u6025\u6210\u9577\u3002"},
  ANET:{n:"\u30a2\u30ea\u30b9\u30bf",           p:133, v:5300000,  rsi:60,perf:{"1y":98,"6m":36,"3m":16,"1m":6.2,"10d":2.4,"1d":0.7},d:"\u30c7\u30fc\u30bf\u30bb\u30f3\u30bf\u30fc\u5411\u3051\u30cd\u30c3\u30c8\u30ef\u30fc\u30ad\u30f3\u30b0\u6a5f\u5668\u306e\u30ea\u30fc\u30c0\u30fc\u3002\u30af\u30e9\u30a6\u30c9\u5927\u624b\u3068\u6df1\u3044\u95a2\u4fc2\u3002"},
  GLW: {n:"\u30b3\u30fc\u30cb\u30f3\u30b0",          p:150, v:11000000, rsi:62,perf:{"1y":72,"6m":28,"3m":12,"1m":4.2,"10d":1.8,"1d":0.5},d:"\u5149\u30d5\u30a1\u30a4\u30d0\u30fc\u30fb\u7279\u6b8a\u30ac\u30e9\u30b9\u306e\u4e16\u754c\u6700\u5927\u30e1\u30fc\u30ab\u30fc\u3002AI\u30c7\u30fc\u30bf\u30bb\u30f3\u30bf\u30fc\u5411\u3051\u5149\u30d5\u30a1\u30a4\u30d0\u30fc\u9700\u8981\u6025\u5897\u3067\u6069\u6075\u3002\u30ac\u30e9\u30b9\u57fa\u677f\u3067\u3082\u6b21\u4e16\u4ee3\u534a\u5c0e\u4f53\u30d1\u30c3\u30b1\u30fc\u30b8\u30f3\u30b0\u5e02\u5834\u306b\u53c2\u5165\u3002"},
  VRT: {n:"\u30f4\u30a1\u30fc\u30c6\u30a3\u30d6",        p:244,  v:12000000, rsi:72,perf:{"1y":248,"6m":88,"3m":38,"1m":14.4,"10d":5.8,"1d":1.8},d:"\u30c7\u30fc\u30bf\u30bb\u30f3\u30bf\u30fc\u5411\u3051\u96fb\u529b\u30fb\u51b7\u5374\u30a4\u30f3\u30d5\u30e9\u306e\u5927\u624b\u3002AI\u5411\u3051\u30c7\u30fc\u30bf\u30bb\u30f3\u30bf\u30fc\u6295\u8cc7\u6025\u5897\u3067\u6025\u9a30\u3002"},
  // \u30d3\u30c3\u30b0\u30c6\u30c3\u30af
  MSFT:{n:"\u30de\u30a4\u30af\u30ed\u30bd\u30d5\u30c8",     p:404, v:41000000,rsi:55,perf:{"1y":58,"6m":21,"3m":10,"1m":3.4,"10d":1.2,"1d":0.4},d:"OpenAI\u3078\u306e\u5927\u898f\u6a21\u6295\u8cc7\u3067Copilot\u3092Office\u30fbAzure\u5168\u88fd\u54c1\u306b\u7d71\u5408\u3002\u30a8\u30f3\u30bf\u30fc\u30d7\u30e9\u30a4\u30baAI\u5e02\u5834\u3092\u4e3b\u5c0e\u3002"},
  GOOGL:{n:"\u30a2\u30eb\u30d5\u30a1\u30d9\u30c3\u30c8",    p:304, v:145000000,rsi:58,perf:{"1y":49,"6m":18,"3m":8.4,"1m":2.9,"10d":1.0,"1d":0.3},d:"Gemini\u30e2\u30c7\u30eb\u3067OpenAI\u306b\u5bfe\u6297\u3002\u691c\u7d22\u30fbGCP\u30fbYouTube\u306bAI\u3092\u7d71\u5408\u5c55\u958b\u4e2d\u3002"},
  META:{n:"\u30e1\u30bf",              p:655, v:134000000,rsi:65,perf:{"1y":182,"6m":62,"3m":28,"1m":9.8,"10d":4.2,"1d":1.1},d:"Llama\u7cfb\u30aa\u30fc\u30d7\u30f3\u30bd\u30fc\u30b9LLM\u3092\u516c\u958b\u3002AI\u5e83\u544a\u3067Facebook\u30fbInstagram\u53ce\u76ca\u304c\u6025\u5897\u3002"},
  AMZN:{n:"\u30a2\u30de\u30be\u30f3",          p:209, v:124000000,rsi:64,perf:{"1y":82,"6m":33,"3m":15,"1m":5.0,"10d":1.7,"1d":0.4},d:"EC\u30fbAWS\u30fb\u5e83\u544a\u30fbPrime\u3002AWS\u306fAI\u30a4\u30f3\u30d5\u30e9\u9700\u8981\u3067\u9ad8\u6210\u9577\u3092\u7dad\u6301\u3002Bedrock\u3067\u4f01\u696d\u5411\u3051AI\u3092\u5c55\u958b\u3002"},
  AAPL:{n:"\u30a2\u30c3\u30d7\u30eb",          p:264, v:78000000, rsi:58,perf:{"1y":18,"6m":8,"3m":3.2,"1m":1.2,"10d":0.5,"1d":0.2},d:"iPhone\u30fbMac\u30fbServices\u30fbVision\u3092\u5c55\u958b\u3059\u308b\u4e16\u754c\u6700\u5927\u306e\u6d88\u8cbb\u8005\u5411\u3051\u30c6\u30c3\u30af\u4f01\u696d\u3002"},
  // \u30a8\u30f3\u30bf\u30fc\u30d7\u30e9\u30a4\u30baSaaS
  ORCL:{n:"\u30aa\u30e9\u30af\u30eb",          p:149, v:14000000, rsi:68,perf:{"1y":88,"6m":32,"3m":14,"1m":5.6,"10d":2.2,"1d":0.7},d:"\u30af\u30e9\u30a6\u30c9DB\u30fbERP\u30fbAI\u30a4\u30f3\u30d5\u30e9\u3067\u6025\u6210\u9577\u4e2d\u3002NVIDIA\u3068\u306e\u5927\u578b\u30af\u30e9\u30a6\u30c9GPU\u5951\u7d04\u304c\u6ce8\u76ee\u3002"},
  SAP: {n:"SAP",              p:280, v:4200000,  rsi:62,perf:{"1y":68,"6m":24,"3m":10,"1m":3.8,"10d":1.5,"1d":0.4},d:"\u30a8\u30f3\u30bf\u30fc\u30d7\u30e9\u30a4\u30baERP\u306e\u4e16\u754c\u6700\u5927\u624b\u3002S/4HANA\u30af\u30e9\u30a6\u30c9\u79fb\u884c\u3068AI\u7d71\u5408\u3067\u6210\u9577\u304c\u52a0\u901f\u3002"},
  CRM: {n:"\u30bb\u30fc\u30eb\u30b9\u30d5\u30a9\u30fc\u30b9",   p:195, v:23000000, rsi:58,perf:{"1y":45,"6m":18,"3m":8.1,"1m":2.8,"10d":1.2,"1d":0.3},d:"\u4e16\u754c\u6700\u5927\u306eCRM\u30d7\u30e9\u30c3\u30c8\u30d5\u30a9\u30fc\u30e0\u3002Einstein AI\u3067\u55b6\u696d\u30fb\u30ab\u30b9\u30bf\u30de\u30fc\u30b5\u30dd\u30fc\u30c8\u3092\u81ea\u52d5\u5316\u3002"},
  NOW: {n:"\u30b5\u30fc\u30d3\u30b9\u30ca\u30a6",      p:920, v:14000000, rsi:66,perf:{"1y":74,"6m":30,"3m":14,"1m":4.6,"10d":2.0,"1d":0.5},d:"\u30a8\u30f3\u30bf\u30fc\u30d7\u30e9\u30a4\u30baIT\u30fb\u696d\u52d9\u30d7\u30ed\u30bb\u30b9\u81ea\u52d5\u5316\u306e\u30ea\u30fc\u30c0\u30fc\u3002AI\u30ef\u30fc\u30af\u30d5\u30ed\u30fc\u81ea\u52d5\u5316\u3067\u6025\u6210\u9577\u3002"},
  WDAY:{n:"\u30ef\u30fc\u30af\u30c7\u30a4",        p:218, v:4800000,  rsi:58,perf:{"1y":22,"6m":8,"3m":3.4,"1m":1.2,"10d":0.5,"1d":0.2},d:"\u4eba\u4e8b\u30fb\u8ca1\u52d9\u30af\u30e9\u30a6\u30c9ERP\u5927\u624b\u3002AI\u8ca1\u52d9\u30a8\u30fc\u30b8\u30a7\u30f3\u30c8\u3067\u4f01\u696d\u306e\u81ea\u52d5\u5316\u3092\u52a0\u901f\u3002"},
  ADBE:{n:"\u30a2\u30c9\u30d3",            p:420, v:8200000,  rsi:52,perf:{"1y":18,"6m":8,"3m":3.2,"1m":1.2,"10d":0.5,"1d":0.2},d:"\u30af\u30ea\u30a8\u30a4\u30c6\u30a3\u30d6\u30bd\u30d5\u30c8\u30fbPDF\u30fb\u30de\u30fc\u30b1\u30c6\u30a3\u30f3\u30b0\u306e\u30ea\u30fc\u30c0\u30fc\u3002Firefly\u3067\u751f\u6210AI\u6a5f\u80fd\u3092\u7d71\u5408\u3002"},
  INTU:{n:"\u30a4\u30f3\u30c6\u30e5\u30a4\u30c3\u30c8",     p:12, v:4200000,  rsi:62,perf:{"1y":18,"6m":6,"3m":2.8,"1m":1.0,"10d":0.4,"1d":0.1},d:"TurboTax\u30fbQuickBooks\u30fbCredit Karma\u3092\u904b\u55b6\u3002AI\u4f1a\u8a08\u30a2\u30b7\u30b9\u30bf\u30f3\u30c8\u3067\u4e2d\u5c0f\u4f01\u696d\u3092\u652f\u63f4\u3002"},
  ZM:  {n:"\u30ba\u30fc\u30e0",            p:72,  v:8400000,  rsi:44,perf:{"1y":-12,"6m":-4,"3m":-1.8,"1m":-0.6,"10d":-0.2,"1d":-0.1},d:"\u30d3\u30c7\u30aa\u4f1a\u8b70\u30d7\u30e9\u30c3\u30c8\u30d5\u30a9\u30fc\u30e0\u3002\u30b3\u30ed\u30ca\u5f8c\u306e\u9700\u8981\u6e1b\u901f\u306b\u5bfe\u5fdc\u3057AI\u6a5f\u80fd\u642d\u8f09\u3067\u518d\u5efa\u4e2d\u3002"},
  // \u30af\u30e9\u30a6\u30c9\u30a4\u30f3\u30d5\u30e9\u30fb\u30c7\u30fc\u30bf
  SNOW:{n:"\u30b9\u30ce\u30fc\u30d5\u30ec\u30fc\u30af",    p:166, v:10000000, rsi:44,perf:{"1y":18,"6m":7,"3m":3.3,"1m":1.1,"10d":0.5,"1d":0.1},d:"\u30de\u30eb\u30c1\u30af\u30e9\u30a6\u30c9\u5bfe\u5fdc\u30c7\u30fc\u30bf\u30a6\u30a7\u30a2\u30cf\u30a6\u30b9\u3002AI/ML\u30ef\u30fc\u30af\u30ed\u30fc\u30c9\u3068\u30c7\u30fc\u30bf\u30b7\u30a7\u30a2\u30ea\u30f3\u30b0\u306b\u5bfe\u5fdc\u3002"},
  MDB: {n:"\u30e2\u30f3\u30b4DB",          p:248, v:5800000,  rsi:55,perf:{"1y":48,"6m":19,"3m":8.7,"1m":2.9,"10d":1.3,"1d":0.3},d:"\u30c9\u30ad\u30e5\u30e1\u30f3\u30c8\u6307\u5411NoSQL\u30c7\u30fc\u30bf\u30d9\u30fc\u30b9\u3002Atlas\u30af\u30e9\u30a6\u30c9\u3068\u30d9\u30af\u30bf\u30fcDB\u6a5f\u80fd\u3067AI\u6642\u4ee3\u306b\u5bfe\u5fdc\u3002"},
  DDOG:{n:"\u30c7\u30fc\u30bf\u30c9\u30c3\u30b0",      p:116, v:12000000, rsi:61,perf:{"1y":62,"6m":25,"3m":11,"1m":3.8,"10d":1.7,"1d":0.4},d:"\u30af\u30e9\u30a6\u30c9\u30a4\u30f3\u30d5\u30e9\u30fb\u30a2\u30d7\u30ea\u76e3\u8996\u30d7\u30e9\u30c3\u30c8\u30d5\u30a9\u30fc\u30e0\u3002DevOps\u30fbSRE\u306e\u53ef\u89b3\u6e2c\u6027\u30c4\u30fc\u30eb\u3002"},
  PLTR:{n:"\u30d1\u30e9\u30f3\u30c6\u30a3\u30a2",      p:147,  v:42000000, rsi:63,perf:{"1y":182,"6m":68,"3m":32,"1m":11.2,"10d":4.8,"1d":1.1},d:"\u653f\u5e9c\u30fb\u8ecd\u5411\u3051\u30d3\u30c3\u30b0\u30c7\u30fc\u30bf\u5206\u6790\u30d7\u30e9\u30c3\u30c8\u30d5\u30a9\u30fc\u30e0\u3002AIP\u3067\u5546\u696d\u90e8\u9580\u3082\u6025\u6210\u9577\u3002"},
  GTLB:{n:"\u30ae\u30c3\u30c8\u30e9\u30dc",        p:52,  v:6800000,  rsi:52,perf:{"1y":28,"6m":10,"3m":4.4,"1m":1.6,"10d":0.6,"1d":0.2},d:"DevSecOps\u30d7\u30e9\u30c3\u30c8\u30d5\u30a9\u30fc\u30e0\u3092\u30aa\u30fc\u30eb\u30a4\u30f3\u30ef\u30f3\u3067\u63d0\u4f9b\u3002AI\u652f\u63f4\u30b3\u30fc\u30c7\u30a3\u30f3\u30b0\u6a5f\u80fd\u3092\u7d71\u5408\u3002"},
  ESTC:{n:"\u30a8\u30e9\u30b9\u30c6\u30a3\u30c3\u30af",    p:88, v:4200000,  rsi:48,perf:{"1y":32,"6m":12,"3m":5.2,"1m":1.8,"10d":0.7,"1d":0.2},d:"Elasticsearch\u958b\u767a\u5143\u3002\u30ed\u30b0\u5206\u6790\u30fb\u691c\u7d22\u30fbAI\u30d9\u30af\u30bf\u30fc\u691c\u7d22\u306b\u5f37\u307f\u3092\u6301\u3064\u30af\u30e9\u30a6\u30c9\u30d7\u30e9\u30c3\u30c8\u30d5\u30a9\u30fc\u30e0\u3002"},
  // \u30bb\u30ad\u30e5\u30ea\u30c6\u30a3
  CRWD:{n:"\u30af\u30e9\u30a6\u30c9\u30b9\u30c8\u30e9\u30a4\u30af", p:392, v:38000000, rsi:70,perf:{"1y":112,"6m":45,"3m":20,"1m":7.2,"10d":3.1,"1d":0.8},d:"\u30af\u30e9\u30a6\u30c9\u30cd\u30a4\u30c6\u30a3\u30d6\u306e\u30a8\u30f3\u30c9\u30dd\u30a4\u30f3\u30c8\u30bb\u30ad\u30e5\u30ea\u30c6\u30a3\u300cFalcon\u300d\u3092\u63d0\u4f9b\u3002AI\u8105\u5a01\u691c\u77e5\u3067\u696d\u754c\u9996\u4f4d\u3002"},
  PANW:{n:"\u30d1\u30ed\u30a2\u30eb\u30c8",        p:156, v:29000000, rsi:62,perf:{"1y":68,"6m":27,"3m":12,"1m":4.2,"10d":1.8,"1d":0.4},d:"\u6b21\u4e16\u4ee3\u30d5\u30a1\u30a4\u30a2\u30a6\u30a9\u30fc\u30eb\u304b\u3089SASE\u30fbXDR\u307e\u3067\u5305\u62ec\u7684\u306a\u30bb\u30ad\u30e5\u30ea\u30c6\u30a3\u30d7\u30e9\u30c3\u30c8\u30d5\u30a9\u30fc\u30e0\u3092\u63d0\u4f9b\u3002"},
  ZS:  {n:"\u30bc\u30c3\u30c8\u30b9\u30b1\u30fc\u30e9\u30fc",  p:212, v:14000000, rsi:58,perf:{"1y":52,"6m":21,"3m":9.4,"1m":3.2,"10d":1.4,"1d":0.3},d:"\u30bc\u30ed\u30c8\u30e9\u30b9\u30c8\u30a2\u30fc\u30ad\u30c6\u30af\u30c1\u30e3\u306b\u7279\u5316\u3057\u305f\u30af\u30e9\u30a6\u30c9\u30bb\u30ad\u30e5\u30ea\u30c6\u30a3\u30d7\u30e9\u30c3\u30c8\u30d5\u30a9\u30fc\u30e0\u3002"},
  OKTA:{n:"\u30aa\u30af\u30bf",            p:82,  v:9300000,  rsi:44,perf:{"1y":18,"6m":7,"3m":3.3,"1m":1.1,"10d":0.5,"1d":0.1},d:"ID\u30fb\u30a2\u30af\u30bb\u30b9\u7ba1\u7406\u306e\u30af\u30e9\u30a6\u30c9\u30ea\u30fc\u30c0\u30fc\u3002\u30bc\u30ed\u30c8\u30e9\u30b9\u30c8\u306e\u5165\u53e3\u3068\u306a\u308b\u8a8d\u8a3c\u57fa\u76e4\u3068\u3057\u3066\u5e83\u304f\u63a1\u7528\u3002"},
  FTNT:{n:"\u30d5\u30a9\u30fc\u30c6\u30a3\u30cd\u30c3\u30c8",  p:28,  v:11000000, rsi:52,perf:{"1y":38,"6m":15,"3m":7.1,"1m":2.3,"10d":1.0,"1d":0.2},d:"FortiGate\u88fd\u54c1\u7fa4\u3067\u30cd\u30c3\u30c8\u30ef\u30fc\u30af\u30bb\u30ad\u30e5\u30ea\u30c6\u30a3\u3092\u63d0\u4f9b\u3002\u72ec\u81eaASIC\u3067\u30cf\u30fc\u30c9\u30a6\u30a7\u30a2\u6027\u80fd\u306b\u512a\u4f4d\u6027\u3002"},
  CYBR:{n:"\u30b5\u30a4\u30d0\u30fc\u30a2\u30fc\u30af",    p:318, v:2400000,  rsi:64,perf:{"1y":68,"6m":24,"3m":10,"1m":3.8,"10d":1.5,"1d":0.4},d:"\u7279\u6a29\u30a2\u30af\u30bb\u30b9\u7ba1\u7406(PAM)\u306e\u30ea\u30fc\u30c0\u30fc\u3002ID\u4e2d\u5fc3\u306e\u30bc\u30ed\u30c8\u30e9\u30b9\u30c8\u30bb\u30ad\u30e5\u30ea\u30c6\u30a3\u30a2\u30fc\u30ad\u30c6\u30af\u30c1\u30e3\u3092\u63a8\u9032\u3002"},
  S:   {n:"\u30bb\u30f3\u30c1\u30cd\u30eb\u30ef\u30f3",    p:18,  v:18000000, rsi:48,perf:{"1y":28,"6m":10,"3m":4.4,"1m":1.6,"10d":0.6,"1d":0.2},d:"\u6b21\u4e16\u4ee3\u30a8\u30f3\u30c9\u30dd\u30a4\u30f3\u30c8\u30bb\u30ad\u30e5\u30ea\u30c6\u30a3\u3002Singularity\u30d7\u30e9\u30c3\u30c8\u30d5\u30a9\u30fc\u30e0\u3067\u30af\u30e9\u30a6\u30c9\u30cd\u30a4\u30c6\u30a3\u30d6\u306b\u5bfe\u5fdc\u3002"},
  QLYS:{n:"\u30af\u30a2\u30ea\u30b9",          p:132, v:2800000,  rsi:54,perf:{"1y":22,"6m":8,"3m":3.4,"1m":1.2,"10d":0.5,"1d":0.1},d:"\u30af\u30e9\u30a6\u30c9\u30d9\u30fc\u30b9\u306e\u30bb\u30ad\u30e5\u30ea\u30c6\u30a3\u30fb\u30b3\u30f3\u30d7\u30e9\u30a4\u30a2\u30f3\u30b9\u7ba1\u7406\u30d7\u30e9\u30c3\u30c8\u30d5\u30a9\u30fc\u30e0\u3092\u63d0\u4f9b\u3002"},
  // EV\u30fb\u81ea\u52d5\u8eca
  TSLA:{n:"\u30c6\u30b9\u30e9",            p:392, v:412000000,rsi:42,perf:{"1y":-24,"6m":-18,"3m":8.2,"1m":-3.4,"10d":-2.1,"1d":-0.5},d:"EV\u30fb\u84c4\u96fb\u6c60\u30fb\u592a\u967d\u5149\u30d1\u30cd\u30eb\u3092\u5782\u76f4\u7d71\u5408\u3059\u308b\u30a8\u30cd\u30eb\u30ae\u30fc\u4f01\u696d\u3002FSD\u3067\u81ea\u52d5\u904b\u8ee2\u30bd\u30d5\u30c8\u53ce\u76ca\u5316\u3092\u76ee\u6307\u3059\u3002"},
  RIVN:{n:"\u30ea\u30d3\u30a2\u30f3",          p:12,  v:78000000, rsi:35,perf:{"1y":-52,"6m":-32,"3m":4.2,"1m":-2.8,"10d":-1.9,"1d":-0.2},d:"Amazon\u3068\u63d0\u643a\u3059\u308bEV\u30c8\u30e9\u30c3\u30af\u30fbSUV\u30e1\u30fc\u30ab\u30fc\u3002\u91cf\u7523\u30e9\u30f3\u30d7\u30a2\u30c3\u30d7\u4e2d\u3060\u304c\u8d64\u5b57\u62e1\u5927\u304c\u7d99\u7d9a\u3002"},
  LCID:{n:"\u30eb\u30fc\u30b7\u30c3\u30c9",         p:3,   v:42000000, rsi:32,perf:{"1y":-61,"6m":-38,"3m":2.1,"1m":-3.2,"10d":-2.1,"1d":-0.2},d:"\u9ad8\u7d1aEV\u30bb\u30c0\u30f3\u300cAir\u300d\u3092\u88fd\u9020\u3002\u4e00\u5145\u96fb\u822a\u7d9a\u8ddd\u96e2\u3067\u696d\u754c\u8a18\u9332\u3092\u6301\u3064\u304c\u91cf\u7523\u5316\u30fb\u8cc7\u91d1\u8abf\u9054\u304c\u8ab2\u984c\u3002"},
  GM:  {n:"\u30bc\u30cd\u30e9\u30eb\u30e2\u30fc\u30bf\u30fc\u30ba", p:52,  v:48000000, rsi:52,perf:{"1y":28,"6m":10,"3m":4.4,"1m":1.6,"10d":0.6,"1d":0.2},d:"\u7c73\u56fd\u6700\u5927\u306e\u81ea\u52d5\u8eca\u30e1\u30fc\u30ab\u30fc\u3002Cruise\u81ea\u52d5\u904b\u8ee2\u3068Ultium EV\u6226\u7565\u3067EV\u5e02\u5834\u306b\u672c\u683c\u53c2\u5165\u4e2d\u3002"},
  F:   {n:"\u30d5\u30a9\u30fc\u30c9",           p:10,  v:98000000, rsi:48,perf:{"1y":-8,"6m":-4,"3m":1.8,"1m":0.6,"10d":0.2,"1d":0.1},d:"F-150 Lightning\u3068Mustang Mach-E\u3067\u306eEV\u8ee2\u63db\u3092\u63a8\u9032\u3002\u5546\u7528EV\u300cPro\u300d\u90e8\u9580\u304c\u6025\u6210\u9577\u3002"},
  // \u30af\u30ea\u30fc\u30f3\u30a8\u30cd\u30eb\u30ae\u30fc
  FSLR:{n:"\u30d5\u30a1\u30fc\u30b9\u30c8\u30bd\u30fc\u30e9\u30fc",p:162, v:8400000,  rsi:54,perf:{"1y":12,"6m":5,"3m":8.1,"1m":-0.8,"10d":-0.6,"1d":-0.1},d:"\u8584\u819c\u592a\u967d\u96fb\u6c60\u30d1\u30cd\u30eb\u306e\u7c73\u56fd\u6700\u5927\u88fd\u9020\u4f01\u696d\u3002IRA\u306e\u6069\u6075\u3092\u76f4\u63a5\u53d7\u3051\u308b\u56fd\u5185\u88fd\u9020\u62e0\u70b9\u3092\u6301\u3064\u3002"},
  ENPH:{n:"\u30a8\u30f3\u30d5\u30a7\u30fc\u30ba",       p:68, v:14000000, rsi:38,perf:{"1y":-42,"6m":-28,"3m":-2.4,"1m":-1.2,"10d":-0.8,"1d":-0.1},d:"\u5bb6\u5ead\u7528\u592a\u967d\u5149\u767a\u96fb\u5411\u3051\u30de\u30a4\u30af\u30ed\u30a4\u30f3\u30d0\u30fc\u30bf\u30fc\u306e\u30ea\u30fc\u30c0\u30fc\u3002\u9ad8\u91d1\u5229\u306b\u3088\u308b\u4f4f\u5b85\u9700\u8981\u6e1b\u901f\u304c\u9006\u98a8\u3002"},
  SEDG:{n:"\u30bd\u30fc\u30e9\u30fc\u30a8\u30c3\u30b8",     p:16,  v:8800000,  rsi:32,perf:{"1y":-68,"6m":-42,"3m":-4.8,"1m":-2.2,"10d":-1.4,"1d":-0.4},d:"\u592a\u967d\u5149\u767a\u96fb\u5411\u3051DC\u6700\u9069\u5316\u88c5\u7f6e\u30fb\u30a4\u30f3\u30d0\u30fc\u30bf\u30fc\u30e1\u30fc\u30ab\u30fc\u3002\u6b27\u5dde\u5e02\u5834\u306e\u4e0d\u632f\u3067\u696d\u7e3e\u304c\u6025\u60aa\u5316\u3002"},
  NEE: {n:"\u30cd\u30af\u30b9\u30c6\u30e9",         p:94,  v:24000000, rsi:52,perf:{"1y":8,"6m":3,"3m":1.2,"1m":0.4,"10d":0.2,"1d":0.1},d:"\u7c73\u56fd\u6700\u5927\u306e\u518d\u751f\u53ef\u80fd\u30a8\u30cd\u30eb\u30ae\u30fc\u96fb\u529b\u4f1a\u793e\u3002\u98a8\u529b\u30fb\u592a\u967d\u5149\u767a\u96fb\u306e\u898f\u6a21\u3067\u5727\u5012\u7684\u9996\u4f4d\u3002"},
  CEG: {n:"\u30b3\u30f3\u30b9\u30c6\u30ec\u30fc\u30b7\u30e7\u30f3", p:332, v:8400000,  rsi:74,perf:{"1y":182,"6m":68,"3m":32,"1m":12.4,"10d":5.1,"1d":1.5},d:"\u7c73\u56fd\u6700\u5927\u306e\u539f\u5b50\u529b\u767a\u96fb\u4f1a\u793e\u3002AI\u30c7\u30fc\u30bf\u30bb\u30f3\u30bf\u30fc\u5411\u3051\u30bc\u30ed\u30ab\u30fc\u30dc\u30f3\u96fb\u529b\u4f9b\u7d66\u3067\u6025\u9a30\u4e2d\u3002"},
  VST: {n:"\u30d3\u30b9\u30c8\u30e9",           p:198, v:8800000,  rsi:72,perf:{"1y":248,"6m":92,"3m":42,"1m":16.4,"10d":6.8,"1d":2.1},d:"\u539f\u5b50\u529b\u30fb\u30ac\u30b9\u767a\u96fb\u4f1a\u793e\u3002AI\u30c7\u30fc\u30bf\u30bb\u30f3\u30bf\u30fc\u5411\u3051\u96fb\u529b\u9700\u8981\u6025\u5897\u3067\u696d\u7e3e\u30fb\u682a\u4fa1\u304c\u6025\u9a30\u4e2d\u3002"},
  RUN: {n:"\u30b5\u30f3\u30e9\u30f3",           p:10,  v:18000000, rsi:38,perf:{"1y":-48,"6m":-28,"3m":-2.4,"1m":-1.2,"10d":-0.8,"1d":-0.2},d:"\u4f4f\u5b85\u5411\u3051\u592a\u967d\u5149\u767a\u96fb\u30fb\u84c4\u96fb\u6c60\u30b7\u30b9\u30c6\u30e0\u306e\u30ea\u30fc\u30c0\u30fc\u3002\u9ad8\u91d1\u5229\u306b\u3088\u308b\u9700\u8981\u6e1b\u901f\u304c\u7d99\u7d9a\u4e2d\u3002"},
  // \u30d0\u30a4\u30aa\u30fb\u88fd\u85ac
  LLY: {n:"\u30a4\u30fc\u30e9\u30a4\u30ea\u30ea\u30fc",     p:1008, v:18000000, rsi:74,perf:{"1y":148,"6m":59,"3m":27,"1m":9.2,"10d":4.0,"1d":1.0},d:"GLP-1\u7cfb\u80a5\u6e80\u30fb\u7cd6\u5c3f\u75c5\u6cbb\u7642\u85ac(Mounjaro/Zepbound)\u3067\u6025\u6210\u9577\u3002\u9700\u8981\u304c\u4f9b\u7d66\u3092\u5927\u5e45\u8d85\u904e\u4e2d\u3002"},
  NVO: {n:"\u30ce\u30dc\u30ce\u30eb\u30c7\u30a3\u30b9\u30af",   p:72, v:8800000,  rsi:62,perf:{"1y":68,"6m":24,"3m":10,"1m":3.8,"10d":1.5,"1d":0.4},d:"Ozempic\u30fbWegovy\uff08\u30bb\u30de\u30b0\u30eb\u30c1\u30c9\uff09\u3067\u80a5\u6e80\u6cbb\u7642\u5e02\u5834\u3092\u30ea\u30fc\u30c9\u3002"},
  ABBV:{n:"\u30a2\u30c3\u30f4\u30a3",           p:234, v:8400000,  rsi:58,perf:{"1y":22,"6m":8,"3m":3.4,"1m":1.2,"10d":0.5,"1d":0.2},d:"Humira\u5f8c\u7d99\u54c1Skyriq\u3068\u30ea\u30f3\u30f4\u30a9\u30c3\u30af\u3067Humira\u306e\u7279\u8a31\u5207\u308c\u3092\u4e57\u308a\u8d8a\u3048\u6210\u9577\u8ecc\u9053\u3092\u7dad\u6301\u4e2d\u3002"},
  BMY: {n:"\u30d6\u30ea\u30b9\u30c8\u30eb\u30fb\u30de\u30a4\u30e4\u30fc\u30ba",p:62,v:14000000, rsi:48,perf:{"1y":-8,"6m":-3,"3m":-1.2,"1m":-0.4,"10d":-0.2,"1d":-0.1},d:"\u30aa\u30d7\u30b8\u30fc\u30dc\u30fbRevlimid\u3092\u4e3b\u529b\u3068\u3059\u308b\u88fd\u85ac\u5927\u624b\u3002\u65b0\u85ac\u30d1\u30a4\u30d7\u30e9\u30a4\u30f3\u306e\u5f37\u5316\u3067\u56de\u5fa9\u3092\u76ee\u6307\u3059\u3002"},
  GILD:{n:"\u30ae\u30ea\u30a2\u30c9",           p:149,  v:12000000, rsi:51,perf:{"1y":28,"6m":11,"3m":5.1,"1m":1.7,"10d":0.7,"1d":0.4},d:"HIV\u30fb\u809d\u708e\u6cbb\u7642\u85ac\u306e\u4e16\u754c\u7684\u30ea\u30fc\u30c0\u30fc\u3002Biktarvy\u7b49\u306e\u6297HIV\u85ac\u304c\u4e3b\u529b\u3002CAR-T\u7642\u6cd5\u306b\u3082\u6ce8\u529b\u3002"},
  MRNA:{n:"\u30e2\u30c7\u30eb\u30ca",           p:34, v:18000000, rsi:44,perf:{"1y":14,"6m":6,"3m":2.6,"1m":0.9,"10d":0.3,"1d":0.2},d:"mRNA\u6280\u8853\u3067\u30b3\u30ed\u30ca\u30ef\u30af\u30c1\u30f3\u3092\u5b9f\u7528\u5316\u3002\u304c\u3093\u30fb\u5fc3\u75be\u60a3\u5411\u3051mRNA\u30ef\u30af\u30c1\u30f3\u30fb\u6cbb\u7642\u85ac\u3092\u958b\u767a\u4e2d\u3002"},
  REGN:{n:"\u30ea\u30b8\u30a7\u30cd\u30ed\u30f3",       p:618,v:4100000,  rsi:58,perf:{"1y":38,"6m":15,"3m":7,"1m":2.3,"10d":0.9,"1d":0.5},d:"\u773c\u79d1\u30fb\u30a2\u30ec\u30eb\u30ae\u30fc\u30fb\u304c\u3093\u9818\u57df\u306e\u6297\u4f53\u533b\u85ac\u54c1\u30e1\u30fc\u30ab\u30fc\u3002Dupixent\u304c\u591a\u9069\u5fdc\u75c7\u3067\u6025\u6210\u9577\u4e2d\u3002"},
  VRTX:{n:"\u30d0\u30fc\u30c6\u30c3\u30af\u30b9",       p:203, v:8200000,  rsi:64,perf:{"1y":48,"6m":19,"3m":8.8,"1m":3.0,"10d":1.3,"1d":0.6},d:"\u56a2\u80de\u6027\u7dda\u7dad\u75c7\u6cbb\u7642\u85ac\u3067\u5e02\u5834\u3092\u72ec\u5360\u3002CRISPR\u907a\u4f1d\u5b50\u6cbb\u7642\u85ac\u3082\u627f\u8a8d\u53d6\u5f97\u3057\u6b21\u4e16\u4ee3\u30d1\u30a4\u30d7\u30e9\u30a4\u30f3\u304c\u5145\u5b9f\u3002"},
  BIIB:{n:"\u30d0\u30a4\u30aa\u30b8\u30a7\u30f3",       p:142, v:4200000,  rsi:44,perf:{"1y":-12,"6m":-4,"3m":-1.8,"1m":-0.6,"10d":-0.2,"1d":-0.1},d:"\u795e\u7d4c\u75be\u60a3\u30fb\u591a\u767a\u6027\u786c\u5316\u75c7\u306e\u5c02\u9580\u88fd\u85ac\u4f1a\u793e\u3002\u30a2\u30eb\u30c4\u30cf\u30a4\u30de\u30fc\u65b0\u85acLeqembi\u304c\u6210\u9577\u306e\u9375\u3002"},
  AMGN:{n:"\u30a2\u30e0\u30b8\u30a7\u30f3",         p:377, v:8400000,  rsi:52,perf:{"1y":12,"6m":4,"3m":1.8,"1m":0.6,"10d":0.2,"1d":0.1},d:"\u30d0\u30a4\u30aa\u533b\u85ac\u54c1\u30d1\u30a4\u30aa\u30cb\u30a2\u3002\u6297\u708e\u75c7\u85ac\u30fb\u9aa8\u7c97\u9b06\u75c7\u6cbb\u7642\u85ac\u306b\u52a0\u3048\u80a5\u6e80\u6cbb\u7642\u85ac\u306e\u958b\u767a\u3082\u672c\u683c\u5316\u3002"},
  // \u30e1\u30c9\u30c6\u30c3\u30af
  MDT: {n:"\u30e1\u30c9\u30c8\u30ed\u30cb\u30c3\u30af",     p:98,  v:12000000, rsi:52,perf:{"1y":8,"6m":3,"3m":1.2,"1m":0.4,"10d":0.2,"1d":0.1},d:"\u5fc3\u81d3\u30da\u30fc\u30b9\u30e1\u30fc\u30ab\u30fc\u30fb\u5916\u79d1\u30ed\u30dc\u30c3\u30c8\u7b49\u306e\u533b\u7642\u6a5f\u5668\u306e\u4e16\u754c\u6700\u5927\u624b\u3002"},
  ABT: {n:"\u30a2\u30dc\u30c3\u30c8",           p:114, v:9800000,  rsi:52,perf:{"1y":12,"6m":5,"3m":2.3,"1m":0.7,"10d":0.3,"1d":0.0},d:"\u9023\u7d9a\u8840\u7cd6\u6e2c\u5b9a\u5668\u300cFreestyle Libre\u300d\u3067\u30c7\u30b8\u30bf\u30eb\u30d8\u30eb\u30b9\u5206\u91ce\u3092\u30ea\u30fc\u30c9\u3002"},
  SYK: {n:"\u30b9\u30c8\u30e9\u30a4\u30ab\u30fc",       p:387, v:4800000,  rsi:64,perf:{"1y":28,"6m":10,"3m":4.4,"1m":1.6,"10d":0.6,"1d":0.2},d:"\u6574\u5f62\u5916\u79d1\u30a4\u30f3\u30d7\u30e9\u30f3\u30c8\u30fb\u624b\u8853\u30ed\u30dc\u30c3\u30c8\u30fb\u6551\u6025\u533b\u7642\u6a5f\u5668\u306e\u30ea\u30fc\u30c0\u30fc\u4f01\u696d\u3002"},
  ISRG:{n:"\u30a4\u30f3\u30c6\u30e5\u30a4\u30c6\u30a3\u30d6\u30fb\u30b5\u30fc\u30b8\u30ab\u30eb",p:504,v:4200000,rsi:68,perf:{"1y":42,"6m":15,"3m":6.4,"1m":2.2,"10d":0.9,"1d":0.3},d:"\u30c0\u30fb\u30f4\u30a3\u30f3\u30c1\u624b\u8853\u30ed\u30dc\u30c3\u30c8\u306e\u30ea\u30fc\u30c0\u30fc\u3002\u624b\u8853\u30ed\u30dc\u30c3\u30c8\u5e02\u5834\u306e90%\u8d85\u3092\u72ec\u5360\u3059\u308b\u3002"},
  DXCM:{n:"\u30c7\u30af\u30b9\u30b3\u30e0",         p:74,  v:6800000,  rsi:48,perf:{"1y":-22,"6m":-8,"3m":-2.4,"1m":-0.8,"10d":-0.4,"1d":-0.1},d:"\u9023\u7d9a\u8840\u7cd6\u6e2c\u5b9a\u5668(CGM)\u306e\u7c73\u56fd\u6700\u5927\u624b\u3002\u7cd6\u5c3f\u75c5\u7ba1\u7406\u306e\u30c7\u30b8\u30bf\u30eb\u5316\u3067ABT\u3068\u7af6\u5408\u3002"},
  EW:  {n:"\u30a8\u30c9\u30ef\u30fc\u30ba\u30fb\u30e9\u30a4\u30d5\u30b5\u30a4\u30a8\u30f3\u30b7\u30ba",p:72,v:6200000,rsi:52,perf:{"1y":8,"6m":3,"3m":1.2,"1m":0.4,"10d":0.2,"1d":0.1},d:"\u5fc3\u81d3\u5f01\u30fb\u91cd\u75c7\u60a3\u8005\u30e2\u30cb\u30bf\u30ea\u30f3\u30b0\u6a5f\u5668\u306e\u5c02\u696d\u30e1\u30fc\u30ab\u30fc\u3002TAVI\u3067\u9996\u4f4d\u3002"},
  // \u5927\u624b\u91d1\u878d
  JPM: {n:"JP\u30e2\u30eb\u30ac\u30f3",         p:300, v:18000000, rsi:62,perf:{"1y":42,"6m":15,"3m":6.4,"1m":2.2,"10d":0.9,"1d":0.3},d:"\u7c73\u56fd\u6700\u5927\u306e\u9280\u884c\u6301\u682a\u4f1a\u793e\u3002\u6295\u8cc7\u9280\u884c\u30fb\u6d88\u8cbb\u8005\u91d1\u878d\u30fb\u8cc7\u7523\u7ba1\u7406\u3092\u4e16\u754c\u898f\u6a21\u3067\u5c55\u958b\u3059\u308b\u3002"},
  BAC: {n:"\u30d0\u30f3\u30af\u30fb\u30aa\u30d6\u30fb\u30a2\u30e1\u30ea\u30ab",p:50, v:48000000, rsi:58,perf:{"1y":28,"6m":10,"3m":4.4,"1m":1.6,"10d":0.6,"1d":0.2},d:"\u7c73\u56fd\u7b2c2\u4f4d\u306e\u5546\u696d\u9280\u884c\u3002\u91d1\u5229\u4e0a\u6607\u5c40\u9762\u3067\u306e\u53ce\u76ca\u6539\u5584\u304c\u9032\u307f\u6a5f\u95a2\u6295\u8cc7\u5bb6\u304b\u3089\u518d\u8a55\u4fa1\u3055\u308c\u3064\u3064\u3042\u308b\u3002"},
  WFC: {n:"\u30a6\u30a7\u30eb\u30ba\u30fb\u30d5\u30a1\u30fc\u30b4",  p:83,  v:28000000, rsi:52,perf:{"1y":48,"6m":17,"3m":7.2,"1m":2.5,"10d":1.0,"1d":0.3},d:"\u7c73\u56fd\u7b2c3\u4f4d\u306e\u9280\u884c\u3002\u30b9\u30ad\u30e3\u30f3\u30c0\u30eb\u5f8c\u306e\u7acb\u3066\u76f4\u3057\u304c\u9032\u307f\u898f\u5236\u5f53\u5c40\u306e\u8cc7\u7523\u4e0a\u9650\u89e3\u9664\u3078\u306e\u671f\u5f85\u304c\u9ad8\u307e\u308b\u3002"},
  GS:  {n:"\u30b4\u30fc\u30eb\u30c9\u30de\u30f3\u30fb\u30b5\u30c3\u30af\u30b9",p:863,v:8400000,  rsi:64,perf:{"1y":42,"6m":15,"3m":6.4,"1m":2.2,"10d":0.9,"1d":0.3},d:"\u6295\u8cc7\u9280\u884c\u30fb\u8a3c\u5238\u30fb\u8cc7\u7523\u7ba1\u7406\u306e\u4e16\u754c\u6700\u5927\u624b\u3002IPO\u30fbM&A\u5e02\u5834\u306e\u56de\u5fa9\u3068AI\u95a2\u9023\u6295\u8cc7\u3067\u6069\u6075\u3092\u53d7\u3051\u308b\u3002"},
  MS:  {n:"\u30e2\u30eb\u30ac\u30f3\u30fb\u30b9\u30bf\u30f3\u30ec\u30fc", p:166, v:12000000, rsi:62,perf:{"1y":28,"6m":10,"3m":4.4,"1m":1.6,"10d":0.6,"1d":0.2},d:"\u6295\u8cc7\u9280\u884c\u30fb\u30a6\u30a7\u30eb\u30b9\u30de\u30cd\u30b8\u30e1\u30f3\u30c8\u306e\u5927\u624b\u3002E*Trade\u3068Eaton Vance\u8cb7\u53ce\u3067\u30ea\u30c6\u30fc\u30eb\u9867\u5ba2\u3092\u5f37\u5316\u3002"},
  BLK: {n:"\u30d6\u30e9\u30c3\u30af\u30ed\u30c3\u30af",      p:1063, v:4400000,  rsi:62,perf:{"1y":28,"6m":10,"3m":4.4,"1m":1.6,"10d":0.6,"1d":0.2},d:"\u4e16\u754c\u6700\u5927\u306e\u8cc7\u7523\u904b\u7528\u4f1a\u793e\uff08AUM10\u5146\u30c9\u30eb\u8d85\uff09\u3002iSharesETF\u3068Aladdin\u30ea\u30b9\u30af\u7ba1\u7406\u3067\u696d\u754c\u3092\u5e2d\u5dfb\u3002"},
  SCHW:{n:"\u30c1\u30e3\u30fc\u30eb\u30ba\u30fb\u30b7\u30e5\u30ef\u30d6", p:42,  v:18000000, rsi:48,perf:{"1y":18,"6m":6,"3m":2.8,"1m":1.0,"10d":0.4,"1d":0.1},d:"\u30aa\u30f3\u30e9\u30a4\u30f3\u8a3c\u5238\u6700\u5927\u624b\u3002\u624b\u6570\u6599\u30bc\u30ed\u5316\u5f8c\u306f\u53e3\u5ea7\u5897\u52a0\u3068\u91d1\u5229\u53ce\u5165\u3067\u6210\u9577\u3059\u308b\u8cc7\u7523\u7ba1\u7406\u4f01\u696d\u3002"},
  // \u30d5\u30a3\u30f3\u30c6\u30c3\u30af\u30fb\u6c7a\u6e08
  V:   {n:"\u30d3\u30b6",               p:321, v:8400000,  rsi:62,perf:{"1y":18,"6m":6,"3m":2.8,"1m":1.0,"10d":0.4,"1d":0.1},d:"\u4e16\u754c\u6700\u5927\u306e\u6c7a\u6e08\u30cd\u30c3\u30c8\u30ef\u30fc\u30af\u3002Visa\u30cd\u30c3\u30c8\u30ef\u30fc\u30af\u3067\u4e16\u754c200\u30ab\u56fd\u4ee5\u4e0a\u306e\u6c7a\u6e08\u3092\u51e6\u7406\u3059\u308b\u3002"},
  MA:  {n:"\u30de\u30b9\u30bf\u30fc\u30ab\u30fc\u30c9",      p:524, v:4800000,  rsi:64,perf:{"1y":22,"6m":8,"3m":3.4,"1m":1.2,"10d":0.5,"1d":0.2},d:"\u30b0\u30ed\u30fc\u30d0\u30eb\u6c7a\u6e08\u30cd\u30c3\u30c8\u30ef\u30fc\u30af\u7b2c2\u4f4d\u3002\u30c7\u30b8\u30bf\u30eb\u30da\u30a4\u30e1\u30f3\u30c8\u3068B2B\u6c7a\u6e08\u306b\u6ce8\u529b\u3002"},
  PYPL:{n:"\u30da\u30a4\u30d1\u30eb",           p:66,  v:24000000, rsi:42,perf:{"1y":-28,"6m":-11,"3m":8.2,"1m":2.6,"10d":1.2,"1d":0.3},d:"\u4e16\u754c\u6700\u5927\u306e\u30aa\u30f3\u30e9\u30a4\u30f3\u6c7a\u6e08\u30d7\u30e9\u30c3\u30c8\u30d5\u30a9\u30fc\u30e0\u3002Venmo\u30fbBraintree\u3092\u5098\u4e0b\u306b\u65b0CEO\u4e0b\u3067\u6539\u9769\u4e2d\u3002"},
  SQ:  {n:"\u30d6\u30ed\u30c3\u30af",           p:58,  v:18000000, rsi:46,perf:{"1y":-18,"6m":-7,"3m":12.4,"1m":4.1,"10d":1.8,"1d":0.4},d:"\u4e2d\u5c0f\u4f01\u696d\u5411\u3051\u6c7a\u6e08\u7aef\u672b\u3068\u500b\u4eba\u5411\u3051Cash App\u3092\u904b\u55b6\u3002Bitcoin\u30a6\u30a9\u30ec\u30c3\u30c8\u3068LN\u7d71\u5408\u3082\u63a8\u9032\u4e2d\u3002"},
  AFRM:{n:"\u30a2\u30d5\u30a1\u30fc\u30e0",          p:62,  v:28000000, rsi:59,perf:{"1y":82,"6m":33,"3m":16.4,"1m":5.2,"10d":2.4,"1d":0.5},d:"BNPL\u306e\u30ea\u30fc\u30c0\u30fc\u3002Amazon\u30fbShopify\u3068\u63d0\u643a\u3057\u5206\u5272\u6255\u3044\u878d\u8cc7\u3092\u63d0\u4f9b\u3002"},
  COIN:{n:"\u30b3\u30a4\u30f3\u30d9\u30fc\u30b9",        p:182, v:38000000, rsi:67,perf:{"1y":142,"6m":57,"3m":28.4,"1m":9.2,"10d":4.1,"1d":0.9},d:"\u7c73\u56fd\u6700\u5927\u306e\u6697\u53f7\u8cc7\u7523\u53d6\u5f15\u6240\u3002Bitcoin ETF\u627f\u8a8d\u306b\u3088\u308b\u6a5f\u95a2\u6295\u8cc7\u5bb6\u6d41\u5165\u3067\u30ab\u30b9\u30c8\u30c7\u30a3\u53ce\u76ca\u3082\u62e1\u5927\u4e2d\u3002"},
  SOFI:{n:"\u30bd\u30fc\u30d5\u30a1\u30a4",          p:18,   v:42000000, rsi:52,perf:{"1y":48,"6m":19,"3m":9.6,"1m":3.1,"10d":1.4,"1d":0.3},d:"\u5b66\u751f\u30ed\u30fc\u30f3\u30fb\u4f4f\u5b85\u30ed\u30fc\u30f3\u30fb\u6295\u8cc7\u30fb\u9280\u884c\u3092\u4e00\u4f53\u63d0\u4f9b\u3059\u308b\u30c7\u30b8\u30bf\u30eb\u30d5\u30a1\u30a4\u30ca\u30f3\u30b7\u30e3\u30eb\u30b9\u30fc\u30d1\u30fc\u30a2\u30d7\u30ea\u3002"},
  HOOD:{n:"\u30ed\u30d3\u30f3\u30d5\u30c3\u30c9",        p:75,  v:28000000, rsi:58,perf:{"1y":82,"6m":28,"3m":12,"1m":4.4,"10d":1.8,"1d":0.5},d:"\u82e5\u8005\u5411\u3051\u624b\u6570\u6599\u30bc\u30ed\u682a\u5f0f\u30fb\u6697\u53f7\u8cc7\u7523\u53d6\u5f15\u30a2\u30d7\u30ea\u3002Gold\u4f1a\u54e1\u5236\u3068\u8cb8\u682a\u30b5\u30fc\u30d3\u30b9\u3067\u53ce\u76ca\u591a\u69d8\u5316\u3002"},
  // \u9632\u885b\u30fb\u5b87\u5b99
  LMT: {n:"\u30ed\u30c3\u30ad\u30fc\u30c9\u30fb\u30de\u30fc\u30c1\u30f3", p:658, v:7800000,  rsi:58,perf:{"1y":18,"6m":7,"3m":3.4,"1m":1.1,"10d":0.5,"1d":-0.1},d:"F-35\u6226\u95d8\u6a5f\u30fbPAC-3\u30df\u30b5\u30a4\u30eb\u7b49\u3092\u88fd\u9020\u3059\u308b\u4e16\u754c\u6700\u5927\u306e\u9632\u885b\u4f01\u696d\u3002NATO\u306e\u9632\u885b\u4e88\u7b97\u5897\u5f37\u3067\u53d7\u6ce8\u5897\u3002"},
  RTX: {n:"RTX",               p:207,  v:12000000, rsi:62,perf:{"1y":34,"6m":14,"3m":6.3,"1m":2.0,"10d":1.0,"1d":-0.1},d:"\u30df\u30b5\u30a4\u30eb\u30fb\u30ec\u30fc\u30c0\u30fc\u30fb\u30b8\u30a7\u30c3\u30c8\u30a8\u30f3\u30b8\u30f3\u3092\u88fd\u9020\u3002\u30a6\u30af\u30e9\u30a4\u30ca\u652f\u63f4\u3067\u30d1\u30c8\u30ea\u30aa\u30c3\u30c8\u30df\u30b5\u30a4\u30eb\u9700\u8981\u304c\u6025\u5897\u3002"},
  NOC: {n:"\u30ce\u30fc\u30b9\u30ed\u30c3\u30d7",        p:498, v:5200000,  rsi:55,perf:{"1y":23,"6m":9,"3m":4.2,"1m":1.4,"10d":0.7,"1d":-0.1},d:"\u30b9\u30c6\u30eb\u30b9\u7206\u6483\u6a5fB-21 Raider\u30fb\u6838\u30df\u30b5\u30a4\u30eb\u30b7\u30b9\u30c6\u30e0\u3092\u958b\u767a\u88fd\u9020\u3002\u5b87\u5b99\u76e3\u8996\u30fb\u30b5\u30a4\u30d0\u30fc\u9632\u885b\u3082\u624b\u639b\u3051\u308b\u3002"},
  GD:  {n:"\u30bc\u30cd\u30e9\u30eb\u30c0\u30a4\u30ca\u30df\u30af\u30b9", p:306, v:6100000,  rsi:52,perf:{"1y":18,"6m":7,"3m":3.4,"1m":1.1,"10d":0.5,"1d":0.1},d:"\u8ecd\u7528\u885b\u661f\u901a\u4fe1\u3068\u539f\u5b50\u529b\u6f5c\u6c34\u8266\u30fb\u30b3\u30f3\u30d0\u30c3\u30c8\u30b7\u30b9\u30c6\u30e0\u3092\u88fd\u9020\u3059\u308b\u7dcf\u5408\u9632\u885b\u4f01\u696d\u3002"},
  BA:  {n:"\u30dc\u30fc\u30a4\u30f3\u30b0",          p:228, v:18000000, rsi:44,perf:{"1y":-22,"6m":-8,"3m":-2.8,"1m":-1.0,"10d":-0.4,"1d":-0.1},d:"\u6c11\u9593\u822a\u7a7a\u6a5f\u30fb\u9632\u885b\u6a5f\u5668\u30e1\u30fc\u30ab\u30fc\u3002\u54c1\u8cea\u554f\u984c\u89e3\u6c7a\u3068\u751f\u7523\u518d\u5efa\u304c\u6025\u52d9\u3002"},
  RKLB:{n:"\u30ed\u30b1\u30c3\u30c8\u30fb\u30e9\u30dc",      p:70,  v:28000000, rsi:62,perf:{"1y":128,"6m":48,"3m":22,"1m":8.4,"10d":3.4,"1d":1.0},d:"\u5c0f\u578b\u885b\u661f\u6253\u3061\u4e0a\u3052\u30ed\u30b1\u30c3\u30c8\u300cElectron\u300d\u3068\u5b87\u5b99\u90e8\u54c1\u88fd\u9020\u3092\u624b\u639b\u3051\u308b\u5b87\u5b99\u65b0\u8208\u4f01\u696d\u3002"},
  // EC\u30fb\u5c0f\u58f2
  SHOP:{n:"\u30b7\u30e7\u30c3\u30d4\u30d5\u30a1\u30a4",      p:118,  v:34000000, rsi:58,perf:{"1y":43,"6m":17,"3m":7.8,"1m":2.7,"10d":0.9,"1d":0.2},d:"EC\u69cb\u7bc9\u30d7\u30e9\u30c3\u30c8\u30d5\u30a9\u30fc\u30e0\u306e\u30ea\u30fc\u30c0\u30fc\u3002\u6c7a\u6e08\u30fb\u7269\u6d41\u30fb\u878d\u8cc7\u3092\u7d71\u5408\u3059\u308b\u30b3\u30de\u30fc\u30b9OS\u3078\u9032\u5316\u4e2d\u3002"},
  EBAY:{n:"\u30a4\u30fc\u30d9\u30a4",           p:68,  v:7800000,  rsi:51,perf:{"1y":18,"6m":7,"3m":3.4,"1m":1.1,"10d":0.4,"1d":0.1},d:"\u4e16\u754c\u6700\u5927\u306e\u4e2d\u53e4\u54c1\u30fb\u30ea\u30bb\u30fc\u30ebEC\u30de\u30fc\u30b1\u30c3\u30c8\u3002\u30d5\u30a9\u30fc\u30ab\u30b9\u30ab\u30c6\u30b4\u30ea\u30fc\u6226\u7565\u3067\u5dee\u5225\u5316\u3092\u56f3\u308b\u3002"},
  ETSY:{n:"\u30a8\u30c3\u30c4\u30a3",           p:52,  v:8400000,  rsi:44,perf:{"1y":-14,"6m":-6,"3m":2.6,"1m":0.9,"10d":0.3,"1d":0.1},d:"\u30cf\u30f3\u30c9\u30e1\u30a4\u30c9\u30fb\u30e6\u30cb\u30fc\u30af\u5546\u54c1\u7279\u5316\u306eEC\u30de\u30fc\u30b1\u30c3\u30c8\u3002\u7af6\u5408\u5927\u624b\u306e\u53f0\u982d\u3068\u8cfc\u8cb7\u529b\u4f4e\u4e0b\u304c\u9006\u98a8\u3002"},
  W:   {n:"\u30a6\u30a7\u30a4\u30d5\u30a7\u30a2",        p:42,  v:6200000,  rsi:38,perf:{"1y":-28,"6m":-11,"3m":4.1,"1m":1.4,"10d":0.5,"1d":0.1},d:"\u5bb6\u5177\u30fb\u30a4\u30f3\u30c6\u30ea\u30a2\u5c02\u9580EC\u306e\u6700\u5927\u624b\u3002\u4f4f\u5b85\u5e02\u5834\u306e\u4f4e\u8ff7\u3068\u7269\u6d41\u30b3\u30b9\u30c8\u304c\u53ce\u76ca\u5316\u306e\u5927\u304d\u306a\u969c\u58c1\u3002"},
  CHWY:{n:"\u30c1\u30e5\u30fc\u30a6\u30a3\u30fc",        p:38,  v:12000000, rsi:48,perf:{"1y":18,"6m":6,"3m":2.8,"1m":1.0,"10d":0.4,"1d":0.1},d:"\u30da\u30c3\u30c8\u7528\u54c1EC\u306e\u6700\u5927\u624b\u3002\u5b9a\u671f\u8cfc\u5165\u30e2\u30c7\u30eb\u3068\u52d5\u7269\u75c5\u9662\u30d3\u30b8\u30cd\u30b9\u3067\u5b89\u5b9a\u53ce\u76ca\u3092\u78ba\u4fdd\u3002"},
  // \u30d8\u30eb\u30b9\u30b1\u30a2\u30fb\u4fdd\u967a
  UNH: {n:"\u30e6\u30ca\u30a4\u30c6\u30c3\u30c9\u30d8\u30eb\u30b9",  p:289, v:14000000, rsi:58,perf:{"1y":14,"6m":6,"3m":2.6,"1m":0.9,"10d":0.4,"1d":0.1},d:"\u7c73\u56fd\u6700\u5927\u306e\u533b\u7642\u4fdd\u967a\u4f1a\u793e\u3002Optum\u306e\u30c7\u30fc\u30bf\u30a2\u30ca\u30ea\u30c6\u30a3\u30af\u30b9\u3068\u30d8\u30eb\u30b9\u30c6\u30c3\u30af\u3067AI\u533b\u7642\u30b5\u30fc\u30d3\u30b9\u3082\u62e1\u5927\u4e2d\u3002"},
  JNJ: {n:"J&J",               p:247, v:12000000, rsi:48,perf:{"1y":8,"6m":3,"3m":1.5,"1m":0.5,"10d":0.2,"1d":0.0},d:"\u533b\u85ac\u54c1\u30fb\u533b\u7642\u6a5f\u5668\u306e\u30b3\u30f3\u30b0\u30ed\u30de\u30ea\u30c3\u30c8\u3002\u6d88\u8cbb\u8005\u5411\u3051\u4e8b\u696d\u3092Kenvue\u3068\u3057\u3066\u5206\u793e\u5316\u3057\u30d5\u30a1\u30fc\u30de\u30fb\u30e1\u30c9\u30c6\u30c3\u30af\u306b\u96c6\u4e2d\u3002"},
  TMO: {n:"\u30b5\u30fc\u30e2\u30fb\u30d5\u30a3\u30c3\u30b7\u30e3\u30fc", p:521, v:6200000,  rsi:54,perf:{"1y":14,"6m":6,"3m":2.6,"1m":0.9,"10d":0.4,"1d":0.0},d:"\u30e9\u30a4\u30d5\u30b5\u30a4\u30a8\u30f3\u30b9\u6a5f\u5668\u30fb\u8a66\u85ac\u306e\u4e16\u754c\u6700\u5927\u30e1\u30fc\u30ab\u30fc\u3002\u88fd\u85ac\u30fb\u30d0\u30a4\u30aa\u30fb\u30a2\u30ab\u30c7\u30df\u30a2\u5411\u3051\u30c4\u30fc\u30eb\u3092\u63d0\u4f9b\u3002"},
  CVS: {n:"CVS\u30d8\u30eb\u30b9",          p:44,  v:12000000, rsi:42,perf:{"1y":-28,"6m":-12,"3m":-4.8,"1m":-1.8,"10d":-0.7,"1d":-0.2},d:"\u85ac\u5c40\u30c1\u30a7\u30fc\u30f3\u30fbAetna\u4fdd\u967a\u30fbCaremark PBM\u3092\u7d71\u5408\u3059\u308b\u30d8\u30eb\u30b9\u30b1\u30a2\u30b3\u30f3\u30b0\u30ed\u30de\u30ea\u30c3\u30c8\u3002"},
  HCA: {n:"HCA\u30d8\u30eb\u30b9\u30b1\u30a2",      p:530, v:4800000,  rsi:62,perf:{"1y":28,"6m":10,"3m":4.4,"1m":1.6,"10d":0.6,"1d":0.2},d:"\u7c73\u56fd\u6700\u5927\u306e\u6c11\u9593\u75c5\u9662\u30c1\u30a7\u30fc\u30f3\u3002AI\u306b\u3088\u308b\u533b\u7642\u52b9\u7387\u5316\u3068\u7a3c\u50cd\u7387\u5411\u4e0a\u3067\u5b89\u5b9a\u6210\u9577\u3092\u7d9a\u3051\u308b\u3002"},
  // \u901a\u4fe1\u30fb\u30e1\u30c7\u30a3\u30a2
  T:   {n:"AT&T",              p:28,  v:98000000, rsi:52,perf:{"1y":18,"6m":6,"3m":2.8,"1m":1.0,"10d":0.4,"1d":0.1},d:"\u7c73\u56fd\u6700\u5927\u306e\u901a\u4fe1\u4f1a\u793e\u306e\u4e00\u3064\u30025G\u30cd\u30c3\u30c8\u30ef\u30fc\u30af\u62e1\u5145\u3068\u6709\u6599\u653e\u9001\u4e8b\u696d\u5206\u96e2\u5f8c\u306e\u30d5\u30a9\u30fc\u30ab\u30b9\u3067\u6210\u9577\u3092\u76ee\u6307\u3059\u3002"},
  VZ:  {n:"\u30d9\u30e9\u30a4\u30be\u30f3",         p:51,  v:28000000, rsi:48,perf:{"1y":12,"6m":4,"3m":1.8,"1m":0.6,"10d":0.2,"1d":0.1},d:"\u7c73\u56fd\u6700\u5927\u624b\u901a\u4fe1\u4f1a\u793e\u30025G\u30a4\u30f3\u30d5\u30e9\u6295\u8cc7\u3068FiOS\uff08\u5149\u30d5\u30a1\u30a4\u30d0\u30fc\uff09\u62e1\u5927\u3067\u7af6\u4e89\u529b\u5f37\u5316\u4e2d\u3002"},
  NFLX:{n:"\u30cd\u30c3\u30c8\u30d5\u30ea\u30c3\u30af\u30b9",    p:98, v:8800000,  rsi:68,perf:{"1y":68,"6m":24,"3m":10,"1m":3.8,"10d":1.5,"1d":0.4},d:"\u4e16\u754c\u6700\u5927\u306e\u5b9a\u984d\u52d5\u753b\u914d\u4fe1(SVOD)\u3002\u5e83\u544a\u4ed8\u304d\u4f4e\u4fa1\u683c\u30d7\u30e9\u30f3\u3068\u30d1\u30b9\u30ef\u30fc\u30c9\u5171\u6709\u53d6\u308a\u7de0\u307e\u308a\u3067\u53ce\u76ca\u6539\u5584\u3002"},
  DIS: {n:"\u30c7\u30a3\u30ba\u30cb\u30fc",         p:106, v:18000000, rsi:48,perf:{"1y":8,"6m":3,"3m":1.2,"1m":0.4,"10d":0.2,"1d":0.1},d:"\u30c6\u30fc\u30de\u30d1\u30fc\u30af\u30fb\u6620\u753b\u30fbDisney+\u3092\u904b\u55b6\u3059\u308b\u7dcf\u5408\u30a8\u30f3\u30bf\u30e1\u4f01\u696d\u3002\u30b9\u30c8\u30ea\u30fc\u30df\u30f3\u30b0\u4e8b\u696d\u306e\u53ce\u76ca\u5316\u3092\u63a8\u9032\u4e2d\u3002"},
  SPOT:{n:"\u30b9\u30dd\u30c6\u30a3\u30d5\u30a1\u30a4",      p:682, v:8400000,  rsi:62,perf:{"1y":128,"6m":48,"3m":22,"1m":8.4,"10d":3.4,"1d":1.0},d:"\u4e16\u754c\u6700\u5927\u306e\u97f3\u697d\u30b9\u30c8\u30ea\u30fc\u30df\u30f3\u30b0\u30b5\u30fc\u30d3\u30b9\u3002\u30dd\u30c3\u30c9\u30ad\u30e3\u30b9\u30c8\u30fb\u30aa\u30fc\u30c7\u30a3\u30aa\u30d6\u30c3\u30af\u306b\u4e8b\u696d\u3092\u62e1\u5927\u4e2d\u3002"},
  // NASDAQ \u6307\u6570\u30fbETF
  QQQ: {n:"NASDAQ 100 ETF(QQQ)",p:488, v:48000000, rsi:58,perf:{"1y":28,"6m":10,"3m":4.2,"1m":1.5,"10d":0.6,"1d":0.3},d:"NASDAQ-100\u6307\u6570\u306b\u9023\u52d5\u3059\u308bETF\u3002\u30c6\u30af\u30ce\u30ed\u30b8\u30fc\u682a\u4e2d\u5fc3\u306e100\u9298\u67c4\u3092\u4fdd\u6709\u3002Invesco\u904b\u7528\u3002"},
  TQQQ:{n:"NASDAQ 100 3×\u30d6\u30eb",  p:58,  v:124000000,rsi:55,perf:{"1y":62,"6m":22,"3m":8.4,"1m":3.2,"10d":1.4,"1d":0.8},d:"QQQ\u306e3\u500d\u30ec\u30d0\u30ec\u30c3\u30b8ETF\uff08ProShares\uff09\u3002\u77ed\u671f\u30c8\u30ec\u30fc\u30c9\u5411\u3051\u3002\u5909\u52d5\u5e45\u304c\u5927\u304d\u304f\u9577\u671f\u4fdd\u6709\u306f\u6e1b\u4fa1\u30ea\u30b9\u30af\u3042\u308a\u3002"},
  SQQQ:{n:"NASDAQ 100 3×\u30d9\u30a2",  p:8,  v:98000000, rsi:42,perf:{"1y":-58,"6m":-24,"3m":-11,"1m":-3.8,"10d":-1.6,"1d":-0.8},d:"QQQ\u306e\u90063\u500d\u30ec\u30d0\u30ec\u30c3\u30b8ETF\uff08ProShares\uff09\u3002NASDAQ\u4e0b\u843d\u5c40\u9762\u3067\u306e\u30d8\u30c3\u30b8\u30fb\u7a7a\u58f2\u308a\u4ee3\u66ff\u3068\u3057\u3066\u4f7f\u7528\u3055\u308c\u308b\u3002"},
  ONEQ:{n:"NASDAQ\u7dcf\u5408 ETF",      p:68,  v:2800000,  rsi:57,perf:{"1y":24,"6m":8.8,"3m":3.6,"1m":1.2,"10d":0.5,"1d":0.2},d:"NASDAQ\u7dcf\u5408\u6307\u6570\uff08\u7d044000\u9298\u67c4\uff09\u306b\u9023\u52d5\u3059\u308bFidelity\u904b\u7528ETF\u3002QQQ\u3088\u308a\u5e83\u7bc4\u306a\u9298\u67c4\u3092\u30ab\u30d0\u30fc\u3002"},
  QYLD:{n:"NASDAQ \u30ab\u30d0\u30fc\u30c9\u30b3\u30fc\u30eb",p:17, v:12000000, rsi:52,perf:{"1y":8,"6m":3,"3m":1.2,"1m":0.4,"10d":0.2,"1d":0.1},d:"NASDAQ-100\u306e\u30ab\u30d0\u30fc\u30c9\u30b3\u30fc\u30ebETF\uff08Global X\uff09\u3002\u9ad8\u914d\u5f53\uff08\u6708\u6b21\uff09\u3092\u63d0\u4f9b\u3059\u308b\u304c\u4fa1\u683c\u4e0a\u6607\u306f\u5236\u9650\u3055\u308c\u308b\u3002"},
  // NASDAQ \u4ee3\u8868\u7684\u30b0\u30ed\u30fc\u30b9\u9298\u67c4
  TSMC:{n:"TSMC ADR",            p:375, v:18000000, rsi:62,perf:{"1y":68,"6m":24,"3m":10,"1m":3.8,"10d":1.5,"1d":0.4},d:"\u4e16\u754c\u6700\u5927\u306e\u534a\u5c0e\u4f53\u53d7\u8a17\u88fd\u9020\u4f1a\u793e\u3002NVDIA\u30fbAAPL\u5411\u3051\u306e\u6700\u5148\u7aef\u30c1\u30c3\u30d7\u3092\u72ec\u5360\u7684\u306b\u88fd\u9020\u3059\u308bTSMC\u306eADR\u3002"},
  NTES:{n:"\u30cd\u30c3\u30c8\u30a4\u30fc\u30b9 ADR",     p:74,  v:4800000,  rsi:48,perf:{"1y":18,"6m":6,"3m":2.4,"1m":0.8,"10d":0.3,"1d":0.1},d:"\u4e2d\u56fd\u6700\u5927\u306e\u30aa\u30f3\u30e9\u30a4\u30f3\u30b2\u30fc\u30e0\u4f1a\u793e\u306e\u4e00\u3064\u3002\u6559\u80b2\u30fb\u97f3\u697d\u914d\u4fe1\u3082\u5c55\u958b\u3059\u308bNASDAQ\u4e0a\u5834ADR\u3002"},
  BIDU:{n:"\u30d0\u30a4\u30c9\u30a5 ADR",         p:12,  v:8800000,  rsi:44,perf:{"1y":-18,"6m":-8,"3m":-2.4,"1m":-0.8,"10d":-0.4,"1d":-0.1},d:"\u4e2d\u56fd\u6700\u5927\u306e\u691c\u7d22\u30a8\u30f3\u30b8\u30f3\u30fbAI\u4f01\u696d\u3002Ernie\u30e2\u30c7\u30eb\u3067\u751f\u6210AI\u958b\u767a\u3092\u63a8\u9032\u3059\u308bNASDAQ\u4e0a\u5834\u4f01\u696d\u3002"},
  PDD: {n:"Temu(PDD) ADR",        p:98, v:12000000, rsi:52,perf:{"1y":42,"6m":15,"3m":6.4,"1m":2.2,"10d":0.9,"1d":0.3},d:"\u683c\u5b89EC\u300cTemu\u300d\u3092\u904b\u55b6\u3059\u308bPinduoduo\u3002NASDAQ\u4e0a\u5834\u3067\u7c73\u4e2dEC\u7af6\u4e89\u306e\u6700\u524d\u7dda\u306b\u7acb\u3064\u3002"},
  JD:  {n:"JD.com ADR",           p:42,  v:12000000, rsi:46,perf:{"1y":8,"6m":3,"3m":1.2,"1m":0.4,"10d":0.2,"1d":0.1},d:"\u4e2d\u56fd\u7b2c2\u4f4d\u306eEC\u30d7\u30e9\u30c3\u30c8\u30d5\u30a9\u30fc\u30e0\u3002\u7269\u6d41\u30fb\u30af\u30e9\u30a6\u30c9\u30fb\u30d8\u30eb\u30b9\u30b1\u30a2\u306b\u3082\u4e8b\u696d\u3092\u5c55\u958b\u3059\u308bNASDAQ\u4e0a\u5834ADR\u3002"},
  BABA:{n:"\u30a2\u30ea\u30d0\u30d0 ADR",          p:112,  v:28000000, rsi:48,perf:{"1y":-12,"6m":-4,"3m":-1.8,"1m":-0.6,"10d":-0.2,"1d":-0.1},d:"\u4e2d\u56fd\u6700\u5927\u306eEC\u30fb\u30af\u30e9\u30a6\u30c9\u4f01\u696d\u3002\u898f\u5236\u5f37\u5316\u5f8c\u306e\u518d\u5efa\u3092\u9032\u3081\u3066\u304a\u308a\u682a\u4e3b\u9084\u5143\u7b56\u3082\u5f37\u5316\u4e2d\u306eNASDAQ\u4e0a\u5834\u9298\u67c4\u3002"},
  // ─── AI \u30a4\u30f3\u30d5\u30e9\u65b0\u8208 ───
  NBIS:{n:"Nebius Group",         p:89,  v:8400000,  rsi:68,perf:{"1y":312,"6m":148,"3m":62,"1m":22,"10d":8.4,"1d":2.8},d:"GPU\u5c02\u7528\u30af\u30e9\u30a6\u30c9\u30fbAI\u30a4\u30f3\u30d5\u30e9\u3092\u63d0\u4f9b\u3059\u308b\u30aa\u30e9\u30f3\u30c0\u767a\u65b0\u8208\u4f01\u696d\u3002Yandex\u306e\u30b9\u30d4\u30f3\u30aa\u30d5\u3068\u3057\u3066\u6025\u6210\u9577\u4e2d\u3002"},
  IREN:{n:"Iris Energy",          p:41,  v:18000000, rsi:64,perf:{"1y":182,"6m":72,"3m":32,"1m":12,"10d":4.8,"1d":1.4},d:"BTC\u30de\u30a4\u30cb\u30f3\u30b0\u517cAI\u30c7\u30fc\u30bf\u30bb\u30f3\u30bf\u30fc\u4f01\u696d\u3002\u518d\u30a8\u30cd\u96fb\u529b\u3092\u6d3b\u7528\u3057GPU\u30af\u30e9\u30a6\u30c9\u3078\u306e\u8ee2\u63db\u3092\u9032\u3081\u308b\u3002"},
  CRVW:{n:"CoreWeave",            p:48,  v:12000000, rsi:58,perf:{"1y":148,"6m":58,"3m":24,"1m":8.4,"10d":3.2,"1d":1.0},d:"NVIDIA GPU\u5c02\u7528\u30af\u30e9\u30a6\u30c9\u3092\u63d0\u4f9b\u3059\u308b\u6025\u6210\u9577AI\u30a4\u30f3\u30d5\u30e9\u4f01\u696d\u3002\u5927\u624b\u30c6\u30c3\u30af\u30fb\u30b9\u30bf\u30fc\u30c8\u30a2\u30c3\u30d7\u306b\u63a1\u7528\u62e1\u5927\u3002"},
  BBAI:{n:"BigBear.ai",           p:4,   v:8400000,  rsi:52,perf:{"1y":148,"6m":58,"3m":24,"1m":8.4,"10d":3.2,"1d":1.1},d:"\u653f\u5e9c\u30fb\u8ecd\u5411\u3051\u306eAI\u610f\u601d\u6c7a\u5b9a\u30d7\u30e9\u30c3\u30c8\u30d5\u30a9\u30fc\u30e0\u3092\u63d0\u4f9b\u3002\u9632\u885b\u7701\u30fb\u60c5\u5831\u6a5f\u95a2\u3068\u306e\u5927\u578b\u5951\u7d04\u3092\u6301\u3064\u3002"},
  SOUN:{n:"SoundHound AI",        p:9,   v:28000000, rsi:58,perf:{"1y":282,"6m":112,"3m":48,"1m":18,"10d":6.8,"1d":2.2},d:"\u97f3\u58f0AI\u30fb\u4f1a\u8a71\u578bAI\u30d7\u30e9\u30c3\u30c8\u30d5\u30a9\u30fc\u30e0\u3092\u63d0\u4f9b\u3002\u81ea\u52d5\u8eca\u30fb\u98f2\u98df\u30fb\u533b\u7642\u5411\u3051\u306b\u6025\u62e1\u5927\u4e2d\u3002"},
  AITX:{n:"AI Tech Solutions",    p:0,   v:12000000, rsi:36,perf:{"1y":62,"6m":24,"3m":10,"1m":3.8,"10d":1.4,"1d":0.5},d:"AI\u30ed\u30dc\u30c3\u30c8\u8b66\u5099\u30fb\u76e3\u8996\u30b7\u30b9\u30c6\u30e0\u3092\u958b\u767a\u3002\u30b9\u30fc\u30d1\u30fc\u30de\u30fc\u30b1\u30c3\u30c8\u30fb\u5009\u5eab\u30fb\u4e0d\u52d5\u7523\u5411\u3051\u306b\u5c55\u958b\u4e2d\u3002"},
  RXRX:{n:"Recursion Pharma",     p:7,   v:8400000,  rsi:44,perf:{"1y":28,"6m":10,"3m":4.4,"1m":1.6,"10d":0.6,"1d":0.2},d:"AI\u3067\u5275\u85ac\u30d7\u30ed\u30bb\u30b9\u3092\u81ea\u52d5\u5316\u3059\u308b\u30d0\u30a4\u30aa\u30c6\u30c3\u30af\u3002NVIDIA\u3068\u306e\u63d0\u643a\u3067AI\u5275\u85ac\u30d7\u30e9\u30c3\u30c8\u30d5\u30a9\u30fc\u30e0\u3092\u69cb\u7bc9\u3002"},
  SDGR:{n:"Schrödinger",          p:22,  v:2400000,  rsi:48,perf:{"1y":18,"6m":6,"3m":2.8,"1m":1.0,"10d":0.4,"1d":0.1},d:"\u8a08\u7b97\u5316\u5b66\u30fbAI\u30b7\u30df\u30e5\u30ec\u30fc\u30b7\u30e7\u30f3\u3067\u85ac\u5264\u767a\u898b\u3092\u52a0\u901f\u3059\u308b\u5275\u85ac\u30d7\u30e9\u30c3\u30c8\u30d5\u30a9\u30fc\u30e0\u4f01\u696d\u3002"},
  PATH:{n:"UiPath",               p:14,  v:12000000, rsi:48,perf:{"1y":18,"6m":6,"3m":2.8,"1m":1.0,"10d":0.4,"1d":0.1},d:"RPA\u3068AI\u3092\u7d44\u307f\u5408\u308f\u305b\u305f\u30d3\u30b8\u30cd\u30b9\u30d7\u30ed\u30bb\u30b9\u81ea\u52d5\u5316\u30d7\u30e9\u30c3\u30c8\u30d5\u30a9\u30fc\u30e0\u306e\u30ea\u30fc\u30c0\u30fc\u3002\u30a8\u30f3\u30bf\u30fc\u30d7\u30e9\u30a4\u30ba\u5411\u3051\u3002"},
  TASK:{n:"TaskUs",               p:12,  v:2400000,  rsi:44,perf:{"1y":-18,"6m":-6,"3m":-2,"1m":-0.7,"10d":-0.3,"1d":-0.1},d:"AI\u30c7\u30fc\u30bf\u30e9\u30d9\u30ea\u30f3\u30b0\u30fb\u30b3\u30f3\u30c6\u30f3\u30c4\u30e2\u30c7\u30ec\u30fc\u30b7\u30e7\u30f3\u30fb\u9867\u5ba2\u30b5\u30dd\u30fc\u30c8BPO\u3092\u63d0\u4f9b\u3059\u308b\u30a2\u30a6\u30c8\u30bd\u30fc\u30b7\u30f3\u30b0\u4f01\u696d\u3002"},
  // ─── BTC\u30de\u30a4\u30cb\u30f3\u30b0\u30fb\u30af\u30ea\u30d7\u30c8 ───
  MARA:{n:"Marathon Digital",     p:9,  v:48000000, rsi:58,perf:{"1y":142,"6m":52,"3m":22,"1m":8,"10d":3.2,"1d":1.0},d:"\u7c73\u56fd\u6700\u5927\u306e\u30d3\u30c3\u30c8\u30b3\u30a4\u30f3\u30de\u30a4\u30cb\u30f3\u30b0\u4f01\u696d\u3002\u5927\u898f\u6a21\u63a1\u6398\u65bd\u8a2d\u3092\u8907\u6570\u904b\u55b6\u3057BTC\u4fdd\u6709\u91cf\u3082\u696d\u754c\u6700\u5927\u7d1a\u3002"},
  RIOT:{n:"Riot Platforms",       p:16,  v:38000000, rsi:54,perf:{"1y":88,"6m":32,"3m":14,"1m":5,"10d":2.2,"1d":0.7},d:"\u30c6\u30ad\u30b5\u30b9\u5dde\u306b\u5927\u898f\u6a21\u30de\u30a4\u30cb\u30f3\u30b0\u65bd\u8a2d\u3092\u6301\u3064BTC\u63a1\u6398\u4f1a\u793e\u3002\u96fb\u529b\u30b3\u30b9\u30c8\u7af6\u4e89\u529b\u3068\u74b0\u5883\u914d\u616e\u3092\u5f37\u8abf\u3002"},
  CLSK:{n:"CleanSpark",           p:12,  v:18000000, rsi:56,perf:{"1y":112,"6m":42,"3m":18,"1m":6.4,"10d":2.8,"1d":0.9},d:"\u518d\u751f\u53ef\u80fd\u30a8\u30cd\u30eb\u30ae\u30fc\u3092\u6d3b\u7528\u3059\u308bBTC\u30de\u30a4\u30cb\u30f3\u30b0\u4f01\u696d\u3002\u30b0\u30ea\u30fc\u30f3\u30de\u30a4\u30cb\u30f3\u30b0\u3092\u63b2\u3052\u6a5f\u95a2\u6295\u8cc7\u5bb6\u306e\u652f\u6301\u3082\u3002"},
  BITF:{n:"Bitfarms",             p:3,   v:18000000, rsi:48,perf:{"1y":62,"6m":22,"3m":9.6,"1m":3.4,"10d":1.4,"1d":0.5},d:"\u30ab\u30ca\u30c0\u30fb\u5357\u7c73\u306b\u5c55\u958b\u3059\u308b\u518d\u30a8\u30cdBTC\u30de\u30a4\u30cb\u30f3\u30b0\u4f01\u696d\u3002\u6c34\u529b\u767a\u96fb\u306b\u3088\u308b\u4f4e\u30b3\u30b9\u30c8\u63a1\u6398\u3092\u5b9f\u73fe\u3002"},
  HUT: {n:"Hut 8 Mining",         p:18,  v:12000000, rsi:52,perf:{"1y":98,"6m":38,"3m":16,"1m":5.8,"10d":2.4,"1d":0.8},d:"\u30ab\u30ca\u30c0\u767a\u306eBTC\u30de\u30a4\u30cb\u30f3\u30b0\u517c\u9ad8\u6027\u80fd\u30b3\u30f3\u30d4\u30e5\u30fc\u30c6\u30a3\u30f3\u30b0\u4f01\u696d\u3002AI\u30c7\u30fc\u30bf\u30bb\u30f3\u30bf\u30fc\u4e8b\u696d\u306b\u3082\u53c2\u5165\u3002"},
  CIFR:{n:"Cipher Mining",        p:4,   v:8400000,  rsi:46,perf:{"1y":82,"6m":32,"3m":14,"1m":4.8,"10d":2.0,"1d":0.7},d:"\u30c6\u30ad\u30b5\u30b9\u5dde\u306e\u4f4e\u30b3\u30b9\u30c8\u96fb\u529b\u3092\u6d3b\u7528\u3059\u308b\u30d3\u30c3\u30c8\u30b3\u30a4\u30f3\u30de\u30a4\u30cb\u30f3\u30b0\u4f01\u696d\u3002\u52b9\u7387\u7684\u306a\u63a1\u6398\u8a2d\u5099\u3092\u5c55\u958b\u3002"},
  MSTR:{n:"MicroStrategy",        p:138, v:28000000, rsi:62,perf:{"1y":342,"6m":128,"3m":52,"1m":18,"10d":6.8,"1d":2.2},d:"\u6cd5\u4ebaBTC\u30c8\u30ec\u30b8\u30e3\u30ea\u30fc\u6226\u7565\u306e\u5148\u99c6\u8005\u3002BTC\u3092\u4e3b\u8981\u8cc7\u7523\u3068\u3057\u3066\u5927\u91cf\u8cfc\u5165\u30fb\u4fdd\u6709\u3059\u308b\u4e8b\u5b9f\u4e0a\u306eBTC\u6295\u8cc7\u4f1a\u793e\u3002"},
  BTBT:{n:"Bit Digital",          p:3,   v:8400000,  rsi:44,perf:{"1y":82,"6m":28,"3m":12,"1m":4.2,"10d":1.8,"1d":0.6},d:"BTC\u30de\u30a4\u30cb\u30f3\u30b0\u304b\u3089AI\u30af\u30e9\u30a6\u30c9\u3078\u8ee2\u63db\u3092\u56f3\u308b\u4f01\u696d\u3002GPU\u30af\u30e9\u30a6\u30c9\u30b5\u30fc\u30d3\u30b9\u306e\u6bd4\u7387\u3092\u6025\u62e1\u5927\u4e2d\u3002"},
  // ─── \u5b87\u5b99\u30fb\u30b9\u30da\u30fc\u30b9\u30c6\u30c3\u30af ───
  ASTA:{n:"Astrotech",            p:2,   v:1800000,  rsi:48,perf:{"1y":142,"6m":58,"3m":24,"1m":8.8,"10d":3.4,"1d":1.2},d:"\u8cea\u91cf\u5206\u6790\u30fb\u5316\u5b66\u691c\u77e5\u30bb\u30f3\u30b5\u30fc\u6280\u8853\u3092\u6301\u3064\u5b87\u5b99\u30fb\u7a7a\u6e2f\u30bb\u30ad\u30e5\u30ea\u30c6\u30a3\u5411\u3051\u30cf\u30fc\u30c9\u30a6\u30a7\u30a2\u4f01\u696d\u3002"},
  ASTS:{n:"AST SpaceMobile",      p:93,  v:18000000, rsi:62,perf:{"1y":342,"6m":128,"3m":52,"1m":18,"10d":6.8,"1d":2.2},d:"\u885b\u661f\u3092\u4f7f\u3063\u305f\u76f4\u63a5\u30b9\u30de\u30fc\u30c8\u30d5\u30a9\u30f3\u63a5\u7d9a\u30d6\u30ed\u30fc\u30c9\u30d0\u30f3\u30c9\u3092\u63d0\u4f9b\u3059\u308b\u9769\u65b0\u7684\u5b87\u5b99\u901a\u4fe1\u4f01\u696d\u3002"},
  LUNR:{n:"Intuitive Machines",   p:12,   v:8400000,  rsi:54,perf:{"1y":182,"6m":72,"3m":32,"1m":11,"10d":4.4,"1d":1.4},d:"NASA\u3068\u5951\u7d04\u3057\u305f\u6708\u9762\u7740\u9678\u6a5f\u30fb\u6708\u9762\u8f38\u9001\u30b5\u30fc\u30d3\u30b9\u4f01\u696d\u3002Artemis\u30d7\u30ed\u30b0\u30e9\u30e0\u306e\u91cd\u8981\u30d1\u30fc\u30c8\u30ca\u30fc\u3002"},
  SPCE:{n:"Virgin Galactic",      p:1,   v:8400000,  rsi:28,perf:{"1y":-82,"6m":-48,"3m":-12,"1m":-4.8,"10d":-2.2,"1d":-0.6},d:"\u5b87\u5b99\u89b3\u5149\u30d5\u30e9\u30a4\u30c8\u3092\u63d0\u4f9b\u3059\u308bVirgin\u5098\u4e0b\u306e\u5b87\u5b99\u4f01\u696d\u3002\u5546\u696d\u904b\u822a\u306e\u9045\u308c\u3068\u8cc7\u91d1\u96e3\u304c\u6df1\u523b\u306a\u8ab2\u984c\u3002"},
  // ─── \u30b2\u30fc\u30e0\u30fb\u30a8\u30f3\u30bf\u30e1 ───
  RBLX:{n:"Roblox",               p:48,  v:12000000, rsi:52,perf:{"1y":28,"6m":10,"3m":4.4,"1m":1.6,"10d":0.6,"1d":0.2},d:"\u5b50\u4f9b\u30fb\u82e5\u8005\u5411\u3051\u306e\u30e1\u30bf\u30d0\u30fc\u30b9\u578b\u30b2\u30fc\u30e0\u30d7\u30e9\u30c3\u30c8\u30d5\u30a9\u30fc\u30e0\u3002UGC\u30b2\u30fc\u30e0\u5236\u4f5c\u3068\u30c7\u30b8\u30bf\u30eb\u7d4c\u6e08\u570f\u3092\u69cb\u7bc9\u3002"},
  U:   {n:"Unity Technologies",   p:12,  v:8400000,  rsi:38,perf:{"1y":-42,"6m":-18,"3m":-4.8,"1m":-1.8,"10d":-0.8,"1d":-0.2},d:"3D\u30b2\u30fc\u30e0\u30a8\u30f3\u30b8\u30f3\u30fb\u30ea\u30a2\u30eb\u30bf\u30a4\u30e03D\u30d7\u30e9\u30c3\u30c8\u30d5\u30a9\u30fc\u30e0\u3002\u30b2\u30fc\u30e0\u30fb\u6620\u50cf\u30fb\u81ea\u52d5\u8eca\u30fb\u5efa\u7bc9\u5206\u91ce\u306b\u5c55\u958b\u3002"},
  TTWO:{n:"Take-Two Interactive",  p:196, v:4800000,  rsi:54,perf:{"1y":28,"6m":10,"3m":4.4,"1m":1.6,"10d":0.6,"1d":0.2},d:"GTA\u30fbNBA 2K\u30b7\u30ea\u30fc\u30ba\u3092\u6301\u3064\u5927\u624b\u30b2\u30fc\u30e0\u30d1\u30d6\u30ea\u30c3\u30b7\u30e3\u30fc\u3002GTA6\u306e\u767a\u58f2\u304c\u696d\u7e3e\u30fb\u682a\u4fa1\u306e\u6700\u5927\u306e\u89e6\u5a92\u3002"},
  EA:  {n:"Electronic Arts",      p:128, v:4800000,  rsi:52,perf:{"1y":8,"6m":3,"3m":1.2,"1m":0.4,"10d":0.2,"1d":0.1},d:"FIFA\u30b7\u30ea\u30fc\u30ba\u30fbApex Legends\u30fbSims\u3092\u6301\u3064\u5927\u624b\u30b2\u30fc\u30e0\u30e1\u30fc\u30ab\u30fc\u3002\u30e9\u30a4\u30d6\u30b5\u30fc\u30d3\u30b9\u30e2\u30c7\u30eb\u3078\u79fb\u884c\u4e2d\u3002"},
  // ─── \u30b3\u30f3\u30b7\u30e5\u30fc\u30de\u30fc\u30fb\u30e2\u30d3\u30ea\u30c6\u30a3 ───
  DUOL:{n:"Duolingo",             p:382, v:2400000,  rsi:64,perf:{"1y":82,"6m":28,"3m":12,"1m":4.4,"10d":1.8,"1d":0.5},d:"\u4e16\u754c\u6700\u5927\u306e\u8a00\u8a9e\u5b66\u7fd2\u30a2\u30d7\u30ea\u3002AI\u6d3b\u7528\u306e\u500b\u5225\u5b66\u7fd2\u3068\u30b5\u30d6\u30b9\u30af\u30e2\u30c7\u30eb\u3067\u6025\u6210\u9577\u4e2d\u306eEduTech\u9298\u67c4\u3002"},
  ABNB:{n:"Airbnb",               p:138, v:8400000,  rsi:58,perf:{"1y":18,"6m":6,"3m":2.8,"1m":1.0,"10d":0.4,"1d":0.2},d:"\u4e16\u754c\u6700\u5927\u306e\u30db\u30fc\u30e0\u30b7\u30a7\u30a2\u30ea\u30f3\u30b0\u30d7\u30e9\u30c3\u30c8\u30d5\u30a9\u30fc\u30e0\u3002\u65c5\u884c\u9700\u8981\u306e\u56de\u5fa9\u3068Experiences\u4e8b\u696d\u62e1\u5927\u3067\u6210\u9577\u3002"},
  UBER:{n:"Uber",                  p:75,  v:18000000, rsi:62,perf:{"1y":82,"6m":28,"3m":12,"1m":4.4,"10d":1.8,"1d":0.5},d:"\u4e16\u754c\u6700\u5927\u306e\u30e9\u30a4\u30c9\u30b7\u30a7\u30a2\u30fb\u30d5\u30fc\u30c9\u30c7\u30ea\u30d0\u30ea\u30fc\u4f01\u696d\u3002\u30ed\u30dc\u30bf\u30af\u30b7\u30fc\u3078\u306e\u53c2\u5165\u3067Tesla\u3068\u306e\u7af6\u4e89\u3082\u6fc0\u5316\u3002"},
  LYFT:{n:"Lyft",                  p:14,  v:18000000, rsi:48,perf:{"1y":48,"6m":18,"3m":7.8,"1m":2.8,"10d":1.1,"1d":0.3},d:"\u7c73\u56fd\u7b2c2\u4f4d\u306e\u30e9\u30a4\u30c9\u30b7\u30a7\u30a2\u4f01\u696d\u3002Uber\u5bfe\u6bd4\u3067\u306e\u7af6\u4e89\u529b\u5f37\u5316\u3068\u9ed2\u5b57\u5316\u5b9a\u7740\u304c\u8ab2\u984c\u3002"},
  DASH:{n:"DoorDash",              p:176, v:8400000,  rsi:62,perf:{"1y":62,"6m":22,"3m":9.4,"1m":3.4,"10d":1.4,"1d":0.4},d:"\u7c73\u56fd\u6700\u5927\u306e\u30d5\u30fc\u30c9\u30c7\u30ea\u30d0\u30ea\u30fc\u30d7\u30e9\u30c3\u30c8\u30d5\u30a9\u30fc\u30e0\u3002Wolt\u8cb7\u53ce\u3067\u6b27\u5dde\u30fb\u65e5\u672c\u306b\u3082\u5c55\u958b\u3092\u62e1\u5927\u4e2d\u3002"},
  GRAB:{n:"Grab Holdings",         p:4,   v:18000000, rsi:48,perf:{"1y":28,"6m":10,"3m":4.4,"1m":1.6,"10d":0.6,"1d":0.2},d:"\u6771\u5357\u30a2\u30b8\u30a2\u6700\u5927\u306e\u30b9\u30fc\u30d1\u30fc\u30a2\u30d7\u30ea\uff08\u30e9\u30a4\u30c9\u30b7\u30a7\u30a2\u30fb\u30c7\u30ea\u30d0\u30ea\u30fc\u30fb\u91d1\u878d\uff09\u3002\u30b7\u30f3\u30ac\u30dd\u30fc\u30eb\u767a\u306eNASDAQ\u4e0a\u5834\u3002"},
  MNDY:{n:"Monday.com",            p:312, v:1800000,  rsi:62,perf:{"1y":82,"6m":28,"3m":12,"1m":4.4,"10d":1.8,"1d":0.5},d:"\u30ce\u30fc\u30b3\u30fc\u30c9\u696d\u52d9\u7ba1\u7406\u30fb\u30d7\u30ed\u30b8\u30a7\u30af\u30c8\u7ba1\u7406SaaS\u30d7\u30e9\u30c3\u30c8\u30d5\u30a9\u30fc\u30e0\u3002\u30a8\u30f3\u30bf\u30fc\u30d7\u30e9\u30a4\u30ba\u5411\u3051\u306b\u6025\u62e1\u5927\u4e2d\u3002"},
  // ─── \u30c7\u30b8\u30bf\u30eb\u30d8\u30eb\u30b9\u65b0\u8208 ───
  HIMS:{n:"Hims & Hers Health",    p:15,  v:8400000,  rsi:62,perf:{"1y":182,"6m":72,"3m":32,"1m":11,"10d":4.4,"1d":1.4},d:"ED\u30fb\u629c\u3051\u6bdb\u30fb\u4f53\u91cd\u7ba1\u7406\u85ac\u306e\u30aa\u30f3\u30e9\u30a4\u30f3\u51e6\u65b9\u30d7\u30e9\u30c3\u30c8\u30d5\u30a9\u30fc\u30e0\u3002GLP-1\u51e6\u65b9\u3067\u6025\u6210\u9577\u4e2d\u3002"},
  TDOC:{n:"Teladoc Health",        p:8,  v:8400000,  rsi:38,perf:{"1y":-42,"6m":-18,"3m":-4.8,"1m":-1.8,"10d":-0.8,"1d":-0.2},d:"\u4e16\u754c\u6700\u5927\u306e\u30c6\u30ec\u30d8\u30eb\u30b9\u30d7\u30e9\u30c3\u30c8\u30d5\u30a9\u30fc\u30e0\u3002\u30b3\u30ed\u30ca\u7279\u9700\u5f8c\u306e\u9700\u8981\u6b63\u5e38\u5316\u3067\u682a\u4fa1\u4f4e\u8ff7\u304c\u7d9a\u304f\u3002"},
  NVCR:{n:"NovoCure",              p:14,  v:4800000,  rsi:48,perf:{"1y":-18,"6m":-6,"3m":-2,"1m":-0.7,"10d":-0.3,"1d":-0.1},d:"\u816b\u760d\u6cbb\u7642\u96fb\u5834\uff08TTF\uff09\u3092\u4f7f\u3063\u305f\u9769\u65b0\u7684\u304c\u3093\u6cbb\u7642\u6a5f\u5668\u3092\u958b\u767a\u30fb\u8ca9\u58f2\u3059\u308b\u30e1\u30c9\u30c6\u30c3\u30af\u4f01\u696d\u3002"},
  // ─── \u30d5\u30a3\u30f3\u30c6\u30c3\u30af\u65b0\u8208 ───
  UPST:{n:"Upstart Holdings",      p:78,  v:8400000,  rsi:58,perf:{"1y":142,"6m":52,"3m":22,"1m":7.8,"10d":3.2,"1d":1.0},d:"AI\u3092\u6d3b\u7528\u3057\u305f\u500b\u4eba\u5411\u3051\u6d88\u8cbb\u8005\u30ed\u30fc\u30f3\u5be9\u67fb\u30d7\u30e9\u30c3\u30c8\u30d5\u30a9\u30fc\u30e0\u3002\u9280\u884c\u30fb\u4fe1\u7528\u7d44\u5408\u3068\u63d0\u643a\u3057FICO\u4ee3\u66ff\u3092\u76ee\u6307\u3059\u3002"},
  NU:  {n:"Nu Holdings(Nubank)",    p:12,  v:28000000, rsi:58,perf:{"1y":48,"6m":18,"3m":7.8,"1m":2.8,"10d":1.1,"1d":0.3},d:"\u30d6\u30e9\u30b8\u30eb\u30fb\u30e1\u30ad\u30b7\u30b3\u30fb\u30b3\u30ed\u30f3\u30d3\u30a2\u3067\u5c55\u958b\u3059\u308b\u30e9\u30c6\u30f3\u30a2\u30e1\u30ea\u30ab\u6700\u5927\u306e\u30c7\u30b8\u30bf\u30eb\u30d0\u30f3\u30af\u3002\u9ad8\u6210\u9577\u304c\u7d9a\u304f\u3002"},
  DKNG:{n:"DraftKings",            p:46,  v:8400000,  rsi:54,perf:{"1y":62,"6m":22,"3m":9.4,"1m":3.4,"10d":1.4,"1d":0.4},d:"\u7c73\u56fd\u6700\u5927\u306e\u30aa\u30f3\u30e9\u30a4\u30f3\u30b9\u30dd\u30fc\u30c4\u30d9\u30c3\u30c6\u30a3\u30f3\u30b0\u30fbDFS\u30d7\u30e9\u30c3\u30c8\u30d5\u30a9\u30fc\u30e0\u3002\u5dde\u3054\u3068\u306e\u5408\u6cd5\u5316\u62e1\u5927\u3067\u6210\u9577\u3002"},
  FLUT:{n:"Flutter/FanDuel",        p:258, v:2400000,  rsi:62,perf:{"1y":42,"6m":15,"3m":6.4,"1m":2.2,"10d":0.9,"1d":0.3},d:"FanDuel\u3092\u5098\u4e0b\u306b\u6301\u3064\u30b9\u30dd\u30fc\u30c4\u30d9\u30c3\u30c6\u30a3\u30f3\u30b0\u5927\u624b\u3002\u7c73\u56fd\u30aa\u30f3\u30e9\u30a4\u30f3\u30ae\u30e3\u30f3\u30d6\u30eb\u89e3\u7981\u3067\u6025\u6210\u9577\u4e2d\u3002"},
  PENN:{n:"Penn Entertainment",     p:16,  v:8400000,  rsi:46,perf:{"1y":-28,"6m":-12,"3m":-3.2,"1m":-1.2,"10d":-0.5,"1d":-0.1},d:"ESPN Bet\u30d6\u30e9\u30f3\u30c9\u3067\u30b9\u30dd\u30fc\u30c4\u30d9\u30c3\u30c6\u30a3\u30f3\u30b0\u306b\u53c2\u5165\u3057\u305f\u30ab\u30b8\u30ce\u30fb\u30a8\u30f3\u30bf\u30e1\u4f01\u696d\u3002\u7269\u7406\u30ab\u30b8\u30ce\u3082\u5168\u7c73\u5c55\u958b\u3002"},
  // ─── \u30d0\u30a4\u30aa\u65b0\u8208\uff08\u907a\u4f1d\u5b50\u6cbb\u7642\uff09 ───
  CRSP:{n:"CRISPR Therapeutics",   p:32,  v:4800000,  rsi:52,perf:{"1y":18,"6m":6,"3m":2.8,"1m":1.0,"10d":0.4,"1d":0.2},d:"CRISPR-Cas9\u907a\u4f1d\u5b50\u7de8\u96c6\u6280\u8853\u3092\u4f7f\u3063\u305f\u6cbb\u7642\u85ac\u3092\u958b\u767a\u3002\u938c\u72b6\u8d64\u8840\u7403\u75c7\u306e\u6cbb\u7642\u85ac\u304c\u4e16\u754c\u521d\u627f\u8a8d\u3092\u53d6\u5f97\u3002"},
  BEAM:{n:"Beam Therapeutics",     p:18,  v:2400000,  rsi:44,perf:{"1y":-28,"6m":-12,"3m":-3.2,"1m":-1.2,"10d":-0.5,"1d":-0.1},d:"\u5869\u57fa\u7de8\u96c6\uff08Base Editing\uff09\u6280\u8853\u3092\u4f7f\u3063\u305f\u7cbe\u5bc6\u907a\u4f1d\u5b50\u6cbb\u7642\u3092\u958b\u767a\u3059\u308b\u30d0\u30a4\u30aa\u30c6\u30c3\u30af\u65b0\u8208\u4f01\u696d\u3002"},
  NTLA:{n:"Intellia Therapeutics",  p:12,  v:4800000,  rsi:42,perf:{"1y":-42,"6m":-18,"3m":-4.8,"1m":-1.8,"10d":-0.8,"1d":-0.2},d:"CRISPR\u6280\u8853\u3092\u4f7f\u3063\u305fin vivo\u907a\u4f1d\u5b50\u7642\u6cd5\u3092\u958b\u767a\u3002\u30c8\u30e9\u30f3\u30b9\u30b5\u30a4\u30ec\u30c1\u30f3\u7814\u7a76\u304c\u6ce8\u76ee\u3055\u308c\u3066\u3044\u308b\u3002"},
  EDIT:{n:"Editas Medicine",        p:4,   v:4800000,  rsi:36,perf:{"1y":-62,"6m":-28,"3m":-6.4,"1m":-2.4,"10d":-1.0,"1d":-0.3},d:"CRISPR\u907a\u4f1d\u5b50\u7de8\u96c6\u6cbb\u7642\u85ac\u3092\u958b\u767a\u3059\u308b\u30d1\u30a4\u30aa\u30cb\u30a2\u4f01\u696d\u3002\u773c\u75be\u60a3\u30fb\u8840\u6db2\u75be\u60a3\u5411\u3051\u30d1\u30a4\u30d7\u30e9\u30a4\u30f3\u3092\u4fdd\u6709\u3002"},
  // ─── \u30af\u30ea\u30fc\u30f3\u30c6\u30c3\u30af\u65b0\u8208 ───
  ARRY:{n:"Array Technologies",    p:8,  v:4800000,  rsi:42,perf:{"1y":-28,"6m":-12,"3m":-3.2,"1m":-1.2,"10d":-0.5,"1d":-0.1},d:"\u592a\u967d\u5149\u767a\u96fb\u5411\u3051\u4e00\u8ef8\u8ffd\u5c3e\u30b7\u30b9\u30c6\u30e0\u306e\u5927\u624b\u30e1\u30fc\u30ab\u30fc\u3002\u592a\u967d\u5149\u306e\u89d2\u5ea6\u3092\u81ea\u52d5\u8abf\u6574\u3057\u767a\u96fb\u52b9\u7387\u3092\u6700\u5927\u5316\u3002"},
  BLNK:{n:"Blink Charging",        p:2,   v:4800000,  rsi:34,perf:{"1y":-62,"6m":-28,"3m":-6.4,"1m":-2.4,"10d":-1.0,"1d":-0.3},d:"EV\u5145\u96fb\u30cd\u30c3\u30c8\u30ef\u30fc\u30af\u3092\u5c55\u958b\u3059\u308b\u65b0\u8208\u4f01\u696d\u3002\u30b7\u30e7\u30c3\u30d4\u30f3\u30b0\u30e2\u30fc\u30eb\u30fb\u99d0\u8eca\u5834\u30fb\u4f4f\u5b85\u5411\u3051\u306b\u5145\u96fb\u5668\u3092\u8a2d\u7f6e\u4e2d\u3002"},
  CHPT:{n:"ChargePoint Holdings",   p:1,   v:14000000, rsi:32,perf:{"1y":-72,"6m":-38,"3m":-8.4,"1m":-3.2,"10d":-1.4,"1d":-0.4},d:"\u5317\u7c73\u30fb\u6b27\u5dde\u3067\u6700\u5927\u306eEV\u5145\u96fb\u30cd\u30c3\u30c8\u30ef\u30fc\u30af\u3092\u904b\u55b6\u3002\u30bd\u30d5\u30c8\u30a6\u30a7\u30a2\u30b5\u30d6\u30b9\u30af\u30e2\u30c7\u30eb\u3067\u53ce\u76ca\u5316\u3092\u63a8\u9032\u4e2d\u3002"},
  STEM:{n:"Stem Inc.",              p:2,   v:4800000,  rsi:36,perf:{"1y":-72,"6m":-38,"3m":-8.4,"1m":-3.2,"10d":-1.4,"1d":-0.4},d:"AI\u3092\u6d3b\u7528\u3057\u305f\u4f01\u696d\u5411\u3051\u84c4\u96fb\u6c60\u30a8\u30cd\u30eb\u30ae\u30fc\u7ba1\u7406\u30d7\u30e9\u30c3\u30c8\u30d5\u30a9\u30fc\u30e0\u3002\u592a\u967d\u5149+\u84c4\u96fb\u6c60\u30b7\u30b9\u30c6\u30e0\u3092\u6700\u9069\u5236\u5fa1\u3002"},
  // ─── GLP-1\u30fb\u80a5\u6e80\u6cbb\u7642\u95a2\u9023 ───
  HALO:{n:"Halozyme Therapeutics",  p:58,  v:4800000,  rsi:58,perf:{"1y":48,"6m":18,"3m":7.8,"1m":2.8,"10d":1.1,"1d":0.3},d:"ENHANZE\u85ac\u7269\u9001\u9054\u6280\u8853\u3092\u88fd\u85ac\u5927\u624b\u306b\u30e9\u30a4\u30bb\u30f3\u30b9\u3002GLP-1\u85ac\u5264\u306e\u76ae\u4e0b\u6ce8\u5c04\u52b9\u7387\u5316\u3067\u9700\u8981\u6025\u5897\u4e2d\u3002"},
  ZEAL:{n:"Zealand Pharma ADR",     p:92,  v:1200000,  rsi:62,perf:{"1y":128,"6m":48,"3m":22,"1m":7.8,"10d":3.2,"1d":1.0},d:"\u30c7\u30f3\u30de\u30fc\u30af\u767a\u306e\u80a5\u6e80\u30fbGLP-1\u95a2\u9023\u85ac\u5264\u3092\u958b\u767a\u3059\u308b\u30d0\u30a4\u30aa\u30c6\u30c3\u30af\u3002\u6b21\u4e16\u4ee3\u30da\u30d7\u30c1\u30c9\u7cfb\u85ac\u5264\u3092\u7814\u7a76\u4e2d\u3002"},
  RBOT:{n:"Vicarious Surgical",     p:1,   v:2400000,  rsi:38,perf:{"1y":-42,"6m":-18,"3m":-4.8,"1m":-1.8,"10d":-0.8,"1d":-0.2},d:"VR\u3068\u624b\u8853\u30ed\u30dc\u30c3\u30c8\u3092\u7d44\u307f\u5408\u308f\u305b\u305f\u6b21\u4e16\u4ee3\u5916\u79d1\u624b\u8853\u30b7\u30b9\u30c6\u30e0\u3092\u958b\u767a\u3059\u308b\u65b0\u8208\u30e1\u30c9\u30c6\u30c3\u30af\u4f01\u696d\u3002"},
};


const THEMES = [
  { id:"gpu",      name:"GPU\u30fbAI\u30a2\u30af\u30bb\u30e9\u30ec\u30fc\u30bf", emoji:"🖥️", color:"#00D4FF",
    perf:{"1y":188,"6m":68,"3m":30,"1m":11,"10d":4.4,"1d":1.4},
    stocks:["NVDA","AMD","INTC","ARM","MRVL","SMCI","ANET","VRT","GLW"] },
  { id:"semieq",   name:"\u534a\u5c0e\u4f53\u88c5\u7f6e\u30fb\u6750\u6599",       emoji:"⚙️", color:"#88FFCC",
    perf:{"1y":72,"6m":26,"3m":11,"1m":4,"10d":1.6,"1d":0.5},
    stocks:["AMAT","LRCX","KLAC","ASML","AVGO","TXN","QCOM","MU","ON"] },
  { id:"bigtech",  name:"\u30d3\u30c3\u30b0\u30c6\u30c3\u30af GAFAM",     emoji:"🌐", color:"#4488FF",
    perf:{"1y":78,"6m":28,"3m":12,"1m":4.6,"10d":1.8,"1d":0.6},
    stocks:["MSFT","GOOGL","META","AMZN","AAPL"] },
  { id:"aiinfra",  name:"AI\u30a4\u30f3\u30d5\u30e9\u65b0\u8208",          emoji:"🧠", color:"#00FFFF",
    perf:{"1y":228,"6m":92,"3m":42,"1m":16,"10d":6,"1d":2},
    stocks:["NBIS","IREN","CRVW","BBAI","SOUN","PLTR","VRT","SMCI"] },
  { id:"cloud",    name:"\u30af\u30e9\u30a6\u30c9\u30a4\u30f3\u30d5\u30e9",         emoji:"☁️", color:"#66AAFF",
    perf:{"1y":62,"6m":22,"3m":9.4,"1m":3.4,"10d":1.4,"1d":0.4},
    stocks:["MSFT","AMZN","GOOGL","ORCL","SAP","SNOW","MDB","DDOG"] },
  { id:"saas",     name:"\u30a8\u30f3\u30bf\u30fc\u30d7\u30e9\u30a4\u30baSaaS",    emoji:"💼", color:"#5599FF",
    perf:{"1y":48,"6m":18,"3m":7.8,"1m":2.8,"10d":1.1,"1d":0.3},
    stocks:["CRM","NOW","WDAY","ADBE","INTU","MNDY","PATH","GTLB","ESTC","ZM"] },
  { id:"aidata",   name:"AI\u30c7\u30fc\u30bf\u30fb\u5206\u6790",          emoji:"📊", color:"#44CCFF",
    perf:{"1y":82,"6m":30,"3m":13,"1m":4.8,"10d":1.9,"1d":0.6},
    stocks:["PLTR","SNOW","MDB","DDOG","GTLB","ESTC","RXRX","SDGR"] },
  { id:"cyber",    name:"\u30b5\u30a4\u30d0\u30fc\u30bb\u30ad\u30e5\u30ea\u30c6\u30a3",    emoji:"🔒", color:"#FFB800",
    perf:{"1y":72,"6m":26,"3m":11,"1m":4.2,"10d":1.7,"1d":0.5},
    stocks:["CRWD","PANW","ZS","OKTA","FTNT","CYBR","S","QLYS"] },
  { id:"btcmining",name:"BTC\u30de\u30a4\u30cb\u30f3\u30b0",           emoji:"⛏️", color:"#F7931A",
    perf:{"1y":128,"6m":48,"3m":20,"1m":7,"10d":2.8,"1d":0.9},
    stocks:["MARA","RIOT","CLSK","IREN","HUT","BITF","CIFR","BTBT","MSTR"] },
  { id:"crypto",   name:"\u30af\u30ea\u30d7\u30c8\u30fbWeb3",          emoji:"🪙", color:"#F0B90B",
    perf:{"1y":148,"6m":58,"3m":26,"1m":9.2,"10d":3.8,"1d":1.2},
    stocks:["COIN","MSTR","MARA","RIOT","SQ","HOOD","AFRM"] },
  { id:"ev",       name:"EV\u30fb\u81ea\u52d5\u904b\u8ee2",            emoji:"⚡", color:"#00FF88",
    perf:{"1y":-22,"6m":-14,"3m":5.2,"1m":-1.8,"10d":-0.9,"1d":-0.3},
    stocks:["TSLA","RIVN","LCID","GM","F","UBER","LYFT"] },
  { id:"evcharge",  name:"EV\u5145\u96fb\u30a4\u30f3\u30d5\u30e9",          emoji:"🔌", color:"#44FF66",
    perf:{"1y":-58,"6m":-28,"3m":-5.2,"1m":-2,"10d":-0.8,"1d":-0.2},
    stocks:["CHPT","BLNK","TSLA"] },
  { id:"cleanene",  name:"\u592a\u967d\u5149\u30fb\u518d\u30a8\u30cd",          emoji:"☀️", color:"#FFEE44",
    perf:{"1y":-18,"6m":-10,"3m":4.2,"1m":-1.2,"10d":-0.6,"1d":-0.2},
    stocks:["FSLR","ENPH","SEDG","NEE","RUN","ARRY","STEM"] },
  { id:"nuclear",   name:"\u539f\u5b50\u529b\u30fb\u96fb\u529b\u30a4\u30f3\u30d5\u30e9",    emoji:"⚛️", color:"#FFFF44",
    perf:{"1y":198,"6m":74,"3m":34,"1m":13,"10d":5.2,"1d":1.6},
    stocks:["CEG","VST","NEE","VRT"] },
  { id:"biopharma", name:"\u30d0\u30a4\u30aa\u30fb\u5275\u85ac\u5927\u624b",        emoji:"🧬", color:"#FF6BFF",
    perf:{"1y":44,"6m":16,"3m":7,"1m":2.8,"10d":1.1,"1d":0.6},
    stocks:["LLY","NVO","ABBV","BMY","GILD","MRNA","REGN","VRTX","BIIB","AMGN"] },
  { id:"genetherapy",name:"\u907a\u4f1d\u5b50\u6cbb\u7642\u30fbCRISPR",    emoji:"🔬", color:"#FF44FF",
    perf:{"1y":-18,"6m":-8,"3m":-2.4,"1m":-0.8,"10d":-0.4,"1d":-0.1},
    stocks:["CRSP","BEAM","NTLA","EDIT","RXRX","SDGR"] },
  { id:"glp1",      name:"GLP-1\u30fb\u80a5\u6e80\u6cbb\u7642",        emoji:"💉", color:"#FF88CC",
    perf:{"1y":128,"6m":48,"3m":22,"1m":7.8,"10d":3.2,"1d":1.0},
    stocks:["LLY","NVO","HIMS","HALO","ZEAL","VRTX"] },
  { id:"medtech",   name:"\u30e1\u30c9\u30c6\u30c3\u30af\u30fb\u533b\u7642\u6a5f\u5668",    emoji:"🏥", color:"#FF88FF",
    perf:{"1y":18,"6m":6,"3m":2.4,"1m":0.8,"10d":0.3,"1d":0.1},
    stocks:["MDT","ABT","SYK","ISRG","DXCM","EW","NVCR","RBOT"] },
  { id:"digitalhealth",name:"\u30c7\u30b8\u30bf\u30eb\u30d8\u30eb\u30b9",       emoji:"📱", color:"#44EEBB",
    perf:{"1y":48,"6m":18,"3m":7.8,"1m":2.8,"10d":1.1,"1d":0.3},
    stocks:["HIMS","TDOC","RXRX","DXCM","ABT"] },
  { id:"health",    name:"\u30d8\u30eb\u30b9\u30b1\u30a2\u30fb\u4fdd\u967a",        emoji:"💊", color:"#44DDDD",
    perf:{"1y":12,"6m":4,"3m":1.8,"1m":0.6,"10d":0.3,"1d":0.0},
    stocks:["UNH","JNJ","TMO","CVS","HCA"] },
  { id:"fintech",   name:"\u30d5\u30a3\u30f3\u30c6\u30c3\u30af\u30fb\u6c7a\u6e08",      emoji:"💳", color:"#FF8844",
    perf:{"1y":48,"6m":18,"3m":9,"1m":3.4,"10d":1.4,"1d":0.4},
    stocks:["V","MA","PYPL","SQ","AFRM","COIN","SOFI","HOOD","UPST","NU"] },
  { id:"betting",   name:"\u30b9\u30dd\u30fc\u30c4\u30d9\u30c3\u30c6\u30a3\u30f3\u30b0",    emoji:"🎰", color:"#FFAA22",
    perf:{"1y":52,"6m":20,"3m":8.4,"1m":3.0,"10d":1.2,"1d":0.4},
    stocks:["DKNG","FLUT","PENN"] },
  { id:"bigbank",   name:"\u5927\u624b\u9280\u884c\u30fb\u91d1\u878d",          emoji:"🏦", color:"#FFAA44",
    perf:{"1y":34,"6m":12,"3m":5.2,"1m":1.8,"10d":0.7,"1d":0.2},
    stocks:["JPM","BAC","WFC","GS","MS","BLK","SCHW"] },
  { id:"defense",   name:"\u9632\u885b\u30fb\u30df\u30b5\u30a4\u30eb",          emoji:"🛡️", color:"#FF5555",
    perf:{"1y":28,"6m":11,"3m":5,"1m":1.8,"10d":0.7,"1d":-0.1},
    stocks:["LMT","RTX","NOC","GD","BA","PLTR","BBAI"] },
  { id:"space",     name:"\u5b87\u5b99\u30fb\u885b\u661f",              emoji:"🚀", color:"#FF7777",
    perf:{"1y":128,"6m":52,"3m":24,"1m":8.8,"10d":3.4,"1d":1.1},
    stocks:["RKLB","ASTS","LUNR","SPCE","PLTR","RTX","NOC","ASTA"] },
  { id:"ecom",      name:"EC\u30fb\u30c7\u30b8\u30bf\u30eb\u5c0f\u58f2",        emoji:"🛒", color:"#FFDD44",
    perf:{"1y":32,"6m":12,"3m":5.2,"1m":1.8,"10d":0.7,"1d":0.2},
    stocks:["AMZN","SHOP","EBAY","ETSY","W","CHWY","GRAB"] },
  { id:"consumer",  name:"\u30b3\u30f3\u30b7\u30e5\u30fc\u30de\u30fc\u30fb\u30e2\u30d3\u30ea\u30c6\u30a3",emoji:"🚗",color:"#FFCC44",
    perf:{"1y":58,"6m":22,"3m":9.4,"1m":3.4,"10d":1.4,"1d":0.4},
    stocks:["UBER","LYFT","DASH","ABNB","DUOL","MNDY","RBLX"] },
  { id:"media",     name:"\u30e1\u30c7\u30a3\u30a2\u30fb\u30a8\u30f3\u30bf\u30e1",       emoji:"🎬", color:"#FF4488",
    perf:{"1y":42,"6m":14,"3m":6,"1m":2.2,"10d":0.9,"1d":0.3},
    stocks:["NFLX","DIS","SPOT","META","GOOGL","TTWO","EA","RBLX","U"] },
  { id:"telecom",   name:"\u901a\u4fe1\u30fb5G",                emoji:"📡", color:"#44AAFF",
    perf:{"1y":14,"6m":4,"3m":1.8,"1m":0.6,"10d":0.2,"1d":0.1},
    stocks:["T","VZ","QCOM","ANET","ASTS","GLW"] },
  { id:"nasdaq",    name:"NASDAQ ETF\u30fb\u6307\u6570",         emoji:"📈", color:"#00FFCC",
    perf:{"1y":28,"6m":10,"3m":4.2,"1m":1.5,"10d":0.6,"1d":0.3},
    stocks:["QQQ","TQQQ","SQQQ","ONEQ","QYLD"] },
  { id:"chinaadrs", name:"\u4e2d\u56fdADR\u30fb\u65b0\u8208\u5e02\u5834",         emoji:"🐉", color:"#FF6644",
    perf:{"1y":12,"6m":4,"3m":1.8,"1m":0.6,"10d":0.2,"1d":0.1},
    stocks:["BABA","BIDU","PDD","JD","NTES","TSMC"] },
];


function fmt$(v){
  if(v>=1000) return "$"+(v/1000).toFixed(1)+"k";
  if(v>=10)   return "$"+v.toFixed(0);
  return "$"+v.toFixed(2);
}
function fmtVol(v){
  if(v>=1e9) return (v/1e9).toFixed(1)+"B";
  if(v>=1e6) return (v/1e6).toFixed(0)+"M";
  return v.toLocaleString();
}
function rsiColor(r){ return r>=70?"#FF4444":r>=60?"#FFB800":r<=30?"#00CCFF":r<=40?"#4488FF":"#888"; }
function rsiLabel(r){ return r>=70?"\u8cb7\u308f\u308c\u3059\u304e":r<=30?"\u58f2\u3089\u308c\u3059\u304e":"\u4e2d\u7acb"; }
const MEDALS=["🥇","🥈","🥉"];


function seededRand(seed){
  let s=seed;
  return ()=>{ s=(s*1664525+1013904223)&0xffffffff; return (s>>>0)/0xffffffff; };
}
function genChart(ticker,chartType,perfPeriod,stockData){
  const s=stockData||SM[ticker];
  if(!s) return [];
  const seed=ticker.split("").reduce((a,c)=>a+c.charCodeAt(0),0)+chartType.length*97;
  const rand=seededRand(seed);
  // \u6708\u8db3:24\u30f6\u6708(2\u5e74), \u9031\u8db3:52\u9031(1\u5e74), \u65e5\u8db3:60\u65e5(3\u30f6\u6708)
  const nMap={monthly:24,weekly:52,daily:60};
  const n=nMap[chartType]||60;
  const tot=s.perf[perfPeriod]/100;
  const base=s.p/(1+tot);
  const vPct=Math.max(0.012,Math.abs(tot)/n*2.5);
  const gains=[],losses=[],data=[];
  let price=base;
  for(let i=0;i<n;i++){
    const prev=price;
    price=Math.max(price*0.4,price*(1+tot/n+(rand()-0.5)*vPct));
    gains.push(Math.max(0,price-prev));
    losses.push(Math.max(0,prev-price));
    const w=Math.min(14,i+1);
    const avgG=gains.slice(-w).reduce((a,b)=>a+b,0)/w;
    const avgL=losses.slice(-w).reduce((a,b)=>a+b,0)/w;
    const rsi=avgL===0?100:100-100/(1+avgG/avgL);
    const vol=s.v*(0.5+rand());
    let label="";
    if(chartType==="monthly"){
      // \u6708\u8db3: 6\u30f6\u6708\u3054\u3068\u306b\u30e9\u30d9\u30eb
      if(i%6===0){ const yr=Math.floor(i/12)+1; const mo=i%12+1; label=`${yr}\u5e74${mo}\u6708`; }
    } else if(chartType==="weekly"){
      // \u9031\u8db3: \u6708\u521d\u3081\u3054\u3068\u306b\u30e9\u30d9\u30eb\uff084\u9031=1\u30f6\u6708\uff09
      if(i%4===0){ label=`${Math.floor(i/4)+1}\u30f6\u6708`; }
    } else {
      // \u65e5\u8db3: 10\u65e5\u3054\u3068\u306b\u30e9\u30d9\u30eb
      if(i%10===0){ label=`${i+1}\u65e5\u76ee`; }
    }
    data.push({i,label,price:+price.toFixed(2),vol:+vol.toFixed(0),rsi:+rsi.toFixed(1)});
  }
  return data;
}


function StockChart({ticker,chartType,perfPeriod,themeColor,stockData}){
  const s=stockData||SM[ticker];
  const [hover,setHover]=useState(null);
  const data=useMemo(()=>genChart(ticker,chartType,perfPeriod,s),[ticker,chartType,perfPeriod,s]);
  if(!s||!data.length) return null;

  const isUp=s.perf[perfPeriod]>=0;
  const lc=isUp?"#00EE77":"#FF4444";
  // \u6708\u8db3:\u5e83\u3081(14px), \u9031\u8db3:\u4e2d(10px), \u65e5\u8db3:\u72ed\u3081(8px) → \u30b9\u30af\u30ed\u30fc\u30eb\u3067\u5168\u4f53\u3092\u8868\u793a
  const STEP=chartType==="monthly"?14:chartType==="weekly"?10:8;
  const BW=Math.max(2,STEP-2);
  const YW=42;
  const bW=data.length*STEP+10;
  const HP=130,HV=36,HR=36,HX=14,TOT=HP+HV+HR+HX;

  const ps=data.map(d=>d.price);
  const mnP=Math.min(...ps),mxP=Math.max(...ps);
  const pdP=(mxP-mnP)*0.12||mxP*0.05;
  const sy=v=>HP-((v-(mnP-pdP))/((mxP+pdP)-(mnP-pdP)))*HP;
  const mxV=Math.max(...data.map(d=>d.vol))||1;
  const sv=v=>HV*(1-v/mxV)*0.88;
  const sr=r=>HR*(1-r/100);
  const cx=i=>i*STEP+BW/2;
  const pL=data.map((d,i)=>`${i===0?"M":"L"}${cx(i)},${sy(d.price)}`).join(" ");
  const aF=pL+` L${cx(data.length-1)},${HP} L0,${HP} Z`;
  const rL=data.map((d,i)=>`${i===0?"M":"L"}${cx(i)},${sr(d.rsi)}`).join(" ");
  const rF=rL+` L${cx(data.length-1)},${HR} L0,${HR} Z`;
  const yT=[0,1,2,3,4].map(i=>{const v=(mnP-pdP)+((mxP+pdP)-(mnP-pdP))*i/4;return{v,y:sy(v)};});
  const hx=hover?cx(hover.i):null;

  return(
    <div style={{marginBottom:10}}>
      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5,flexWrap:"wrap"}}>
        <span style={{fontSize:9,color:"rgba(255,255,255,0.3)"}}>\u30c1\u30e3\u30fc\u30c8</span>
        <span style={{fontSize:11,fontWeight:700,fontFamily:"monospace",color:lc,whiteSpace:"nowrap"}}>
          {isUp?"▲":"▼"}{Math.abs(s.perf[perfPeriod]).toFixed(1)}%
        </span>
        <span style={{fontSize:10,fontFamily:"monospace",color:"rgba(255,255,255,0.3)",whiteSpace:"nowrap"}}>
          {fmt$(s.p)}
        </span>
        {hover&&(
          <div style={{fontSize:9,fontFamily:"monospace",background:"rgba(255,255,255,0.07)",
            padding:"2px 6px",borderRadius:4,display:"flex",gap:5,flexWrap:"wrap"}}>
            {hover.label&&<span style={{color:"rgba(255,255,255,0.4)"}}>{hover.label}</span>}
            <span style={{color:"#fff",fontWeight:700}}>{fmt$(hover.price)}</span>
            <span style={{color:"rgba(255,255,255,0.4)"}}>{fmtVol(hover.vol)}</span>
            <span style={{color:"#FFB800"}}>RSI {hover.rsi}</span>
          </div>
        )}
      </div>

      <div style={{display:"flex",borderRadius:8,overflow:"hidden",
        border:"1px solid rgba(255,255,255,0.08)",background:"rgba(4,8,18,0.94)"}}>
        {/* \u56fa\u5b9a\u7e26\u8ef8 */}
        <svg width={YW} height={TOT} style={{flexShrink:0,display:"block"}}>
          <text x={2} y={9} fontSize={6} fill="rgba(255,255,255,0.2)" fontFamily="monospace">\u4fa1\u683c</text>
          {yT.map(({v,y},i)=>(
            <text key={i} x={YW-3} y={Math.min(HP-2,Math.max(8,y+3))} textAnchor="end"
              fontSize={6} fill="rgba(255,255,255,0.38)" fontFamily="monospace">
              {v>=1000?`${(v/1000).toFixed(1)}k`:v.toFixed(v<10?1:0)}
            </text>
          ))}
          <line x1={YW-1} y1={0} x2={YW-1} y2={HP} stroke="rgba(255,255,255,0.1)"/>
          <rect x={0} y={HP} width={YW} height={HV} fill="rgba(0,0,0,0.15)"/>
          <line x1={YW-1} y1={HP} x2={YW-1} y2={HP+HV} stroke="rgba(255,255,255,0.1)"/>
          <text x={2} y={HP+9} fontSize={6} fill="rgba(255,255,255,0.2)" fontFamily="monospace">\u51fa\u6765\u9ad8</text>
          <rect x={0} y={HP+HV} width={YW} height={HR} fill="rgba(0,0,0,0.24)"/>
          <line x1={YW-1} y1={HP+HV} x2={YW-1} y2={HP+HV+HR} stroke="rgba(255,255,255,0.1)"/>
          <text x={2} y={HP+HV+9} fontSize={6} fill="rgba(255,255,255,0.2)" fontFamily="monospace">RSI</text>
          {[{v:70,c:"rgba(255,80,80,0.7)"},{v:50,c:"rgba(255,255,255,0.2)"},{v:30,c:"rgba(80,136,255,0.7)"}].map(({v,c})=>(
            <text key={v} x={YW-3} y={HP+HV+sr(v)+3} textAnchor="end" fontSize={6} fill={c} fontFamily="monospace">{v}</text>
          ))}
          <rect x={0} y={HP+HV+HR} width={YW} height={HX} fill="rgba(0,0,0,0.1)"/>
        </svg>
        {/* \u30b9\u30af\u30ed\u30fc\u30eb\u30dc\u30c7\u30a3 */}
        <div style={{overflowX:"auto",flex:1,WebkitOverflowScrolling:"touch"}}>
          <svg width={bW} height={TOT} style={{display:"block"}}
            onMouseLeave={()=>setHover(null)}>
            <defs>
              <linearGradient id={`g${ticker}${chartType}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={lc} stopOpacity={0.26}/>
                <stop offset="100%" stopColor={lc} stopOpacity={0.01}/>
              </linearGradient>
            </defs>
            {yT.map(({y},i)=>(<line key={i} x1={0} y1={y} x2={bW} y2={y} stroke="rgba(255,255,255,0.04)"/>))}
            <line x1={0} y1={sy(data[0]?.price)} x2={bW} y2={sy(data[0]?.price)}
              stroke="rgba(255,255,255,0.12)" strokeDasharray="4 3"/>
            <path d={aF} fill={`url(#g${ticker}${chartType})`}/>
            <path d={pL} fill="none" stroke={lc} strokeWidth={1.6} strokeLinejoin="round" strokeLinecap="round"/>
            <g transform={`translate(0,${HP})`}>
              <rect x={0} y={0} width={bW} height={HV} fill="rgba(0,0,0,0.18)"/>
              <line x1={0} y1={0} x2={bW} y2={0} stroke="rgba(255,255,255,0.06)"/>
              {data.map((d,i)=>{const bh=HV-sv(d.vol)-2;return <rect key={i} x={i*STEP} y={HV-bh} width={BW} height={bh} fill={lc} opacity={0.3} rx={1}/>;})}</g>
            <g transform={`translate(0,${HP+HV})`}>
              <rect x={0} y={0} width={bW} height={HR} fill="rgba(0,0,0,0.28)"/>
              <line x1={0} y1={0} x2={bW} y2={0} stroke="rgba(255,255,255,0.06)"/>
              <rect x={0} y={sr(70)} width={bW} height={sr(30)-sr(70)} fill="rgba(255,255,255,0.02)"/>
              <line x1={0} y1={sr(70)} x2={bW} y2={sr(70)} stroke="rgba(255,80,80,0.22)" strokeDasharray="3 2"/>
              <line x1={0} y1={sr(30)} x2={bW} y2={sr(30)} stroke="rgba(80,136,255,0.22)" strokeDasharray="3 2"/>
              <path d={rF} fill="rgba(255,184,0,0.06)"/>
              <path d={rL} fill="none" stroke="#FFB800" strokeWidth={1.4} strokeLinejoin="round" strokeLinecap="round"/>
              <circle cx={cx(data.length-1)} cy={sr(data[data.length-1]?.rsi||50)} r={2} fill="#FFB800"/>
            </g>
            <g transform={`translate(0,${HP+HV+HR})`}>
              <rect x={0} y={0} width={bW} height={HX} fill="rgba(0,0,0,0.1)"/>
              <line x1={0} y1={0} x2={bW} y2={0} stroke="rgba(255,255,255,0.06)"/>
              {data.filter(d=>d.label).map(d=>(
                <text key={d.i} x={cx(d.i)} y={10} textAnchor="middle" fontSize={6} fill="rgba(255,255,255,0.3)" fontFamily="monospace">{d.label}</text>
              ))}
            </g>
            {hover&&(<>
              <line x1={hx} y1={0} x2={hx} y2={TOT-HX} stroke="rgba(255,255,255,0.18)" strokeDasharray="3 2"/>
              <circle cx={hx} cy={sy(hover.price)} r={3} fill={lc} stroke="rgba(4,8,18,0.9)" strokeWidth={1.5}/>
              <circle cx={hx} cy={HP+HV+sr(hover.rsi)} r={2.5} fill="#FFB800" stroke="rgba(4,8,18,0.9)" strokeWidth={1.5}/>
            </>)}
            {data.map((d,i)=>(
              <rect key={i} x={i*STEP} y={0} width={STEP} height={TOT} fill="transparent"
                style={{cursor:"crosshair"}} onMouseEnter={()=>setHover(d)} onTouchStart={()=>setHover(d)}/>
            ))}
          </svg>
        </div>
      </div>
      <div style={{display:"flex",gap:10,marginTop:3,flexWrap:"wrap"}}>
        {[{c:lc,l:"\u4fa1\u683c"},{c:"rgba(255,255,255,0.28)",l:"\u51fa\u6765\u9ad8"},{c:"#FFB800",l:"RSI(14)"}].map(({c,l})=>(
          <div key={l} style={{display:"flex",alignItems:"center",gap:3}}>
            <div style={{width:12,height:2,background:c,borderRadius:1}}/>
            <span style={{fontSize:7,color:"rgba(255,255,255,0.28)",fontFamily:"monospace"}}>{l}</span>
          </div>
        ))}
        <span style={{fontSize:7,color:"rgba(255,255,255,0.15)",fontFamily:"monospace",marginLeft:"auto"}}>← \u30b9\u30ef\u30a4\u30d7 →</span>
      </div>
    </div>
  );
}


export default function App(){
  const [perfPeriod,setPerfPeriod]=useState("1m");
  const [chartType,setChartType]=useState("daily");
  const [thSort,setThSort]=useState("rise");
  const [activeId,setActiveId]=useState(null);
  const [stSort,setStSort]=useState("rise");
  const [openTicker,setOpenTicker]=useState(null);
  const [searchQ,setSearchQ]=useState("");
  const [searchFocus,setSearchFocus]=useState(false);
  const [showUpdate,setShowUpdate]=useState(false);
  const [smOverride,setSmOverride]=useState({});
  const [bulkStatus,setBulkStatus]=useState("idle");
  const [bulkProgress,setBulkProgress]=useState({done:0,total:0,current:""});
  const [bulkLog,setBulkLog]=useState([]);
  const [bulkUpdated,setBulkUpdated]=useState(0);
  const [lastUpdated,setLastUpdated]=useState(null);

  // SM\u3092\u4e0a\u66f8\u304d\u30c7\u30fc\u30bf\u3068\u30de\u30fc\u30b8
  const SMx = useMemo(()=>{
    const merged={};
    for(const k of Object.keys(SM)) merged[k]={...SM[k],...(smOverride[k]||{})};
    return merged;
  },[smOverride]);

  // \u691c\u7d22\u7d50\u679c
  const searchResults = useMemo(()=>{
    const q=searchQ.trim().toUpperCase();
    if(!q) return [];
    return Object.entries(SMx)
      .filter(([tk,s])=>tk.includes(q)||s.n.includes(searchQ.trim()))
      .slice(0,8);
  },[searchQ,SMx]);

  function resetAllOverrides(){
    setSmOverride({});
    setBulkLog([]);
    setBulkStatus("idle");
    setBulkUpdated(0);
    setLastUpdated(null);
  }

  const FINNHUB_KEY = "d6lpo19r01quej911dm0d6lpo19r01quej911dmg";

  // 1\u9298\u67c4\u3092Finnhub API\u304b\u3089\u53d6\u5f97\uff08\u73fe\u5728\u5024\u306e\u307f\u30fb\u7121\u6599\u30d7\u30e9\u30f3\u5bfe\u5fdc\uff09
  async function fetchSingleQuote(ticker){
    const quoteRes = await fetch(`/api/finnhub/quote?symbol=${ticker}&token=${FINNHUB_KEY}`);
    if(!quoteRes.ok) throw new Error(`HTTP ${quoteRes.status}`);
    const quote = await quoteRes.json();
    if(!quote.c || quote.c === 0) throw new Error("No price");
    const price = quote.c;
    const perf1d = quote.pc > 0 ? +((price/quote.pc-1)*100).toFixed(2) : 0;
    return {
      p: +price.toFixed(2),
      perf1d
    };
  }

  // \u5168\u9298\u67c4\u4e00\u62ec\u66f4\u65b0\uff08Finnhub: 60req/\u5206 → 1.1\u79d2\u9593\u9694\uff09
  async function runBulkUpdate(){
    const tickers = Object.keys(SM);
    setBulkStatus("running");
    setBulkUpdated(0);
    setBulkLog([]);
    const newOverride = {};
    let totalUpdated = 0;

    for(let i=0; i<tickers.length; i++){
      const tk = tickers[i];
      setBulkProgress({done:i, total:tickers.length, current:tk});
      try{
        const val = await fetchSingleQuote(tk);
        const existingPerf = SM[tk].perf || {};
        newOverride[tk] = {
          p: val.p,
          rsi: SM[tk].rsi,
          perf: { ...existingPerf, "1d": val.perf1d },
          v: SM[tk].v
        };
        totalUpdated++;
        setBulkLog(prev=>[...prev, `✅ ${tk} $${val.p}`]);
      } catch(e){
        setBulkLog(prev=>[...prev, `❌ ${tk} -- ${e.message}`]);
      }
      setBulkUpdated(totalUpdated);
      await new Promise(r=>setTimeout(r,1100));
    }

    setSmOverride(newOverride);
    setBulkProgress({done:tickers.length, total:tickers.length, current:""});
    setBulkStatus("done");
    setBulkUpdated(totalUpdated);
    setLastUpdated(new Date().toLocaleString("ja-JP"));
  }

  const sorted=[...THEMES].sort((a,b)=>
    thSort==="rise"?b.perf[perfPeriod]-a.perf[perfPeriod]:a.perf[perfPeriod]-b.perf[perfPeriod]
  );
  const activeTheme=activeId?THEMES.find(t=>t.id===activeId):null;
  const activeIdx=sorted.findIndex(t=>t.id===activeId);
  // \u30b9\u30de\u30db2\u5217\u30b0\u30ea\u30c3\u30c9
  const rows=[];
  for(let i=0;i<sorted.length;i+=2) rows.push(sorted.slice(i,i+2));
  const activeRowIdx=activeIdx>=0?Math.floor(activeIdx/2):-1;

  const stocks=activeTheme
    ?activeTheme.stocks.filter(tk=>SMx[tk])
      .map(tk=>({ticker:tk,...SMx[tk]}))
      .sort((a,b)=>stSort==="rise"?b.perf[perfPeriod]-a.perf[perfPeriod]:a.perf[perfPeriod]-b.perf[perfPeriod])
    :[];

  function Perf({v,sm}){
    const pos=v>=0;
    return(
      <span style={{
        display:"inline-block",padding:sm?"1px 4px":"2px 7px",borderRadius:4,
        fontSize:sm?9:11,fontWeight:700,fontFamily:"monospace",whiteSpace:"nowrap",
        background:pos?"rgba(0,220,90,0.12)":"rgba(255,50,50,0.12)",
        color:pos?"#00EE77":"#FF4444",
        border:`1px solid ${pos?"rgba(0,220,90,0.25)":"rgba(255,50,50,0.25)"}`,
      }}>{pos?"▲":"▼"} {Math.abs(v).toFixed(1)}%</span>
    );
  }

  function StockPanel(){
    if(!activeTheme) return null;
    return(
      <div style={{marginBottom:8,borderRadius:10,overflow:"hidden",
        border:`1.5px solid ${activeTheme.color}38`,background:"rgba(5,9,20,0.98)"}}>
        {/* \u30d8\u30c3\u30c0\u30fc */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
          flexWrap:"wrap",gap:6,padding:"9px 11px",
          background:`${activeTheme.color}0e`,borderBottom:`1px solid ${activeTheme.color}1e`}}>
          <div style={{display:"flex",alignItems:"center",gap:7,minWidth:0}}>
            <span style={{fontSize:17,flexShrink:0}}>{activeTheme.emoji}</span>
            <div style={{minWidth:0}}>
              <div style={{fontWeight:800,fontSize:12,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                {activeTheme.name}
              </div>
              <div style={{fontSize:9,color:"rgba(255,255,255,0.3)",marginTop:1}}>
                {stocks.length}\u9298\u67c4
              </div>
            </div>
            <Perf v={activeTheme.perf[perfPeriod]}/>
          </div>
          <div style={{display:"flex",gap:3,flexShrink:0}}>
            {[["rise","▲\u66b4\u9a30"],["fall","▼\u66b4\u843d"]].map(([k,l])=>(
              <button key={k} onClick={()=>setStSort(k)} style={{
                padding:"4px 8px",borderRadius:5,border:"none",fontSize:10,fontWeight:700,
                background:stSort===k?(k==="rise"?"rgba(0,220,90,0.15)":"rgba(255,50,50,0.15)"):"rgba(255,255,255,0.06)",
                color:stSort===k?(k==="rise"?"#00EE77":"#FF4444"):"rgba(255,255,255,0.35)",
              }}>{l}</button>
            ))}
          </div>
        </div>

        {/* \u5217\u30d8\u30c3\u30c0\u30fc */}
        <div style={{display:"flex",alignItems:"center",gap:4,padding:"4px 10px",
          borderBottom:"1px solid rgba(255,255,255,0.06)",
          fontSize:7,color:"rgba(255,255,255,0.25)",fontFamily:"monospace"}}>
          <div style={{width:16,flexShrink:0}}/>
          <div style={{width:36,flexShrink:0}}>\u9298\u67c4</div>
          <div style={{flex:1,minWidth:0}}>\u540d\u524d</div>
          <div style={{width:46,textAlign:"right",flexShrink:0}}>\u682a\u4fa1</div>
          <div style={{width:50,textAlign:"right",flexShrink:0}}>\u9a30\u843d\u7387</div>
          <div style={{width:40,textAlign:"right",flexShrink:0,lineHeight:1.3}}>
            <div>\u51fa\u6765\u9ad8</div>
            <div style={{color:"#FFB800"}}>RSI</div>
          </div>
          <div style={{width:10,flexShrink:0}}/>
        </div>

        {/* \u9298\u67c4\u884c */}
        {stocks.map((s,si)=>{
          const sv=s.perf[perfPeriod];
          const det=openTicker===s.ticker;
          return(
            <div key={s.ticker} style={{borderBottom:si<stocks.length-1?"1px solid rgba(255,255,255,0.05)":"none"}}>
              <div onClick={()=>setOpenTicker(p=>p===s.ticker?null:s.ticker)}
                style={{display:"flex",alignItems:"center",gap:4,padding:"8px 10px",
                  cursor:"pointer",background:det?"rgba(255,255,255,0.04)":"transparent",
                  transition:"background 0.15s"}}>
                <div style={{width:16,textAlign:"center",flexShrink:0}}>
                  {si<3?<span style={{fontSize:11}}>{MEDALS[si]}</span>
                    :<span style={{fontSize:7,color:"rgba(255,255,255,0.18)",fontFamily:"monospace"}}>{si+1}</span>}
                </div>
                {/* \u30c6\u30a3\u30c3\u30ab\u30fc */}
                <span style={{width:36,flexShrink:0,padding:"2px 3px",borderRadius:3,
                  fontSize:8,fontWeight:700,fontFamily:"monospace",textAlign:"center",
                  background:`${activeTheme.color}18`,color:activeTheme.color,
                  border:`1px solid ${activeTheme.color}28`,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                  {s.ticker}
                </span>
                {/* \u540d\u524d */}
                <span style={{flex:1,fontWeight:600,fontSize:10,
                  overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",minWidth:0}}>
                  {s.n}
                </span>
                {/* \u682a\u4fa1 */}
                <div style={{width:46,flexShrink:0,textAlign:"right"}}>
                  <span style={{fontSize:9,fontWeight:700,fontFamily:"monospace",
                    color:"rgba(255,255,255,0.88)",whiteSpace:"nowrap"}}>
                    {fmt$(s.p)}
                  </span>
                </div>
                {/* \u9a30\u843d\u7387 */}
                <div style={{width:50,flexShrink:0,textAlign:"right"}}>
                  <Perf v={sv} sm/>
                </div>
                {/* \u51fa\u6765\u9ad8 \uff0b \u65e5\u8db3RSI\uff08\u7e262\u6bb5\uff09 */}
                <div style={{width:40,flexShrink:0,textAlign:"right",lineHeight:1.4}}>
                  <div style={{fontSize:7,fontFamily:"monospace",color:"rgba(255,255,255,0.35)",whiteSpace:"nowrap"}}>
                    {fmtVol(s.v)}
                  </div>
                  <div style={{fontSize:8,fontWeight:700,fontFamily:"monospace",
                    color:rsiColor(s.rsi),whiteSpace:"nowrap"}}>
                    {s.rsi}
                  </div>
                </div>
                <span style={{width:10,flexShrink:0,fontSize:9,color:"rgba(255,255,255,0.18)",
                  display:"inline-block",transform:det?"rotate(180deg)":"none",transition:"0.2s",textAlign:"center"}}>▼</span>
              </div>

              {/* \u5c55\u958b\u8a73\u7d30 */}
              {det&&(
                <div style={{padding:"8px 11px 14px",background:"rgba(0,0,0,0.3)"}}>
                  {/* \u30c1\u30e3\u30fc\u30c8\u30bf\u30d6\uff08\u6708\u8db3/\u9031\u8db3/\u65e5\u8db3\uff09 */}
                  <div style={{display:"flex",gap:3,marginBottom:8,
                    background:"rgba(255,255,255,0.05)",padding:3,borderRadius:7,
                    border:"1px solid rgba(255,255,255,0.08)"}}>
                    {CHART_TYPES.map(ct=>(
                      <button key={ct.key} onClick={(e)=>{e.stopPropagation();setChartType(ct.key);}} style={{
                        flex:1,padding:"5px 8px",borderRadius:5,border:"none",fontSize:11,fontWeight:700,
                        background:chartType===ct.key?activeTheme.color:"transparent",
                        color:chartType===ct.key?"#080C14":"rgba(255,255,255,0.45)",
                        transition:"all 0.15s",
                      }}>{ct.label}</button>
                    ))}
                  </div>

                  <StockChart ticker={s.ticker} chartType={chartType} perfPeriod={perfPeriod} themeColor={activeTheme.color} stockData={SMx[s.ticker]}/>

                  {/* \u4e8b\u696d\u6982\u8981 */}
                  <div style={{padding:"8px 10px",borderRadius:7,marginBottom:9,
                    background:`${activeTheme.color}09`,border:`1px solid ${activeTheme.color}1e`,
                    fontSize:12,lineHeight:1.75,color:"rgba(255,255,255,0.7)"}}>
                    <div style={{fontSize:7,color:activeTheme.color,fontWeight:700,letterSpacing:"0.1em",marginBottom:3}}>\u4e8b\u696d\u6982\u8981</div>
                    {s.d}
                  </div>

                  {/* \u682a\u4fa1\u30fb\u51fa\u6765\u9ad8\u30fbRSI */}
                  <div style={{display:"flex",gap:14,flexWrap:"wrap",marginBottom:9}}>
                    <div>
                      <div style={{fontSize:7,color:"rgba(255,255,255,0.28)",marginBottom:2}}>\u682a\u4fa1</div>
                      <div style={{fontFamily:"monospace",fontSize:14,fontWeight:700}}>{fmt$(s.p)}</div>
                    </div>
                    <div>
                      <div style={{fontSize:7,color:"rgba(255,255,255,0.28)",marginBottom:2}}>\u51fa\u6765\u9ad8(\u65e5)</div>
                      <div style={{fontFamily:"monospace",fontSize:12,color:"rgba(255,255,255,0.55)"}}>{fmtVol(s.v)}</div>
                    </div>
                    <div>
                      <div style={{fontSize:7,color:"rgba(255,255,255,0.28)",marginBottom:2}}>
                        RSI(\u65e5\u8db3)&nbsp;
                        <span style={{color:rsiColor(s.rsi),fontWeight:700}}>{s.rsi} · {rsiLabel(s.rsi)}</span>
                      </div>
                      <div style={{height:5,width:130,background:"rgba(255,255,255,0.07)",borderRadius:2,overflow:"hidden"}}>
                        <div style={{height:"100%",width:`${s.rsi}%`,background:rsiColor(s.rsi),borderRadius:2}}/>
                      </div>
                      <div style={{display:"flex",justifyContent:"space-between",width:130,marginTop:2}}>
                        {["0","30","70","100"].map(n=>(
                          <span key={n} style={{fontSize:6,fontFamily:"monospace",
                            color:n==="30"?"#4488FF":n==="70"?"#FF4444":"rgba(255,255,255,0.18)"}}>{n}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* \u5168\u671f\u9593\u30ea\u30bf\u30fc\u30f3 */}
                  <div style={{fontSize:7,color:"rgba(255,255,255,0.28)",marginBottom:5}}>\u5168\u671f\u9593\u30ea\u30bf\u30fc\u30f3</div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:4}}>
                    {PERF_PERIODS.map(p=>{
                      const pv=s.perf[p.key];const ia=p.key===perfPeriod;
                      return(
                        <div key={p.key} style={{textAlign:"center",padding:"5px 3px",borderRadius:6,
                          border:`1px solid ${ia?activeTheme.color:"rgba(255,255,255,0.07)"}`,
                          background:ia?`${activeTheme.color}16`:"rgba(255,255,255,0.02)"}}>
                          <div style={{fontSize:7,color:"rgba(255,255,255,0.28)",fontFamily:"monospace"}}>{p.label}</div>
                          <div style={{fontSize:10,fontWeight:700,fontFamily:"monospace",color:pv>=0?"#00EE77":"#FF4444"}}>
                            {pv>=0?"+":""}{pv.toFixed(1)}%
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return(
    <div style={{minHeight:"100vh",background:"#080C14",color:"#DDE4F0",
      fontFamily:"'Sora',sans-serif",overflowX:"hidden",width:"100%"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        html,body{overflow-x:hidden;width:100%;}
        button{font-family:inherit;cursor:pointer;}
        ::-webkit-scrollbar{height:3px;width:3px;}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.15);border-radius:3px;}
      `}</style>
      <div style={{position:"fixed",inset:0,pointerEvents:"none",
        backgroundImage:"linear-gradient(rgba(0,150,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(0,150,255,0.02) 1px,transparent 1px)",
        backgroundSize:"40px 40px"}}/>

      <div style={{position:"relative",width:"100%",maxWidth:640,margin:"0 auto",padding:"14px 10px 60px"}}>

        {/* \u30d8\u30c3\u30c0\u30fc */}
        <div style={{marginBottom:12}}>
          <p style={{fontSize:9,color:"#00D4FF",letterSpacing:"0.12em",marginBottom:3,fontFamily:"monospace"}}>
            US EQUITY · THEME TRACKER
          </p>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8}}>
            <div>
              <h1 style={{fontSize:"clamp(18px,5.5vw,30px)",fontWeight:800,letterSpacing:"-0.03em",
                background:"linear-gradient(130deg,#fff 0%,#88CCFF 50%,#fff 100%)",
                WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:3}}>
                \u7c73\u56fd\u682a\u30c6\u30fc\u30de\u30c8\u30e9\u30c3\u30ab\u30fc
              </h1>
              <p style={{fontSize:10,color:"rgba(255,255,255,0.28)"}}>
                31\u30c6\u30fc\u30de · {Object.keys(SM).length}\u9298\u67c4 · \u4e2d\u5c0f\u578b\u30b0\u30ed\u30fc\u30b9\u542b\u3080 · NASDAQ ETF\u5bfe\u5fdc
              </p>
            </div>
            {/* \u60c5\u5831\u66f4\u65b0\u30dc\u30bf\u30f3 */}
            <button onClick={()=>{setShowUpdate(true);setEditMsg("");}}
              style={{flexShrink:0,marginTop:4,display:"flex",alignItems:"center",gap:5,
                padding:"7px 11px",borderRadius:8,border:"1px solid rgba(0,212,255,0.35)",
                background:"rgba(0,212,255,0.08)",color:"#00D4FF",fontSize:10,fontWeight:700,
                cursor:"pointer",whiteSpace:"nowrap",transition:"all 0.15s"}}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(0,212,255,0.18)";}}
              onMouseLeave={e=>{e.currentTarget.style.background="rgba(0,212,255,0.08)";}}>
              <span style={{fontSize:13}}>✏️</span> \u60c5\u5831\u66f4\u65b0
              {Object.keys(smOverride).length>0&&(
                <span style={{background:"#00D4FF",color:"#080C14",borderRadius:10,
                  padding:"1px 5px",fontSize:8,fontWeight:800,marginLeft:2}}>
                  {Object.keys(smOverride).length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* \u9298\u67c4\u691c\u7d22\u7a93 */}
        <div style={{position:"relative",marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",gap:8,
            background:"rgba(255,255,255,0.05)",borderRadius:10,
            border:`1.5px solid ${searchFocus?"rgba(0,212,255,0.5)":"rgba(255,255,255,0.1)"}`,
            padding:"8px 12px",transition:"border-color 0.2s"}}>
            <span style={{fontSize:14,flexShrink:0}}>🔍</span>
            <input
              type="text"
              placeholder="\u9298\u67c4\u691c\u7d22 (\u4f8b: NVDA, \u30c6\u30b9\u30e9, AI)"
              value={searchQ}
              onChange={e=>setSearchQ(e.target.value)}
              onFocus={()=>setSearchFocus(true)}
              onBlur={()=>setTimeout(()=>setSearchFocus(false),200)}
              style={{flex:1,background:"none",border:"none",outline:"none",
                color:"#DDE4F0",fontSize:12,fontFamily:"'Sora',sans-serif"}}
            />
            {searchQ&&(
              <button onClick={()=>setSearchQ("")}
                style={{background:"none",border:"none",color:"rgba(255,255,255,0.4)",
                  fontSize:16,cursor:"pointer",padding:"0 2px",lineHeight:1}}>✕</button>
            )}
          </div>
          {/* \u691c\u7d22\u7d50\u679c\u30c9\u30ed\u30c3\u30d7\u30c0\u30a6\u30f3 */}
          {searchQ.trim()&&searchResults.length>0&&(
            <div style={{position:"absolute",top:"100%",left:0,right:0,zIndex:100,
              background:"rgba(8,12,22,0.98)",border:"1.5px solid rgba(0,212,255,0.25)",
              borderTop:"none",borderRadius:"0 0 10px 10px",overflow:"hidden",
              boxShadow:"0 12px 40px rgba(0,0,0,0.8)"}}>
              {searchResults.map(([tk,s])=>{
                const sv=s.perf[perfPeriod]; const pos=sv>=0;
                const isOvr=!!smOverride[tk];
                return(
                  <div key={tk}
                    onClick={()=>{
                      // \u30c6\u30fc\u30de\u3092\u63a2\u3057\u3066\u305d\u3053\u3078\u30b8\u30e3\u30f3\u30d7
                      const thm=THEMES.find(t=>t.stocks.includes(tk));
                      if(thm){setActiveId(thm.id);setOpenTicker(tk);}
                      setSearchQ("");
                    }}
                    style={{display:"flex",alignItems:"center",gap:10,padding:"9px 14px",
                      borderBottom:"1px solid rgba(255,255,255,0.05)",cursor:"pointer",
                      transition:"background 0.1s"}}
                    onMouseEnter={e=>e.currentTarget.style.background="rgba(0,212,255,0.08)"}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <span style={{fontWeight:800,fontSize:11,fontFamily:"monospace",
                      color:"#00D4FF",width:44,flexShrink:0}}>{tk}</span>
                    <span style={{flex:1,fontSize:11,color:"rgba(255,255,255,0.7)",
                      overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.n}</span>
                    <span style={{fontSize:12,fontWeight:700,fontFamily:"monospace",
                      color:pos?"#00EE77":"#FF4444",flexShrink:0}}>
                      {fmt$(s.p)}
                    </span>
                    <span style={{fontSize:9,fontWeight:700,fontFamily:"monospace",
                      color:pos?"#00EE77":"#FF4444",flexShrink:0,minWidth:44,textAlign:"right"}}>
                      {pos?"▲":"▼"}{Math.abs(sv).toFixed(1)}%
                    </span>
                    {isOvr&&<span style={{fontSize:8,color:"#FFB800",flexShrink:0}}>✏️</span>}
                  </div>
                );
              })}
            </div>
          )}
          {searchQ.trim()&&searchResults.length===0&&(
            <div style={{position:"absolute",top:"100%",left:0,right:0,zIndex:100,
              background:"rgba(8,12,22,0.98)",border:"1.5px solid rgba(255,255,255,0.1)",
              borderTop:"none",borderRadius:"0 0 10px 10px",padding:"12px 14px",
              color:"rgba(255,255,255,0.35)",fontSize:11}}>
              \u8a72\u5f53\u3059\u308b\u9298\u67c4\u304c\u898b\u3064\u304b\u308a\u307e\u305b\u3093
            </div>
          )}
        </div>

        {/* \u60c5\u5831\u66f4\u65b0\u30e2\u30fc\u30c0\u30eb\uff08\u4e00\u62ecAI\u66f4\u65b0\uff09 */}
        {showUpdate&&(
          <div style={{position:"fixed",inset:0,zIndex:200,display:"flex",alignItems:"flex-start",
            justifyContent:"center",padding:"40px 12px 20px",
            background:"rgba(4,8,18,0.92)",backdropFilter:"blur(8px)"}}
            onClick={e=>{if(e.target===e.currentTarget&&bulkStatus!=="running")setShowUpdate(false);}}>
            <div style={{background:"#0D1424",border:"1.5px solid rgba(0,212,255,0.3)",
              borderRadius:16,width:"100%",maxWidth:500,overflow:"hidden",
              boxShadow:"0 24px 80px rgba(0,0,0,0.9)",maxHeight:"85vh",display:"flex",flexDirection:"column"}}>

              {/* \u30e2\u30fc\u30c0\u30eb\u30d8\u30c3\u30c0\u30fc */}
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
                padding:"16px 18px",borderBottom:"1px solid rgba(255,255,255,0.07)",
                background:"linear-gradient(135deg,rgba(0,212,255,0.06),rgba(100,50,255,0.04))"}}>
                <div>
                  <div style={{fontWeight:800,fontSize:15,color:"#00D4FF"}}>🤖 AI\u4e00\u62ec\u30c7\u30fc\u30bf\u66f4\u65b0</div>
                  <div style={{fontSize:10,color:"rgba(255,255,255,0.35)",marginTop:3}}>
                    {Object.keys(SM).length}\u9298\u67c4\u306e\u682a\u4fa1\u30fb\u9a30\u843d\u7387\u30fbRSI\u3092AI\u304c\u81ea\u52d5\u53d6\u5f97\u3057\u307e\u3059
                  </div>
                </div>
                <button onClick={()=>{if(bulkStatus!=="running")setShowUpdate(false);}}
                  style={{background:"rgba(255,255,255,0.07)",border:"none",color:"rgba(255,255,255,0.5)",
                    width:30,height:30,borderRadius:7,fontSize:15,cursor:"pointer",display:"flex",
                    alignItems:"center",justifyContent:"center"}}>✕</button>
              </div>

              <div style={{padding:"18px",overflowY:"auto",flex:1}}>

                {/* \u30b9\u30c6\u30fc\u30bf\u30b9\u8868\u793a */}
                {bulkStatus==="idle"&&(
                  <div style={{textAlign:"center",padding:"20px 0 10px"}}>
                    <div style={{fontSize:48,marginBottom:12}}>📡</div>
                    <div style={{fontSize:13,color:"rgba(255,255,255,0.6)",marginBottom:6}}>
                      \u30dc\u30bf\u30f3\u3092\u62bc\u3059\u3068\u5168\u9298\u67c4\u306e\u6700\u65b0\u30c7\u30fc\u30bf\u3092AI\u304c\u81ea\u52d5\u53ce\u96c6\u3057\u307e\u3059
                    </div>
                    <div style={{fontSize:11,color:"rgba(255,255,255,0.3)",marginBottom:20}}>
                      \u682a\u4fa1\u30fb\u5404\u671f\u9593\u30ea\u30bf\u30fc\u30f3\u30fbRSI\u3092\u4e00\u62ec\u66f4\u65b0 · \u7d042\u301c3\u5206\u304b\u304b\u308a\u307e\u3059
                    </div>
                    {lastUpdated&&(
                      <div style={{fontSize:10,color:"#FFB800",marginBottom:16}}>
                        \u524d\u56de\u66f4\u65b0: {lastUpdated} · {bulkUpdated}\u4ef6
                      </div>
                    )}
                    <button onClick={runBulkUpdate}
                      style={{padding:"14px 36px",borderRadius:12,border:"none",
                        background:"linear-gradient(135deg,#00D4FF,#0088CC)",
                        color:"#080C14",fontSize:14,fontWeight:800,cursor:"pointer",
                        boxShadow:"0 4px 20px rgba(0,212,255,0.35)"}}>
                      🚀 \u5168\u9298\u67c4\u3092\u4eca\u3059\u3050\u66f4\u65b0
                    </button>
                    {Object.keys(smOverride).length>0&&(
                      <div style={{marginTop:16}}>
                        <button onClick={resetAllOverrides}
                          style={{padding:"8px 20px",borderRadius:8,
                            border:"1px solid rgba(255,100,50,0.3)",
                            background:"rgba(255,100,50,0.08)",color:"rgba(255,130,80,0.9)",
                            fontSize:11,fontWeight:700,cursor:"pointer"}}>
                          🔄 \u66f4\u65b0\u30c7\u30fc\u30bf\u3092\u30ea\u30bb\u30c3\u30c8\uff08\u5143\u306e\u5024\u306b\u623b\u3059\uff09
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {bulkStatus==="running"&&(
                  <div>
                    {/* \u30d7\u30ed\u30b0\u30ec\u30b9\u30d0\u30fc */}
                    <div style={{marginBottom:16}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                        <span style={{fontSize:11,color:"rgba(255,255,255,0.6)"}}>
                          \u53d6\u5f97\u4e2d...
                        </span>
                        <span style={{fontSize:11,fontWeight:700,fontFamily:"monospace",color:"#00D4FF"}}>
                          {bulkProgress.done}/{bulkProgress.total}\u9298\u67c4
                        </span>
                      </div>
                      <div style={{height:8,background:"rgba(255,255,255,0.08)",borderRadius:4,overflow:"hidden"}}>
                        <div style={{
                          height:"100%",borderRadius:4,transition:"width 0.5s ease",
                          background:"linear-gradient(90deg,#00D4FF,#0088FF)",
                          width:`${bulkProgress.total>0?(bulkProgress.done/bulkProgress.total*100):0}%`
                        }}/>
                      </div>
                      {bulkProgress.current&&(
                        <div style={{fontSize:9,color:"rgba(255,255,255,0.25)",marginTop:4,fontFamily:"monospace"}}>
                          \u51e6\u7406\u4e2d: {bulkProgress.current}
                        </div>
                      )}
                    </div>
                    <div style={{fontSize:11,color:"#00EE77",fontWeight:700,marginBottom:10,
                      fontFamily:"monospace"}}>
                      ✅ \u66f4\u65b0\u6e08\u307f: {bulkUpdated}\u4ef6
                    </div>
                    {/* \u30ed\u30b0 */}
                    <div style={{background:"rgba(0,0,0,0.4)",borderRadius:8,padding:"10px 12px",
                      maxHeight:200,overflowY:"auto",border:"1px solid rgba(255,255,255,0.06)"}}>
                      {bulkLog.map((l,i)=>(
                        <div key={i} style={{fontSize:10,fontFamily:"monospace",
                          color:"rgba(255,255,255,0.5)",lineHeight:1.8}}>{l}</div>
                      ))}
                      {bulkLog.length===0&&(
                        <div style={{fontSize:10,color:"rgba(255,255,255,0.25)",fontFamily:"monospace"}}>
                          \u5f85\u6a5f\u4e2d...
                        </div>
                      )}
                    </div>
                    <div style={{marginTop:12,fontSize:10,color:"rgba(255,255,255,0.25)",textAlign:"center"}}>
                      \u51e6\u7406\u4e2d\u306f\u3053\u306e\u753b\u9762\u3092\u9589\u3058\u306a\u3044\u3067\u304f\u3060\u3055\u3044
                    </div>
                  </div>
                )}

                {bulkStatus==="done"&&(
                  <div style={{textAlign:"center",padding:"16px 0"}}>
                    <div style={{fontSize:52,marginBottom:10}}>🎉</div>
                    <div style={{fontSize:16,fontWeight:800,color:"#00EE77",marginBottom:6}}>
                      \u66f4\u65b0\u5b8c\u4e86\uff01
                    </div>
                    <div style={{fontSize:13,color:"rgba(255,255,255,0.6)",marginBottom:4}}>
                      {bulkUpdated}\u9298\u67c4\u306e\u30c7\u30fc\u30bf\u3092\u66f4\u65b0\u3057\u307e\u3057\u305f
                    </div>
                    <div style={{fontSize:10,color:"rgba(255,255,255,0.3)",marginBottom:20}}>
                      {lastUpdated}
                    </div>
                    {/* \u30ed\u30b0\u6298\u308a\u305f\u305f\u307f */}
                    <div style={{background:"rgba(0,0,0,0.3)",borderRadius:8,padding:"8px 12px",
                      maxHeight:150,overflowY:"auto",textAlign:"left",marginBottom:16,
                      border:"1px solid rgba(255,255,255,0.06)"}}>
                      {bulkLog.map((l,i)=>(
                        <div key={i} style={{fontSize:9,fontFamily:"monospace",
                          color:"rgba(255,255,255,0.4)",lineHeight:1.8}}>{l}</div>
                      ))}
                    </div>
                    <div style={{display:"flex",gap:8,justifyContent:"center"}}>
                      <button onClick={()=>setShowUpdate(false)}
                        style={{padding:"10px 28px",borderRadius:10,border:"none",
                          background:"linear-gradient(135deg,#00D4FF,#0088CC)",
                          color:"#080C14",fontSize:13,fontWeight:800,cursor:"pointer"}}>
                        ✅ \u9589\u3058\u308b
                      </button>
                      <button onClick={()=>{setBulkStatus("idle");setBulkLog([]);}}
                        style={{padding:"10px 20px",borderRadius:10,
                          border:"1px solid rgba(255,255,255,0.15)",
                          background:"rgba(255,255,255,0.05)",
                          color:"rgba(255,255,255,0.6)",fontSize:12,fontWeight:700,cursor:"pointer"}}>
                        \u518d\u66f4\u65b0
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* \u671f\u9593\u30bf\u30d6 */}
        <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch",marginBottom:12,
          /* \u30b9\u30af\u30ed\u30fc\u30eb\u30d0\u30fc\u975e\u8868\u793a */ msOverflowStyle:"none",scrollbarWidth:"none"}}>
          <div style={{display:"flex",gap:3,width:"max-content",
            background:"rgba(255,255,255,0.04)",padding:3,borderRadius:8,
            border:"1px solid rgba(255,255,255,0.07)"}}>
            {PERF_PERIODS.map(p=>(
              <button key={p.key} onClick={()=>setPerfPeriod(p.key)} style={{
                padding:"5px 11px",borderRadius:6,border:"none",
                fontSize:11,fontWeight:600,fontFamily:"monospace",whiteSpace:"nowrap",
                background:perfPeriod===p.key?"#00D4FF":"transparent",
                color:perfPeriod===p.key?"#080C14":"rgba(255,255,255,0.45)",
              }}>{p.label}</button>
            ))}
          </div>
        </div>

        {/* \u30c6\u30fc\u30de\u30e9\u30f3\u30ad\u30f3\u30b0\u898b\u51fa\u3057 */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
          gap:8,marginBottom:9}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <div style={{width:3,height:15,background:"#00D4FF",borderRadius:2,flexShrink:0}}/>
            <span style={{fontWeight:700,fontSize:13}}>\u30c6\u30fc\u30de\u30e9\u30f3\u30ad\u30f3\u30b0</span>
          </div>
          <div style={{display:"flex",gap:3,flexShrink:0}}>
            {[["rise","▲\u66b4\u9a30"],["fall","▼\u66b4\u843d"]].map(([k,l])=>(
              <button key={k} onClick={()=>{setThSort(k);setActiveId(null);setOpenTicker(null);}} style={{
                padding:"4px 9px",borderRadius:5,border:"none",fontSize:10,fontWeight:700,
                background:thSort===k?(k==="rise"?"rgba(0,220,90,0.15)":"rgba(255,50,50,0.15)"):"rgba(255,255,255,0.06)",
                color:thSort===k?(k==="rise"?"#00EE77":"#FF4444"):"rgba(255,255,255,0.38)",
              }}>{l}</button>
            ))}
          </div>
        </div>

        {/* \u30c6\u30fc\u30de\u30b0\u30ea\u30c3\u30c9\uff082\u5217\uff09\uff0b\u30a4\u30f3\u30e9\u30a4\u30f3\u9298\u67c4\u30d1\u30cd\u30eb */}
        {rows.map((row,rowIdx)=>(
          <div key={rowIdx}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:6}}>
              {row.map((t,ci)=>{
                const idx=rowIdx*2+ci;
                const isActive=activeId===t.id;
                const val=t.perf[perfPeriod];
                const pos=val>=0;
                return(
                  <div key={t.id}
                    onClick={()=>{setActiveId(p=>p===t.id?null:t.id);setOpenTicker(null);}}
                    style={{background:isActive?`${t.color}14`:"rgba(255,255,255,0.025)",
                      border:`1.5px solid ${isActive?t.color:"rgba(255,255,255,0.07)"}`,
                      borderRadius:9,padding:"9px 10px",cursor:"pointer",
                      transition:"all 0.18s",position:"relative",
                      boxShadow:isActive?`0 0 12px ${t.color}1e`:"none",
                      minWidth:0,overflow:"hidden"}}>
                    <div style={{position:"absolute",top:7,right:8}}>
                      {idx<3?<span style={{fontSize:12}}>{MEDALS[idx]}</span>
                        :<span style={{fontSize:8,color:"rgba(255,255,255,0.18)",fontFamily:"monospace"}}>#{idx+1}</span>}
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:5,paddingRight:16}}>
                      <span style={{fontSize:16,flexShrink:0}}>{t.emoji}</span>
                      <span style={{fontWeight:700,fontSize:10,lineHeight:1.3,overflow:"hidden",textOverflow:"ellipsis"}}>{t.name}</span>
                    </div>
                    <span style={{display:"inline-block",padding:"2px 5px",borderRadius:4,
                      fontSize:10,fontWeight:700,fontFamily:"monospace",
                      background:pos?"rgba(0,220,90,0.12)":"rgba(255,50,50,0.12)",
                      color:pos?"#00EE77":"#FF4444",
                      border:`1px solid ${pos?"rgba(0,220,90,0.26)":"rgba(255,50,50,0.26)"}`}}>
                      {pos?"▲":"▼"} {Math.abs(val).toFixed(1)}%
                    </span>
                    <div style={{display:"flex",flexWrap:"wrap",gap:2,marginTop:4}}>
                      {t.stocks.slice(0,3).map(tk=>(
                        <span key={tk} style={{fontSize:7,padding:"1px 3px",borderRadius:2,
                          background:`${t.color}14`,color:t.color,fontFamily:"monospace",fontWeight:700}}>
                          {tk}
                        </span>
                      ))}
                    </div>
                    {isActive&&<div style={{marginTop:4,fontSize:8,color:t.color,fontWeight:700}}>▶ \u8868\u793a\u4e2d</div>}
                  </div>
                );
              })}
              {row.length<2&&<div/>}
            </div>
            {activeRowIdx===rowIdx&&<StockPanel/>}
          </div>
        ))}

        {/* \u672a\u9078\u629e\u30d2\u30f3\u30c8 */}
        {activeId===null&&(
          <div style={{textAlign:"center",padding:"22px 14px",marginTop:4,
            background:"rgba(255,255,255,0.02)",border:"1px dashed rgba(255,255,255,0.07)",borderRadius:9}}>
            <div style={{fontSize:20,marginBottom:6}}>☝️</div>
            <p style={{color:"rgba(255,255,255,0.28)",fontSize:12}}>\u30c6\u30fc\u30de\u3092\u30bf\u30c3\u30d7\u3059\u308b\u3068\u9298\u67c4\u4e00\u89a7\u304c\u8868\u793a\u3055\u308c\u307e\u3059</p>
          </div>
        )}

        <div style={{marginTop:22,borderTop:"1px solid rgba(255,255,255,0.06)",paddingTop:9,textAlign:"center"}}>
          <p style={{fontSize:9,color:"rgba(255,255,255,0.12)",fontFamily:"monospace"}}>
            ※ \u30c7\u30e2\u30c7\u30fc\u30bf\u3067\u3059\u3002\u6295\u8cc7\u5224\u65ad\u306b\u4f7f\u7528\u3057\u306a\u3044\u3067\u304f\u3060\u3055\u3044\u3002
          </p>
        </div>
      </div>
    </div>
  );
}
