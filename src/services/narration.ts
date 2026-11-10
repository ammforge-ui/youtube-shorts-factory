import fs from 'node:fs';
import {createHash}from'node:crypto';
import {directHumanVoice,VoicePerformance}from'../directors/HumanVoiceDirector';
import{json,run}from'./system';
/** Cache is valid only for the exact script, performance, config and delivered waveform. */
export function generateDirectedNarration(topic:any,out:string){
 topic.voicePerformance=VoicePerformance.parse(topic.voicePerformance||directHumanVoice(topic.narration,topic.scenes||[]));
 const configHash=createHash('sha256').update(fs.readFileSync('config/voice.json')).digest('hex');
 const wav=out+'/narration.wav',metadata=wav+'.json';let cached:any=null;try{cached=JSON.parse(fs.readFileSync(metadata,'utf8'))}catch{}
 const valid=cached&&fs.existsSync(wav)&&cached.sourceNarration===topic.narration&&JSON.stringify(cached.sourcePerformance)===JSON.stringify(topic.voicePerformance)&&cached.voiceConfigSha256===configHash&&cached.sha256===createHash('sha256').update(fs.readFileSync(wav)).digest('hex');
 json(out+'/topic.json',topic);if(!valid)console.log(run('python',['scripts/tts.py',out+'/topic.json',wav]));
 return JSON.parse(fs.readFileSync(metadata,'utf8'));
}
