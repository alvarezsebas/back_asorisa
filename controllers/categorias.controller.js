import { dynamoClient } from '../config/dynamoClient.js';
import { v4 as uuidv4 } from 'uuid';

const TABLE_NAME = process.env.TABLE_CATEGORIAS;

export const getCategorias = async (req, res) => {
  try {
    const data = await dynamoClient.scan({ TableName: TABLE_NAME }).promise();
    res.json(data.Items);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
};

export const createCategoria = async (req, res) => {
  try {
    const { nombre } = req.body;
    if (!nombre) return res.status(400).json({ error: 'El nombre es requerido' });

    const nuevaCategoria = { id: uuidv4(), nombre };

    await dynamoClient.put({ TableName: TABLE_NAME, Item: nuevaCategoria }).promise();
    res.json({ message: 'Categoría creada', categoria: nuevaCategoria });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear categoría' });
  }
};
