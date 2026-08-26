(function(){
'use strict';

var QR_API='https://kbanmyaqodtfoqikzwou.supabase.co/functions/v1/khqr-image';
var lastPayload='';
var renderSeq=0;
var countdownTimer=null;
var autoCheckTimer=null;
var expiresAt=0;

function $(s){return document.querySelector(s)}
function isKH(){return document.documentElement.lang==='km'||localStorage.getItem('nex_prompt_lang')==='KH'}
function text(en,kh){return isKH()?kh:en}

function injectStyles(){
  if($('#nexPaymentStyles'))return;
  var s=document.createElement('style');
  s.id='nexPaymentStyles';
  s.textContent=
  '#paymentModal{border:1px solid #5e2e54;background:linear-gradient(160deg,#100b17,#0c0911);overflow:visible}'+
  '#paymentModal .payment-center{width:min(440px,92vw);padding:30px 30px 26px}'+
  '#paymentModal .eyebrow{display:inline-flex;padding:7px 11px;border:1px solid #62304f;border-radius:999px;background:#21101d;color:#ff82bd;font-size:10px;letter-spacing:.08em}'+
  '#paymentModal h2{margin:15px 0 3px;font-size:25px}'+
  '#paymentModal .amount{margin:4px 0 2px;font-size:42px!important;line-height:1.1}'+
  '.pay-subtitle{margin:0 auto 13px;color:#aa9daa;font-size:12px;line-height:1.55;max-width:330px}'+
  '.pay-summary{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:13px 0 4px}'+
  '.pay-summary>div{padding:10px 11px;border:1px solid #3b263b;border-radius:12px;background:#15101a;text-align:left}'+
  '.pay-summary span{display:block;color:#877d8a;font-size:9px;text-transform:uppercase;letter-spacing:.06em}'+
  '.pay-summary strong{display:block;margin-top:4px;color:#f7eaf1;font-size:12px}'+
  '#paymentModal .qr-box{width:260px;height:260px;margin:16px auto 10px;border-radius:20px;padding:12px;background:#fff;box-shadow:0 15px 45px rgba(0,0,0,.28);overflow:hidden}'+
  '#paymentModal .qr-box svg{display:block;width:100%;height:100%}'+
  '.qr-loading{width:100%;height:100%;display:grid;place-items:center;color:#5f5360;font-size:12px;line-height:1.5;padding:20px}'+
  '.pay-hint{display:flex;justify-content:center;align-items:center;gap:7px;margin:9px auto 5px;color:#b5a7b3;font-size:11px}'+
  '.pay-dot{width:7px;height:7px;border-radius:50%;background:#ff4ba0;box-shadow:0 0 0 5px rgba(255,75,160,.1)}'+
  '.pay-expiry{margin:7px 0 0;color:#8f8390;font-size:10px}'+
  '#paymentModal #payStatus{margin:14px auto 0;border:1px solid #59432b;background:#261d0f;color:#f4c876;max-width:330px}'+
  '#paymentModal #payStatus.paid{border-color:#26593a;background:#10291a;color:#94e7b5}'+
  '#paymentModal #payStatus.expired{border-color:#6b263b;background:#32131e;color:#ff9bb6}'+
  '#paymentModal .payment-actions{margin-top:12px}'+
  '#paymentModal #checkPaymentBtn:disabled{opacity:.58;cursor:not-allowed}'+
  '@media(max-width:520px){#paymentModal .payment-center{padding:25px 18px 20px}#paymentModal .qr-box{width:235px;height:235px}.pay-summary{grid-template-columns:1fr}}
';
  document.head.appendChild(s);
}

function injectUI(){
  injectStyles();
  var amount=$('#payAmount');
  if(!amount)return;
  if(!$('#paySubtitle')){
    var sub=document.createElement('p');
    sub.id='paySubtitle';sub.className='pay-subtitle';
    amount.insertAdjacentElement('afterend',sub);
  }
  if(!$('#paySummary')){
    var summary=document.createElement('div');summary.id='paySummary';summary.className='pay-summary';
    summary.innerHTML='<div><span id="payMethodLabel">Method</span><strong>Bakong KHQR</strong></div><div><span id="payExpiryLabel">Expires in</span><strong id="payCountdown">10:00</strong></div>';
    $('#paySubtitle').insertAdjacentElement('afterend',summary);
  }
  var box=$('#qrBox');
  if(box && !$('#payHint')){
    var hint=document.createElement('div');hint.id='payHint';hint.className='pay-hint';hint.innerHTML='<span class="pay-dot"></span><span id="payHintText"></span>';
    box.insertAdjacentElement('afterend',hint);
    var exp=document.createElement('div');exp.id='payExpiryNote';exp.className='pay-expiry';hint.insertAdjacentElement('afterend',exp);
  }
  refreshText();
  watchQR();
  watchStatus();
  watchModal();
}

function refreshText(){
  var sub=$('#paySubtitle'),hint=$('#payHintText'),note=$('#payExpiryNote'),method=$('#payMethodLabel'),expiry=$('#payExpiryLabel');
  if(sub)sub.textContent=text('Scan the QR with Bakong or a supported banking app.','ស្កេន QR ដោយ Bakong ឬកម្មវិធីធនាគារដែលគាំទ្រ។');
  if(hint)hint.textContent=text('Automatic payment checking is on','កំពុងពិនិត្យការទូទាត់ដោយស្វ័យប្រវត្តិ');
  if(note)note.textContent=text('Keep this window open until payment is confirmed.','សូមទុកផ្ទាំងនេះបើករហូតដល់ការទូទាត់បានបញ្ជាក់។');
  if(method)method.textContent=text('Method','វិធីទូទាត់');
  if(expiry)expiry.textContent=text('Expires in','ផុតកំណត់ក្នុង');
}

function renderQR(payload){
  var box=$('#qrBox');if(!box||!payload)return;
  if(payload===lastPayload && box.querySelector('svg'))return;
  lastPayload=payload;
  var seq=++renderSeq;
  box.dataset.qrPayload=payload;
  box.innerHTML='<div class="qr-loading">'+text('Generating secure KHQR…','កំពុងបង្កើត KHQR…')+'</div>';
  fetch(QR_API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:payload})})
  .then(function(r){return r.json().then(function(d){if(!r.ok)throw new Error(d.error||'QR error');return d})})
  .then(function(d){if(seq!==renderSeq)return;if(d.svg){box.innerHTML=d.svg;box.setAttribute('aria-label','Bakong KHQR')}})
  .catch(function(){if(seq!==renderSeq)return;box.innerHTML='<div class="qr-loading">'+text('QR image could not load. Close and generate a new payment QR.','មិនអាចបង្ហាញ QR បាន។ សូមបិទ ហើយបង្កើត QR ទូទាត់ថ្មី។')+'</div>'});
}

