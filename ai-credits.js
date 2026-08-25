(()=>{
  const CREDIT_API='https://kbanmyaqodtfoqikzwou.supabase.co/functions/v1/credits-api';
  const STORE_API='https://kbanmyaqodtfoqikzwou.supabase.co/functions/v1/store-api';
  const PACKAGES={starter_500:{id:'starter_500',credits:500,price:5.99},creator_1000:{id:'creator_1000',credits:1000,price:12}};
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const isKh=()=>localStorage.getItem('nex_prompt_lang')==='KH'||document.documentElement.lang==='km';
  const txt=(en,km)=>isKh()?km:en;
  const getSession=()=>{try{return JSON.parse(localStorage.getItem('nex_cloud_session')||'null')}catch{return null}};
  const setSession=s=>{if(s)localStorage.setItem('nex_cloud_session',JSON.stringify(s));else localStorage.removeItem('nex_cloud_session')};
  let chosen=null,currentPayment=null,statusTimer=null,countdownTimer=null,checking=false,authMode='login';

  function toast(m){const t=$('#toast');if(t){t.textContent=m;t.classList.add('show');clearTimeout(window.__nexToast);window.__nexToast=setTimeout(()=>t.classList.remove('show'),2800)}else alert(m)}
  function open(id){const d=document.getElementById(id);if(d&&!d.open){try{d.showModal()}catch{d.setAttribute('open','')}}}
  function close(id){const d=document.getElementById(id);if(d?.open){try{d.close()}catch{d.removeAttribute('open')}}}
  function safeScroll(s){document.querySelector(s)?.scrollIntoView({behavior:'smooth',block:'start'})}

  async function fetchJson(url,options={},timeout=12000){
    const c=new AbortController(),tm=setTimeout(()=>c.abort(),timeout);
    try{const r=await fetch(url,{...options,signal:c.signal});let d={};try{d=await r.json()}catch{}if(!r.ok)throw new Error(d.error||'Request failed');return d}
    catch(e){if(e?.name==='AbortError')throw new Error(txt('Connection timed out. Please try again.','ការតភ្ជាប់យូរពេក។ សូមសាកម្តងទៀត។'));throw e}
    finally{clearTimeout(tm)}
  }

  async function storeRequest(action,body){return fetchJson(`${STORE_API}?action=${encodeURIComponent(action)}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})}
  async function creditRequest(action,{method='GET',body}={}){
    const s=getSession();if(!s?.access_token)throw new Error(txt('Please sign in first.','សូមចូលគណនីជាមុន។'));
    return fetchJson(`${CREDIT_API}?action=${encodeURIComponent(action)}`,{method,headers:{'Content-Type':'application/json','Authorization':`Bearer ${s.access_token}`},body:body?JSON.stringify(body):undefined});
  }

  function injectUiCss(){
    if($('#nex-auth-hardfix'))return;
    const s=document.createElement('style');s.id='nex-auth-hardfix';s.textContent=`
      #loginBtn{display:inline-flex!important;pointer-events:auto!important;position:relative!important;z-index:999!important;align-items:center!important;justify-content:center!important;min-height:42px!important;padding:0 17px!important;border-radius:14px!important;background:linear-gradient(135deg,#ff2d92,#ec2782)!important;color:#fff!important;border:1px solid rgba(255,119,180,.42)!important;box-shadow:0 9px 22px rgba(236,39,130,.22)!important;font-weight:800!important;white-space:nowrap!important}
      #authDialog.nex-auth-dialog{width:min(460px,94vw)!important;border:1px solid rgba(255,87,160,.28)!important;border-radius:26px!important;padding:0!important;background:linear-gradient(180deg,#fff,#fff8fc)!important;box-shadow:0 30px 90px rgba(71,18,55,.32)!important;overflow:hidden!important}
      #authDialog.nex-auth-dialog::backdrop{background:rgba(16,8,22,.66)!important;backdrop-filter:blur(9px)!important}
      .nex-auth-wrap{position:relative;padding:30px}.nex-auth-logo{width:58px;height:58px;border-radius:18px;display:grid;place-items:center;margin:0 auto 14px;background:linear-gradient(145deg,#ff54a4,#ef1f83);color:#fff;font-size:25px;box-shadow:0 12px 28px rgba(239,31,131,.25)}
      .nex-auth-wrap h2{margin:0;text-align:center;color:#18121a;font-size:27px}.nex-auth-sub{margin:6px 0 18px!important;text-align:center;color:#887a85!important;font-size:12px!important}
      .nex-auth-tabs{display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:5px;border-radius:14px;background:#f8edf3;margin-bottom:15px}.nex-auth-tab{border:0;border-radius:10px;padding:10px;background:transparent;color:#8e7382;font-weight:800}.nex-auth-tab.active{background:#fff;color:#ed2c86;box-shadow:0 5px 16px rgba(109,54,84,.09)}
      .nex-auth-field{margin:9px 0}.nex-auth-field label{display:block;margin:0 0 5px;color:#675963;font-size:11px;font-weight:700}.nex-auth-field input{width:100%;height:47px;border:1px solid #ead8e2;border-radius:13px;padding:0 14px;background:#fff;outline:0;color:#231b22}.nex-auth-field input:focus{border-color:#ff69ae;box-shadow:0 0 0 3px rgba(255,83,158,.10)}
      .nex-pass{position:relative}.nex-pass input{padding-right:50px}.nex-eye{position:absolute;right:7px;top:7px;width:34px;height:34px;border:0;border-radius:9px;background:#fff4f9;cursor:pointer}
      .nex-auth-submit{width:100%;min-height:49px;margin-top:9px;border:0;border-radius:14px;background:linear-gradient(105deg,#ff258f,#ff62aa);color:#fff;font-weight:900;box-shadow:0 12px 25px rgba(239,39,133,.20)}
      .nex-auth-status{display:none;margin-top:12px;padding:11px 13px;border-radius:11px;font-size:11px;line-height:1.6;background:#fff0f7;color:#c52f75}.nex-auth-status.show{display:block}.nex-auth-status[data-type=success]{background:#effcf4;color:#238154}.nex-auth-status[data-type=error]{background:#fff0f1;color:#b83b4e}
      .nex-auth-logout{display:none;width:100%;margin-top:10px;min-height:43px;border:1px solid #f0cadd;border-radius:13px;background:#fff;color:#c52f75;font-weight:800}
      #authDialog .nex-auth-close{position:absolute!important;right:14px!important;top:12px!important;width:38px!important;height:38px!important;border:1px solid #f3d3e2!important;border-radius:50%!important;background:#fff7fb!important;color:#7a586a!important;font-size:22px!important;z-index:3!important}
      .ai-tool-card{cursor:pointer!important}
      @media(max-width:700px){#loginBtn{min-height:38px!important;padding:0 10px!important;font-size:10px!important}.nex-auth-wrap{padding:25px 18px}}
    `;document.head.appendChild(s);
  }

  function authStatus(m,type='info'){const el=$('#nexAuthStatus');if(!el)return;el.textContent=m||'';el.dataset.type=type;el.classList.toggle('show',!!m)}

  function buildAuth(){
    const d=$('#authDialog');if(!d)return;d.className='nex-auth-dialog';
    d.innerHTML=`<div class="nex-auth-wrap">
      <button type="button" class="nex-auth-close" id="nexAuthClose">×</button>
      <div class="nex-auth-logo">▶</div><h2>Nex Prompt</h2><p class="nex-auth-sub" id="nexAuthSub"></p>
      <div class="nex-auth-tabs"><button type="button" class="nex-auth-tab" data-nex-auth="login"></button><button type="button" class="nex-auth-tab" data-nex-auth="signup"></button></div>
      <form id="nexAuthForm" novalidate>
        <div class="nex-auth-field" id="nexNameField"><label id="nexNameLabel"></label><input id="nexAuthName" autocomplete="name"></div>
        <div class="nex-auth-field"><label id="nexEmailLabel"></label><input id="nexAuthEmail" type="email" autocomplete="email" required></div>
        <div class="nex-auth-field"><label id="nexPassLabel"></label><div class="nex-pass"><input id="nexAuthPassword" type="password" minlength="6" autocomplete="current-password" required><button type="button" class="nex-eye" id="nexAuthEye">👁</button></div></div>
        <button type="submit" class="nex-auth-submit" id="nexAuthSubmit"></button>
      </form>
      <div class="nex-auth-status" id="nexAuthStatus"></div>
      <button type="button" class="nex-auth-logout" id="nexAuthLogout"></button>
    </div>`;
    $('#nexAuthClose').onclick=()=>close('authDialog');
    $$('.nex-auth-tab').forEach(b=>b.onclick=()=>setAuthMode(b.dataset.nexAuth));
    $('#nexAuthEye').onclick=()=>{const p=$('#nexAuthPassword');p.type=p.type==='password'?'text':'password';$('#nexAuthEye').textContent=p.type==='password'?'👁':'🙈'};
    $('#nexAuthForm').onsubmit=e=>{e.preventDefault();e.stopPropagation();submitAuth()};
    $('#nexAuthLogout').onclick=()=>{setSession(null);refreshAuthEntry();loadBalance();setAuthMode('login');authStatus(txt('Signed out.','បានចាកចេញពីគណនី។'),'success')};
    applyAuthLanguage();setAuthMode('login');
  }

  function applyAuthLanguage(){
    if(!$('#nexAuthForm'))return;
    const kh=isKh();
    const map={sub:kh?'ចូលគណនី ឬបង្កើតគណនីថ្មី':'Sign in or create a new account',login:kh?'ចូល':'Login',signup:kh?'ចុះឈ្មោះ':'Sign up',name:kh?'ឈ្មោះ':'Display name',email:kh?'អ៊ីមែល':'Email address',pass:kh?'ពាក្យសម្ងាត់':'Password',logout:kh?'ចាកចេញ':'Sign out'};
    $('#nexAuthSub').textContent=map.sub;$$('.nex-auth-tab')[0].textContent=map.login;$$('.nex-auth-tab')[1].textContent=map.signup;$('#nexNameLabel').textContent=map.name;$('#nexEmailLabel').textContent=map.email;$('#nexPassLabel').textContent=map.pass;$('#nexAuthLogout').textContent=map.logout;
    $('#nexAuthName').placeholder=map.name;$('#nexAuthEmail').placeholder=map.email;$('#nexAuthPassword').placeholder=map.pass;setAuthMode(authMode,false);
  }

  function setAuthMode(mode,clear=true){
    authMode=mode==='signup'?'signup':'login';
    $$('.nex-auth-tab').forEach(b=>b.classList.toggle('active',b.dataset.nexAuth===authMode));
    const logged=!!getSession()?.access_token;$('#nexNameField').style.display=authMode==='signup'?'block':'none';$('#nexAuthSubmit').textContent=authMode==='signup'?txt('Create account','បង្កើតគណនី'):txt('Sign in','ចូលគណនី');$('#nexAuthLogout').style.display=logged?'block':'none';
    if(clear)authStatus('');
  }

  async function submitAuth(){
    const email=$('#nexAuthEmail').value.trim(),password=$('#nexAuthPassword').value,name=$('#nexAuthName').value.trim(),btn=$('#nexAuthSubmit');
    if(!email||!password||(authMode==='signup'&&!name)){authStatus(txt('Please complete all required fields.','សូមបំពេញព័ត៌មានឲ្យគ្រប់។'),'error');return}
    if(password.length<6){authStatus(txt('Password must be at least 6 characters.','ពាក្យសម្ងាត់ត្រូវមានយ៉ាងហោចណាស់ 6 តួ។'),'error');return}
    btn.disabled=true;btn.textContent=txt('Please wait…','សូមរង់ចាំ…');authStatus('');
    try{
      if(authMode==='signup'){
        const d=await storeRequest('signup',{name,email,password});
        if(d.session){setSession(d.session);refreshAuthEntry();await loadBalance();close('authDialog');toast(txt('Account created successfully.','បង្កើតគណនីបានជោគជ័យ។'))}
        else authStatus(txt('Confirmation email sent. Confirm your email, then sign in.','បានផ្ញើអ៊ីមែលបញ្ជាក់។ សូម Confirm រួចចូលគណនី។'),'success');
      }else{
        const d=await storeRequest('signin',{email,password});if(!d.session?.access_token)throw new Error(txt('Could not sign in.','មិនអាចចូលគណនីបាន។'));setSession(d.session);refreshAuthEntry();await loadBalance();close('authDialog');toast(txt('Signed in successfully.','ចូលគណនីបានជោគជ័យ។'));
      }
    }catch(e){authStatus(e.message||txt('Request failed.','សំណើមិនបានសម្រេច។'),'error')}
    finally{btn.disabled=false;setAuthMode(authMode,false)}
  }

  function showAuth(mode='login'){if(!$('#nexAuthForm'))buildAuth();applyAuthLanguage();setAuthMode(mode);open('authDialog')}
  function refreshAuthEntry(){injectUiCss();const b=$('#loginBtn');if(!b)return;const s=getSession();b.textContent=s?.access_token?txt('My Account','គណនីរបស់ខ្ញុំ'):txt('Login / Sign up','ចូល / ចុះឈ្មោះ');b.style.display='inline-flex';b.onclick=e=>{e.preventDefault();e.stopPropagation();showAuth('login')}}

  function authRequired(){const s=getSession();if(s?.access_token)return s;close('creditDialog');close('creditPaymentDialog');showAuth('login');toast(txt('Sign in first to buy credits.','សូមចូលគណនីជាមុន ដើម្បីទិញ Credits។'));return null}
  function formatCredits(n){return Number(n||0).toLocaleString()+' Credits'}
  async function loadBalance(){const pill=$('#creditBalance');if(!pill)return;const s=getSession();if(!s?.access_token){pill.textContent=txt('Sign in','ចូលគណនី');pill.dataset.balance='0';return}try{const d=await creditRequest('balance');pill.textContent=formatCredits(d.balance);pill.dataset.balance=String(d.balance||0)}catch{pill.textContent=txt('Account','គណនី')}}
  function choosePackage(id){const p=PACKAGES[id];if(!p||!authRequired())return;chosen=p;$('#creditOrderCredits').textContent=formatCredits(p.credits);$('#creditOrderPrice').textContent='$'+p.price.toFixed(2);$('#creditOrderTitle').textContent=txt('Buy AI Credits','ទិញ AI Credits');$('#creditOrderText').textContent=txt('Credits are shared across supported AI tools.','Credits អាចប្រើរួមគ្នាជាមួយ AI Tools ដែលបានភ្ជាប់។');open('creditDialog')}
  function loadQrLib(){if(window.QRCode)return Promise.resolve();return new Promise((resolve,reject)=>{const old=$('#nexQrLib');if(old){old.addEventListener('load',resolve,{once:true});old.addEventListener('error',reject,{once:true});return}const s=document.createElement('script');s.id='nexQrLib';s.src='https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js';s.onload=resolve;s.onerror=reject;document.head.appendChild(s)})}
  async function renderQr(text){const box=$('#creditQr');if(!box)return;box.innerHTML='<div class="credit-spinner"></div>';try{await loadQrLib();box.innerHTML='';new QRCode(box,{text,width:240,height:240,colorDark:'#000',colorLight:'#fff',correctLevel:QRCode.CorrectLevel.M})}catch{box.innerHTML=`<div style="padding:25px;text-align:center;color:#d94a87">${txt('Could not render QR.','មិនអាចបង្ហាញ QR បាន។')}</div>`}}
  function stopLoops(){if(statusTimer)clearInterval(statusTimer);if(countdownTimer)clearInterval(countdownTimer);statusTimer=countdownTimer=null}
  function setStatus(m,type='pending'){const s=$('#creditPayStatus');if(s){s.textContent=m;s.dataset.type=type}}
  function updateCountdown(){if(!currentPayment)return;const el=$('#creditPayTimer');if(!el)return;const ms=new Date(currentPayment.expires_at).getTime()-Date.now();if(ms<=0){el.textContent='00:00';setStatus(txt('QR expired. Generate a new QR.','QR ផុតកំណត់ហើយ។ សូមបង្កើត QR ថ្មី។'),'error');stopLoops();return}const sec=Math.floor(ms/1000);el.textContent=`${String(Math.floor(sec/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`}
  function startLoops(){stopLoops();updateCountdown();countdownTimer=setInterval(updateCountdown,1000);statusTimer=setInterval(()=>checkPayment(false),15000)}
  function fillPayment(p){currentPayment=p;$('#creditPayAmount').textContent='$'+Number(p.amount_usd).toFixed(2);$('#creditPayCredits').textContent=formatCredits(p.credits);$('#creditSuccessBox')?.classList.remove('show');$('#creditSuccessBalance').textContent='';setStatus(txt('Waiting for payment…','កំពុងរង់ចាំការទូទាត់…'));renderQr(p.qr_string);startLoops()}
  async function createPayment(){if(!chosen||!authRequired())return;const b=$('#creditConfirmBtn');b.disabled=true;b.textContent=txt('Generating QR…','កំពុងបង្កើត QR…');try{const d=await creditRequest('create',{method:'POST',body:{package_id:chosen.id}});close('creditDialog');fillPayment(d.payment);open('creditPaymentDialog')}catch(e){toast(e.message)}finally{b.disabled=false;b.textContent=txt('Pay with Bakong KHQR','ទូទាត់តាម Bakong KHQR')}}
  async function checkPayment(manual=true){if(!currentPayment||checking)return;checking=true;const b=$('#creditCheckBtn');if(manual&&b){b.disabled=true;b.textContent=txt('Checking…','កំពុងពិនិត្យ…')}try{const d=await creditRequest('status',{method:'POST',body:{client_token:currentPayment.client_token}});if(d.status==='paid'){stopLoops();setStatus(txt('Payment received — credits added ✓','ទូទាត់ជោគជ័យ — Credits បានបញ្ចូល ✓'),'paid');$('#creditSuccessBox')?.classList.add('show');$('#creditSuccessBalance').textContent=txt(`New balance: ${formatCredits(d.balance)}`,`Credits សរុបថ្មី៖ ${formatCredits(d.balance)}`);await loadBalance();toast(txt(`${d.credits} credits added.`,`${d.credits} Credits បានបញ្ចូល។`))}else if(d.status==='expired'){stopLoops();setStatus(txt('QR expired. Generate a new QR.','QR ផុតកំណត់ហើយ។ សូមបង្កើត QR ថ្មី។'),'error')}else setStatus(txt('Waiting for payment…','កំពុងរង់ចាំការទូទាត់…'))}catch(e){if(manual)toast(e.message)}finally{checking=false;if(manual&&b){b.disabled=false;b.textContent=txt('Check payment','ពិនិត្យការទូទាត់')}}}
  async function newQr(){if(!chosen&&currentPayment)chosen=PACKAGES[currentPayment.package_id]||{id:currentPayment.package_id,credits:+currentPayment.credits,price:+currentPayment.amount_usd};if(!chosen||!authRequired())return;try{const d=await creditRequest('create',{method:'POST',body:{package_id:chosen.id}});fillPayment(d.payment)}catch(e){toast(e.message)}}

  function applyLanguage(){refreshAuthEntry();applyAuthLanguage();$$('[data-credit-en]').forEach(el=>{const next=isKh()?el.dataset.creditKm:el.dataset.creditEn;if(next&&el.textContent!==next)el.textContent=next});const pill=$('#creditBalance');if(pill&&!getSession()?.access_token)pill.textContent=txt('Sign in','ចូលគណនី');if($('#creditConfirmBtn'))$('#creditConfirmBtn').textContent=txt('Pay with Bakong KHQR','ទូទាត់តាម Bakong KHQR');if($('#creditCheckBtn'))$('#creditCheckBtn').textContent=txt('Check payment','ពិនិត្យការទូទាត់');if($('#creditNewQrBtn'))$('#creditNewQrBtn').textContent=txt('Generate new QR','បង្កើត QR ថ្មី')}

  function wire(){
    injectUiCss();buildAuth();refreshAuthEntry();
    document.addEventListener('click',e=>{const login=e.target.closest('#loginBtn');if(login){e.preventDefault();e.stopImmediatePropagation();showAuth('login');return}},true);
    $$('[data-credit-package]').forEach(b=>b.onclick=()=>choosePackage(b.dataset.creditPackage));
    if($('#creditConfirmBtn'))$('#creditConfirmBtn').onclick=createPayment;if($('#creditCheckBtn'))$('#creditCheckBtn').onclick=()=>checkPayment(true);if($('#creditNewQrBtn'))$('#creditNewQrBtn').onclick=newQr;
    $$('[data-credit-close]').forEach(b=>b.onclick=()=>{stopLoops();close(b.dataset.creditClose)});
    if($('#creditsSide'))$('#creditsSide').onclick=()=>safeScroll('#credit-plans');if($('#creditWalletBtn'))$('#creditWalletBtn').onclick=()=>safeScroll('#credit-plans');
    $$('.ai-tool-card').forEach(card=>card.onclick=()=>toast(txt('This AI tool will be connected in the next step.','AI Tool នេះនឹងភ្ជាប់ API នៅជំហានបន្ទាប់។')));
    if($('#cartBtn'))$('#cartBtn').onclick=e=>{e.preventDefault();try{if(typeof renderCart==='function')renderCart()}catch{}open('cartDialog')};
    if($('#mobileCart'))$('#mobileCart').onclick=e=>{e.preventDefault();try{if(typeof renderCart==='function')renderCart()}catch{}open('cartDialog')};
    if($('#exploreBtn'))$('#exploreBtn').onclick=()=>safeScroll('#popular');if($('#howBtn'))$('#howBtn').onclick=()=>safeScroll('#how');
    window.addEventListener('storage',e=>{if(e.key==='nex_cloud_session'||e.key==='nex_prompt_lang'){applyLanguage();loadBalance()}});
    $('#langSwitch')?.addEventListener('click',()=>setTimeout(()=>{applyLanguage();loadBalance()},0));
    applyLanguage();loadBalance();
    setTimeout(()=>{refreshAuthEntry();applyLanguage()},1000);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wire,{once:true});else wire();
  window.NexCredits={loadBalance,choosePackage,showAuth};
})();
