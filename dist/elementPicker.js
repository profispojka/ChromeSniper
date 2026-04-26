"use strict";(()=>{(()=>{let d=!1,k=e=>e<1024?`${e} B`:e<1024*1024?`${(e/1024).toFixed(1)} KB`:`${(e/(1024*1024)).toFixed(1)} MB`,p=(e,n="ok")=>{let t=document.createElement("div");t.dataset.dsdInternal="1",t.style.cssText=`
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
    `;let s=`<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0">
      <circle cx="8" cy="8" r="7" fill="rgba(52, 199, 89, 0.95)"/>
      <path d="M5 8L7 10L11 6" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,i=`<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0">
      <circle cx="8" cy="8" r="7" fill="rgba(255, 90, 90, 0.95)"/>
      <path d="M6 6L10 10M10 6L6 10" stroke="white" stroke-width="1.8" stroke-linecap="round"/>
    </svg>`;t.innerHTML=`${n==="ok"?s:i}<span></span>`,t.querySelector("span").textContent=e,document.documentElement.appendChild(t),requestAnimationFrame(()=>{t.style.opacity="1",t.style.transform="translate(-50%, 0)"}),setTimeout(()=>{t.style.opacity="0",t.style.transform="translate(-50%, -12px)",setTimeout(()=>t.remove(),250)},2200)},f=e=>e?e.closest("[data-dsd-internal], [data-dsd-picker]")!==null:!1,m=e=>{let n=e.tagName.toLowerCase(),t=e.id?`#${e.id}`:"",s=typeof e.className=="string"&&e.className.trim()?`.${e.className.trim().split(/\s+/).slice(0,2).join(".")}`:"";return`${n}${t}${s}`},u=(e,n)=>{let t=document.elementsFromPoint?.(e,n)??[];for(let s of t)if(!f(s))return s;return null},h=async()=>{if(d)return;d=!0;let e=document.createElement("div");e.dataset.dsdPicker="1",e.style.cssText=`
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 2147483647;
    `;let n=document.createElement("div");n.dataset.dsdPicker="1",n.style.cssText=`
      position: fixed;
      pointer-events: none;
      border: 2px solid rgba(10, 132, 255, 0.95);
      background: rgba(10, 132, 255, 0.12);
      border-radius: 2px;
      box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.35), 0 0 0 9999px rgba(0, 0, 0, 0.15);
      transition: opacity 0.08s ease;
      opacity: 0;
      box-sizing: border-box;
    `,e.appendChild(n);let t=document.createElement("div");t.dataset.dsdPicker="1",t.style.cssText=`
      position: fixed;
      pointer-events: none;
      padding: 4px 8px;
      background: rgba(20, 20, 22, 0.92);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 6px;
      color: rgba(255, 255, 255, 0.95);
      font: 500 11px/1.2 ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
      white-space: nowrap;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
      opacity: 0;
      max-width: 60vw;
      overflow: hidden;
      text-overflow: ellipsis;
    `,e.appendChild(t);let s=document.createElement("div");s.dataset.dsdPicker="1",s.style.cssText=`
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      pointer-events: none;
      padding: 8px 14px;
      background: rgba(20, 20, 22, 0.85);
      backdrop-filter: blur(20px) saturate(160%);
      -webkit-backdrop-filter: blur(20px) saturate(160%);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      color: rgba(255, 255, 255, 0.9);
      font: 500 12px/1.3 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
      opacity: 0;
      transition: opacity 0.2s ease;
    `,s.innerHTML='Klikni na element pro zkop\xEDrov\xE1n\xED \xB7 <kbd style="display:inline-block;padding:1px 6px;font:600 10px/1.4 -apple-system,BlinkMacSystemFont,sans-serif;color:rgba(255,255,255,0.9);background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.16);border-radius:4px;">Esc</kbd> zru\u0161\xED',e.appendChild(s);let i=document.createElement("style");i.dataset.dsdPicker="1",i.textContent="html.dsd-picker-active, html.dsd-picker-active * { cursor: crosshair !important; }",document.head.appendChild(i),document.documentElement.classList.add("dsd-picker-active"),document.documentElement.appendChild(e),requestAnimationFrame(()=>{s.style.opacity="1"});let c=null,w=o=>{if(!o){n.style.opacity="0",t.style.opacity="0",c=null;return}if(o===c)return;c=o;let r=o.getBoundingClientRect();n.style.left=`${r.left}px`,n.style.top=`${r.top}px`,n.style.width=`${r.width}px`,n.style.height=`${r.height}px`,n.style.opacity="1",t.textContent=m(o);let l=r.top-26;t.style.left=`${Math.max(4,r.left)}px`,t.style.top=`${l<4?r.top+4:l}px`,t.style.opacity="1"},a=null,x=o=>{let r=u(o.clientX,o.clientY);w(r)},b=async o=>{let r=u(o.clientX,o.clientY);if(o.preventDefault(),o.stopPropagation(),!r){a?.();return}let l=r.outerHTML;a?.();try{await navigator.clipboard.writeText(l),p(`${m(r)} zkop\xEDrov\xE1n (${k(l.length)})`)}catch{p("Kop\xEDrov\xE1n\xED selhalo","err")}},v=o=>{o.key==="Escape"&&(o.preventDefault(),o.stopPropagation(),a?.())},y=()=>{c=null,n.style.opacity="0",t.style.opacity="0"},g=()=>a?.();a=()=>{a=null,d=!1,document.removeEventListener("pointermove",x,!0),document.removeEventListener("click",b,!0),document.removeEventListener("keydown",v,!0),window.removeEventListener("scroll",y,!0),window.removeEventListener("blur",g),document.documentElement.classList.remove("dsd-picker-active"),i.remove(),e.remove()},document.addEventListener("pointermove",x,!0),document.addEventListener("click",b,!0),document.addEventListener("keydown",v,!0),window.addEventListener("scroll",y,!0),window.addEventListener("blur",g)};window.__dsdElementPicker={start:h,isActive:()=>d}})();})();
