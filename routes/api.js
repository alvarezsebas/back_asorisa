import express from 'express';
import { createCarrito, getCarritoById, deleteCarrito, getAllCarritos } from '../controllers/carritoController.js';
import { createCategoria, getCategorias, getCategoriaById, updateCategoria, deleteCategoria } from '../controllers/categoriaController.js';
import { createProducto, getProductos, getProductoById, updateProducto, deleteProducto,upload } from '../controllers/productoController.js';
import { createUsuario, getUsuarios, getUsuarioById, updateUsuario, deleteUsuario, loginUsuario } from '../controllers/usuarioController.js';
import { getPresignedUrl } from '../controllers/s3Controller.js';
import { createContacto, getContactos } from '../controllers/contactoController.js';

const router = express.Router();

// Categorías
router.post('/categorias', createCategoria);
router.get('/categorias', getCategorias);
router.get('/categorias/:id', getCategoriaById);
router.put('/categorias/:id', updateCategoria);
router.delete('/categorias/:id', deleteCategoria);

// Carrito
router.post('/carrito', createCarrito);
router.get('/carrito', getAllCarritos);
router.get('/carrito/:id', getCarritoById);
router.delete('/carrito/:id', deleteCarrito);

// Productos
router.post('/productos', upload.single('imagen'), createProducto);
router.get('/productos', getProductos);
router.get('/productos/:id', getProductoById);
router.put('/productos/:id', updateProducto);
router.delete('/productos/:id', deleteProducto);

// Usuarios
router.post('/usuarios', createUsuario);
router.get('/usuarios', getUsuarios);
router.get('/usuarios/:id', getUsuarioById);
router.put('/usuarios/:id', updateUsuario);
router.delete('/usuarios/:id', deleteUsuario);

//login
router.post('/login', loginUsuario); 

//s3
router.get('/s3/presigned-url', getPresignedUrl);

//s3
router.post('/contacto', createContacto);
router.get('/contacto', getContactos);

// **ESM export**
export default router;
