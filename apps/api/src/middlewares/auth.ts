import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/validations";

interface AuthRequest extends Request {
  auth?: { userId: String; email: string };
}

const JWT_SECRET = process.env.JWT_SECRET || "";
export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers["Authorization"] ?? "";
    if (!authHeader) {
      res.status(401).json({ message: "No token found" });
      return;
    }

    const parts = Array.isArray(authHeader) ? authHeader[0] : authHeader;
    const token = parts?.startsWith("Bearer") ? parts.slice(7) : parts;
    if (!token) {
      res.status(400).json({ message: "Invalid token" });
      return;
    }
    const decode = verifyToken(token, JWT_SECRET);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
