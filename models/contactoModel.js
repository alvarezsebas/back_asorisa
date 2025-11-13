// models/contactoModel.js
import Joi from 'joi';

export const ContactoModel = {
  id_mensaje: 0,
  nombre: '',
  email: '',
  asunto: '',
  mensaje: '',
  fecha: '', 
};

// Schema de validación
export const contactoSchema = Joi.object({
  nombre: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  asunto: Joi.string().required(),
  mensaje: Joi.string().min(5).required(),
});
