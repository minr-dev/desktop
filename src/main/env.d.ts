declare namespace NodeJS {
  export interface ProcessEnv {
    NODE_ENV: 'development' | 'staging' | 'production';
  }
}

declare const DEFAULT_MINR_SERVER_URL: string;
