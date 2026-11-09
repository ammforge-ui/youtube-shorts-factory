"""Extract encoded frames and audio waveform; no claim of automatic aesthetic judgment."""
import sys,json,subprocess,wave,math
sys.path.insert(0,'/workspace/tts-python')
from PIL import Image,ImageDraw
out=sys.argv[1];spec=json.load(open(out+'/storyboard-v2.json'));duration=spec['duration'];starts=[];t=0
for s in spec['scenes']:starts.append(t);t+=s['duration']
times=sorted(set([0,1,3]+[round(x+.5,3) for x in starts[1:]]+[round(duration-1,3),round(duration-1/30,3)]))
sheet=Image.new('RGB',(360*4,680*math.ceil(len(times)/4)),'#111b28');d=ImageDraw.Draw(sheet)
for i,t in enumerate(times):
 file=f'{out}/review-{i:02}.png';subprocess.run(['ffmpeg','-v','error','-y','-ss',str(t),'-i',out+'/final-v2.mp4','-frames:v','1',file],check=True);im=Image.open(file);im.thumbnail((360,640));x=i%4*360;y=i//4*680;sheet.paste(im,(x,y));d.text((x+15,y+650),f'{t:.3f} seconds',fill='white')
sheet.save(out+'/contact-sheet.png');json.dump({'times':times,'files':[f'review-{i:02}.png' for i in range(len(times))]},open(out+'/review-frames.json','w'),indent=2)
subprocess.run(['ffmpeg','-v','error','-y','-i',out+'/final-v2.mp4','-filter_complex','showwavespic=s=1600x350:colors=0xbaff5a','-frames:v','1',out+'/waveform.png'],check=True)
