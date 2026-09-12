"use client";
import { useState } from "react";
export function ProductSubmit() {
  const [ready, setReady] = useState(false);
  const [mail, setMail] = useState("");
  return <form className="mt-10 grid max-w-2xl gap-5" onSubmit={(event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const body = ["Ürün: " + data.get("name"), "Resmî URL: " + data.get("url"), "Üretici: " + data.get("maker"), "Şehir: " + data.get("city"), "Açıklama: " + data.get("description")].join("\n");
    setMail("mailto:merhaba@uretir.com?subject=" + encodeURIComponent("Türkiye Üretir — Ürün önerisi: " + data.get("name")) + "&body=" + encodeURIComponent(body));
    setReady(true);
  }}>
    <label className="grid gap-2 text-sm">Ürün adı<input required name="name" maxLength={100} className="rounded-lg border hairline bg-transparent p-3" /></label>
    <label className="grid gap-2 text-sm">Resmî ürün veya mağaza bağlantısı<input required name="url" type="url" pattern="https?://.+" maxLength={500} placeholder="https://" className="rounded-lg border hairline bg-transparent p-3" /></label>
    <div className="grid gap-5 sm:grid-cols-2"><label className="grid gap-2 text-sm">Üretici / ekip<input required name="maker" maxLength={100} className="rounded-lg border hairline bg-transparent p-3" /></label><label className="grid gap-2 text-sm">Türkiye&apos;deki şehir<input required name="city" maxLength={70} className="rounded-lg border hairline bg-transparent p-3" /></label></div>
    <label className="grid gap-2 text-sm">Hangi ihtiyacı çözüyor?<textarea required name="description" maxLength={1200} rows={4} className="rounded-lg border hairline bg-transparent p-3" /></label>
    <button className="rounded-lg bg-[#28452f] px-5 py-4 text-sm text-white" type="submit">E-posta taslağını hazırla ↗</button>
    {ready && <div role="status" className="rounded-lg border hairline p-5"><p className="text-sm leading-6">Taslak hazır. Henüz gönderilmedi. E-posta uygulamanda açıp gönderdiğinde ekibimize ulaşır; kayıtlar inceleme sonrası eklenir.</p><a className="mt-4 inline-block rounded-lg bg-[#d9e9bf] px-5 py-3 text-sm text-[#28452f]" href={mail}>E-posta uygulamasında aç ↗</a></div>}
  </form>;
}
