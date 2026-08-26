from pathlib import Path
import re

p = Path('forgot-password.js')
s = p.read_text(encoding='utf-8')

# After a confirmed payment, switch the background view to My Prompts and keep the Khmer thank-you modal on top.
s = s.replace(
    "activePromptPayment=null;showThankYou(true)",
    "activePromptPayment=null;showMyPrompts();showThankYou(false)"
)

old_thank = "ការទូទាត់របស់អ្នកបានជោគជ័យ។ Prompt ដែលអ្នកបានទិញត្រូវបានរក្សាទុកក្នុង Prompt របស់ខ្ញុំ រួចហើយ។"
new_thank = "ការទូទាត់របស់អ្នកបានជោគជ័យ។ Prompt ត្រូវបានរក្សាទុកក្នុង Prompt របស់ខ្ញុំ និងអាចចូលមើលបានរយៈពេល ៧ ថ្ងៃ។"
s = s.replace(old_thank, new_thank)
s = s.replace(">បន្ត</button>", ">ទៅ Prompt របស់ខ្ញុំ</button>")
s = s.replace("btn.textContent='បន្ត'", "btn.textContent='ទៅ Prompt របស់ខ្ញុំ'")

# Keep My Prompts visible in the top navigation even before sign-in.
s = s.replace("a.style.display=s&&s.access_token?'':'none';", "a.style.display='';")

# Explain the 7-day access period on the My Prompts page.
s = s.replace(
    "Prompt ដែលអ្នកបានទិញនឹងរក្សាទុកនៅទីនេះក្នុងគណនីរបស់អ្នក។",
    "Prompt ដែលអ្នកបានទិញនឹងរក្សាទុកនៅទីនេះរយៈពេល ៧ ថ្ងៃ។ ផុតកំណត់ហើយត្រូវទិញឡើងវិញ។"
)
s = s.replace(
    "Prompts you purchased are saved here in your account.",
    "Purchased Prompts stay here for 7 days. After expiry, purchase again to regain access."
)

new_render = r'''function renderPurchases(){var g=$('#myPromptsGrid');if(!g)return;if(!purchaseItems.length){g.innerHTML='<div class="empty">'+(isKH()?'មិនទាន់មាន Prompt ដែលបានទិញទេ។':'You have not purchased any Prompts yet.')+'</div>';return}g.innerHTML=purchaseItems.map(function(p){var expiryText='',remainingDays=0;try{var exp=new Date(p.expires_at);remainingDays=Math.max(0,Math.ceil((exp.getTime()-Date.now())/86400000));var expDate=exp.toLocaleDateString(isKH()?'km-KH':'en-US');expiryText=isKH()?'ផុតកំណត់ '+expDate+' · សល់ '+remainingDays+' ថ្ងៃ':'Expires '+expDate+' · '+remainingDays+' day'+(remainingDays===1?'':'s')+' left'}catch(e){}return '<article class="prompt-card" data-owned="'+String(p.id||p.prompt_id)+'"><div class="prompt-img" style="background-image:url(&quot;'+String(p.image_url||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;')+'&quot;)"><span class="prompt-tag">'+String(p.category||'Prompt')+'</span></div><div class="prompt-body"><h3>'+String(p.title||'Purchased Prompt')+'</h3><div class="prompt-meta"><span class="owned-badge">✓ '+(isKH()?'បានទិញ':'Purchased')+'</span><span class="owned-date">'+expiryText+'</span></div><div class="prompt-meta"><span>'+String(p.model||'')+'</span><span class="owned-open">'+(isKH()?'មើល Prompt':'View Prompt')+'</span></div></div></article>'}).join('')}'''
s, n = re.subn(r"function renderPurchases\(\)\{.*?\}\nfunction loadPurchases", new_render + "\nfunction loadPurchases", s, count=1, flags=re.S)
if n != 1:
    raise SystemExit('Could not replace renderPurchases()')

# If the whole cart is already owned and still active, do not look broken: clear that cart and take the user to My Prompts.
new_checkout = r'''function startPromptCheckout(){var s=getSession();if(!s||!s.access_token){var b=$('#signInBtn');if(b)b.click();return}var ids=getCart().map(Number).filter(function(x){return Number.isInteger(x)&&x>0});if(!ids.length)return;authFetch('bakong-create',{method:'POST',body:{prompt_ids:ids}}).then(function(d){openPayment(d.payment||{})}).catch(function(err){var msg=String(err&&err.message||'');if(/បានទិញរួច|already own|My Prompts/i.test(msg)){localStorage.setItem('nex_cart_cloud','[]');var c=$('#cartCount');if(c)c.textContent='0';var cart=$('#cartModal');try{if(cart&&cart.open)cart.close()}catch(e){if(cart)cart.removeAttribute('open')}showMyPrompts();var t=$('#toast');if(t){t.textContent=isKH()?'Prompt នេះបានទិញរួច និងនៅមិនទាន់ផុត ៧ ថ្ងៃទេ។ សូមមើលក្នុង Prompt របស់ខ្ញុំ។':'This Prompt is already active in My Prompts. You can buy it again after it expires.';t.classList.add('show');setTimeout(function(){t.classList.remove('show')},3500)}return}var t=$('#toast');if(t){t.textContent=msg||'Could not create KHQR';t.classList.add('show');setTimeout(function(){t.classList.remove('show')},2500)}})}'''
s, n2 = re.subn(r"function startPromptCheckout\(\)\{.*?\}\nfunction checkPromptPayment", new_checkout + "\nfunction checkPromptPayment", s, count=1, flags=re.S)
if n2 != 1:
    raise SystemExit('Could not replace startPromptCheckout()')

# If My Prompts stays open for days, refresh it periodically so expired items disappear without a manual reload.
needle = "setInterval(syncMyPrompts,1500);var h=(location.hash||'').slice(1);"
replacement = "setInterval(syncMyPrompts,1500);setInterval(function(){var v=$('#myPromptsView');if(v&&v.classList.contains('active')&&getSession())loadPurchases()},60000);var h=(location.hash||'').slice(1);"
if needle in s:
    s = s.replace(needle, replacement)
elif "setInterval(function(){var v=$('#myPromptsView')" not in s:
    raise SystemExit('Could not add periodic My Prompts refresh')

p.write_text(s, encoding='utf-8')
