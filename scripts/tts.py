"""Local neural narration and acoustic forced alignment; no timing estimates."""
import sys,json,re,subprocess
sys.path.insert(0,'/workspace/tts-python')
import sherpa_onnx,numpy as np,soundfile as sf
from pocketsphinx import Decoder
spec=json.load(open(sys.argv[1]));out=sys.argv[2];model='/workspace/models/vits-piper-en_US-ljspeech-medium'
c=sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(vits=sherpa_onnx.OfflineTtsVitsModelConfig(model=f'{model}/en_US-ljspeech-medium.onnx',tokens=f'{model}/tokens.txt',data_dir=f'{model}/espeak-ng-data'),num_threads=2,provider='cpu'),max_num_sentences=1)
assert c.validate()
a=sherpa_onnx.OfflineTts(c).generate(spec['narration'],sid=0,speed=1.06);sf.write(out,a.samples,a.sample_rate)
raw=out+'.16k.raw';subprocess.run(['ffmpeg','-v','error','-y','-i',out,'-ar','16000','-ac','1','-f','s16le',raw],check=True)
text=' '.join(re.sub(r'[^a-zA-Z0-9\s\']',' ',spec['narration']).lower().split());dec=Decoder(samprate=16000,loglevel='ERROR')
for word,phones in {'cyberchef':'S AY B ER SH EH F','base64':'B EY S S IH K S T IY F AO R'}.items():
 if not dec.lookup_word(word):dec.add_word(word,phones,False)
dec.set_align_text(text);dec.start_utt();dec.process_raw(open(raw,'rb').read(),False,True);dec.end_utt()
words=[{'text':s.word,'start':s.start_frame/100,'end':(s.end_frame+1)/100} for s in dec.seg() if s.word not in ['<sil>','<s>','</s>','[SPEECH]']]
assert len(words)==len(text.split()),f'Alignment mismatch {len(words)} vs {len(text.split())}'
original=spec['narration'].split();assert len(original)==len(words)
for w,t in zip(words,original):w['text']=t
json.dump({'duration':len(a.samples)/a.sample_rate,'sampleRate':a.sample_rate,'words':words,'engine':'sherpa-onnx/Piper en_US-ljspeech-medium','alignment':'PocketSphinx acoustic forced alignment'},open(out+'.json','w'),indent=2)
print('Narration seconds:',len(a.samples)/a.sample_rate,'aligned words:',len(words))
