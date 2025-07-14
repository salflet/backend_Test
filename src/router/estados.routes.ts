import { Router } from 'express';
import {
  getEstados,
  getEstadoById,
  createEstado,
  updateEstado,
  deleteEstado
} from '../controller/estados.controller';

const router = Router();

router.get('/', getEstados);
router.get('/:id', getEstadoById);
router.post('/', createEstado);
router.put('/:id', updateEstado);
router.delete('/:id', deleteEstado);

export default router;
