const fs = require('node:fs');
const cp = require('node:child_process');
const root = 'C:/Users/zenci/uretir-puanai-link';
const file = root+'/app/puan-ai/page.tsx';
let source = fs.readFileSync(file,'utf8');
source = source.replace('import { PuanAIAdvisor } from "@/components/puan-ai-advisor";\n','');
source = source.replace('{ label: "PuanAI", href: "/puan-ai/uygulama" }','{ label: "PuanAI", href: "#danisman" }');
source = source.replace('<a href="/puan-ai/uygulama" className="puan-primary-button">PuanAI uygulamasını aç <ArrowUpRight size={16} /></a>','<Link href="#danisman" className="puan-primary-button">PuanAI&apos;a sor <ArrowUpRight size={16} /></Link>');
source = source.replace('<section id="danisman" className="section-wrap"><PuanAIAdvisor campaigns={puanAICampaigns} /></section>', `<section id="danisman" className="section-wrap scroll-mt-24">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl">PuanAI&apos;a sor</h2>
        <a href="https://puan-ai.vercel.app/" target="_blank" rel="noopener noreferrer" className="puan-secondary-button">Tam ekranda aç <ArrowUpRight size={16} /></a>
      </div>
      <iframe src="https://puan-ai.vercel.app/" title="PuanAI — Kart ve harcama karşılaştırma uygulaması" className="w-full rounded-2xl border hairline bg-white" style={{ height: "min(1100px, 85svh)", minHeight: 680 }} loading="lazy" allow="fullscreen" />
    </section>`);
fs.writeFileSync(file,source);
fs.writeFileSync(root+'/next.config.ts',cp.execFileSync('git',['show','HEAD:next.config.ts'],{cwd:root}));
let ecosystem=fs.readFileSync(root+'/app/ekosistem/page.tsx','utf8').replace('href: "/puan-ai/uygulama"','href: "/puan-ai#danisman"');
fs.writeFileSync(root+'/app/ekosistem/page.tsx',ecosystem);
const modules=root+'/node_modules';
if(fs.lstatSync(modules).isSymbolicLink())fs.unlinkSync(modules);
console.log('Embedded PuanAI in the existing advisor section; original button preserved.');
