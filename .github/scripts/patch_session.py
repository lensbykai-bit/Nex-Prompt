from pathlib import Path
import re

REFRESH_URL = "https://kbanmyaqodtfoqikzwou.supabase.co/functions/v1/auth-refresh"

# ---- app.js ----
p = Path("app.js")
s = p.read_text(encoding="utf-8")

if "var REFRESH=" not in s:
    s = s.replace(
        "var CREDIT='https://kbanmyaqodtfoqikzwou.supabase.co/functions/v1/credits-api';",
        "var CREDIT='https://kbanmyaqodtfoqikzwou.supabase.co/functions/v1/credits-api';\nvar REFRESH='" + REFRESH_URL + "';",
    )

new_request = r"""function refreshSession(){var current=state.session;if(!current||!current.refresh_token)return Promise.reject(new Error(state.lang==='KH'?'Session បានផុតកំណត់។ សូមចូលគណនីម្ដងទៀត។':'Session expired. Please sign in again.'));return fetch(REFRESH,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({refresh_token:current.refresh_token})}).then(function(r){return r.text().then(function(t){var d={};try{d=t?JSON.parse(t):{}}catch(e){}if(!r.ok||!d.session||!d.session.access_token)throw new Error(d.error||'Session expired. Please sign in again.');if(!d.session.email&&current.email)d.session.email=current.email;state.session=d.session;save('nex_cloud_session',state.session);return state.session})}).catch(function(err){state.session=null;state.profile=null;save('nex_cloud_session',null);try{updateAuthButtons()}catch(e){}throw err})}
function request(url,action,opt){opt=opt||{};function run(canRefresh){var ctrl=new AbortController();var timer=setTimeout(function(){ctrl.abort()},opt.timeout||12000);var headers={'Content-Type':'application/json'};if(opt.auth&&state.session&&state.session.access_token){headers.Authorization='Bearer '+state.session.access_token}return fetch(url+'?action='+encodeURIComponent(action),{method:opt.method||'GET',headers:headers,body:opt.body?JSON.stringify(opt.body):undefined,signal:ctrl.signal}).then(function(r){return r.text().then(function(t){var d={};try{d=t?JSON.parse(t):{}}catch(e){}if(r.status===401&&opt.auth&&canRefresh&&state.session&&state.session.refresh_token){return refreshSession().then(function(){return run(false)})}if(!r.ok)throw new Error(d.error||'Request failed');return d})}).finally(function(){clearTimeout(timer)})}return run(true)}"""

# Replace refreshSession + request as one block so repeated runs never duplicate helpers.
s, n = re.subn(
    r"(?:function refreshSession\(\)\{.*?\}\n)?function request\(url,action,opt\)\{.*?\}\n\nfunction injectAuthUI",
    new_request + "\n\nfunction injectAuthUI",
    s,
    count=1,
    flags=re.S,
)
if n != 1:
    raise SystemExit("Could not patch app.js request()")

s, n = re.subn(
    r"function promptCheckout\(\)\{.*?\}\nfunction ensureLogin",
    "function promptCheckout(){if(!state.cart.length)return toast(state.lang==='KH'?'កន្ត្រកទទេ។':'Your cart is empty.');if(!ensureLogin())return;request(STORE,'bakong-create',{method:'POST',auth:true,body:{prompt_ids:state.cart.map(Number)}}).then(function(d){state.payment=Object.assign({},d.payment||{},{type:'prompt'});showPayment(state.payment)}).catch(function(err){toast(err.message||'Could not create KHQR')})}\nfunction ensureLogin",
    s,
    count=1,
    flags=re.S,
)
if n != 1:
    raise SystemExit("Could not patch app.js promptCheckout()")

p.write_text(s, encoding="utf-8")

# ---- forgot-password.js ----
p = Path("forgot-password.js")
s = p.read_text(encoding="utf-8")

if "var REFRESH=" not in s:
    s = s.replace(
        "var RESET='https://kbanmyaqodtfoqikzwou.supabase.co/functions/v1/password-reset';",
        "var RESET='https://kbanmyaqodtfoqikzwou.supabase.co/functions/v1/password-reset';\nvar REFRESH='" + REFRESH_URL + "';",
    )

new_authfetch = r"""function saveSession(s){try{if(s)localStorage.setItem('nex_cloud_session',JSON.stringify(s));else localStorage.removeItem('nex_cloud_session')}catch(e){}}
function refreshSession(){var current=getSession();if(!current||!current.refresh_token)return Promise.reject(new Error(isKH()?'Session បានផុតកំណត់។ សូមចូលគណនីម្ដងទៀត។':'Session expired. Please sign in again.'));return fetch(REFRESH,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({refresh_token:current.refresh_token})}).then(function(r){return r.json().catch(function(){return{}}).then(function(d){if(!r.ok||!d.session||!d.session.access_token)throw new Error(d.error||'Session expired. Please sign in again.');if(!d.session.email&&current.email)d.session.email=current.email;saveSession(d.session);return d.session})}).catch(function(err){saveSession(null);throw err})}
function authFetch(action,opt){opt=opt||{};function run(canRefresh){var s=getSession();var h={'Content-Type':'application/json'};if(s&&s.access_token)h.Authorization='Bearer '+s.access_token;var url=STORE+'?action='+encodeURIComponent(action)+(opt.query||'');return fetch(url,{method:opt.method||'GET',headers:h,body:opt.body?JSON.stringify(opt.body):undefined}).then(function(r){return r.json().catch(function(){return{}}).then(function(d){if(r.status===401&&canRefresh&&s&&s.refresh_token){return refreshSession().then(function(){return run(false)})}if(!r.ok)throw new Error(d.error||'Request failed');return d})})}return run(true)}"""

# Collapse any duplicated saveSession/refreshSession helpers and authFetch into one clean block.
s, n = re.subn(
    r"(?:function saveSession\(s\)\{.*?\}\nfunction refreshSession\(\)\{.*?\}\n)+function authFetch\(action,opt\)\{.*?\}\nfunction setAuthStatus",
    new_authfetch + "\nfunction setAuthStatus",
    s,
    count=1,
    flags=re.S,
)
if n != 1:
    # First-time shape: authFetch may exist without helpers yet.
    s, n = re.subn(
        r"function authFetch\(action,opt\)\{.*?\}\nfunction setAuthStatus",
        new_authfetch + "\nfunction setAuthStatus",
        s,
        count=1,
        flags=re.S,
    )
if n != 1:
    raise SystemExit("Could not patch forgot-password.js authFetch()")

p.write_text(s, encoding="utf-8")
print("Session refresh patch applied cleanly")
