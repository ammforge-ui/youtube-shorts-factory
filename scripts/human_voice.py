"""Practical Piper voice direction. No SSML or native emotion support is claimed."""
import sys,json,re,subprocess,hashlib,os
sys.path.insert(0,'/workspace/tts-python')
import numpy as np,soundfile as sf,sherpa_onnx
from pocketsphinx import Decoder
MODES={'curious','excited','anticipation','explanatory','satisfied'}
DICTIONARY={'playable':'P L EY AH B AH L','cyberchef':'S AY B ER SH EH F','base64':'B EY S S IH K S T IY F AO R','playwright':'P L EY R AY T','codex':'K OW D EH K S','wanaka':'W AA N AA K AA'}
def normalize(text):return ' '.join(re.sub(r"[^a-zA-Z0-9\s']",' ',text).lower().split())
def align(samples,sr,text,path):
 sf.write(path+'.align.wav',samples,sr)
 subprocess.run(['ffmpeg','-v','error','-y','-i',path+'.align.wav','-ar','16000','-ac','1','-f','s16le',path+'.raw'],check=True)
 dec=Decoder(samprate=16000,loglevel='ERROR')
 for word,phones in DICTIONARY.items():
  if not dec.lookup_word(word):dec.add_word(word,phones,False)
 missing=[w for w in normalize(text).split()if not dec.lookup_word(w)]
 if missing:raise ValueError('Pronunciation dictionary missing words: '+', '.join(sorted(set(missing))))
 dec.set_align_text(normalize(text));dec.start_utt();dec.process_raw(open(path+'.raw','rb').read(),False,True);dec.end_utt()
 words=[{'text':s.word,'start':s.start_frame/100,'end':(s.end_frame+1)/100}for s in dec.seg()if s.word not in ['<sil>','<s>','</s>','[SPEECH]']]
 original=text.split();assert len(words)==len(original)==len(normalize(text).split()),f'Alignment/token mismatch for {text}'
 for w,t in zip(words,original):w['text']=t
 return words
def infer_phrases(text):
 sentences=re.findall(r'[^.!?]+[.!?]+|[^.!?]+$',text)
 return [dict(text=s.strip(),emotion='curious'if i==0 or s.strip().endswith('?') else 'satisfied'if i==len(sentences)-1 else 'anticipation'if re.search(r'\b(but|before|then)\b',s,re.I)else 'explanatory',emphasis=[],scene=f'sentence-{i+1}')for i,s in enumerate(sentences)]
def validate(spec,cfg):
 perf=spec.get('voicePerformance')or {'version':1,'phrases':infer_phrases(spec['narration']),'pitchProcessing':cfg['subtlePitchProcessing']}
 assert perf['version']==1 and perf['phrases'];assert ' '.join(p['text'].strip()for p in perf['phrases'])==spec['narration'].strip(),'Voice phrase text must match narration exactly'
 for p in perf['phrases']:
  assert p['emotion']in MODES
  assert .9<=p.get('rate',cfg['presets'][p['emotion']]['rate'])<=1.12
  assert 0<=p.get('pauseBeforeMs',0)<=350 and 0<=p.get('pauseAfterMs',cfg['presets'][p['emotion']]['pauseAfterMs'])<=350
  assert len(p.get('emphasis',[]))<=2 and sum(len(x.split())for x in p.get('emphasis',[]))<=cfg['maxEmphasisWordsPerPhrase']
  for e in p.get('emphasis',[]):assert normalize(e)in normalize(p['text'])
 return perf
