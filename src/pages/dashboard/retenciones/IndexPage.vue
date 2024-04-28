<script setup>
  import { Manager } from "socket.io-client";
  import { ref, watch } from 'vue'
  import useRolPermisos from "../../../composables/useRolPermisos";
  import useHelpers from "../../../composables/useHelpers";
  import { date, useQuasar } from 'quasar'

  /* --------------------- IMPLEMENTACION DE WEBSOCKET ---------------------- */
  let socket;

  const { api, claim, route } = useHelpers();

  const connectToServer = () => {
    const manager = new Manager(`${ import.meta.env.VITE_BASE_URL }/socket.io/socket.io.js`, {
      extraHeaders: { autentication: claim.id }
    });

    socket?.removeAllListeners();
    socket = manager.socket('/'); //conectarme algun namespace

    socket.on('updateStateInvoice', async () => {
      await getRetenciones();
    })
  }
  // ---------------------------------------------------------------------------

  const columns = [
    { name: 'acciones', label: 'acciones', align: 'center' },
    { name: 'sucursal', label: 'Sucursal', align: 'center' },
    { name: 'num_comprobante', label: 'Num. Comprobante', field: 'numero_comprobante', align: 'center' },
    { name: 'usuario', label: 'Usuario', align: 'center' },
    { name: 'cliente', label: 'Cliente', align: 'center' },
    { name: 'f/h', label: 'Fecha/Hora', align: 'center', field: 'created_at' },
    { name: 'total', label: 'Total', name: 'total', align: 'center' },
    { name: 'estado', label: 'Estado', field: 'estado', align: 'center' }
  ]

  const dateOne = ref('');
  const dateTwo = ref('');
  const rows = ref([]);

  const formFiltrarVentas = ref({ desde: '', hasta: '', pv_id: '' })

  const tipoComprobantes = ref('Todos');
  const filter = ref('');
  const detalleData = ref({})
  const sucursales = ref([]);
  const sucursal_selected = ref([]);
  const detalleFactura = ref({})
  const { validarPermisos } = useRolPermisos();

  const $q = useQuasar();
  const loading = ref( false )

  const getRetenciones = () => {
    console.log("get ventas");
  }

  watch(tipoComprobantes, (currentValue, _) => { getRetenciones(); });

  const checkRoute = () => {
    const { tipo, fecha } = route.params;

    if ( tipo != '' )
      tipoComprobantes.value = tipo;

    if (fecha != '') {
      dateOne.value = fecha.split(' - ')[0].replace(/-/g, "/");
      dateTwo.value = fecha.split(' - ')[1].replace(/-/g, "/");
    }
  }

  watch(sucursal_selected, (newValue, oldValue) => {
    getRetenciones();
  })
  const getSucursales = async( company_id ) => {
    sucursales.value = [];

    const { data } = await api.get(`/sucursal/find/${ company_id }/company`);

    data.forEach(( x) => {
      sucursales.value.push({ label: x.nombre, value: x.id })
    })

    if ( sucursales.value.length != 0)
      sucursal_selected.value = sucursales.value[0].value;

    getRetenciones();
  }
  connectToServer();

  watch(filter, (newValue, oldValue) => {
    getRetenciones();
  })

  if (claim.roles[0] == 'SUPER-ADMINISTRADOR' || claim.roles[0] == 'ADMINISTRADOR')
    getSucursales(claim.company.id)
  else
    getRetenciones();

  const mode = ref("list");
  const pagination = ref({
    rowsPerPage: 10
  })

</script>

