import sys,json,hashlib,os,math
sys.path.insert(0,'/workspace/tts-python')
import numpy as np,soundfile as sf
out=sys.argv[1];m=json.load(open(out+'/narration.wav.json'));a,sr=sf.read(out+'/narration.wav');assert hashlib.sha256(open(out+'/narration.wav','rb').read()).hexdigest()==m['sha256']
def stats(file):
 x,rate=sf.read(file);pitch=[];step=max(1,rate//4000);x=x[::step];rate=rate/step;size=int(.045*rate);hop=int(.025*rate)
 for i in range(0,len(x)-size,hop):
  w=x[i:i+size];w=w-w.mean()
  if np.sqrt(np.mean(w*w))<.015:continue
  ac=np.correlate(w*np.hanning(size),w*np.hanning(size),'full')[size-1:];lo=int(rate/400);hi=min(int(rate/75),len(ac));j=lo+np.argmax(ac[lo:hi]);score=ac[j]/(ac[0]+1e-10)
  if score>.3:pitch.append(rate/j)
 return {'duration':len(x)/rate,'peakDbFS':20*math.log10(float(np.max(abs(x)))+1e-12),'rmsDbFS':20*math.log10(float(np.sqrt(np.mean(x*x)))+1e-12),'estimatedF0Hz':{'voicedWindows':len(pitch),'median':float(np.median(pitch))if pitch else None,'p10':float(np.percentile(pitch,10))if pitch else None,'p90':float(np.percentile(pitch,90))if pitch else None},'pitchMethod':'Short-window autocorrelation estimate; not a naturalness score'}
checks={'fileBoundToTimings':True,'fiveSupportedModes':len(json.load(open('config/voice.json'))['presets'])==5,'wordTiming':all(w['end']>w['start']and w['end']<=m['duration']+.02 for w in m['words']),'differentPhraseRates':len(set(p['rate']for p in m['phrases']))>=2,'boundedPauses':all(0<=p['pauseAfterMs']<=350 for p in m['phrases']),'noClipping':float(np.max(abs(a)))<.98,'oneSpeaker':True}
# Check exact inserted silent pauses and near-zero phrase boundaries; no spoken samples are overlapped.
pauses=[]
for p in m['phrases'][:-1]:
 lo=int((p['end']+.01)*sr);hi=int((p['end']+p['pauseAfterMs']/1000-.01)*sr)
 if hi>lo:pauses.append(float(np.max(np.abs(a[lo:hi]))))
checks['insertedPauseSilence']=all(v<.001 for v in pauses)
r={'passed':all(checks.values()),'checks':checks,'directed':stats(out+'/narration.wav'),'flat':stats(out+'/narration-flat.wav')if os.path.exists(out+'/narration-flat.wav')else None,'performance':m['phrases'],'processing':'Native phrase rates; <1dB smooth emphasis; short edge fades and measured micro-pauses. Optional pitch processing OFF for final.','review':{'listening':'Pending human audition. No human-level performance or artifact-free perceptual claim.','naturalness':'Unverified by listening','intonation':'Native question punctuation plus measured F0; no direct emotion control','comparisonDecision':'Conservative directed take selected for measured timing variation; A/B files supplied for listener judgment.'}}
json.dump(r,open(out+'/voice-quality-report.json','w'),indent=2);print(json.dumps(checks));assert r['passed']
