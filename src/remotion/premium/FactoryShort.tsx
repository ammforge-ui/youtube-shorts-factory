import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, interpolate} from 'remotion';
import type {VideoSpec} from '../../schemas/video';
import {SmartScreenZoom} from './SmartScreenZoom';
import {SplitTextChars} from '../primitives/split-text-chars';
import {CaptionHighlight} from '../primitives/caption-highlight';
import {phrases} from '../../directors/CaptionDirector';
import {useLayoutAudit} from './useLayoutAudit';
function Shot({s,spec}:{s:VideoSpec['scenes'][number];spec:VideoSpec}) {
 const f=useCurrentFrame(); const d=s.direction!;
 return <AbsoluteFill>
 <div data-safe="title" style={{position:'absolute',left:80,top:205,width:850,fontSize:84,lineHeight:1.08}}>
 {d.purpose==='hook'?<div style={{fontSize:25,color:'#baff5a',letterSpacing:3,marginBottom:24}}>{spec.product.toUpperCase()}</div>:null}
 <SplitTextChars text={s.title} mode="words" effect="fade-up" durationInFrames={9} staggerInFrames={2} fontSize={d.purpose==='hook'?88:76} fontFamily="Display" fontWeight={700} textAlign="left" color="#f6f8fc" lineHeight={1.08}/>
 </div>
 <div style={{position:'absolute',left:80,top:545,transform:`translateY(${Math.sin(f/65)*3}px)`}}><SmartScreenZoom direction={d} startFrom={s.startFrom} width={900} height={850}/></div>
 <div style={{position:'absolute',left:88,top:1420,width:830,fontSize:24,color:'#9baec1',fontFamily:'Body'}}>{s.detail}</div>
 {d.purpose==='cta'?<div style={{position:'absolute',right:150,top:1280,padding:'15px 25px',borderRadius:18,background:'#baff5a',color:'#0b1421',fontSize:32,transform:`scale(${interpolate(f,[0,12],[.9,1],{extrapolateRight:'clamp'})})`}}>SUBSCRIBE ↗</div>:null}
 </AbsoluteFill>
}
export function FactoryShort({spec}:{spec:VideoSpec}) {
 const f=useCurrentFrame();useLayoutAudit(f); let cursor=0;
 const page=phrases(spec.words).find(p=>f/30*1000>=p.startMs&&f/30*1000<p.startMs+p.durationMs);
 return <AbsoluteFill style={{background:'#0b1421',color:'#fff',fontFamily:'Display'}}>
 <style>{`@font-face{font-family:Display;src:url('${staticFile('fonts/Display-Bold.ttf')}')}@font-face{font-family:Body;src:url('${staticFile('fonts/Body-Regular.ttf')}')}*{box-sizing:border-box}`}</style>
 <AbsoluteFill style={{background:`radial-gradient(ellipse at ${65+Math.sin(f/100)*15}% 15%,#25453d,transparent 60%),radial-gradient(ellipse at 10% 95%,#1b2d49,transparent 60%)`}}/>
 <div style={{position:'absolute',left:80,top:115,fontSize:23,letterSpacing:4,color:'#8fa5bd'}}>THE TOOL FILES</div>
 {spec.scenes.map((s,i)=>{const from=Math.round(cursor*30);cursor+=s.duration;return <Sequence key={i} from={from} durationInFrames={Math.round(cursor*30)-from}><Shot s={s} spec={spec}/></Sequence>})}
 {page?<div data-safe="caption" style={{position:'absolute',left:85,top:1510,width:800,minHeight:150,textShadow:'0 4px 8px #000'}}><CaptionHighlight page={page} frame={f-Math.round(page.startMs/1000*30)} fontSize={52} activeColor="#baff5a" inactiveColor="#fff" shadow emphasisScale={1.035}/></div>:null}
 <Audio src={staticFile(spec.audio)}/>
 </AbsoluteFill>
}
