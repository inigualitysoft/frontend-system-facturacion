<script setup lang="ts">
  import { ref, watch } from 'vue';
  import { api } from "boot/axios";
  import useHelpers from "../../../composables/useHelpers";
  import { useProveedor } from "./composables/useProveedor";
  import AddProveedor from './AddProveedor.vue'
  import EditProveedor from './EditProveedor.vue'
  import useRolPermisos from "src/composables/useRolPermisos.js";

  const columns: any = [
    { name: 'acciones', label: 'acciones', align: 'center' },
    { name: 'razon_social', align: 'center', label: 'Razon Social', field: 'razon_social', sortable: true },
    { name: 'tipo_documento', align: 'center', label: 'Tipo de Documento', field: 'tipo_documento' },
    { name: 'numero_documento', align: 'center', label: 'Numero de Documento', field: 'numero_documento' },
    { name: 'email', label: 'Email', field: 'email', align: 'center'},
    { name: 'celular', label: 'Celular', field: 'celular',  align: 'center' },
    { name: 'estado', label: 'Estado', align: 'center', field: 'estado' },
  ]

  const filter = ref(''), rows = ref([]);
  const { validarPermisos } = useRolPermisos();

  let {
    actualizarLista,
    modalAgregarProveedor,
    modalEditarProveedor,
    formProveedor
  } = useProveedor();

  const loading = ref( false );
  const { mostrarNotify, confirmDelete, isDeleted } = useHelpers();

  const getProveedores = async () => {
    loading.value = true;
    try {
      const { data } = await api.get('/providers');
      rows.value = data;
    } catch (error: any) {
      console.log( error );
      mostrarNotify( 'warning', error.response.data.message )
    }
    loading.value = false;
  }

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

  getProveedores();

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
          <q-table title-class="text-grey-7 text-h6" title="Listado de Proveedores"
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
              <q-btn v-if="!$q.screen.xs && validarPermisos('crear.proveedor')"
                @click="modalAgregarProveedor = !modalAgregarProveedor"
                outline color="primary" label="Agregar Proveedor" class="q-mr-xs"/>

              <q-input :style="$q.screen.width > 700 || 'width: 70%'"
                outlined dense debounce="300" v-model="filter" placeholder="Buscar...">
                <template v-slot:append>
                  <q-icon name="search"/>
                </template>
              </q-input>

              <q-btn flat round dense
                :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"
                @click="props.toggleFullscreen"
                v-if="mode === 'list'" >
                <q-tooltip :disable="$q.platform.is.mobile" v-close-popup>
                  {{ props.inFullscreen ? 'Exit Fullscreen' : 'Toggle Fullscreen' }}
                </q-tooltip>
              </q-btn>

              <q-btn flat round dense
                :icon="mode === 'grid' ? 'list' : 'grid_on'"
                @click="mode = mode === 'grid' ? 'list' : 'grid'; separator = mode === 'grid' ? 'none' : 'horizontal'"
                v-if="!props.inFullscreen"
              >
                <q-tooltip :disable="$q.platform.is.mobile" v-close-popup>
                  {{ mode === 'grid' ? 'List' : 'Grid' }}
                </q-tooltip>
              </q-btn>

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
                    @click="formProveedor = { ...props.row }, modalEditarProveedor = true" icon="edit" class="q-mr-sm" size="10px" />

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

  </template>


