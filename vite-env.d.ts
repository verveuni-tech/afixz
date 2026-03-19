/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PHONE_AUTH_PROVIDER?: "firebase" | "external" | "disabled";
  readonly VITE_SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
