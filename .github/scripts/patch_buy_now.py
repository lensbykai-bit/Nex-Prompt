from pathlib import Path

# 1) Add Pay Now button in Prompt modal
p = Path('index.html')
s = p.read_text(encoding='utf-8')
old = '<button class="btn btn-primary" id="addCartBtn" type="button">Add to Cart</button>'
new = '<div class="prompt-buy-actions"><button class="btn btn-primary" id="addCartBtn" type="button">Add to Cart</button><button class="btn btn-secondary" id="buyNowBtn" type="button">Pay Now</button></div>'
if 'id="buyNowBtn"' not in s:
    if old not in s:
        raise SystemExit('Could not find Add to Cart button in index.html')
    s = s.replace(old, new, 1)
p.write_text(s, encoding='utf-8')

# 2) Style the two purchase buttons
p = Path('app.css')
s = p.read_text(encoding='utf-8')
marker = '/* NEXORA Ai direct Pay Now */'
if marker not in s:
    s += '''\n\n/* NEXORA Ai direct Pay Now */\n.prompt-buy-actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:6px}.prompt-buy-actions .btn{flex:1;min-width:150px}.prompt-buy-actions #buyNowBtn{border-color:#ff58b0;color:#fff;background:linear-gradient(135deg,rgba(255,49,150,.18),rgba(173,76,240,.16))}.prompt-buy-actions #buyNowBtn:hover{background:linear-gradient(135deg,rgba(255,49,150,.32),rgba(173,76,240,.28))}@media(max-width:640px){.prompt-buy-actions{display:grid;grid-template-columns:1fr}.prompt-buy-actions .btn{width:100%}}\n'''
p.write_text(s, encoding='utf-8')

# 3) Put current Prompt id on Pay Now button and translate its label
p = Path('app.js')
s = p.read_text(encoding='utf-8')
needle = "if($('#addCartBtn'))$('#addCartBtn').textContent=state.cart.indexOf(p.id)>=0?(state.lang==='KH'?'មានក្នុងកន្ត្រក':'In Cart'):(state.lang==='KH'?'បន្ថែមទៅកន្ត្រក':'Add to Cart');openModal('#promptModal')"
replacement = "if($('#addCartBtn'))$('#addCartBtn').textContent=state.cart.indexOf(p.id)>=0?(state.lang==='KH'?'មានក្នុងកន្ត្រក':'In Cart'):(state.lang==='KH'?'បន្ថែមទៅកន្ត្រក':'Add to Cart');var buyNow=$('#buyNowBtn');if(buyNow){buyNow.textContent=state.lang==='KH'?'ទូទាត់ឥឡូវនេះ':'Pay Now';buyNow.setAttribute('data-prompt-id',p.id)}openModal('#promptModal')"
if "buyNow.setAttribute('data-prompt-id'" not in s:
    if needle not in s:
        raise SystemExit('Could not patch openPrompt in app.js')
    s = s.replace(needle, replacement, 1)
p.write_text(s, encoding='utf-8')

# 4) Add direct single-Prompt checkout to the account/payment helper
p = Path('forgot-password.js')
s = p.read_text(encoding='utf-8')

# Keep unrelated cart items after a direct Pay Now purchase.
old_clear = "localStorage.setItem('nex_cart_cloud','[]');var c=$('#cartCount');if(c)c.textContent='0';loadPurchases();"
new_clear = "if(!activePromptPayment.preserve_cart){localStorage.setItem('nex_cart_cloud','[]');var c=$('#cartCount');if(c)c.textContent='0'}loadPurchases();"
if new_clear not in s:
    if old_clear not in s:
        raise SystemExit('Could not patch cart preservation in forgot-password.js')
    s = s.replace(old_clear, new_clear, 1)

if 'function startBuyNow(' not in s:
    anchor = 'function checkPromptPayment(showPending)'
    if anchor not in s:
        raise SystemExit('Could not find checkPromptPayment anchor')
    fn = r'''function startBuyNow(promptId){var s=getSession();if(!s||!s.access_token){var sign=$('#signInBtn');if(sign)sign.click();return}var id=Number(promptId);if(!Number.isInteger(id)||id<=0)return;var btn=$('#buyNowBtn');if(btn){btn.disabled=true;btn.textContent=isKH()?'កំពុងរៀបចំការទូទាត់...':'Preparing payment...'}authFetch('bakong-create',{method:'POST',body:{prompt_ids:[id]}}).then(function(d){var p=d.payment||{};p.preserve_cart=true;var pm=$('#promptModal');try{if(pm&&pm.open)pm.close()}catch(e){if(pm)pm.removeAttribute('open')}openPayment(p)}).catch(function(err){var t=$('#toast');if(t){t.textContent=String(err&&err.message||'Could not create KHQR');t.classList.add('show');setTimeout(function(){t.classList.remove('show')},3000)}}).finally(function(){if(btn){btn.disabled=false;btn.textContent=isKH()?'ទូទាត់ឥឡូវនេះ':'Pay Now'}})}
'''
    s = s.replace(anchor, fn + anchor, 1)

# Capture Pay Now before other page click handlers.
old_bind = "function bindPurchases(){document.addEventListener('click',function(e){var nav=e.target.closest('#myPromptsNav');"
new_bind = "function bindPurchases(){document.addEventListener('click',function(e){var buyNow=e.target.closest('#buyNowBtn');if(buyNow){e.preventDefault();e.stopImmediatePropagation();startBuyNow(buyNow.getAttribute('data-prompt-id'));return}var nav=e.target.closest('#myPromptsNav');"
if new_bind not in s:
    if old_bind not in s:
        raise SystemExit('Could not patch bindPurchases')
    s = s.replace(old_bind, new_bind, 1)

p.write_text(s, encoding='utf-8')
print('Pay Now patch applied')
