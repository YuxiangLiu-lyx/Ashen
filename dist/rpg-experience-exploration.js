// Authored room encounters. Stable IDs preserve deaths and quest evidence on migration.
export const EXPERIENCE_DUNGEONS={
 c1DrillGallery:[['rat',370,640,'c1-sentry-1'],['rat',550,500,'c1-sentry-2'],['rat',420,420,'c1-sentry-3'],['rat',730,610,'c1-sentry-4'],['rat',1080,520,'c1-sentry-5'],['rat',1340,470,'c1-sentry-6'],['rat',1290,745,'c1-sentry-7'],['rat',970,870,'c1-sentry-8'],['wolf',1260,520,'c1-trial-warden']],
 c1TrialCrypt:[['rat',650,430,'c1-crypt-1'],['rat',470,540,'c1-crypt-2'],['rat',540,660,'c1-crypt-3'],['rat',760,620,'c1-crypt-4'],['rat',1100,500,'c1-crypt-5'],['rat',1350,450,'c1-crypt-6'],['rat',1180,800,'c1-crypt-7'],['rat',800,870,'c1-crypt-8']],
 c1TrialVault:[['rat',500,500,'c1-vault-sentry-1'],['rat',670,670,'c1-vault-sentry-2'],['rat',700,350,'c1-vault-sentry-3'],['rat',950,620,'c1-vault-sentry-4'],['rat',1100,510,'c1-vault-sentry-5'],['rat',1360,340,'c1-vault-sentry-6'],['rat',1280,810,'c1-vault-sentry-7'],['rat',970,870,'c1-vault-sentry-8'],['wolf',1280,510,'c1-vault-warden']],
};
export const EXPERIENCE_CACHES={
 'c1-drill-supplies':{map:'c1DrillGallery',label:'器械间急救箱',x:590,y:335,items:{hp:1,mp:1}},
 'c1-vault-materials':{map:'c1TrialVault',label:'账架旁的工艺材料箱',x:540,y:395,items:{c1CoreShell:1,c1RuneVitality:1}},
};
