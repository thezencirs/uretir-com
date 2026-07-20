import { FlatCompat } from "@eslint/eslintrc";
import path from "node:path";
import { fileURLToPath } from "node:url";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const compat = new FlatCompat({ baseDirectory: dirname });
const eslintConfig = [{ ignores: ["**/.next/**", "**/node_modules/**"] }, ...compat.extends("next/core-web-vitals", "next/typescript"), { rules: { "@typescript-eslint/triple-slash-reference": "off" } }];

export default eslintConfig;
