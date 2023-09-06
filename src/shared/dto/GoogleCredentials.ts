export interface GoogleCredentials {
  userId: string;

  sub: string;
  accessToken: string;
  expiry: string;

  updated: Date;
}
