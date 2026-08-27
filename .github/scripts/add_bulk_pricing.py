from pathlib import Path

p=Path('admin-price.html')
s=p.read_text(encoding='utf-8')

css_anchor='.notice{display:none;padding:13px 15px;border-radius:13px;margin-bottom:18px;font-size:13px;line-height:1.6}'
css='''.bulk-bar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:0 0 18px;padding:14px;border:1px solid #482746;border-radius:16px;background:linear-gradient(145deg,#120d1a,#17101f)}.bulk-btn{height:42px;padding:0 15px;border:1px solid #633052;border-radius:11px;background:#201321;color:#ff82c0;font-weight:900}.bulk-btn:hover{border-color:#a3457e;background:#2a1527}.bulk-btn.clear{color:#c6b8c5;border-color:#453047;background:#120d19}.bulk-price{position:relative;width:155px}.bulk-price i{position:absolute;left:12px;top:50%;transform:translateY(-50%);font-style:normal;color:#ff69b3;font-weight:900}.bulk-price input{width:100%;height:42px;border:1px solid #56304e;border-radius:11px;background:#09070e;color:#fff;padding:0 10px 0 28px;outline:none;font-weight:850}.bulk-apply{height:42px;padding:0 16px;border:0;border-radius:11px;background:linear-gradient(135deg,#ff2d91,#a855f7);color:#fff;font-weight:900}.bulk-apply:disabled{opacity:.55;cursor:not-allowed}.selected-count{margin-left:auto;color:#a99eac;font-size:11px;font-weight:800}.card.selected{border-color:#ff4ea8;box-shadow:0 0 0 1px rgba(255,78,168,.18),0 14px 35px rgba(255,45,145,.12)}.card-select{position:absolute;left:10px;top:10px;z-index:3;display:flex;align-items:center;gap:6px;padding:6px 9px;border:1px solid rgba(255,120,190,.45);border-radius:999px;background:rgba(12,8,18,.86);backdrop-filter:blur(6px);color:#ffd1e7;font-size:9px;font-weight:900;cursor:pointer}.card-select input{width:15px;height:15px;margin:0;accent-color:#ff3e9d}'''
if '.bulk-bar{' not in s:
    s=s.replace(css_anchor,css+css_anchor)

mobile_anchor='@media(max-width:620px){.grid,.stats{grid-template-columns:1fr}'
mobile_repl='@media(max-width:620px){.bulk-bar{align-items:stretch}.bulk-btn,.bulk-price,.bulk-apply{width:100%}.selected-count{width:100%;margin-left:0;text-align:center}.grid,.stats{grid-template-columns:1fr}'
s=s.replace(mobile_anchor,mobile_repl)

html_anchor='<div class="stats" id="stats"><div class="stat"><b>—</b><span>Prompt សរុប</span></div><div class="stat"><b>—</b><span>កំពុងបង្ហាញ</span></div><div class="stat"><b>—</b><span>បានលាក់</span></div></div>\n<div id="content">'
bulk_html='''<div class="stats" id="stats"><div class="stat"><b>—</b><span>Prompt សរុប</span></div><div class="stat"><b>—</b><span>កំពុងបង្ហាញ</span></div><div class="stat"><b>—</b><span>បានលាក់</span></div></div>
<div class="bulk-bar" id="bulkBar">
<button class="bulk-btn" id="selectAllBtn" type="button">✓ Select All</button>
<button class="bulk-btn clear" id="clearSelectionBtn" type="button">លុបការជ្រើស</button>
<div class="bulk-price"><i>$</i><input id="bulkPrice" type="number" min="0.01" max="9999" step="0.01" placeholder="តម្លៃថ្មី"></div>
<button class="bulk-apply" id="applyBulkPriceBtn" type="button">ដាក់តម្លៃទៅ Prompt ដែលបានជ្រើស</button>
<span class="selected-count" id="selectedCount">បានជ្រើស 0 Prompt</span>
</div>
<div id="content">'''
if 'id="bulkBar"' not in s:
    s=s.replace(html_anchor,bulk_html)

