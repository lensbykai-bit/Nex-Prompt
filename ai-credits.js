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
  const close=id=>{const d=document.getElementById(id);if(d?.open)d.close()};

  function safeScroll(selector){document.querySelector(selector)?.scrollIntoView({behavior:'smooth',block:'start'})}

  function bindOnce(el,key,handler,options){
    if(!el)return;
    const flag='nexBound'+key;
    if(el.dataset[flag])return;
    el.dataset[flag]='1';
    el.addEventListener('click',handler,options);
  }

  function wireImmediateInteractions(){
    ensureAuthEntry();

    bindOnce($('#loginBtn'),'Login',e=>{
      e.preventDefault();e.stopImmediatePropagation();
      try{if(typeof authStatus==='function')authStatus('');if(typeof updateConfirmCooldown==='function')updateConfirmCooldown()}catch{}
      open('authDialog');
    },true);

    const authForm=$('#authForm');
    if(authForm&&!authForm.dataset.nexImmediateSubmit){
      authForm.dataset.nexImmediateSubmit='1';
      authForm.addEventListener('submit',e=>{
        e.preventDefault();e.stopImmediatePropagation();
        if(typeof signup==='function')signup();
      },true);
    }

    bindOnce($('#signInBtn'),'SignIn',e=>{
      e.preventDefault();e.stopImmediatePropagation();
      if(typeof signin==='function')signin();
    },true);

    bindOnce($('#logoutBtn'),'Logout',e=>{
      e.preventDefault();e.stopImmediatePropagation();
      try{
        if(typeof session!=='undefined')session=null;
        if(typeof favorites!=='undefined')favorites=[];
        if(typeof purchases!=='undefined')purchases=[];
        localStorage.removeItem('nex_cloud_session');
        if(typeof updateUser==='function')updateUser();
        if(typeof renderPrompts==='function')renderPrompts();
        close('authDialog');
        showToast(txt('Signed out.','បានចាកចេញពីគណនី។'));
        loadBalance();ensureAuthEntry();
      }catch{}
    },true);

    $$('[data-close]').forEach(b=>bindOnce(b,'Close',e=>{
      e.preventDefault();e.stopImmediatePropagation();close(b.dataset.close);
    },true));

    bindOnce($('#cartBtn'),'Cart',e=>{
      e.preventDefault();e.stopImmediatePropagation();
      try{if(typeof renderCart==='function')renderCart()}catch{}
      open('cartDialog');
    },true);
    bindOnce($('#mobileCart'),'MobileCart',e=>{
      e.preventDefault();e.stopImmediatePropagation();
      try{if(typeof renderCart==='function')renderCart()}catch{}
      open('cartDialog');
    },true);

    bindOnce($('#exploreBtn'),'Explore',e=>{e.preventDefault();e.stopImmediatePropagation();safeScroll('#popular')},true);
    bindOnce($('#viewAllBtn'),'ViewAll',e=>{e.preventDefault();e.stopImmediatePropagation();safeScroll('#popular')},true);
    bindOnce($('#creatorAdminBtn'),'CreatorExplore',e=>{e.preventDefault();e.stopImmediatePropagation();safeScroll('#popular')},true);
    bindOnce($('#howBtn'),'How',e=>{e.preventDefault();e.stopImmediatePropagation();safeScroll('#how')},true);

    bindOnce($('#mobileMenuBtn'),'Menu',e=>{
      e.preventDefault();e.stopImmediatePropagation();$('#sidebar')?.classList.toggle('open');
    },true);

    $$('.category').forEach(b=>bindOnce(b,'Category',e=>{
      e.preventDefault();e.stopImmediatePropagation();
      try{
        if(typeof activeFilter!=='undefined')activeFilter=b.dataset.filter||'all';
        $$('.category').forEach(x=>x.classList.toggle('active',x===b));
        if(typeof renderPrompts==='function')renderPrompts();
      }catch{}
    },true));

    $$('.filter-link').forEach(a=>bindOnce(a,'Filter',e=>{
      try{
        if(typeof activeFilter!=='undefined')activeFilter=a.dataset.filter||'all';
        if(typeof renderPrompts==='function')renderPrompts();
      }catch{}
    },true));

    const grid=$('#promptGrid');
    if(grid&&!grid.dataset.nexImmediateGrid){
      grid.dataset.nexImmediateGrid='1';
      grid.addEventListener('click',e=>{
        const heart=e.target.closest('[data-heart]');
        if(heart){e.preventDefault();e.stopImmediatePropagation();if(typeof toggleFavorite==='function')toggleFavorite(heart.dataset.heart);return}
        const card=e.target.closest('.prompt-card');
        if(card&&typeof openProduct==='function'){e.preventDefault();e.stopImmediatePropagation();openProduct(card.dataset.id)}
      },true);
    }

    bindOnce($('#footerLogin'),'FooterLogin',e=>{e.preventDefault();e.stopImmediatePropagation();open('authDialog')},true);

    const contact=$('#contactForm');
    if(contact&&!contact.dataset.nexImmediateSubmit){
      contact.dataset.nexImmediateSubmit='1';
      contact.addEventListener('submit',e=>{
        e.preventDefault();e.stopImmediatePropagation();showToast(txt('Message ready.','សាររបស់អ្នកបានត្រៀមរួច។'));
      },true);
    }
  }

  function authRequired(){
    const s=getSession();
    if(s?.access_token)return s;
    close('creditDialog');close('creditPaymentDialog');
    open('authDialog');
    showToast(txt('Sign in first to buy credits.','សូមចូលគណនីជាមុន ដើម្បីទិញ Credits។'));
    return null;
  }
  async function request(action,{method='GET',body}={}){
    const s=getSession();
    if(!s?.access_token)throw new Error(txt('Please sign in first.','សូមចូលគណនីជាមុន។'));
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),12000);
    try{
      const r=await fetch(`${CREDIT_API}?action=${encodeURIComponent(action)}`,{
        method,headers:{'Content-Type':'application/json','Authorization':`Bearer ${s.access_token}`},
        body:body?JSON.stringify(body):undefined,signal:controller.signal
      });
      let d={};try{d=await r.json()}catch{}
      if(!r.ok)throw new Error(d.error||txt('Request failed.','សំណើមិនបានសម្រេច។'));
      return d;
    }catch(e){
      if(e?.name==='AbortError')throw new Error(txt('Connection timed out. Please try again.','ការតភ្ជាប់យូរពេក។ សូមសាកម្តងទៀត។'));
      throw e;
    }finally{clearTimeout(timer)}
  }
  function formatCredits(n){return Number(n||0).toLocaleString()+' Credits'}
  function ensureAuthEntry(){
    let style=document.getElementById('nex-auth-entry-override');
    if(!style){
      style=document.createElement('style');
      style.id='nex-auth-entry-override';
      style.textContent=`
        #loginBtn{display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:7px!important;white-space:nowrap!important;min-height:42px!important;padding:0 17px!important;border-radius:14px!important;background:linear-gradient(135deg,#ff2d92,#ec2782)!important;color:#fff!important;border:1px solid rgba(255,119,180,.42)!important;box-shadow:0 9px 22px rgba(236,39,130,.22)!important;font-weight:800!important;cursor:pointer!important;pointer-events:auto!important;position:relative!important;z-index:20!important}
        #loginBtn:hover{filter:brightness(1.06)!important;transform:translateY(-1px)!important}
        button,a,input,select,textarea{pointer-events:auto}
        @media(max-width:900px){#loginBtn{padding:0 12px!important;font-size:11px!important}}
        @media(max-width:700px){#loginBtn{min-height:38px!important;padding:0 10px!important;font-size:10px!important}}
      `;
      document.head.appendChild(style);
    }
    const b=$('#loginBtn');
    if(b&&!getSession()?.access_token)b.textContent=isKh()?'ចូល / ចុះឈ្មោះ':'Login / Sign up';
  }
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
    ensureAuthEntry();
  }
  function wire(){
    wireImmediateInteractions();
    $$('[data-credit-package]').forEach(b=>b.addEventListener('click',()=>choosePackage(b.dataset.creditPackage)));
    $('#creditConfirmBtn')?.addEventListener('click',createPayment);
    $('#creditCheckBtn')?.addEventListener('click',()=>checkPayment(true));
    $('#creditNewQrBtn')?.addEventListener('click',newQr);
    $$('[data-credit-close]').forEach(b=>b.addEventListener('click',()=>{stopLoops();close(b.dataset.creditClose)}));
    $('#creditDialog')?.addEventListener('click',e=>{if(e.target===$('#creditDialog'))close('creditDialog')});
    $('#creditPaymentDialog')?.addEventListener('click',e=>{if(e.target===$('#creditPaymentDialog')){stopLoops();close('creditPaymentDialog')}});
    $('#creditsSide')?.addEventListener('click',()=>safeScroll('#credit-plans'));
    $('#creditWalletBtn')?.addEventListener('click',()=>safeScroll('#credit-plans'));
    window.addEventListener('storage',e=>{if(e.key==='nex_cloud_session'||e.key==='nex_prompt_lang'){applyLanguage();loadBalance()}});
    $('#langSwitch')?.addEventListener('click',e=>{if(!e.target.closest('button[data-lang]'))return;setTimeout(()=>{applyLanguage();loadBalance();wireImmediateInteractions()},0)});
  }
  window.addEventListener('DOMContentLoaded',()=>{
    wire();ensureAuthEntry();applyLanguage();loadBalance();
    setTimeout(()=>{ensureAuthEntry();applyLanguage();wireImmediateInteractions();loadBalance()},800);
    setTimeout(()=>{wireImmediateInteractions()},2500);
  });
  window.NexCredits={loadBalance,choosePackage};
})();
