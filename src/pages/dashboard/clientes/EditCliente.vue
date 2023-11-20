<script setup lang="ts">
  import FormCliente from "./components/FormCliente.vue";        

</script>

<template>
  <q-card style="width: 710px !important;max-width: fit-content">
    <q-card-section>
      <div class="text-h6 text-center">
        Editar Cliente
        <q-btn round flat dense icon="close" class="float-right" color="grey-8" v-close-popup></q-btn>
      </div>
    </q-card-section>

    <q-separator inset></q-separator>

    <q-card-section class="q-pt-none">
      <FormCliente :edit="true" />        
    </q-card-section>

  </q-card>
</template>
  

  