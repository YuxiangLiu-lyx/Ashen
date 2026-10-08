# Ashen Balance Lab
Code commit: a36a66153401139474edf285015aa0da89771d2c
Content SHA256: 0690b8dbd22793ac05fa48677e680841b0d6584569396c03cc9c74b01b5b619d
Kind: combat
JSON SHA256: ea32d9eefd900a3d469133552f1d46833e9a1a7cc1710e07056cff7c73aa8b02

shadow/captain/combo: 20 runs, win 1, TTK median 10.625, p90 11.3, mean received 172.20

Limits:
- Isolated encounters in a real map; authored crowds, campaign reachability and scene chains are not simulated
- Strategies are scripted input policies, not measured human skill or full-chapter completion rates
- Fixed dt <= 0.035 includes runtime hitstop; TTK is simulation clock, not device wall time
- Starting levels, ranks, gear and career activity unlocks are synthetic explicit fixtures, not proven obtainable paths
- Random generic equipment IDs include Date.now in runtime; lab canonicalizes IDs at obtainGear only, with identical stats/RNG draws
- Damage is effective HP loss, excluding overkill; nested proc damage is counted once; projectile skill attribution is unresolved
