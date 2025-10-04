import jwt from "jsonwebtoken";

interface TokenPayload {
  userId: string;
  email: string;
}
export const verifyToken = async (
  token: string,
  secret: string
): Promise<TokenPayload> => {
  const decode = (await jwt.verify(token, secret)) as TokenPayload;
  return decode as TokenPayload;
};
