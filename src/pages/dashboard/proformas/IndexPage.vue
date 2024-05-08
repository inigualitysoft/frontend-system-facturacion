<script setup>
  import { Manager } from "socket.io-client";
  import { ref, watch } from 'vue'
  import useRolPermisos from "../../../composables/useRolPermisos";
  import useHelpers from "../../../composables/useHelpers";
  import { date, Dialog, useQuasar, Loading } from 'quasar'
  import { useVentas } from "./useVentas.js";
  import DetalleCompra from '../../../components/DetalleProducts.vue'
  import ModalReenviarComprobantes from "./ModalReenviarComproantes.vue";

  /* --------------------- IMPLEMENTACION DE WEBSOCKET ---------------------- */
  let socket;

  const { api, claim, route, mostrarNotify } = useHelpers();

  const connectToServer = ( token ) => {
    const manager = new Manager(`${ import.meta.env.VITE_BASE_URL }/socket.io/socket.io.js`, {
      extraHeaders: {
        autentication: claim.id
      }
    });

    socket?.removeAllListeners();
    socket = manager.socket('/'); //conectarme algun namespace

    socket.on('updateStateInvoice', async () => {
      await getVentas();
    })
  }

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
  const showModalReenvioComprobantes = ref(false);
  const modalDetalle = ref(false);
  const { generarExcel } = useVentas();

  const tipoComprobantes = ref('Todos');
  const filter = ref('');
  const detalleData = ref({})
  const sucursales = ref([]);
  const sucursal_selected = ref([]);
  const detalleFactura = ref({})
  const { validarPermisos } = useRolPermisos();

  const $q = useQuasar();
  const loading = ref( false )

  watch(tipoComprobantes, (currentValue, _) => { getVentas(); });

  const checkRoute = () => {
    const { tipo, fecha } = route.params;

    if ( tipo != '' )
      tipoComprobantes.value = tipo;

    if (fecha != '') {
      dateOne.value = fecha.split(' - ')[0].replace(/-/g, "/");
      dateTwo.value = fecha.split(' - ')[1].replace(/-/g, "/");
    }
  }

  const getVentas = async () => {
    try {
      loading.value = true;
      let headers = { headers: {
        tipo: 'PROFORMA',
        'sucursal-id': sucursal_selected.value,
        desde: dateOne.value,
        hasta: dateTwo.value
      }};
      const { data } = await api.get('/invoices', headers);

      data.map( ( venta ) => {
        venta.created_at = date.formatDate(venta.created_at, 'DD/MM/YYYY HH:mm a'),
        venta.loading = false;
      });

      rows.value = data;
      loading.value = false;
    } catch (error) {
      console.log(error)
      loading.value = false;
    }
  }

  const eliminarProforma = async( proforma_id ) => {
    Dialog.create({
      title: '¿Estas seguro de querer eliminar esta proforma?',
      ok: { push: true, color: 'cyan-10', label: 'Eliminar' },
      cancel: { push: true, color: 'blue-grey-6', label: 'Cancelar' }
    }).onOk(async () => {
      try {
        Loading.show({message: 'Cargando...'});

        await api.delete(`/invoices/${ proforma_id }`);
        await getVentas();

        mostrarNotify('positive', 'Proforma eliminada exitosamente');

        Loading.hide();
      } catch (error) {
        mostrarNotify('warning', error.response.data.message);
        Loading.hide();
      }
    })
  }

  watch(sucursal_selected, (newValue, oldValue) => {
    getVentas();
  })
  const getSucursales = async( company_id ) => {
    loading.value = true;

    sucursales.value = [];

    const { data } = await api.get(`/sucursal/find/${ company_id }/company`);

    data.forEach(( x) => {
      sucursales.value.push({ label: x.nombre, value: x.id })
    })

    if ( sucursales.value.length != 0)
      sucursal_selected.value = sucursales.value[0].value;

    getVentas();
  }

  connectToServer();

  watch(filter, (newValue, oldValue) => {
    getVentas();
  })

  if (claim.roles[0] == 'SUPER-ADMINISTRADOR' || claim.roles[0] == 'ADMINISTRADOR')
    getSucursales(claim.company.id)
  else
    getVentas();

  checkRoute();

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

                  <q-icon v-if="dateOne !== ''" name="close" @click="dateOne = '', getVentas()" class="cursor-pointer" />

                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="dateOne" @update:model-value="getVentas">
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

                  <q-icon v-if="dateTwo !== ''" name="close" @click="dateTwo = '', getVentas()" class="cursor-pointer" />

                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="dateTwo" @update:model-value="getVentas">
                        <div class="row items-center justify-end">
                          <q-btn @click="getVentas"
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
              <q-btn
                v-if="$q.screen.width >= 1023 && validarPermisos('crear.venta')"
                @click="$router.push('/proforma/add')"
                outline color="primary" label="Agregar Proforma" class="q-mr-xs"/>

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

            <template v-slot:body-cell-total="props">
              <q-td :props="props"> ${{ props.row.total }} </q-td>
            </template>

            <template v-slot:body-cell-cliente="props">
              <q-td :props="props">{{ props.row.customer_id.nombres }}</q-td>
            </template>

            <template v-slot:body-cell-sucursal="props">
              <q-td :props="props">{{ props.row.sucursal_id.nombre }}</q-td>
            </template>

            <template v-slot:body-cell-usuario="props">
              <q-td :props="props">{{ props.row.user_id.fullName.toUpperCase() }}</q-td>
            </template>

            <template v-slot:body-cell-estado="props">
              <q-td :props="props">
                <q-badge
                  outline class="q-py-xs q-px-md"
                  :color="$q.dark.isActive ? 'blue-grey-3' : 'blue-grey-7'"
                  :label="props.row.estadoSRI" />
              </q-td>
            </template>

            <template v-slot:body-cell-acciones="props">
              <q-td :props="props">

                <q-btn round color="blue-grey" icon="visibility" size="10px"
                class="q-mr-sm" @click="modalDetalle = true, detalleData = { ...props.row }" />

                <q-btn
                  v-if="props.row.estadoSRI == 'PROFORMA'"
                  @click="$router.push(`proforma/add/${ props.row.id }`)"
                  round color="blue-grey"
                  icon="description" size="10px"
                  class="q-mr-sm" />

                <q-btn v-if="props.row.estadoSRI == 'AUTORIZADO'
                              || props.row.estadoSRI == 'PROFORMA'"
                  round color="blue-grey"
                  @click="showModalReenvioComprobantes = true, detalleFactura = props.row"
                  icon="forward_to_inbox" size="11px">
                  <q-tooltip class="bg-indigo" anchor="top middle" self="center middle">
                    Enviar comprobante por email
                  </q-tooltip>
                </q-btn>

                <q-btn
                  round color="blue-grey" class="q-ml-sm"
                  icon="delete" size="10px"
                  @click="eliminarProforma(props.row.id)" />
              </q-td>
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

  <q-dialog v-model="modalDetalle">
    <DetalleCompra :detalleData="detalleData" />
  </q-dialog>

  <q-dialog v-model="showModalReenvioComprobantes">
    <ModalReenviarComprobantes
      @closeModal="showModalReenvioComprobantes = false"
      :detalleFactura="detalleFactura" />
  </q-dialog>

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
