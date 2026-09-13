import {randomBytes} from 'node:crypto';
import {existsSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const file = 'whatsapp-bot/.env';
if(existsSync(file)) throw new Error('Bot configuration already exists; preserve it.');
const secret=randomBytes(32).toString('hex');
const result=spawnSync('npx.cmd',['--yes','vercel@latest','env','add','WHATSAPP_BOT_SECRET','production'],{input:secret+'\n',encoding:'utf8',shell:true,windowsHide:true});
if(result.status!==0){ console.error('Bot secret provisioning failed.');process.exit(1);}
writeFileSync(file,`SITE_URL=https://www.uretir.com\nWHATSAPP_BOT_SECRET=${secret}\nPOLL_MINUTES=30\n`,{flag:'wx'});
console.log('Dedicated bot credential installed; value not logged.');
