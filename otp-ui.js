(()=>{
  const API_URL='https://kbanmyaqodtfoqikzwou.supabase.co/functions/v1/store-api';
  const q=s=>document.querySelector(s);
  function showOtp(email){
    const form=q('#authForm'); if(!form)return;
    let box=q('#otpVerifyBox');
    if(!box){
      box=document.createElement('div'); box.id='otpVerifyBox';
      box.style.cssText='display:none;margin-top:12px;padding:14px;border:1px solid #e4ddff;border-radius:14px;background:#faf8ff';
      box.innerHTML='<div style="font-weight:800;font-size:13px;margin-bottom:5px">Enter verification code</div><div style="font-size:11px;color:#73788a;line-height:1.5;margin-bottom:10px">We sent a 6-digit code to <b id="otpEmailLabel"></b>.</div><input id="authOtp" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="000000" style="width:100%;text-align:center;font-size:22px;font-weight:800;letter-spacing:.3em;margin:0 0 10px"><button id="verifyOtpBtn" type="button" class="primary full">Verify code</button>';
      const status=q('#authStatus'); (status||form.lastElementChild).insertAdjacentElement('afterend',box);
      q('#verifyOtpBtn').addEventListener('click',verifyOtp);
      q('#authOtp').addEventListener('input',e=>{e.target.value=e.target.value.replace(/\D/g,'').slice(0,6)});
    }
    q('#otpEmailLabel').textContent=email||q('#authEmail')?.value||'';
    box.style.display='block';
    setTimeout(()=>q('#authOtp')?.focus(),60);
  }
  async function verifyOtp(){
    const email=q('#authEmail')?.value.trim(), token=q('#authOtp')?.value.trim(), b=q('#verifyOtpBtn');
    if(!email||token.length!==6){authStatus('Enter the 6-digit verification code from your email.','error');return}
    if(b){b.disabled=true;b.textContent='Verifying…'}
    try{
      const d=await api('verify-email',{method:'POST',body:{email,token}});
      if(d.session){session=d.session;localStorage.setItem('nex_cloud_session',JSON.stringify(session));await syncAccount();authStatus('Email verified successfully.','success');setTimeout(()=>closeDialog('authDialog'),500);toast('Account verified and signed in')}
      else authStatus('Email verified. You can now sign in.','success');
    }catch(err){authStatus(String(err.message||'Invalid or expired verification code.'),'error')}
    finally{if(b){b.disabled=false;b.textContent='Verify code'}}
  }
  window.addEventListener('DOMContentLoaded',()=>{
    const p=q('#authDialog p'); if(p)p.textContent='Create your account and verify with a 6-digit email code.';
    const resend=q('#resendConfirmBtn'); if(resend)resend.textContent='Resend verification code';
  });
  signup=async function(){
    const name=q('#authName').value.trim(),email=q('#authEmail').value.trim(),password=q('#authPassword').value;
    if(!name||!email||!password)return authStatus('Please complete all fields.','error');
    const left=confirmSecondsLeft();if(left>0){showOtp(email);return authStatus(`A code was already sent. Check your email or wait ${left} seconds to resend.`,'info')}
    const btn=q('#authForm button[type="submit"]');if(btn){btn.disabled=true;btn.textContent='Sending code…'}
    authStatus('Creating account and sending verification code…','info');
    try{
      const d=await api('signup',{method:'POST',body:{name,email,password}});
      if(d.session){session=d.session;localStorage.setItem('nex_cloud_session',JSON.stringify(session));await syncAccount();closeDialog('authDialog');toast('Account created and signed in')}
      else{setLastConfirmationNow();showOtp(email);authStatus('Verification code sent. Enter the 6-digit code from the newest email.','success')}
    }catch(err){const msg=String(err.message||'');if(msg.toLowerCase().includes('wait')||msg.includes('60 seconds')){setLastConfirmationNow();showOtp(email);authStatus('A code was already requested. Check your newest email or wait before resending.','info')}else authStatus(msg,'error')}
    finally{updateConfirmCooldown()}
  };
  resendConfirmation=async function(){
    const email=q('#authEmail').value.trim();if(!email)return authStatus('Enter your email address first.','error');
    const left=confirmSecondsLeft();if(left>0)return authStatus(`Please wait ${left} seconds before resending.`,'info');
    const b=q('#resendConfirmBtn');if(b){b.disabled=true;b.textContent='Sending code…'}
    try{await api('resend-confirmation',{method:'POST',body:{email}});setLastConfirmationNow();showOtp(email);authStatus('A new verification code was sent. Use only the newest code.','success')}
    catch(err){const msg=String(err.message||'');if(msg.toLowerCase().includes('wait')){setLastConfirmationNow();authStatus('Please wait before requesting another code.','info')}else authStatus(msg,'error')}
    finally{updateConfirmCooldown();if(b&&confirmSecondsLeft()===0)b.textContent='Resend verification code'}
  };
})();
