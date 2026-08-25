(()=>{
  const q=s=>document.querySelector(s), qa=s=>[...document.querySelectorAll(s)];
  const RECEIPTS='nex_bakong_receipts';
  let pollTimer=null,currentPayment=null;

  function receipts(){try{return JSON.parse(localStorage.getItem(RECEIPTS)||'[]')}catch{return []}}
  function saveReceipt(p){const all=receipts().filter(x=>x.client_token!==p.client_token);all.unshift(p);localStorage.setItem(RECEIPTS,JSON.stringify(all.slice(0,50)))}
  function receiptForPrompt(id){return receipts().find(r=>r.status==='paid'&&(r.prompt_ids||[]).map(String).includes(String(id)))}
  function totalCart(){return cart.map(id=>catalog.find(p=>p.id===id)).filter(Boolean).reduce((s,p)=>s+Number(p.price),0)}
  function setPayStatus(text,type='waiting'){const el=q('#bakongPayStatus');if(!el)return;el.textContent=text;el.dataset.type=type}
  function loadQrLib(){return new Promise((resolve,reject)=>{if(window.QRCode)return resolve();const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';s.onload=resolve;s.onerror=reject;document.head.appendChild(s)})}
  async function renderQr(text){const box=q('#bakongQr');if(!box)return;box.innerHTML='';try{await loadQrLib();new QRCode(box,{text,width:220,height:220,correctLevel:QRCode.CorrectLevel.M})}catch{box.innerHTML='<div class="qr-fallback">QR preview unavailable.<br>Please refresh and try again.</div>'}}
  function stopPolling(){if(pollTimer){clearInterval(pollTimer);pollTimer=null}}

  function paymentMarkup(){const total=totalCart();return `<button class="modal-close" data-close="checkoutDialog">×</button><div class="modal-pad bakong-checkout"><div class="bakong-title"><div><span class="bakong-chip">BAKONG · KHQR</span><h2>Complete your payment</h2><p>Scan the KHQR with a participating Cambodian banking or wallet app.</p></div><strong>$${total.toFixed(2)}</strong></div><div class="bakong-grid"><div class="bakong-qr-card"><div id="bakongQr" class="bakong-qr"><div class="qr-loading">Generating KHQR…</div></div><div class="bakong-secure">🔒 Payment is verified securely through Bakong.</div></div><div class="bakong-info"><div class="bakong-row"><span>Pay to</span><b>Nex Prompt</b></div><div class="bakong-row"><span>Bakong ID</span><b>rafy_bo@bkrt</b></div><div class="bakong-row"><span>Currency</span><b>USD</b></div><div class="bakong-row"><span>Amount</span><b>$${total.toFixed(2)}</b></div><div id="bakongPayStatus" class="bakong-status" data-type="waiting">Creating secure payment…</div><button id="bakongCheckBtn" class="primary full" type="button">Check payment now</button><button id="bakongNewBtn" class="secondary full" type="button">Generate new KHQR</button><p class="bakong-note">KHQR expires after about 10 minutes. Prompt access unlocks only after Bakong confirms the exact amount and destination account.</p></div></div></div>`}

  async function createBakongPayment(){
    if(!cart.length)return toast('Your cart is empty');
    stopPolling();currentPayment=null;const d=q('#checkoutDialog');d.innerHTML=paymentMarkup();bindCheckoutUi();if(!d.open)d.showModal();
    try{const res=await api('bakong-create',{method:'POST',body:{prompt_ids:cart.map(Number)}});currentPayment={...res.payment,prompt_ids:cart.map(Number),status:'pending'};await renderQr(res.payment.qr_string);setPayStatus('Waiting for Bakong payment…','waiting');pollTimer=setInterval(checkBakongPayment,8000)}catch(err){setPayStatus(String(err.message||'Could not create KHQR.'),'error');const qr=q('#bakongQr');if(qr)qr.innerHTML='<div class="qr-fallback">Could not generate KHQR</div>'}
  }
  async function checkBakongPayment(){
    if(!currentPayment?.client_token)return;
    const b=q('#bakongCheckBtn');if(b){b.disabled=true;b.textContent='Checking…'}
    try{const r=await api('bakong-status',{method:'POST',body:{client_token:currentPayment.client_token}});if(r.status==='paid'){stopPolling();currentPayment.status='paid';currentPayment.paid_at=r.paid_at;currentPayment.reference=r.reference;saveReceipt(currentPayment);cart=[];updateCart();setPayStatus('✓ Payment confirmed — prompts unlocked','paid');if(b){b.textContent='Payment confirmed ✓';b.disabled=true}const n=q('#bakongNewBtn');if(n){n.textContent='View purchased prompt';n.onclick=()=>{const id=currentPayment.prompt_ids[0];closeDialog('checkoutDialog');openProduct(id)}}toast('Bakong payment confirmed')}else if(r.status==='expired'){stopPolling();setPayStatus('KHQR expired. Generate a new one.','error')}else setPayStatus('Waiting for payment confirmation…','waiting')}
    catch(err){setPayStatus(String(err.message||'Could not check payment.'),'error')}
    finally{if(b&&currentPayment?.status!=='paid'){b.disabled=false;b.textContent='Check payment now'}}
  }
  function bindCheckoutUi(){
    q('#checkoutDialog [data-close]')?.addEventListener('click',()=>{stopPolling();closeDialog('checkoutDialog')});
    q('#bakongCheckBtn')?.addEventListener('click',checkBakongPayment);
    q('#bakongNewBtn')?.addEventListener('click',createBakongPayment);
  }

  const baseOpenProduct=openProduct;
  openProduct=async function(id){
    const p=catalog.find(x=>x.id===String(id));if(!p)return;
    const r=receiptForPrompt(id);let full='';let owned=false;
    if(r){try{const d=await api('bakong-guest-prompt',{method:'POST',body:{client_token:r.client_token,prompt_id:Number(id)}});full=d.prompt_text||'';owned=!!full}catch{}}
    if(!owned&&session)return baseOpenProduct(id);
    q('#productDetail').innerHTML=`<div class="product-wrap"><div class="product-preview" style="background-image:url('${p.image}')"><span class="preview-badge">Image → Video</span></div><div class="product-info"><div class="tagline">${p.category} · ${p.model}</div><h2>${p.title}</h2><p>Premium image-to-video prompt by @${p.creator}.</p><div class="product-price">${money(p.price)}</div><div class="prompt-lock ${owned?'unlocked':''}">${owned?`<strong>Unlocked prompt</strong><br><code>${full}</code>`:'🔒 Full prompt is protected until payment is confirmed.'}</div><div class="product-actions">${owned?'<button class="primary" data-copy="1">Copy Prompt</button>':`<button class="primary" data-add="${p.id}">${cart.includes(p.id)?'In Cart':'Add to Cart'}</button>`}</div></div></div>`;q('#productDialog').dataset.promptId=p.id;q('#productDialog').dataset.promptText=full;openDialog('productDialog')
  };

  function showGuestPurchases(){const all=receipts().filter(r=>r.status==='paid');const ids=[...new Set(all.flatMap(r=>r.prompt_ids||[]).map(String))];q('#libraryTitle').textContent='My Purchases';q('#libraryGrid').innerHTML=ids.map(id=>catalog.find(p=>p.id===id)).filter(Boolean).map(p=>`<article class="library-card" data-guest-library="${p.id}"><div class="img" style="background-image:url('${p.image}')"></div><div class="txt"><h4>${p.title}</h4><small>Paid with Bakong · Click to open</small></div></article>`).join('')||'<div class="empty-state">No paid prompts on this device yet.</div>';openDialog('libraryDialog')}

  window.addEventListener('DOMContentLoaded',()=>{
    const style=document.createElement('style');style.textContent=`#loginBtn,#signupSide,#footerLogin,#profileBtn{display:none!important}.bakong-checkout{min-width:min(720px,92vw)}.bakong-title{display:flex;justify-content:space-between;gap:20px;align-items:flex-start}.bakong-title h2{margin:8px 0 5px}.bakong-title p{margin:0;color:#777b8d;font-size:12px}.bakong-title>strong{font-size:28px;color:#7547ef}.bakong-chip{display:inline-flex;background:#f1ecff;color:#6b45df;border-radius:999px;padding:6px 10px;font-size:10px;font-weight:800}.bakong-grid{display:grid;grid-template-columns:260px 1fr;gap:22px;margin-top:20px}.bakong-qr-card,.bakong-info{border:1px solid #e9e5f4;border-radius:16px;padding:18px;background:#fff}.bakong-qr{min-height:220px;display:grid;place-items:center}.bakong-qr img,.bakong-qr canvas{max-width:100%}.qr-loading,.qr-fallback{color:#878b9c;text-align:center;font-size:12px}.bakong-secure{text-align:center;font-size:10px;color:#797d8c;margin-top:12px}.bakong-row{display:flex;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px solid #f0edf6;font-size:12px}.bakong-row span{color:#85899a}.bakong-status{margin:16px 0;padding:12px;border-radius:11px;background:#f5f2ff;color:#6747d4;font-size:12px;font-weight:700}.bakong-status[data-type=paid]{background:#edf9f1;color:#23864c}.bakong-status[data-type=error]{background:#fff1f2;color:#b73747}.bakong-info .secondary{margin-top:9px}.bakong-note{font-size:10px!important;line-height:1.5;color:#8a8e9d!important;margin:12px 0 0!important}@media(max-width:650px){.bakong-grid{grid-template-columns:1fr}.bakong-title{flex-direction:column}.bakong-checkout{min-width:0}}`;document.head.appendChild(style);
    q('#authDialog')?.close();
    const checkout=q('#checkoutBtn');checkout?.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();createBakongPayment()},true);
    const p=q('#purchasesBtn');p?.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();showGuestPurchases()},true);
    const fp=q('#footerPurchases');fp?.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();showGuestPurchases()},true);
    const ml=q('#mobileLibrary');ml?.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();showGuestPurchases()},true);
    q('#libraryDialog')?.addEventListener('click',e=>{const c=e.target.closest('[data-guest-library]');if(c){e.stopImmediatePropagation();closeDialog('libraryDialog');openProduct(c.dataset.guestLibrary)}},true);
    qa('#favoritesBtn,#favoritesTopBtn,#adminBtn,#creatorAdminBtn').forEach(el=>el.addEventListener('click',e=>{if(!session){e.preventDefault();e.stopImmediatePropagation();toast('This feature will return with account login later.')}},true));
  });
})();
