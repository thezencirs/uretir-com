import { ClipboardCheck } from "lucide-react";
import { getContentAuthorityReport } from "@/lib/content-authority";
import type { ContentDocument } from "@/lib/content-model";

const fieldLabels: Array<[string, string]> = [
  ["editorial.sources", "resmî veya birincil kaynak"],
  ["editorial.review", "alan uzmanı ve kaynak incelemesi"],
  ["entityRelations", "canonical entity ilişkileri"],
  ["blocks.examples", "özgün veya açıkça varsayımsal örnek"],
  ["blocks.prosCons", "avantaj ve sınırlamalar"],
  ["internalLinks", "bağlamsal ileri okuma yolları"],
  ["searchIntent.", "arama niyeti cevap kapsamı"],
];

export function AuthorityReadinessNotice({ document }: { document: ContentDocument }) {
  const report = getContentAuthorityReport(document);
  if (report.ready) return null;
  const priorities = fieldLabels
    .filter(([prefix]) => report.blocking.some((issue) => issue.field.startsWith(prefix)))
    .map(([, label]) => label)
    .slice(0, 4);

  return <aside className="mt-5 border hairline bg-[color:var(--surface)] p-5" aria-label="İçerik yayın hazırlığı">
    <div className="flex items-start gap-3">
      <ClipboardCheck size={17} className="mt-1 shrink-0 text-[#b26959]" aria-hidden="true" />
      <div>
        <p className="text-sm font-bold">Authority yayın kapısı tamamlanmadı</p>
        <p className="mt-2 text-xs leading-6 text-muted">Bu kayıt {report.blocking.length} zorunlu editoryal kontrol beklediği için indekslenmez ve zengin sonuç verisi üretmez.</p>
        {priorities.length > 0 && <p className="mt-3 text-xs leading-6 text-muted"><strong className="text-[color:var(--foreground)]">Öncelikli eksikler:</strong> {priorities.join(", ")}.</p>}
      </div>
    </div>
  </aside>;
}