s=s.replace("var session=null,items=[],editingId=null,currentImageUrl='',pendingFile=null;","var session=null,items=[],editingId=null,currentImageUrl='',pendingFile=null,selectedIds={};")

old_render="function render(){var q=($('#search').value||'').trim().toLowerCase();var list=items.filter(function(p){return !q||(String(p.title||'')+' '+String(p.category||'')+' '+String(p.creator||'')).toLowerCase().indexOf(q)>=0});var root=$('#content');updateStats();if(!list.length){root.innerHTML='<div class=\"empty\">រកមិនឃើញ Prompt ទេ។</div>';return}root.innerHTML='<div class=\"grid\">'+list.map(function(p){return '<article class=\"card\" data-id=\"'+esc(p.id)+'\"><div class=\"img\" style=\"background-image:url(&quot;'+esc(p.image_url||'')+'&quot;)\"><span class=\"state '+(p.is_published?'':'off')+'\">'+(p.is_published?'VISIBLE':'HIDDEN')+'</span></div><div class=\"body\"><div class=\"title\">'+esc(p.title)+'</div><div class=\"meta\">'+esc(p.category||'')+' · '+esc(p.creator||'NEXORA Ai')+'</div><div class=\"desc\">'+esc(p.description||'មិនទាន់មាន Description')+'</div><span class=\"badge\">ID '+esc(p.id)+'</span><div class=\"price-row\"><label class=\"price-field\"><span>តម្លៃ / Price (USD)</span><div class=\"price-wrap\"><i>$</i><input type=\"number\" min=\"0.01\" max=\"9999\" step=\"0.01\" value=\"'+Number(p.price||0).toFixed(2)+'\" data-price></div></label><button class=\"save\" type=\"button\" data-save>Save</button></div><div class=\"card-actions\"><button class=\"mini secondary\" type=\"button\" data-edit>✎ Edit Prompt</button><button class=\"mini secondary\" type=\"button\" data-publish>'+(p.is_published?'Hide':'Show')+'</button></div></div></article>'}).join('')+'</div>'}"
new_render="function filteredItems(){var q=($('#search').value||'').trim().toLowerCase();return items.filter(function(p){return !q||(String(p.title||'')+' '+String(p.category||'')+' '+String(p.creator||'')).toLowerCase().indexOf(q)>=0})}\nfunction updateBulkUI(){var ids=Object.keys(selectedIds).filter(function(id){return selectedIds[id]});var n=$('#selectedCount');if(n)n.textContent='បានជ្រើស '+ids.length+' Prompt';var b=$('#applyBulkPriceBtn');if(b&&!b.dataset.saving)b.disabled=!ids.length}\nfunction render(){var list=filteredItems();var root=$('#content');updateStats();if(!list.length){root.innerHTML='<div class=\"empty\">រកមិនឃើញ Prompt ទេ។</div>';updateBulkUI();return}root.innerHTML='<div class=\"grid\">'+list.map(function(p){var checked=!!selectedIds[String(p.id)];return '<article class=\"card '+(checked?'selected':'')+'\" data-id=\"'+esc(p.id)+'\"><div class=\"img\" style=\"background-image:url(&quot;'+esc(p.image_url||'')+'&quot;)\"><label class=\"card-select\"><input type=\"checkbox\" data-select '+(checked?'checked':'')+'><span>ជ្រើស</span></label><span class=\"state '+(p.is_published?'':'off')+'\">'+(p.is_published?'VISIBLE':'HIDDEN')+'</span></div><div class=\"body\"><div class=\"title\">'+esc(p.title)+'</div><div class=\"meta\">'+esc(p.category||'')+' · '+esc(p.creator||'NEXORA Ai')+'</div><div class=\"desc\">'+esc(p.description||'មិនទាន់មាន Description')+'</div><span class=\"badge\">ID '+esc(p.id)+'</span><div class=\"price-row\"><label class=\"price-field\"><span>តម្លៃ / Price (USD)</span><div class=\"price-wrap\"><i>$</i><input type=\"number\" min=\"0.01\" max=\"9999\" step=\"0.01\" value=\"'+Number(p.price||0).toFixed(2)+'\" data-price></div></label><button class=\"save\" type=\"button\" data-save>Save</button></div><div class=\"card-actions\"><button class=\"mini secondary\" type=\"button\" data-edit>✎ Edit Prompt</button><button class=\"mini secondary\" type=\"button\" data-publish>'+(p.is_published?'Hide':'Show')+'</button></div></div></article>'}).join('')+'</div>';updateBulkUI()}"
if 'function filteredItems()' not in s:
    if old_render not in s: raise SystemExit('render anchor not found')
    s=s.replace(old_render,new_render)

