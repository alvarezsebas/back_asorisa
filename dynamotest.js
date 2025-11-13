import { dynamoClient } from './config/dynamoClient.js';

async function test() {
  try {
    const result = await dynamoClient.scan({ TableName: 'usuarios' }).promise();
    console.log('Usuarios en DB:', result.Items);
  } catch (err) {
    console.error('Error DynamoDB:', err);
  }
}

test();
