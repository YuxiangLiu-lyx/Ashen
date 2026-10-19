// One visual identity per service, shared by every map; original sheets remain archived.
export const SERVICE_CHARACTER_LOADS=[
 ['servicePortraits','assets/loot-services/service-portraits-v2.png',2,1,false],
 ['trialPortraits','assets/loot-services/trial-portraits-v2.png',3,1,false],
 ['c1Merchant','assets/loot-services/merchant-v2.png',4,2,false],
 ['bountyHunter','assets/loot-services/bounty-hunter-v2.png',4,2,false],
 ['trialIden','assets/loot-services/iden-v2.png',4,2,false],
 ['trialHesha','assets/loot-services/hesha-v2.png',4,2,false],
 ['trialVenn','assets/loot-services/venn-v2.png',4,2,false],
];
export const SERVICE_CHARACTER_SHEETS={c1rosa:'c1Merchant',ch5Merchant:'c1Merchant',deepMerchant:'c1Merchant',merchant:'c1Merchant',c1hunter:'bountyHunter',bountyHunter:'bountyHunter',c1iden:'trialIden',c1hesha:'trialHesha',c1venn:'trialVenn'};
const portraits={'商人':['servicePortraits',0],'罗萨':['servicePortraits',0],'行商':['servicePortraits',0],'薇塔':['servicePortraits',0],'赏金猎人':['servicePortraits',1],'伊登':['trialPortraits',0],'赫莎':['trialPortraits',1],'维恩':['trialPortraits',2]};
export function drawServiceCharacter(c,a,bank){
 const sheet=SERVICE_CHARACTER_SHEETS[a.id]||SERVICE_CHARACTER_SHEETS[a.serviceRole];if(!sheet)return false;
 const cosine=Math.cos(a.angle||0),side=!a.moving&&Math.abs(cosine)>.8,back=Math.sin(a.angle||0)<-.25;
 const index=side?3:(back?4:0)+(a.moving?1+Math.floor((a.walkDistance||0)/23)%2:0),f=bank.frame(sheet,index),ref=bank.frame(sheet,0);if(!f||!ref)return false;
 const k=(a.size||82)/ref.h;c.save();c.translate(a.x,a.y);if(cosine<0)c.scale(-1,1);c.imageSmoothingEnabled=true;
 c.drawImage(bank.images[sheet],f.x,f.y,f.w,f.h,-f.w*k/2,-f.h*k,f.w*k,f.h*k);c.restore();return true;
}
export function servicePortrait(bank,name){const source=portraits[name];return source&&bank.frame(...source)?bank.cropped(...source):null;}
