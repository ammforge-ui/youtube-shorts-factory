import fs from 'node:fs';
import {VideoSchema} from '../src/schemas/video';
import {render} from '../src/services/render';
const root=process.argv[2]||'output/production-v3-2026-11-10';
for(const name of (process.argv[3]?[process.argv[3]]:['cyberchef','node-red','playwright'])){
 const out=root+'/'+name;const spec=VideoSchema.parse(JSON.parse(fs.readFileSync(out+'/storyboard.json','utf8')));
 await render(spec,out,process.argv.includes('--stills'),'final.mp4');
}
