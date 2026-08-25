(()=>{
  const css=`
  /* Cinematic Bakong checkout — compact, centered, no top/bottom clipping */
  #checkoutDialog.checkout-modal{
    width:min(920px,95vw)!important;
    max-width:920px!important;
    height:auto!important;
    max-height:92vh!important;
    margin:auto!important;
    padding:0!important;
    border:1px solid rgba(255,73,155,.28)!important;
    border-radius:26px!important;
    overflow:auto!important;
    color:#f8f5ff!important;
    background:
      radial-gradient(circle at 16% 12%,rgba(238,39,132,.16),transparent 30%),
      radial-gradient(circle at 86% 72%,rgba(154,45,139,.18),transparent 30%),
      linear-gradient(145deg,#110c20 0%,#170d29 46%,#090d20 100%)!important;
    box-shadow:0 34px 100px rgba(20,6,30,.55),0 0 0 1px rgba(255,255,255,.025) inset!important;
    scrollbar-width:thin;
    scrollbar-color:#5d365d transparent;
  }
  #checkoutDialog.checkout-modal::backdrop{background:rgba(13,8,24,.62)!important;backdrop-filter:blur(10px)!important}
  #checkoutDialog .bakong-checkout{
    min-height:0!important;
    padding:22px 34px 26px!important;
    display:grid!important;
    grid-template-columns:minmax(250px,.92fr) minmax(280px,1.08fr)!important;
    grid-template-areas:
      "brand chip"
      "title title"
      "amount amount"
      "qr timer"
      "qr status"
      "qr help"
      "secure secure"
      "actions actions"!important;
    align-items:center!important;
    column-gap:24px!important;
    row-gap:10px!important;
    text-align:left!important;
    background:transparent!important;
  }
  #checkoutDialog .bakong-close{
    position:fixed!important;
    right:max(calc((100vw - min(920px,95vw))/2 + 14px),18px)!important;
    top:max(calc((100vh - min(92vh,820px))/2 + 12px),18px)!important;
    z-index:6!important;
    width:42px!important;height:42px!important;
    display:grid!important;place-items:center!important;
    border:1px solid rgba(255,81,157,.34)!important;
    border-radius:13px!important;
    background:#171022!important;color:#ff4c9a!important;
    box-shadow:0 8px 24px rgba(0,0,0,.26)!important;
  }
  #checkoutDialog .bakong-brand{grid-area:brand!important;justify-content:flex-start!important;margin:0!important;gap:12px!important}
  #checkoutDialog .bakong-brand-mark{width:48px!important;height:48px!important;border-radius:13px!important;font-size:27px!important;background:linear-gradient(145deg,#ff5d9f,#ef1577)!important;box-shadow:0 12px 28px rgba(238,32,128,.25)!important}
  #checkoutDialog .bakong-brand h2{margin:0!important;color:#fff!important;font-size:27px!important;line-height:1.08!important;font-weight:800!important}
  #checkoutDialog .bakong-brand p{margin:3px 0 0!important;color:#aaa1b6!important;font-size:11px!important}
  #checkoutDialog .bakong-chip{grid-area:chip!important;justify-self:end!important;margin-right:54px!important;padding:8px 14px!important;border:1px solid rgba(255,77,155,.3)!important;border-radius:999px!important;background:rgba(255,50,143,.08)!important;color:#ff5da4!important;font-size:11px!important;font-weight:800!important;box-shadow:none!important}
  #checkoutDialog .bakong-scan-title{grid-area:title!important;margin:2px 0 0!important;text-align:center!important;color:#fff!important;font-size:28px!important;line-height:1.25!important;font-weight:800!important}
  #checkoutDialog .bakong-scan-title span{width:25px!important;height:25px!important;background:linear-gradient(145deg,#ff5b9d,#ef2f82)!important}
  #checkoutDialog .bakong-subtitle{grid-area:title!important;margin:38px 0 0!important;text-align:center!important;color:#afa5b5!important;font-size:12px!important;align-self:start!important;pointer-events:none!important}
  #checkoutDialog .bakong-amount{grid-area:amount!important;width:min(560px,100%)!important;max-width:none!important;justify-self:center!important;margin:8px 0 4px!important;padding:11px 22px!important;display:flex!important;align-items:center!important;justify-content:center!important;gap:14px!important;border:1px solid rgba(255,51,145,.64)!important;border-radius:18px!important;background:linear-gradient(135deg,rgba(255,49,142,.085),rgba(123,43,123,.08))!important;box-shadow:0 12px 34px rgba(0,0,0,.16)!important}
  #checkoutDialog .bakong-amount span{margin:0!important;color:#c8bdca!important;font-size:12px!important}
  #checkoutDialog .bakong-amount strong{font-size:42px!important;line-height:1!important;color:#ff4d9b!important;letter-spacing:-.035em!important;text-shadow:0 0 24px rgba(255,48,143,.18)!important}
  #checkoutDialog .bakong-amount b{margin:0!important;padding:6px 10px!important;vertical-align:0!important;border-radius:999px!important;background:rgba(255,62,149,.13)!important;color:#ff5ba1!important;font-size:12px!important}
  #checkoutDialog .bakong-qr-shell{grid-area:qr!important;width:100%!important;max-width:340px!important;justify-self:end!important;margin:0!important;padding:15px!important;border:1px solid rgba(255,72,156,.26)!important;border-radius:22px!important;background:linear-gradient(145deg,rgba(255,255,255,.055),rgba(255,255,255,.025))!important;box-shadow:0 20px 46px rgba(0,0,0,.24)!important}
  #checkoutDialog .bakong-qr{min-height:260px!important;border-radius:15px!important;background:#fff!important}
  #checkoutDialog .bakong-qr img,#checkoutDialog .bakong-qr canvas{width:260px!important;height:260px!important;max-width:100%!important}
  #checkoutDialog .bakong-minute-timer{grid-area:timer!important;align-self:end!important;width:100%!important;max-width:none!important;margin:0!important;padding:13px 17px!important;text-align:left!important;border:0!important;border-bottom:1px solid rgba(255,255,255,.09)!important;border-radius:0!important;background:transparent!important;color:#bcb3c3!important;font-size:13px!important;box-shadow:none!important}
  #checkoutDialog .bakong-minute-timer b{color:#ff4d9b!important;font-size:27px!important;font-weight:800!important;display:inline-block!important;margin:0 7px!important}
  #checkoutDialog .bakong-status{grid-area:status!important;width:100%!important;max-width:none!important;margin:0!important;padding:12px 17px!important;border:0!important;border-radius:14px!important;background:rgba(255,52,144,.075)!important;color:#ff5da4!important;font-size:13px!important;font-weight:700!important;text-align:left!important}
  #checkoutDialog .bakong-status:before{content:"●";color:#ff4d9b;margin-right:10px;text-shadow:0 0 10px #ff4d9b}
  #checkoutDialog .bakong-status[data-type=paid]{background:rgba(38,187,112,.10)!important;color:#52db92!important}
  #checkoutDialog .bakong-status[data-type=paid]:before{color:#52db92!important}
  #checkoutDialog .bakong-status[data-type=error]{background:rgba(255,74,93,.10)!important;color:#ff7484!important}
  #checkoutDialog .bakong-help{grid-area:help!important;width:100%!important;max-width:none!important;margin:0!important;padding:13px 15px!important;border:1px solid rgba(255,255,255,.10)!important;border-radius:15px!important;background:rgba(255,255,255,.035)!important;color:#ff5aa1!important;text-align:left!important;gap:11px!important}
  #checkoutDialog .bakong-help>span{font-size:20px!important;filter:saturate(.8)}
  #checkoutDialog .bakong-help strong{font-size:11.5px!important;line-height:1.55!important;color:#ff5aa1!important}
  #checkoutDialog .bakong-help p{margin:3px 0 0!important;color:#b7aebb!important;font-size:10px!important;line-height:1.5!important}
  #checkoutDialog .bakong-secure{grid-area:secure!important;margin:2px 0!important;text-align:center!important;color:#aaa2af!important;font-size:10.5px!important}
  #checkoutDialog .bakong-secure::first-letter{color:#35c879!important}
  #checkoutDialog .bakong-actions{grid-area:actions!important;display:grid!important;grid-template-columns:1fr 1fr!important;gap:12px!important;margin:0!important}
  #checkoutDialog .bakong-actions .primary,#checkoutDialog .bakong-actions .secondary{min-height:50px!important;border-radius:14px!important;font-size:13px!important;font-weight:800!important}
  #checkoutDialog .bakong-actions .primary{border:0!important;background:linear-gradient(105deg,#ff248f,#ff5b8f)!important;color:#fff!important;box-shadow:0 12px 28px rgba(238,36,128,.20)!important}
  #checkoutDialog .bakong-actions .secondary{border:1px solid #e83685!important;background:rgba(15,13,31,.78)!important;color:#ff4d9b!important}
  html[lang="km"] #checkoutDialog .bakong-checkout,html[lang="km"] #checkoutDialog button{font-family:"Khmer OS Metal Chrieng","Khmer OS","Noto Sans Khmer",sans-serif!important}
  html[lang="km"] #checkoutDialog .bakong-scan-title{font-size:27px!important;font-weight:400!important;line-height:1.55!important}
  html[lang="km"] #checkoutDialog .bakong-subtitle{margin-top:45px!important;line-height:1.6!important}
  html[lang="km"] #checkoutDialog .bakong-minute-timer,html[lang="km"] #checkoutDialog .bakong-status,html[lang="km"] #checkoutDialog .bakong-help{line-height:1.7!important}
  @media(max-width:760px){
    #checkoutDialog.checkout-modal{width:min(560px,95vw)!important;max-height:92vh!important}
    #checkoutDialog .bakong-checkout{padding:20px 18px 22px!important;grid-template-columns:1fr!important;grid-template-areas:"brand" "chip" "title" "amount" "qr" "timer" "status" "help" "secure" "actions"!important;row-gap:9px!important}
    #checkoutDialog .bakong-brand{justify-content:center!important}
    #checkoutDialog .bakong-chip{justify-self:center!important;margin-right:0!important}
    #checkoutDialog .bakong-subtitle{margin-top:38px!important}
    #checkoutDialog .bakong-amount{margin-top:5px!important;width:min(390px,100%)!important}
    #checkoutDialog .bakong-amount strong{font-size:37px!important}
    #checkoutDialog .bakong-qr-shell{justify-self:center!important;width:min(310px,100%)!important}
    #checkoutDialog .bakong-qr{min-height:235px!important}
    #checkoutDialog .bakong-qr img,#checkoutDialog .bakong-qr canvas{width:235px!important;height:235px!important}
    #checkoutDialog .bakong-minute-timer,#checkoutDialog .bakong-status,#checkoutDialog .bakong-help{width:min(390px,100%)!important;justify-self:center!important}
    #checkoutDialog .bakong-actions{width:min(410px,100%)!important;justify-self:center!important}
    #checkoutDialog .bakong-close{position:absolute!important;right:12px!important;top:12px!important}
  }
  @media(max-width:430px){
    #checkoutDialog .bakong-checkout{padding:18px 12px 18px!important}
    #checkoutDialog .bakong-brand h2{font-size:23px!important}
    #checkoutDialog .bakong-brand-mark{width:42px!important;height:42px!important}
    #checkoutDialog .bakong-scan-title{font-size:23px!important}
    #checkoutDialog .bakong-subtitle{font-size:10.5px!important;margin-top:36px!important}
    #checkoutDialog .bakong-amount{padding:9px 12px!important;gap:9px!important}
    #checkoutDialog .bakong-amount strong{font-size:34px!important}
    #checkoutDialog .bakong-qr-shell{width:min(270px,100%)!important;padding:12px!important}
    #checkoutDialog .bakong-qr{min-height:215px!important}
    #checkoutDialog .bakong-qr img,#checkoutDialog .bakong-qr canvas{width:215px!important;height:215px!important}
    #checkoutDialog .bakong-actions{grid-template-columns:1fr!important}
  }
  `;
  const add=()=>{if(document.getElementById('nex-cinematic-payment-style'))return;const s=document.createElement('style');s.id='nex-cinematic-payment-style';s.textContent=css;document.head.appendChild(s)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',add);else add();
})();