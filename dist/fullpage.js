"use strict";(()=>{(()=>{let M=t=>new Promise(e=>setTimeout(e,t)),L=()=>new Promise(t=>requestAnimationFrame(()=>requestAnimationFrame(()=>t()))),B=async()=>{let t={type:"captureVisibleTab"},e=await chrome.runtime.sendMessage(t);if(!e||e.error||!e.dataUrl)throw new Error(e?.error??"capture failed");return e.dataUrl},F=t=>new Promise((e,o)=>{let n=new Image;n.onload=()=>e(n),n.onerror=()=>o(new Error("image load failed")),n.src=t}),H=()=>{let t=document.createElement("div");t.dataset.dsdInternal="1",t.style.cssText=`
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 2147483647;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px 10px 12px;
      background: rgba(20, 20, 22, 0.88);
      backdrop-filter: blur(20px) saturate(160%);
      -webkit-backdrop-filter: blur(20px) saturate(160%);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      color: rgba(255, 255, 255, 0.95);
      font: 500 13px/1.2 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
      pointer-events: auto;
      opacity: 0;
      transform: translateY(8px);
      transition: opacity 0.2s ease, transform 0.2s ease;
    `,t.innerHTML=`
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0">
        <circle cx="8" cy="8" r="6.5" stroke="rgba(255,255,255,0.7)" stroke-width="1.5" fill="none" stroke-dasharray="6 4">
          <animateTransform attributeName="transform" type="rotate" from="0 8 8" to="360 8 8" dur="1s" repeatCount="indefinite"/>
        </circle>
      </svg>
      <span data-role="msg" style="font-variant-numeric: tabular-nums;">Preparing\u2026</span>
      <button data-role="cancel" style="
        margin-left: 4px;
        padding: 4px 10px;
        border: 1px solid rgba(255,255,255,0.18);
        border-radius: 6px;
        background: rgba(255,255,255,0.06);
        color: rgba(255,255,255,0.9);
        font: 500 12px/1 -apple-system, BlinkMacSystemFont, sans-serif;
        cursor: pointer;
      ">Cancel</button>
    `,document.documentElement.appendChild(t),requestAnimationFrame(()=>{t.style.opacity="1",t.style.transform="translateY(0)"});let e=t.querySelector('[data-role="msg"]'),o=t.querySelector('[data-role="cancel"]'),n=null;return o.addEventListener("click",()=>{o.disabled=!0,o.style.opacity="0.5",e.textContent="Cancelling\u2026",n?.()}),{update:(a,m)=>{e.textContent=`Capturing tile ${a}/${m}\u2026`},setMessage:a=>{e.textContent=a},onCancel:a=>{n=a},close:()=>{t.style.opacity="0",t.style.transform="translateY(8px)",setTimeout(()=>t.remove(),220)}}},f=t=>{let e=document.createElement("div");e.dataset.dsdInternal="1",e.style.cssText=`
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
    `,e.textContent=t,document.documentElement.appendChild(e),requestAnimationFrame(()=>{e.style.opacity="1",e.style.transform="translate(-50%, 0)"}),setTimeout(()=>{e.style.opacity="0",e.style.transform="translate(-50%, -12px)",setTimeout(()=>e.remove(),220)},2400)},I=()=>{let t=[];return document.querySelectorAll("body *").forEach(e=>{if(e.dataset.dsdInternal==="1")return;let o=getComputedStyle(e);(o.position==="fixed"||o.position==="sticky")&&t.push({el:e,visibility:e.style.visibility})}),t},R=async(t={})=>{let e=window.devicePixelRatio||1,o=window.scrollX,n=window.scrollY,a=document.documentElement,m=a.style.scrollBehavior,w=document.body.style.scrollBehavior;a.style.scrollBehavior="auto",document.body.style.scrollBehavior="auto";let k=I(),c=()=>{for(let{el:u,visibility:g}of k)u.style.visibility=g;a.style.scrollBehavior=m,document.body.style.scrollBehavior=w,window.scrollTo(o,n)};try{window.scrollTo(0,0),await L();let u=Math.max(a.scrollHeight,document.body.scrollHeight,a.offsetHeight,document.body.offsetHeight,a.clientHeight),g=window.innerHeight,h=window.innerWidth,C=Math.floor(16384/e),y=Math.min(u,C),E=u>y,s=[],b=0;for(;b<y;){let i=Math.min(b,Math.max(0,y-g));if(s.length>0&&s[s.length-1].y===i)break;s.push({y:i}),b+=g}s.length===0&&s.push({y:0});let d=document.createElement("canvas");d.width=Math.round(h*e),d.height=Math.round(y*e);let r=d.getContext("2d");if(!r)throw new Error("2d context unavailable");for(let i=0;i<s.length;i++){if(t.isCancelled?.())throw new Error("cancelled");let l=s[i];if(window.scrollTo(0,l.y),i>0)for(let{el:O}of k)O.style.visibility="hidden";await L(),await M(160);let x=await B(),T=await F(x),P=Math.round(l.y*e),S=Math.min(T.height,d.height-P);S>0&&r.drawImage(T,0,0,T.width,S,0,P,d.width,S),t.onProgress?.(i+1,s.length),i<s.length-1&&await M(550)}return{blob:await new Promise((i,l)=>{d.toBlob(x=>x?i(x):l(new Error("toBlob returned null")),"image/png")}),width:d.width,height:d.height,tiles:s.length,truncated:E}}finally{c()}},U=t=>{let e=URL.createObjectURL(t.blob),o=document.createElement("div");o.dataset.dsdInternal="1",o.style.cssText=`
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
    `;let n=document.createElement("div");n.style.cssText=`
      width: min(94vw, 720px);
      max-height: 90vh;
      margin: 16px;
      padding: 16px;
      background: rgba(28, 28, 30, 0.95);
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
    `;let a=document.createElement("div");a.style.cssText="display: flex; align-items: center; justify-content: space-between; gap: 12px;";let m=document.createElement("div");m.style.cssText="font: 600 15px/1.3 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;";let w=Math.round(t.blob.size/1024),k=w>1024?`${(w/1024).toFixed(1)} MB`:`${w} KB`;m.textContent=`Full page \u2014 ${t.width}\xD7${t.height} \xB7 ${k}`;let c=document.createElement("button");c.innerHTML=`
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
        <line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/>
      </svg>`,c.style.cssText=`
      width: 28px; height: 28px;
      display: inline-flex; align-items: center; justify-content: center;
      border: none; background: transparent;
      color: rgba(255, 255, 255, 0.7);
      border-radius: 6px; cursor: pointer; padding: 0;
      transition: background 0.15s ease, color 0.15s ease;
    `,c.addEventListener("mouseenter",()=>{c.style.background="rgba(255, 255, 255, 0.1)",c.style.color="rgba(255, 255, 255, 1)"}),c.addEventListener("mouseleave",()=>{c.style.background="transparent",c.style.color="rgba(255, 255, 255, 0.7)"}),a.appendChild(m),a.appendChild(c);let u=document.createElement("div");u.style.cssText=`
      flex: 1 1 auto;
      min-height: 0;
      max-height: 60vh;
      overflow: auto;
      background: rgba(0, 0, 0, 0.35);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 8px;
    `;let g=document.createElement("img");if(g.src=e,g.style.cssText="display: block; width: 100%; height: auto;",u.appendChild(g),t.truncated){let r=document.createElement("div");r.textContent="The page was clipped to the maximum canvas size (16k px).",r.style.cssText="font-size: 12px; color: rgba(255, 200, 0, 0.85);",n.appendChild(r)}let h=document.createElement("div");h.style.cssText="display: flex; gap: 8px; flex-wrap: wrap;";let C=(r,p,i)=>{let l=document.createElement("button");return l.textContent=r,l.style.cssText=`
        flex: 1 1 auto;
        min-width: 0;
        padding: 9px 14px;
        border-radius: 8px;
        border: 1px solid ${p?"transparent":"rgba(255, 255, 255, 0.12)"};
        background: ${p?"rgba(10, 132, 255, 1)":"rgba(255, 255, 255, 0.06)"};
        color: ${p?"white":"rgba(255, 255, 255, 0.95)"};
        font: 500 13px/1 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        cursor: pointer;
        transition: background 0.15s ease;
      `,l.addEventListener("mouseenter",()=>{l.style.background=p?"rgba(10, 132, 255, 0.85)":"rgba(255, 255, 255, 0.12)"}),l.addEventListener("mouseleave",()=>{l.style.background=p?"rgba(10, 132, 255, 1)":"rgba(255, 255, 255, 0.06)"}),l.addEventListener("click",x=>{x.stopPropagation(),i()}),l},y=C("Copy",!0,async()=>{try{await navigator.clipboard.write([new ClipboardItem({"image/png":t.blob})]),f("Screenshot copied")}catch{f("Copy failed")}}),E=C("Download",!1,()=>{let r=document.createElement("a");r.href=e;let p="page";try{p=new URL(location.href).hostname||"page"}catch{}r.download=`fullpage-${p}-${Date.now()}.png`,document.body.appendChild(r),r.click(),r.remove()});h.appendChild(y),h.appendChild(E),n.appendChild(a),n.appendChild(u),n.appendChild(h),o.appendChild(n),document.documentElement.appendChild(o);let s=!1,b=()=>{s||(s=!0,o.style.opacity="0",n.style.transform="scale(0.96)",setTimeout(()=>{o.remove(),URL.revokeObjectURL(e)},200),document.removeEventListener("keydown",d,!0))},d=r=>{r.key==="Escape"&&(r.stopPropagation(),r.preventDefault(),b())};document.addEventListener("keydown",d,!0),c.addEventListener("click",b),o.addEventListener("click",r=>{r.target===o&&b()}),requestAnimationFrame(()=>{o.style.opacity="1",n.style.transform="scale(1)"})},_=t=>new Promise((e,o)=>{let n=new FileReader;n.onload=()=>e(n.result),n.onerror=()=>o(n.error??new Error("blob read failed")),n.readAsDataURL(t)}),A=async t=>{try{let e=await _(t.blob);await chrome.runtime.sendMessage({type:"saveScreenshot",dataUrl:e,pageUrl:location.href,pageTitle:document.title||location.hostname,kind:"fullpage",width:t.width,height:t.height})}catch{}},v=!1,$=async()=>{if(v){f("Capture already running");return}v=!0;let t=!1,e=H();e.onCancel(()=>{t=!0});try{let o=await R({onProgress:(n,a)=>e.update(n,a),isCancelled:()=>t});e.close(),A(o),U(o)}catch(o){e.close(),t||o instanceof Error&&o.message==="cancelled"?f("Capture cancelled"):f("Capture failed: "+(o instanceof Error?o.message:String(o)))}finally{v=!1}};window.__dsdFullPage={run:$,isInFlight:()=>v}})();})();
