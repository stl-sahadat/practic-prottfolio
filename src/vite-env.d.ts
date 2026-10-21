/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONTACT_RECEIVER_EMAIL?: string;
  readonly VITE_CONTACT_API_ENDPOINT?: string;
  readonly VITE_WEB3FORMS_ACCESS_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
