<script setup>
import { ref, onMounted, watch } from 'vue';
import Chart from 'chart.js/auto'
import { useQuasar } from 'quasar'
import useHelpers from "../composables/useHelpers";

const { api, claim, router } = useHelpers();
const cardData = ref({
  totalFacturado: 0,
  totalClientes: 0,
  totalCompras: 0,
  facturasAnuladas: 0
});
const modo = ref('mes');
const selectSucursal = ref('');
const productosMasVendidos = ref([]);
const ventasPorMes = ref([]);
const listSucursales = ref([]);
const color = ref('rgba(226, 224, 224, 0.2)');
const colorLabels = ref('rgb(26, 61, 61, 1)');
const $q = useQuasar();

watch(
  () => $q.dark.isActive,
  (newValue) => {
    if ( newValue ) {
      color.value = 'rgba(226, 224, 224, 0.1)'
      colorLabels.value = 'rgb(247, 238, 238, 0.7)'
    } else {
      color.value = 'rgba(111, 105, 105, 0.2)'
      colorLabels.value = 'rgb(26, 61, 61, 1)'
    }

    showVentasPorMes()
    showProductsMoreSales()
  },
  { deep: true }
)

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
    const { data } = await api.post('/dashboard', {
      company_id: claim.company.id,
      modo: modo.value,
      mes: getCurrentDate(),
      sucursal_id: selectSucursal.value
    });

    productosMasVendidos.value = data.productosMasVendidos;
    ventasPorMes.value = data.ventasPorMes;
    cardData.value = data;

    showProductsMoreSales();
    showVentasPorMes();
  } catch (error) {}
}

const getSucursales = async () => {
  listSucursales.value = [];

  const { data } = await api.get(`/sucursal/find/${ claim.company.id }/company`);
  data.forEach((companie) => {
    listSucursales.value.push({
      label:  companie.nombre,
      value:  companie.id
    })
  });

  if (claim.roles[0] == 'SUPER-ADMINISTRADOR' || claim.roles[0] == 'ADMINISTRADOR'){
    if ( listSucursales.value.length > 0 ) selectSucursal.value = listSucursales.value[0].value
  }else{
    selectSucursal.value = claim.sucursales[0]
  }
}

const showVentasPorMes = () => {
  const ctx = document.getElementById('ventasPorMes');

  if (window.venta_mes) window.venta_mes.destroy();

  window.venta_mes =  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ventasPorMes.value.map(p => p.mes),
      datasets: [{
        label: 'Total de ventas por mes',
        data: ventasPorMes.value.map(p => p.total_ventas),
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)', // Rojo
          'rgba(54, 162, 235, 0.2)', // Azul
          'rgba(255, 206, 86, 0.2)', // Amarillo
          'rgba(75, 192, 192, 0.2)', // Verde
          'rgba(153, 102, 255, 0.2)', // Morado
          'rgba(255, 159, 64, 0.2)', // Naranja
          'rgba(255, 99, 132, 0.2)', // Rojo
          'rgba(54, 162, 235, 0.2)', // Azul
          'rgba(255, 206, 86, 0.2)', // Amarillo
          'rgba(75, 192, 192, 0.2)', // Verde
          'rgba(153, 102, 255, 0.2)', // Morado
          'rgba(255, 159, 64, 0.2)' // Naranja
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        x: {
          grid: { color: color.value }
        },
        y: {
          grid: { color: color.value },
          beginAtZero: true
        }
      },
      plugins: {
        legend: {
          display: true,
          labels: { color: colorLabels.value }
        }
      }
    }
  });
}

const showProductsMoreSales = () => {
  const ctx = document.getElementById('productosMasVendidos');

  if (window.productos) window.productos.destroy();

  window.productos = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: productosMasVendidos.value.map(p => p.nombre),
      datasets: [{
        label: 'Productos mas vendidos',
        data: productosMasVendidos.value.map(p => parseInt(p.cantidad)),
        backgroundColor: [ // Aquí defines los colores para cada barra
          'rgba(255, 206, 86, 0.2)', // Amarillo
          'rgba(54, 162, 235, 0.2)', // Azul
          'rgba(255, 99, 132, 0.2)', // Rojo
          'rgba(75, 192, 192, 0.2)', // Verde
          'rgba(153, 102, 255, 0.2)'
        ],
        borderColor: [ // También puedes definir colores para los bordes de las barras si lo deseas
          'rgba(255, 206, 86, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        x: {
          grid: {
            color: color.value
          }
        },
        y: {
          grid: {
            color: color.value
          },
          beginAtZero: true
        }
      },
      plugins: {
        legend: {
          display: true,
          labels: { color: colorLabels.value }
        }
      }
    }
  });
}

onMounted(async () => {
  await getSucursales();
  await getInfoDashboard();
})

</script>

<template>
  <div class="q-ma-lg q-pt-md">
    <div class="row q-col-gutter-lg">

      <div v-if="claim.roles[0] == 'SUPER-ADMINISTRADOR' || claim.roles[0] == 'ADMINISTRADOR'"
        class="col-xs-12 col-sm-6 row justify-start q-pt-md">
        <label class="q-mx-sm row items-center">
          <span>Sucursal: </span>
        </label>
        <q-select outlined dense v-model="selectSucursal"
          @update:model-value="getInfoDashboard()"
          emit-value map-options
        :options="listSucursales">
        </q-select>
      </div>

      <div class="col-xs-12  row justify-end q-pt-md"
        :class="claim.roles[0] == 'SUPER-ADMINISTRADOR' || claim.roles[0] == 'ADMINISTRADOR'
                ? 'col-sm-6' : 'col-sm-12'">
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

      <div class="col-xs-12 col-sm-7 flex items-end"
        :class="$q.screen.xs ? 'q-mt-lg' : ''">
        <canvas id="ventasPorMes"></canvas>
      </div>
      <div
        class="col-xs-12 col-sm-5 q-mt-none flex flex-center"
        :class="$q.screen.xs ? 'q-pt-none' : ''"
        style="height: 430px !important;">
        <canvas id="productosMasVendidos">
        </canvas>
      </div>

    </div>
  </div>

</template>

<style>
.aplicarPositionRelative {
  position: relative;
  bottom: 11px;
}
.cardInfo:hover .iconCard{
  font-size: 56px !important;
  transition: font-size .1s linear;
}
.cardInfo{
  margin-top: 8px;
}
</style>
