export type ContentKind="startup"|"post"|"comment";
export type ContentPayload={name?:string;cityCode?:string;product?:string;website?:string;description?:string;stage?:string;title?:string;body?:string;topic?:string};
export type MemberContent={id:string;user_id:string;kind:ContentKind;parent_id:string|null;payload:ContentPayload;status:"draft"|"pending"|"published"|"rejected";version:number;review_note:string;created_at:string;published_at:string|null;handle?:string;display_name?:string;replies?:number};
export type Member={id:string;handle:string;display_name:string};
