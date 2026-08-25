(()=>{
  const KEY='nex_prompt_lang';
  const KH={
    'Home':'ទំព័រដើម','Image to Video':'រូបភាពទៅវីដេអូ','Categories':'ប្រភេទ','Models':'ម៉ូដែល','How it works':'របៀបប្រើ','Pricing':'តម្លៃ',
    'EXPLORE':'ស្វែងរក','All Prompts':'Prompt ទាំងអស់','Trending':'កំពុងពេញនិយម','New Releases':'ថ្មីៗ','Top Rated':'វាយតម្លៃខ្ពស់',
    'CATEGORIES':'ប្រភេទ','Cinematic':'ភាពយន្ត','Nature':'ធម្មជាតិ','Sci-Fi':'វិទ្យាសាស្ត្រអនាគត','Fantasy':'ស្រមើស្រមៃ','Product Ads':'ផ្សព្វផ្សាយផលិតផល','Anime':'អានីមេ','Architecture':'ស្ថាបត្យកម្ម','Animals':'សត្វ','Food':'អាហារ',
    'LIBRARY':'បណ្ណាល័យ','My Purchases':'ការទិញរបស់ខ្ញុំ','Favorites':'ចំណូលចិត្ត','Orders':'ការបញ្ជាទិញ','Profile':'ប្រវត្តិរូប','Admin':'គ្រប់គ្រង','OTHERS':'ផ្សេងៗ','FAQ':'សំណួរញឹកញាប់','Contact':'ទំនាក់ទំនង',
    'AI IMAGE TO VIDEO PROMPT MARKETPLACE':'ទីផ្សារ PROMPT រូបភាពទៅវីដេអូ AI','Turn your images':'បម្លែងរូបភាពរបស់អ្នក','into':'ទៅជា','cinematic':'បែបភាពយន្ត','stories':'រឿងរ៉ាវ',
    'Premium prompts for creators who want smoother motion, better camera direction and faster AI-video results.':'Prompt គុណភាពខ្ពស់សម្រាប់អ្នកបង្កើត ដែលចង់បានចលនារលូន ការបញ្ជាកាមេរ៉ាល្អ និងលទ្ធផលវីដេអូ AI លឿន។',
    'Happy Creators':'អ្នកបង្កើតពេញចិត្ត','Prompts Sold':'Prompt បានលក់','AI Models':'ម៉ូដែល AI','User Rating':'ការវាយតម្លៃ','Explore Prompts':'ស្វែងរក Prompt','Works with':'អាចប្រើជាមួយ',
    'Browse by category':'រកមើលតាមប្រភេទ','Find the motion style you need':'ស្វែងរកស្ទីលចលនាដែលអ្នកត្រូវការ','All':'ទាំងអស់','Popular Prompts':'Prompt ពេញនិយម','View all prompts →':'មើល Prompt ទាំងអស់ →',
    'High Quality Prompts':'Prompt គុណភាពខ្ពស់','Carefully crafted and tested for reliable results.':'រៀបចំ និងសាកល្បងយ៉ាងម៉ត់ចត់ ដើម្បីទទួលបានលទ្ធផលគួរឱ្យទុកចិត្ត។','Multiple AI Models':'ម៉ូដែល AI ច្រើន','Works with leading image-to-video tools.':'អាចប្រើជាមួយឧបករណ៍រូបភាពទៅវីដេអូឈានមុខ។','Instant Access':'ចូលប្រើភ្លាមៗ','Get your prompts immediately after purchase.':'ទទួល Prompt របស់អ្នកភ្លាមៗបន្ទាប់ពីទិញ។','Secure & Safe':'សុវត្ថិភាពខ្ពស់','Protected checkout and payment verification.':'ការទូទាត់ និងការផ្ទៀងផ្ទាត់ត្រូវបានការពារ។',
    'Choose a prompt':'ជ្រើសរើស Prompt','Browse cinematic, product, fantasy and other motion-ready prompt packs.':'រកមើល Prompt បែបភាពយន្ត ផលិតផល ស្រមើស្រមៃ និងចលនាផ្សេងៗ។','Pay securely':'ទូទាត់ដោយសុវត្ថិភាព','Checkout using Bakong KHQR from your supported Cambodian banking app.':'ទូទាត់តាម Bakong KHQR ដោយប្រើកម្មវិធីធនាគារកម្ពុជាដែលគាំទ្រ។','Create your video':'បង្កើតវីដេអូរបស់អ្នក','Use the unlocked prompt in your preferred AI video model.':'ប្រើ Prompt ដែលបានដោះសោក្នុងម៉ូដែលវីដេអូ AI ដែលអ្នកចូលចិត្ត។',
    'Simple prompt pricing':'តម្លៃ Prompt ងាយយល់','Buy only the prompts you need. No subscription required.':'ទិញតែ Prompt ដែលអ្នកត្រូវការ មិនចាំបាច់បង់សមាជិកប្រចាំខែ។','From':'ចាប់ពី','NEW COLLECTIONS':'បណ្ដុំថ្មី','Made for better motion':'បង្កើតសម្រាប់ចលនាកាន់តែល្អ','Fresh prompt drops designed around cinematic camera movement, transformations, products and viral short-form scenes.':'Prompt ថ្មីៗ សម្រាប់ចលនាកាមេរ៉ាបែបភាពយន្ត ការបម្លែង ផលិតផល និងវីដេអូខ្លីពេញនិយម។','FOR CREATORS':'សម្រាប់អ្នកបង្កើត','Build faster. Create smarter.':'ធ្វើការលឿន។ បង្កើតឆ្លាតវៃ។','Nex Prompt helps creators spend less time guessing and more time producing polished AI video results.':'Nex Prompt ជួយអ្នកបង្កើតកាត់បន្ថយពេលសាកល្បង និងបង្កើតវីដេអូ AI បានកាន់តែមានគុណភាព។',
    'Frequently asked questions':'សំណួរដែលសួរញឹកញាប់','What do I receive after payment?':'តើខ្ញុំទទួលបានអ្វីបន្ទាប់ពីបង់ប្រាក់?','You receive access to the full prompt content associated with the purchased listing.':'អ្នកនឹងទទួលបាន Prompt ពេញលេញដែលបានទិញ។','Which AI video models can I use?':'តើអាចប្រើម៉ូដែលវីដេអូ AI ណាខ្លះ?','Listings can be optimized for models such as Kling, Veo, Sora, Runway, Pika and others.':'Prompt អាចប្រើជាមួយ Kling, Veo, Sora, Runway, Pika និងម៉ូដែលផ្សេងៗ។','How does payment work?':'ការទូទាត់ដំណើរការយ៉ាងដូចម្តេច?','The checkout uses Bakong KHQR and verifies the transaction before purchased prompt access is unlocked.':'ប្រព័ន្ធប្រើ Bakong KHQR ហើយផ្ទៀងផ្ទាត់ប្រតិបត្តិការមុននឹងដោះសោ Prompt។',
    'SUPPORT':'ជំនួយ','Need help?':'ត្រូវការជំនួយ?','Send a message and the Nex Prompt team can help with marketplace questions.':'ផ្ញើសារ ហើយក្រុម Nex Prompt នឹងជួយអ្នកអំពីទីផ្សារ។','Send message':'ផ្ញើសារ','Marketplace':'ទីផ្សារ','Prompts':'Prompt','Support':'ជំនួយ','Account':'គណនី','Purchases':'ការទិញ','Login':'ចូល','Premium image-to-video prompts for modern creators.':'Prompt រូបភាពទៅវីដេអូគុណភាពខ្ពស់សម្រាប់អ្នកបង្កើតសម័យថ្មី។','© 2026 Nex Prompt. All rights reserved.':'© 2026 Nex Prompt. រក្សាសិទ្ធិគ្រប់យ៉ាង។',
    'Your Cart':'រទេះទិញរបស់អ្នក','Your cart is empty.':'រទេះទិញរបស់អ្នកទទេ។','Total':'សរុប','Continue to checkout':'បន្តទៅការទូទាត់','Remove':'លុប','In Cart':'ក្នុងរទេះ','Add to Cart':'ដាក់ចូលរទេះ','Copy Prompt':'ចម្លង Prompt','Unlocked prompt':'Prompt បានដោះសោ','Full prompt is protected until payment is confirmed.':'Prompt ពេញលេញត្រូវបានការពាររហូតដល់ការទូទាត់ត្រូវបានបញ្ជាក់។',
    'BAKONG · KHQR':'BAKONG · KHQR','BAKONG - KHQR':'BAKONG - KHQR','Complete your payment':'បញ្ចប់ការទូទាត់','Scan to Pay':'ស្កេនដើម្បីបង់ប្រាក់','Pay securely with Bakong (KHQR)':'ទូទាត់ដោយសុវត្ថិភាពតាម Bakong (KHQR)','Amount to pay':'ចំនួនទឹកប្រាក់ត្រូវបង់','Scan the QR code with any Cambodian banking or wallet app':'ស្កេន QR ដោយប្រើកម្មវិធីធនាគារ ឬកាបូបលុយកម្ពុជាណាមួយ','Secure payment by Bakong':'ការទូទាត់សុវត្ថិភាពដោយ Bakong','Creating secure payment…':'កំពុងបង្កើតការទូទាត់សុវត្ថិភាព…','Waiting for Bakong payment…':'កំពុងរង់ចាំការទូទាត់ Bakong…','Waiting for payment confirmation…':'កំពុងរង់ចាំការបញ្ជាក់ការទូទាត់…','Check payment now':'ពិនិត្យការទូទាត់ឥឡូវ','Generate new KHQR':'បង្កើត KHQR ថ្មី','Payment confirmed ✓':'បានបញ្ជាក់ការទូទាត់ ✓','✓ Payment confirmed — prompts unlocked':'✓ បានបញ្ជាក់ការទូទាត់ — Prompt ត្រូវបានដោះសោ','KHQR expired. Generate a new one.':'KHQR ផុតកំណត់។ សូមបង្កើតថ្មី។','Generating KHQR…':'កំពុងបង្កើត KHQR…','Currency':'រូបិយប័ណ្ណ','Amount':'ចំនួនទឹកប្រាក់','Pay to':'បង់ទៅ','Secure payment':'ការទូទាត់សុវត្ថិភាព',
    'My Library':'បណ្ណាល័យរបស់ខ្ញុំ','No paid prompts on this device yet.':'មិនទាន់មាន Prompt បានបង់ប្រាក់នៅលើឧបករណ៍នេះទេ។','Paid with Bakong · Click to open':'បានបង់តាម Bakong · ចុចដើម្បីបើក',
    'Name':'ឈ្មោះ','Email':'អ៊ីមែល','How can we help?':'តើយើងអាចជួយអ្វីបាន?','Search prompts, creators, models...':'ស្វែងរក Prompt អ្នកបង្កើត ម៉ូដែល...','Customer name':'ឈ្មោះអតិថិជន','Checkout':'ទូទាត់','Generate KHQR':'បង្កើត KHQR'
  };
  const EN=Object.fromEntries(Object.entries(KH).map(([en,kh])=>[kh,en]));
  let lang=localStorage.getItem(KEY)||'EN';
  let busy=false;

  function translateText(root=document.body){
    if(busy)return; busy=true;
    const map=lang==='KH'?KH:EN;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>{
      if(!n.nodeValue||!n.nodeValue.trim())return NodeFilter.FILTER_REJECT;
      const p=n.parentElement;if(!p||['SCRIPT','STYLE','CODE'].includes(p.tagName)||p.closest('#langSwitch'))return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }});
    const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(n=>{const raw=n.nodeValue,trim=raw.trim();if(map[trim])n.nodeValue=raw.replace(trim,map[trim]);});
    document.querySelectorAll('input[placeholder],textarea[placeholder]').forEach(el=>{const p=el.getAttribute('placeholder');if(map[p])el.setAttribute('placeholder',map[p]);});
    document.documentElement.lang=lang==='KH'?'km':'en';
    document.querySelectorAll('#langSwitch button').forEach(b=>b.classList.toggle('active',b.dataset.lang===lang));
    busy=false;
  }

  function mount(){
    if(document.getElementById('langSwitch'))return;
    const box=document.createElement('div');box.id='langSwitch';box.className='lang-switch';box.innerHTML='<span class="lang-globe">🌐</span><button type="button" data-lang="EN">EN</button><button type="button" data-lang="KH">KH</button>';
    const target=document.querySelector('.top-actions')||document.querySelector('.topbar');target?.prepend(box);
    box.addEventListener('click',e=>{const b=e.target.closest('button[data-lang]');if(!b)return;lang=b.dataset.lang;localStorage.setItem(KEY,lang);translateText(document.body);});
    const style=document.createElement('style');style.textContent=`.lang-switch{display:flex;align-items:center;gap:2px;padding:4px;background:linear-gradient(135deg,#fff0f8,#ffe3f2);border:1px solid #ffc5df;border-radius:999px;box-shadow:0 7px 20px rgba(236,72,153,.12);flex:0 0 auto}.lang-switch .lang-globe{font-size:14px;padding:0 5px}.lang-switch button{border:0;background:transparent;color:#9b6680;font-weight:800;font-size:11px;padding:7px 10px;border-radius:999px;cursor:pointer}.lang-switch button.active{background:linear-gradient(135deg,#ff4fa0,#e82f8c);color:#fff;box-shadow:0 5px 13px rgba(232,47,140,.22)}@media(max-width:820px){.lang-switch{margin-left:auto}.lang-switch .lang-globe{display:none}.lang-switch button{padding:6px 8px}.top-actions{gap:7px}}`;
    document.head.appendChild(style);
  }

  window.addEventListener('DOMContentLoaded',()=>{
    mount();translateText(document.body);
    const obs=new MutationObserver(muts=>{if(busy)return;for(const m of muts){if(m.addedNodes.length){translateText(document.body);break}}});
    obs.observe(document.body,{childList:true,subtree:true});
  });
  window.NexLang={get:()=>lang,set:l=>{lang=l==='KH'?'KH':'EN';localStorage.setItem(KEY,lang);translateText(document.body)}};
})();
