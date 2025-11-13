import { dynamoClient } from '../config/dynamoClient.js';
import bcrypt from 'bcrypt';
import { usuarioSchema } from '../models/usersModel.js';
import { PutCommand, ScanCommand, GetCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();


const TABLE_USUARIOS = 'usuarios';
const TABLE_COUNTERS = 'Counters';

const JWT_SECRET = process.env.JWT_SECRET
// -----------------------------
// Obtener usuario por ID
// -----------------------------
export const getUsuarioById = async (req, res) => {
  try {
    const id_usuario = Number(req.params.id);
    const result = await dynamoClient.send(new GetCommand({
      TableName: TABLE_USUARIOS,
      Key: { id_usuario },
    }));

    if (!result.Item) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.status(200).json(result.Item);
  } catch (err) {
    console.error('Error al obtener usuario:', err);
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
};

// -----------------------------
// Actualizar usuario
// -----------------------------
export const updateUsuario = async (req, res) => {
  try {
    const id_usuario = Number(req.params.id);
    const { correo, nombre, password, role } = req.body;

    const existing = await dynamoClient.send(new GetCommand({
      TableName: TABLE_USUARIOS,
      Key: { id_usuario },
    }));

    if (!existing.Item) return res.status(404).json({ error: 'Usuario no encontrado' });

    const updateExpr = [];
    const exprAttrValues = {};
    const exprAttrNames = {};

    if (correo) {
      updateExpr.push('#c = :c');
      exprAttrValues[':c'] = correo;
      exprAttrNames['#c'] = 'correo';
    }
    if (nombre) {
      updateExpr.push('#n = :n');
      exprAttrValues[':n'] = nombre;
      exprAttrNames['#n'] = 'nombre';
    }
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      updateExpr.push('#p = :p');
      exprAttrValues[':p'] = hashed;
      exprAttrNames['#p'] = 'password';
    }
    if (role) {
      updateExpr.push('#r = :r');
      exprAttrValues[':r'] = role;
      exprAttrNames['#r'] = 'role';
    }

    if (updateExpr.length === 0) {
      return res.status(400).json({ error: 'Nada para actualizar' });
    }

    const result = await dynamoClient.send(new UpdateCommand({
      TableName: TABLE_USUARIOS,
      Key: { id_usuario },
      UpdateExpression: 'SET ' + updateExpr.join(', '),
      ExpressionAttributeNames: exprAttrNames,
      ExpressionAttributeValues: exprAttrValues,
      ReturnValues: 'ALL_NEW',
    }));

    res.status(200).json({ message: 'Usuario actualizado', usuario: result.Attributes });
  } catch (err) {
    console.error('Error al actualizar usuario:', err);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
};

// -----------------------------
// Eliminar usuario
// -----------------------------
export const deleteUsuario = async (req, res) => {
  try {
    const id_usuario = Number(req.params.id);
    await dynamoClient.send(new DeleteCommand({
      TableName: TABLE_USUARIOS,
      Key: { id_usuario },
    }));

    res.status(200).json({ message: 'Usuario eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar usuario:', err);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
};

// -----------------------------
// Obtener todos los usuarios
// -----------------------------
export const getUsuarios = async (req, res) => {
  try {
    const result = await dynamoClient.send(new ScanCommand({ TableName: TABLE_USUARIOS }));
    res.status(200).json(result.Items);
  } catch (err) {
    console.error('Error al obtener usuarios:', err);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

// -----------------------------
// Crear usuario
// -----------------------------
export const createUsuario = async (req, res) => {
  try {
    const body = req.body;
    const { error, value } = usuarioSchema.validate(body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { correo, nombre, password, role } = value;

    // Validar si ya existe el correo
    const existing = await dynamoClient.send(new ScanCommand({
      TableName: TABLE_USUARIOS,
      FilterExpression: '#c = :correo',
      ExpressionAttributeNames: { '#c': 'correo' },
      ExpressionAttributeValues: { ':correo': correo },
    }));

    if (existing.Items.length > 0) {
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }

    const counterResult = await dynamoClient.send(new UpdateCommand({
      TableName: TABLE_COUNTERS,
      Key: { counterName: 'usuarioId' },
      UpdateExpression: 'SET #v = if_not_exists(#v, :start) + :inc',
      ExpressionAttributeNames: { '#v': 'value' },
      ExpressionAttributeValues: { ':inc': 1, ':start': 0 },
      ReturnValues: 'UPDATED_NEW',
    }));

    const nuevoId = Number(counterResult.Attributes.value);
    const hashedPassword = await bcrypt.hash(password, 10);

    const nuevoUsuario = {
      id_usuario: nuevoId,
      correo,
      nombre,
      password: hashedPassword,
      role,
      fechaCreacion: new Date().toISOString(),
    };

    await dynamoClient.send(new PutCommand({
      TableName: TABLE_USUARIOS,
      Item: nuevoUsuario,
    }));

    res.status(200).json({ message: 'Usuario creado correctamente', usuario: nuevoUsuario });
  } catch (err) {
    console.error('Error al crear usuario:', err);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
};

// -----------------------------
// LOGIN USUARIO
// -----------------------------
export const loginUsuario = async (req, res) => {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
    }

    // Buscar usuario por correo
    const result = await dynamoClient.send(new ScanCommand({
      TableName: TABLE_USUARIOS,
      FilterExpression: '#c = :correo',
      ExpressionAttributeNames: { '#c': 'correo' },
      ExpressionAttributeValues: { ':correo': correo },
    }));

    if (!result.Items || result.Items.length === 0) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }

    const usuario = result.Items[0];

    // Validar contraseña
    const validPassword = await bcrypt.compare(password, usuario.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }

    // Generar token JWT
    const token = jwt.sign(
      {
        id_usuario: usuario.id_usuario,
        correo: usuario.correo,
        role: usuario.role,
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    // Devolver respuesta
    res.status(200).json({
      message: 'Login exitoso',
      token,
      user: {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        correo: usuario.correo,
        role: usuario.role,
      },
    });
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ error: 'Error interno al iniciar sesión' });
  }
};
