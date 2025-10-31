import { dynamoClient } from '../config/dynamoClient.js';
import { v4 as uuidv4 } from 'uuid';

const TABLE_NAME = process.env.TABLE_CARRITO;

export const getCarrito = async (req, res) => {
  try {
    const data = await dynamoClient.scan({ TableName: TABLE_NAME }).promise();
    res.json(data.Items);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener carritos' });
  }
};

export const createCarrito = async (req, res) => {
  try {
    const { usuarioCorreo, productos } = req.body;
    if (!usuarioCorreo || !Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ error: 'Datos del carrito inválidos' });
    }

    // Calcular total
    const total = productos.reduce((acc, p) => acc + p.unidades * p.precioUnitario, 0);

    const nuevoCarrito = {
      id: uuidv4(),
      usuarioCorreo,
      productos,
      total,
      fecha: new Date().toISOString(),
    };

    await dynamoClient.put({ TableName: TABLE_NAME, Item: nuevoCarrito }).promise();
    res.json({ message: 'Carrito creado correctamente', carrito: nuevoCarrito });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear carrito' });
  }
};
