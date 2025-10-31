import { dynamoClient } from '../config/dynamoClient.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const TABLE_NAME = process.env.TABLE_USUARIOS;

export const getUsuarios = async (req, res) => {
  try {
    const data = await dynamoClient.scan({ TableName: TABLE_NAME }).promise();
    res.json(data.Items);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

export const createUsuario = async (req, res) => {
  try {
    const { correo, nombre, password, role } = req.body;

    if (!correo || !nombre || !password || !role) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const nuevoUsuario = { correo, nombre, password: hashedPassword, role };

    await dynamoClient.put({
      TableName: TABLE_NAME,
      Item: nuevoUsuario,
    }).promise();

    res.json({ message: 'Usuario creado correctamente', usuario: nuevoUsuario });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear usuario' });
  }
};
