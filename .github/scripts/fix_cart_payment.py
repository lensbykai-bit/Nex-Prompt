from pathlib import Path

p = Path('forgot-password.js')
s = p.read_text(encoding='utf-8')

old = "function openPayment(p){activePromptPayment=p;var m=$('#paymentModal');"
new = "function openPayment(p){activePromptPayment=p;var cart=$('#cartModal');try{if(cart&&cart.open)cart.close()}catch(e){if(cart)cart.removeAttribute('open')}var m=$('#paymentModal');"

if old in s:
    s = s.replace(old, new, 1)
elif "function openPayment(p){activePromptPayment=p;var cart=$('#cartModal');" not in s:
    raise SystemExit('Could not patch openPayment()')

# Make the checkout button clearly show progress while KHQR is being created.
old_checkout = "function startPromptCheckout(){var s=getSession();if(!s||!s.access_token){var b=$('#signInBtn');if(b)b.click();return}var ids=getCart().map(Number).filter(function(x){return Number.isInteger(x)&&x>0});if(!ids.length)return;authFetch('bakong-create',{method:'POST',body:{prompt_ids:ids}}).then(function(d){openPayment(d.payment||{})}).catch(function(err){"
new_checkout = "function startPromptCheckout(){var s=getSession();if(!s||!s.access_token){var b=$('#signInBtn');if(b)b.click();return}var ids=getCart().map(Number).filter(function(x){return Number.isInteger(x)&&x>0});if(!ids.length)return;var checkout=$('#checkoutPromptBtn');if(checkout){checkout.disabled=true;checkout.textContent=isKH()?'កំពុងរៀបចំការទូទាត់...':'Preparing payment...'}authFetch('bakong-create',{method:'POST',body:{prompt_ids:ids}}).then(function(d){openPayment(d.payment||{})}).catch(function(err){"

if old_checkout in s:
    s = s.replace(old_checkout, new_checkout, 1)
elif "checkout.textContent=isKH()?'កំពុងរៀបចំការទូទាត់...'" not in s:
    raise SystemExit('Could not patch startPromptCheckout()')

# Restore the button label after success/error so it is correct if the cart is opened later.
needle = "setTimeout(function(){t.classList.remove('show')},2500)}})}\nfunction checkPromptPayment"
replacement = "setTimeout(function(){t.classList.remove('show')},2500)}}).finally(function(){var checkout=$('#checkoutPromptBtn');if(checkout){checkout.disabled=false;checkout.textContent=isKH()?'ទូទាត់':'Checkout'}})}\nfunction checkPromptPayment"
if needle in s:
    s = s.replace(needle, replacement, 1)
elif ".finally(function(){var checkout=$('#checkoutPromptBtn')" not in s:
    raise SystemExit('Could not add checkout button reset')

p.write_text(s, encoding='utf-8')
print('Cart payment flow fixed')
