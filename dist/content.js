"use strict";(()=>{(()=>{let ie="qrStripTracking",N=window.qrcode;if(N){let e=N.stringToBytesFuncs["UTF-8"];e&&(N.stringToBytes=e)}let q=!1,f=document.createElement("div");f.style.cssText=`
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 2147483647;
  `,document.documentElement.appendChild(f);let ee=0,te=0,w=null,W=null,S=null,A=!1,R=null,ne=null,O=window.__dsdAnnotations,X=null,pe=window.__dsdFullPage,ue=window.__dsdHistory,me=window.__dsdElementPicker,ae=!1,Z=null,Te=e=>new Promise((t,o)=>{let n=new FileReader;n.onload=()=>t(n.result),n.onerror=()=>o(n.error??new Error("blob read failed")),n.readAsDataURL(e)}),Ce=async(e,t,o,n)=>{try{let r=await Te(e);await chrome.runtime.sendMessage({type:"saveScreenshot",dataUrl:r,pageUrl:location.href,pageTitle:document.title||location.hostname,kind:t,width:o,height:n})}catch{}},ge=(e,t)=>{if(ae)return;ae=!0;let o=window.devicePixelRatio||1,n=t.getBoundingClientRect(),r=Math.round(n.width*o),s=Math.round(n.height*o);Ce(e,"region",r,s)},Me=()=>{if(pe){if(document.body.style.transform!==""){E("Close the zoom first (Esc)");return}pe.run()}},Se=async()=>{let e=window.EyeDropper;if(!e){E("Color picker is not supported in this browser");return}try{let o=(await new e().open()).sRGBHex;try{await navigator.clipboard.writeText(o),E(`${o} copied`)}catch{E(o)}}catch{}};chrome.runtime.onMessage.addListener(e=>{let t=typeof e=="object"&&e!==null?e.type:void 0;t==="startFullPageCapture"?Me():t==="openHistory"?ue&&ue.open():t==="startColorPicker"&&Se()});let Ae=(e,t)=>{let o=document.createElement("div");o.style.cssText=`
      position: fixed;
      left: ${e}px;
      top: ${t}px;
      width: 0px;
      height: 0px;
      border: 1.5px solid rgba(255, 255, 255, 0.95);
      border-radius: 6px;
      background: transparent;
      box-sizing: border-box;
      box-shadow:
        0 0 0 1px rgba(0, 0, 0, 0.5),
        inset 0 0 0 1px rgba(0, 0, 0, 0.25),
        0 0 0 100vmax rgba(0, 0, 0, 0.55);
    `;let n=document.createElement("div");return n.dataset.role="size-badge",n.style.cssText=`
      position: absolute;
      top: -28px;
      left: 0;
      padding: 3px 8px;
      background: rgba(20, 20, 22, 0.85);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 6px;
      color: rgba(255, 255, 255, 0.95);
      font: 500 11px/1 ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
      font-variant-numeric: tabular-nums;
      letter-spacing: 0.02em;
      white-space: nowrap;
      pointer-events: none;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      opacity: 0;
      transition: opacity 0.12s ease;
    `,o.appendChild(n),f.appendChild(o),o},He=(e,t)=>{if(!w)return;let o=Math.min(ee,e),n=Math.min(te,t),r=Math.abs(e-ee),s=Math.abs(t-te);w.style.left=`${o}px`,w.style.top=`${n}px`,w.style.width=`${r}px`,w.style.height=`${s}px`;let i=w.querySelector('[data-role="size-badge"]');i&&(i.textContent=`${Math.round(r)} \xD7 ${Math.round(s)}`,i.style.opacity=r>8&&s>8?"1":"0",i.style.top=n<32?"6px":"-28px",i.style.left=n<32?"6px":"0")},G=()=>{if(Z=null,ne&&(ne(),ne=null),X&&(X.destroy(),X=null),f.replaceChildren(),f.style.pointerEvents="none",!document.body.style.transform){he();return}document.body.style.transition="transform 0.4s ease",document.body.style.transform="translate(0px, 0px) scale(1)";let e=!1,t=()=>{e||(e=!0,document.body.removeEventListener("transitionend",t),he())};document.body.addEventListener("transitionend",t),setTimeout(t,500)},oe=e=>e.preventDefault(),ye=e=>{["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","PageUp","PageDown","Home","End"," "].includes(e.key)&&e.preventDefault()},re=[],Re=()=>{re=[],document.querySelectorAll("*").forEach(e=>{if(f.contains(e)||e===f)return;let t=getComputedStyle(e),o=/(auto|scroll|overlay)/.test(t.overflowY)&&e.scrollHeight>e.clientHeight,n=/(auto|scroll|overlay)/.test(t.overflowX)&&e.scrollWidth>e.clientWidth;(o||n)&&(re.push({el:e,overflowY:e.style.overflowY,overflowX:e.style.overflowX,scrollTop:e.scrollTop,scrollLeft:e.scrollLeft}),e.style.overflowY="hidden",e.style.overflowX="hidden")})},Pe=()=>{re.forEach(({el:e,overflowY:t,overflowX:o,scrollTop:n,scrollLeft:r})=>{e.style.overflowY=t,e.style.overflowX=o,e.scrollTop=n,e.scrollLeft=r}),re=[]},he=()=>{document.body.style.transform="",document.body.style.transformOrigin="",document.body.style.transition="",document.documentElement.style.overflow="",document.body.style.overflow="",window.removeEventListener("wheel",oe,!0),window.removeEventListener("touchmove",oe,!0),window.removeEventListener("keydown",ye,!0),Pe()},P=(e,t,o)=>{let n=document.createElement("button");return n.innerHTML=e,n.setAttribute("aria-label",t),n.dataset.tooltip=t,n.style.cssText=`
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border: none;
      border-radius: 8px;
      background: transparent;
      color: rgba(255, 255, 255, 0.85);
      cursor: pointer;
      padding: 0;
      line-height: 0;
      transition: background 0.15s ease, color 0.15s ease, transform 0.15s ease;
    `,n.addEventListener("mouseenter",()=>{n.style.background="rgba(255, 255, 255, 0.12)",n.style.color="rgba(255, 255, 255, 1)"}),n.addEventListener("mouseleave",()=>{n.style.background="transparent",n.style.color="rgba(255, 255, 255, 0.85)"}),n.addEventListener("mousedown",()=>{n.style.transform="scale(0.92)"}),n.addEventListener("mouseup",()=>{n.style.transform="scale(1)"}),n.addEventListener("click",r=>{r.stopPropagation(),o()}),n},be=async(e,t)=>{f.style.visibility="hidden",await new Promise(a=>requestAnimationFrame(()=>requestAnimationFrame(()=>a())));let o;try{let a={type:"captureVisibleTab"},l=await chrome.runtime.sendMessage(a);if(!l||l.error||!l.dataUrl)throw new Error(l?.error??"capture failed");o=l.dataUrl}finally{f.style.visibility=""}let n=await new Promise((a,l)=>{let d=new Image;d.onload=()=>a(d),d.onerror=l,d.src=o}),r=window.devicePixelRatio||1,s=document.createElement("canvas");s.width=Math.round(e.width*r),s.height=Math.round(e.height*r);let i=s.getContext("2d");if(!i)throw new Error("2d context unavailable");return i.drawImage(n,Math.round(e.left*r),Math.round(e.top*r),Math.round(e.width*r),Math.round(e.height*r),0,0,s.width,s.height),t&&t.length&&O&&O.render(i,t,r),await new Promise((a,l)=>{s.toBlob(d=>{d?a(d):l(new Error("toBlob returned null"))},"image/png")})},E=(e,t)=>{let o=document.createElement("div");o.style.cssText=`
      position: fixed;
      top: 32px;
      left: 50%;
      transform: translate(-50%, -12px);
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(20, 20, 22, 0.78);
      backdrop-filter: blur(20px) saturate(160%);
      -webkit-backdrop-filter: blur(20px) saturate(160%);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: rgba(255, 255, 255, 0.95);
      padding: 10px 16px 10px 12px;
      border-radius: 12px;
      font: 500 13px/1.2 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35), 0 1px 0 rgba(255, 255, 255, 0.05) inset;
      z-index: 2147483647;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s ease, transform 0.2s ease;
      max-width: min(80vw, 520px);
    `;let n=t?.sticky===!0,r=n?`<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0">
           <circle cx="8" cy="8" r="6.5" stroke="rgba(255,255,255,0.7)" stroke-width="1.5" fill="none" stroke-dasharray="6 4">
             <animateTransform attributeName="transform" type="rotate" from="0 8 8" to="360 8 8" dur="1s" repeatCount="indefinite"/>
           </circle>
         </svg>`:`<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0">
           <circle cx="8" cy="8" r="7" fill="rgba(52, 199, 89, 0.95)"/>
           <path d="M5 8L7 10L11 6" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
         </svg>`;o.innerHTML=`${r}<span></span>`,o.querySelector("span").textContent=e,document.documentElement.appendChild(o),requestAnimationFrame(()=>{o.style.opacity="1",o.style.transform="translate(-50%, 0)"});let s=!1,i=()=>{s||(s=!0,o.style.opacity="0",o.style.transform="translate(-50%, -12px)",setTimeout(()=>o.remove(),250))};return n||setTimeout(i,2200),{dismiss:i}},Be=async e=>{try{let t=await be(e.getBoundingClientRect(),X?.getAnnotations());await navigator.clipboard.write([new ClipboardItem({"image/png":t})]),E("Screenshot copied to clipboard"),ge(t,e)}catch(t){alert("Copy failed: "+(t instanceof Error?t.message:String(t)))}},De=async e=>{let t;try{t=await be(e.getBoundingClientRect(),X?.getAnnotations())}catch(s){alert("Failed to take screenshot: "+(s instanceof Error?s.message:String(s)));return}ge(t,e);let o=new File([t],`screenshot-${Date.now()}.png`,{type:"image/png"});if(navigator.canShare&&navigator.canShare({files:[o]}))try{await navigator.share({files:[o],title:"Screenshot"});return}catch(s){if(s instanceof Error&&s.name==="AbortError")return}let n=URL.createObjectURL(t),r=document.createElement("a");r.href=n,r.download=o.name,document.body.appendChild(r),r.click(),r.remove(),URL.revokeObjectURL(n)},Ie=["fbclid","gclid","mc_eid","igshid","yclid","msclkid","dclid","_ga","ref","ref_src","ref_url","vero_id","_hsenc","_hsmi"],fe=e=>{try{let t=new URL(e);for(let o of[...t.searchParams.keys()])(o.startsWith("utm_")||Ie.includes(o))&&t.searchParams.delete(o);return t.toString()}catch{return e}},Fe=(e,t,o,n=4)=>{let r=t.getModuleCount(),s=r+2*n;e.width=s*o,e.height=s*o;let i=e.getContext("2d");if(i){i.fillStyle="#ffffff",i.fillRect(0,0,e.width,e.height),i.fillStyle="#000000";for(let a=0;a<r;a++)for(let l=0;l<r;l++)t.isDark(a,l)&&i.fillRect((l+n)*o,(a+n)*o,o,o)}},Ue=async()=>{try{return(await chrome.storage.local.get(ie))[ie]===!0}catch{return!1}},$e=async e=>{try{await chrome.storage.local.set({[ie]:e})}catch{}},we=async()=>{if(q)return;if(!N){E("QR encoder unavailable");return}let e=location.href,t=await Ue();q=!0;let o=document.createElement("div");o.style.cssText=`
      position: fixed;
      inset: 0;
      z-index: 2147483647;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.55);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      opacity: 0;
      transition: opacity 0.18s ease;
      pointer-events: auto;
    `;let n=document.createElement("div");n.style.cssText=`
      width: min(92vw, 360px);
      margin: 16px;
      padding: 20px;
      background: rgba(28, 28, 30, 0.95);
      backdrop-filter: blur(24px) saturate(180%);
      -webkit-backdrop-filter: blur(24px) saturate(180%);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 14px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.06);
      color: rgba(255, 255, 255, 0.95);
      font: 400 14px/1.45 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      transform: scale(0.96);
      transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      flex-direction: column;
      gap: 14px;
    `;let r=document.createElement("div");r.style.cssText="display: flex; align-items: center; justify-content: space-between;";let s=document.createElement("div");s.textContent="Page QR code",s.style.cssText="font: 600 16px/1.3 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;";let i=document.createElement("button");i.innerHTML=`
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
        <line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/>
      </svg>`,i.style.cssText=`
      width: 28px; height: 28px;
      display: inline-flex; align-items: center; justify-content: center;
      border: none; background: transparent;
      color: rgba(255, 255, 255, 0.7);
      border-radius: 6px; cursor: pointer; padding: 0;
      transition: background 0.15s ease, color 0.15s ease;
    `,i.addEventListener("mouseenter",()=>{i.style.background="rgba(255, 255, 255, 0.1)",i.style.color="rgba(255, 255, 255, 1)"}),i.addEventListener("mouseleave",()=>{i.style.background="transparent",i.style.color="rgba(255, 255, 255, 0.7)"}),r.appendChild(s),r.appendChild(i);let a=document.createElement("canvas");a.style.cssText=`
      display: block;
      width: 100%;
      max-width: 280px;
      margin: 0 auto;
      image-rendering: pixelated;
      border-radius: 8px;
      background: white;
    `;let l=document.createElement("div");l.style.cssText=`
      padding: 8px 10px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 8px;
      font: 400 12px/1.4 ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
      color: rgba(255, 255, 255, 0.85);
      word-break: break-all;
      max-height: 4.6em;
      overflow: auto;
    `;let d=document.createElement("label");d.style.cssText=`
      display: flex; align-items: center; gap: 8px;
      cursor: pointer; user-select: none;
      font-size: 13px; color: rgba(255, 255, 255, 0.75);
    `;let u=document.createElement("input");u.type="checkbox",u.checked=t,u.style.cssText="accent-color: rgba(10, 132, 255, 1); cursor: pointer;";let T=document.createElement("span");T.textContent="Strip tracking parameters",d.appendChild(u),d.appendChild(T);let b=document.createElement("div");b.style.cssText="display: flex; gap: 8px; flex-wrap: wrap;";let C=(p,m=!1)=>{let v=document.createElement("button");return v.textContent=p,v.style.cssText=`
        flex: 1 1 auto;
        min-width: 0;
        padding: 9px 12px;
        border-radius: 8px;
        border: 1px solid ${m?"transparent":"rgba(255, 255, 255, 0.12)"};
        background: ${m?"rgba(10, 132, 255, 1)":"rgba(255, 255, 255, 0.06)"};
        color: ${m?"white":"rgba(255, 255, 255, 0.95)"};
        font: 500 13px/1 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        cursor: pointer;
        transition: background 0.15s ease;
      `,v.addEventListener("mouseenter",()=>{v.style.background=m?"rgba(10, 132, 255, 0.85)":"rgba(255, 255, 255, 0.12)"}),v.addEventListener("mouseleave",()=>{v.style.background=m?"rgba(10, 132, 255, 1)":"rgba(255, 255, 255, 0.06)"}),v},I=C("Copy PNG",!0),J=C("Download"),y=C("Copy URL");b.appendChild(I),b.appendChild(J),b.appendChild(y),n.appendChild(r),n.appendChild(a),n.appendChild(l),n.appendChild(d),n.appendChild(b),o.appendChild(n),document.documentElement.appendChild(o);let B=t?fe(e):e,$=()=>{B=u.checked?fe(e):e,l.textContent=B;try{let p=N(0,"M");p.addData(B,"Byte"),p.make();let m=280,v=p.getModuleCount()+8,F=Math.max(2,Math.floor(m*(window.devicePixelRatio||1)/v));Fe(a,p,F)}catch{let m=a.getContext("2d");m&&(a.width=280,a.height=280,m.fillStyle="#ffffff",m.fillRect(0,0,a.width,a.height),m.fillStyle="#cc0000",m.font="14px sans-serif",m.textAlign="center",m.fillText("URL is too long",a.width/2,a.height/2))}};if($(),/^(chrome|chrome-extension|about|file):/i.test(e)){let p=document.createElement("div");p.textContent="This URL only works in the same browser or device.",p.style.cssText=`
        font-size: 12px;
        color: rgba(255, 200, 0, 0.85);
        margin-top: -6px;
      `,n.insertBefore(p,d)}u.addEventListener("change",()=>{$e(u.checked),$()});let K=!1,_=()=>{K||(K=!0,o.style.opacity="0",n.style.transform="scale(0.96)",setTimeout(()=>o.remove(),180),document.removeEventListener("keydown",L,!0),q=!1)},L=p=>{p.key==="Escape"&&(p.stopPropagation(),p.preventDefault(),_())};document.addEventListener("keydown",L,!0),i.addEventListener("click",_),o.addEventListener("click",p=>{p.target===o&&_()}),I.addEventListener("click",()=>{a.toBlob(async p=>{if(!p){E("Failed to create image");return}try{await navigator.clipboard.write([new ClipboardItem({"image/png":p})]),E("QR copied to clipboard")}catch{E("Copy failed")}},"image/png")}),J.addEventListener("click",()=>{a.toBlob(p=>{if(!p)return;let m=URL.createObjectURL(p),v="page";try{v=new URL(B).hostname||"page"}catch{}let F=document.createElement("a");F.href=m,F.download=`qr-${v}.png`,document.body.appendChild(F),F.click(),F.remove(),URL.revokeObjectURL(m)},"image/png")}),y.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(B),E("URL copied")}catch{E("URL copy failed")}}),requestAnimationFrame(()=>{o.style.opacity="1",n.style.transform="scale(1)"})},le=e=>e.toString(16).padStart(2,"0").toUpperCase(),ve=async e=>{if(!e.isConnected)return;let t=e.getBoundingClientRect();if(t.width<1||t.height<1)return;f.style.visibility="hidden";let o;try{await new Promise(d=>requestAnimationFrame(()=>requestAnimationFrame(()=>d())));let a={type:"captureVisibleTab"},l=await chrome.runtime.sendMessage(a);if(!l||l.error||!l.dataUrl)return;o=l.dataUrl}finally{f.style.visibility=""}let n=await new Promise((a,l)=>{let d=new Image;d.onload=()=>a(d),d.onerror=l,d.src=o}),r=window.devicePixelRatio||1,s=document.createElement("canvas");s.width=Math.max(1,Math.round(t.width*r)),s.height=Math.max(1,Math.round(t.height*r));let i=s.getContext("2d",{willReadFrequently:!0});i&&(i.drawImage(n,Math.round(t.left*r),Math.round(t.top*r),Math.round(t.width*r),Math.round(t.height*r),0,0,s.width,s.height),S=i.getImageData(0,0,s.width,s.height))},Ke=e=>{if(R&&R.parentElement===e)return R;let t=document.createElement("div");return t.dataset.role="picker-swatch",t.style.cssText=`
      position: absolute;
      left: 0;
      top: 0;
      pointer-events: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 8px 4px 4px;
      background: rgba(20, 20, 22, 0.92);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 8px;
      color: rgba(255, 255, 255, 0.95);
      font: 600 11px/1 ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
      z-index: 10;
      opacity: 0;
      transition: opacity 0.1s ease;
      will-change: transform;
    `,t.innerHTML=`
      <span data-role="swatch" style="width:16px;height:16px;border-radius:4px;border:1px solid rgba(255,255,255,0.25);background:#000;flex-shrink:0"></span>
      <span data-role="hex">#000000</span>
    `,e.appendChild(t),R=t,t},V=()=>{R&&(R.style.opacity="0")},xe=(e,t,o)=>{if(!S)return null;let n=e.getBoundingClientRect(),r=t-n.left,s=o-n.top;if(r<0||s<0||r>n.width||s>n.height)return null;let i=window.devicePixelRatio||1,a=Math.min(S.width-1,Math.max(0,Math.floor(r*i))),d=(Math.min(S.height-1,Math.max(0,Math.floor(s*i)))*S.width+a)*4,u=S.data;return`#${le(u[d])}${le(u[d+1])}${le(u[d+2])}`},_e=(e,t,o)=>{let n=xe(e,t,o);if(!n){V();return}let r=e.getBoundingClientRect(),s=t-r.left,i=o-r.top,a=Ke(e),l=96,d=28,u=s+16,T=i+16;u+l>r.width&&(u=s-l-8),T+d>r.height&&(T=i-d-8),u<0&&(u=4),T<0&&(T=4),a.style.transform=`translate(${u}px, ${T}px)`,a.style.opacity="1";let b=a.querySelector('[data-role="swatch"]'),C=a.querySelector('[data-role="hex"]');b&&(b.style.background=n),C&&(C.textContent=n)},ze=async(e,t,o)=>{let n=xe(e,t,o);if(n)try{await navigator.clipboard.writeText(n),E(`${n} copied`)}catch{E("Color copy failed")}},je=(e,t)=>{let o=document.createElement("div");o.style.cssText=`
      position: absolute;
      left: 50%;
      top: 100%;
      transform: translate(-50%, 10px);
      transform-origin: top center;
      pointer-events: auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 4px;
      background: rgba(20, 20, 22, 0.75);
      backdrop-filter: blur(24px) saturate(180%);
      -webkit-backdrop-filter: blur(24px) saturate(180%);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      box-shadow:
        0 12px 40px rgba(0, 0, 0, 0.4),
        0 2px 8px rgba(0, 0, 0, 0.25),
        inset 0 1px 0 rgba(255, 255, 255, 0.06);
      opacity: 0;
      transition: opacity 0.18s ease, transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
    `;let n=document.createElement("div");n.style.cssText="display: flex; align-items: center; gap: 2px;",o.appendChild(n);let r=()=>{let h=document.createElement("div");return h.style.cssText=`
        width: 1px;
        height: 18px;
        background: rgba(255, 255, 255, 0.1);
        margin: 0 2px;
      `,h},s=`
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
        <rect x="9" y="9" width="13" height="13" rx="2"/>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
      </svg>
    `,i=`
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
        <polyline points="16 6 12 2 8 6"/>
        <line x1="12" y1="2" x2="12" y2="15"/>
      </svg>
    `,a=`
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
        <line x1="14" y1="14" x2="17" y2="14"/>
        <line x1="20" y1="14" x2="20" y2="17"/>
        <line x1="14" y1="17" x2="14" y2="21"/>
        <line x1="17" y1="17" x2="17" y2="20"/>
        <line x1="20" y1="20" x2="21" y2="20"/>
      </svg>
    `,l=`
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
        <path d="m2 22 1-1h3l9-9"/>
        <path d="M3 21v-3l9-9"/>
        <path d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3l.4.4Z"/>
      </svg>
    `,d=`
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
        <polyline points="8 6 2 12 8 18"/>
        <polyline points="16 6 22 12 16 18"/>
        <line x1="14" y1="4" x2="10" y2="20"/>
      </svg>
    `,u=`
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
        <line x1="6" y1="6" x2="18" y2="18"/>
        <line x1="18" y1="6" x2="6" y2="18"/>
      </svg>
    `,T=`
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
        <line x1="12" y1="5" x2="12" y2="19"/>
        <line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
    `,b=e.getBoundingClientRect(),C=b.width/t,I=b.height/t,J=C>=10&&I>=10;n.appendChild(P(s,"Copy (\u2318C)",()=>Be(e))),n.appendChild(P(i,"Share / download",()=>De(e))),n.appendChild(P(a,"Page QR code (Q)",()=>{we()}));let y=null;J&&(y=P(l,"Color picker (I, Alt+klik)",()=>{v(!A)}),n.appendChild(y)),n.appendChild(P(d,"Copy HTML element",()=>{G(),me&&me.start()})),n.appendChild(r());let B=null,$=!1,K=null,_="",L=null,p=()=>{if(!(!$||!L)&&($=!1,Z=null,document.body.style.transition="transform 0.4s ease",document.body.style.transform=_,e.style.transition="left 0.4s ease, top 0.4s ease, width 0.4s ease, height 0.4s ease, border-color 0.2s ease, box-shadow 0.2s ease",e.style.left=L.left,e.style.top=L.top,e.style.width=L.width,e.style.height=L.height,e.style.border=L.border,e.style.boxShadow=L.boxShadow,e.style.pointerEvents=L.pointerEvents,L=null,o.style.opacity="1",o.style.pointerEvents="auto",K)){let h=K;h.style.opacity="0",setTimeout(()=>h.remove(),200),K=null}},m=()=>{if($)return;$=!0,Z=p,A&&v(!1);let h=1.25,z=t*h,k=window.innerWidth,D=window.innerHeight,Q=parseFloat(e.style.width)||b.width,U=parseFloat(e.style.height)||b.height,j=Q*h,c=U*h;_=document.body.style.transform,L={border:e.style.border,boxShadow:e.style.boxShadow,left:e.style.left,top:e.style.top,width:e.style.width,height:e.style.height,pointerEvents:e.style.pointerEvents},document.body.style.transition="transform 0.4s ease",document.body.style.transform=_.replace(/scale\([^)]+\)/,`scale(${z})`),e.style.transition="left 0.4s ease, top 0.4s ease, width 0.4s ease, height 0.4s ease, border-color 0.2s ease, box-shadow 0.2s ease",e.style.left=`${k/2-j/2}px`,e.style.top=`${D/2-c/2}px`,e.style.width=`${j}px`,e.style.height=`${c}px`,e.style.border="1.5px solid transparent",e.style.boxShadow="none",o.style.opacity="0",o.style.pointerEvents="none";let g=document.createElement("button");g.innerHTML=u,g.setAttribute("aria-label","Back (Esc)"),g.style.cssText=`
        position: fixed;
        top: 16px;
        right: 16px;
        width: 36px;
        height: 36px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 18px;
        background: rgba(20, 20, 22, 0.75);
        backdrop-filter: blur(20px) saturate(180%);
        -webkit-backdrop-filter: blur(20px) saturate(180%);
        color: rgba(255, 255, 255, 0.95);
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        line-height: 0;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.06);
        z-index: 2147483647;
        pointer-events: auto;
        opacity: 0;
        transition: opacity 0.2s ease, background 0.15s ease, transform 0.15s ease;
      `,g.addEventListener("mouseenter",()=>{g.style.background="rgba(40, 40, 44, 0.9)"}),g.addEventListener("mouseleave",()=>{g.style.background="rgba(20, 20, 22, 0.75)"}),g.addEventListener("mousedown",()=>{g.style.transform="scale(0.92)"}),g.addEventListener("mouseup",()=>{g.style.transform="scale(1)"}),g.addEventListener("click",se=>{se.stopPropagation(),p()}),f.appendChild(g),K=g,requestAnimationFrame(()=>{g.style.opacity="1"})};n.appendChild(P(T,"Zoom in further",m)),n.appendChild(P(u,"Close (Esc)",G));let v=h=>{A=h,h?(e.style.cursor="crosshair",y&&(y.style.background="rgba(10, 132, 255, 0.85)",y.style.color="white"),S||E("Loading colors\u2026")):(e.style.cursor="",y&&(y.style.background="transparent",y.style.color="rgba(255, 255, 255, 0.85)"),V())};if(y&&(y.addEventListener("mouseenter",()=>{A&&(y.style.background="rgba(10, 132, 255, 0.95)",y.style.color="white")}),y.addEventListener("mouseleave",()=>{A&&(y.style.background="rgba(10, 132, 255, 0.85)",y.style.color="white")})),J){let h=c=>{if(!(A||c.altKey)){R&&R.style.opacity!=="0"&&V();return}S&&_e(e,c.clientX,c.clientY)},z=()=>V(),k=c=>{(A||c.altKey)&&(c.target?.closest("button")||(c.preventDefault(),c.stopPropagation(),ze(e,c.clientX,c.clientY)))},D=c=>{if(c.key==="Alt"&&S)e.style.cursor="crosshair";else if((c.key==="i"||c.key==="I")&&!c.ctrlKey&&!c.metaKey&&!c.altKey&&!c.shiftKey){let g=document.activeElement?.tagName;if(g==="INPUT"||g==="TEXTAREA")return;c.preventDefault(),v(!A)}},Q=c=>{c.key==="Alt"&&!A&&(e.style.cursor="",V())};e.addEventListener("pointermove",h),e.addEventListener("pointerleave",z),e.addEventListener("click",k,!0),document.addEventListener("keydown",D,!0),document.addEventListener("keyup",Q,!0);let U=c=>{c.target!==document.body||c.propertyName!=="transform"||(document.body.removeEventListener("transitionend",U),ve(e))};document.body.addEventListener("transitionend",U);let j=window.setTimeout(()=>{document.body.removeEventListener("transitionend",U),ve(e)},600);ne=()=>{e.removeEventListener("pointermove",h),e.removeEventListener("pointerleave",z),e.removeEventListener("click",k,!0),document.removeEventListener("keydown",D,!0),document.removeEventListener("keyup",Q,!0),document.body.removeEventListener("transitionend",U),window.clearTimeout(j),S=null,A=!1,R=null}}if(!!O&&C>=16&&I>=16&&O){let h=parseFloat(e.style.width)||b.width,z=parseFloat(e.style.height)||b.height,k=O.mount(e,{cssWidth:h,cssHeight:z});X=k;let D=document.createElement("div");D.style.cssText=`
        display: flex;
        align-items: center;
        gap: 2px;
        padding-top: 4px;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
      `;let Q=`
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 19l7-7 3 3-7 7-3-3z"/>
          <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
          <path d="M2 2l7.586 7.586"/>
          <circle cx="11" cy="11" r="2"/>
        </svg>
      `,U=`
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
          <path d="M10 11v6"/>
          <path d="M14 11v6"/>
          <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>
        </svg>
      `,j=[];B=()=>{let H=k.getTool();for(let{tool:Y,btn:M}of j){let x=Y===H;M.style.background=x?"rgba(10, 132, 255, 0.85)":"transparent",M.style.color=x?"white":"rgba(255, 255, 255, 0.85)"}};let c=(H,Y,M)=>{let x=P(H,Y,()=>{let Ne=k.getTool()===M?"none":M;k.setTool(Ne),B?.()});return x.addEventListener("mouseenter",()=>{k.getTool()===M&&(x.style.background="rgba(10, 132, 255, 0.95)",x.style.color="white")}),x.addEventListener("mouseleave",()=>{k.getTool()===M&&(x.style.background="rgba(10, 132, 255, 0.85)",x.style.color="white")}),j.push({tool:M,btn:x}),x};D.appendChild(c(Q,"Pen (P)","pen"));let g=P(U,"Clear all",()=>{k.clear()});D.appendChild(g),o.appendChild(D);let se=H=>{let Y=document.activeElement?.tagName;if(Y==="INPUT"||Y==="TEXTAREA"||H.metaKey||H.ctrlKey||H.altKey||H.shiftKey)return;let M=H.key.toLowerCase(),x=null;M==="v"?x="none":M==="p"&&(x="pen"),x!==null&&(H.preventDefault(),k.setTool(x),B?.())};document.addEventListener("keydown",se,!0);let Ye=k.destroy;k.destroy=()=>{document.removeEventListener("keydown",se,!0),Ye()}}e.appendChild(o),requestAnimationFrame(()=>{e.getBoundingClientRect().bottom+56>window.innerHeight&&(o.style.top="auto",o.style.bottom="100%",o.style.transformOrigin="bottom center",o.style.transform="translate(-50%, -10px)"),o.style.opacity="1"})},Xe=(e,t,o,n,r)=>{if(n<5||r<5)return;ae=!1;let s=window.innerWidth,i=window.innerHeight,a=document.body.getBoundingClientRect(),l=t+n/2-a.left,d=o+r/2-a.top,u=Math.min(s/n,i/r)*.8,T=s/2-(t+n/2),b=i/2-(o+r/2);document.body.style.transformOrigin=`${l}px ${d}px`,document.body.style.transition="transform 0.4s ease",document.body.style.transform=`translate(${T}px, ${b}px) scale(${u})`,document.documentElement.style.overflow="hidden",document.body.style.overflow="hidden",Re(),window.addEventListener("wheel",oe,{passive:!1,capture:!0}),window.addEventListener("touchmove",oe,{passive:!1,capture:!0}),window.addEventListener("keydown",ye,!0);let C=n*u,I=r*u;e.style.transition="left 0.4s ease, top 0.4s ease, width 0.4s ease, height 0.4s ease",e.style.left=`${s/2-C/2}px`,e.style.top=`${i/2-I/2}px`,e.style.width=`${C}px`,e.style.height=`${I}px`,e.style.pointerEvents="auto",f.style.pointerEvents="auto",je(e,u)};f.addEventListener("click",e=>{e.target===f&&G()});let ke=e=>{if(window.removeEventListener("scroll",Ee,!0),e&&w){let t=w.getBoundingClientRect(),o=w.querySelector('[data-role="size-badge"]');o&&o.remove(),Xe(w,t.left,t.top,t.width,t.height)}w=null,W=null},de=0,ce=0,Ee=()=>{w&&(window.scrollX!==de||window.scrollY!==ce)&&window.scrollTo(de,ce)};document.addEventListener("pointerdown",e=>{if(!(e.button!==0||!e.shiftKey)){G(),de=window.scrollX,ce=window.scrollY,window.addEventListener("scroll",Ee,!0),ee=e.clientX,te=e.clientY,w=Ae(ee,te),W=e.pointerId;try{e.target?.setPointerCapture(e.pointerId)}catch{}}},!0),document.addEventListener("pointermove",e=>{w===null||e.pointerId!==W||He(e.clientX,e.clientY)},!0),document.addEventListener("pointerup",e=>{e.pointerId===W&&ke(!0)},!0),document.addEventListener("pointercancel",e=>{e.pointerId===W&&ke(!1)},!0);let Le=document.createElement("style");Le.textContent="html.dsd-aiming, html.dsd-aiming * { cursor: crosshair !important; }",(document.head||document.documentElement).appendChild(Le);let Qe=()=>document.body.style.transform!==""&&f.style.pointerEvents==="auto";document.addEventListener("keydown",e=>{if(!q&&(e.key==="Escape"&&(Z?Z():G()),e.key==="Shift"&&document.documentElement.classList.add("dsd-aiming"),(e.key==="q"||e.key==="Q")&&!e.metaKey&&!e.ctrlKey&&!e.altKey&&Qe())){let t=e.target?.tagName;if(t==="INPUT"||t==="TEXTAREA"||e.target?.isContentEditable)return;e.preventDefault(),we()}},!0),document.addEventListener("keyup",e=>{e.key==="Shift"&&document.documentElement.classList.remove("dsd-aiming")},!0),window.addEventListener("blur",()=>{document.documentElement.classList.remove("dsd-aiming")}),document.addEventListener("dragstart",e=>{w&&e.preventDefault()},!0),document.addEventListener("selectstart",e=>{w&&e.preventDefault()},!0)})();})();
