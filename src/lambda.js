import express from 'express';
import bodyParser from 'body-parser';
import serverlessExpress from '@vendia/serverless-express';
import apiRoutes from '../routes/api.js';

const app = express();

// Middleware de parseo manual por seguridad
app.use((req, res, next) => {
  if (req.body && Buffer.isBuffer(req.body)) {
    try {
      req.body = JSON.parse(req.body.toString('utf-8'));
    } catch (err) {
      return res.status(400).json({ error: 'JSON inválido' });
    }
  }
  next();
});

app.use(bodyParser.json());

// ✅ CORS Middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // o tu dominio de CloudFront para más seguridad
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Rutas
app.use('/api', apiRoutes);

// ✅ Exportar handler correctamente
export const handler = serverlessExpress({ app });

