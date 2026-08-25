(()=>{
  const KEY='nex_prompt_lang';
  const KH={
    'Home':'ទំព័រដើម','Prompt':'Prompt','AI Tools':'AI Tools','Credits':'Credits','How it works':'របៀបប្រើ',
    'Browse by category':'រកមើលតាមប្រភេទ','Find the motion style you need':'ស្វែងរកស្ទីលចលនាដែលអ្នកត្រូវការ','Popular Prompts':'Prompt ពេញនិយម','View all prompts →':'មើល Prompt ទាំងអស់ →',
    'High Quality Prompts':'Prompt គុណភាពខ្ពស់','Carefully crafted and tested for reliable results.':'រៀបចំ និងសាកល្បងយ៉ាងម៉ត់ចត់ ដើម្បីទទួលបានលទ្ធផលគួរឱ្យទុកចិត្ត។',
    'Multiple AI Models':'ម៉ូដែល AI ច្រើន','Works with leading image-to-video tools.':'អាចប្រើជាមួយឧបករណ៍រូបភាពទៅវីដេអូឈានមុខ។',
    'Instant Access':'ចូលប្រើភ្លាមៗ','Get your prompts immediately after purchase.':'ទទួល Prompt របស់អ្នកភ្លាមៗបន្ទាប់ពីទិញ។',
    'Secure & Safe':'សុវត្ថិភាពខ្ពស់','Protected checkout and payment verification.':'ការទូទាត់ និងការផ្ទៀងផ្ទាត់ត្រូវបានការពារ។',
    'Choose a prompt':'ជ្រើសរើស Prompt','Pay securely':'ទូទាត់ដោយសុវត្ថិភាព','Create your video':'បង្កើតវីដេអូរបស់អ្នក',
    'Frequently asked questions':'សំណួរដែលសួរញឹកញាប់','Need help?':'ត្រូវការជំនួយ?','Send message':'ផ្ញើសារ',
    'Search prompts, creators, models...':'ស្វែងរក Prompt អ្នកបង្កើត ម៉ូដែល...','Your Cart':'រទេះទិញរបស់អ្នក','Total':'សរុប','Continue to checkout':'បន្តទៅការទូទាត់'
  };
  const EN=Object.fromEntries(Object.entries(KH).map(([en,kh])=>[kh,en]));
  let lang=localStorage.getItem(KEY)||'EN';
  let busy=false;
  const currentUrl=new URL(location.href);
  const currentView=['prompt','tools','credits'].includes(currentUrl.searchParams.get('view'))?currentUrl.searchParams.get('view'):'home';
  const shareToken=currentUrl.searchParams.get('_vercel_share')||'';

  function hrefFor(view='home',hash='',query=''){
    const p=new URLSearchParams();
    if(view!=='home')p.set('view',view);
    if(query)p.set('q',query);
    if(shareToken)p.set('_vercel_share',shareToken);
    return `${location.pathname}${p.toString()?`?${p.toString()}`:''}${hash||''}`;
  }

  function syncCustomText(){
    document.querySelectorAll('[data-view-en][data-view-km]').forEach(el=>{
      const next=lang==='KH'?el.dataset.viewKm:el.dataset.viewEn;
      if(next&&el.textContent!==next)el.textContent=next;
    });
  }

  function translateText(root=document.body){
    if(!root||busy)return;busy=true;
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
    syncCustomText();busy=false;
  }

  function mountLanguage(){
    if(document.getElementById('langSwitch'))return;
    const box=document.createElement('div');box.id='langSwitch';box.className='lang-switch';
    box.innerHTML='<span class="lang-globe">🌐</span><button type="button" data-lang="EN">EN</button><button type="button" data-lang="KH">KH</button>';
    const target=document.querySelector('.top-actions')||document.querySelector('.topbar');target?.prepend(box);
    box.addEventListener('click',e=>{const b=e.target.closest('button[data-lang]');if(!b)return;lang=b.dataset.lang;localStorage.setItem(KEY,lang);translateText(document.body);});
  }

  function addStyles(){
    if(document.getElementById('nex-view-style'))return;
    const style=document.createElement('style');style.id='nex-view-style';style.textContent=`
      .lang-switch{display:flex;align-items:center;gap:2px;padding:4px;background:#100c18;border:1px solid #3a2039;border-radius:999px;box-shadow:0 8px 22px rgba(0,0,0,.2);flex:0 0 auto}.lang-switch .lang-globe{font-size:14px;padding:0 5px}.lang-switch button{border:0;background:transparent;color:#9f95a5;font-weight:800;font-size:11px;padding:7px 10px;border-radius:999px;cursor:pointer}.lang-switch button.active{background:linear-gradient(135deg,#ff2f8d,#a855f7);color:#fff;box-shadow:0 5px 13px rgba(232,47,140,.22)}
      .nex-view-hidden{display:none!important}.main-nav{gap:34px!important}.main-nav a{white-space:nowrap!important}.main-nav a.active{color:#ff5aa8!important;border-color:#ff2f8d!important}
      .nex-home-highlights{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin:30px 0 4px}.nex-highlight-card{display:block;padding:24px;border:1px solid #38203d;border-radius:20px;background:linear-gradient(145deg,#100d18,#17101f);box-shadow:0 15px 38px rgba(0,0,0,.18);transition:.2s}.nex-highlight-card:hover{transform:translateY(-4px);border-color:#8f2b69;box-shadow:0 24px 52px rgba(0,0,0,.3)}.nex-highlight-icon{width:46px;height:46px;display:grid;place-items:center;border-radius:14px;background:linear-gradient(145deg,#ff4fa2,#ec2583);font-size:21px;margin-bottom:16px}.nex-highlight-card h3{margin:0 0 8px;color:#fff;font-size:20px}.nex-highlight-card p{margin:0;color:#9f94a6;font-size:13px;line-height:1.65}.nex-highlight-link{display:inline-block;margin-top:15px;color:#ff66ae;font-size:12px;font-weight:800}
      .nex-page-intro{margin:4px 0 28px;padding:34px 36px;border:1px solid #44213f;border-radius:24px;background:radial-gradient(circle at 85% 15%,rgba(255,47,141,.18),transparent 28%),linear-gradient(135deg,#100b18,#1a1023);box-shadow:0 20px 52px rgba(0,0,0,.22)}.nex-page-intro .nex-page-pill{display:inline-flex;padding:7px 11px;border-radius:999px;background:#281128;border:1px solid #512044;color:#ff68af;font-size:10px;font-weight:900;letter-spacing:.04em}.nex-page-intro h1{margin:14px 0 8px;color:#fff;font-size:42px;letter-spacing:-.035em}.nex-page-intro p{margin:0;max-width:760px;color:#a99daa;line-height:1.7;font-size:14px}.nex-page-intro-actions{display:flex;gap:10px;margin-top:20px;flex-wrap:wrap}.nex-page-intro-actions a{padding:11px 15px;border-radius:12px;border:1px solid #5c2850;background:#130e1b;color:#f4dce9;font-size:12px;font-weight:800}.nex-page-intro-actions a.primary-link{border:0;background:linear-gradient(135deg,#ff238e,#ff61ad);color:#fff}
      @media(max-width:1050px){.main-nav{gap:20px!important}.main-nav a{font-size:11px!important}.nex-home-highlights{grid-template-columns:1fr}.nex-page-intro h1{font-size:34px}}@media(max-width:820px){.lang-switch{margin-left:auto}.lang-switch .lang-globe{display:none}.lang-switch button{padding:6px 8px}.top-actions{gap:7px}.nex-page-intro{padding:25px 20px}}
    `;document.head.appendChild(style);
  }

  function buildNav(){
    const nav=document.querySelector('.main-nav');if(!nav)return;
    nav.innerHTML=`
      <a data-nav-view="home" data-view-en="Home" data-view-km="ទំព័រដើម" href="${hrefFor('home')}">Home</a>
      <a data-nav-view="prompt" data-view-en="Prompt" data-view-km="Prompt" href="${hrefFor('prompt')}">Prompt</a>
      <a data-nav-view="tools" data-view-en="AI Tools" data-view-km="AI Tools" href="${hrefFor('tools')}">AI Tools</a>
      <a data-nav-view="credits" data-view-en="Credits" data-view-km="Credits" href="${hrefFor('credits')}">Credits</a>
      <a data-nav-view="how" data-view-en="How it works" data-view-km="របៀបប្រើ" href="${hrefFor('home','#how')}">How it works</a>`;
    const active=location.hash==='#how'&&currentView==='home'?'how':currentView;
    nav.querySelector(`[data-nav-view="${active}"]`)?.classList.add('active');
    const brand=document.querySelector('.brand');if(brand)brand.href=hrefFor('home');
  }

  function injectHomeHighlights(){
    if(document.getElementById('nexHomeHighlights'))return;
    const hero=document.querySelector('.hero');if(!hero)return;
    const section=document.createElement('section');section.id='nexHomeHighlights';section.className='nex-home-highlights';
    section.innerHTML=`
      <a class="nex-highlight-card" href="${hrefFor('prompt')}"><div class="nex-highlight-icon">▧</div><h3 data-view-en="Prompt Marketplace" data-view-km="ទីផ្សារ Prompt">Prompt Marketplace</h3><p data-view-en="Premium image-to-video prompts ready for creators, ads and cinematic content." data-view-km="Prompt រូបភាពទៅវីដេអូ គុណភាពខ្ពស់ សម្រាប់ Creator, Ads និង Content បែបភាពយន្ត។">Premium image-to-video prompts ready for creators, ads and cinematic content.</p><span class="nex-highlight-link" data-view-en="Browse prompts →" data-view-km="មើល Prompt →">Browse prompts →</span></a>
      <a class="nex-highlight-card" href="${hrefFor('tools')}"><div class="nex-highlight-icon">✦</div><h3 data-view-en="AI Tools Workspace" data-view-km="AI Tools Workspace">AI Tools Workspace</h3><p data-view-en="One member account for AI Chat, Image, Video, Voice and Dubbing tools." data-view-km="Account តែមួយសម្រាប់ AI Chat, Image, Video, Voice និង Dubbing។">One member account for AI Chat, Image, Video, Voice and Dubbing tools.</p><span class="nex-highlight-link" data-view-en="Open AI tools →" data-view-km="បើក AI Tools →">Open AI tools →</span></a>
      <a class="nex-highlight-card" href="${hrefFor('credits')}"><div class="nex-highlight-icon">◆</div><h3 data-view-en="Shared Credit Wallet" data-view-km="Credit Wallet រួម">Shared Credit Wallet</h3><p data-view-en="Top up credits with Bakong KHQR and use the same wallet across supported AI tools." data-view-km="បញ្ចូល Credits តាម Bakong KHQR ហើយប្រើ Wallet ដូចគ្នាសម្រាប់ AI Tools ដែលគាំទ្រ។">Top up credits with Bakong KHQR and use the same wallet across supported AI tools.</p><span class="nex-highlight-link" data-view-en="Buy credits →" data-view-km="ទិញ Credits →">Buy credits →</span></a>`;
    hero.insertAdjacentElement('afterend',section);
  }

  function injectPageIntro(view){
    document.getElementById('nexPageIntro')?.remove();
    if(view==='home')return;
    const target=view==='prompt'?document.querySelector('#categories'):view==='tools'?document.querySelector('#ai-tools'):document.querySelector('#credit-plans');if(!target)return;
    const data={
      prompt:{pill:'PROMPT MARKETPLACE',title:'Image-to-Video Prompt Store',km:'ហាង Prompt រូបភាពទៅវីដេអូ',desc:'Browse and buy ready-to-use prompts for cinematic motion, product ads, fantasy, anime and more.',descKm:'ស្វែងរក និងទិញ Prompt រួចរាល់ សម្រាប់ចលនាបែបភាពយន្ត Product Ads, Fantasy, Anime និងច្រើនទៀត។'},
      tools:{pill:'MEMBER AI TOOLS',title:'AI Tools Workspace',km:'AI Tools Workspace',desc:'Sign in once, then use your shared credit wallet across AI Chat, Image, Video, Voice and Dubbing tools as they are connected.',descKm:'ចូលគណនីម្តង ហើយប្រើ Credit Wallet រួមសម្រាប់ AI Chat, Image, Video, Voice និង Dubbing ពេល Tool ត្រូវបានភ្ជាប់។'},
      credits:{pill:'AI CREDIT WALLET',title:'Buy AI Credits',km:'ទិញ AI Credits',desc:'Top up your wallet with Bakong KHQR, then use those credits inside supported Nex Prompt AI tools.',descKm:'បញ្ចូល Credits តាម Bakong KHQR ហើយយក Credits ទៅប្រើក្នុង Nex Prompt AI Tools ដែលគាំទ្រ។'}
    }[view];
    const intro=document.createElement('section');intro.id='nexPageIntro';intro.className='nex-page-intro';intro.innerHTML=`<span class="nex-page-pill">${data.pill}</span><h1 data-view-en="${data.title}" data-view-km="${data.km}">${data.title}</h1><p data-view-en="${data.desc}" data-view-km="${data.descKm}">${data.desc}</p><div class="nex-page-intro-actions"><a href="${hrefFor('home')}" data-view-en="← Home" data-view-km="← ទំព័រដើម">← Home</a>${view==='prompt'?`<a class="primary-link" href="#popular" data-view-en="Browse Prompts" data-view-km="មើល Prompt">Browse Prompts</a>`:''}${view==='tools'?`<a class="primary-link" href="${hrefFor('credits')}" data-view-en="Get Credits" data-view-km="ទិញ Credits">Get Credits</a>`:''}${view==='credits'?`<a class="primary-link" href="${hrefFor('tools')}" data-view-en="Open AI Tools" data-view-km="បើក AI Tools">Open AI Tools</a>`:''}</div>`;
    target.insertAdjacentElement('beforebegin',intro);
  }

  function applyView(){
    const groups={hero:document.querySelector('.hero'),models:document.querySelector('#models'),tools:document.querySelector('#ai-tools'),credits:document.querySelector('#credit-plans'),categories:document.querySelector('#categories'),popular:document.querySelector('#popular'),benefits:document.querySelector('.benefits'),how:document.querySelector('#how'),pricing:document.querySelector('#pricing'),feature:document.querySelector('#new'),creator:document.querySelector('.creator-section'),testimonials:document.querySelector('.testimonials'),faq:document.querySelector('#faq'),contact:document.querySelector('#contact'),footer:document.querySelector('.footer')};
    Object.values(groups).forEach(el=>el?.classList.add('nex-view-hidden'));
    const show=keys=>keys.forEach(k=>groups[k]?.classList.remove('nex-view-hidden'));
    if(currentView==='home'){
      show(['hero','benefits','how','feature','creator','testimonials','faq','contact','footer']);
      injectHomeHighlights();
      document.title='Nex Prompt — AI Creator Marketplace';
    }else if(currentView==='prompt'){
      show(['categories','popular','benefits','footer']);
      injectPageIntro('prompt');document.title='Prompt Marketplace — Nex Prompt';
    }else if(currentView==='tools'){
      show(['tools','footer']);
      injectPageIntro('tools');document.title='AI Tools — Nex Prompt';
    }else if(currentView==='credits'){
      show(['credits','footer']);
      injectPageIntro('credits');document.title='AI Credits — Nex Prompt';
    }
    document.querySelector('#pricing')?.classList.add('nex-view-hidden');
    document.querySelector('#models')?.classList.add('nex-view-hidden');
    const explore=document.querySelector('#exploreBtn');if(explore)explore.onclick=()=>{location.href=hrefFor('prompt')};
    const how=document.querySelector('#howBtn');if(how)how.onclick=()=>{location.href=hrefFor('home','#how')};
    const creator=document.querySelector('#creatorAdminBtn');if(creator)creator.onclick=()=>{location.href=hrefFor('prompt')};
  }

  function wireSearch(){
    const input=document.querySelector('#searchInput');if(!input)return;
    input.addEventListener('keydown',e=>{if(e.key!=='Enter')return;const q=input.value.trim();if(currentView!=='prompt'){e.preventDefault();location.href=hrefFor('prompt','',q)}});
    if(currentView==='prompt'){
      const q=currentUrl.searchParams.get('q');if(q){input.value=q;setTimeout(()=>input.dispatchEvent(new Event('input',{bubbles:true})),150)}
    }
  }

  window.addEventListener('DOMContentLoaded',()=>{
    addStyles();mountLanguage();buildNav();applyView();wireSearch();translateText(document.body);
    setTimeout(()=>translateText(document.body),500);setTimeout(()=>translateText(document.body),1400);
    if(location.hash==='#how'&&currentView==='home')setTimeout(()=>document.querySelector('#how')?.scrollIntoView({behavior:'smooth',block:'start'}),250);
  });
  window.NexLang={get:()=>lang,set:l=>{lang=l==='KH'?'KH':'EN';localStorage.setItem(KEY,lang);translateText(document.body)}};
})();