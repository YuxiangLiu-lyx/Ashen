// All combat floaters share formatting; simulation retains fractional HP.
export function displayNumber(value){if(!Number.isFinite(Number(value)))return '0';const n=Math.round(Number(value)*10)/10;return Object.is(n,-0)?'0':String(n);}
export function combatText(value){if(typeof value==='number')return displayNumber(value);return String(value).replace(/-?\d+\.\d{2,}/g,n=>displayNumber(Number(n)));}
