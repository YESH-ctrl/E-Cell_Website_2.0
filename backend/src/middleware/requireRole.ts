import {
  type Response,
  type NextFunction,
} from 'express';
import { supabase } from '../config/supabase';
import type { AuthRequest } from './verifyToken';

export type UserRole = 'student' | 'ecell_member';

export function requireRole(requiredRole: UserRole) {
  return async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    if (!req.user?.uid) {
      res.status(401).json({
        error: 'Unauthorised - no authenticated user',
      });
      return;
    }

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', req.user.uid)
        .maybeSingle();

      if (error) {
        console.error('Supabase role error:', error.message);

        res.status(500).json({
          error: 'Unable to verify user role',
        });
        return;
      }

      if (!profile) {
        res.status(403).json({
          error: 'Forbidden - user profile not found',
        });
        return;
      }

      const userRole = profile.role as UserRole;

      if (userRole !== requiredRole) {
        res.status(403).json({
          error: `Forbidden - requires role: ${requiredRole}`,
          yourRole: userRole,
        });
        return;
      }

      req.user.role = userRole;
      next();
    } catch (error) {
      console.error('Role verification error:', error);

      res.status(500).json({
        error: 'Internal server error during role check',
      });
    }
  };
}