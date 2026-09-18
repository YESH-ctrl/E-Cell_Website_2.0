import {
  type Request,
  type Response,
  type NextFunction,
} from 'express';
import { supabase } from '../config/supabase';

export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email: string | undefined;
    name: string | undefined;
    role?: string;
  };
}

export async function verifyToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Unauthorised - no token provided',
    });
    return;
  }

  const accessToken = authHeader.slice(7).trim();

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      res.status(401).json({
        error: 'Unauthorised - invalid or expired token',
      });
      return;
    }

    req.user = {
      uid: user.id,
      email: user.email,
      name:
        user.user_metadata?.display_name ??
        user.user_metadata?.full_name,
    };

    next();
  } catch (error) {
    console.error('Token verification error:', error);

    res.status(401).json({
      error: 'Unauthorised - token verification failed',
    });
  }
}