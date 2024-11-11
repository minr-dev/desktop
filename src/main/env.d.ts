declare namespace NodeJS {
  export interface ProcessEnv {
    NODE_ENV: 'development' | 'staging' | 'production';
  }
}

declare const DEFAULT_MINR_SERVER_URL: string;

declare const GOOGLE_CLIENT_ID: string;
declare const GOOGLE_REDIRECT_URI: string;

declare const GITHUB_CLIENT_ID: string;
