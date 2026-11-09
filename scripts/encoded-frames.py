import json,subprocess
from PIL import Image,ImageDraw
s=json.load(open('output/test-run/storyboard.json'));t=0;sheet=Image.new('RGB',(1440,1360),'#222');d=ImageDraw.Draw(sheet)
for i,x in enumerate(s['scenes']):
 at=t+min(1.3,x['duration']/2);p=f'output/test-run/encoded-frame-{i}.png';subprocess.run(['ffmpeg','-v','error','-y','-ss',str(at),'-i','output/test-run/final.mp4','-frames:v','1',p],check=True);im=Image.open(p);im.thumbnail((360,640));a=i%4*360;b=i//4*680;sheet.paste(im,(a,b));d.text((a+10,b+645),f'{at:.2f}s / scene {i}',fill='white');t+=x['duration']
sheet.save('output/test-run/contact-sheet.jpg')
