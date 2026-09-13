import dotenv from 'dotenv';
import {existsSync,readFileSync,writeFileSync} from 'node:fs';
dotenv.config({path:'whatsapp-bot/.env',quiet:true});
const endpoint='https://www.uretir.com/api/haber-ai/whatsapp';
const headers={Authorization:`Bearer ${process.env.WHATSAPP_BOT_SECRET}`,'Content-Type':'application/json'};
const stateFile='whatsapp-bot/data/pending-publication.json';
const action=process.argv[2]||'preview';
async function call(url,body){const r=await fetch(url,{headers,method:body?'POST':'GET',body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(60000)});if(!r.ok)throw Error(`HTTP ${r.status}`);return r.json();}
if(action==='preview'){console.log(JSON.stringify(await call('https://www.uretir.com/api/cron/haber-ai')));console.log(JSON.stringify(await call(endpoint)));}
else if(action==='claim'){
 if(existsSync(stateFile)){const s=JSON.parse(readFileSync(stateFile,'utf8'));if(!s.completed){console.log(JSON.stringify(s));process.exit(0);}}
 const result=await call(endpoint,{action:'claim'});
 if(result.bulletin)writeFileSync(stateFile,JSON.stringify(result.bulletin,null,2));
 console.log(JSON.stringify(result));
}else if(action==='ack'){
 const messageId=process.argv[3];if(!messageId)throw Error('Visible delivery evidence identifier required');
 const state=JSON.parse(readFileSync(stateFile,'utf8'));
 const result=await call(endpoint,{action:'ack',claimId:state.claimId,messageId});
 writeFileSync(stateFile,JSON.stringify({...state,completed:true,evidence:messageId,completedAt:new Date().toISOString()},null,2));console.log(JSON.stringify(result));
}else throw Error('Unknown action');
