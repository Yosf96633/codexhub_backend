
import { JwtPayload } from "jsonwebtoken";

export interface MyJwtPayload extends JwtPayload {
  id: string;
  username: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: MyJwtPayload
    }
  }
}
export {};