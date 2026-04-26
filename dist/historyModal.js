"use strict";(()=>{(()=>{let T=!1,B=t=>{let r=Date.now()-t,i=Math.floor(r/1e3);if(i<60)return"just now";let c=Math.floor(i/60);if(c<60)return`${c} min ago`;let g=Math.floor(c/60);if(g<24)return`${g} h ago`;let d=Math.floor(g/24);return d<7?`${d} d ago`:new Date(t).toLocaleDateString("en-US",{day:"numeric",month:"short",year:"numeric"})},M=t=>{if(t<1024)return`${t} B`;let r=t/1024;return r<1024?`${Math.round(r)} KB`:`${(r/1024).toFixed(1)} MB`},L=t=>{try{return new URL(t).hostname}catch{return t}},E=t=>{let r=document.createElement("div");r.dataset.dsdInternal="1",r.style.cssText=`
      position: fixed;
      top: 32px;
      left: 50%;
      transform: translate(-50%, -12px);
      padding: 10px 16px;
      background: rgba(20, 20, 22, 0.88);
      backdrop-filter: blur(20px) saturate(160%);
      -webkit-backdrop-filter: blur(20px) saturate(160%);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.95);
      border-radius: 12px;
      font: 500 13px/1.2 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35);
      z-index: 2147483647;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s ease, transform 0.2s ease;
      max-width: min(80vw, 520px);
    `,r.textContent=t,document.documentElement.appendChild(r),requestAnimationFrame(()=>{r.style.opacity="1",r.style.transform="translate(-50%, 0)"}),setTimeout(()=>{r.style.opacity="0",r.style.transform="translate(-50%, -12px)",setTimeout(()=>r.remove(),220)},2200)},U=async t=>await(await fetch(t)).blob(),$=async()=>{if(T)return;T=!0;let t=document.createElement("div");t.dataset.dsdInternal="1",t.style.cssText=`
      position: fixed;
      inset: 0;
      z-index: 2147483647;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.65);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      opacity: 0;
      transition: opacity 0.2s ease;
      pointer-events: auto;
    `;let r=document.createElement("div");r.style.cssText=`
      width: min(94vw, 880px);
      max-height: 90vh;
      margin: 16px;
      padding: 16px;
      background: rgba(28, 28, 30, 0.96);
      backdrop-filter: blur(24px) saturate(180%);
      -webkit-backdrop-filter: blur(24px) saturate(180%);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 14px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.06);
      color: rgba(255, 255, 255, 0.95);
      font: 400 14px/1.45 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      transform: scale(0.96);
      transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      flex-direction: column;
      gap: 12px;
      overflow: hidden;
    `;let i=document.createElement("div");i.style.cssText="display: flex; align-items: center; justify-content: space-between; gap: 12px;";let c=document.createElement("div");c.textContent="Screenshot history",c.style.cssText="font: 600 15px/1.3 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;";let g=document.createElement("div");g.style.cssText="display: flex; align-items: center; gap: 8px;";let d=document.createElement("button");d.textContent="Clear all",d.style.cssText=`
      padding: 6px 10px;
      border-radius: 6px;
      border: 1px solid rgba(255, 80, 80, 0.3);
      background: rgba(255, 80, 80, 0.08);
      color: rgba(255, 120, 120, 0.95);
      font: 500 12px/1 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      cursor: pointer;
      transition: background 0.15s ease;
    `,d.addEventListener("mouseenter",()=>{d.style.background="rgba(255, 80, 80, 0.18)"}),d.addEventListener("mouseleave",()=>{d.style.background="rgba(255, 80, 80, 0.08)"});let p=document.createElement("button");p.innerHTML=`
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
        <line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/>
      </svg>`,p.style.cssText=`
      width: 28px; height: 28px;
      display: inline-flex; align-items: center; justify-content: center;
      border: none; background: transparent;
      color: rgba(255, 255, 255, 0.7);
      border-radius: 6px; cursor: pointer; padding: 0;
      transition: background 0.15s ease, color 0.15s ease;
    `,p.addEventListener("mouseenter",()=>{p.style.background="rgba(255, 255, 255, 0.1)",p.style.color="rgba(255, 255, 255, 1)"}),p.addEventListener("mouseleave",()=>{p.style.background="transparent",p.style.color="rgba(255, 255, 255, 0.7)"}),g.appendChild(d),g.appendChild(p),i.appendChild(c),i.appendChild(g);let s=document.createElement("div");s.style.cssText=`
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 10px;
      overflow: auto;
      padding: 4px;
      flex: 1 1 auto;
      min-height: 200px;
      max-height: 70vh;
    `;let u=document.createElement("div");u.style.cssText=`
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 16px;
      color: rgba(255, 255, 255, 0.55);
      text-align: center;
    `,u.innerHTML=`
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" style="opacity: 0.5; margin-bottom: 12px;">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <circle cx="9" cy="9" r="2"/>
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
      </svg>
      <div style="font-weight: 500;">No screenshots</div>
      <div style="font-size: 12px; margin-top: 4px;">Screenshots are automatically saved here after capture.</div>
    `,r.appendChild(i),r.appendChild(s),t.appendChild(r),document.documentElement.appendChild(t);let m=!1,v=()=>{m||(m=!0,t.style.opacity="0",r.style.transform="scale(0.96)",setTimeout(()=>t.remove(),200),document.removeEventListener("keydown",x,!0),T=!1)},x=o=>{o.key==="Escape"&&(o.stopPropagation(),o.preventDefault(),v())};document.addEventListener("keydown",x,!0),p.addEventListener("click",v),t.addEventListener("click",o=>{o.target===t&&v()}),requestAnimationFrame(()=>{t.style.opacity="1",r.style.transform="scale(1)"});let C=o=>{if(s.replaceChildren(),o.length===0){s.style.display="flex",s.style.alignItems="center",s.style.justifyContent="center",s.appendChild(u);return}s.style.display="grid",s.style.alignItems="",s.style.justifyContent="";for(let n of o){let l=document.createElement("div");l.style.cssText=`
          display: flex;
          flex-direction: column;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          transition: background 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
        `,l.addEventListener("mouseenter",()=>{l.style.background="rgba(255, 255, 255, 0.07)",l.style.borderColor="rgba(255, 255, 255, 0.14)"}),l.addEventListener("mouseleave",()=>{l.style.background="rgba(255, 255, 255, 0.04)",l.style.borderColor="rgba(255, 255, 255, 0.08)"});let h=document.createElement("div");h.style.cssText=`
          position: relative;
          aspect-ratio: 4 / 3;
          background: rgba(0, 0, 0, 0.4);
          overflow: hidden;
        `;let w=document.createElement("img");w.src=n.thumbDataUrl,w.alt=n.pageTitle||n.pageUrl,w.style.cssText=`
          display: block;
          width: 100%;
          height: 100%;
          object-fit: ${n.kind==="fullpage"?"contain":"cover"};
        `,h.appendChild(w);let f=document.createElement("span");f.textContent=n.kind==="fullpage"?"full page":"region",f.style.cssText=`
          position: absolute;
          top: 6px;
          left: 6px;
          padding: 2px 6px;
          background: rgba(0, 0, 0, 0.7);
          color: rgba(255, 255, 255, 0.95);
          font: 500 10px/1.2 -apple-system, BlinkMacSystemFont, sans-serif;
          border-radius: 4px;
          letter-spacing: 0.02em;
        `,h.appendChild(f);let k=document.createElement("div");k.style.cssText="padding: 8px 10px; display: flex; flex-direction: column; gap: 2px;";let e=document.createElement("div");e.textContent=n.pageTitle||L(n.pageUrl),e.title=n.pageTitle||n.pageUrl,e.style.cssText=`
          font: 500 12px/1.3 -apple-system, BlinkMacSystemFont, sans-serif;
          color: rgba(255, 255, 255, 0.95);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        `;let a=document.createElement("div");a.textContent=`${B(n.createdAt)} \xB7 ${n.width}\xD7${n.height} \xB7 ${M(n.size)}`,a.style.cssText=`
          font: 400 11px/1.3 -apple-system, BlinkMacSystemFont, sans-serif;
          color: rgba(255, 255, 255, 0.55);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        `,k.appendChild(e),k.appendChild(a),l.appendChild(h),l.appendChild(k),l.addEventListener("click",()=>{I(n,y)}),s.appendChild(l)}},y=async()=>{s.replaceChildren();let o=document.createElement("div");o.style.cssText="padding: 24px; text-align: center; color: rgba(255,255,255,0.6); grid-column: 1 / -1;",o.textContent="Loading\u2026",s.appendChild(o);try{let n=await chrome.runtime.sendMessage({type:"listScreenshots"});if(!n||!n.ok)throw new Error(n&&!n.ok?n.error:"no response");C(n.items)}catch(n){s.replaceChildren();let l=document.createElement("div");l.style.cssText="padding: 24px; text-align: center; color: rgba(255,120,120,0.85); grid-column: 1 / -1;",l.textContent="Failed to load history: "+(n instanceof Error?n.message:String(n)),s.appendChild(l)}};d.addEventListener("click",async()=>{if(confirm("Really delete the entire screenshot history?"))try{let o=await chrome.runtime.sendMessage({type:"clearScreenshots"});if(!o||!o.ok)throw new Error(o&&!o.ok?o.error:"no response");E("History cleared"),await y()}catch(o){E("Delete failed: "+(o instanceof Error?o.message:String(o)))}}),y()},I=async(t,r)=>{let i=document.createElement("div");i.dataset.dsdInternal="1",i.style.cssText=`
      position: fixed;
      inset: 0;
      z-index: 2147483647;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.78);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      opacity: 0;
      transition: opacity 0.2s ease;
      pointer-events: auto;
    `;let c=document.createElement("div");c.style.cssText=`
      width: min(94vw, 980px);
      max-height: 92vh;
      margin: 16px;
      padding: 14px;
      background: rgba(28, 28, 30, 0.96);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 14px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
      color: rgba(255, 255, 255, 0.95);
      font: 400 13px/1.4 -apple-system, BlinkMacSystemFont, sans-serif;
      transform: scale(0.96);
      transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      flex-direction: column;
      gap: 10px;
      overflow: hidden;
    `;let g=document.createElement("div");g.style.cssText="display: flex; align-items: center; gap: 10px;";let d=document.createElement("div");d.style.cssText="flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 2px;";let p=document.createElement("div");p.textContent=t.pageTitle||L(t.pageUrl),p.style.cssText="font: 600 14px/1.3 -apple-system, BlinkMacSystemFont, sans-serif; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;";let s=document.createElement("div");s.textContent=`${t.width}\xD7${t.height} \xB7 ${M(t.size)} \xB7 ${B(t.createdAt)}`,s.style.cssText="font-size: 11px; color: rgba(255,255,255,0.6);",d.appendChild(p),d.appendChild(s);let u=document.createElement("button");u.innerHTML=`
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
        <line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/>
      </svg>`,u.style.cssText=`
      width: 28px; height: 28px;
      display: inline-flex; align-items: center; justify-content: center;
      border: none; background: transparent;
      color: rgba(255, 255, 255, 0.7);
      border-radius: 6px; cursor: pointer; padding: 0;
    `,u.addEventListener("mouseenter",()=>{u.style.background="rgba(255,255,255,0.1)"}),u.addEventListener("mouseleave",()=>{u.style.background="transparent"}),g.appendChild(d),g.appendChild(u);let m=document.createElement("div");m.style.cssText=`
      flex: 1 1 auto;
      min-height: 0;
      max-height: 64vh;
      overflow: auto;
      background: rgba(0, 0, 0, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    `;let v=document.createElement("div");v.textContent="Loading\u2026",v.style.cssText="padding: 24px; color: rgba(255,255,255,0.6);",m.appendChild(v);let x=document.createElement("div");x.style.cssText="display: flex; gap: 8px; flex-wrap: wrap;";let C=(e,a,S)=>{let b=document.createElement("button");return b.textContent=e,b.style.cssText=`
        flex: 1 1 auto;
        min-width: 0;
        padding: 9px 12px;
        border-radius: 8px;
        border: 1px solid ${a?"transparent":"rgba(255, 255, 255, 0.12)"};
        background: ${a?"rgba(10, 132, 255, 1)":"rgba(255, 255, 255, 0.06)"};
        color: ${a?"white":"rgba(255, 255, 255, 0.95)"};
        font: 500 13px/1 -apple-system, BlinkMacSystemFont, sans-serif;
        cursor: pointer;
        transition: background 0.15s ease;
      `,b.addEventListener("mouseenter",()=>{b.style.background=a?"rgba(10, 132, 255, 0.85)":"rgba(255, 255, 255, 0.12)"}),b.addEventListener("mouseleave",()=>{b.style.background=a?"rgba(10, 132, 255, 1)":"rgba(255, 255, 255, 0.06)"}),b.addEventListener("click",F=>{F.stopPropagation(),S()}),b},y=null,o=C("Copy",!0,async()=>{if(y)try{let e=await U(y);await navigator.clipboard.write([new ClipboardItem({"image/png":e})]),E("Copied")}catch{E("Copy failed")}}),n=C("Download",!1,()=>{if(!y)return;let e=document.createElement("a");e.href=y;let a=L(t.pageUrl)||"screenshot",S=new Date(t.createdAt).toISOString().replace(/[:.]/g,"-").slice(0,19);e.download=`${a}-${S}.png`,document.body.appendChild(e),e.click(),e.remove()}),l=C("Open page",!1,()=>{t.pageUrl&&window.open(t.pageUrl,"_blank","noopener")}),h=C("Delete",!1,async()=>{if(confirm("Delete this screenshot from history?"))try{let e=await chrome.runtime.sendMessage({type:"deleteScreenshot",id:t.id});if(!e||!e.ok)throw new Error(e&&!e.ok?e.error:"no response");E("Deleted"),f(),await r()}catch(e){E("Delete failed: "+(e instanceof Error?e.message:String(e)))}});h.style.color="rgba(255, 120, 120, 0.95)",h.style.borderColor="rgba(255, 80, 80, 0.3)",x.appendChild(o),x.appendChild(n),t.pageUrl&&x.appendChild(l),x.appendChild(h),c.appendChild(g),c.appendChild(m),c.appendChild(x),i.appendChild(c),document.documentElement.appendChild(i);let w=!1,f=()=>{w||(w=!0,i.style.opacity="0",c.style.transform="scale(0.96)",setTimeout(()=>i.remove(),200),document.removeEventListener("keydown",k,!0))},k=e=>{e.key==="Escape"&&(e.stopPropagation(),e.preventDefault(),f())};document.addEventListener("keydown",k,!0),u.addEventListener("click",f),i.addEventListener("click",e=>{e.target===i&&f()}),requestAnimationFrame(()=>{i.style.opacity="1",c.style.transform="scale(1)"});try{let e=await chrome.runtime.sendMessage({type:"getScreenshot",id:t.id});if(!e||!e.ok)throw new Error(e&&!e.ok?e.error:"no response");y=e.dataUrl,m.replaceChildren();let a=document.createElement("img");a.src=e.dataUrl,a.style.cssText=`display: block; max-width: 100%; height: auto; ${t.kind==="fullpage"?"":"max-height: 64vh; object-fit: contain;"}`,m.appendChild(a)}catch(e){m.replaceChildren();let a=document.createElement("div");a.style.cssText="padding: 24px; color: rgba(255,120,120,0.85);",a.textContent="Failed to load: "+(e instanceof Error?e.message:String(e)),m.appendChild(a)}};window.__dsdHistory={open:$,isOpen:()=>T}})();})();