click_anchor="document.addEventListener('click',function(e){var card=e.target.closest('[data-id]');var id=card?Number(card.getAttribute('data-id')):null;if(e.target.closest('[data-save]')){"
click_repl="document.addEventListener('click',function(e){var card=e.target.closest('[data-id]');var id=card?Number(card.getAttribute('data-id')):null;if(e.target.closest('[data-select]')){var c=e.target.closest('[data-select]');selectedIds[String(id)]=!!c.checked;if(card)card.classList.toggle('selected',!!c.checked);updateBulkUI();return}if(e.target.closest('[data-save]')){"
if "e.target.closest('[data-select]')" not in s:
    if click_anchor not in s: raise SystemExit('click anchor not found')
    s=s.replace(click_anchor,click_repl)

listeners_anchor="$('#addPromptBtn').addEventListener('click',function(){openEditor(null)});"
bulk_js="""$('#selectAllBtn').addEventListener('click',function(){filteredItems().forEach(function(p){selectedIds[String(p.id)]=true});render()});
$('#clearSelectionBtn').addEventListener('click',function(){selectedIds={};render()});
$('#applyBulkPriceBtn').addEventListener('click',function(){var price=Number($('#bulkPrice').value);var ids=Object.keys(selectedIds).filter(function(id){return selectedIds[id]});if(!ids.length){notice('សូមជ្រើស Prompt យ៉ាងហោចណាស់ 1។','err');return}if(!isFinite(price)||price<0.01){notice('សូមដាក់តម្លៃចាប់ពី $0.01 ឡើងទៅ។','err');return}var btn=this,done=0,failed=0;btn.disabled=true;btn.dataset.saving='1';btn.textContent='Saving 0/'+ids.length+'...';var chain=Promise.resolve();ids.forEach(function(id){chain=chain.then(function(){return req('price',{method:'POST',body:{id:Number(id),price:price}}).then(function(d){var found=items.find(function(x){return Number(x.id)===Number(id)});if(found)found.price=d.item.price;done++}).catch(function(){failed++}).then(function(){btn.textContent='Saving '+(done+failed)+'/'+ids.length+'...'})})});chain.then(function(){if(failed){notice('បានកែ '+done+' Prompt · បរាជ័យ '+failed+' Prompt','err')}else{notice('បានដាក់តម្លៃ $'+price.toFixed(2)+' ទៅ '+done+' Prompt ជោគជ័យ ✓','ok');selectedIds={};$('#bulkPrice').value=''}render()}).finally(function(){delete btn.dataset.saving;btn.disabled=false;btn.textContent='ដាក់តម្លៃទៅ Prompt ដែលបានជ្រើស';updateBulkUI()})});
"""
if "$('#selectAllBtn').addEventListener" not in s:
    if listeners_anchor not in s: raise SystemExit('listener anchor not found')
    s=s.replace(listeners_anchor,bulk_js+listeners_anchor)

p.write_text(s,encoding='utf-8')
