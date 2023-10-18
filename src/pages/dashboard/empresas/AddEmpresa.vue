<script setup lang="ts">
  import { useEmpresa } from './composables/useEmpresa';
  import FormEmpresa from "./components/FormEmpresa.vue";

  const { limpiarFormulario } = useEmpresa();
  
  limpiarFormulario();

</script>

<template>
  <q-card style="width: 843px !important;max-width: fit-content">
    <q-card-section>
        <div class="text-h6">
          Agregar Empresa
          <q-btn round flat dense icon="close" class="float-right" color="grey-8" v-close-popup></q-btn>
        </div>
    </q-card-section>

    <q-separator inset></q-separator>

    <q-card-section class="q-pt-none">
      <FormEmpresa :edit="false" />        
    </q-card-section>

  </q-card>  
</template>
  

  