import { PutCommand, ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoClient } from '../config/dynamoClient.js';

import { contactoSchema } from '../models/contactoModel.js';


const TABLE_CONTACTOS = 'contactos';
const TABLE_COUNTERS = 'Counters';
export const createContacto = async (req, res) => {
  try {
    const { error, value } = contactoSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    //  Generar ID incremental
    const counterResult = await dynamoClient.send(
      new UpdateCommand({ 
        TableName: TABLE_COUNTERS,
        Key: { counterName: 'contactoId' },
        UpdateExpression: 'SET #v = if_not_exists(#v, :start) + :inc',
        ExpressionAttributeNames: { '#v': 'value' },
        ExpressionAttributeValues: { ':inc': 1, ':start': 0 },
        ReturnValues: 'UPDATED_NEW',
      })
    );

    const nuevoId = counterResult.Attributes.value;

    //  Crear objeto de contacto
    const nuevoMensaje = {
      id_mensaje: nuevoId,
      ...value,
      fecha: new Date().toISOString(),
    };

    //  Guardar en DynamoDB
    await dynamoClient.send(
      new PutCommand({
        TableName: TABLE_CONTACTOS,
        Item: nuevoMensaje,
      })
    );

    res.json({ ok: true, message: '✅ Mensaje enviado correctamente', contacto: nuevoMensaje });
  } catch (err) {
    console.error('❌ Error al crear contacto:', err);
    res.status(500).json({ error: 'Error interno al crear contacto' });
  }
};

export const getContactos = async (req, res) => {
  try {
    const result = await dynamoClient.send(
      new ScanCommand({ TableName: TABLE_CONTACTOS })
    );

    res.json({ ok: true, contactos: result.Items || [] });
  } catch (err) {
    console.error('❌ Error al obtener contactos:', err);
    res.status(500).json({ error: 'Error interno al obtener contactos' });
  }
};
