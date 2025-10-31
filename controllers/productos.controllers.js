import { dynamoClient } from '../config/dynamoClient.js';
import { v4 as uuidv4 } from 'uuid';

const TABLE_NAME = process.env.TABLE_PRODUCTOS;

export const getProductos = async (req, res) => {
  try {
    const data = await dynamoClient.scan({ TableName: TABLE_NAME }).promise();
    res.json(data.Items);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

export const createProducto = async (req, res) => {
  try {
    const { nombre, descripcion, valor, categoriaId } = req.body;

    if (!nombre || !valor || !categoriaId) {
      return res.status(400).json({ error: 'Campos requeridos: nombre, valor, categoriaId' });
    }

    const nuevoProducto = {
      id: uuidv4(),
      nombre,
      descripcion,
      valor,
      categoriaId,
    };

    await dynamoClient.put({ TableName: TABLE_NAME, Item: nuevoProducto }).promise();
    res.json({ message: 'Producto creado', producto: nuevoProducto });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear producto' });
  }
};
