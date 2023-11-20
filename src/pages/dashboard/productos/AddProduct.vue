<script setup lang="ts">
  import FormProduct from "./components/FormProduct.vue";  
  import { useProduct } from "./composables/useProducts";

  const { limpiarFormulario } = useProduct();
  
  limpiarFormulario();
</script>

<template>
  <q-card style="width: 643px !important;max-width: fit-content">
    <q-card-section>
        <div class="text-h6 text-center">
          Agregar Producto
          <q-btn round flat dense icon="close" class="float-right" color="grey-8" v-close-popup></q-btn>
        </div>
    </q-card-section>

    <q-separator inset></q-separator>

    <q-card-section class="q-pt-none">
      <FormProduct :edit="false" />        
    </q-card-section>
  </q-card>
</template>

  