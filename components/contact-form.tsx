import { ArrowUpRight, CircleAlert, Mail } from "lucide-react";
import { analyticsAttributes } from "@/lib/analytics";

export function ContactForm() {
  return <section className="surface-panel grid min-h-[360px] content-center p-8 md:p-10" aria-labelledby="contact-direct-title">
    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f2e6af] text-[#5b512d] dark:bg-[#4a4121] dark:text-[#f2e6af]">
      <Mail size={20} aria-hidden="true" />
    </div>
    <p className="eyebrow mt-7">Doğrudan iletişim</p>
    <h2 id="contact-direct-title" className="mt-4 font-display text-4xl">Mesajınızı e-postayla gönderin.</h2>
    <p className="mt-4 max-w-lg text-sm leading-7 text-muted">Web formu henüz veri toplamıyor. Mesajınızın kaybolmaması ve hangi kanala gönderildiğinin açık olması için doğrudan e-posta kullanıyoruz.</p>
    <a href="mailto:merhaba@uretir.com" className="focus-ring mt-7 inline-flex w-fit min-h-11 items-center gap-2 rounded-full bg-[color:var(--foreground)] px-5 text-xs font-bold text-[color:var(--background)]" {...analyticsAttributes({ event: "contact_select", surface: "contact", target: "email" })}>
      merhaba@uretir.com <ArrowUpRight size={15} aria-hidden="true" />
    </a>
    <div className="mt-7 flex items-start gap-2 border-t hairline pt-5 text-xs leading-6 text-muted">
      <CircleAlert size={15} className="mt-1 shrink-0" aria-hidden="true" />
      <p>Bu sayfada ad, e-posta adresi veya mesaj içeriği saklanmaz.</p>
    </div>
  </section>;
}
