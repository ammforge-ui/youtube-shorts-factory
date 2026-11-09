import sys,subprocess,json
sys.path.insert(0,'/workspace/tts-python')
import numpy as np,soundfile as sf
out=sys.argv[1]
subprocess.run(['ffmpeg','-v','error','-y','-i',out+'/final-v2.mp4','-vn','-ar','48000','-ac','2',out+'/decoded-audio.wav'],check=True)
a,sr=sf.read(out+'/mix.wav',always_2d=True);b,_=sf.read(out+'/decoded-audio.wav',always_2d=True);n=min(len(a),len(b));corr=float(np.corrcoef(a[:n].ravel(),b[:n].ravel())[0,1]);assert corr>.98,f'Encoded audio differs from intended full mix: {corr}'
r={'sampleRate':sr,'correlationEncodedToIntendedMix':corr,'passed':True,'method':'Decoded AAC compared against the actual premux music+voice+effects mix; >0.98 correlation required.'};json.dump(r,open(out+'/mix-delivery-check.json','w'),indent=2);print(r)
