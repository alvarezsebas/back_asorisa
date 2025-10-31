import express from 'express';
import usuariosRoutes from './routes/users.routes.js';
import productosRoutes from './routes/productos.routes.js';
import categoriasRoutes from './routes/categorias.routes.js';
import carritoRoutes from './routes/carrito.routes.js';

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'API Backend AWS funcionando 🚀' });
});

app.use('/api/usuarios', usuariosRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/carrito', carritoRoutes);

export default app;
