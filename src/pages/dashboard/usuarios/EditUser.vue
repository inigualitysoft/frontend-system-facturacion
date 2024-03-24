<script setup lang="ts">
  import FormUser from "./components/FormUser.vue";
  import { useUser } from './composables/useUser.js';

  const { api, formUser, limpiarFormulario, route } = useUser();

  const getUser = async () => {
    const { data } = await api.get('/auth/find/' + route.params.term);
    const { password, confirmPassword, company, foto, ...restUser } = data[0];

    formUser.value = {
      ...restUser,
      company: company.id,
      foto: null,
      foto_old: ( foto == null ) ? null : foto,
    }

  }

  limpiarFormulario();
  getUser();

</script>

<template>
  <div class="q-ma-lg q-pt-md">
    <div class="row q-col-gutter-lg">
      <div class="col-xs-12 col-md-6" :class="[ $q.screen.width < 1022 ? 'q-pt-sm' : '']">
        <q-breadcrumbs class="row q-mr-xs"
          :class="[ $q.screen.width < 1022 ? 'justify-center q-pt-sm' : 'justify-start ']">
          <q-breadcrumbs-el label="Inicio" icon="home" to="/" />
          <q-breadcrumbs-el label="Usuarios" icon="group" to="/usuarios" />
          <q-breadcrumbs-el label="Usuario" icon="edit" />
        </q-breadcrumbs>
      </div>

      <div class="col-xs-12 col-md-6" :class="[ $q.screen.width < 1022 ? 'text-center q-pt-sm' : 'text-right']">
        <label class="text-h6">Editar Usuario</label>
      </div>

    </div>
  </div>

  <div class="q-px-md">
    <div class="row q-col-gutter-md">
      <div class="col-xs-12 col-md-12 q-pt-xs">
        <FormUser :edit="true" />
      </div>
    </div>
  </div>
</template>
