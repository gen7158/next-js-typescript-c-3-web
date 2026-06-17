import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

const config = [
  {
    ignores: [".next/**", "node_modules/**", "work/**", "next-env.d.ts", "ts-pass-lab/.next/**", "ts-pass-lab/out/**", "ts-pass-lab/build/**"],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default config;
