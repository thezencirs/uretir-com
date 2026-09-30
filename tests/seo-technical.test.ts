import {describe,expect,it} from "vitest";
import robots from "@/app/robots";
import {companies} from "@/lib/companies";
import {companyOrganizationSchema} from "@/lib/company-schemas";
import {SITE_URL,absoluteUrl} from "@/lib/seo";

describe("technical SEO invariants",()=>{
  it("uses the production www host for canonical absolute URLs",()=>{
    expect(SITE_URL).toBe("https://www.uretir.com");
    expect(absoluteUrl("/sitemap.xml")).toBe("https://www.uretir.com/sitemap.xml");
  });
  it("lets crawlers reach noindex HTML pages while blocking APIs",()=>{
    const value=robots();
    expect(value.host).toBe("https://www.uretir.com");
    expect(value.sitemap).toBe("https://www.uretir.com/sitemap.xml");
    const rules=Array.isArray(value.rules)?value.rules:[value.rules];
    expect(rules[0]?.disallow).toEqual(["/api/"]);
  });
  it("publishes employee counts as a numeric minimum in Organization data",()=>{
    const schema=companyOrganizationSchema(companies[0]);
    expect(schema.numberOfEmployees).toEqual({"@type":"QuantitativeValue",minValue:5000});
  });
});
