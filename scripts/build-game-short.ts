import fs from 'node:fs';
import{json,run}from'../src/services/system';
import{VideoSchema}from'../src/schemas/video';
import{directAudio}from'../src/directors/AudioDirector';
import{srt}from'../src/directors/CaptionDirector';
import{render}from'../src/services/render';
const out=process.argv[2]||'output/robot-run-v1-2026-11-10';if(fs.existsSync(out+'/final.mp4')&&!process.argv.includes('--stills')&&!process.argv.includes('--rerender'))throw Error('Finished output exists. Choose a new versioned output directory, or explicitly use --rerender for an editorial correction.');const topic=JSON.parse(fs.readFileSync('data/robot-run-v1.json','utf8'));const voice=JSON.parse(fs.readFileSync(out+'/narration.wav.json','utf8'));const evidence=JSON.parse(fs.readFileSync(out+'/capture.json','utf8'));
if(!evidence.verified||!evidence.clips.gameplay.state.won||evidence.clips.gameplay.state.coins!==4)throw Error('No verified playable result');
run('ffmpeg',['-v','error','-y','-i',out+'/brief.mp4','-vf','setpts=0.5*PTS,fps=30','-an','-c:v','libx264','-crf','18',out+'/brief-fast.mp4']);
const key='robot-run-v1-2026-11-10',media='public/media/'+key;fs.mkdirSync(media,{recursive:true});for(const f of ['gameplay.mp4','brief-fast.mp4','source.mp4'])fs.copyFileSync(out+'/'+f,media+'/'+f);
const duration=Math.ceil(Math.max(27.1,voice.duration+.4)*30)/30;
const starts=voice.phrases.map((p:any)=>Math.round(p.start*30)/30).concat(duration);
const finish=evidence.clips.gameplay.finishAt;
const rows=[
 {title:'Can AI build a 3D game?',asset:'gameplay.mp4',start:3.2,purpose:'hook',layout:'device'},
 {title:'The brief: a robot obstacle course.',asset:'brief-fast.mp4',start:1.0,purpose:'demonstration',layout:'browser'},
 {title:'Platforms. Coins. A portal.',asset:'gameplay.mp4',start:1.9,purpose:'demonstration',layout:'device'},
 {title:'Actual code. Local prototype.',asset:'source.mp4',start:.8,purpose:'curiosity',layout:'detail'},
 {title:'Then I tested what it built.',asset:'gameplay.mp4',start:Math.max(0,finish-3.25),purpose:'payoff',layout:'device'},
 {title:'It took fixes. It is still a prototype.',asset:'gameplay.mp4',start:2.6,purpose:'takeaway',layout:'device'},
 {title:'AI writes. You still test.',asset:'gameplay.mp4',start:Math.max(0,finish-1.5),purpose:'takeaway',layout:'device'},
 {title:'More AI experiments.',asset:'gameplay.mp4',start:Math.max(0,finish-.3),purpose:'cta',layout:'device'}
];
const scenes=rows.map((r,i)=>({title:r.title,eyebrow:'',detail:r.layout==='browser'?'Original brief display · typing 2× · not a live AI request':r.layout==='detail'?'Actual source from this session':'Codex-authored prototype · actual browser recording',duration:starts[i+1]-starts[i],shot:r.purpose==='cta'?'cta':r.purpose==='payoff'?'result':'action',footage:`media/${key}/${r.asset}`,startFrom:r.start,direction:{purpose:r.purpose,layout:r.layout,graphic:r.purpose==='payoff'?{heading:'REAL PLAYTEST',explanation:String(Math.max(0,finish-r.start)),cards:[]}:undefined,narration:voice.phrases[i].text,asset:`media/${key}/${r.asset}`,mediaType:'video',sourceWidth:600,sourceHeight:1000,sourceFontPx:29,camera:[{frame:0,target:{x:0,y:0,width:600,height:1000}}],cursor:[],typography:r.purpose==='hook'?'hook':'caption',captionPlacement:'bottom',transition:'cut',musicIntensity:r.purpose==='payoff'?.85:r.purpose==='curiosity'?.4:.6,tone:r.purpose==='payoff'?'satisfying':'curious',motion:'zoom-in'}}));
const spec=VideoSchema.parse({...topic,duration,words:voice.words,audio:`media/${key}/mix.wav`,scenes,creative:{version:4,example:'Original robot obstacle course',encoded:'',bpm:120,brand:'THE TOOL FILES',musicAsset:`media/${key}/music.wav`,soundEvents:rows.map((r,i)=>({event:r.title,frame:Math.round((starts[i]+(r.purpose==='payoff'?Math.max(0,finish-r.start):0))*30),sound:i===0?'digital_pop':i===1?'keyboard':r.purpose==='payoff'?'digital_reveal':r.purpose==='cta'?'ending':'soft_whoosh',intensity:r.purpose==='payoff'?.55:.25}))}});
json(out+'/storyboard.json',spec);directAudio(out,spec);for(const f of ['mix.wav','music.wav'])fs.copyFileSync(out+'/'+f,media+'/'+f);fs.writeFileSync(out+'/script.txt',topic.narration+'\n');fs.writeFileSync(out+'/captions.srt',srt(spec.words).trim()+'\n');
console.log('Final duration',duration);
await render(spec,out,process.argv.includes('--stills'),'final.mp4');
