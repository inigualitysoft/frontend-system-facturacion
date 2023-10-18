<script setup lang="ts">
  import FormProveedor from "./components/FormProveedor.vue";
  import { useProveedor } from "./composables/useProveedor";  
  
  const { limpiarFormulario } = useProveedor();
  
  limpiarFormulario();
  
</script>

<template>
  <q-card style="width: 843px !important;max-width: fit-content">
    <q-card-section>
        <div class="text-h6">
          Agregar Nuevo Proveedor
          <q-btn round flat dense icon="close" class="float-right" color="grey-8" v-close-popup></q-btn>
        </div>
    </q-card-section>

    <q-separator inset></q-separator>

    <q-card-section class="q-pt-none">
      <FormProveedor :edit="false" />        
    </q-card-section>

  </q-card>
</template>
  

  