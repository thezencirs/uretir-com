import type { Metadata } from "next";
import { UretirIdShell } from "@/components/uretir-id-shell";

export const metadata: Metadata = {
  title: "Uretir ID",
  description: "Uretir ekosisteminin profesyonel kimliği.",
};

export default function UretirIdPage() {
  return <UretirIdShell />;
}

