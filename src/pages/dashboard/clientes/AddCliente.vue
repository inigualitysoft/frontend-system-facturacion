<script setup lang="ts">
  import { useCliente } from './composables/useCliente';
  import FormCliente from "./components/FormCliente.vue";

  const { limpiarFormulario } = useCliente();
  
  limpiarFormulario();

</script>

<template>
  <q-card style="width: 843px !important;max-width: fit-content">
    <q-card-section>
        <div class="text-h6">
          Agregar Cliente
          <q-btn round flat dense icon="close" class="float-right" color="grey-8" v-close-popup></q-btn>
        </div>
    </q-card-section>

    <q-separator inset></q-separator>

    <q-card-section class="q-pt-none">
      <FormCliente :edit="false" />        
    </q-card-section>

  </q-card>  
</template>
  

  