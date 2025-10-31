import express from 'express';
import { getUsuarios, createUsuario } from '../controllers/usuarios.controller.js';
const router = express.Router();

router.get('/', getUsuarios);
router.post('/', createUsuario);

export default router;
