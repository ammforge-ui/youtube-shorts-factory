import fs from 'node:fs';
import path from 'node:path';

import {createServer} from 'node:http';
import {createRequire} from 'node:module';

import {json,run} from '../src/services/system';
const root=process.argv[2]||'output/production-v3-2026-11-10';
fs.mkdirSync(root,{recursive:true});
process.env.PLAYWRIGHT_BROWSERS_PATH ||= '/workspace/pw-browsers';
const {chromium}=await import('playwright');
const {capture}=await import('../src/services/capture');
const selected=JSON.parse(fs.readFileSync(process.env.PRODUCTION_TOPICS||'data/production-v3.json','utf8')).map((t:any)=>t.id);
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
async function recorder(name:string,url:string,actions:(p:any,save:any)=>Promise<void>){
 const out=`${root}/${name}`;fs.mkdirSync(out,{recursive:true});
 const ctx=await browser.newContext({viewport:{width:1200,height:1000},recordVideo:{dir:out+'/raw',size:{width:1200,height:1000}}});
 const page=await ctx.newPage();const time=Date.now();const shots:any[]=[];
 await page.goto(url);await page.waitForTimeout(1800);
 const save=async(id:string,selector?:string)=>{const box=selector?await page.locator(selector).first().boundingBox():{x:0,y:0,width:1200,height:1000};await page.screenshot({path:`${out}/${id}.png`});shots.push({id,time:(Date.now()-time)/1000,target:box});};
 await actions(page,save);await page.waitForTimeout(2500);const video=page.video()!;await ctx.close();run('ffmpeg',['-v','error','-y','-i',await video.path(),'-an','-r','30','-c:v','libx264','-crf','18',out+'/recording.mp4']);json(out+'/capture.json',{product:name,viewport:{width:1200,height:1000},shots,verified:true,capturedAt:new Date().toISOString()});
}
try {
 if(selected.includes('cyberchef-v3')&&!fs.existsSync(root+'/cyberchef/capture.json')){fs.mkdirSync(root+'/cyberchef',{recursive:true});await capture(root+'/cyberchef',{message:'Meet me on Mars.',premium:true});}
 if(selected.includes('node-red')&&!fs.existsSync(root+'/node-red/capture.json'))await recorder('node-red','http://127.0.0.1:1880',async(p,save)=>{
 await p.locator('#red-ui-workspace').waitFor();
 const notice=p.getByRole('button',{name:'No, do not enable notifications'});if(await notice.count()){await notice.click();await p.waitForTimeout(800);}
 const welcome=p.getByRole('button',{name:'Done',exact:true});if(await welcome.count())await welcome.click();
 await p.waitForTimeout(500);
 await save('overview','#red-ui-workspace');
 await p.locator('#change1').dblclick();await p.waitForTimeout(600);await save('rule','#dialog-form');await p.getByRole('button',{name:'Done',exact:true}).click();
 await p.locator('#red-ui-header-button-deploy').click();await p.waitForTimeout(1200);
 await p.waitForTimeout(500);
 await p.locator('#inject1 .red-ui-flow-node-button').click();await p.waitForTimeout(1000);
 if(!(await p.locator('body').innerText()).includes('Hello, builder!'))throw Error('Node-RED output assertion failed');
 await save('result','#red-ui-sidebar');
 await p.locator('#inject1 .red-ui-flow-node-button').click();await p.waitForTimeout(700);await save('repeat','#red-ui-sidebar');
 });
 if(selected.includes('playwright')&&!fs.existsSync(root+'/playwright/capture.json')){
 const out=root+'/playwright';fs.mkdirSync(out,{recursive:true});
 const server=createServer((req,res)=>{res.setHeader('Content-Type','text/html; charset=utf-8');res.end('<html><meta charset="utf-8"><style>body{background:#102035;color:white;font:30px system-ui;padding:60px}button{font:28px system-ui;background:#baff5a;border:0;padding:20px 35px;border-radius:15px}h1{font-size:46px}</style><h1>Demo checkout</h1><p>Fictional test shop · no real purchase</p><button onclick="document.querySelector(\'h2\').textContent=\'Error: delivery address missing\'">Place order</button><h2></h2></html>')});await new Promise<void>(r=>server.listen(1890,'127.0.0.1',r));
 const ctx=await browser.newContext({viewport:{width:800,height:600}});await ctx.tracing.start({screenshots:true,snapshots:true,sources:true});const p=await ctx.newPage();await p.goto('http://127.0.0.1:1890');await p.getByRole('button',{name:'Place order'}).click();if(!await p.getByText('Error: delivery address missing').isVisible())throw Error('Demo result missing');await ctx.tracing.stop({path:out+'/trace.zip'});await ctx.close();
 const require=createRequire(import.meta.url);const {startTraceViewerServer}=require(path.resolve('node_modules/playwright-core/lib/server/trace/viewer/traceViewer.js'));const tv=await startTraceViewerServer({host:'127.0.0.1',port:1891});
 await recorder('playwright','http://127.0.0.1:1891/trace/index.html?trace='+encodeURIComponent('file?path='+encodeURIComponent(path.resolve(out+'/trace.zip'))),async(page,save)=>{await page.waitForTimeout(1600);console.log((await page.locator('body').innerText()).slice(0,3000));await page.screenshot({path:'work/trace-debug.png'});await save('overview');console.log((await page.locator('body').innerText()).slice(0,2500));const actions=page.locator('.tree-item');console.log('tree',await actions.count());await page.getByText('Click',{exact:true}).first().click();await page.waitForTimeout(800);await save('click');await page.getByText('Before',{exact:true}).first().click();await page.waitForTimeout(500);await save('before');await page.getByText('After',{exact:true}).first().click();await page.waitForTimeout(500);await save('after');const texts=await Promise.all(page.frames().map((f:any)=>f.locator('body').innerText().catch(()=>'')));if(!texts.some((t:string)=>t.includes('Error: delivery address missing')))throw Error('Trace after snapshot result missing');});
 await tv.stop();server.close();
 }
}finally{await browser.close()}
