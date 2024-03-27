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
            :icon="$q.dark.isActive ? 'img:https://img.icons8.com/3d-fluency/94/sun.png ' : 'img:https://img.icons8.com/3d-fluency/94/partly-cloudy-night.png'"/>
        </div>

        <div class="q-mx-sm">
          <q-btn class="q-mr-md q-py-xs q-px-sm custom-border" flat
            color="grey" icon="img:https://img.icons8.com/3d-fluency/94/bell.png" />
            
          <q-avatar class="cursor-pointer">
            <img :src="ruta_perfil_img">
            <q-menu>
              <q-list style="min-width: 200px">
                <q-item clickable v-close-popup>
                  <q-item-section>John Doe</q-item-section>
                </q-item>
                <q-separator />
                <q-item clickable v-close-popup>
                  <q-item-section>Mi Perfil</q-item-section>
                </q-item>
                <q-separator />
                <q-item @click="cerrarSesion" clickable v-close-popup>
                  <q-item-section>Cerrar Sesión</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-avatar>
        </div>

      </q-toolbar>
    </q-header>

    <q-drawer v-model="drawer" show-if-above :width="260" :mini-width="80"
      :mini="!drawer || miniState" @click.capture="drawerClick"
      :class="$q.dark.isActive ? '' : 'drawer_cls'" style="overflow-y: hidden;">

      <div style="height: calc(100% - 80px);padding:10px;">

        <q-toolbar @click="$router.push('/')" class="cursor-pointer justify-center"
          style="margin-top: 7px">
          <q-img
            src="/imgs/inigualitySoft.png"
            spinner-color="white"
            style="height: auto; max-width: 125px"
            fit="contain"
          />
        </q-toolbar>

        <q-scroll-area style="height:100%;">
          <q-list padding class="q-mt-sm">

            <q-item class="navigation-item" active-class="tab-active" to="/" exact clickable v-ripple>
              <q-item-section avatar>

                <q-icon  name="img:https://img.icons8.com/fluency/48/home.png" size="35px" />
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
                expand-separator icon="img:https://img.icons8.com/3d-fluency/94/gear--v1.png" label="Ajustes">

                <q-expansion-item v-if="validarPermisos('index.usuario')"
                  hide-expand-icon icon="img:https://img.icons8.com/3d-fluency/94/conference.png" class="item-options"
                  active-class="tab-active" :to="{ name: 'Ver Usuarios' }"
                  dense-toggle label="Gestión Personal" :header-inset-level="0">
                </q-expansion-item>

                <q-expansion-item v-if="validarPermisos('index.rol')"
                  hide-expand-icon icon="img:https://img.icons8.com/3d-fluency/94/services--v2.png" class="item-options"
                  active-class="tab-active" :to="{ name: 'Rol-Permiso' }"
                  dense-toggle label="Roles y Permisos" :header-inset-level="0">
                </q-expansion-item>

                <q-expansion-item v-if="validarPermisos('index.correo')"
                  hide-expand-icon icon="img:https://img.icons8.com/3d-fluency/94/gmail.png" class="item-options"
                  active-class="tab-active"
                    :to="claim.roles[0] == 'SUPER-ADMINISTRADOR'
                      ? { name: 'emails' }
                      : { name: 'email.edit', params: { email_id: claim.company.id } }"
                  dense-toggle label="Servidor de Correo" :header-inset-level="0">
                </q-expansion-item>

                <q-expansion-item v-if="validarPermisos('index.empresa')"
                  hide-expand-icon icon="img:https://img.icons8.com/3d-fluency/94/client-company.png" class="item-options"
                  active-class="tab-active" :to="{ name: 'Ver Empresas' }"
                  dense-toggle label="Empresa" :header-inset-level="0">
                </q-expansion-item>

                <q-expansion-item v-if="validarPermisos('index.sucursal')"
                  hide-expand-icon icon="img:https://img.icons8.com/3d-fluency/94/skyscrapers.png" class="item-options"
                  active-class="tab-active" :to="{ name: 'Ver Sucursales' }"
                  dense-toggle label="Sucursales" :header-inset-level="0">
                </q-expansion-item>

                <q-expansion-item hide-expand-icon icon="img:https://img.icons8.com/3d-fluency/94/documents.png" class="item-options"
                  active-class="tab-active" :to="{ name: 'Config Proforma' }"
                  dense-toggle label="Proforma" :header-inset-level="0">
                </q-expansion-item>

              </q-expansion-item>
            </q-list>

          </q-list>
        </q-scroll-area>

      </div>
      <div class="q-mini-drawer-hide absolute" style="top: 30px; right: -17px">
        <q-btn dense round style="background-color: #21ad23;color: white;border: 6px solid #f2f2f7;"
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
      icon: 'img:https://img.icons8.com/3d-fluency/96/group--v2.png',
      link: '/proveedores',
      permisoRequerido: 'index.proveedores'
    },
    {
      title: 'Clientes',
      icon: 'img:https://img.icons8.com/color/96/supplier.png',
      link: '/customer',
      permisoRequerido: 'index.clientes'
    },
    {
      title: 'Productos y Servicios',
      icon: 'img:https://img.icons8.com/3d-fluency/94/package.png',
      link: '/productos',
      permisoRequerido: 'index.productos'
    },
    {
      title: 'Compras',
      icon: 'img:https://img.icons8.com/3d-fluency/94/shopping-cart-loaded.png',
      link: '/compras',
      permisoRequerido: 'index.compras'
    },
    {
      title: 'Ventas',
      icon: 'img:https://img.icons8.com/3d-fluency/94/fund-accounting.png',
      link: '/ventas',
      permisoRequerido: 'index.ventas'
    },
  ]

  const $q = useQuasar();
  const router = useRouter();
  const authUserStore = useAuthUserStore();
  const { validarPermisos } = useRolPermisos();

  let fullName, rol, ruta_perfil_img = '';
  const { claim } = JWT.read( authUserStore.token );

  if ( claim.foto )
    ruta_perfil_img = `${ import.meta.env.VITE_BASE_URL }/images/${ claim.foto }`
  else
    ruta_perfil_img = `${ import.meta.env.VITE_BASE_URL }/images/default-perfil.png`

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
  background-color: #71dfcb73;
}
body.body--dark {
  background: #2d2d3d
}

/* NAV Y BARRA LATERAL */

/* .q-dark { 
  /* background: #2b2c40; */
  /* DEGRADADO TONOS OSCUROS, MINIMALISTA YA AGRADABLE A LA VISTA*/
  /* background: linear-gradient(to top, #26403c58, transparent); */
  /* background-image: url(../../public/imgs/fondo_1.png); */
  /* animation: moveParticle 2s infinite linear;
  background-size: cover;
  background-repeat: no-repeat; */
/* }  */


.tab-active {
  background-color: #549fb0 !important;
  color: #ffffff !important;
  
}

.navigation-item {
  border-radius: 50px;
  min-height: 44px !important;
}

.shadow_custom {
  box-shadow: 0 2px 6px 0 rgb(67 89 113 / 12%) !important;
}

.q-scrollarea--only-vertical .q-scrollarea__content {
  width: 100%
}

.q-scrollarea__content{
  padding-bottom: 50px;
}
.drawer_cls {
  /* DEGRADADO TONOS Claros, MINIMALISTA YA AGRADABLE A LA VISTA*/
  background-color: #fff!important;
  color: #697a8d !important;
  background-image: url(../../public/imgs/fondo_2.jpg);
  background-size: cover;
  background-repeat: no-repeat;

}
.item-options{
  margin-left: 6px;
}
</style>