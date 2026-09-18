import { Router, type Request, type Response } from 'express';
import { supabase } from '../config/supabase';

const router = Router();

router.post(
  '/',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const name = String(req.body.name ?? '').trim();
      const email = String(req.body.email ?? '').trim().toLowerCase();
      const subject = String(req.body.subject ?? '').trim();
      const message = String(req.body.message ?? '').trim();

      if (!name || !email || !subject || !message) {
        res.status(400).json({
          error: 'All fields are required',
        });
        return;
      }

      const { data, error } = await supabase
        .from('inquiries')
        .insert({
          name,
          email,
          subject,
          message,
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase inquiry error:', error.message);
        res.status(500).json({
          error: 'Failed to save inquiry',
        });
        return;
      }

      res.status(201).json({
        message: 'Inquiry submitted successfully',
        data,
      });
    } catch (error) {
      console.error('Inquiry route error:', error);

      res.status(500).json({
        error: 'Internal server error',
      });
    }
  }
);

export default router;