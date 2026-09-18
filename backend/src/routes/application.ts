import { Router, type Response } from 'express';
import {
  verifyToken,
  type AuthRequest,
} from '../middleware/verifyToken';
import { supabase } from '../config/supabase';

const router = Router();

const cleanText = (value: unknown): string =>
  String(value ?? '').trim();

router.post(
  '/',
  verifyToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const preferredDomains = Array.isArray(
        req.body.preferredDomains
      )
        ? req.body.preferredDomains
            .map(cleanText)
            .filter(Boolean)
        : [];

      const application = {
        user_id: req.user!.uid,
        full_name: cleanText(req.body.fullName),
        roll_number: cleanText(req.body.rollNumber),
        branch: cleanText(req.body.branch),
        year_of_study: cleanText(req.body.yearOfStudy),
        mobile_number: cleanText(req.body.mobileNumber),
        email_id: cleanText(req.body.emailID).toLowerCase(),
        linkedin_profile: cleanText(req.body.linkedInProfile),
        portfolio_url: cleanText(req.body.portfolioUrl),
        past_club_member: cleanText(req.body.pastClubMember),
        past_club_details: cleanText(req.body.pastClubDetails),
        organized_event: cleanText(req.body.organizedEvent),
        organized_event_details: cleanText(
          req.body.organizedEventDetails
        ),
        best_describes_you: cleanText(
          req.body.bestDescribesYou
        ),
        preferred_domains: preferredDomains,
        team_crisis_answer: cleanText(
          req.body.teamCrisisAnswer
        ),
        opportunity_answer: cleanText(
          req.body.opportunityAnswer
        ),
        leadership_answer: cleanText(
          req.body.leadershipAnswer
        ),
        founders_office_answer: cleanText(
          req.body.foundersOfficeAnswer
        ),
        impact_answer: cleanText(req.body.impactAnswer),
        why_join: cleanText(req.body.whyJoin),
        solve_problem: cleanText(req.body.solveProblem),
        take_initiative: cleanText(req.body.takeInitiative),
        ten_thousand_rupees: cleanText(
          req.body.tenThousandRupees
        ),
        success_meaning: cleanText(req.body.successMeaning),
      };

      const requiredValues = [
        application.full_name,
        application.roll_number,
        application.branch,
        application.year_of_study,
        application.mobile_number,
        application.email_id,
        application.past_club_member,
        application.organized_event,
        application.best_describes_you,
        application.team_crisis_answer,
        application.opportunity_answer,
        application.leadership_answer,
        application.founders_office_answer,
        application.impact_answer,
        application.why_join,
        application.solve_problem,
        application.take_initiative,
        application.ten_thousand_rupees,
        application.success_meaning,
      ];

      if (
        requiredValues.some((value) => !value) ||
        preferredDomains.length === 0
      ) {
        res.status(400).json({
          error: 'All required fields must be filled',
        });
        return;
      }

      const { data, error } = await supabase
        .from('applications')
        .insert(application)
        .select()
        .single();

      if (error) {
        console.error(
          'Supabase application error:',
          error.message
        );

        res.status(500).json({
          error: 'Failed to save application',
        });
        return;
      }

      res.status(201).json({
        message: 'Application submitted successfully',
        data,
      });
    } catch (error) {
      console.error('Application route error:', error);

      res.status(500).json({
        error: 'Internal server error',
      });
    }
  }
);

export default router;