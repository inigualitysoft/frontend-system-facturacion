<script setup>
  import FormRol from "./components/FormRol.vue";
  import { useRol } from "./composables/useRol";

  const { limpiarFormulario } = useRol();
  
  limpiarFormulario();
   
</script>

<template>
  <q-card style="width: 730px; max-width: 80vw;">
    <q-card-section>
        <div class="text-h6 text-center">
          Agregar Rol
          <q-btn round flat dense icon="close" class="float-right" color="grey-8" v-close-popup></q-btn>
        </div>
    </q-card-section>

    <q-separator inset></q-separator>

    <q-card-section class="q-pt-none">
      <FormRol :edit="false" />        
    </q-card-section>

  </q-card>
</template>
