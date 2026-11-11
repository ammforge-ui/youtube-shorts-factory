import fs from 'node:fs';
import {VideoSchema} from '../src/schemas/video';
import {render} from '../src/services/render';
const root=process.argv[2]||'output/production-v3-2026-11-10';
for(const name of ['cyberchef','node-red','playwright']){
 const out=root+'/'+name;const spec=VideoSchema.parse(JSON.parse(fs.readFileSync(out+'/storyboard.json','utf8')));
 const target='output/v3-template-preview-'+spec.template;fs.mkdirSync(target,{recursive:true});await render(spec,target,true);
 console.log(spec.template+' actual still render and safe DOM geometry: PASS');
}
