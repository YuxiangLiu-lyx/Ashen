# Ashen Balance Lab
Code commit: 5e793cb68fc5551e52543d52f4f50298840155fc
Content SHA256: 0f1a48785c5d27a4139a4c490f0ce82aee6b404deee304a1781c85a3e2ffd2c6
Kind: combat
JSON SHA256: e8ac367a8497ec99efbc86f848960bd504392d43b742638c87fcb9df4deef942

shadow/captain/combo: 20 runs, win 1, TTK median 10.625, p90 11.3, mean received 172.20

Limits:
- Isolated encounters in a real map; authored crowds, campaign reachability and scene chains are not simulated
- Strategies are scripted input policies, not measured human skill or full-chapter completion rates
- Fixed dt <= 0.035 includes runtime hitstop; TTK is simulation clock, not device wall time
- Starting levels, ranks, gear and career activity unlocks are synthetic explicit fixtures, not proven obtainable paths
- Random generic equipment IDs include Date.now in runtime; lab canonicalizes IDs at obtainGear only, with identical stats/RNG draws
- Damage is effective HP loss, excluding overkill; nested proc damage is counted once; projectile skill attribution is unresolved
