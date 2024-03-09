<template>
  <q-layout view="lHh LpR lFf">
    <q-header :class="$q.dark.isActive ? 'q-dark' : 'bg-white'" class="shadow_custom q-mx-lg q-mt-md q-py-sm" style="right: 8px; border-radius: 4px">
      <q-toolbar class="no-shadow">
        <q-btn flat dense round icon="menu" aria-label="Menu"
          color="grey" class="custom-border" @click="drawer=!drawer"/>
        <q-toolbar-title class="q-ml-sm">
          <div v-if="!$q.screen.xs" class="row justify-center justify-between text-h6" 
            :class="[!$q.dark.isActive ? 'text-black' : '']">
            <div>
              <span class="text-weight-regular">Bienvenido: </span>
              <span class="text-weight-light">{{ fullName }}</span>
            </div>
            <div>
              <span class="text-weight-regular">Rol: </span>
              <span class="text-weight-light">{{ rol }}</span>
            </div>
          </div>
        </q-toolbar-title>

        <div>
          <q-btn class="q-mr-xs text-grey-6" flat round
            @click="$q.dark.toggle()" 
            :icon="$q.dark.isActive ? 'nights_stay' : 'wb_sunny'"/>
        </div>

        <div class="q-mx-sm">
          <q-btn class="q-mr-md q-py-xs q-px-sm custom-border" flat
            color="grey" icon="notifications" />
          <q-avatar class="cursor-pointer">
            <img src="https://cdn.quasar.dev/img/avatar2.jpg">
            <q-menu>
              <q-list style="min-width: 200px">
                <q-item clickable v-close-popup>
                  <q-item-section>John Doe</q-item-section>
                </q-item>
                <q-separator />
                <q-item clickable v-close-popup>
                  <q-item-section>My Profile</q-item-section>
                </q-item>
                <q-item clickable v-close-popup>
                  <q-item-section>Billing</q-item-section>
                </q-item>
                <q-separator />
                <q-item @click="cerrarSesion" clickable v-close-popup>
                  <q-item-section>Logout</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-avatar>
        </div>

      </q-toolbar>
    </q-header>

    <q-drawer v-model="drawer" show-if-above :width="260" :mini-width="80"
      :mini="!drawer || miniState" @click.capture="drawerClick"
      :class="$q.dark.isActive ? '' : 'drawer_cls'" >

      <div style="height: calc(100% - 80px);padding:10px;">

        <q-toolbar @click="$router.push('/')" class="cursor-pointer" style="margin-top: 15px">
          <q-avatar rounded>
            <q-icon style="color: #696cff;" size="38px" class="text-weight-bolder" name="rocket_launch"/>
          </q-avatar>

          <q-toolbar-title style="color: #566a7f;font-size: 1.40rem;letter-spacing: -.5px;" class="text-weight-medium">
            Admin CRM
          </q-toolbar-title>
        </q-toolbar>

        <q-scroll-area style="height:100%;">
          <q-list padding>

            <q-item class="navigation-item q-mx-sm" active-class="tab-active" to="/" exact clickable v-ripple>
              <q-item-section avatar>
                <q-icon name="home"/>
              </q-item-section>

              <q-item-section>
                Dashboard
              </q-item-section>
            </q-item>

            <template v-for="link in essentialLinks" :key="link.title">
              <EssentialLink v-if="validarPermisos(link.permisoRequerido)" v-bind="link" />
            </template>

            <q-list class="q-ml-sm">
              <q-expansion-item
                expand-separator icon="settings" label="Ajustes">

                <q-expansion-item v-if="validarPermisos('index.usuario')"
                  hide-expand-icon icon="group" class="item-options"
                  active-class="bg-light-blue-9" :to="{ name: 'Ver Usuarios' }"
                  dense-toggle label="Gestión Personal" :header-inset-level="0">
                </q-expansion-item>
                
                <q-expansion-item v-if="validarPermisos('index.rol')"
                  hide-expand-icon icon="fa-solid fa-gears" class="item-options"
                  active-class="bg-light-blue-9" :to="{ name: 'Rol-Permiso' }"
                  dense-toggle label="Roles y Permisos" :header-inset-level="0">
                </q-expansion-item>

                <q-expansion-item v-if="validarPermisos('index.correo')"
                  hide-expand-icon icon="mail" class="item-options"
                  active-class="bg-light-blue-9" 
                    :to="claim.roles[0] == 'SUPER-ADMINISTRADOR' 
                      ? { name: 'emails' } 
                      : { name: 'email.edit', params: { email_id: claim.company.id } }"
                  dense-toggle label="Servidor de Correo" :header-inset-level="0">
                </q-expansion-item>

                <q-expansion-item v-if="validarPermisos('index.empresa')"
                  hide-expand-icon icon="local_convenience_store" class="item-options"
                  active-class="bg-light-blue-9" :to="{ name: 'Ver Empresas' }"
                  dense-toggle label="Empresa" :header-inset-level="0">
                </q-expansion-item>

                <q-expansion-item v-if="validarPermisos('index.sucursal')"
                  hide-expand-icon icon="local_convenience_store" class="item-options"
                  active-class="bg-light-blue-9" :to="{ name: 'Ver Sucursales' }"
                  dense-toggle label="Sucursales" :header-inset-level="0">
                </q-expansion-item>

                <q-expansion-item hide-expand-icon icon="description" class="item-options"
                  active-class="bg-light-blue-9" :to="{ name: 'Config Proforma' }"
                  dense-toggle label="Proforma" :header-inset-level="0">
                </q-expansion-item>

              </q-expansion-item>
            </q-list>

          </q-list>
        </q-scroll-area>

      </div>
      <div class="q-mini-drawer-hide absolute" style="top: 30px; right: -17px">
        <q-btn dense round style="background-color: #696cff;color: white;border: 6px solid #f2f2f7;"
          unelevated icon="chevron_left" @click="miniState = true" />
      </div>
    </q-drawer>

    <q-page-container>
      <q-page class="row no-wrap">
        <div class="col">
          <div class="full-height">
            <q-scroll-area class="col q-pr-sm q-scrollarea--only-vertical full-height" visible>
              <router-view/>
            </q-scroll-area>
          </div>
        </div>
      </q-page>
    </q-page-container>

  </q-layout>
