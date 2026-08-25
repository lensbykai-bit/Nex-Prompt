(()=>{
  const CREDIT_API='https://kbanmyaqodtfoqikzwou.supabase.co/functions/v1/credits-api';
  const PACKAGES={
    starter_500:{id:'starter_500',credits:500,price:5.99},
    creator_1000:{id:'creator_1000',credits:1000,price:12.00}
  };
  let chosen=null,currentPayment=null,statusTimer=null,countdownTimer=null,checking=false;
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const isKh=()=>localStorage.getItem('nex_prompt_lang')==='KH'||document.documentElement.lang==='km';
  const txt=(en,km)=>isKh()?km:en;
  const getSession=()=>{try{return JSON.parse(localStorage.getItem('nex_cloud_session')||'null')}catch{return null}};
  const showToast=m=>{const t=$('#toast');if(t){t.textContent=m;t.classList.add('show');clearTimeout(window.__creditToast);window.__creditToast=setTimeout(()=>t.classList.remove('show'),2800)}else alert(m)};
  const open=id=>{const d=document.getElementById(id);if(d&&!d.open)d.showModal()};
  const close=id=>document.getElementById(id)?.close();
  function authRequired(){
    const s=getSession();
    if(s?.access_token)return s;
    close('creditDialog');close('creditPaymentDialog');
    const d=$('#authDialog');if(d&&!d.open)d.showModal();
    showToast(txt('Sign in first to buy credits.','សូមចូលគណនីជាមុន ដើម្បីទិញ Credits។'));
    return null;
  }
  async function request(action,{method='GET',body}={}){
    const s=getSession();
    if(!s?.access_token)throw new Error(txt('Please sign in first.','សូមចូលគណនីជាមុន។'));
    const r=await fetch(`${CREDIT_API}?action=${encodeURIComponent(action)}`,{
      method,headers:{'Content-Type':'application/json','Authorization':`Bearer ${s.access_token}`},
      body:body?JSON.stringify(body):undefined
    });
    let d={};try{d=await r.json()}catch{}
    if(!r.ok)throw new Error(d.error||txt('Request failed.','សំណើមិនបានសម្រេច។'));
    return d;
  }
  function formatCredits(n){return Number(n||0).toLocaleString()+' Credits'}
  async function loadBalance(){
    const pill=$('#creditBalance');if(!pill)return;
    const s=getSession();
    if(!s?.access_token){pill.textContent=txt('Sign in','ចូលគណនី');pill.dataset.balance='0';return}
    try{const d=await request('balance');pill.textContent=formatCredits(d.balance);pill.dataset.balance=String(d.balance||0)}
    catch{pill.textContent=txt('Sign in','ចូលគណនី');pill.dataset.balance='0'}
  }
  function choosePackage(id){
    const p=PACKAGES[id];if(!p)return;
    if(!authRequired())return;
    chosen=p;
    $('#creditOrderCredits').textContent=formatCredits(p.credits);
    $('#creditOrderPrice').textContent='$'+p.price.toFixed(2);
    $('#creditOrderTitle').textContent=txt('Buy AI Credits','ទិញ AI Credits');
    $('#creditOrderText').textContent=txt('Credits are shared across supported AI tools.','Credits អាចប្រើរួមគ្នាជាមួយ AI Tools ដែលបានភ្ជាប់។');
    open('creditDialog');
  }
  function loadQrLib(){
    if(window.QRCode)return Promise.resolve();
    return new Promise((resolve,reject)=>{
      const old=document.getElementById('nexQrLib');if(old){old.addEventListener('load',resolve,{once:true});old.addEventListener('error',reject,{once:true});return}
      const s=document.createElement('script');s.id='nexQrLib';s.src='https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js';s.onload=resolve;s.onerror=reject;document.head.appendChild(s);
    });
  }
  async function renderQr(text){
    const box=$('#creditQr');if(!box)return;box.innerHTML='<div class="credit-spinner"></div>';
    try{await loadQrLib();box.innerHTML='';new QRCode(box,{text,width:240,height:240,colorDark:'#000000',colorLight:'#ffffff',correctLevel:QRCode.CorrectLevel.M})}
    catch{box.innerHTML=`<div style="padding:25px;text-align:center;color:#d94a87;font-size:12px">${txt('Could not render QR. Generate a new QR.','មិនអាចបង្ហាញ QR បាន។ សូមបង្កើត QR ថ្មី។')}</div>`}
  }
  function stopLoops(){if(statusTimer)clearInterval(statusTimer);if(countdownTimer)clearInterval(countdownTimer);statusTimer=null;countdownTimer=null}
  function setStatus(message,type='pending'){
    const s=$('#creditPayStatus');if(!s)return;s.textContent=message;s.dataset.type=type;
  }
  function updateCountdown(){
    if(!currentPayment)return;
    const ms=new Date(currentPayment.expires_at).getTime()-Date.now();
    const el=$('#creditPayTimer');if(!el)return;
    if(ms<=0){el.textContent='00:00';setStatus(txt('QR expired. Generate a new QR.','QR ផុតកំណត់ហើយ។ សូមបង្កើត QR ថ្មី។'),'error');stopLoops();return}
    const sec=Math.floor(ms/1000),m=String(Math.floor(sec/60)).padStart(2,'0'),s=String(sec%60).padStart(2,'0');el.textContent=`${m}:${s}`;
  }
  function startLoops(){
    stopLoops();updateCountdown();countdownTimer=setInterval(updateCountdown,1000);statusTimer=setInterval(()=>checkPayment(false),15000);
  }
  function fillPayment(p){
    currentPayment=p;
    $('#creditPayAmount').textContent='$'+Number(p.amount_usd).toFixed(2);
    $('#creditPayCredits').textContent=formatCredits(p.credits);
    $('#creditSuccessBox')?.classList.remove('show');
    $('#creditSuccessBalance').textContent='';
    setStatus(txt('Waiting for payment…','កំពុងរង់ចាំការទូទាត់…'),'pending');
    renderQr(p.qr_string);updateCountdown();startLoops();
  }
  async function createPayment(){
    if(!chosen||!authRequired())return;
    const b=$('#creditConfirmBtn');if(b){b.disabled=true;b.textContent=txt('Generating QR…','កំពុងបង្កើត QR…')}
    try{
      const d=await request('create',{method:'POST',body:{package_id:chosen.id}});
      close('creditDialog');fillPayment(d.payment);open('creditPaymentDialog');
    }catch(e){showToast(e.message)}finally{if(b){b.disabled=false;b.textContent=txt('Pay with Bakong KHQR','ទូទាត់តាម Bakong KHQR')}}
  }
  async function checkPayment(manual=true){
    if(!currentPayment||checking)return;
    checking=true;
    const b=$('#creditCheckBtn');if(manual&&b){b.disabled=true;b.textContent=txt('Checking…','កំពុងពិនិត្យ…')}
    try{
      const d=await request('status',{method:'POST',body:{client_token:currentPayment.client_token}});
      if(d.status==='paid'){
        stopLoops();setStatus(txt('Payment received — credits added ✓','ទូទាត់ជោគជ័យ — Credits បានបញ្ចូល ✓'),'paid');
        const box=$('#creditSuccessBox');if(box){box.classList.add('show');$('#creditSuccessBalance').textContent=txt(`New balance: ${formatCredits(d.balance)}`,`Credits សរុបថ្មី៖ ${formatCredits(d.balance)}`)}
        const pill=$('#creditBalance');if(pill){pill.textContent=formatCredits(d.balance);pill.dataset.balance=String(d.balance)}
        showToast(txt(`${d.credits} credits added successfully.`,`${d.credits} Credits បានបញ្ចូលដោយជោគជ័យ។`));
      }else if(d.status==='expired'){
        stopLoops();setStatus(txt('QR expired. Generate a new QR.','QR ផុតកំណត់ហើយ។ សូមបង្កើត QR ថ្មី។'),'error');
      }else setStatus(d.message||txt('Waiting for payment…','កំពុងរង់ចាំការទូទាត់…'),'pending');
    }catch(e){if(manual)showToast(e.message)}finally{checking=false;if(manual&&b){b.disabled=false;b.textContent=txt('Check payment','ពិនិត្យការទូទាត់')}}
  }
  async function newQr(){
    if(!chosen&&currentPayment){chosen=PACKAGES[currentPayment.package_id]||{id:currentPayment.package_id,credits:Number(currentPayment.credits),price:Number(currentPayment.amount_usd)}}
    if(!chosen||!authRequired())return;
    const b=$('#creditNewQrBtn');if(b){b.disabled=true;b.textContent=txt('Generating…','កំពុងបង្កើត…')}
    try{const d=await request('create',{method:'POST',body:{package_id:chosen.id}});fillPayment(d.payment)}catch(e){showToast(e.message)}finally{if(b){b.disabled=false;b.textContent=txt('Generate new QR','បង្កើត QR ថ្មី')}}
  }
  function applyLanguage(){
    const kh=isKh();
    $$('[data-credit-en]').forEach(el=>{const next=kh?el.dataset.creditKm:el.dataset.creditEn;if(el.textContent!==next)el.textContent=next});
    const pill=$('#creditBalance');if(pill&&!getSession()?.access_token)pill.textContent=kh?'ចូលគណនី':'Sign in';
    if($('#creditConfirmBtn'))$('#creditConfirmBtn').textContent=kh?'ទូទាត់តាម Bakong KHQR':'Pay with Bakong KHQR';
    if($('#creditCheckBtn'))$('#creditCheckBtn').textContent=kh?'ពិនិត្យការទូទាត់':'Check payment';
    if($('#creditNewQrBtn'))$('#creditNewQrBtn').textContent=kh?'បង្កើត QR ថ្មី':'Generate new QR';
  }
  function wire(){
    $$('[data-credit-package]').forEach(b=>b.addEventListener('click',()=>choosePackage(b.dataset.creditPackage)));
    $('#creditConfirmBtn')?.addEventListener('click',createPayment);
    $('#creditCheckBtn')?.addEventListener('click',()=>checkPayment(true));
    $('#creditNewQrBtn')?.addEventListener('click',newQr);
    $$('[data-credit-close]').forEach(b=>b.addEventListener('click',()=>{stopLoops();close(b.dataset.creditClose)}));
    $('#creditDialog')?.addEventListener('click',e=>{if(e.target===$('#creditDialog'))close('creditDialog')});
    $('#creditPaymentDialog')?.addEventListener('click',e=>{if(e.target===$('#creditPaymentDialog')){stopLoops();close('creditPaymentDialog')}});
    $('#creditsSide')?.addEventListener('click',()=>$('#credit-plans')?.scrollIntoView({behavior:'smooth'}));
    $('#creditWalletBtn')?.addEventListener('click',()=>$('#credit-plans')?.scrollIntoView({behavior:'smooth'}));
    window.addEventListener('storage',e=>{if(e.key==='nex_cloud_session'||e.key==='nex_prompt_lang'){applyLanguage();loadBalance()}});
    $('#langSwitch')?.addEventListener('click',e=>{if(!e.target.closest('button[data-lang]'))return;setTimeout(()=>{applyLanguage();loadBalance()},0)});
  }
  window.addEventListener('DOMContentLoaded',()=>{wire();applyLanguage();loadBalance();setTimeout(loadBalance,1800)});
  window.NexCredits={loadBalance,choosePackage};
})();
