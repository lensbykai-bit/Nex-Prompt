(async()=>{
  if(!window.NexStore) return;
  try{
    const catalog=await NexStore.catalog();
    if(Array.isArray(catalog.items)&&catalog.items.length){
      const cloud=catalog.items.map(p=>({id:String(p.id),title:p.title,category:p.category,price:Number(p.price),creator:p.creator,model:p.model||'',image:p.image_url||'',preview:p.preview_url||'',prompt:''}));
      window.nexCloudCatalog=cloud;
      const grid=document.querySelector('#promptGrid');
      if(grid){
        grid.innerHTML=cloud.map(p=>`<article class="prompt-card" data-cloud-id="${p.id}"><div class="prompt-image" style="--bg:url('${p.image}')"><span class="tag">${p.category}</span><span class="mini-play">▶</span></div><div class="prompt-body"><h3>${p.title}</h3><div><span>@ ${p.creator}</span><strong>$${p.price.toFixed(2)}</strong></div><small>${p.model}</small></div></article>`).join('');
      }
    }
    if(NexStore.session){
      try{
        const me=await NexStore.me();
        const b=document.querySelector('#loginBtn');
        if(b) b.textContent=me.profile?.display_name||me.user?.email||'Account';
        const fav=await NexStore.favorites(); localStorage.setItem('nex_cloud_favorites',JSON.stringify(fav.ids||[]));
        const pur=await NexStore.purchases(); localStorage.setItem('nex_cloud_purchases',JSON.stringify((pur.items||[]).map(x=>String(x.prompt_id))));
      }catch(e){ console.warn('Nex cloud session needs sign in',e); }
    }
  }catch(e){ console.warn('Nex cloud unavailable; local storefront remains active.',e); }
})();
