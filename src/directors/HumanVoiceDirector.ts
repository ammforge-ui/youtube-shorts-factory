import {z} from 'zod';
export const VoiceIntent=z.enum(['curious','excited','anticipation','explanatory','satisfied']);
export const VoicePhrase=z.object({text:z.string().trim().min(1),emotion:VoiceIntent,rate:z.number().min(.9).max(1.12).optional(),emphasis:z.array(z.string()).max(2).default([]),pauseBeforeMs:z.number().min(0).max(350).default(0),pauseAfterMs:z.number().min(0).max(350).optional(),scene:z.string().min(1)});
export const VoicePerformance=z.object({version:z.literal(1),phrases:z.array(VoicePhrase).min(1),pitchProcessing:z.boolean().default(false)});
/** Meaning-based defaults; synthesis implementation uses the same persisted five presets. */
export function directHumanVoice(narration:string,scenes:{direction?:{purpose?:string;narration?:string}}[]=[]){
 const sentences=narration.match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[narration];
 return VoicePerformance.parse({version:1,pitchProcessing:false,phrases:sentences.map((raw,i)=>{const text=raw.trim();const scene=scenes.find(s=>s.direction?.narration?.includes(text));const purpose=scene?.direction?.purpose;
 const emotion=/\?$/.test(text)||i===0?'curious':/^subscribe|^follow/i.test(text)||i===sentences.length-1?'satisfied':purpose==='payoff'?'excited':/\b(but|before|then|wait)\b/i.test(text)?'anticipation':'explanatory';
 return {text,emotion,emphasis:[],scene:purpose||`sentence-${i+1}`};})});
}
