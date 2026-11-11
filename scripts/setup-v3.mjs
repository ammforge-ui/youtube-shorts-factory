import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
fs.mkdirSync('work/node-red-user',{recursive:true});
if(!fs.existsSync('work/node-red-user/flows.json'))fs.copyFileSync('data/node-red-demo-flow.json','work/node-red-user/flows.json');
fs.copyFileSync('config/node-red-settings.cjs','work/node-red-settings.cjs');
const r=spawnSync('npm',['install','--prefix','work/node-red','--cache','/workspace/.npm-cache','node-red@5.0.9'],{stdio:'inherit'});process.exitCode=r.status??1;
