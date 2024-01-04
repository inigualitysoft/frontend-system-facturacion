<script setup lang="ts">
  import { useEmpresa } from './composables/useEmpresa';
  import FormEmpresa from "./components/FormEmpresa.vue";

  const { limpiarFormulario } = useEmpresa();
  
  limpiarFormulario();

</script>

<template>
  <div class="q-ma-lg q-pt-md">
    <div class="row q-col-gutter-md">
      <div v-if="$q.screen.width > 1022"
        class="offset-1"></div>
      <div class="col-xs-12 q-pl-none" :class="[ $q.screen.width < 1022 ? 'q-pt-sm col-md-6' : 'col-md-5']">
        <q-breadcrumbs class="row q-mr-xs"         
          :class="[ $q.screen.width < 1022 ? 'justify-center q-pt-sm' : 'justify-start ']">
          <q-breadcrumbs-el label="Inicio" icon="home" to="/" />
          <q-breadcrumbs-el label="Empresas" icon="fa-solid fa-list" to="/empresas" />
          <q-breadcrumbs-el label="Agregar" icon="add_circle" />
        </q-breadcrumbs>
      </div>

      <div class="col-xs-12" :class="[ $q.screen.width < 1022 ? 'text-center q-pt-sm col-md-6' : 'text-right col-md-5']">
        <label class="text-h6 text-center" style="position: relative;top: -8px;left: -10px">
          Nueva Empresa
        </label>
      </div>
    </div>
  </div>

  <div class="q-px-md">
    <div class="row q-col-gutter-md">
      <div class="col-xs-12 col-md-10 q-pt-xs"
       :class="$q.screen.width < 1022 ? '' : 'offset-1' ">
        <FormEmpresa :edit="false" />          
      </div>
    </div>
  </div> 
</template>

  