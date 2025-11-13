import Joi from 'joi';

export const CarritoModel = {
  id_carrito: 0,
  comprador: '', // nombre del comprador
  productos: [], // array de { nombre, unidades, precioUnitario }
  total: 0,
  fecha: '',
};

export const carritoSchema = Joi.object({
  comprador: Joi.string().required(),
  productos: Joi.array().items(
    Joi.object({
      nombre: Joi.string().required(),
      unidades: Joi.number().min(1).required(),
      precioUnitario: Joi.number().min(0).required(),
    })
  ).min(1).required(),
  total: Joi.number().min(0).required(),
});
