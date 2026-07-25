import { isEditorialPublicationReady } from "@/lib/editorial-engine";
import { isContentAuthorityReady } from "@/lib/content-authority";
import type { ContentDocument } from "@/lib/content-model";

/**
 * A page can be reachable while its record is under editorial review, but it
 * must not be presented to search engines as a finished reference until the
 * source, ownership, review, and update requirements are complete.
 */
export function isIndexableReference(document: ContentDocument) {
  if (document.status !== "published" || !document.editorial) return false;
  return isEditorialPublicationReady(document.editorial) && isContentAuthorityReady(document);
}

/**
 * Drafts are available to local editorial development, but production users
 * only receive records that passed the complete publication gate.
 */
export function isEditorialPreviewEnabled() {
  return process.env.NODE_ENV !== "production" && process.env.URETIR_EDITORIAL_PREVIEW !== "false";
}

export function isVisibleReference(document: ContentDocument) {
  return isIndexableReference(document) || isEditorialPreviewEnabled();
}

export const editorialReviewMessage = "Bu kayıt editoryal inceleme aşamasında. Resmî veya birincil kaynaklar, sorumlu inceleyen ve güncelleme planı tamamlanmadan arama için yayınlanmaz.";
