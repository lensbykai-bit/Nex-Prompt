const SUPABASE_URL='https://kbanmyaqodtfoqikzwou.supabase.co';
const SUPABASE_PUBLISHABLE='sb_publishable_7iqItoUm3UU8Vn24VZvC7Q_0AoTUrzo';
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

async function callGateway(model,messages){
  const token=process.env.VERCEL_OIDC_TOKEN;
  if(!token) throw new Error('AI gateway authentication is unavailable.');
  const r=await fetch('https://ai-gateway.vercel.sh/v1/chat/completions',{
    method:'POST',
    headers:{
      'Authorization':'Bearer '+token,
      'Content-Type':'application/json'
    },
    body:JSON.stringify({
      model,
      messages:[
        {role:'system',content:"You are NEXORA Ai Chat. Be helpful, concise, and safe. Reply in the user's language when practical."},
        ...messages
      ],
      temperature:0.7,
      max_tokens:1800
    })
  });
  const d=await r.json().catch(()=>({}));
  if(!r.ok) throw new Error(d?.error?.message || d?.message || ('AI gateway error ('+r.status+')'));
  const text=String(d?.choices?.[0]?.message?.content || '').trim();
  if(!text) throw new Error('AI returned an empty response.');
  return {text,model};
}

export default async function handler(req,res){
  if(req.method!=='POST') return json(res,405,{error:'Method not allowed'});
  if(!(await validUser(req.headers.authorization||''))) return json(res,401,{error:'Unauthorized'});
  const messages=cleanMessages(req.body && req.body.messages);
  if(!messages.length) return json(res,400,{error:'Please enter a message.'});

  let lastError='AI service is temporarily unavailable.';
  for(const model of MODELS){
    try{
      const out=await callGateway(model,messages);
      return json(res,200,{ok:true,text:out.text,free:true,cost:0,model:out.model});
    }catch(e){lastError=String(e && e.message || lastError);}
  }
  console.error('AI Chat gateway failure:',lastError);
  return json(res,503,{error:'AI service is temporarily unavailable. Please try again.'});
}
