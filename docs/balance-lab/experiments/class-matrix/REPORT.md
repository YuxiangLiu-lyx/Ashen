# Ashen Balance Lab
Code commit: 5e793cb68fc5551e52543d52f4f50298840155fc
Content SHA256: 0f1a48785c5d27a4139a4c490f0ce82aee6b404deee304a1781c85a3e2ffd2c6
Kind: combat
JSON SHA256: 4513beba0373a12c874ef73c49c82f83bb9eee73eb18be9a7bd72d162dfcd288

shadow/guard/combo: 20 runs, win 1, TTK median 0.275, p90 0.525, mean received 0.00
shadow/deepElite/combo: 20 runs, win 1, TTK median 12.575, p90 13, mean received 253.70
shadow/captain/combo: 20 runs, win 1, TTK median 14.125, p90 14.875, mean received 215.10
oath/guard/combo: 20 runs, win 1, TTK median 0.025, p90 0.275, mean received 0.00
oath/deepElite/combo: 20 runs, win 1, TTK median 16.175, p90 16.425, mean received 239.63
oath/captain/combo: 20 runs, win 1, TTK median 18.575, p90 19.175, mean received 185.13
ember/guard/combo: 20 runs, win 1, TTK median 0.5, p90 0.5, mean received 0.00
ember/deepElite/combo: 20 runs, win 0.1, TTK median 14.85, p90 14.85, mean received 396.20
ember/captain/combo: 20 runs, win 1, TTK median 16.4, p90 17.9, mean received 278.00

Limits:
- Isolated encounters in a real map; authored crowds, campaign reachability and scene chains are not simulated
- Strategies are scripted input policies, not measured human skill or full-chapter completion rates
- Fixed dt <= 0.035 includes runtime hitstop; TTK is simulation clock, not device wall time
- Starting levels, ranks, gear and career activity unlocks are synthetic explicit fixtures, not proven obtainable paths
- Random generic equipment IDs include Date.now in runtime; lab canonicalizes IDs at obtainGear only, with identical stats/RNG draws
- Damage is effective HP loss, excluding overkill; nested proc damage is counted once; projectile skill attribution is unresolved
