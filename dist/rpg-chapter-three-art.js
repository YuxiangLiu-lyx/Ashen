import {C3_CAVES,c3Boundary,c3Land} from './rpg-chapter-three-world.js';
// Cached ground layer: existing painted rock art, clipped to the exact solid mass.
export function drawChapterThreeCaveMass(c,bank,id){
 if(!C3_CAVES[id])return;
 c.save();c.beginPath();for(const b of c3Boundary(id))c.rect(...b);c.clip();c.fillStyle='#10171bd9';c.fillRect(0,0,1600,1080);
 c.fillStyle=id==='hellGrotto'?'#182b2d55':'#1d262b66';c.fillRect(0,0,1600,1080);c.restore();
 // Stone faces meet the walkable edge. The deep rock stays quiet instead of
 // repeating a bright boulder texture across the whole screen.
 for(let y=180;y<980;y+=20)for(let x=140;x<1460;x+=100){
  if(c3Land(id,x+50,y+10)&&!c3Land(id,x+50,y-10))bank.draw(c,'chapterHell',0,x+50,y+12,155,105);
  if(c3Land(id,x+50,y+10)&&!c3Land(id,x+50,y+30))bank.draw(c,'chapterHell',0,x+50,y+125,165,125);
 }
 for(let x=140;x<1480;x+=20)for(let y=220;y<960;y+=105){
  if(c3Land(id,x+10,y)&&!c3Land(id,x-10,y))bank.draw(c,'chapterHell',0,x-60,y+15,160,125);
  if(c3Land(id,x+10,y)&&!c3Land(id,x+30,y))bank.draw(c,'chapterHell',0,x+90,y+15,160,125);
 }

}
