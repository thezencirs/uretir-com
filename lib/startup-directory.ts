export type StartupEntry={id:string;name:string;cityCode:string;description:string;website:string;product:string;reviewedAt:string;publicFinancials?:{marketCapTRY:number;asOf:string;sourceUrl:string;risks:string[]}};
/** Only add entries after the company, city, product and source have been verified. */
export const startupEntries:StartupEntry[]=[];
