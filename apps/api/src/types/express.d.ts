import 'express';

declare global {
  namespace Express {
    interface User {
      id: string;
      email?: string;
      spotifyId?: string;
      displayName?: string;
      accessToken?: string;
      refreshToken?: string;
      imageUrl?: string;
    }
    interface Request {
      user?: User;
      isAuthenticated(): boolean;
    }
  }
}
