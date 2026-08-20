<script setup>
  import { ref, watch, onMounted } from 'vue';
  import { useQuasar } from 'quasar';
  import { useIngresoEgreso } from './composables/useIngresoEgreso';
  import ResumenCards from './components/ResumenCards.vue';
  import FormIngresoEgreso from './components/FormIngresoEgreso.vue';
  import EstadisticasAnuales from './components/EstadisticasAnuales.vue';

  const {
    api,
    cabecera,
    filtros,
    filtrosActivos,
    modalFormIE,
    cambios,
    listProveedores,
    listSucursales,
    listUsuarios,
    abrirFormulario,
    cargarCatalogos,
    eliminar,
    descargarExcel
  } = useIngresoEgreso();

  const $q = useQuasar();

  const columns = [
    { name: 'tipo', label: 'TIPO', align: 'center', field: 'tipo' },
    { name: 'fecha', label: 'FECHA', align: 'center', field: 'fecha' },
    { name: 'referencia', label: 'REFERENCIA', align: 'left', field: 'referencia',
      style: 'max-width: 260px; white-space: normal; word-break: break-word;' },
    { name: 'proveedor', label: 'PROVEEDOR', align: 'left' },
    { name: 'sucursal', label: 'SUCURSAL', align: 'left' },
    { name: 'forma_pago', label: 'FORMA DE PAGO', align: 'center', field: 'forma_pago' },
    { name: 'descripcion', label: 'DESCRIPCIÓN', align: 'left', field: 'descripcion',
      style: 'max-width: 260px; white-space: normal; word-break: break-word;' },
    { name: 'operador', label: 'OPERADOR', align: 'left' },
    { name: 'monto', label: 'MONTO', align: 'right' },
    { name: 'acciones', label: 'ACCIONES', align: 'center',
      headerClasses: 'sticky-col-acciones', classes: 'sticky-col-acciones' }
  ];

  const rows    = ref([]);
  const loading = ref( false );
  const resumen = ref({
    totalIngresos: 0, totalEgresos: 0,
    totalIngresosHoy: 0, totalEgresosHoy: 0,
    balance: 0, balanceHoy: 0
  });

  const estadisticasRef = ref( null );

  const pagination = ref({
    sortBy: 'fecha',
    descending: true,
    page: 1,
    rowsPerPage: 10,
    rowsNumber: 0
  });

  const tiposFiltro = [
    { label: 'Todos',   value: '' },
    { label: 'Ingreso', value: 'ingreso' },
    { label: 'Egreso',  value: 'egreso' }
  ];

  const getMovimientos = async (
    page = pagination.value.page,
    limit = pagination.value.rowsPerPage
  ) => {
    loading.value = true;
    try {
      const { data } = await api.get('/ingresos-egresos', {
        ...cabecera.value,
        params: { page, limit, ...filtrosActivos() }
      });

      rows.value = data.items;
      pagination.value.page        = data.meta.currentPage;
      pagination.value.rowsPerPage = limit;
      pagination.value.rowsNumber  = data.meta.totalItems;
    } catch (error) {
      console.log( error );
    } finally {
      loading.value = false;
    }
  }

  const getResumen = async () => {
    try {
      const { data } = await api.get('/ingresos-egresos/resumen', {
        ...cabecera.value,
        params: filtrosActivos()
      });

      resumen.value = data;
    } catch (error) {
      console.log( error );
    }
  }

  const onRequest = ( props ) => {
    const { page, rowsPerPage } = props.pagination;
    getMovimientos( page, rowsPerPage );
  }

  /** Cualquier cambio de filtro vuelve a la primera página: la actual puede no existir. */
  const aplicarFiltros = () => {
    pagination.value.page = 1;
    getMovimientos();
    getResumen();
  }

  const refrescar = () => {
    aplicarFiltros();
    estadisticasRef.value?.cargar();
  }

  // Un guardado o un borrado, venga de donde venga, recarga tabla, tarjetas y
  // estadísticas. No depende de que el diálogo siga montado para avisar.
  watch( cambios, refrescar );

  const confirmarEliminar = ( movimiento ) => {
    $q.dialog({
      title: '¿Eliminar el movimiento?',
      message: `${ movimiento.referencia } — $ ${ movimiento.monto }`,
      ok:     { push: true, label: 'Eliminar', color: 'negative' },
      cancel: { push: true, label: 'Cancelar', color: 'blue-grey-8' }
    }).onOk(() => eliminar( movimiento.id ));
  }

  onMounted( async () => {
    await cargarCatalogos();
    getMovimientos();
    getResumen();
  });
</script>

