const NEX_STORE_API = 'https://kbanmyaqodtfoqikzwou.supabase.co/functions/v1/store-api';
window.NexStore = {
  session: JSON.parse(localStorage.getItem('nex_cloud_session') || 'null'),
  async request(action, options = {}) {
    const headers = {'Content-Type':'application/json'};
    if (this.session?.access_token) headers.Authorization = `Bearer ${this.session.access_token}`;
    const res = await fetch(`${NEX_STORE_API}?action=${encodeURIComponent(action)}${options.query || ''}`, {
      method: options.method || 'GET', headers,
      body: options.body ? JSON.stringify(options.body) : undefined
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  },
  catalog(){ return this.request('catalog'); },
  async signup(name,email,password){ const d=await this.request('signup',{method:'POST',body:{name,email,password}}); if(d.session){this.session=d.session;localStorage.setItem('nex_cloud_session',JSON.stringify(d.session));} return d; },
  async signin(email,password){ const d=await this.request('signin',{method:'POST',body:{email,password}}); this.session=d.session;localStorage.setItem('nex_cloud_session',JSON.stringify(d.session)); return d; },
  signout(){ this.session=null;localStorage.removeItem('nex_cloud_session'); },
  me(){ return this.request('me'); },
  favorites(){ return this.request('favorites'); },
  toggleFavorite(prompt_id){ return this.request('favorite-toggle',{method:'POST',body:{prompt_id}}); },
  purchases(){ return this.request('purchases'); },
  prompt(id){ return this.request('prompt',{query:`&id=${encodeURIComponent(id)}`}); },
  checkout(prompt_ids){ return this.request('demo-checkout',{method:'POST',body:{prompt_ids}}); }
};
