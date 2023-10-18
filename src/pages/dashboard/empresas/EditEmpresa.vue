<script setup lang="ts">
  import FormEmpresa from "./components/FormEmpresa.vue";      
  import { useEmpresa } from './composables/useEmpresa';  

  const { isValid } = useEmpresa();
  isValid.vulue = false;

</script>

<template>
  <q-card style="width: 843px !important;max-width: fit-content">
    <q-card-section>
      <div class="text-h6">
        Editar Empresa
        <q-btn round flat dense icon="close" class="float-right" color="grey-8" v-close-popup></q-btn>
      </div>
    </q-card-section>

    <q-separator inset></q-separator>

    <q-card-section class="q-pt-none">
      <FormEmpresa :edit="true" />        
    </q-card-section>

  </q-card>
</template>
  

  