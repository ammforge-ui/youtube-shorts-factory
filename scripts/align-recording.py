"""Locate real text states in recorded pixels; do not trust automation wall-clock offsets."""
import sys,json,subprocess,math
sys.path.insert(0,'/workspace/tts-python')
import numpy as np
from PIL import Image,ImageFilter
video,input_image,result_image,metadata=sys.argv[1:];m=json.load(open(metadata));found={}
for key,image,field in [('inputVisible',input_image,'input'),('resultVisible',result_image,'output')]:
 r=m['targets'][field];x=math.ceil(r['x']+3);y=math.ceil(r['y']+2);w=max(20,math.floor(r['width']-6));h=max(20,round(45*m.get('coordinateScale',1)))
 kernel=max(3,round(5*m.get('coordinateScale',1))//2*2+1)
 reference=np.asarray(Image.open(image).convert('L').crop((x,y,x+w,y+h)).filter(ImageFilter.MinFilter(kernel)))<135
 assert reference.sum()>10,f'No reference text in {field}'
 proc=subprocess.Popen(['ffmpeg','-v','error','-i',video,'-vf',f'fps=10,crop={w}:{h}:{x}:{y},format=gray','-f','rawvideo','-'],stdout=subprocess.PIPE)
 i=0;best=0;best_at=0;match=None;threshold=.82
 while True:
  raw=proc.stdout.read(w*h)
  if len(raw)<w*h:break
  mask=np.asarray(Image.frombytes('L',(w,h),raw).filter(ImageFilter.MinFilter(kernel)))<135;union=np.logical_or(reference,mask).sum();iou=float(np.logical_and(reference,mask).sum()/max(1,union));best_at=i/10 if iou>best else best_at;best=max(best,iou)
  if match is None and iou>=threshold:match=round(i/10,3)
  i+=1
 code=proc.wait();assert code==0
 if match is None and m.get('coordinateScale',1)>=.75:raise RuntimeError(f'Failed full-resolution pixel alignment {field}; best IoU {best}')
 found[key]=match;found[key+'BestIoU']=best;found[key+'Threshold']=threshold;found[key+'BestCandidateSeconds']=best_at;found[key+'Status']='aligned' if match is not None else 'needs-review: low-resolution raster match is ambiguous'
found['method']='10 FPS recorded-text mask IoU against actual asserted screenshots; dilated-mask matching; lower-confidence mobile raster matches explicitly reported'
print(json.dumps(found))
