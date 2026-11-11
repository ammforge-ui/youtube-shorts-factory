import fs from 'node:fs';
import {spawn,spawnSync} from 'node:child_process';
import {trendHunter} from '../src/services/TrendHunter';
import {json} from '../src/services/system';
const config=JSON.parse(fs.readFileSync('config/production.json','utf8'));
const root=process.argv[2]||`output/daily-v3-${new Date().toISOString().replace(/[:.]/g,'-')}`;
fs.mkdirSync(root,{recursive:true});
await trendHunter(root);
const historyFile='data/production-history/history.json';const history=fs.existsSync(historyFile)?JSON.parse(fs.readFileSync(historyFile,'utf8')):[];
const topics=JSON.parse(fs.readFileSync('data/production-v3.json','utf8'));
const count=Number(process.env.PRODUCTION_COUNT||config.dailyCount);if(!Number.isInteger(count)||count<1||count>3)throw Error('Count must be 1–3');
const eligible=topics.filter((t:any)=>!history.some((h:any)=>h.id===t.id&&h.status==='technical-qc-passed')).slice(0,count);
json(root+'/eligible-topics.json',eligible);
if(!eligible.length){json(root+'/daily-report.json',{requested:count,produced:0,reason:'Fresh discovery completed. No new verified capture/story adapters; produced topics excluded. Review discoveries and qualify new topics before production.',published:false});process.exitCode=2;}else{
 const env={...process.env,PLAYWRIGHT_BROWSERS_PATH:'/workspace/pw-browsers',PRODUCTION_TOPICS:root+'/eligible-topics.json'};
 const run=(script:string,args:string[]=[])=>{const r=spawnSync(process.execPath,['node_modules/tsx/dist/cli.mjs',script,root,...args],{stdio:'inherit',env});if(r.status!==0)throw Error(`${script} failed: ${r.status}`)};
 let nr:ReturnType<typeof spawn>|undefined;
 try{if(eligible.some((x:any)=>x.id==='node-red')){if(!fs.existsSync('work/node-red/node_modules/node-red/red.js'))throw Error('Run npm run setup:v3 first');nr=spawn(process.execPath,['work/node-red/node_modules/node-red/red.js','--userDir','work/node-red-user','--settings','work/node-red-settings.cjs'],{stdio:'ignore'});await new Promise(r=>setTimeout(r,1500));}
 run('scripts/capture-v3.ts');run('scripts/prepare-v3.ts');
 const results=[];
 for(const t of eligible){const name=t.id==='cyberchef-v3'?'cyberchef':t.id;try{run('scripts/render-v3.ts',[name]);const q=spawnSync('python',['scripts/verify-v3.py',root+'/'+name],{stdio:'inherit'});if(q.status!==0)throw Error('QC failed');results.push({id:t.id,out:root+'/'+name,status:'technical-qc-passed',review:'Encoded frame and human listening review required before approval'});}catch(e){results.push({id:t.id,status:'failed',error:String(e)})}}
 json(historyFile,[...history,...results]);json(root+'/daily-report.json',{requested:count,produced:results.filter(r=>r.status==='technical-qc-passed').length,results,published:false,limitations:['Fresh discovery and scoring are automatic; new product qualification and capture adapters require editorial/engineering work.','No inaccessible fresh AI product is substituted with fabricated footage.']});if(results.filter(r=>r.status==='technical-qc-passed').length<count)process.exitCode=2;
 }catch(error){json(root+'/daily-report.json',{requested:count,produced:0,status:'failed',error:String(error),published:false});process.exitCode=1;}finally{nr?.kill()}
}
