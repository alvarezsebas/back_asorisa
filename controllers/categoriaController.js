import { dynamoClient } from '../config/dynamoClient.js';
import { categoriaSchema } from '../models/categoriaModel.js';
import { PutCommand, ScanCommand, GetCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';

const TABLE_CATEGORIAS = 'categorias';
const TABLE_COUNTERS = 'Counters';

// -----------------------------
// Crear categoría
// -----------------------------
export const createCategoria = async (req, res) => {
  try {
    const { error, value } = categoriaSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    // Obtener y actualizar contador de id de forma atómica
    const counterResult = await dynamoClient.send(new UpdateCommand({
      TableName: TABLE_COUNTERS,
      Key: { counterName: 'categoriaId' },
      UpdateExpression: 'SET #v = if_not_exists(#v, :start) + :inc',
      ExpressionAttributeNames: { '#v': 'value' },
      ExpressionAttributeValues: { ':inc': 1, ':start': 0 },
      ReturnValues: 'UPDATED_NEW',
    }));

    const nuevoId = Number(counterResult.Attributes.value);

    const nuevaCategoria = {
      id_categoria: nuevoId,
      ...value,
    };

    await dynamoClient.send(new PutCommand({
      TableName: TABLE_CATEGORIAS,
      Item: nuevaCategoria,
    }));

    res.status(200).json({ message: 'Categoría creada', categoria: nuevaCategoria });
  } catch (error) {
    console.error('Error al crear categoría:', error);
    res.status(500).json({ error: 'Error al crear categoría' });
  }
};

// -----------------------------
// Obtener todas las categorías
// -----------------------------
export const getCategorias = async (req, res) => {
  try {
    const result = await dynamoClient.send(new ScanCommand({ TableName: TABLE_CATEGORIAS }));
    res.status(200).json({ ok: true, categorias: result.Items });
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
};

// -----------------------------
// Obtener categoría por ID
// -----------------------------
export const getCategoriaById = async (req, res) => {
  try {
    const id_categoria = Number(req.params.id);

    const result = await dynamoClient.send(new GetCommand({
      TableName: TABLE_CATEGORIAS,
      Key: { id_categoria },
    }));

    if (!result.Item) return res.status(404).json({ error: 'Categoría no encontrada' });
    res.status(200).json(result.Item);
  } catch (error) {
    console.error('Error al obtener categoría:', error);
    res.status(500).json({ error: 'Error al obtener categoría' });
  }
};

// -----------------------------
// Actualizar categoría
// -----------------------------
export const updateCategoria = async (req, res) => {
  try {
    const id_categoria = Number(req.params.id);
    const { categoria } = req.body;

    if (!categoria) return res.status(400).json({ error: 'La categoría es requerida' });

    await dynamoClient.send(new UpdateCommand({
      TableName: TABLE_CATEGORIAS,
      Key: { id_categoria },
      UpdateExpression: 'SET #n = :n',
      ExpressionAttributeNames: { '#n': 'categoria' },
      ExpressionAttributeValues: { ':n': categoria },
      ReturnValues: 'ALL_NEW',
    }));

    res.status(200).json({ ok: true, mensaje: 'Categoría actualizada' });
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    res.status(500).json({ error: 'Error al actualizar categoría' });
  }
};

// -----------------------------
// Eliminar categoría
// -----------------------------
export const deleteCategoria = async (req, res) => {
  try {
    const id_categoria = Number(req.params.id);

    await dynamoClient.send(new DeleteCommand({
      TableName: TABLE_CATEGORIAS,
      Key: { id_categoria },
    }));

    res.status(200).json({ message: 'Categoría eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    res.status(500).json({ error: 'Error al eliminar categoría' });
  }
};