function captureRawQR(){
  var box=$('#qrBox');if(!box)return;
  if(box.querySelector('svg'))return;
  var raw=(box.textContent||'').trim();
  if(raw && raw.length>30 && raw.indexOf('Generating secure KHQR')<0 && raw.indexOf('កំពុងបង្កើត KHQR')<0 && raw.indexOf('QR image could not load')<0 && raw.indexOf('មិនអាចបង្ហាញ QR')<0){renderQR(raw)}
}

function watchQR(){
  var box=$('#qrBox');if(!box||box.dataset.paymentObserved)return;
  box.dataset.paymentObserved='1';
  var obs=new MutationObserver(function(){setTimeout(captureRawQR,0)});
  obs.observe(box,{childList:true,subtree:true,characterData:true});
  captureRawQR();
}

function startCountdown(){
  clearInterval(countdownTimer);
  expiresAt=Date.now()+10*60*1000;
  function tick(){
    var el=$('#payCountdown');if(!el)return;
    var left=Math.max(0,expiresAt-Date.now());
    var sec=Math.ceil(left/1000),m=Math.floor(sec/60),s=sec%60;
    el.textContent=String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
    if(left<=0){clearInterval(countdownTimer);var st=$('#payStatus');if(st && !isPaidText(st.textContent)){st.textContent=text('QR expired. Please create a new payment.','QR បានផុតកំណត់។ សូមបង្កើតការទូទាត់ថ្មី។');st.classList.add('expired');stopAutoCheck()}}
  }
  tick();countdownTimer=setInterval(tick,1000);
}

function isPaidText(v){v=String(v||'').toLowerCase();return v.indexOf('payment confirmed')>=0||v.indexOf('ទូទាត់ជោគជ័យ')>=0||v.indexOf('បានជោគជ័យ')>=0}

function startAutoCheck(){
  stopAutoCheck();
  autoCheckTimer=setInterval(function(){
    var modal=$('#paymentModal'),btn=$('#checkPaymentBtn'),st=$('#payStatus');
    if(!modal||!modal.open){stopAutoCheck();return}
    if(st&&isPaidText(st.textContent)){markPaid();return}
    if(btn&&!btn.disabled)btn.click();
  },5000);
}
function stopAutoCheck(){if(autoCheckTimer){clearInterval(autoCheckTimer);autoCheckTimer=null}}
function markPaid(){
  stopAutoCheck();clearInterval(countdownTimer);
  var st=$('#payStatus'),btn=$('#checkPaymentBtn'),cd=$('#payCountdown');
  if(st)st.classList.add('paid');if(btn){btn.disabled=true;btn.textContent=text('Payment confirmed','បានបញ្ជាក់ការទូទាត់')};if(cd)cd.textContent=text('PAID','បានបង់');
}

function watchStatus(){
  var st=$('#payStatus');if(!st||st.dataset.paymentObserved)return;
  st.dataset.paymentObserved='1';
  new MutationObserver(function(){
    st.classList.remove('paid','expired');
    if(isPaidText(st.textContent))markPaid();
  }).observe(st,{childList:true,subtree:true,characterData:true});
}

function paymentOpened(){
  refreshText();
  var st=$('#payStatus'),btn=$('#checkPaymentBtn');
  if(st){st.classList.remove('paid','expired')}
  if(btn){btn.disabled=false;btn.textContent=text('Check payment','ពិនិត្យការទូទាត់')}
  lastPayload='';
  setTimeout(captureRawQR,30);
  startCountdown();
  startAutoCheck();
}

function watchModal(){
  var modal=$('#paymentModal');if(!modal||modal.dataset.paymentModalObserved)return;
  modal.dataset.paymentModalObserved='1';
  new MutationObserver(function(muts){
    muts.forEach(function(m){if(m.attributeName==='open'){if(modal.open)paymentOpened();else stopAutoCheck()}});
  }).observe(modal,{attributes:true,attributeFilter:['open']});
  modal.addEventListener('close',function(){stopAutoCheck();clearInterval(countdownTimer)});
}

function init(){injectUI();document.addEventListener('click',function(e){if(e.target&&e.target.matches('[data-lang]'))setTimeout(refreshText,20)})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
