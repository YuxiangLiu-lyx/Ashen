#!/usr/bin/env python3
"""Derive transparent V28.1 atlases without changing frame coordinates or originals.
Requires Pillow. Reproducible pixel operations only; no AI-generated replacement identities.
"""
from pathlib import Path
import hashlib,json
from PIL import Image, ImageChops, ImageFilter
ROOT=Path(__file__).resolve().parents[1]
SOURCES={
 'women-world.png':'assets/v27/women-world.png',
 'chengli-world.png':'assets/v27/chengli-world-lively.png',
 'chengli-actions.png':'assets/v27/chengli-actions.png',
 'elyria-life.png':'assets/v27/elyria-life.png',
 'deep-bosses.png':'assets/v11/deep-bosses-atlas-v11.png',
}
def checksum(path):return hashlib.sha256(path.read_bytes()).hexdigest()
def clean(source,destination):
 im=Image.open(source).convert('RGBA');r,g,b,a=im.split()
 purple=ImageChops.multiply(r.point(lambda x:255 if x>170 else 0),b.point(lambda x:255 if x>165 else 0))
 threshold=ImageChops.darker(r,b).point(lambda x:int(x*.55))
 green_low=ImageChops.subtract(threshold,g).point(lambda x:255 if x>0 else 0)
 mask=ImageChops.multiply(purple,green_low)
 a=ImageChops.subtract(a,mask)
 im.putalpha(a)
 # Despill only the transparent edge, not violet clothing or dark hair interiors.
 edge=a.point(lambda v:255 if v<96 else 0).filter(ImageFilter.MaxFilter(3))
 pixels=im.load();edge_pixels=edge.load();changed=0
 for y in range(im.height):
  for x in range(im.width):
   rr,gg,bb,aa=pixels[x,y]
   if aa and edge_pixels[x,y] and rr>gg*1.22 and bb>gg*1.22 and rr+bb>140:
    pixels[x,y]=(min(rr,int(gg*1.18)+12),gg,min(bb,int(gg*1.22)+14),aa);changed+=1
 destination.parent.mkdir(parents=True,exist_ok=True)
 im.save(destination,compress_level=6)
 return {'width':im.width,'height':im.height,'edge_pixels_despilled':changed}
def main():
 records=[]
 for name,relative in SOURCES.items():
  source=ROOT/'dist'/relative;dest=ROOT/'dist/assets/v281'/name
  if not source.is_file():raise FileNotFoundError(f'Restore runtime assets first: {source}')
  info=clean(source,dest)
  records.append({'source':relative,'output':str(dest.relative_to(ROOT/'dist')),'source_sha256':checksum(source),'output_sha256':checksum(dest),**info})
 manifest=ROOT/'docs/v28.1/ASSET_MANIFEST.json';manifest.parent.mkdir(parents=True,exist_ok=True)
 manifest.write_text(json.dumps({'version':'28.1','method':'magenta matte removal + edge-only chroma despill; original dimensions/anchors retained','assets':records},ensure_ascii=False,indent=2)+'\n')
 print(f'Built {len(records)} derived atlases; all originals retained.')
if __name__=='__main__':main()
