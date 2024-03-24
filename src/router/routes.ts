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
        meta: { requiresAuth: true}
      },
      {
        path: 'proveedores',
        name: 'Ver Proveedores',
        component: () => import('pages/dashboard/proveedores/IndexPage.vue'),
        meta: { requiresAuth: true}
      },
      {
        path: 'sucursales',
        name: 'Ver Sucursales',
        component: () => import('pages/dashboard/sucursales/IndexPage.vue'),
        meta: { requiresAuth: true}
      },
      {
        path: 'sucursales/add',
        name: 'Agregar Sucursal',
        component: () => import('pages/dashboard/sucursales/AddSucursal.vue'),
        meta: { requiresAuth: true}
      },
      {
        path: 'sucursales/edit/:sucursal_id',
        name: 'Editar Sucursal',
        component: () => import('pages/dashboard/sucursales/EditSucursal.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'empresas',
        name: 'Ver Empresas',
        component: () => import('pages/dashboard/empresas/IndexPage.vue'),
        meta: { requiresAuth: true}
      },
      {
        path: 'empresa/add',
        name: 'Agregar Empresa',
        component: () => import('pages/dashboard/empresas/AddEmpresa.vue'),
        meta: { requiresAuth: true}
      },
      {
        path: 'empresa/edit/:empresa_id',
        name: 'Editar Empresa',
        component: () => import('pages/dashboard/empresas/EditEmpresa.vue'),
        meta: { requiresAuth: true}
      },
      {
        path: 'compras/:fecha?',
        name: 'Ver Compras',
        component: () => import('pages/dashboard/compras/IndexPage.vue'),
        meta: { requiresAuth: true}
      },
      {
        path: 'compras/add',
        name: 'Agregar Compras',
        component: () => import('pages/dashboard/compras/AddCompra.vue'),
        meta: { requiresAuth: true}
      },
      {
        path: 'ventas/:tipo?/:fecha?',
        name: 'Ver Ventas',
        component: () => import('pages/dashboard/ventas/IndexPage.vue'),
        meta: { requiresAuth: true}
      },
      {
        path: 'ventas/add/:venta_id?',
        name: 'Agregar Venta',
        component: () => import('pages/dashboard/ventas/AddVenta.vue'),
        meta: { requiresAuth: true}
      },
      {
        path: 'roles-permisos',
        name: 'Rol-Permiso',
        component: () => import('pages/dashboard/roles-permisos/IndexPage.vue'),
        meta: { requiresAuth: true}
      },
      {
        path: 'customer',
        name: 'customer.index',
        component: () => import('pages/dashboard/clientess/IndexPage.vue'),
        meta: { requiresAuth: true}
      },
      {
        path: 'clientes',
        name: 'cliente.index',
        component: () => import('pages/dashboard/clientes/IndexPage.vue'),
        meta: { requiresAuth: true}
      },
      {
        path: 'clientes/add',
        name: 'cliente.add',
        component: () => import('pages/dashboard/clientes/AddCliente.vue'),
        meta: { requiresAuth: true}
      },
      {
        path: 'clientes/edit/:client_id',
        name: 'cliente.edit',
        component: () => import('pages/dashboard/clientes/EditCliente.vue'),
        meta: { requiresAuth: true}
      },
      {
        path: 'productos',
        name: 'Ver Productos',
        component: () => import('pages/dashboard/productos/IndexPage.vue'),
        meta: { requiresAuth: true}
      },
      {
        path: 'usuarios',
        name: 'Ver Usuarios',
        component: () => import('pages/dashboard/usuarios/IndexPage.vue'),
        meta: { requiresAuth: true}
      },
      {
        path: 'usuarios/add',
        name: 'Agregar Usuario',
        component: () => import('pages/dashboard/usuarios/AddUser.vue'),
        meta: { requiresAuth: true}
      },
      {
        path: 'usuarios/edit/:term',
        name: 'Editar Usuario',
        component: () => import('pages/dashboard/usuarios/EditUser.vue'),
        meta: { requiresAuth: true}
      },
      {
        path: 'emails',
        name: 'emails',
        component: () => import('pages/dashboard/emails/IndexPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'email/edit/:email_id',
        name: 'email.edit',
        component: () => import('pages/dashboard/emails/EditEmail.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'red/getIp',
        name: 'getIp',
        component: () => import('pages/dashboard/red/getIp.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'router',
        name: 'index.routers',
        component: () => import('pages/dashboard/Gestion-Red/routers/IndexPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'router/add',
        name: 'router.add',
        component: () => import('pages/dashboard/Gestion-Red/routers/AddRouter.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'router/edit/:router_id',
        name: 'router.edit',
        component: () => import('pages/dashboard/Gestion-Red/routers/EditRouter.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'servicios/internet',
        name: 'internet.index',
        component: () => import('pages/dashboard/Gestion-Red/internet/IndexPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'servicios/internert/add',
        name: 'internet.add',
        component: () => import('pages/dashboard/Gestion-Red/internet/AddPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'servicios/internert/edit/:id',
        name: 'internet.edit',
        component: () => import('pages/dashboard/Gestion-Red/internet/EditPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'cajas-nap',
        name: 'cNap.index',
        component: () => import('pages/dashboard/Gestion-Red/cajas-nap/IndexPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'cajas-nap/add',
        name: 'cNap.add',
        component: () => import('pages/dashboard/Gestion-Red/cajas-nap/AddPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'cajas-nap/edit/:id',
        name: 'cNap.edit',
        component: () => import('pages/dashboard/Gestion-Red/cajas-nap/EditPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'redes-ipv4',
        name: 'redesIpv4.index',
        component: () => import('pages/dashboard/Gestion-Red/redes-ipv4/IndexPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'redes-ipv4/add',
        name: 'redesIpv4.add',
        component: () => import('pages/dashboard/Gestion-Red/redes-ipv4/AddPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'redes-ipv4/edit/:id',
        name: 'redesIpv4.edit',
        component: () => import('pages/dashboard/Gestion-Red/redes-ipv4/EditPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'proforma',
        name: 'Config Proforma',
        component: () => import('pages/dashboard/proforma/IndexPage.vue'),
        meta: { requiresAuth: true}
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
