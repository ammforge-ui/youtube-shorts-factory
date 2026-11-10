import fs from 'node:fs';
import {VideoSchema} from '../src/schemas/video';
import {render} from '../src/services/render';
import {run,json} from '../src/services/system';
const root=process.argv[2],name=process.argv[3],out=root+'/'+name;
const spec=VideoSchema.parse(JSON.parse(fs.readFileSync(out+'/storyboard.json','utf8')));const repairs=[];let t=0;
for(let i=0;i<spec.scenes.length;i++){
 const scene=spec.scenes[i],start=Math.round(t*30);t+=scene.duration;const end=Math.round(t*30);
 if(scene.direction?.mediaType!=='video')continue;
 const patch=`repair-${i}.mp4`;await render(spec,out,false,patch,[start,end-1]);
 const filename=out+'/final.mp4',repaired=out+'/repaired.mp4';
 console.log(run('ffmpeg',['-v','error','-y','-i',filename,'-i',out+'/'+patch,'-filter_complex',`[0:v]trim=end_frame=${start},setpts=PTS-STARTPTS[head];[1:v]setpts=PTS-STARTPTS[patch];[0:v]trim=start_frame=${end},setpts=PTS-STARTPTS[tail];[head][patch][tail]concat=n=3:v=1:a=0[v]`,'-map','[v]','-map','0:a','-r','30','-fps_mode','cfr','-c:v','libx264','-threads','2','-crf','18','-pix_fmt','yuv420p','-c:a','copy','-movflags','+faststart',repaired]));fs.renameSync(repaired,filename);repairs.push({scene:i,startFrame:start,endFrameExclusive:end,reason:'Remove synthetic click highlights that did not exactly track actual control coordinates; real source UI interactions retained.'});
}
json(out+'/repairs.json',repairs);
