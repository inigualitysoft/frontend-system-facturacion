<script setup>
  import { ref } from 'vue';
  import ConfiguracionPage from "./ConfiguracionPage.vue";
  import IndexFacturas from "./IndexFacturas.vue";

  const tab = ref('facturas');

</script>

<template>
  <div class="q-gutter-y-md">
    <q-card>
      <q-tabs v-model="tab"
        draggable="false"
        dense class="text-grey" active-color="primary"
        indicator-color="primary" align="left" narrow-indicator>
        <q-tab name="facturas" label="Facturas" />
        <q-tab name="configuracion" label="Configuración" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="facturas">
          <IndexFacturas />
        </q-tab-panel>

        <q-tab-panel name="configuracion">
          <ConfiguracionPage />
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </div>
</template>
