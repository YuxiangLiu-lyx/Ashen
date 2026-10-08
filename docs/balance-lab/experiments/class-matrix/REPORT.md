# Ashen Balance Lab
Code commit: a36a66153401139474edf285015aa0da89771d2c
Content SHA256: 0690b8dbd22793ac05fa48677e680841b0d6584569396c03cc9c74b01b5b619d
Kind: combat
JSON SHA256: 02dddca055a0ccc49b5f87deba9586c21e34753f7b298e5dc3b01b402ac9e4df

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
