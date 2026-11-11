import assert from 'node:assert/strict';
import fs from 'node:fs';
import {VideoSchema} from '../src/schemas/video';
import {phrases} from '../src/directors/CaptionDirector';
import {scoreTopic} from '../src/services/TrendHunter';
const root=process.argv[2]||'output/production-v3-2026-11-10';
for(const name of ['cyberchef','node-red','playwright']){
 const s=VideoSchema.parse(JSON.parse(fs.readFileSync(root+'/'+name+'/storyboard.json','utf8')));
 assert.equal(s.creative?.version,3);assert(s.scenes[0].direction?.purpose==='hook');assert(s.scenes.some(x=>x.direction?.purpose==='payoff'));assert(s.scenes.at(-1)?.direction?.purpose==='cta');assert(s.narration.includes('Subscribe'));assert(s.scenes.some(x=>x.direction?.mediaType==='video'));
 const ps=phrases(s.words);assert(ps.every(p=>p.tokens.length<=5));assert(ps.every(p=>!/[.!?]\s+\S/.test(p.text)));
 assert(s.words.every((w,i)=>w.end>w.start&&(i===0||w.start>=s.words[i-1].end-.04)));
 assert(Math.abs(s.scenes.reduce((n,x)=>n+x.duration,0)-s.duration)<1/30);
 assert(s.scenes.every(x=>fs.existsSync('public/'+x.direction?.asset)));
 const review=JSON.parse(fs.readFileSync(root+'/'+name+'/preproduction.json','utf8'));assert.equal(review.fiveHooks.length,5);
}
assert.equal(scoreTopic({metrics:[5,5,5,5,5,5,5,5],penalty:0} as any),100);assert.equal(scoreTopic({metrics:[0,0,0,0,0,0,0,0],penalty:20} as any),0);
console.log('V3 checks passed: story contract, actual video assets, acoustic word timing, caption boundaries, coverage and scoring range.');
