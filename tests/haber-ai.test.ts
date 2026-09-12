import {describe,it,expect} from "vitest";
import {feeds,matchProvinces,parseFeed} from "@/lib/haber-ai/model";
import {newsDay} from "@/lib/haber-ai/dates";
import {buildBulletin} from "@/lib/haber-ai/bulletin";
import provinces from "@/lib/haber-ai/provinces.json";
import map from "@/lib/haber-ai/map.json";
const now=new Date("2026-09-12T12:00:00Z");
const xml=(url="https://www.trthaber.com/haber/turkiye/ornek-1.html",date=now.toUTCString())=>`<rss><channel><item><title>İzmir'de eğitim buluşması</title><description>İstanbul ve Ankara heyetleri katıldı.</description><link>${url}</link><pubDate>${date}</pubDate><enclosure url="https://example.com/photo.jpg"/></item></channel></rss>`;
describe("HaberAI",()=>{
 it("maps all 81 provinces and has a clickable geometry for every code",()=>{expect(provinces).toHaveLength(81);for(const p of provinces){expect(matchProvinces(p.name+" ilinde gelişme")).toContain(p.code);expect(map.some(c=>c.code===p.code)).toBe(true);}});
 it("does not match ordinary ambiguous words or partial city names",()=>{expect(matchProvinces("ağrı ve tokat, ordu personeli, Karamanoğlu")).toEqual([]);});
 it("uses Istanbul day boundaries",()=>{expect(newsDay("2026-09-11T21:01:00Z")).toBe("2026-09-12");});
 it("keeps provenance and suppresses unlicensed copies and images",()=>{const a=parseFeed(xml(),feeds[0],now)[0];expect(a.provinceCodes).toEqual(["06","34","35"]);expect(a.summary).toBe("");expect(a.imageUrl).toBeNull();expect(a.rights?.imageAllowed).toBe(false);});
 it("rejects foreign URLs, future dates and XML entities",()=>{expect(parseFeed(xml("https://evil.example/haber/a"),feeds[0],now)).toEqual([]);expect(parseFeed(xml(undefined,"Sun, 13 Sep 2026 12:00:00 GMT"),feeds[0],now)).toEqual([]);expect(()=>parseFeed('<!DOCTYPE rss [<!ENTITY a "bad">]><rss/>',feeds[0],now)).toThrow();});
 it("builds dated city bulletins without old, hidden or duplicate news",()=>{const a=parseFeed(xml(),feeds[0],now)[0];const body=buildBulletin([a,a,{...a,hidden:true}],"2026-09-12");expect(body).toContain("#İzmir");expect(body.split(a.url)).toHaveLength(2);expect(buildBulletin([a],"2026-09-13")).toBe("");});
});
