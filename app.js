import express from 'express';
import usuariosRoutes from './routes/users.routes.js';
import productosRoutes from './routes/producto.routes.js';
import categoriasRoutes from './routes/categoria.routes.js';
import carritoRoutes from './routes/carrito.routes.js';
import loginRoutes from './routes/login.routes.js';

const app = express();

// ⚠️ Solo parsea JSON en rutas que lo necesitan.
// Las rutas con "multipart/form-data" (como productos con imagen)
// serán manejadas por Multer dentro de sus controladores.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'API Backend AWS funcionando 🚀' });
});

// Rutas principales
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/carrito', carritoRoutes);
app.use('/api/login', loginRoutes);

export default app;
