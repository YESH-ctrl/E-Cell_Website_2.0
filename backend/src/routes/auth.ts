import { Router, Response } from 'express';
import { supabase } from '../config/supabase';
import {
  verifyToken,
  AuthRequest,
} from '../middleware/verifyToken';

const router = Router();

router.get(
  '/me',
  verifyToken,
  async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select(
          'id, email, display_name, role, created_at'
        )
        .eq('id', req.user!.uid)
        .maybeSingle();

      if (error) {
        console.error(
          'Profile lookup error:',
          error.message
        );

        res.status(500).json({
          error: 'Failed to fetch user profile',
        });
        return;
      }

      if (!profile) {
        res.status(404).json({
          error: 'User profile not found',
        });
        return;
      }

      res.json({
        uid: profile.id,
        email: profile.email,
        displayName: profile.display_name,
        role: profile.role,
        createdAt: profile.created_at,
      });
    } catch (error) {
      console.error('Auth route error:', error);

      res.status(500).json({
        error: 'Internal server error',
      });
    }
  }
);

export default router;