<template>
  <div class="q-ma-lg q-pt-md">

    <ResumenCards :resumen="resumen" />

    <q-card flat class="shadow_custom">
      <q-table
        class="table-ingresos-egresos"
        title-class="text-grey-7 text-h6"
        title="Ingresos / Egresos"
        :rows="rows"
        :columns="columns"
        row-key="id"
        :loading="loading"
        v-model:pagination="pagination"
        :rows-per-page-options="[10, 25, 50, 100]"
        binary-state-sort
        @request="onRequest">

        <template v-slot:top-right>
          <div class="row q-gutter-sm items-center">
            <q-btn color="primary" outline no-caps icon="add" label="Nuevo registro"
              @click="abrirFormulario()" />

            <q-btn color="teal-7" outline no-caps icon="download" label="Reporte"
              @click="descargarExcel" />

            <q-input dense outlined debounce="400" v-model="filtros.busqueda"
              placeholder="Buscar..." @update:model-value="aplicarFiltros">
              <template v-slot:append><q-icon name="search" /></template>
            </q-input>
          </div>
        </template>

        <template v-slot:top-row>
          <q-tr>
            <q-td colspan="100%">
              <div class="row q-col-gutter-sm items-center q-mt-sm">

                <div class="col-6 col-md-2">
                  <q-select outlined dense label="Tipo" v-model="filtros.tipo"
                    :options="tiposFiltro" emit-value map-options
                    @update:model-value="aplicarFiltros" />
                </div>

                <div class="col-6 col-md-2">
                  <q-select outlined dense label="Sucursal" v-model="filtros.sucursal_id"
                    :options="listSucursales" emit-value map-options clearable
                    @update:model-value="aplicarFiltros" />
                </div>

                <div class="col-6 col-md-2">
                  <q-select outlined dense label="Proveedor" v-model="filtros.proveedor_id"
                    :options="listProveedores" emit-value map-options clearable
                    @update:model-value="aplicarFiltros" />
                </div>

                <div class="col-6 col-md-2">
                  <q-select outlined dense label="Operador" v-model="filtros.user_id"
                    :options="listUsuarios" emit-value map-options clearable
                    @update:model-value="aplicarFiltros" />
                </div>

                <div class="col-6 col-md-2">
                  <q-input outlined dense label="Desde" v-model="filtros.fechaDesde"
                    mask="####-##-##" @update:model-value="aplicarFiltros">
                    <template v-slot:append><q-icon name="event" class="cursor-pointer" /></template>
                    <q-popup-proxy transition-show="scale" transition-hide="scale">
                      <q-date v-model="filtros.fechaDesde" mask="YYYY-MM-DD" minimal
                        @update:model-value="aplicarFiltros">
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="Cerrar" color="primary" flat />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-input>
                </div>

                <div class="col-6 col-md-2">
                  <q-input outlined dense label="Hasta" v-model="filtros.fechaHasta"
                    mask="####-##-##" @update:model-value="aplicarFiltros">
                    <template v-slot:append><q-icon name="event" class="cursor-pointer" /></template>
                    <q-popup-proxy transition-show="scale" transition-hide="scale">
                      <q-date v-model="filtros.fechaHasta" mask="YYYY-MM-DD" minimal
                        @update:model-value="aplicarFiltros">
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="Cerrar" color="primary" flat />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-input>
                </div>

              </div>
            </q-td>
          </q-tr>
        </template>

        <template v-slot:body-cell-tipo="props">
          <q-td :props="props" class="text-center">
            <q-chip dense square text-color="white"
              :color="props.row.tipo === 'ingreso' ? 'teal-7' : 'orange-8'"
              :icon="props.row.tipo === 'ingreso' ? 'trending_up' : 'trending_down'">
              {{ props.row.tipo === 'ingreso' ? 'Ingreso' : 'Egreso' }}
            </q-chip>
          </q-td>
        </template>

        <template v-slot:body-cell-proveedor="props">
          <q-td :props="props">{{ props.row.proveedor_id?.razon_social ?? '---' }}</q-td>
        </template>

        <template v-slot:body-cell-sucursal="props">
          <q-td :props="props">{{ props.row.sucursal_id?.nombre ?? '---' }}</q-td>
        </template>

        <template v-slot:body-cell-operador="props">
          <q-td :props="props">{{ props.row.user_id?.fullName ?? '---' }}</q-td>
        </template>

        <template v-slot:body-cell-monto="props">
          <q-td :props="props" class="text-right text-weight-bold"
            :class="props.row.tipo === 'ingreso' ? 'text-teal-8' : 'text-orange-9'">
            {{ props.row.tipo === 'ingreso' ? '+' : '−' }} {{ Number( props.row.monto ).toFixed(2) }}
          </q-td>
        </template>

        <template v-slot:body-cell-acciones="props">
          <q-td :props="props">
            <q-btn round color="blue-grey" icon="edit" size="10px" class="q-mr-sm"
              @click="abrirFormulario( props.row )">
              <q-tooltip anchor="top middle" self="bottom middle">Editar</q-tooltip>
            </q-btn>

            <q-btn round color="red-6" icon="delete" size="10px"
              @click="confirmarEliminar( props.row )">
              <q-tooltip anchor="top middle" self="bottom middle">Eliminar</q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <template v-slot:no-data>
          <div class="full-width row flex-center text-blue-grey q-gutter-sm q-py-md">
            <q-icon size="2em" name="sentiment_dissatisfied" />
            <span>No se encontró ningún resultado</span>
          </div>
        </template>

      </q-table>
    </q-card>

    <EstadisticasAnuales ref="estadisticasRef" />

    <q-dialog v-model="modalFormIE">
      <FormIngresoEgreso />
    </q-dialog>

  </div>
</template>