def synthesize(spec,out):
 cfg=json.load(open('config/voice.json'));assert cfg['voice']=='en_US-ljspeech-medium' and cfg['speakerId']==0,'Only the inspected installed narrator is supported';perf=validate(spec,cfg);work=out+'.phrases';os.makedirs(work,exist_ok=True)
 model='/workspace/models/vits-piper-en_US-ljspeech-medium';c=sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(vits=sherpa_onnx.OfflineTtsVitsModelConfig(model=f'{model}/en_US-ljspeech-medium.onnx',tokens=f'{model}/tokens.txt',data_dir=f'{model}/espeak-ng-data'),num_threads=2,provider='cpu'),max_num_sentences=1);assert c.validate();tts=sherpa_onnx.OfflineTts(c);sr=tts.sample_rate
 chunks=[];timings=[];cursor=0
 for i,p in enumerate(perf['phrases']):
  preset=cfg['presets'][p['emotion']];rate=p.get('rate',preset['rate']);a=np.asarray(tts.generate(p['text'],sid=cfg['speakerId'],speed=rate).samples,dtype=np.float64)
  # Trim only excess edge silence; retain 35ms padding and never crossfade words.
  active=np.flatnonzero(np.abs(a)>.004)
  if len(active):a=a[max(0,active[0]-int(.035*sr)):min(len(a),active[-1]+int(.035*sr))]
  pitch=preset['pitchRatio']if perf.get('pitchProcessing',cfg['subtlePitchProcessing'])else 1.0
  if pitch!=1:
   src=f'{work}/{i}-pre.wav';dst=f'{work}/{i}-pitch.wav';sf.write(src,a,sr);subprocess.run(['ffmpeg','-v','error','-y','-i',src,'-af',f'rubberband=pitch={pitch}:formant=preserved:pitchq=quality','-ar',str(sr),dst],check=True);a,_=sf.read(dst)
  ws=align(a,sr,p['text'],f'{work}/{i}')
  gains=np.ones(len(a))
  clean=[normalize(w['text'])for w in ws]
  for emph in p.get('emphasis',[]):
   ts=normalize(emph).split();j=next(j for j in range(len(ws))if clean[j:j+len(ts)]==ts);lo=max(0,int(ws[j]['start']*sr));hi=min(len(a),int(ws[j+len(ts)-1]['end']*sr));n=hi-lo
   if n>0:gains[lo:hi]+= (10**(cfg['emphasisGainDb']/20)-1)*np.sin(np.linspace(0,np.pi,n))**2
  a*=gains;fade=min(int(.005*sr),len(a)//2);a[:fade]*=np.linspace(0,1,fade);a[-fade:]*=np.linspace(1,0,fade)
  before=p.get('pauseBeforeMs',0)/1000;after=0 if i==len(perf['phrases'])-1 else p.get('pauseAfterMs',preset['pauseAfterMs'])/1000
  chunks.append(np.zeros(round(before*sr)));cursor+=round(before*sr)/sr;start=cursor;chunks.append(a);cursor+=len(a)/sr;timings.append(dict(index=i,text=p['text'],emotion=p['emotion'],rate=rate,emphasis=p.get('emphasis',[]),pitchRatio=pitch,start=start,end=cursor,pauseAfterMs=after*1000,scene=p['scene']));chunks.append(np.zeros(round(after*sr)));cursor+=round(after*sr)/sr
 final=np.concatenate(chunks);sf.write(out,final,sr);words=align(final,sr,spec['narration'],out+'.final')
 assert all(w['end']>w['start']and w['end']<=len(final)/sr+.02 for w in words),'Invalid final acoustic alignment'
 digest=hashlib.sha256(open(out,'rb').read()).hexdigest()
 result=dict(sourceNarration=spec['narration'],sourcePerformance=spec.get('voicePerformance'),voiceConfigSha256=hashlib.sha256(open('config/voice.json','rb').read()).hexdigest(),duration=len(final)/sr,sampleRate=sr,words=words,phrases=timings,engine='sherpa-onnx/Piper en_US-ljspeech-medium',alignment='PocketSphinx forced alignment of final processed narration',sha256=digest,capabilities={'nativeRate':True,'phraseSynthesis':True,'speakerContinuity':'one model and speaker 0','nativeSSML':False,'nativePitch':False,'nativeEmotion':False,'timestamps':'external acoustic alignment','pitchFallback':'Optional formant-preserving Rubber Band; conservative default OFF','emphasis':'0.9 dB smooth word envelope using phrase acoustic alignment'},review='Human listening pending. Mode labels direct measurable rate/pause settings, not native learned emotions.')
 json.dump(result,open(out+'.json','w'),indent=2);json.dump(dict(performance=perf,measurements=timings,capabilities=result['capabilities'],sha256=digest,review=result['review']),open(out+'.voice-report.json','w'),indent=2);print('Expressive narration:',result['duration'],'seconds;',len(words),'final aligned words')
if __name__=='__main__':synthesize(json.load(open(sys.argv[1])),sys.argv[2])
