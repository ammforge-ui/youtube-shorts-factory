import sys,subprocess,json,hashlib,math,os
sys.path.insert(0,'/workspace/tts-python')
import numpy as np,soundfile as sf
from PIL import Image,ImageDraw
out=sys.argv[1];file=out+'/final.mp4';spec=json.load(open(out+'/storyboard.json'))
def cmd(args):return subprocess.run(args,capture_output=True,text=True,check=True)
p=json.loads(cmd(['ffprobe','-v','error','-show_format','-show_streams','-of','json',file]).stdout);v=next(x for x in p['streams'] if x['codec_type']=='video');a=next(x for x in p['streams'] if x['codec_type']=='audio');duration=float(p['format']['duration'])
cmd(['ffmpeg','-v','error','-i',file,'-f','null','-'])
cmd(['ffmpeg','-v','error','-y','-i',file,'-vn','-ar','48000','-ac','2',out+'/decoded-audio.wav'])
ref,sr=sf.read(out+'/mix.wav',always_2d=True);encoded,_=sf.read(out+'/decoded-audio.wav',always_2d=True);n=min(len(ref),len(encoded));corr=float(np.corrcoef(ref[:n].ravel(),encoded[:n].ravel())[0,1]);peak=20*math.log10(float(np.max(np.abs(encoded)))+1e-12)
levels=cmd(['ffmpeg','-hide_banner','-i',file,'-af','loudnorm=I=-16:TP=-1:LRA=11:print_format=json,silencedetect=n=-45dB:d=0.3','-f','null','-']).stderr
black=cmd(['ffmpeg','-hide_banner','-i',file,'-vf','blackdetect=d=0.12:pix_th=0.04:pic_th=0.99','-an','-f','null','-']).stderr
ar=json.load(open(out+'/audio-report.json'));ar['encoded']={'peakDbFS':peak,'correlationToIntendedMix':corr,'silenceAndLoudnessLog':levels[levels.rfind('{'):],'silenceEvents':[x for x in levels.splitlines() if 'silence_' in x]};ar['perceptualReview']='Pending human listening; objective checks do not establish narration naturalness or musical taste.';json.dump(ar,open(out+'/audio-report.json','w'),indent=2)
layout=json.load(open(out+'/layout-report.json'));capture=json.load(open(out+'/capture.json'))
checks={'resolution':v['width']==1080 and v['height']==1920,'fps':v['avg_frame_rate']=='30/1','h264':v['codec_name']=='h264','aac':a['codec_name']=='aac','duration':25<=duration<=35,'fullDecode':True,'noBlackGaps':'black_start:' not in black,'noClipping':peak<-.5,'intendedMix':corr>.98,'musicPresent':ar['duckedMusic']['meanDb']>-40,'musicBalance':7<ar['narration']['meanDb']-ar['duckedMusic']['meanDb']<22,'effectsPresent':ar['effects']['peakDb']>-35,'layout':layout['passed'],'wordTiming':all(w['end']>w['start'] and w['end']<=duration for w in spec['words']),'sceneCoverage':abs(sum(s['duration'] for s in spec['scenes'])-spec['duration'])<.035,'realCaptureAssertion':capture.get('verified',False) or (bool(capture.get('captures')) and all(c['actual']==capture['expected'] for c in capture['captures']))}
# Analyze ending energy in 20ms windows. Allow only the intentional short final fade.
w=encoded[-int(sr*.7):];chunks=[np.sqrt(np.mean(w[i:i+960]**2)) for i in range(0,len(w),960)];trailing=0
for x in reversed(chunks):
 if x<10**(-45/20):trailing+=.02
 else:break
checks['noEndingSilence']=trailing<=.3
starts=[];t=0
for s in spec['scenes']:starts.append(t);t+=s['duration']
times=sorted(set([0,1,3]+[round(x+.6,3) for x in starts[1:]]+[round(duration-1,3),round(spec['duration']-.1,3)]))
sheet=Image.new('RGB',(360*4,680*math.ceil(len(times)/4)),'#111b28');draw=ImageDraw.Draw(sheet)
for i,t in enumerate(times):
 f=out+f'/review-{i:02}.png';cmd(['ffmpeg','-v','error','-y','-ss',str(t),'-i',file,'-frames:v','1',f]);im=Image.open(f);im.thumbnail((360,640));x=i%4*360;y=i//4*680;sheet.paste(im,(x,y));draw.text((x+15,y+650),f'{t:.3f}s',fill='white')
sheet.save(out+'/contact-sheet.png')
r={'sha256':hashlib.sha256(open(file,'rb').read()).hexdigest(),'passed':all(checks.values()),'technical':checks,'media':{'duration':duration,'width':v['width'],'height':v['height'],'fps':v['avg_frame_rate'],'videoCodec':v['codec_name'],'audioCodec':a['codec_name'],'bytes':os.path.getsize(file)},'audio':{'peakDbFS':peak,'mixCorrelation':corr,'trailingSilenceSeconds':trailing},'visualReview':'Pending assistant encoded-frame inspection','limitations':['Representative frames and geometry checks do not evaluate every animation frame.','Local neural voice and original procedural soundtrack require human listening review.','No viewer analytics or guaranteed viral potential.'],'contactSheetTimes':times};json.dump(r,open(out+'/quality-report.json','w'),indent=2);print(out,json.dumps(checks));assert r['passed']
