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
function init(){
  var btn=$('#forgotPasswordBtn');if(!btn)return;
  btn.addEventListener('click',requestReset);
  document.addEventListener('click',function(e){if(e.target&&e.target.closest('.auth-tab'))setTimeout(sync,0);if(e.target&&e.target.matches('[data-lang]'))setTimeout(sync,20)});
  var modal=$('#authModal');if(modal)new MutationObserver(sync).observe(modal,{subtree:true,attributes:true,attributeFilter:['class','hidden','open']});
  sync();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();