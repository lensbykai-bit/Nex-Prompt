(()=>{
  const isKh=()=>localStorage.getItem('nex_prompt_lang')==='KH';
  let shownFor='';
  function closeSuccess(){document.getElementById('nexPaymentSuccess')?.remove()}
  function showSuccess(){
    const token=(window.currentPayment&&window.currentPayment.client_token)||document.querySelector('#bakongPayStatus')?.dataset.paymentToken||'paid';
    if(shownFor===token||document.getElementById('nexPaymentSuccess'))return;
    shownFor=token;
    const kh=isKh();
    const wrap=document.createElement('div');
    wrap.id='nexPaymentSuccess';
    wrap.className='nex-success-overlay';
    wrap.innerHTML=`<div class="nex-success-card" role="dialog" aria-modal="true" aria-label="Payment successful">
      <button class="nex-success-close" type="button" aria-label="Close">×</button>
      <div class="nex-confetti c1">◆</div><div class="nex-confetti c2">◆</div><div class="nex-confetti c3">◆</div><div class="nex-confetti c4">◆</div><div class="nex-confetti c5">◆</div>
      <div class="nex-success-check">✓</div>
      <h2>${kh?'អរគុណ!':'Thank You!'}</h2>
      <p class="nex-success-main">${kh?'អរគុណសម្រាប់ការប្រើប្រាស់':'Thank you for using'}<br><strong>Nex Prompt</strong></p>
      <div class="nex-success-heart">♥</div>
      <div class="nex-success-wish">💖 ${kh?'សំណាងល្អ និងសូមឲ្យអ្នកមានថ្ងៃដ៏ល្អ!':'Good luck and have a great day!'}</div>
      <button class="nex-success-home" type="button">⌂&nbsp; ${kh?'ត្រឡប់ទៅទំព័រដើម':'Back to Home'}</button>
    </div>`;
    document.body.appendChild(wrap);
    wrap.querySelector('.nex-success-close').onclick=closeSuccess;
    wrap.querySelector('.nex-success-home').onclick=()=>{closeSuccess();document.querySelector('#checkoutDialog')?.close();location.hash='#home';window.scrollTo({top:0,behavior:'smooth'})};
    wrap.addEventListener('click',e=>{if(e.target===wrap)closeSuccess()});
  }
  const style=document.createElement('style');
  style.textContent=`
  .nex-success-overlay{position:fixed;inset:0;z-index:99999;display:grid;place-items:center;padding:20px;background:rgba(48,25,47,.48);backdrop-filter:blur(9px);animation:nexFade .22s ease}
  .nex-success-card{position:relative;width:min(430px,92vw);padding:30px 30px 28px;border:1px solid rgba(255,190,220,.9);border-radius:28px;text-align:center;background:radial-gradient(circle at 50% 0,rgba(255,211,232,.55),transparent 34%),linear-gradient(180deg,#fff,#fff7fb);box-shadow:0 30px 90px rgba(126,31,88,.30);overflow:hidden;animation:nexPop .28s ease}
  .nex-success-close{position:absolute;right:16px;top:14px;width:40px;height:40px;border-radius:50%;border:1px solid #ffd4e8;background:#fff8fc;color:#42343d;font-size:25px;cursor:pointer;box-shadow:0 7px 18px rgba(230,72,149,.14)}
  .nex-success-check{width:92px;height:92px;margin:7px auto 18px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(145deg,#ff5caf,#f31380);color:#fff;font-size:55px;font-weight:900;box-shadow:0 14px 35px rgba(245,27,131,.34),0 0 0 12px rgba(255,91,174,.10)}
  .nex-success-card h2{margin:0;color:#ef187e;font-size:36px;line-height:1.2}
  .nex-success-main{margin:12px 0 5px;color:#5e5360;font-size:19px;line-height:1.55}.nex-success-main strong{color:#ed1b82;font-size:26px}
  .nex-success-heart{display:flex;align-items:center;gap:12px;justify-content:center;color:#ed1b82;font-size:25px;margin:10px 0}.nex-success-heart:before,.nex-success-heart:after{content:"";height:1px;width:82px;background:#f5c1da}
  .nex-success-wish{margin:10px 0 18px;padding:13px 16px;border:1px solid #ffd9e9;border-radius:15px;background:linear-gradient(135deg,#fff2f8,#fff8fc);color:#514451;font-size:15px}
  .nex-success-home{width:100%;min-height:52px;border:0;border-radius:15px;background:linear-gradient(135deg,#ff1588,#ff58ae);color:#fff;font-size:16px;font-weight:800;cursor:pointer;box-shadow:0 12px 26px rgba(242,28,130,.24)}
  .nex-confetti{position:absolute;color:#ff3b98;font-size:12px}.c1{left:13%;top:20%}.c2{left:25%;top:12%;color:#49c879}.c3{right:17%;top:22%;color:#ffca4b}.c4{right:25%;top:11%}.c5{left:18%;top:42%;color:#49c879}
  html[lang="km"] .nex-success-card,html[lang="km"] .nex-success-card button{font-family:"Khmer OS Metal Chrieng","Khmer OS","Noto Sans Khmer",sans-serif!important}html[lang="km"] .nex-success-card h2{font-weight:400!important;line-height:1.55;font-size:34px}html[lang="km"] .nex-success-main,html[lang="km"] .nex-success-wish{line-height:1.9}
  @keyframes nexFade{from{opacity:0}to{opacity:1}}@keyframes nexPop{from{transform:translateY(18px) scale(.97);opacity:0}to{transform:none;opacity:1}}
  @media(max-width:520px){.nex-success-card{padding:27px 20px 22px;border-radius:24px}.nex-success-check{width:78px;height:78px;font-size:46px}.nex-success-card h2{font-size:31px}.nex-success-main{font-size:17px}.nex-success-main strong{font-size:23px}.nex-success-wish{font-size:14px}}
  `;
  document.head.appendChild(style);
  const observer=new MutationObserver(()=>{
    const s=document.querySelector('#bakongPayStatus');
    if(s?.dataset.type==='paid')showSuccess();
  });
  window.addEventListener('DOMContentLoaded',()=>{observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['data-type']});const s=document.querySelector('#bakongPayStatus');if(s?.dataset.type==='paid')showSuccess()});
})();
