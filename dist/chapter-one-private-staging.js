// Same hall, same actors. The player has already crossed a real exit.
// This stage never relocates the live hero or changes the destination map.
export const C1_PRIVATE_STAGING={
 map:'hall',
 actors:{sister:[1180,635],clerk:[1010,385]},
 actorMeta:{sister:{faceTo:'clerk'},clerk:{faceTo:'sister'}},
 faceTargets:{sister:'clerk',clerk:'sister'},
 focus:[1125,605],
 commitActor:null,
 beats:[{line:0,moves:[['clerk',1080,665,1.6]]}],
 conversationPairs:[[0,'sister','clerk',115]],
};
