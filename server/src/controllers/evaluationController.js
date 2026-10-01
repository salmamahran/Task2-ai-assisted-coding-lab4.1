import { Evaluation } from '../models/Evaluation.js';
import Joi from 'joi';
const createSchema = Joi.object({
  sessionCode: Joi.string().trim().required(),
  score: Joi.number().min(1).max(5).required(),
  comment: Joi.string().allow('').optional(),
  evaluatedBy: Joi.string().hex().length(24).optional()
});

// GET /api/evaluations
export async function getAllEvaluations(req, res, next) {
  try {
    const evaluations = await Evaluation.find().sort({ createdAt: -1 });
    res.status(200).json({ evaluations });
  } catch (err) { next(err); }
}
// GET /api/evaluations/:id
export async function getEvaluation(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid evaluation id' });
    }
    const evaluation = await Evaluation.findById(req.params.id);
    if (!evaluation) return res.status(404).json({ message: 'Evaluation not found' });
    res.status(200).json({ evaluation });
  } catch (err) { next(err); }
}

// POST /api/evaluations
export async function createEvaluation(req, res, next) {
  try {
    const { value, error } = createSchema.validate(req.body, { stripUnknown: true });
    if (error) return res.status(400).json({ message: error.message });

    const evaluation = await Evaluation.create(value);
    res.status(201).json({ evaluation });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'This user already evaluated this session' });
    }
    next(err);
  }
}

// GET /api/evaluations/summary?sessionCode=SS101
export async function getEvaluationSummary(req, res, next) {
  try {
    const { sessionCode } = req.query;
    if (typeof sessionCode !== 'string' || !sessionCode.trim()) {
      return res.status(400).json({ message: 'sessionCode is required' });
    }

    const [result] = await Evaluation.aggregate([
      { $match: { sessionCode } },
      { $group: { _id: null, averageScore: { $avg: '$score' }, evaluationCount: { $sum: 1 } } }
    ]);

    res.status(200).json({
      sessionCode,
      averageScore: result ? result.averageScore : 0,
      evaluationCount: result ? result.evaluationCount : 0
    });
  } catch (err) { next(err); }
}
