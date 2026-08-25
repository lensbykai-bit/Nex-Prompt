(()=>{
  const load=src=>new Promise((ok,bad)=>{const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=bad;document.head.appendChild(s)});
  window.addEventListener('DOMContentLoaded',async()=>{try{await load('cloud-store.js');await load('cloud-app.js')}catch(e){console.warn('Cloud integration did not load',e)}});
})();
