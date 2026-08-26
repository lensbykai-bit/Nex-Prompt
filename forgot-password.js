(function(){
'use strict';
var API='https://kbanmyaqodtfoqikzwou.supabase.co/functions/v1/password-reset';
function $(s){return document.querySelector(s)}
function isKH(){return localStorage.getItem('nex_prompt_lang')==='KH'}
function setStatus(msg,type){var el=$('#authStatus');if(!el)return;el.textContent=msg||'';el.className='status'+(msg?' show '+(type||'error'):'')}
function isSignin(){var tab=$('.auth-tab[data-mode="signin"]');var form=$('#authForm');return !!(tab&&tab.classList.contains('active')&&form&&!form.hidden)}
function sync(){var row=$('#forgotPasswordRow');var btn=$('#forgotPasswordBtn');if(!row||!btn)return;row.style.display=isSignin()?'flex':'none';btn.textContent=isKH()?'ភ្លេចពាក្យសម្ងាត់?':'Forgot password?'}
function requestReset(){
  var email=(($('#authEmail')||{}).value||'').trim();
  if(!email){setStatus(isKH()?'សូមបញ្ចូល Email របស់អ្នកសិន។':'Enter your email address first.');var e=$('#authEmail');if(e)e.focus();return}
  var btn=$('#forgotPasswordBtn');if(btn){btn.disabled=true;btn.textContent=isKH()?'កំពុងផ្ញើ...':'Sending...'}
  setStatus(isKH()?'កំពុងផ្ញើ link សម្រាប់ប្តូរពាក្យសម្ងាត់...':'Sending password reset link...','success');
  fetch(API+'?action=request',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:email})})
    .then(function(r){return r.json().catch(function(){return{}}).then(function(d){if(!r.ok)throw new Error(d.error||'Could not send reset link.');return d})})
    .then(function(){setStatus(isKH()?'បានផ្ញើ Reset link ទៅ Email របស់អ្នក។ សូមពិនិត្យ Inbox និង Spam។':'Reset link sent. Check your inbox and spam folder.','success')})
    .catch(function(err){setStatus(err&&err.message?err.message:(isKH()?'មិនអាចផ្ញើ Reset link បានទេ។':'Could not send reset link.'))})
    .finally(function(){if(btn)btn.disabled=false;sync()});
}

