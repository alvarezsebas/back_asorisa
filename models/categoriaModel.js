import Joi from 'joi';

export const CategoriaModel = {
  id_categoria: 0,      // number
  categoria: '', // string
};

export const categoriaSchema = Joi.object({
  categoria: Joi.string().required(),
});
