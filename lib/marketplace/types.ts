export type MarketplaceKind="property"|"vehicle";
export type TrustBadge={label:string;tone:"good"|"warn"|"neutral";detail:string};
export type MarketplaceReference={label:string;value:number|null;sample?:number;detail?:string};
export type MarketplaceListing={
 id:string;kind:MarketplaceKind;title:string;description:string;price:number;currency:string;
 city:string;district:string;neighborhood:string;latitude:number;longitude:number;locationPrecision:"exact"|"approximate";
 sellerRole:"owner"|"dealer"|"agent";sourceType:"member"|"source";sourceName:string;sourceUrl:string|null;
 sellerName:string|null;sellerHandle:string|null;images:string[];attributes:Record<string,string|number|null>;
 updatedAt:string;publishedAt:string|null;expiresAt:string|null;trustBadges:TrustBadge[];
 priceReference:number|null;priceAnomalyPct:number|null;usedAverage?:number|null;usedMedian?:number|null;usedSample?:number;newPrice?:number|null;
 reportCount:number;detailUrl:string|null;
};
export type MarketplaceDashboard={
 kind:MarketplaceKind;checkedAt:string;listings:MarketplaceListing[];
 references:MarketplaceReference[];stats:{label:string;value:number}[];
};
