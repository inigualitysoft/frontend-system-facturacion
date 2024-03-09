<script setup lang="ts">
  import { Manager, Socket } from "socket.io-client";
  import { ref, watch } from 'vue'
  import useRolPermisos from "../../../composables/useRolPermisos";
  import useHelpers from "../../../composables/useHelpers";
  import { date, useQuasar } from 'quasar'
  import DetalleCompra from '../../../components/DetalleProducts.vue'
  import FiltrarVentas from './FiltrarVentas.vue'

  /* --------------------- IMPLEMENTACION DE WEBSOCKET ---------------------- */
  let socket: Socket;

  const { api, claim } = useHelpers();

  const connectToServer = ( token?: string ) => {
    const manager = new Manager(`${ import.meta.env.VITE_BASE_URL }/socket.io/socket.io.js`, {
      extraHeaders: {
        autentication: claim.id
      }
    });

    socket?.removeAllListeners();
    socket = manager.socket('/'); //conectarme algun namespace

    socket.on('updateStateInvoice', () => {
      getVentas();
    })
  }
  // ---------------------------------------------------------------------------
  
  const columns: any = [
    { name: 'acciones', label: 'acciones', align: 'center' },
    { name: 'sucursal', label: 'Sucursal', align: 'center' },
    { name: 'num_comprobante', label: 'Num. Comprobante', field: 'numero_comprobante', align: 'center' },
    { name: 'usuario', label: 'Usuario', align: 'center' },
    { name: 'cliente', label: 'Cliente', align: 'center' },
    { name: 'f/h', label: 'Fecha/Hora', align: 'center', field: 'created_at' },
    { name: 'total', label: 'Total', name: 'total', align: 'center' },
    { name: 'estado', label: 'Estado', field: 'estado', align: 'center' }
  ]
  
  const rows = ref([]);
  const modalDetalle = ref(false);
  const consumidor_final_id = import.meta.env.VITE_CONSUMIDOR_FINAL_ID;

  const formFiltrarVentas = ref({ desde: '', hasta: '', pv_id: '' })

  const tipoComprobantes = ref('Todos');
  const filter = ref('');
  const detalleData = ref({})
  const sucursales = ref([]);
  const sucursal_selected = ref([]);
  const { validarPermisos } = useRolPermisos();
  
  const $q = useQuasar();
  const loading = ref( false )

  watch(tipoComprobantes, (currentValue, _) => { getVentas(); });

  const getVentas = async () => {
    try {
      loading.value = true;  
      let headers = { headers: { 
        tipo: tipoComprobantes.value,
        sucursal_id: sucursal_selected.value 
      }};
      const { data } = await api.get('/invoices', headers);

      data.map( (venta: any) => venta.created_at = date.formatDate(venta.created_at, 'DD/MM/YYYY HH:mm a') );

      rows.value = data;
      loading.value = false;
    } catch (error) {
      console.log(error)
      loading.value = false;
    }
  }
  
  const anularFactura = ( venta: any ) => {
    $q.dialog({
      title: '<center>¿Estas seguro de anular esta factura?</center>',
      message: `<span style="display: block;width: 100%;display: flex;align-items: center;">
                  <strong style="display: inline-block;width: 40%;text-align: end;">
                    Num Comprobante:
                  </strong> 
                  <label style="display: inline-block;width: 57%;" class="q-ml-xs">
                    ${ venta.numero_comprobante }
                  </label>
                </span>
              <span class='q-my-xs' style="display: block;width: 100%;display: flex;align-items: center;">
                <strong style="display: inline-block;width: 40%;text-align: end;">
                  Cliente:
                </strong> 
                <label style="display: inline-block;width: 57%;" class="q-ml-xs">
                  ${ venta.customer_id.nombres }
                </label>
              </span>
              <span class='q-my-xs' style="display: block;width: 100%;display: flex;align-items: center;">
                <strong style="display: inline-block;width: 40%;text-align: end;">
                  Fecha/Hora:
                </strong> 
                <label style="display: inline-block;width: 57%;" class="q-ml-xs">
                  ${ venta.created_at }
                </label>
              </span>
              <span style="display: block;width: 100%;display: flex;align-items: center;">
                <strong style="display: inline-block;width: 40%;text-align: end;">
                  Total:
                </strong> 
                <label style="display: inline-block;width: 57%;" class="q-ml-xs">
                  $${ venta.total }
                </label>                
              </span>`,
      html: true,
      ok: { push: true, label:'Anular', color: 'teal-7' },
      cancel: { push: true, color: 'blue-grey-8', label: 'Cancelar' }
    }).onOk(async () => {
      try {
        $q.loading.show({ message: 'Cargando, por favor espere...'})
        await api.post(`/CE/facturas/anularFactura`, { factura: venta });
        $q.loading.hide()
      }catch (error){
        console.log(error);
      }
    })
  }

  const actualizarLista = ( data: any ) => {
    rows.value = data.compras;
    data.compras.map( (compra) => {
      const dateArray = compra.fecha_compra.split('T')[0].split('-');
      const timeArray = compra.hora_compra.split(':');
      compra.fecha = `${ dateArray[2] }/${ dateArray[1] }/${ dateArray[0] }  ${ timeArray[0] }:${ timeArray[1] } ${ (timeArray[0] < 12 ) ? 'am' : 'pm' }`
    })
  }

  watch(sucursal_selected, (newValue, oldValue) => {
    getVentas();
  })
  const getSucursales = async( company_id: string ) => {
    sucursales.value = [];

    const { data } = await api.get(`/sucursal/find/${ company_id }/company`);

    data.forEach(( x: any) => {
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
  
  const mode = ref("list");
  const pagination = ref({
    rowsPerPage: 10
  })
     
</script>
<template>
  <div class="q-ma-lg q-pt-md">
    <div class="row q-col-gutter-lg">
      <div class="col-12">
        <q-card flat class="shadow_custom">
          <q-table title-class="text-grey-7 text-h6" :rows="rows" 
            :loading="loading" :hide-header="mode === 'grid'"
            :columns="columns" row-key="name" :grid="mode==='grid'"
            :filter="filter" :pagination.sync="pagination" >
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
                      { label: 'PROFORMAS', value: 'PROFORMA' }, 
                      { label: 'TODOS', value: 'TODOS' },
                      { label: 'FACTURAS', value: 'FACTURAS' },
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
                @click="$router.push('/ventas/add')" 
                outline color="primary" label="Agregar Venta" class="q-mr-xs"/>

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
              <q-td :props="props">{{ props.row.user_id.fullName }}</q-td>
            </template>

            <template v-slot:body-cell-estado="props">
              <q-td :props="props">
                <q-badge v-if="props.row.estadoSRI == 'NO AUTORIZADO' || props.row.estadoSRI.trim() == 'DEVUELTA'" 
                  outline class="q-py-xs q-px-md" :color="$q.dark.isActive ? 'warning' : 'orange-10'" 
                  :label="props.row.estadoSRI">
                  <q-tooltip anchor="center left" self="center right" :offset="[10, 10]" class="blue-grey-9 text-subtitle2">
                    {{ props.row.respuestaSRI }}
                  </q-tooltip>
                </q-badge>

                <q-badge v-else-if="props.row.estadoSRI == 'AUTORIZADO'"
                  outline class="q-py-xs q-px-md" color="secondary" :label="props.row.estadoSRI" />

                <q-badge  v-else-if="props.row.estadoSRI == 'PROFORMA'" outline class="q-py-xs q-px-md"
                :color="$q.dark.isActive ? 'blue-grey-3' : 'blue-grey-7'" :label="props.row.estadoSRI" />

                <q-badge  v-else-if="props.row.estadoSRI == 'ANULADO'" outline class="q-py-xs q-px-md"
                    color="red-4" :label="props.row.estadoSRI" />

                <q-badge v-else outline class="q-py-xs q-px-md" :color="$q.dark.isActive ? 'blue-grey-3' : 'blue-grey-7'" 
                  :label="props.row.estadoSRI">
                  <q-tooltip anchor="center left" self="center right" :offset="[10, 10]" class="blue-grey-9 text-subtitle2">
                    {{ props.row.respuestaSRI }}
                  </q-tooltip>
                </q-badge>
                
              </q-td>
            </template>

            <template v-slot:body-cell-acciones="props">
              <q-td :props="props">
                <q-btn round color="blue-grey" icon="visibility" size="10px"
                class="q-mr-sm" @click="modalDetalle = true, detalleData = { ...props.row }" />

                <q-btn v-if="props.row.estadoSRI == 'PROFORMA' || props.row.estadoSRI.trim() == 'ERROR ENVIO RECEPCION' || props.row.estadoSRI.trim() == 'ERROR ENVIO RECEPCION - ANULACION' || props.row.estadoSRI.trim() == 'PENDIENTE'"
                  @click="$router.push(`ventas/add/${ props.row.id }`)"
                  round color="blue-grey" icon="description" size="10px" class="q-mr-sm" />

                <q-btn round color="blue-grey"
                  v-if="props.row.customer_id.nombres !== 'CONSUMIDOR FINAL' && (props.row.estadoSRI == 'AUTORIZADO' || props.row.respuestaSRI?.includes('ERROR SECUENCIAL REGISTRADO')) && validarPermisos('anular.venta')"
                  @click="anularFactura( props.row )"
                  icon="close" size="10px" />
              </q-td>
            </template>

            <template v-slot:no-data="{ icon }">
              <div class="full-width row flex-center text-lime-10 q-gutter-sm">
                <q-icon size="2em" name="sentiment_dissatisfied" />
                <span class="text-subtitle1">
                  No se encontró ningun resultado
                </span>
                <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
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
    