</template>

<script setup>
  import { ref, watch, onMounted } from 'vue';
  import { useQuasar } from 'quasar'
  import { useRouter } from "vue-router";
  import { useAuthUserStore } from "stores/auth-user"
  import JWT from 'jwt-client'
  import EssentialLink from "../components/EssentialLink.vue";
  import useRolPermisos from "src/composables/useRolPermisos.js"; 

  const essentialLinks = [  
    {
      title: 'Proveedores',
      icon: 'fa fa-truck',
      link: '/proveedores',
      permisoRequerido: 'index.proveedores'
    },
    {
      title: 'Clientes',
      icon: 'fa fa-user-tag',
      link: '/customer',
      permisoRequerido: 'index.clientes'
    },
    {
      title: 'Productos y Servicios',
      icon: 'inventory',
      link: '/productos',
      permisoRequerido: 'index.productos'
    },
    {
      title: 'Compras',
      icon: 'fa-solid fa-cart-shopping',
      link: '/compras',
      permisoRequerido: 'index.compras'
    },
    {
      title: 'Ventas',
      icon: 'fa fa-cash-register',
      link: '/ventas',
      permisoRequerido: 'index.ventas'
    },
  ]

  const $q = useQuasar();
  const router = useRouter();
  const authUserStore = useAuthUserStore();
  const { validarPermisos } = useRolPermisos();

  let fullName = '';
  let rol = '';

  const { claim } = JWT.read( authUserStore.token );
  const arrayFullName = claim.fullName.split(' ');

  if ( arrayFullName.length > 3 ) {
    const lastName = arrayFullName.pop();
    
    fullName = `${ arrayFullName.join(' ') } ${ lastName[0] }.`;    
  }else
    fullName = claim.fullName;

  rol = claim.roles[0];
  
  watch(
    () => $q.dark.isActive,
    (newValue, _) => {
      authUserStore.setModeDark( newValue )
    },
    { deep: true }
  )

  onMounted(() => {
    $q.dark.set( authUserStore.modeDark )
  })
  
  const cerrarSesion = () => {
    authUserStore.$reset();
    router.push('/login');
  }

  const miniState = ref(false)
  const drawer = ref(false);

  const drawerClick = (e) => {
    // if in "mini" state and user
    // click on drawer, we switch it to "normal" mode
    if (miniState.value) {
      miniState.value = false

      // notice we have registered an event with capture flag;
      // we need to stop further propagation as this click is
      // intended for switching drawer to "normal" mode only
      e.stopPropagation()
    }
  }
</script>

<style>
body {
  background-color: #f3f3f7;
}
body.body--dark {
  background: #232333
}

.q-dark {
  background: #2b2c40;
}
.tab-active {
  background-color: rgba(105, 108, 255, .16) !important;
  color: #696cff !important;
}

.navigation-item {
  border-radius: 5px;
  min-height: 44px !important;
}

.shadow_custom {
  box-shadow: 0 2px 6px 0 rgb(67 89 113 / 12%) !important;
}

.q-scrollarea--only-vertical .q-scrollarea__content {
  width: 100%
}
.drawer_cls {
  background-color: #fff!important;
  color: #697a8d !important;
}
.item-options{
  margin-left: 6px;
}
</style>
