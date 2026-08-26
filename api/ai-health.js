import { generateText } from 'ai';

export default async function handler(req,res){
  if(req.method!=='GET'){
    res.status(405).json({ok:false,error:'Method not allowed'});
    return;
  }
  try{
    const result=await generateText({
      model:'poolside/laguna-s-2.1-free',
      prompt:'Reply with exactly: NEXORA AI OK',
      maxOutputTokens:32,
      temperature:0
    });
    res.status(200).json({ok:true,text:String(result.text||'').trim(),model:'poolside/laguna-s-2.1-free'});
  }catch(e){
    console.error('AI health failure:',e);
    res.status(503).json({ok:false,error:String(e&&e.message||e)});
  }
}
