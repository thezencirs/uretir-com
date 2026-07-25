import { CircleCheck, Network, ShieldCheck } from "lucide-react";
import { getKnowledgeGraphCoverage, knowledgeEntityKinds, uretirKnowledgeGraph, validateKnowledgeGraph } from "@/lib/knowledge-graph";

export function KnowledgeGraphFoundation() {
  const entities = [...uretirKnowledgeGraph.entities.values()];
  const relations = [...uretirKnowledgeGraph.outgoing.values()].flat();
  const issues = validateKnowledgeGraph(uretirKnowledgeGraph);
  const coverage = getKnowledgeGraphCoverage(uretirKnowledgeGraph);
  const publishedOrVerified = entities.filter((entity) => entity.status === "published" || entity.status === "verified").length;
  const reviewRecords = entities.filter((entity) => entity.status === "in_review").length;

  return <section className="section-wrap py-12 md:py-20" aria-labelledby="bilgi-grafigi-temeli">
    <div className="border hairline bg-[color:var(--surface)] p-7 md:p-10">
      <div className="grid gap-10 md:grid-cols-[.75fr_1.25fr]">
        <div>
          <Network size={24} className="text-[#78a5b6]" aria-hidden="true" />
          <p className="mt-6 eyebrow">Canlı kapsam / Editoryal graph</p>
          <h2 id="bilgi-grafigi-temeli" className="mt-5 font-display text-4xl md:text-5xl">Yanıt değil,<br /><em>ilişki ağı.</em></h2>
          <p className="mt-5 text-sm leading-7 text-muted">Bu sayılar Türkiye üretim ekosisteminin kapsamını değil, bugün kodda kaynak ve durum bilgisiyle bağlı kayıtları gösterir.</p>
        </div>
        <div>
          <div className="grid gap-px bg-[color:var(--line)] sm:grid-cols-2">
            <div className="bg-[color:var(--background)] p-6"><strong className="font-display text-4xl">{entities.length}</strong><span className="mt-2 block text-xs text-muted">Bağlı varlık kaydı</span></div>
            <div className="bg-[color:var(--background)] p-6"><strong className="font-display text-4xl">{relations.length}</strong><span className="mt-2 block text-xs text-muted">Yönlü ilişki</span></div>
            <div className="bg-[color:var(--background)] p-6"><strong className="font-display text-4xl">{publishedOrVerified}</strong><span className="mt-2 block text-xs text-muted">Yayımlanmış veya doğrulanmış</span></div>
            <div className="bg-[color:var(--background)] p-6"><strong className="font-display text-4xl">{reviewRecords}</strong><span className="mt-2 block text-xs text-muted">İnceleme kaydı</span></div>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {knowledgeEntityKinds.map((kind) => <span key={kind} className="rounded-full border hairline px-3 py-2 text-[9px] font-bold uppercase tracking-[.08em] text-muted">{kind.replaceAll("_", " ")}</span>)}
          </div>
        </div>
      </div>
      <div className="mt-8 grid gap-4 border-t hairline pt-6 sm:grid-cols-2">
        <div className="flex items-start gap-3 text-xs leading-6 text-muted"><ShieldCheck size={17} className="mt-1 shrink-0 text-[#78a5b6]" aria-hidden="true" /><p>Kamu önerileri inceleme kayıtlarını varsayılan olarak dışarıda bırakır. UretirAI yalnızca yayımlanmış veya doğrulanmış düğümleri önerebilir.</p></div>
        <div className="flex items-start gap-3 text-xs leading-6 text-muted"><CircleCheck size={17} className="mt-1 shrink-0 text-[#769d32]" aria-hidden="true" /><p>{issues.length === 0 ? `Graph bütünlük denetimi kaynak, ilişki hedefi, orphan ve canonical çakışması bulmadı. ${coverage.entityCount} varlığın tamamı en az bir ilişkiye bağlı.` : `${issues.length} graph bütünlük sorunu editoryal çözüm bekliyor.`}</p></div>
      </div>
    </div>
  </section>;
}
