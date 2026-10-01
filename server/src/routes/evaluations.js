import { Router } from 'express';
import {
  getAllEvaluations,
  getEvaluation,
  createEvaluation,
  getEvaluationSummary
} from '../controllers/evaluationController.js';

const router = Router();

router.get('/', getAllEvaluations);
router.post('/', createEvaluation);
// Must be registered before '/:id', otherwise "summary" is treated as an id.
router.get('/summary', getEvaluationSummary);
router.get('/:id', getEvaluation);

export default router;