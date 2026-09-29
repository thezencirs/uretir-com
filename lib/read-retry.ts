export async function withReadRetry<T>(read:()=>Promise<T>,attempts=3):Promise<T>{
  let last:unknown;
  const count=Math.max(1,Math.min(attempts,5));
  for(let attempt=0;attempt<count;attempt++){
    try{return await read();}
    catch(error){last=error;if(attempt<count-1)await new Promise(resolve=>setTimeout(resolve,250*(attempt+1)));}
  }
  if(last instanceof Error)throw last;
  throw new Error("Read operation failed.");
}
