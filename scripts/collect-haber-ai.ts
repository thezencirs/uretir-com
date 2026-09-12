import "dotenv/config";
import {collectNews} from "../lib/haber-ai/collector";
const run=await collectNews();
console.log(JSON.stringify(run,null,2));
if("status" in run && run.status==="failed")process.exitCode=1;
