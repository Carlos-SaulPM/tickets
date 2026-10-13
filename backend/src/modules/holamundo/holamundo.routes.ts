import { Router } from 'express';
import { obtenerHolaMundo } from './holamundo.controller';

export const rutasHolamundo = Router();

rutasHolamundo.get('/', obtenerHolaMundo);
