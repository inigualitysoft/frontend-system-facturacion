<script setup lang="ts">
  import FormUser from "./components/FormUser.vue";
  import { useUser } from "./composables/useUser";

  const { limpiarFormulario } = useUser();
  
  limpiarFormulario()

</script>

<template>
  <div class="q-ma-lg q-pt-md">
    <div class="row q-col-gutter-lg">

      <div class="col-xs-12 col-md-6" :class="[ $q.screen.width < 1022 ? 'q-pt-sm' : '']">
        <q-breadcrumbs class="row q-mr-xs" 
          :class="[ $q.screen.width < 1022 ? 'justify-center q-pt-sm' : 'justify-start ']">
          <q-breadcrumbs-el label="Inicio" icon="home" to="/" />
          <q-breadcrumbs-el label="Usuarios" icon="group" to="/usuarios" />
          <q-breadcrumbs-el label="Agregar" icon="add_circle" />
        </q-breadcrumbs>
      </div>

      <div class="col-xs-12 col-md-6" :class="[ $q.screen.width < 1022 ? 'text-center q-pt-sm' : 'text-right']">
        <label class="text-h6 text-center">Nuevo Usuario</label>
      </div>
    </div>
  </div>

  <div class="q-px-md">
    <div class="row q-col-gutter-md">
      <div class="col-xs-12 col-md-12 q-pt-xs">
        <FormUser :edit="false" />          
      </div>
    </div>
  </div> 
</template>