<template>
  <div class="q-mx-lg q-pt-md">
    <div class="row q-col-gutter-lg">

      <div style="display: flex;">
        <div style="display: flex;"
          :class="[ $q.screen.xs ?
                  'q-mb-md q-mt-none q-pt-xs' : 'q-ml-lg q-pl-none q-my-md' ]">
          <div class="row"
            :class="[ $q.screen.xs ? 'flex-center' : '' ]">
            <div class="col-xs-12 col-sm-3">
              <label class="q-mr-sm row q-pt-sm justify-center">
                <span :class="[ $q.screen.xs ? 'text-weight-bold' : '' ]">
                  Filtrar por fecha:
                </span>
              </label>
            </div>

            <div class="col-xs-10 col-sm-4">
              <q-input outlined dense v-model="dateOne" mask="date" >
                <template v-slot:append>

                  <q-icon v-if="dateOne !== ''" name="close" @click="dateOne = '', getRetenciones()" class="cursor-pointer" />

                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="dateOne" @update:model-value="getRetenciones">
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="Close" color="primary" flat />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>

            <div class="col-xs-12 col-sm-1 flex flex-center">
              <label
                class="q-mx-md"
                :class="[ $q.screen.xs ? 'text-weight-medium' : '' ]">
                Hasta
              </label>
            </div>

            <div class="col-xs-10 col-sm-4">
              <q-input outlined dense v-model="dateTwo" mask="date">
                <template v-slot:append>

                  <q-icon v-if="dateTwo !== ''" name="close" @click="dateTwo = '', getRetenciones()" class="cursor-pointer" />

                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="dateTwo" @update:model-value="getRetenciones">
                        <div class="row items-center justify-end">
                          <q-btn @click="getRetenciones"
                            v-close-popup label="Close" color="primary" flat />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
          </div>
        </div>
        <div v-if="$q.screen.width >= 935"
          class="flex flex-center">
          <q-btn
            class="q-ml-lg q-px-sm" dense outline color="primary" icon-right="picture_as_pdf"
              style="margin-top: 2px;" label="descargar facturas" />
        </div>
      </div>

      <div class="col-12 q-pt-none">
        <q-card flat class="shadow_custom">
          <q-table title-class="text-grey-7 text-h6" :rows="rows"
            :hide-header="mode === 'grid'"
            :loading="loading"
            :columns="columns" row-key="name" :grid="mode==='grid'"
            :filter="filter" :pagination.sync="pagination">

            <template v-slot:loading>
              <q-inner-loading showing color="primary" />
            </template>

            <template v-slot:header="props">
              <q-tr :props="props" style="height: 60px">
                <q-th
                  v-for="col in props.cols"
                  :key="col.name"
                  :props="props"
                  class="text-grey-7 text-weight-bold text-uppercase"
                  style="font-size: 13px"
                >
                  {{ col.label }}
                </q-th>
              </q-tr>
            </template>

            <template v-slot:top-left="props">
              <div v-if="$q.screen.xs"
                class="text-center row justify-center" style="width: 100%;">
                <label class="q-mb-sm text-grey-7 text-h6">
                  Listado de Comprobantes
                </label>
              </div>

                <div style="display: flex;"
                  :style="!$q.screen.xs || 'width: 100%;justify-content: center;position: relative;right: 8px;'"
                  :class="[ $q.screen.xs ? 'q-mb-md' : '' ]">
                  <label class="q-mr-sm row items-center">
                    <span>Tipo: </span>
                  </label>
                  <q-select outlined dense v-model="tipoComprobantes"
                  emit-value map-options
                  :options="[
                      { label: 'Todos', value: 'TODOS' },
                      { label: 'Proformas', value: 'PROFORMA' },
                      { label: 'Facturas', value: 'FACTURAS' },
                      { label: 'Facturas Anuladas', value: 'ANULADO' },
                      { label: 'Facturas Autorizadas', value: 'AUTORIZADO' },
                    ]">
                  </q-select>
                </div>

                <div v-if="claim.roles[0] == 'SUPER-ADMINISTRADOR' || claim.roles[0] == 'ADMINISTRADOR'"
                :style="!$q.screen.xs || 'width: 100%;justify-content: center;'"
                  style="display: flex;" :class="[ $q.screen.xs ? 'q-mb-md' : 'q-ml-lg' ]">
                  <label class="q-mr-sm row items-center">
                    <span>Por Sucursal: </span>
                  </label>
                  <q-select outlined dense v-model="sucursal_selected"
                      emit-value map-options :options="sucursales">
                  </q-select>
                </div>
            </template>

            <template v-slot:top-right="props">
              <q-btn v-if="$q.screen.width >= 1023 && validarPermisos('crear.venta')"
                @click="$router.push({ name: 'add.retencion' })"
                outline color="primary" label="Agregar Retención" class="q-mr-xs"/>

              <q-input :style="$q.screen.width > 700 || 'width: 70%'"
                outlined dense debounce="300" v-model="filter" placeholder="Buscar...">
                <template v-slot:append>
                  <q-icon name="search"/>
                </template>
              </q-input>

              <q-btn flat round dense
                :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"
                @click="props.toggleFullscreen" v-if="mode === 'list'" >
                <q-tooltip :disable="$q.platform.is.mobile" v-close-popup>
                  {{ props.inFullscreen ? 'Exit Fullscreen' : 'Toggle Fullscreen' }}
                </q-tooltip>
              </q-btn>

              <q-btn flat round dense
                :icon="mode === 'grid' ? 'list' : 'grid_on'"
                @click="mode = mode === 'grid' ? 'list' : 'grid'; separator = mode === 'grid' ? 'none' : 'horizontal'" v-if="!props.inFullscreen"
              >
                <q-tooltip :disable="$q.platform.is.mobile" v-close-popup>
                  {{ mode === 'grid' ? 'List' : 'Grid' }}
                </q-tooltip>
              </q-btn>
            </template>

            <template v-slot:no-data="{ icon }">
              <div class="full-width row flex-center text-lime-10 q-gutter-sm">
                <span class="text-subtitle1">
                  No se encontró ningun resultado
                </span>
              </div>
            </template>
          </q-table>
        </q-card>
      </div>

    </div>
  </div>

  <q-page-sticky position="bottom-right" :offset="[18, 18]"
      v-if="$q.screen.width <= 1023 && validarPermisos('crear.venta')">
    <q-btn round color="secondary" size="lg"
        icon="add" @click=" $router.push('/ventas/add')" />
  </q-page-sticky>

</template>

<style>
  .estadoVenta{
    font-size: 14px;
  }
  .totalVenta{
    font-size: 15px;
  }
  .table-ventas .q-table__top,
  .table-ventas .q-table__bottom,
  .table-ventas thead tr:first-child th {
    /* bg color is important for th; just specify one */
    background-color: #ddebdc; }

  .table-ventas tbody tr:nth-child(even) {
    background-color: rgb(124, 27, 27);
    white-space: normal;
  }
  .table-ventas tbody tr:nth-child(even) {
    background-color: rgb(240, 240, 240);
    white-space: normal;
  }
  .table-ventas thead th, .table-ventas tbody td {
    white-space: normal;
  }
</style>
