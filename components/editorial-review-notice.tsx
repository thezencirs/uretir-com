import { CircleAlert } from "lucide-react";
import { editorialReviewMessage } from "@/lib/publication";

export function EditorialReviewNotice() {
  return <aside className="my-8 flex items-start gap-3 border border-[#d6c58a] bg-[#fbf7e8] p-4 text-sm leading-6 text-[#5b512d] dark:border-[#685f38] dark:bg-[#2c291d] dark:text-[#ded4a3]}" role="status">
    <CircleAlert size={17} className="mt-1 shrink-0" aria-hidden="true" />
    <div><strong className="block font-semibold">Editoryal inceleme</strong>{editorialReviewMessage}</div>
  </aside>;
}
