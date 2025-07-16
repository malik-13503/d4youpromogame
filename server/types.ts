import { Request } from "express";

declare module "express-session" {
  interface SessionData {
    userId?: number;
    username?: string;
  }
}

export interface AuthenticatedRequest extends Request {
  session: import("express-session").Session & Partial<import("express-session").SessionData>;
}