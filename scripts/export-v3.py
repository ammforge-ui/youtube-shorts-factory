import sys,os,json,zipfile,hashlib,time
root=sys.argv[1] if len(sys.argv)>1 else 'output/production-v3-2026-11-10'
required=['final.mp4','script.txt','title.txt','description.txt','hashtags.txt','captions.srt','storyboard.json','research-sources.json','audio-report.json','quality-report.json','contact-sheet.png','preproduction.json','capture.json','layout-report.json']
os.makedirs('artifacts',exist_ok=True)
archive='artifacts/'+os.path.basename(root).replace('production-','shorts-',1)+'.zip'
if os.path.exists(archive):archive=archive[:-4]+'-'+str(int(time.time()))+'.zip'
manifest={}
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED,compresslevel=2) as z:
 for name in ['cyberchef','node-red','playwright']:
  q=json.load(open(root+'/'+name+'/quality-report.json'));assert q['passed'];assert isinstance(q['visualReview'],dict),'Visual inspection pending'
  for f in required:
   path=root+'/'+name+'/'+f;assert os.path.isfile(path),path;z.write(path,name+'/'+f);manifest[name+'/'+f]=hashlib.sha256(open(path,'rb').read()).hexdigest()
 for f in ['daily-production-report.md','research-sources.json','daily-report.json']:
  z.write(root+'/'+f,f)
 z.writestr('SHA256.json',json.dumps(manifest,indent=2))
source='artifacts/factory-v3-source.zip'
if os.path.exists(source):source=source[:-4]+'-'+str(int(time.time()))+'.zip'
with zipfile.ZipFile(source,'w',zipfile.ZIP_DEFLATED) as z:
 for f in ['AGENTS.md','README.md','package.json','package-lock.json','tsconfig.json','remotion.config.ts','remotion-ui.json','.gitignore','requirements-tts.txt']:
  z.write(f,f)
 for directory in ['src','scripts','config','data','docs','assets/licenses','public/fonts']:
  for base,dirs,files in os.walk(directory):
   dirs[:]=[d for d in dirs if d!='production-history']
   for f in files:z.write(os.path.join(base,f),os.path.join(base,f))
print(os.path.abspath(archive));print(os.path.abspath(source))
