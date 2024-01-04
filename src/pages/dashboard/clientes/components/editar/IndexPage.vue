<script setup>
  import { ref } from 'vue';
  import ResumenPage from "./ResumenPage.vue";
  import ServiciosPage from "./ServiciosPage.vue";
  import FacturacionPagos from "./FacturacionPagos.vue";

  const tab = ref('resumen');

</script>

<template>
  <div class="q-gutter-y-md">
    <q-card>
      <q-tabs v-model="tab"
        draggable="false"
        dense class="text-grey" active-color="primary"
        indicator-color="primary" align="justify" narrow-indicator>
        <q-tab name="resumen" label="Resumen" />
        <q-tab name="servicios" label="Servicios" />
        <q-tab name="facturacion/pagos" label="Facturación/Pagos" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="resumen">
          <ResumenPage />
        </q-tab-panel>

        <q-tab-panel name="servicios">
          <ServiciosPage v-if="tab == 'servicios'" />
        </q-tab-panel>

        <q-tab-panel name="facturacion/pagos">
          <FacturacionPagos v-if="tab == 'facturacion/pagos'" />
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </div>
</template>

<style>
.resaltarTextoInput{
  font-size: 14px;
  text-align: center;
  color: #313131;
  font-weight: 500;
}
</style>