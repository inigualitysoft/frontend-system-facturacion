<script setup>
    import { ref, watch } from 'vue'
    import { api } from "boot/axios";
    import useRolPermisos from "../../../composables/useRolPermisos";
    import useHelpers from "../../../composables/useHelpers";
    import { date, useQuasar } from 'quasar'
    import DetalleCompra from '../../../components/DetalleProducts.vue'
    import FiltrarVentas from './FiltrarVentas.vue'
    import { useAuthUserStore } from "stores/auth-user"
    
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
    
    const rows = ref([]);
    const modalDetalle = ref(false);
  
    const formFiltrarVentas = ref({ desde: '', hasta: '', pv_id: '' })
  
    const filter = ref('');
    const detalleData = ref({})
    const { validarPermisos } = useRolPermisos();
    const { mostrarNotify } = useHelpers();
    const $q = useQuasar();
    const authUserStore = useAuthUserStore();
    const loading = ref( false )
  
    const getVentas = async () => {
      try {
        loading.value = true;  
        const { data } = await api.get('/invoices');

        data.map( (venta) => venta.created_at = date.formatDate(venta.created_at, 'DD/MM/YYYY HH:mm a') );

        rows.value = data;
        loading.value = false;
      } catch (error) {
        console.log(error)
        loading.value = false;
      }
    }
    
    const anularFactura = ( compra ) => {
      $q.dialog({
        title: '<center>¿Estas Seguro de anular esta compra?</center>',
        message: `<span><strong>Num Comprobante</strong>: ${ compra.num_comprobante }</span> <br>
                <span class='q-my-lg'><strong>Proveedor</strong>: ${ compra.proveedor }</span> <br>
                <span class='q-my-lg'><strong>Fecha/Hora</strong>: ${ compra.fecha }</span> <br>
                <span><strong>Total</strong>: $${ compra.total.toFixed(2) }</span> <br>`,
        html: true,
        ok: { push: true, label:'Anular', color: 'teal-7' },
        cancel: { push: true, color: 'blue-grey-8', label: 'Cancelar' }
      }).onOk(async () => {
        try {
          $q.loading.show({ message: 'Cargando...'})
          await api.put(`/compras/${ compra.id }`);
          mostrarNotify('positive', 'Factura Anulada exitosamente');
          getVentas();
          $q.loading.hide()
        }catch (error){
          console.log(error);
        }
      })
    }
  
    const actualizarLista = ( data ) => {
      rows.value = data.compras;
      data.compras.map( (compra) => {
        const dateArray = compra.fecha_compra.split('T')[0].split('-');
        const timeArray = compra.hora_compra.split(':');
        compra.fecha = `${ dateArray[2] }/${ dateArray[1] }/${ dateArray[0] }  ${ timeArray[0] }:${ timeArray[1] } ${ (timeArray[0] < 12 ) ? 'am' : 'pm' }`
      })
    }
    
    getVentas();
  
    watch(filter, (newValue, oldValue) => {
      getVentas();
    })

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
          <q-table title-class="text-grey-7 text-h6" title="Listado de Ventas"
            :rows="rows" :loading="loading" :hide-header="mode === 'grid'"
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

            <template v-slot:top-right="props">
              <q-btn v-if="!$q.screen.xs"
                @click="$router.push('/ventas/add')" 
                outline color="primary" label="Agregar Venta" class="q-mr-xs"/>

              <q-input outlined dense debounce="300" v-model="filter" placeholder="Buscar...">
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
                <q-badge outline class="q-py-xs q-px-md"
                    :color="( props.row.estadoSRI == 'NO AUTORIZADO' || props.row.estadoSRI == 'DEVUELTA' ) 
                      ? 'negative' : 'secondary'"
                    :label="props.row.estadoSRI" />
              </q-td>
            </template>

            <template v-slot:body-cell-acciones="props">
              <q-td :props="props">
                <q-btn round color="blue-grey" icon="visibility" size="10px"
                class="q-mr-sm" @click="modalDetalle = true, detalleData = { ...props.row }" />

                <q-btn round color="blue-grey"
                  v-if="props.row.isActive"
                  @click="anularFactura( props.row )"
                  icon="close"
                  size="10px" />
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
      v-if="$q.screen.xs">
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
    