var thankTimer=null;
var lastPaidText='';
function ensureThankDialog(){
  var d=$('#thankYouModal');
  if(d)return d;
  d=document.createElement('dialog');
  d.id='thankYouModal';
  d.style.padding='0';
  d.style.border='0';
  d.style.background='transparent';
  d.style.maxWidth='none';
  d.innerHTML='<div style="position:relative;width:min(92vw,520px);padding:42px 34px 30px;border:1px solid #6d315c;border-radius:28px;background:linear-gradient(160deg,#120c19,#0b0811);color:#fff;text-align:center;box-shadow:0 30px 90px rgba(0,0,0,.55)">'+
    '<button type="button" id="thankCloseX" style="position:absolute;right:18px;top:17px;width:42px;height:42px;border-radius:50%;border:1px solid #5e3557;background:#17101d;color:#fff;font-size:25px;cursor:pointer">×</button>'+ 
    '<div style="width:78px;height:78px;margin:4px auto 20px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,#ff3196,#ad4cf0);font-size:38px;font-weight:900">✓</div>'+ 
    '<div id="thankEyebrow" style="color:#ff69b3;font-size:12px;font-weight:900;letter-spacing:.08em;margin-bottom:10px">PAYMENT SUCCESSFUL</div>'+ 
    '<h2 id="thankTitle" style="margin:0 0 12px;font-size:30px;line-height:1.35">Thank you for using Nex Prompt</h2>'+ 
    '<p id="thankText" style="margin:0 auto 25px;max-width:390px;color:#b7abb9;font-size:14px;line-height:1.75">Your payment was completed successfully.</p>'+ 
    '<button type="button" id="thankContinue" style="width:100%;height:56px;border:0;border-radius:15px;background:linear-gradient(135deg,#ff3196,#ad4cf0);color:#fff;font-size:16px;font-weight:900;cursor:pointer">Continue</button>'+ 
    '</div>';
  document.body.appendChild(d);
  var style=document.createElement('style');
  style.textContent='#thankYouModal::backdrop{background:rgba(5,3,10,.76);backdrop-filter:blur(8px)}';
  document.head.appendChild(style);
  function close(){try{if(d.open)d.close()}catch(e){d.removeAttribute('open')}}
  $('#thankCloseX').addEventListener('click',close);
  $('#thankContinue').addEventListener('click',close);
  return d;
}
function showThankYou(){
  var d=ensureThankDialog();
  var title=$('#thankTitle'),text=$('#thankText'),eyebrow=$('#thankEyebrow'),btn=$('#thankContinue');
  if(isKH()){
    if(eyebrow)eyebrow.textContent='ទូទាត់ជោគជ័យ';
    if(title)title.textContent='អរគុណសម្រាប់ការប្រើប្រាស់';
    if(text)text.textContent='ការទូទាត់របស់អ្នកបានបញ្ចប់ដោយជោគជ័យ។ អរគុណដែលបានប្រើប្រាស់ Nex Prompt។';
    if(btn)btn.textContent='បន្ត';
  }else{
    if(eyebrow)eyebrow.textContent='PAYMENT SUCCESSFUL';
    if(title)title.textContent='Thank you for using Nex Prompt';
    if(text)text.textContent='Your payment was completed successfully. Thank you for using Nex Prompt.';
    if(btn)btn.textContent='Continue';
  }
  try{if(!d.open)d.showModal()}catch(e){d.setAttribute('open','')}
}
function isPaidStatus(){
  var s=$('#payStatus');
  var t=String(s&&s.textContent||'').trim();
  var low=t.toLowerCase();
  return {paid:low.indexOf('payment confirmed')>=0||t.indexOf('ទូទាត់ជោគជ័យ')>=0||t.indexOf('ការទូទាត់បានជោគជ័យ')>=0,text:t};
}
function watchPayment(){
  var status=$('#payStatus');
  var payment=$('#paymentModal');
  if(!status||!payment)return;
  function checkPaid(){
    var r=isPaidStatus();
    if(!r.paid)return;
    if(r.text===lastPaidText&&thankTimer)return;
    lastPaidText=r.text;
    clearTimeout(thankTimer);
    thankTimer=setTimeout(function(){
      try{if(payment.open)payment.close()}catch(e){payment.removeAttribute('open')}
      setTimeout(showThankYou,180);
      thankTimer=null;
    },900);
  }
  new MutationObserver(checkPaid).observe(status,{childList:true,subtree:true,characterData:true});
  new MutationObserver(function(ms){ms.forEach(function(m){if(m.attributeName==='open'&&payment.open){lastPaidText='';clearTimeout(thankTimer);thankTimer=null}})}).observe(payment,{attributes:true,attributeFilter:['open']});
  checkPaid();
}

function enableOutsideClose(){
  document.addEventListener('click',function(e){
    var target=e.target;
    if(!target||target.tagName!=='DIALOG'||!target.open)return;
    try{target.close()}catch(err){target.removeAttribute('open')}
  });
}

function init(){
  var btn=$('#forgotPasswordBtn');
  if(btn){
    btn.addEventListener('click',requestReset);
    document.addEventListener('click',function(e){if(e.target&&e.target.closest('.auth-tab'))setTimeout(sync,0);if(e.target&&e.target.matches('[data-lang]'))setTimeout(sync,20)});
    var modal=$('#authModal');if(modal)new MutationObserver(sync).observe(modal,{subtree:true,attributes:true,attributeFilter:['class','hidden','open']});
    sync();
  }
  watchPayment();
  enableOutsideClose();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();