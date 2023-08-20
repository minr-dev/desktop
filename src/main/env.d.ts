declare namespace NodeJS {
  export interface ProcessEnv {
    NODE_ENV: 'development' | 'staging' | 'production';
    MINR_SERVER_URL: string;
  }
}

interface ImportMetaEnv {
  VITE_MINR_SERVER_URL: string;
}

interface ImportMeta {
  env: ImportMetaEnv;
}
