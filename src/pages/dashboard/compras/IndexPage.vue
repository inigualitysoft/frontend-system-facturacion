<script setup lang="ts">
  import { ref, watch } from 'vue'
  import useRolPermisos from "../../../composables/useRolPermisos";
  import useHelpers from "../../../composables/useHelpers";
  import { useQuasar, date } from 'quasar';
  import DetalleCompra from '../../../components/DetalleProducts.vue'
  // import FiltrarCompras from './FiltrarCompras.vue'

  const columns: any = [
    { name: 'sucursal', label: 'Sucursal', align: 'center', field: 'sucursal_name' },
    { name: 'num_comprobante', label: 'Num Comprobante', field: 'numero_comprobante', align: 'center' },
    { name: 'usuario', label: 'Usuario', align: 'center', field: 'user_name' },
    { name: 'proveedor', label: 'Proveedor', align: 'center', field: 'proveedor_name' },
    { name: 'fecha', label: 'Fecha Compra', align: 'center', field: 'fecha_compra' },
    { name: 'total', label: 'Total', field: 'total', align: 'center' },
    { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
    { name: 'acciones', label: 'acciones', align: 'center', headerClasses: 'sticky-col-acciones', classes: 'sticky-col-acciones' }
  ]

  const rows = ref([]);
  const modalDetalle = ref(false);
  let detalleData = ref({});
  const dateOne = ref('');
  const tipo = ref('TODOS');

  const formFiltrarCompras = ref({ desde: '', hasta: '', pv_id: '' })

  const filter = ref('');
  const { validarPermisos } = useRolPermisos();
  const { api, claim, mostrarNotify, route } = useHelpers();
  const $q = useQuasar();
  const loading = ref( false )

  const selectSucursal = ref('');
  const listSucursales = ref<{}[]>([]);

  // Se declara antes de getCompras: el método la usa como valor por defecto de
  // sus parámetros y se llama al montar la página.
  const pagination = ref({
    page: 1,
    rowsPerPage: 10,
    rowsNumber: 0
  })

  // Cualquier cambio de filtro vuelve a la primera página: quedarse en la 5 con
  // un resultado de 2 páginas deja la tabla vacía.
  watch(tipo, () => { pagination.value.page = 1; getCompras(); });

  const checkRoute = () => {
    const { fecha } = route.params;

    // El parámetro llegaba como "desde - hasta"; ahora el filtro es de un día,
    // así que se toma el primero.
    if ( fecha ) dateOne.value = String( fecha ).split(' - ')[0].replace(/-/g, "/");
  }

  /**
   * El listado pagina en el servidor: antes se traía todas las compras de la
   * sucursal y la tabla paginaba en memoria.
   */
  const getCompras = async ( page = pagination.value.page, limit = pagination.value.rowsPerPage ) => {
    try {
      loading.value = true;

      if ( listSucursales.value.length == 0 ) await getSucursales();

      const { data } = await api.get('/buys', {
        params: { page, limit, busqueda: filter.value },
        headers: {
          'company-id': claim.company.id,
          'sucursal-id': selectSucursal.value,
          desde: dateOne.value,
          hasta: '',
          tipo: tipo.value
        }
      });

      data.items.map( (compra: any) => {
        compra.fecha_compra = date.formatDate(compra.created_at, 'DD/MM/YYYY');
        compra.sucursal_name = compra.sucursal_id.nombre;
        compra.proveedor_name = compra.proveedor_id.razon_social;
        compra.user_name = compra.user_id.fullName;
        compra.total = `${ compra.total }`;
      })

      rows.value = data.items;

      pagination.value.page        = data.meta.currentPage;
      pagination.value.rowsPerPage = limit;
      pagination.value.rowsNumber  = data.meta.totalItems;

    } catch (error) {
      console.log(error)
    } finally {
      loading.value = false;
    }
  }

  const onRequest = ( props: any ) => {
    const { page, rowsPerPage } = props.pagination;
    getCompras( page, rowsPerPage );
  }

  const anularCompra = ( compra: any ) => {
    $q.dialog({
      title: '<center>¿Estas seguro de anular esta compra?</center>',
      message: `<span><strong>Num Comprobante</strong>: ${ compra.numero_comprobante }</span> <br>
              <span class='q-my-lg'><strong>Proveedor</strong>: ${ compra.proveedor_name }</span> <br>
              <span class='q-my-lg'><strong>Fecha/Hora</strong>: ${ compra.fecha_compra }</span> <br>
              <span><strong>Total</strong>: ${ compra.total }</span> <br>`,
      html: true,
      ok: { push: true, label:'Anular', color: 'teal-7' },
      cancel: { push: true, color: 'blue-grey-8', label: 'Cancelar' }
    }).onOk(async () => {
      try {
        $q.loading.show({ message: 'Cargando...'})
        await api.delete(`/buys/${ compra.id }`);
        mostrarNotify('positive', 'Compra Anulada exitosamente');
        getCompras();
        $q.loading.hide()
      }catch (error){
        console.log(error);
      }
    })
  }

  const actualizarLista = ( data: any ) => {
    rows.value = data.compras;
    data.compras.map( (compra: any) => {

        const dateArray = compra.fecha_compra.split('T')[0].split('-');
        const timeArray = compra.hora_compra.split(':');
        compra.fecha = `${ dateArray[2] }/${ dateArray[1] }/${ dateArray[0] }  ${ timeArray[0] }:${ timeArray[1] } ${ (timeArray[0] < 12 ) ? 'am' : 'pm' }`
    })
  }

  const getSucursales = async () => {
    loading.value = true;
    try {
      const { data } = await api.get(`/sucursal/find/${ claim.company.id }/company`);

      data.forEach((companie: any) => {
        listSucursales.value.push({
          label:  companie.nombre,
          value:  companie.id
        })
      });

      if (claim.roles[0] == 'SUPER-ADMINISTRADOR' || claim.roles[0] == 'ADMINISTRADOR')
        listSucursales.value.unshift({ label: 'TODOS', value: null });

      if ( listSucursales.value.length !== 0 ) selectSucursal.value = listSucursales.value[0].value

    } catch (error: any) {
      mostrarNotify( 'warning', error.response.data.message )
    }
    loading.value = false;
  }

  checkRoute();
  getCompras();

  watch(filter, () => {
    pagination.value.page = 1;
    getCompras();
  })
</script>
<template>
  <div class="q-ma-lg q-pt-md">
    <div class="row q-col-gutter-lg">

      <div class="col-12 q-mt-sm">
        <q-card flat class="shadow_custom">
          <q-table title-class="text-grey-7 text-h6"
            :rows="rows" :loading="loading"
            :columns="columns" row-key="name"
            v-model:pagination="pagination"
            :rows-per-page-options="[10, 15, 20, 50]"
            binary-state-sort @request="onRequest">

            <template v-slot:loading>
              <q-inner-loading showing color="primary" />
            </template>

            <template v-slot:header="props">
              <q-tr :props="props" style="height: 60px">
                <q-th v-for="col in props.cols"
                  :key="col.name" :props="props"
                  class="text-grey-7 text-weight-bold text-uppercase" style="font-size: 13px">
                  {{ col.label }}
                </q-th>
              </q-tr>
            </template>

            <template v-slot:top-left="props">
              <div v-if="claim.roles[0] !== 'SUPER-ADMINISTRADOR' && claim.roles[0] !== 'ADMINISTRADOR'"
                class="text-center row justify-center" style="width: 100%;">
                <label class="q-mb-sm text-grey-7 text-h6">
                  Listado de Compras
                </label>
              </div>

              <div style="display: flex;"
                :style="!$q.screen.xs || 'width: 100%;justify-content: center;position: relative;right: 8px;'"
                :class="[ $q.screen.xs ? 'q-mb-md' : '' ]">
                <label class="q-mr-sm row items-center">
                  <span>Tipo: </span>
                </label>
                <q-select outlined dense v-model="tipo"
                emit-value map-options
                :options="[
                    { label: 'Todos', value: 'TODOS' },
                    { label: 'Aceptados', value: 'Aceptados' },
                    { label: 'Anulados', value: 'Anulados' },
                  ]">
                </q-select>
              </div>

              <div style="display: flex" :class="[ $q.screen.xs ? 'q-mb-md' : '' ]">
                <label class="q-mx-sm row items-center">
                  <span>Fecha: </span>
                </label>
                <q-input outlined dense v-model="dateOne" mask="date" readonly
                  input-class="cursor-pointer" style="min-width: 150px">
                  <template v-slot:append>
                    <q-icon v-if="dateOne !== ''" name="close" class="cursor-pointer"
                      @click.stop="dateOne = '', pagination.page = 1, getCompras()" />

                    <q-icon name="event" class="cursor-pointer" />
                  </template>

                  <q-popup-proxy transition-show="scale" transition-hide="scale">
                    <q-date v-model="dateOne"
                      @update:model-value="pagination.page = 1, getCompras()">
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="Cerrar" color="primary" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-input>
              </div>

              <div v-if="claim.roles[0] == 'SUPER-ADMINISTRADOR' || claim.roles[0] == 'ADMINISTRADOR'"
              style="display: flex" :class="[ $q.screen.xs ? 'q-mb-md' : '' ]">
                <label class="q-mx-sm row items-center">
                  <span>Sucursal: </span>
                </label>
                <q-select outlined dense v-model="selectSucursal"
                  @update:model-value="pagination.page = 1, getCompras()"
                  emit-value map-options
                :options="listSucursales">
                </q-select>
              </div>
            </template>

            <template v-slot:top-right="props">
              <q-btn v-if="!$q.screen.xs && validarPermisos('crear.compra')"
                @click="$router.push('/compras/add')"
                outline color="primary" label="Agregar Compra" class="q-mr-xs"/>

              <q-input :style="$q.screen.width > 700 || 'width: 70%'"
                outlined dense debounce="300" v-model="filter" placeholder="Buscar...">
                <template v-slot:append>
                  <q-icon name="search"/>
                </template>
              </q-input>

              <q-btn flat round dense
                :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"
                @click="props.toggleFullscreen" >
                <q-tooltip :disable="$q.platform.is.mobile" v-close-popup anchor="top middle" self="bottom middle">
                  {{ props.inFullscreen ? 'Exit Fullscreen' : 'Toggle Fullscreen' }}
                </q-tooltip>
              </q-btn>

            </template>

            <template v-slot:body-cell-estado="props">
              <q-td :props="props">
                <q-badge outline class="q-py-xs q-px-md"
                    :color="( props.row.isActive ) ? 'secondary' : 'negative'"
                    :label=" props.row.isActive ? 'Aceptado' : 'Anulado'" />
              </q-td>
            </template>

            <template v-slot:body-cell-acciones="props">
              <q-td :props="props">
                <q-btn round color="blue-grey"
                  icon="visibility" class="q-mr-sm"
                  @click="modalDetalle = true, detalleData = { ...props.row }"
                  size="10px" />

                <q-btn round color="blue-grey"
                  v-if="props.row.isActive && validarPermisos('anular.compra')"
                  @click="anularCompra( props.row )"
                  icon="close" size="10px" />
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
      v-if="$q.screen.xs && validarPermisos('crear.compra')">
    <q-btn round color="secondary" size="lg"
        icon="add" @click="$router.push('/compras/add')" />
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
