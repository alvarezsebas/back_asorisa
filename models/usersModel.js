import Joi from 'joi';

export const UsuarioModel = {
  id_usuario: 0,          // number
  correo: '',     // string
  nombre: '',     // string
  password: '',   // hashed string
  role: '',       // string
  fechaCreacion: '', // ISO string
};

export const usuarioSchema = Joi.object({
  correo: Joi.string().email().required(),
  nombre: Joi.string().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().required(),
});
