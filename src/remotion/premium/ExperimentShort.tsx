import React from 'react';
import {AbsoluteFill,Audio,OffthreadVideo,Sequence,staticFile,useCurrentFrame,interpolate} from 'remotion';
import type{VideoSpec}from'../../schemas/video';
import{CaptionHighlight}from'../primitives/caption-highlight';
import{SplitTextChars}from'../primitives/split-text-chars';
import{phrases}from'../../directors/CaptionDirector';
import{useLayoutAudit}from'./useLayoutAudit';
function ExperimentShot({s}:{s:VideoSpec['scenes'][number]}){
 const f=useCurrentFrame(),d=s.direction!,isBrief=d.layout==='browser',isSource=d.layout==='detail';
 const scale=interpolate(f,[0,Math.max(1,Math.round(s.duration*30)-1)],[1,1.025],{extrapolateRight:'clamp'});
 return <AbsoluteFill>
 <div data-safe="gameplay" style={{position:'absolute',left:isBrief||isSource?75:0,top:isBrief||isSource?390:0,width:isBrief||isSource?900:1080,height:isBrief||isSource?1040:1800,overflow:'hidden',borderRadius:isBrief||isSource?30:0,background:'#0b1421'}}>
 <OffthreadVideo muted src={staticFile(d.asset)} startFrom={Math.round(s.startFrom*30)} style={{width:'100%',height:'100%',objectFit:isBrief||isSource?'contain':'cover',transform:`scale(${scale})`,transformOrigin:'50% 62%'}}/>
 </div>
 {!isBrief&&!isSource?<AbsoluteFill style={{background:'linear-gradient(#08101bdd 0%,#08101b33 26%,transparent 46%,transparent 70%,#08101bf5 88%)'}}/>:null}
 <div data-safe="title" style={{position:'absolute',left:80,top:180,width:850,lineHeight:1.06}}>
 {d.purpose==='hook'?<div style={{fontSize:89,fontWeight:700}}>Can AI build<br/>a <span style={{color:'#baff5a'}}>3D game?</span></div>:<SplitTextChars text={s.title} mode="words" effect="fade-up" fontSize={71} fontWeight={700} durationInFrames={9} staggerInFrames={2} fontFamily="Display" textAlign="left" lineHeight={1.08} color="#fff"/>}
 </div>
 {d.purpose==='payoff'&&f>=Number(d.graphic?.explanation||0)*30?<div style={{position:'absolute',left:80,top:1300,padding:'15px 24px',fontSize:28,background:'#baff5a',borderRadius:16,color:'#0b1421'}}>REAL PLAYTEST · 4 COINS · PORTAL REACHED</div>:null}
 {d.purpose==='cta'?<div style={{position:'absolute',left:80,top:1330,color:'#0b1421',background:'#baff5a',padding:'14px 24px',borderRadius:16,fontSize:32,boxShadow:'0 6px 20px #0006'}}>SUBSCRIBE ↗</div>:null}
 <div style={{position:'absolute',left:80,top:1450,color:'#9db4cf',fontSize:23}}>{s.detail}</div>
 </AbsoluteFill>
}
export function ExperimentShort({spec}:{spec:VideoSpec}){
 const f=useCurrentFrame();useLayoutAudit(f);let t=0;const p=phrases(spec.words).find(p=>f/30*1000>=p.startMs&&f/30*1000<p.startMs+p.durationMs);
 return <AbsoluteFill style={{background:'#0b1421',fontFamily:'Display',color:'#fff'}}><style>{`@font-face{font-family:Display;src:url('${staticFile('fonts/Display-Bold.ttf')}')}@font-face{font-family:Body;src:url('${staticFile('fonts/Body-Regular.ttf')}')}*{box-sizing:border-box}`}</style>
 {spec.scenes.map((s,i)=>{const from=Math.round(t*30);t+=s.duration;return <Sequence key={i} from={from} durationInFrames={Math.round(t*30)-from}><ExperimentShot s={s}/></Sequence>})}
 <div style={{position:'absolute',left:80,top:110,fontSize:23,letterSpacing:4,color:'#baff5a'}}>THE TOOL FILES / AI EXPERIMENT</div>
 {p?<div data-safe="caption" style={{position:'absolute',left:85,top:1530,width:800,minHeight:150,textShadow:'0 4px 8px #000'}}><CaptionHighlight page={p} frame={f-Math.round(p.startMs/1000*30)} fontSize={52} activeColor="#baff5a" inactiveColor="#fff" shadow emphasisScale={1.04}/></div>:null}<Audio src={staticFile(spec.audio)}/></AbsoluteFill>
}
