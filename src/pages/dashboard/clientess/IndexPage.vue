<script setup>
  import { ref, watch } from 'vue';
  import useHelpers from "../../../composables/useHelpers";
  import AddCliente from './AddCliente.vue'
  import EditCliente from './EditCliente.vue'
  import { useCliente } from "./composables/useCliente";
  import ModalCargarExcel from "./components/ModalCargarExcel.vue";
  import useRolPermisos from "src/composables/useRolPermisos.js"; 
  
  const columns = [
    { name: 'acciones', label: 'acciones', align: 'center' },
    { name: 'nombre', align: 'center', label: 'Cliente', field: 'nombres', sortable: true },
    { name: 'tipo_documento', align: 'center', label: 'Tipo de Documento', field: 'tipo_documento' },
    { name: 'numero_documento', align: 'center', label: 'Numero de Documento', field: 'numero_documento' },
    { name: 'email', label: 'Email', field: 'email', align: 'center'},
    { name: 'celular', label: 'Celular', field: 'celular',  align: 'center' },
    { name: 'estado', label: 'Estado', align: 'center', field: 'estado' },
  ]
  let { 
    actualizarLista,
    modalAgregarCliente,
    modalEditarCliente,
    formCliente
  } = useCliente();
  const { validarPermisos } = useRolPermisos();
  
  const showModalUploadFile = ref( false );
  const filter              = ref('')
  const rows                = ref([]);
  const loading             = ref( false );
  const { api, mostrarNotify, confirmDelete, isDeleted } = useHelpers();
  
  watch(actualizarLista, (currentValue, _) => {
    if ( currentValue ) getClientes(); 
  });
  const getClientes = async () => {
    loading.value = true;
    try {
      const { data } = await api.get('/customers');
      rows.value = data;
      actualizarLista.value = false;
    } catch (error) {
      mostrarNotify( 'warning', error.response.data.message )
    }
    loading.value = false;
  }

  const activarDesactivarCliente = async (cliente_id, estado) => {
    try {
      const { data: { msg } } = await api.patch(`/customers/${ cliente_id }/${ estado }`)
      mostrarNotify('positive', msg );
      getClientes();
    } catch (error) {
      console.log(error);
    }
  }

  watch( isDeleted, ( newValue, _ ) => { if ( newValue ) getClientes() })
  const eliminarCliente = async (cliente_id) => {
    try {
      confirmDelete('Estas seguro de eliminar este cliente?', `/customers/${ cliente_id }`);
    } catch (error) {
      console.log(error);
    }
  }

  const downloadFile = () => {
    var archivoURL = "/plantillas/productos_plantilla.xlsx";

    window.location.href = archivoURL;
  }

  getClientes();
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
          <q-table title-class="text-grey-7 text-h6" title="Listado de Clientes"
            :rows="rows" :loading="loading" :hide-header="mode === 'grid'"
            :columns="columns" row-key="name" :grid="mode==='grid'"
            :filter="filter" :pagination.sync="pagination" >
            <template v-slot:header="props">
              <q-tr :props="props" style="height: 60px">
                <q-th v-for="col in props.cols"
                  :key="col.name" :props="props"
                  class="text-grey-7 text-weight-bold text-uppercase"
                  style="font-size: 13px">
                  {{ col.label }}
                </q-th>
              </q-tr>
            </template>

            <template v-slot:top-right="props">
              <q-btn v-if="!$q.screen.xs && validarPermisos('crear.cliente')"
                @click="modalAgregarCliente = !modalAgregarCliente" 
                outline color="primary" label="Agregar Cliente" class="q-mr-xs"/>

                <q-btn-dropdown outline color="primary" icon="fa-solid fa-file-excel">
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
                        <q-item-label>Exportar Excel</q-item-label>
                      </q-item-section>
                    </q-item>

                  </q-list>
                </q-btn-dropdown>

              <q-input outlined dense debounce="300" v-model="filter" placeholder="Buscar...">
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

            <template v-slot:body-cell-tipo_documento="props">
              <q-td :props="props">
                <div>
                  <label v-if="props.row.tipo_documento == 4">RUC</label>
                  <label v-else-if="props.row.tipo_documento == 5">Cedula</label>
                  <label v-else>Pasaporte</label>
                </div>
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
                  <q-btn v-if="validarPermisos('editar.cliente')"
                    round color="blue-grey"
                    @click="formCliente = { ...props.row }, modalEditarCliente = true"
                    icon="edit" class="q-mr-sm" size="10px" />

                  <q-btn round color="blue-grey"
                    v-if="props.row.isActive && validarPermisos('inactivar.cliente')"
                    icon="close"
                    @click="activarDesactivarCliente(props.row.id, false)"
                    size="10px" />
                </template>

                <template v-else>
                  <q-btn round color="blue-grey"
                    v-if="!props.row.isActive && validarPermisos('activar.cliente')"
                    icon="done"
                    @click="activarDesactivarCliente(props.row.id, true)"
                    size="10px" />

                  <q-btn round color="blue-grey" class="q-ml-sm"
                  v-if="!props.row.estado && validarPermisos('eliminar.cliente')"
                  icon="delete"
                  @click="eliminarCliente(props.row.id)"
                  size="10px" />

                </template>
              </q-td>
            </template>

            <template v-slot:no-data="{ icon }">
              <div class="full-width row flex-center text-lime-10 q-gutter-sm">
                <q-icon size="2em" name="sentiment_dissatisfied" />
                <span class="text-subtitle1">
                  No se encontró ningun Resultado
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
      v-if="$q.screen.xs && validarPermisos('crear.cliente')">
    <q-btn round color="secondary" size="lg" icon="add" @click="modalAgregarCliente = !modalAgregarCliente" />
  </q-page-sticky>

  <q-dialog v-model="modalAgregarCliente">
    <AddCliente  />
  </q-dialog>

  <q-dialog v-model="modalEditarCliente">
    <EditCliente />
  </q-dialog> 

  <q-dialog v-model="showModalUploadFile">
    <ModalCargarExcel @actualizarDatos="getClientes()" />
  </q-dialog>

</template>