<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import { api } from "boot/axios";
  import useHelpers from "../../../composables/useHelpers";
  import { useProveedor } from "./composables/useProveedor";
  import AddProveedor from './AddProveedor.vue'
  import EditProveedor from './EditProveedor.vue'
  import useRolPermisos from "src/composables/useRolPermisos.js";
  import { useColumnasStore } from "src/stores/tabla-columnas";
  import ModalCargarExcel from "./components/ModalCargarExcel.vue";

  const columns: any = [
    { name: 'razon_social', align: 'center', label: 'Razon Social', field: 'razon_social', sortable: true },
    { name: 'tipo_documento', align: 'center', label: 'Tipo Doc.', field: 'tipo_documento' },
    { name: 'numero_documento', align: 'center', label: 'N° Doc.', field: 'numero_documento' },
    { name: 'email', label: 'Email', field: 'email', align: 'center'},
    { name: 'celular', label: 'Celular', field: 'celular',  align: 'center' },
    { name: 'direccion', label: 'Dirección', field: 'direccion', align: 'center' },
    { name: 'tipo_persona', label: 'Tipo de Persona', field: 'tipo_persona', align: 'center' },
    { name: 'observacion', label: 'Observación', field: 'observacion', align: 'center',
      // Sin min-width la tabla le da un ancho mínimo y cada palabra cae en su
      // propia línea; el max-width del div solo limita, no reserva espacio.
      style: 'min-width: 300px', headerStyle: 'min-width: 300px' },
    { name: 'estado', label: 'Estado', align: 'center', field: 'estado' },
    { name: 'acciones', label: 'acciones', align: 'center', headerClasses: 'sticky-col-acciones', classes: 'sticky-col-acciones' }
  ]

  const filter = ref(''), rows = ref([]);
  const showModalUploadFile = ref( false );
  const { validarPermisos } = useRolPermisos();
  const columnasStore = useColumnasStore();

  // El store guarda las columnas ocultas; la tabla y el select trabajan con las
  // visibles. Se traduce de un lado al otro aquí.
  const columnasVisibles = computed({
    get: () => columns
      .filter(( col: any ) => !columnasStore.hiddenColumnsProveedor.includes( col.name ) )
      .map(( col: any ) => col.name ),
    set: ( visibles: string[] ) => {
      columnasStore.hiddenColumnsProveedor = columns
        .filter(( col: any ) => !visibles.includes( col.name ) )
        .map(( col: any ) => col.name );
    }
  });

  let {
    actualizarLista,
    modalAgregarProveedor,
    modalEditarProveedor,
    formProveedor
  } = useProveedor();

  const loading = ref( false );
  const { claim, mostrarNotify, confirmDelete, isDeleted } = useHelpers();

  const pagination = ref({
    page: 1,
    rowsPerPage: 10,
    rowsNumber: 0
  })

  /**
   * El listado pagina en el servidor: antes traía todos los proveedores de la
   * empresa y la tabla paginaba en memoria.
   */
  const getProveedores = async ( page = pagination.value.page, limit = pagination.value.rowsPerPage ) => {
    loading.value = true;
    try {
      const { data } = await api.get('/providers', {
        params: { page, limit, busqueda: filter.value },
        headers: { 'company-id': claim.company.id }
      });

      rows.value = data.items;

      pagination.value.page        = data.meta.currentPage;
      pagination.value.rowsPerPage = limit;
      pagination.value.rowsNumber  = data.meta.totalItems;

    } catch (error: any) {
      console.log( error );
      mostrarNotify( 'warning', error.response?.data?.message ?? 'No se pudo cargar el listado' )
    }
    loading.value = false;
  }

  const onRequest = ( props: any ) => {
    const { page, rowsPerPage } = props.pagination;
    getProveedores( page, rowsPerPage );
  }

  // Cualquier búsqueda vuelve a la primera página: quedarse en la 5 con un
  // resultado de 2 páginas deja la tabla vacía.
  watch(filter, () => {
    pagination.value.page = 1;
    getProveedores();
  })

  const activarDesactivarProveedor = async (proveedor_id: string, estado: boolean) => {
    try {
      const { data: { msg } } = await api.patch(`/providers/${ proveedor_id }/${ estado }`)
      mostrarNotify('positive', msg );
      getProveedores();
    } catch (error) {
      console.log(error);
    }
  }

  watch(actualizarLista, (currentValue, _) => {
    if ( currentValue ){
      getProveedores();
      actualizarLista.value = false
    }
  });

  watch( isDeleted, ( newValue, _ ) => { if ( newValue ) getProveedores() })
  const eliminarProveedor = async (proveedor_id: string ) => {
    try {
      confirmDelete('Estas seguro de eliminar este proveedor?', `/providers/${ proveedor_id }`);
    } catch (error) {
      console.log(error);
    }
  }

  const downloadFile = () => {
    window.location.href = "/plantillas/proveedores_plantilla.xlsx";
  }

  const exportarProveedores = async () => {
    try {
      const { data } = await api.post(`/providers/download-providers-excel`, { }, {
        headers: { 'company-id': claim.company.id },
        responseType: 'arraybuffer'
      });

      const blob = new Blob([ data ], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const link = document.createElement('a');
      link.href = window.URL.createObjectURL( blob );
      link.download = 'proveedores.xlsx';
      document.body.appendChild( link );
      link.click();
      document.body.removeChild( link );

    } catch (error) {
      mostrarNotify('negative', 'No se pudo exportar el listado de proveedores');
    }
  }

  getProveedores();

</script>

<template>
  <div class="q-ma-lg q-pt-md">
    <div class="row q-col-gutter-lg">
      <div class="col-12">
        <q-card flat class="shadow_custom">
          <q-table title-class="text-grey-7 text-h6" title="Listado de Proveedores"
            :rows="rows" :loading="loading"
            :columns="columns" row-key="name"
            :visible-columns="columnasVisibles"
            v-model:pagination="pagination"
            :rows-per-page-options="[10, 15, 20, 50]"
            binary-state-sort @request="onRequest">

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

            <template v-slot:top-right="props">
              <q-btn v-if="!$q.screen.xs && validarPermisos('crear.proveedor')"
                @click="modalAgregarProveedor = !modalAgregarProveedor"
                outline color="primary" label="Agregar Proveedor" class="q-mr-xs"/>

              <q-btn-dropdown class="q-mr-xs"
                outline color="teal-6" icon="fa-solid fa-file-excel">
                <q-list>
                  <q-item clickable v-close-popup
                    @click="showModalUploadFile = true">
                    <q-item-section>
                      <q-item-label>Importar Excel</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item @click="downloadFile"
                    clickable v-close-popup>
                    <q-item-section>
                      <q-item-label>Exportar Plantilla</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item @click="exportarProveedores"
                    clickable v-close-popup>
                    <q-item-section>
                      <q-item-label>Exportar Proveedores</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-btn-dropdown>

              <q-select
                v-model="columnasVisibles"
                multiple outlined dense options-dense
                display-value="OCULTAR COLUMNAS"
                emit-value map-options
                :options="columns"
                option-value="name"
                class="q-mr-xs"
                style="min-width: 150px"
                menu-anchor="bottom left"
                menu-self="top left" />

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

            <template v-slot:body-cell-observacion="props">
              <q-td :props="props">
                <div v-if="props.row.observacion" class="observacion-celda">
                  {{ props.row.observacion }}
                </div>
                <span v-else class="text-grey-6">-</span>
              </q-td>
            </template>

            <template v-slot:body-cell-estado="props">
              <q-td :props="props">
                <template v-if="props.row.isActive">
                    <q-badge outline color="positive" label="Activo" class="q-pa-sm" />
                </template>
                <template v-else>
                    <q-badge outline color="red" label="Inactivo" class="q-pa-sm" />
                </template>
              </q-td>
            </template>

            <template v-slot:body-cell-acciones="props">
              <q-td :props="props">

                <template v-if="props.row.isActive">
                  <q-btn v-if="validarPermisos('editar.proveedor')"
                    round color="blue-grey"
                    @click="formProveedor = { ...props.row, email: props.row.email ?? '', celular: props.row.celular ?? '', direccion: props.row.direccion ?? '', observacion: props.row.observacion ?? '', tipo_persona: props.row.tipo_persona ?? 'NATURAL' }, modalEditarProveedor = true" icon="edit" class="q-mr-sm" size="10px" />

                  <q-btn round color="blue-grey"
                    v-if="validarPermisos('inactivar.proveedor')"
                    icon="close"
                    @click="activarDesactivarProveedor(props.row.id, false)"
                    size="10px" />
                </template>

                <template v-else>
                  <q-btn round color="blue-grey"
                    v-if="validarPermisos('activar.proveedor')"
                    icon="done"
                    @click="activarDesactivarProveedor(props.row.id, true)"
                    size="10px" />

                  <q-btn round color="blue-grey" class="q-ml-sm"
                  v-if="!props.row.estado && validarPermisos('eliminar.proveedor')"
                  icon="delete"
                  @click="eliminarProveedor(props.row.id)"
                  size="10px" />
                </template>
              </q-td>
            </template>

            <template v-slot:no-data="{ icon }">
              <div class="full-width row flex-center text-lime-10 q-gutter-sm">
                <span class="text-subtitle1">
                  No se encontró ningun Resultado
                </span>
              </div>
            </template>
          </q-table>
        </q-card>
      </div>
    </div>
  </div>

    <q-page-sticky position="bottom-right" :offset="[18, 18]"
        v-if="$q.screen.xs && validarPermisos('crear.proveedor')">
      <q-btn round color="secondary" size="lg" icon="add" @click="modalAgregarProveedor = !modalAgregarProveedor" />
    </q-page-sticky>

    <q-dialog v-model="modalAgregarProveedor">
      <AddProveedor />
    </q-dialog>

    <q-dialog v-model="modalEditarProveedor">
      <EditProveedor />
    </q-dialog>

    <q-dialog v-model="showModalUploadFile">
      <ModalCargarExcel @actualizarDatos="getProveedores" />
    </q-dialog>

  </template>

<style scoped>
/* La observación puede tener hasta 300 caracteres: en vez de recortarla, se
   limita el ancho y el texto sigue en la siguiente línea. La fila crece sola. */
.observacion-celda {
  max-width: 320px;
  margin: 0 auto;
  white-space: normal;
  word-break: break-word;
  line-height: 1.35;
  text-align: left;
}
</style>
