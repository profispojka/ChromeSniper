"use strict";(()=>{(()=>{let se="qrStripTracking",Y=window.qrcode;if(Y){let e=Y.stringToBytesFuncs["UTF-8"];e&&(Y.stringToBytes=e)}let V=!1,f=document.createElement("div");f.style.cssText=`
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 2147483647;
  `,document.documentElement.appendChild(f);let J=0,q=0,w=null,N=null,S=null,A=!1,P=null,ee=null,W=window.__dsdAnnotations,z=null,ce=window.__dsdFullPage,pe=window.__dsdHistory,ie=!1,O=null,Ee=e=>new Promise((t,o)=>{let n=new FileReader;n.onload=()=>t(n.result),n.onerror=()=>o(n.error??new Error("blob read failed")),n.readAsDataURL(e)}),Le=async(e,t,o,n)=>{try{let r=await Ee(e);await chrome.runtime.sendMessage({type:"saveScreenshot",dataUrl:r,pageUrl:location.href,pageTitle:document.title||location.hostname,kind:t,width:o,height:n})}catch{}},ue=(e,t)=>{if(ie)return;ie=!0;let o=window.devicePixelRatio||1,n=t.getBoundingClientRect(),r=Math.round(n.width*o),s=Math.round(n.height*o);Le(e,"region",r,s)},Te=()=>{if(ce){if(document.body.style.transform!==""){k("Close the zoom first (Esc)");return}ce.run()}},Ce=async()=>{let e=window.EyeDropper;if(!e){k("Color picker is not supported in this browser");return}try{let o=(await new e().open()).sRGBHex;try{await navigator.clipboard.writeText(o),k(`${o} copied`)}catch{k(o)}}catch{}};chrome.runtime.onMessage.addListener(e=>{let t=typeof e=="object"&&e!==null?e.type:void 0;t==="startFullPageCapture"?Te():t==="openHistory"?pe&&pe.open():t==="startColorPicker"&&Ce()});let Me=(e,t)=>{let o=document.createElement("div");o.style.cssText=`
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
    `,o.appendChild(n),f.appendChild(o),o},Se=(e,t)=>{if(!w)return;let o=Math.min(J,e),n=Math.min(q,t),r=Math.abs(e-J),s=Math.abs(t-q);w.style.left=`${o}px`,w.style.top=`${n}px`,w.style.width=`${r}px`,w.style.height=`${s}px`;let i=w.querySelector('[data-role="size-badge"]');i&&(i.textContent=`${Math.round(r)} \xD7 ${Math.round(s)}`,i.style.opacity=r>8&&s>8?"1":"0",i.style.top=n<32?"6px":"-28px",i.style.left=n<32?"6px":"0")},te=()=>{if(O=null,ee&&(ee(),ee=null),z&&(z.destroy(),z=null),f.replaceChildren(),f.style.pointerEvents="none",!document.body.style.transform){ge();return}document.body.style.transition="transform 0.4s ease",document.body.style.transform="translate(0px, 0px) scale(1)";let e=!1,t=()=>{e||(e=!0,document.body.removeEventListener("transitionend",t),ge())};document.body.addEventListener("transitionend",t),setTimeout(t,500)},ne=e=>e.preventDefault(),me=e=>{["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","PageUp","PageDown","Home","End"," "].includes(e.key)&&e.preventDefault()},oe=[],Ae=()=>{oe=[],document.querySelectorAll("*").forEach(e=>{if(f.contains(e)||e===f)return;let t=getComputedStyle(e),o=/(auto|scroll|overlay)/.test(t.overflowY)&&e.scrollHeight>e.clientHeight,n=/(auto|scroll|overlay)/.test(t.overflowX)&&e.scrollWidth>e.clientWidth;(o||n)&&(oe.push({el:e,overflowY:e.style.overflowY,overflowX:e.style.overflowX,scrollTop:e.scrollTop,scrollLeft:e.scrollLeft}),e.style.overflowY="hidden",e.style.overflowX="hidden")})},He=()=>{oe.forEach(({el:e,overflowY:t,overflowX:o,scrollTop:n,scrollLeft:r})=>{e.style.overflowY=t,e.style.overflowX=o,e.scrollTop=n,e.scrollLeft=r}),oe=[]},ge=()=>{document.body.style.transform="",document.body.style.transformOrigin="",document.body.style.transition="",document.documentElement.style.overflow="",document.body.style.overflow="",window.removeEventListener("wheel",ne,!0),window.removeEventListener("touchmove",ne,!0),window.removeEventListener("keydown",me,!0),He()},D=(e,t,o)=>{let n=document.createElement("button");return n.innerHTML=e,n.setAttribute("aria-label",t),n.dataset.tooltip=t,n.style.cssText=`
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
    `,n.addEventListener("mouseenter",()=>{n.style.background="rgba(255, 255, 255, 0.12)",n.style.color="rgba(255, 255, 255, 1)"}),n.addEventListener("mouseleave",()=>{n.style.background="transparent",n.style.color="rgba(255, 255, 255, 0.85)"}),n.addEventListener("mousedown",()=>{n.style.transform="scale(0.92)"}),n.addEventListener("mouseup",()=>{n.style.transform="scale(1)"}),n.addEventListener("click",r=>{r.stopPropagation(),o()}),n},ye=async(e,t)=>{f.style.visibility="hidden",await new Promise(a=>requestAnimationFrame(()=>requestAnimationFrame(()=>a())));let o;try{let a={type:"captureVisibleTab"},l=await chrome.runtime.sendMessage(a);if(!l||l.error||!l.dataUrl)throw new Error(l?.error??"capture failed");o=l.dataUrl}finally{f.style.visibility=""}let n=await new Promise((a,l)=>{let d=new Image;d.onload=()=>a(d),d.onerror=l,d.src=o}),r=window.devicePixelRatio||1,s=document.createElement("canvas");s.width=Math.round(e.width*r),s.height=Math.round(e.height*r);let i=s.getContext("2d");if(!i)throw new Error("2d context unavailable");return i.drawImage(n,Math.round(e.left*r),Math.round(e.top*r),Math.round(e.width*r),Math.round(e.height*r),0,0,s.width,s.height),t&&t.length&&W&&W.render(i,t,r),await new Promise((a,l)=>{s.toBlob(d=>{d?a(d):l(new Error("toBlob returned null"))},"image/png")})},k=(e,t)=>{let o=document.createElement("div");o.style.cssText=`
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
         </svg>`;o.innerHTML=`${r}<span></span>`,o.querySelector("span").textContent=e,document.documentElement.appendChild(o),requestAnimationFrame(()=>{o.style.opacity="1",o.style.transform="translate(-50%, 0)"});let s=!1,i=()=>{s||(s=!0,o.style.opacity="0",o.style.transform="translate(-50%, -12px)",setTimeout(()=>o.remove(),250))};return n||setTimeout(i,2200),{dismiss:i}},Re=async e=>{try{let t=await ye(e.getBoundingClientRect(),z?.getAnnotations());await navigator.clipboard.write([new ClipboardItem({"image/png":t})]),k("Screenshot copied to clipboard"),ue(t,e)}catch(t){alert("Copy failed: "+(t instanceof Error?t.message:String(t)))}},Pe=async e=>{let t;try{t=await ye(e.getBoundingClientRect(),z?.getAnnotations())}catch(s){alert("Failed to take screenshot: "+(s instanceof Error?s.message:String(s)));return}ue(t,e);let o=new File([t],`screenshot-${Date.now()}.png`,{type:"image/png"});if(navigator.canShare&&navigator.canShare({files:[o]}))try{await navigator.share({files:[o],title:"Screenshot"});return}catch(s){if(s instanceof Error&&s.name==="AbortError")return}let n=URL.createObjectURL(t),r=document.createElement("a");r.href=n,r.download=o.name,document.body.appendChild(r),r.click(),r.remove(),URL.revokeObjectURL(n)},Be=["fbclid","gclid","mc_eid","igshid","yclid","msclkid","dclid","_ga","ref","ref_src","ref_url","vero_id","_hsenc","_hsmi"],he=e=>{try{let t=new URL(e);for(let o of[...t.searchParams.keys()])(o.startsWith("utm_")||Be.includes(o))&&t.searchParams.delete(o);return t.toString()}catch{return e}},De=(e,t,o,n=4)=>{let r=t.getModuleCount(),s=r+2*n;e.width=s*o,e.height=s*o;let i=e.getContext("2d");if(i){i.fillStyle="#ffffff",i.fillRect(0,0,e.width,e.height),i.fillStyle="#000000";for(let a=0;a<r;a++)for(let l=0;l<r;l++)t.isDark(a,l)&&i.fillRect((l+n)*o,(a+n)*o,o,o)}},Ie=async()=>{try{return(await chrome.storage.local.get(se))[se]===!0}catch{return!1}},Fe=async e=>{try{await chrome.storage.local.set({[se]:e})}catch{}},be=async()=>{if(V)return;if(!Y){k("QR encoder unavailable");return}let e=location.href,t=await Ie();V=!0;let o=document.createElement("div");o.style.cssText=`
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
    `;let m=document.createElement("input");m.type="checkbox",m.checked=t,m.style.cssText="accent-color: rgba(10, 132, 255, 1); cursor: pointer;";let b=document.createElement("span");b.textContent="Strip tracking parameters",d.appendChild(m),d.appendChild(b);let L=document.createElement("div");L.style.cssText="display: flex; gap: 8px; flex-wrap: wrap;";let C=(u,g=!1)=>{let T=document.createElement("button");return T.textContent=u,T.style.cssText=`
        flex: 1 1 auto;
        min-width: 0;
        padding: 9px 12px;
        border-radius: 8px;
        border: 1px solid ${g?"transparent":"rgba(255, 255, 255, 0.12)"};
        background: ${g?"rgba(10, 132, 255, 1)":"rgba(255, 255, 255, 0.06)"};
        color: ${g?"white":"rgba(255, 255, 255, 0.95)"};
        font: 500 13px/1 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        cursor: pointer;
        transition: background 0.15s ease;
      `,T.addEventListener("mouseenter",()=>{T.style.background=g?"rgba(10, 132, 255, 0.85)":"rgba(255, 255, 255, 0.12)"}),T.addEventListener("mouseleave",()=>{T.style.background=g?"rgba(10, 132, 255, 1)":"rgba(255, 255, 255, 0.06)"}),T},I=C("Copy PNG",!0),h=C("Download"),_=C("Copy URL");L.appendChild(I),L.appendChild(h),L.appendChild(_),n.appendChild(r),n.appendChild(a),n.appendChild(l),n.appendChild(d),n.appendChild(L),o.appendChild(n),document.documentElement.appendChild(o);let H=t?he(e):e,U=()=>{H=m.checked?he(e):e,l.textContent=H;try{let u=Y(0,"M");u.addData(H,"Byte"),u.make();let g=280,T=u.getModuleCount()+8,p=Math.max(2,Math.floor(g*(window.devicePixelRatio||1)/T));De(a,u,p)}catch{let g=a.getContext("2d");g&&(a.width=280,a.height=280,g.fillStyle="#ffffff",g.fillRect(0,0,a.width,a.height),g.fillStyle="#cc0000",g.font="14px sans-serif",g.textAlign="center",g.fillText("URL is too long",a.width/2,a.height/2))}};if(U(),/^(chrome|chrome-extension|about|file):/i.test(e)){let u=document.createElement("div");u.textContent="This URL only works in the same browser or device.",u.style.cssText=`
        font-size: 12px;
        color: rgba(255, 200, 0, 0.85);
        margin-top: -6px;
      `,n.insertBefore(u,d)}m.addEventListener("change",()=>{Fe(m.checked),U()});let j=!1,E=()=>{j||(j=!0,o.style.opacity="0",n.style.transform="scale(0.96)",setTimeout(()=>o.remove(),180),document.removeEventListener("keydown",G,!0),V=!1)},G=u=>{u.key==="Escape"&&(u.stopPropagation(),u.preventDefault(),E())};document.addEventListener("keydown",G,!0),i.addEventListener("click",E),o.addEventListener("click",u=>{u.target===o&&E()}),I.addEventListener("click",()=>{a.toBlob(async u=>{if(!u){k("Failed to create image");return}try{await navigator.clipboard.write([new ClipboardItem({"image/png":u})]),k("QR copied to clipboard")}catch{k("Copy failed")}},"image/png")}),h.addEventListener("click",()=>{a.toBlob(u=>{if(!u)return;let g=URL.createObjectURL(u),T="page";try{T=new URL(H).hostname||"page"}catch{}let p=document.createElement("a");p.href=g,p.download=`qr-${T}.png`,document.body.appendChild(p),p.click(),p.remove(),URL.revokeObjectURL(g)},"image/png")}),_.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(H),k("URL copied")}catch{k("URL copy failed")}}),requestAnimationFrame(()=>{o.style.opacity="1",n.style.transform="scale(1)"})},ae=e=>e.toString(16).padStart(2,"0").toUpperCase(),fe=async e=>{if(!e.isConnected)return;let t=e.getBoundingClientRect();if(t.width<1||t.height<1)return;f.style.visibility="hidden";let o;try{await new Promise(d=>requestAnimationFrame(()=>requestAnimationFrame(()=>d())));let a={type:"captureVisibleTab"},l=await chrome.runtime.sendMessage(a);if(!l||l.error||!l.dataUrl)return;o=l.dataUrl}finally{f.style.visibility=""}let n=await new Promise((a,l)=>{let d=new Image;d.onload=()=>a(d),d.onerror=l,d.src=o}),r=window.devicePixelRatio||1,s=document.createElement("canvas");s.width=Math.max(1,Math.round(t.width*r)),s.height=Math.max(1,Math.round(t.height*r));let i=s.getContext("2d",{willReadFrequently:!0});i&&(i.drawImage(n,Math.round(t.left*r),Math.round(t.top*r),Math.round(t.width*r),Math.round(t.height*r),0,0,s.width,s.height),S=i.getImageData(0,0,s.width,s.height))},Ue=e=>{if(P&&P.parentElement===e)return P;let t=document.createElement("div");return t.dataset.role="picker-swatch",t.style.cssText=`
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
    `,e.appendChild(t),P=t,t},Z=()=>{P&&(P.style.opacity="0")},we=(e,t,o)=>{if(!S)return null;let n=e.getBoundingClientRect(),r=t-n.left,s=o-n.top;if(r<0||s<0||r>n.width||s>n.height)return null;let i=window.devicePixelRatio||1,a=Math.min(S.width-1,Math.max(0,Math.floor(r*i))),d=(Math.min(S.height-1,Math.max(0,Math.floor(s*i)))*S.width+a)*4,m=S.data;return`#${ae(m[d])}${ae(m[d+1])}${ae(m[d+2])}`},$e=(e,t,o)=>{let n=we(e,t,o);if(!n){Z();return}let r=e.getBoundingClientRect(),s=t-r.left,i=o-r.top,a=Ue(e),l=96,d=28,m=s+16,b=i+16;m+l>r.width&&(m=s-l-8),b+d>r.height&&(b=i-d-8),m<0&&(m=4),b<0&&(b=4),a.style.transform=`translate(${m}px, ${b}px)`,a.style.opacity="1";let L=a.querySelector('[data-role="swatch"]'),C=a.querySelector('[data-role="hex"]');L&&(L.style.background=n),C&&(C.textContent=n)},Ke=async(e,t,o)=>{let n=we(e,t,o);if(n)try{await navigator.clipboard.writeText(n),k(`${n} copied`)}catch{k("Color copy failed")}},ze=(e,t)=>{let o=document.createElement("div");o.style.cssText=`
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
    `;let n=document.createElement("div");n.style.cssText="display: flex; align-items: center; gap: 2px;",o.appendChild(n);let r=()=>{let p=document.createElement("div");return p.style.cssText=`
        width: 1px;
        height: 18px;
        background: rgba(255, 255, 255, 0.1);
        margin: 0 2px;
      `,p},s=`
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
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
        <line x1="6" y1="6" x2="18" y2="18"/>
        <line x1="18" y1="6" x2="6" y2="18"/>
      </svg>
    `,m=`
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
        <line x1="12" y1="5" x2="12" y2="19"/>
        <line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
    `,b=e.getBoundingClientRect(),L=b.width/t,C=b.height/t,I=L>=10&&C>=10;n.appendChild(D(s,"Copy (\u2318C)",()=>Re(e))),n.appendChild(D(i,"Share / download",()=>Pe(e))),n.appendChild(D(a,"Page QR code (Q)",()=>{be()}));let h=null;I&&(h=D(l,"Color picker (I, Alt+klik)",()=>{g(!A)}),n.appendChild(h)),n.appendChild(r());let _=null,H=!1,U=null,j="",E=null,G=()=>{if(!(!H||!E)&&(H=!1,O=null,document.body.style.transition="transform 0.4s ease",document.body.style.transform=j,e.style.transition="left 0.4s ease, top 0.4s ease, width 0.4s ease, height 0.4s ease, border-color 0.2s ease, box-shadow 0.2s ease",e.style.left=E.left,e.style.top=E.top,e.style.width=E.width,e.style.height=E.height,e.style.border=E.border,e.style.boxShadow=E.boxShadow,e.style.pointerEvents=E.pointerEvents,E=null,o.style.opacity="1",o.style.pointerEvents="auto",U)){let p=U;p.style.opacity="0",setTimeout(()=>p.remove(),200),U=null}},u=()=>{if(H)return;H=!0,O=G,A&&g(!1);let p=1.25,$=t*p,x=window.innerWidth,B=window.innerHeight,X=parseFloat(e.style.width)||b.width,F=parseFloat(e.style.height)||b.height,K=X*p,c=F*p;j=document.body.style.transform,E={border:e.style.border,boxShadow:e.style.boxShadow,left:e.style.left,top:e.style.top,width:e.style.width,height:e.style.height,pointerEvents:e.style.pointerEvents},document.body.style.transition="transform 0.4s ease",document.body.style.transform=j.replace(/scale\([^)]+\)/,`scale(${$})`),e.style.transition="left 0.4s ease, top 0.4s ease, width 0.4s ease, height 0.4s ease, border-color 0.2s ease, box-shadow 0.2s ease",e.style.left=`${x/2-K/2}px`,e.style.top=`${B/2-c/2}px`,e.style.width=`${K}px`,e.style.height=`${c}px`,e.style.border="1.5px solid transparent",e.style.boxShadow="none",o.style.opacity="0",o.style.pointerEvents="none";let y=document.createElement("button");y.innerHTML=d,y.setAttribute("aria-label","Back (Esc)"),y.style.cssText=`
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
      `,y.addEventListener("mouseenter",()=>{y.style.background="rgba(40, 40, 44, 0.9)"}),y.addEventListener("mouseleave",()=>{y.style.background="rgba(20, 20, 22, 0.75)"}),y.addEventListener("mousedown",()=>{y.style.transform="scale(0.92)"}),y.addEventListener("mouseup",()=>{y.style.transform="scale(1)"}),y.addEventListener("click",re=>{re.stopPropagation(),G()}),f.appendChild(y),U=y,requestAnimationFrame(()=>{y.style.opacity="1"})};n.appendChild(D(m,"Zoom in further",u)),n.appendChild(D(d,"Close (Esc)",te));let g=p=>{A=p,p?(e.style.cursor="crosshair",h&&(h.style.background="rgba(10, 132, 255, 0.85)",h.style.color="white"),S||k("Loading colors\u2026")):(e.style.cursor="",h&&(h.style.background="transparent",h.style.color="rgba(255, 255, 255, 0.85)"),Z())};if(h&&(h.addEventListener("mouseenter",()=>{A&&(h.style.background="rgba(10, 132, 255, 0.95)",h.style.color="white")}),h.addEventListener("mouseleave",()=>{A&&(h.style.background="rgba(10, 132, 255, 0.85)",h.style.color="white")})),I){let p=c=>{if(!(A||c.altKey)){P&&P.style.opacity!=="0"&&Z();return}S&&$e(e,c.clientX,c.clientY)},$=()=>Z(),x=c=>{(A||c.altKey)&&(c.target?.closest("button")||(c.preventDefault(),c.stopPropagation(),Ke(e,c.clientX,c.clientY)))},B=c=>{if(c.key==="Alt"&&S)e.style.cursor="crosshair";else if((c.key==="i"||c.key==="I")&&!c.ctrlKey&&!c.metaKey&&!c.altKey&&!c.shiftKey){let y=document.activeElement?.tagName;if(y==="INPUT"||y==="TEXTAREA")return;c.preventDefault(),g(!A)}},X=c=>{c.key==="Alt"&&!A&&(e.style.cursor="",Z())};e.addEventListener("pointermove",p),e.addEventListener("pointerleave",$),e.addEventListener("click",x,!0),document.addEventListener("keydown",B,!0),document.addEventListener("keyup",X,!0);let F=c=>{c.target!==document.body||c.propertyName!=="transform"||(document.body.removeEventListener("transitionend",F),fe(e))};document.body.addEventListener("transitionend",F);let K=window.setTimeout(()=>{document.body.removeEventListener("transitionend",F),fe(e)},600);ee=()=>{e.removeEventListener("pointermove",p),e.removeEventListener("pointerleave",$),e.removeEventListener("click",x,!0),document.removeEventListener("keydown",B,!0),document.removeEventListener("keyup",X,!0),document.body.removeEventListener("transitionend",F),window.clearTimeout(K),S=null,A=!1,P=null}}if(!!W&&L>=16&&C>=16&&W){let p=parseFloat(e.style.width)||b.width,$=parseFloat(e.style.height)||b.height,x=W.mount(e,{cssWidth:p,cssHeight:$});z=x;let B=document.createElement("div");B.style.cssText=`
        display: flex;
        align-items: center;
        gap: 2px;
        padding-top: 4px;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
      `;let X=`
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 19l7-7 3 3-7 7-3-3z"/>
          <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
          <path d="M2 2l7.586 7.586"/>
          <circle cx="11" cy="11" r="2"/>
        </svg>
      `,F=`
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
          <path d="M10 11v6"/>
          <path d="M14 11v6"/>
          <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>
        </svg>
      `,K=[];_=()=>{let R=x.getTool();for(let{tool:Q,btn:M}of K){let v=Q===R;M.style.background=v?"rgba(10, 132, 255, 0.85)":"transparent",M.style.color=v?"white":"rgba(255, 255, 255, 0.85)"}};let c=(R,Q,M)=>{let v=D(R,Q,()=>{let Qe=x.getTool()===M?"none":M;x.setTool(Qe),_?.()});return v.addEventListener("mouseenter",()=>{x.getTool()===M&&(v.style.background="rgba(10, 132, 255, 0.95)",v.style.color="white")}),v.addEventListener("mouseleave",()=>{x.getTool()===M&&(v.style.background="rgba(10, 132, 255, 0.85)",v.style.color="white")}),K.push({tool:M,btn:v}),v};B.appendChild(c(X,"Pen (P)","pen"));let y=D(F,"Clear all",()=>{x.clear()});B.appendChild(y),o.appendChild(B);let re=R=>{let Q=document.activeElement?.tagName;if(Q==="INPUT"||Q==="TEXTAREA"||R.metaKey||R.ctrlKey||R.altKey||R.shiftKey)return;let M=R.key.toLowerCase(),v=null;M==="v"?v="none":M==="p"&&(v="pen"),v!==null&&(R.preventDefault(),x.setTool(v),_?.())};document.addEventListener("keydown",re,!0);let Xe=x.destroy;x.destroy=()=>{document.removeEventListener("keydown",re,!0),Xe()}}e.appendChild(o),requestAnimationFrame(()=>{e.getBoundingClientRect().bottom+56>window.innerHeight&&(o.style.top="auto",o.style.bottom="100%",o.style.transformOrigin="bottom center",o.style.transform="translate(-50%, -10px)"),o.style.opacity="1"})},_e=(e,t,o,n,r)=>{if(n<5||r<5)return;ie=!1;let s=window.innerWidth,i=window.innerHeight,a=document.body.getBoundingClientRect(),l=t+n/2-a.left,d=o+r/2-a.top,m=Math.min(s/n,i/r)*.8,b=s/2-(t+n/2),L=i/2-(o+r/2);document.body.style.transformOrigin=`${l}px ${d}px`,document.body.style.transition="transform 0.4s ease",document.body.style.transform=`translate(${b}px, ${L}px) scale(${m})`,document.documentElement.style.overflow="hidden",document.body.style.overflow="hidden",Ae(),window.addEventListener("wheel",ne,{passive:!1,capture:!0}),window.addEventListener("touchmove",ne,{passive:!1,capture:!0}),window.addEventListener("keydown",me,!0);let C=n*m,I=r*m;e.style.transition="left 0.4s ease, top 0.4s ease, width 0.4s ease, height 0.4s ease",e.style.left=`${s/2-C/2}px`,e.style.top=`${i/2-I/2}px`,e.style.width=`${C}px`,e.style.height=`${I}px`,e.style.pointerEvents="auto",f.style.pointerEvents="auto",ze(e,m)};f.addEventListener("click",e=>{e.target===f&&te()});let ve=e=>{if(window.removeEventListener("scroll",xe,!0),e&&w){let t=w.getBoundingClientRect(),o=w.querySelector('[data-role="size-badge"]');o&&o.remove(),_e(w,t.left,t.top,t.width,t.height)}w=null,N=null},le=0,de=0,xe=()=>{w&&(window.scrollX!==le||window.scrollY!==de)&&window.scrollTo(le,de)};document.addEventListener("pointerdown",e=>{if(!(e.button!==0||!e.shiftKey)){te(),le=window.scrollX,de=window.scrollY,window.addEventListener("scroll",xe,!0),J=e.clientX,q=e.clientY,w=Me(J,q),N=e.pointerId;try{e.target?.setPointerCapture(e.pointerId)}catch{}}},!0),document.addEventListener("pointermove",e=>{w===null||e.pointerId!==N||Se(e.clientX,e.clientY)},!0),document.addEventListener("pointerup",e=>{e.pointerId===N&&ve(!0)},!0),document.addEventListener("pointercancel",e=>{e.pointerId===N&&ve(!1)},!0);let ke=document.createElement("style");ke.textContent="html.dsd-aiming, html.dsd-aiming * { cursor: crosshair !important; }",(document.head||document.documentElement).appendChild(ke);let je=()=>document.body.style.transform!==""&&f.style.pointerEvents==="auto";document.addEventListener("keydown",e=>{if(!V&&(e.key==="Escape"&&(O?O():te()),e.key==="Shift"&&document.documentElement.classList.add("dsd-aiming"),(e.key==="q"||e.key==="Q")&&!e.metaKey&&!e.ctrlKey&&!e.altKey&&je())){let t=e.target?.tagName;if(t==="INPUT"||t==="TEXTAREA"||e.target?.isContentEditable)return;e.preventDefault(),be()}},!0),document.addEventListener("keyup",e=>{e.key==="Shift"&&document.documentElement.classList.remove("dsd-aiming")},!0),window.addEventListener("blur",()=>{document.documentElement.classList.remove("dsd-aiming")}),document.addEventListener("dragstart",e=>{w&&e.preventDefault()},!0),document.addEventListener("selectstart",e=>{w&&e.preventDefault()},!0)})();})();
