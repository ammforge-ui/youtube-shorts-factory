import fs from 'node:fs';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {z} from 'zod';
import {json} from './system';
const Candidate=z.object({name:z.string(),website:z.string().url(),source:z.string().url(),category:z.string(),date:z.string().nullable(),what:z.string(),freeTier:z.string(),login:z.string(),automation:z.string(),demo:z.string(),hook:z.string(),audience:z.string(),story:z.string(),metrics:z.tuple([z.number(),z.number(),z.number(),z.number(),z.number(),z.number(),z.number(),z.number()]),penalty:z.number(),decision:z.string()});
const weights=[20,20,15,15,10,10,5,5];
export function scoreTopic(c:z.infer<typeof Candidate>){return Math.max(0,Math.round(c.metrics.reduce((s,v,i)=>s+v/5*weights[i],0)-c.penalty))}
/** Fetch discovery sources every run; never convert a trend listing into a verified demo. */
export async function trendHunter(out:string){
 fs.mkdirSync(out+'/sources',{recursive:true});
 const seeds=JSON.parse(fs.readFileSync('data/research-v3.json','utf8')).map((c:unknown)=>Candidate.parse(c));
 const feeds=['https://github.com/trending','https://news.ycombinator.com/','https://www.producthunt.com/products?period='+new Date().toISOString().slice(0,7)];
 const fetched=await Promise.all([...feeds,...seeds.map((c:any)=>c.source)].map(async(url,i)=>{try{const {stdout}=await promisify(execFile)('curl',['-fsSL','--max-time','15',url],{maxBuffer:4*1024*1024});const file=out+`/sources/source-${i}.txt`;fs.writeFileSync(file,stdout);return {url,file,ok:true,checkedAt:new Date().toISOString()}}catch(e){return {url,ok:false,error:String(e).slice(0,300),checkedAt:new Date().toISOString()}}}));
 const trend=fetched[0];const discoveries=trend.ok?Array.from(fs.readFileSync(trend.file!,'utf8').matchAll(/<article class="Box-row">[\s\S]*?<h2[^>]*>[\s\S]*?href="\/([^"?#]+\/[^"?#]+)"/g),m=>({repository:m[1],source:'https://github.com/'+m[1],status:'unverified; primary source and real demonstration required'})):[];
 const candidates=seeds.map((c:any)=>({...c,score:scoreTopic(c),scoreBasis:'Subjective editorial scores, not trend statistics',retrieval:fetched.find(x=>x.url===c.source)})).sort((a:any,b:any)=>b.score-a.score);
 const r={checkedAt:new Date().toISOString(),feeds:fetched.slice(0,3),discoveries,candidates,selection:['CyberChef V3','Node-RED','Playwright Trace Viewer'],shortfall:'No accessible fresh AI service demo verified. Two evergreen fallback tools; no trending or recent-launch claim in their scripts.',webResearch:'Additional Product Hunt, official announcements, official docs, HN, directories, and YouTube attempt recorded in daily report. YouTube throttled.',automationPolicy:'Only locally installed open-source tools recorded. Third-party SaaS automation permission remains unknown and blocks selection.'};json(out+'/research-sources.json',r);return r;
}
