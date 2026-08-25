(()=>{
  const q=s=>document.querySelector(s), qa=s=>[...document.querySelectorAll(s)];
  const RECEIPTS='nex_bakong_receipts';
  let pollTimer=null,currentPayment=null,countdownTimer=null,countdownEnd=0,paymentCheckBusy=false;

  function receipts(){try{return JSON.parse(localStorage.getItem(RECEIPTS)||'[]')}catch{return []}}
  function saveReceipt(p){const all=receipts().filter(x=>x.client_token!==p.client_token);all.unshift(p);localStorage.setItem(RECEIPTS,JSON.stringify(all.slice(0,50)))}
  function receiptForPrompt(id){return receipts().find(r=>r.status==='paid'&&(r.prompt_ids||[]).map(String).includes(String(id)))}
  function totalCart(){return cart.map(id=>catalog.find(p=>p.id===id)).filter(Boolean).reduce((s,p)=>s+Number(p.price),0)}
  function setPayStatus(text,type='waiting'){const el=q('#bakongPayStatus');if(!el)return;el.textContent=text;el.dataset.type=type}
  function isKh(){return localStorage.getItem('nex_prompt_lang')==='KH'}
  function loadQrLib(){return new Promise((resolve,reject)=>{if(window.QRCode)return resolve();const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';s.onload=resolve;s.onerror=reject;document.head.appendChild(s)})}
  async function renderQr(text){const box=q('#bakongQr');if(!box)return;box.innerHTML='';try{await loadQrLib();new QRCode(box,{text,width:260,height:260,correctLevel:QRCode.CorrectLevel.M})}catch{box.innerHTML='<div class="qr-fallback">QR preview unavailable.<br>Please refresh and try again.</div>'}}
  function stopCountdown(){if(countdownTimer){clearInterval(countdownTimer);countdownTimer=null}}
  function stopPolling(){if(pollTimer){clearInterval(pollTimer);pollTimer=null}stopCountdown();paymentCheckBusy=false}
  function startCountdown(expiresAt){
    stopCountdown();
    const parsed=expiresAt?Date.parse(expiresAt):NaN;
    countdownEnd=Number.isFinite(parsed)?parsed:(Date.now()+10*60*1000);
    const tick=()=>{
      const el=q('#bakongMinuteTimer');if(!el){stopCountdown();return}
      const left=Math.max(0,countdownEnd-Date.now());
      const totalSeconds=Math.ceil(left/1000),mins=Math.floor(totalSeconds/60),secs=totalSeconds%60;
      const time=`${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
      el.innerHTML=left>0?(isKh()?`⏱ QR នេះនៅសល់ <b>${time}</b> នាទី`:`⏱ QR expires in <b>${time}</b> minutes`):(isKh()?'⏱ QR បានផុតកំណត់':'⏱ QR expired');
      el.dataset.expired=left<=0?'1':'0';
      if(left<=0)stopCountdown();
    };
    tick();countdownTimer=setInterval(tick,1000);
  }

  function paymentMarkup(){const total=totalCart();return `<button class="modal-close bakong-close" data-close="checkoutDialog">×</button><div class="modal-pad bakong-checkout"><div class="bakong-chip">✿ BAKONG - KHQR</div><div class="bakong-brand"><div class="bakong-brand-mark">N</div><div><h2>Nex Prompt</h2><p>Create Smarter. Faster.</p></div></div><h3 class="bakong-scan-title">Scan to Pay <span>✓</span></h3><p class="bakong-subtitle">Pay securely with Bakong (KHQR)</p><div class="bakong-amount"><span>Amount to pay</span><strong>$${total.toFixed(2)}</strong><b>USD</b></div><div class="bakong-qr-shell"><div id="bakongQr" class="bakong-qr"><div class="qr-loading">Generating KHQR…</div></div></div><div id="bakongMinuteTimer" class="bakong-minute-timer">⏱ QR expires in <b>10:00</b> minutes</div><div id="bakongPayStatus" class="bakong-status" data-type="waiting">Waiting for Bakong payment…</div><div class="bakong-help"><span>🔒</span><div><strong>Scan the QR code with any Cambodian banking or wallet app</strong><p>ABA &nbsp;|&nbsp; Bakong &nbsp;|&nbsp; Wing &nbsp;|&nbsp; ACLEDA &nbsp;|&nbsp; Canadia &nbsp;|&nbsp; and more...</p></div></div><div class="bakong-secure">◆ Secure payment by Bakong</div><div class="bakong-actions"><button id="bakongCheckBtn" class="primary full" type="button">Check payment</button><button id="bakongNewBtn" class="secondary full" type="button">Generate new QR</button></div></div>`}

  async function createBakongPayment(){
    if(!cart.length)return toast('Your cart is empty');
    stopPolling();currentPayment=null;const d=q('#checkoutDialog');d.innerHTML=paymentMarkup();bindCheckoutUi();if(!d.open)d.showModal();
    try{
      const res=await api('bakong-create',{method:'POST',body:{prompt_ids:cart.map(Number)}});
      currentPayment={...res.payment,prompt_ids:cart.map(Number),status:'pending'};
      await renderQr(res.payment.qr_string);
      startCountdown(res.payment.expires_at);
      setPayStatus(isKh()?'កំពុងរង់ចាំការទូទាត់…':'Waiting for payment…','waiting');
      pollTimer=setInterval(()=>checkBakongPayment(false),15000);
    }catch(err){
      setPayStatus(isKh()?'មិនអាចបង្កើត KHQR បានទេ។ សូមព្យាយាមម្តងទៀត។':'Could not create KHQR. Please try again.','error');
      const qr=q('#bakongQr');if(qr)qr.innerHTML='<div class="qr-fallback">Could not generate KHQR</div>'
    }
  }

  async function checkBakongPayment(manual=false){
    if(!currentPayment?.client_token||paymentCheckBusy)return;
    paymentCheckBusy=true;
    const b=q('#bakongCheckBtn');
    if(manual&&b){b.disabled=true;b.textContent=isKh()?'កំពុងពិនិត្យ…':'Checking…'}
    try{
      const r=await api('bakong-status',{method:'POST',body:{client_token:currentPayment.client_token}});
      if(r.status==='paid'){
        stopPolling();currentPayment.status='paid';currentPayment.paid_at=r.paid_at;currentPayment.reference=r.reference;saveReceipt(currentPayment);cart=[];updateCart();
        setPayStatus(isKh()?'✓ បានបញ្ជាក់ការទូទាត់ — Prompt ត្រូវបានដោះសោ':'✓ Payment confirmed — prompts unlocked','paid');
        if(b){b.textContent=isKh()?'បានបញ្ជាក់ ✓':'Payment confirmed ✓';b.disabled=true}
        const n=q('#bakongNewBtn');if(n){n.textContent=isKh()?'មើល Prompt ដែលបានទិញ':'View purchased prompt';n.onclick=()=>{const id=currentPayment.prompt_ids[0];closeDialog('checkoutDialog');openProduct(id)}}
        toast(isKh()?'បានបញ្ជាក់ការទូទាត់ Bakong':'Bakong payment confirmed')
      }else if(r.status==='expired'){
        stopPolling();setPayStatus(isKh()?'KHQR ផុតកំណត់។ សូមបង្កើតថ្មី។':'KHQR expired. Generate a new one.','error')
      }else{
        setPayStatus(isKh()?'កំពុងរង់ចាំការបញ្ជាក់ការទូទាត់…':'Waiting for payment confirmation…','waiting')
      }
    }catch(err){
      setPayStatus(isKh()?'កំពុងរង់ចាំការបញ្ជាក់ការទូទាត់… សូមព្យាយាមពិនិត្យម្តងទៀតបន្តិចទៀត។':'Waiting for payment confirmation… Please try checking again shortly.','waiting')
    }finally{
      paymentCheckBusy=false;
      if(b&&currentPayment?.status!=='paid'){
        b.disabled=false;
        b.textContent=isKh()?'ពិនិត្យការទូទាត់':'Check payment';
      }
    }
  }

  function bindCheckoutUi(){
    q('#checkoutDialog [data-close]')?.addEventListener('click',()=>{stopPolling();closeDialog('checkoutDialog')});
    q('#bakongCheckBtn')?.addEventListener('click',()=>checkBakongPayment(true));
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
    const style=document.createElement('style');style.textContent=`
#loginBtn,#signupSide,#footerLogin,#profileBtn{display:none!important}
.checkout-modal{width:min(560px,94vw)!important;border:0!important;border-radius:30px!important;background:linear-gradient(180deg,#fff,#fff7fc)!important;box-shadow:0 35px 100px rgba(130,36,91,.28)!important;overflow:auto!important}
.checkout-modal::backdrop{background:rgba(48,25,47,.42)!important;backdrop-filter:blur(8px)}
.bakong-checkout{position:relative;padding:30px 34px 28px!important;text-align:center;background:radial-gradient(circle at 50% 5%,rgba(255,191,224,.38),transparent 30%),linear-gradient(180deg,#fff 0%,#fff9fd 100%)}
.bakong-close{right:18px!important;top:16px!important;width:42px!important;height:42px!important;background:#fff5fb!important;border:1px solid #ffd5ea!important;box-shadow:0 8px 22px rgba(236,58,146,.12)!important}
.bakong-chip{display:inline-flex;align-items:center;justify-content:center;padding:8px 15px;border-radius:999px;background:linear-gradient(135deg,#ff1493,#ff67b5);color:#fff;font-size:11px;font-weight:900;letter-spacing:.03em;box-shadow:0 8px 18px rgba(255,20,147,.22)}
.bakong-brand{display:flex;align-items:center;justify-content:center;gap:14px;margin:18px 0 8px}
.bakong-brand-mark{width:56px;height:56px;border-radius:17px;display:grid;place-items:center;color:#fff;font-size:30px;font-weight:900;font-style:italic;background:linear-gradient(145deg,#ff39a8,#f00075);box-shadow:0 10px 25px rgba(240,0,117,.22)}
.bakong-brand h2{margin:0!important;font-size:31px!important;letter-spacing:-.03em;color:#151727}
.bakong-brand p{margin:2px 0 0!important;font-size:12px!important;color:#8b8090!important}
.bakong-scan-title{margin:16px 0 2px;font-size:29px;line-height:1.1;color:#171825}
.bakong-scan-title span{display:inline-grid;place-items:center;width:25px;height:25px;border-radius:8px;background:#ff4f9f;color:white;font-size:15px;vertical-align:3px}
.bakong-subtitle{margin:0 0 18px!important;color:#98879a!important;font-size:14px!important}
.bakong-amount{position:relative;margin:0 auto 18px;max-width:410px;padding:17px 22px 15px;border:2px solid #ff4fa4;border-radius:25px;background:linear-gradient(135deg,#fff2f9,#fff);box-shadow:0 14px 34px rgba(255,79,164,.10)}
.bakong-amount span{display:block;color:#c07a9e;font-size:13px;margin-bottom:1px}
.bakong-amount strong{font-size:48px;line-height:1;color:#f0157c;letter-spacing:-.04em}
.bakong-amount b{display:inline-block;margin-left:9px;padding:6px 10px;border-radius:999px;background:#ffe3f1;color:#ee2787;font-size:13px;vertical-align:9px}
.bakong-qr-shell{width:min(330px,100%);margin:0 auto;padding:20px;border-radius:28px;background:#fff;border:1px solid #ffe0ef;box-shadow:0 18px 42px rgba(233,52,143,.12)}
.bakong-qr{min-height:260px;display:grid;place-items:center;background:#fff;border-radius:16px;overflow:hidden}
.bakong-qr img,.bakong-qr canvas{width:260px!important;height:260px!important;max-width:100%;image-rendering:auto}
.qr-loading,.qr-fallback{color:#9a8794;text-align:center;font-size:12px}
.bakong-minute-timer{margin:14px auto 0;max-width:410px;padding:12px 16px;border-radius:14px;background:linear-gradient(135deg,#fff7fb,#ffeaf5);border:1px solid #ffd2e7;color:#8f6e80;font-size:13px;font-weight:700;letter-spacing:.01em;box-shadow:0 7px 20px rgba(236,72,153,.07)}
.bakong-minute-timer b{color:#f0157c;font-size:18px;font-variant-numeric:tabular-nums;margin:0 3px}.bakong-minute-timer[data-expired="1"]{background:#fff1f2;color:#b73747;border-color:#ffc9cf}.bakong-minute-timer[data-expired="1"] b{color:#b73747}
html[lang="km"] .bakong-minute-timer{font-family:"Khmer OS Metal Chrieng","Khmer OS","Noto Sans Khmer",sans-serif;line-height:1.8}
.bakong-status{margin:10px auto 0;max-width:410px;padding:10px 14px;border-radius:13px;background:#fff0f7;color:#e92783;font-size:12px;font-weight:800}
.bakong-status[data-type=paid]{background:#ecfff4;color:#16864b}.bakong-status[data-type=error]{background:#fff0f1;color:#b73747}
.bakong-help{margin:16px auto 0;max-width:460px;padding:14px 16px;border-radius:18px;background:linear-gradient(135deg,#fff0f8,#ffe8f4);display:flex;align-items:center;gap:12px;text-align:left;color:#e91e7b}
.bakong-help>span{font-size:24px}.bakong-help strong{display:block;font-size:12px;line-height:1.45}.bakong-help p{margin:4px 0 0!important;font-size:10px!important;color:#8a7682!important;line-height:1.5}
.bakong-secure{margin:14px 0 0;color:#817683;font-size:11px}.bakong-secure::first-letter{color:#27a35b}
.bakong-actions{display:flex;gap:10px;margin-top:16px}.bakong-actions .primary{background:linear-gradient(135deg,#ff168d,#ff5eb5)!important;box-shadow:0 10px 22px rgba(255,31,145,.2)!important}.bakong-actions .secondary{border-color:#ffd4e8!important;background:#fff!important;color:#d92b81!important}
@media(max-width:520px){.bakong-checkout{padding:26px 18px 22px!important}.bakong-brand h2{font-size:26px!important}.bakong-scan-title{font-size:25px}.bakong-amount strong{font-size:41px}.bakong-qr-shell{width:100%;padding:15px}.bakong-qr{min-height:230px}.bakong-qr img,.bakong-qr canvas{width:230px!important;height:230px!important}.bakong-actions{flex-direction:column}}
`;document.head.appendChild(style);
    q('#authDialog')?.close();
    const checkout=q('#checkoutBtn');checkout?.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();createBakongPayment()},true);
    const p=q('#purchasesBtn');p?.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();showGuestPurchases()},true);
    const fp=q('#footerPurchases');fp?.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();showGuestPurchases()},true);
    const ml=q('#mobileLibrary');ml?.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();showGuestPurchases()},true);
    q('#libraryDialog')?.addEventListener('click',e=>{const c=e.target.closest('[data-guest-library]');if(c){e.stopImmediatePropagation();closeDialog('libraryDialog');openProduct(c.dataset.guestLibrary)}},true);
    qa('#favoritesBtn,#favoritesTopBtn,#adminBtn,#creatorAdminBtn').forEach(el=>el.addEventListener('click',e=>{if(!session){e.preventDefault();e.stopImmediatePropagation();toast('This feature will return with account login later.')}},true));
  });
})();
