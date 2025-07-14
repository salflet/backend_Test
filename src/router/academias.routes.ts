import { Router } from 'express';
import {
  getAcademias,
  getAcademiaById,
  createAcademia,
  updateAcademia,
  deleteAcademia
} from '../controller/academias.controller';

const router = Router();

router.get('/', getAcademias);
router.get('/:id', getAcademiaById);
router.post('/', createAcademia);
router.put('/:id', updateAcademia);
router.delete('/:id', deleteAcademia);

export default router;