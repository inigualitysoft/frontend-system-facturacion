<script setup lang="ts">
import { ref } from "vue";
import useHelpers from "../composables/useHelpers";

const { api, claim, router } = useHelpers();
const cardData = ref({
  totalFacturado: 0,
  totalClientes: 0,
  totalCompras: 0,
  facturasAnuladas: 0
});
const modo = ref('mes');

const getCurrentDate = () => {
  // Obtener la fecha actual
  var fechaActual = new Date();

  // Obtener el primer día del mes actual
  var primerDia = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1);
  var primerDiaFormateado = primerDia.toISOString().slice(0, 10);

  // Obtener el último día del mes actual
  var ultimoDia = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 0);
  var ultimoDiaFormateado = ultimoDia.toISOString().slice(0, 10);

  // Mostrar el rango de fechas
  return `${ primerDiaFormateado } - ${ ultimoDiaFormateado }`;
}

const getInfoDashboard = async () => {
  try {

    var fecha = new Date();
    var mesActual = fecha.getMonth() + 1;

    const { data } = await api.post('/dashboard', {
      company_id: claim.company.id,
      modo: modo.value,
      mes: getCurrentDate()
    });
    cardData.value = data;
  } catch (error) {

  }
}

getInfoDashboard();
</script>

<template>
  <div class="q-ma-lg q-pt-md">
    <div class="row q-col-gutter-lg">

      <div class="col-12 row justify-end q-pt-md">
        <q-btn-toggle
          v-model="modo"
          @update:model-value="getInfoDashboard"
          class="my-custom-toggle"
          no-caps
          rounded
          unelevated
          toggle-color="primary"
          color="white"
          text-color="primary"
          :options="[
            {label: 'Mes', value: 'mes'},
            {label: 'General', value: 'general'}
          ]"
        />
      </div>

      <div class="col-xs-12 col-sm-6 col-md-3 cardInfo q-pt-xs">
        <q-card class="my-card text-white" style="background-color: #28A745;">

          <q-card-section>
            <div class="row q-py-sm">
              <div class="col-8">
                <div class="text-h4 text-weight-bold">
                  ${{ cardData.totalFacturado.toFixed(2) }}
                </div>
                <div class="text-subtitle1">
                  Facturación total
                </div>
              </div>
              <div class="col-4 flex flex-center">
                <i class="fa-solid fa-file-invoice iconCard"
                  style="font-size: 45px;color: #228E3B;margin-left: 16px;">
                </i>
              </div>
            </div>
          </q-card-section>

          <q-card-actions class="justify-center q-py-none q-px-none"
            style="background-color: #228E3B;">
            <q-btn
              @click="router.push({ name: 'Ver Ventas', params: {
                tipo: 'AUTORIZADO',
                fecha: modo == 'mes' ? getCurrentDate() : '' }
              });"
              class="full-width" flat
              style="padding-left: 0px;padding-right: 0px;">
              Mas Info
              <i class="fa-solid fa-circle-arrow-right q-ml-sm iconTest" style="font-size: 18px;">
              </i>
            </q-btn>
          </q-card-actions>

        </q-card>
      </div>

      <div class="col-xs-12 col-sm-6 col-md-3 cardInfo q-pt-xs">
        <q-card class="my-card text-white" style="background-color: #FFC107;">

          <q-card-section>
            <div class="row q-py-sm">
              <div class="col-8">
                <div class="text-h4 text-weight-bold"
                  :class="[!$q.dark.isActive ? 'text-blue-grey-10' : '']">
                  {{ cardData.totalClientes }}
                </div>
                <div class="text-subtitle1 text-weight-medium"
                  :class="[!$q.dark.isActive ? 'text-blue-grey-10' : '']">
                  Total de clientes
                </div>
              </div>
              <div class="col-4 flex flex-center">
                <i class="fa-solid fa-users iconCard"
                  style="font-size: 45px;color: rgb(191 145 9);margin-left: 16px;">
                </i>
              </div>
            </div>
          </q-card-section>

          <q-card-actions
            class="justify-center q-py-none text-blue-grey-10 text-weight-medium q-px-none"
            style="background-color: #D9A406;">
            <q-btn
              @click="router.push({ name: 'customer.index' })"
              class="full-width" flat
              style="padding-left: 0px;padding-right: 0px;">
              Mas Info
              <i class="fa-solid fa-circle-arrow-right q-ml-sm iconTest" style="font-size: 18px;">
              </i>
            </q-btn>
          </q-card-actions>

        </q-card>
      </div>

      <div class="col-xs-12 col-sm-6 col-md-3 cardInfo q-pt-xs">
        <q-card class="my-card text-white" style="background-color: #17A2B8;">

          <q-card-section>
            <div class="row q-py-sm">
              <div class="col-8">
                <div class="text-h4 text-weight-bold">
                  ${{ cardData.totalCompras.toFixed(2) }}
                </div>
                <div class="text-subtitle1">
                  Total de Compras
                </div>
              </div>
              <div class="col-4 flex flex-center">
                <i class="fa-solid fa-cart-shopping iconCard"
                  style="font-size: 45px;color: #148A9D;margin-left: 16px;"></i>
              </div>
            </div>
          </q-card-section>

          <q-card-actions class="justify-center q-py-none q-px-none"
            style="background-color: #148A9D;">
            <q-btn
              @click="router.push({ name: 'Ver Compras', params: { fecha: modo == 'mes' ? getCurrentDate() : '' } });"
              class="full-width" flat
              style="padding-left: 0px; padding-right: 0px;">
              Mas Info
              <i class="fa-solid fa-circle-arrow-right q-ml-sm iconTest" style="font-size: 18px;">
              </i>
            </q-btn>
          </q-card-actions>

        </q-card>
      </div>

      <div class="col-xs-12 col-sm-6 col-md-3 cardInfo q-pt-xs">
        <q-card class="my-card text-white" style="background-color: #DC3545;">

          <q-card-section>
            <div class="row q-py-sm">
              <div class="col-8">
                <div class="text-h4 text-weight-bold">
                  ${{ cardData.facturasAnuladas.toFixed(2) }}
                </div>
                <div class="text-subtitle1">
                  Facturas Anuladas
                </div>
              </div>
              <div class="col-4 flex flex-center">
                <i class="fa-solid fa-file-circle-xmark iconCard"
                  style="font-size: 45px;color: rgb(169 44 55);margin-left: 16px;">
                </i>
              </div>
            </div>
          </q-card-section>

          <q-card-actions class="justify-center q-py-none q-px-none"
            style="background-color: #C6303E;">
            <q-btn
              @click="router.push({ name: 'Ver Ventas', params: {
                        tipo: 'ANULADO',
                        fecha: modo == 'mes' ? getCurrentDate() : '' }
                      });"
              class="full-width" flat
              style="padding-left: 0px;padding-right: 0px;">
              Mas Info
              <i class="fa-solid fa-circle-arrow-right q-ml-sm iconTest" style="font-size: 18px;">
              </i>
            </q-btn>
          </q-card-actions>

        </q-card>
      </div>

    </div>
  </div>

</template>

<style>
.cardInfo:hover .iconCard{
  font-size: 56px !important;
  transition: font-size .1s linear;
}
.cardInfo{
  margin-top: 8px;
}
</style>
