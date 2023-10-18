import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('pages/sesion/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { 
        path: '', 
        name: 'dashboard',
        component: () => import('pages/IndexPage.vue'),
        meta: { requiresAuth: false } 
      },        
      { 
        path: 'proveedores', 
        name: 'Ver Proveedores',
        component: () => import('pages/dashboard/proveedores/IndexPage.vue'),
        meta: { requiresAuth: false } 
      },        
      { 
        path: 'sucursales', 
        name: 'Ver Sucursales',
        component: () => import('pages/dashboard/sucursales/IndexPage.vue'),
        meta: { requiresAuth: false } 
      },        
      { 
        path: 'empresas', 
        name: 'Ver Empresas',
        component: () => import('pages/dashboard/empresas/IndexPage.vue'),
        meta: { requiresAuth: false } 
      },        
      { 
        path: 'compras', 
        name: 'Ver Compras',
        component: () => import('pages/dashboard/compras/IndexPage.vue'),
        meta: { requiresAuth: false } 
      },        
      { 
        path: 'compras/add', 
        name: 'Agregar Compras',
        component: () => import('pages/dashboard/compras/AddCompra.vue'),
        meta: { requiresAuth: false } 
      },        
      { 
        path: 'ventas', 
        name: 'Ver Ventas',
        component: () => import('pages/dashboard/ventas/IndexPage.vue'),
        meta: { requiresAuth: false } 
      },        
      { 
        path: 'ventas/add', 
        name: 'Agregar Venta',
        component: () => import('pages/dashboard/ventas/AddVenta.vue'),
        meta: { requiresAuth: false } 
      },        
      { 
        path: 'clientes', 
        name: 'Ver Clientes',
        component: () => import('pages/dashboard/clientes/IndexPage.vue'),
        meta: { requiresAuth: false } 
      },        
      { 
        path: 'productos', 
        name: 'Ver Productos',
        component: () => import('pages/dashboard/productos/IndexPage.vue'),
        meta: { requiresAuth: false } 
      },        
      { 
        path: 'usuarios', 
        name: 'Ver Usuarios',
        component: () => import('pages/dashboard/usuarios/IndexPage.vue'),
        meta: { requiresAuth: false } 
      },        
      { 
        path: 'usuarios/add', 
        name: 'Agregar Usuario',
        component: () => import('pages/dashboard/usuarios/AddUser.vue'),
        meta: { requiresAuth: false } 
      },
      { 
        path: 'usuarios/edit/:term', 
        name: 'Editar Usuario',
        component: () => import('pages/dashboard/usuarios/EditUser.vue'),
        meta: { requiresAuth: false } 
      },
      {
        path: 'ajustes/general',
        name: 'Ver Ajustes General',
        component: () => import('pages/dashboard/ajustes/GeneralPage.vue'),
        meta: { requiresAuth: false }
      },     
      {
        path: 'ajustes/correo',
        name: 'Configurar Servidor Correo',
        component: () => import('pages/dashboard/ajustes/ConfigServerCorreo.vue'),
        meta: { requiresAuth: false }
      },   
      {
        path: 'ajustes/factura-electronica',
        name: 'Factura-Electronica',
        component: () => import('pages/dashboard/ajustes/facturasElectronica/FormFactura.vue'),
        meta: { requiresAuth: false }
      },   
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
