import { dynamoClient } from '../config/dynamoClient.js';
import { carritoSchema } from '../models/carritoModel.js';
import {
  UpdateCommand,
  GetCommand,
  PutCommand,
  DeleteCommand,
  ScanCommand
} from "@aws-sdk/lib-dynamodb";

const TABLE_CARRITOS = 'carrito';
const TABLE_COUNTERS = 'Counters';
const TABLE_PRODUCTOS = 'productos';

// Crear carrito
export const createCarrito = async (req, res) => {
  console.log(req.body);

  try {
    const { error, value } = carritoSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // 1️⃣ Generar nuevo ID incremental
    const counterResult = await dynamoClient.send(
      new UpdateCommand({
        TableName: TABLE_COUNTERS,
        Key: { counterName: 'carritoId' },
        UpdateExpression: 'SET #v = if_not_exists(#v, :start) + :inc',
        ExpressionAttributeNames: { '#v': 'value' },
        ExpressionAttributeValues: { ':inc': 1, ':start': 0 },
        ReturnValues: 'UPDATED_NEW',
      })
    );

    const nuevoId = counterResult.Attributes.value;


    // 3️⃣ Crear objeto del carrito
    const nuevoCarrito = {
      id_carrito: nuevoId,
      ...value,
      fecha: new Date().toISOString(),
    };

    // 4️⃣ Guardar carrito
    await dynamoClient.send(
      new PutCommand({
        TableName: TABLE_CARRITOS,
        Item: nuevoCarrito,
      })
    );

    // 5️⃣ Actualizar stock de productos vendidos (por nombre)
    for (const p of value.productos) {
      const nombreProducto = p.nombre;
      const unidadesVendidas = p.unidades;

      // Buscar producto por nombre
      const productoResult = await dynamoClient.send(
        new ScanCommand({
          TableName: TABLE_PRODUCTOS,
          FilterExpression: 'nombre = :nombreProducto',
          ExpressionAttributeValues: { ':nombreProducto': nombreProducto },
        })
      );

      const productoActual = productoResult.Items?.[0];

      if (productoActual) {
        const nuevoStock = Math.max(0, productoActual.stock - unidadesVendidas);

        await dynamoClient.send(
          new UpdateCommand({
            TableName: TABLE_PRODUCTOS,
            Key: { id_producto: productoActual.id_producto },
            UpdateExpression: 'SET stock = :nuevoStock',
            ExpressionAttributeValues: { ':nuevoStock': nuevoStock },
          })
        );
      }
    }

    res.json({
      message: '✅ Carrito creado y stock actualizado correctamente',
      carrito: nuevoCarrito,
    });
  } catch (error) {
    console.error('❌ Error al crear carrito:', error);
    res.status(500).json({ error: 'Error interno al crear carrito' });
  }
};


//  Obtener carrito por ID
export const getCarritoById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await dynamoClient.send(
      new GetCommand({
        TableName: TABLE_CARRITOS,
        Key: { id: Number(id) },
      })
    );

    if (!result.Item) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    res.json(result.Item);
  } catch (error) {
    console.error('❌ Error al obtener carrito:', error);
    res.status(500).json({ error: 'Error al obtener carrito' });
  }
};

//  Obtener todos los carritos
export const getAllCarritos = async (req, res) => {
  try {
    const result = await dynamoClient.send(
      new ScanCommand({
        TableName: TABLE_CARRITOS,
      })
    );

    res.json(result.Items || []);
  } catch (error) {
    console.error('❌ Error al obtener todos los carritos:', error);
    res.status(500).json({ error: 'Error al listar carritos' });
  }
};

//  Eliminar carrito
export const deleteCarrito = async (req, res) => {
  try {
    const { id } = req.params;

    await dynamoClient.send(
      new DeleteCommand({
        TableName: TABLE_CARRITOS,
        Key: { id: Number(id) },
      })
    );

    res.json({ message: `🗑️ Carrito ${id} eliminado correctamente` });
  } catch (error) {
    console.error('❌ Error al eliminar carrito:', error);
    res.status(500).json({ error: 'Error al eliminar carrito' });
  }
};
