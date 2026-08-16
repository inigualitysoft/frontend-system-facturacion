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
        path: 'proformas/:tipo?/:fecha?',
        name: 'Ver-Proformas',
        component: () => import('pages/dashboard/proformas/IndexPage.vue'),
        meta: { requiresAuth: false }
      },
      {
        path: 'ventas/add/:venta_id?',
        name: 'Agregar Venta',
        component: () => import('pages/dashboard/ventas/AddVenta.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'proforma/add/:proforma_id?',
        name: 'agregar.proforma',
        component: () => import('pages/dashboard/proformas/AddVenta.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'roles-permisos',
        name: 'Rol-Permiso',
        component: () => import('pages/dashboard/roles-permisos/IndexPage.vue'),
        meta: { requiresAuth: true}
      },
      {
        path: 'clientes',
        name: 'cliente.index',
        component: () => import('pages/dashboard/clientes/IndexPage.vue'),
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
        path: 'usuario/edit/:term/profile',
        name: 'editar.usuario.profile',
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
        path: 'proforma',
        name: 'Config Proforma',
        component: () => import('pages/dashboard/proforma/IndexPage.vue'),
        meta: { requiresAuth: true}
      },
      {
        path: 'retenciones',
        name: 'index.retencion',
        component: () => import('pages/dashboard/retenciones/IndexPage.vue'),
        meta: { requiresAuth: true}
      },
      {
        path: 'retencion/add',
        name: 'add.retencion',
        component: () => import('pages/dashboard/retenciones/AddRetencion.vue'),
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
