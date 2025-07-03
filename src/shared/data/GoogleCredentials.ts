export interface GoogleCredentials {
  userId: string;

  sub: string;
  accessToken: string;
  refreshToken: string;
  expiry: Date;

  updated: Date;
}
