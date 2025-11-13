import { dynamoClient } from '../config/dynamoClient.js';
import { PutCommand, ScanCommand, GetCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import multer from 'multer';
import { Upload } from '@aws-sdk/lib-storage';
import { s3Client, S3_BUCKET } from '../config/s3client.js';

const TABLE_PRODUCTOS = 'productos';
const TABLE_COUNTERS = 'Counters';

// Multer para leer la imagen desde form-data
const storage = multer.memoryStorage();
export const upload = multer({ storage });

// -----------------------------
// Crear producto
// -----------------------------
export const createProducto = async (req, res) => {
  console.log("📦 Body recibido:", req.body);
  
  try {
    const { nombre, descripcion, valor, categoria, stock, imagen } = req.body;

    // Validar campos requeridos
    if (!nombre || !valor || !categoria || !stock || !imagen) {
      return res.status(400).json({ error: 'Campos requeridos: nombre, valor, categoria, stock, imagen' });
    }

    // Obtener nuevo ID de producto
    const counterResult = await dynamoClient.send(new UpdateCommand({
      TableName: TABLE_COUNTERS,
      Key: { counterName: 'productoId' },
      UpdateExpression: 'SET #v = if_not_exists(#v, :start) + :inc',
      ExpressionAttributeNames: { '#v': 'value' },
      ExpressionAttributeValues: { ':inc': 1, ':start': 0 },
      ReturnValues: 'UPDATED_NEW'
    }));

    const nuevoId = Number(counterResult.Attributes.value);

    const nuevoProducto = {
      id_producto: nuevoId,
      nombre,
      descripcion: descripcion || '',
      valor: Number(valor),
      categoria,
      stock: Number(stock),
      imagen
    };

    await dynamoClient.send(new PutCommand({
      TableName: TABLE_PRODUCTOS,
      Item: nuevoProducto
    }));

    res.status(200).json({ message: 'Producto creado', producto: nuevoProducto });

  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ error: 'Error al crear producto' });
  }
};

// -----------------------------
// Obtener todos los productos
// -----------------------------
export const getProductos = async (req, res) => {
  try {
    const result = await dynamoClient.send(new ScanCommand({ TableName: TABLE_PRODUCTOS }));
    res.status(200).json({ ok: true, productos: result.Items });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

// -----------------------------
// Obtener producto por ID
// -----------------------------
export const getProductoById = async (req, res) => {
  try {
    const id_producto = Number(req.params.id);
    const result = await dynamoClient.send(new GetCommand({
      TableName: TABLE_PRODUCTOS,
      Key: { id_producto }
    }));

    if (!result.Item) return res.status(404).json({ error: 'Producto no encontrado' });
    res.status(200).json(result.Item);
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({ error: 'Error al obtener producto' });
  }
};

// -----------------------------
// Actualizar producto
// -----------------------------
export const updateProducto = async (req, res) => {
  try {
    const id_producto = Number(req.params.id);
    const { nombre, descripcion, valor, categoria, stock } = req.body;

    const updateExpression = [];
    const expressionAttributeValues = {};
    const expressionAttributeNames = {};

    if (nombre !== undefined) { updateExpression.push('#n = :n'); expressionAttributeValues[':n'] = nombre; expressionAttributeNames['#n'] = 'nombre'; }
    if (descripcion !== undefined) { updateExpression.push('#d = :d'); expressionAttributeValues[':d'] = descripcion; expressionAttributeNames['#d'] = 'descripcion'; }
    if (valor !== undefined) { updateExpression.push('#v = :v'); expressionAttributeValues[':v'] = Number(valor); expressionAttributeNames['#v'] = 'valor'; }
    if (categoria !== undefined) { updateExpression.push('#c = :c'); expressionAttributeValues[':c'] = categoria; expressionAttributeNames['#c'] = 'categoria'; }
    if (stock !== undefined) { updateExpression.push('#s = :s'); expressionAttributeValues[':s'] = Number(stock); expressionAttributeNames['#s'] = 'stock'; }

    if (updateExpression.length === 0) return res.status(400).json({ error: 'No hay campos para actualizar' });

    await dynamoClient.send(new UpdateCommand({
      TableName: TABLE_PRODUCTOS,
      Key: { id_producto },
      UpdateExpression: 'SET ' + updateExpression.join(', '),
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    }));

    res.status(200).json({ ok: true, mensaje: 'Producto actualizado' });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
};

// -----------------------------
// Eliminar producto
// -----------------------------
export const deleteProducto = async (req, res) => {
  try {
    const id_producto = Number(req.params.id);

    await dynamoClient.send(new DeleteCommand({
      TableName: TABLE_PRODUCTOS,
      Key: { id_producto }
    }));

    res.status(200).json({ ok: true, mensaje: 'Producto eliminado' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
};
