import { generateText } from 'ai';

const SUPABASE_URL='https://kbanmyaqodtfoqikzwou.supabase.co';
const SUPABASE_PUBLISHABLE='sb_publishable_7iqItoUm3UU8Vn24VZvC7Q_0AoTUrzo';
const CHAT_ACCESS=SUPABASE_URL+'/functions/v1/chat-access';
const MODELS=['minimax/minimax-m2.7-free','poolside/laguna-s-2.1-free'];

function json(res,status,data){
  res.status(status).setHeader('Content-Type','application/json; charset=utf-8');
  res.setHeader('Cache-Control','no-store');
  res.end(JSON.stringify(data));
}

function cleanMessages(input){
  if(!Array.isArray(input)) return [];
  return input.slice(-12).map(m=>({
    role:m && m.role==='assistant'?'assistant':'user',
    content:String(m && m.content || '').slice(0,8000)
  })).filter(m=>m.content.trim());
}

async function validUser(auth){
  if(!auth || !/^Bearer\s+\S+/i.test(auth)) return false;
  try{
    const r=await fetch(SUPABASE_URL+'/auth/v1/user',{
      headers:{Authorization:auth,apikey:SUPABASE_PUBLISHABLE}
    });
    return r.ok;
  }catch{return false;}
}

async function accessCall(auth,action){
  try{
    const r=await fetch(CHAT_ACCESS+'?action='+encodeURIComponent(action),{
      method:'POST',
      headers:{
        Authorization:auth,
        apikey:SUPABASE_PUBLISHABLE,
        'Content-Type':'application/json'
      },
      body:'{}'
    });
    const d=await r.json().catch(()=>({}));
    return {ok:r.ok,status:r.status,data:d};
  }catch{
    return {ok:false,status:503,data:{error:'Chat access service is temporarily unavailable.'}};
  }
}

async function callGateway(model,messages){
  const result=await generateText({
    model,
    system:"You are NEXORA Ai Chat. Be helpful, concise, and safe. Reply in the user's language when practical.",
    messages,
    temperature:0.7,
    maxOutputTokens:1800
  });
  const text=String(result?.text||'').trim();
  if(!text) throw new Error('AI returned an empty response.');
  return {text,model};
}

export default async function handler(req,res){
  if(req.method!=='POST') return json(res,405,{error:'Method not allowed'});
  const auth=req.headers.authorization||'';
  if(!(await validUser(auth))) return json(res,401,{error:'Unauthorized'});
  const messages=cleanMessages(req.body && req.body.messages);
  if(!messages.length) return json(res,400,{error:'Please enter a message.'});

  const access=await accessCall(auth,'authorize');
  if(!access.ok){
    const d=access.data||{};
    return json(res,access.status||402,{
      error:d.error||'AI Chat access is unavailable.',
      code:d.code||((access.status===429)?'DAILY_LIMIT_REACHED':'SUBSCRIPTION_REQUIRED'),
      access:d
    });
  }

  let lastError='AI service is temporarily unavailable.';
  for(const model of MODELS){
    try{
      const out=await callGateway(model,messages);
      accessCall(auth,'record').catch(()=>{});
      return json(res,200,{ok:true,text:out.text,cost:0,model:out.model,access:access.data});
    }catch(e){
      lastError=String(e && e.message || lastError);
      console.error('AI Chat model failure',model,lastError);
    }
  }
  console.error('AI Chat gateway failure:',lastError);
  return json(res,503,{error:'AI service is temporarily unavailable. Please try again.'});
}
