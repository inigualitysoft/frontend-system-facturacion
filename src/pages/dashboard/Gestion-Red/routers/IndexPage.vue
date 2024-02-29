<script setup>
  import { ref, watch } from 'vue';
  import { Dialog } from "quasar";
  import useHelpers from "../../../../composables/useHelpers";
  import ModalImportarClientes from "./components/ModalImportarClientes.vue";
  
  const columns = [
    { name: 'acciones', label: 'acciones', align: 'center' },
    { align: 'center', label: 'Nombre Router', field: 'nombre', name: 'nombre' },
    { align: 'center', label: 'IP/Host', field: 'ip_host', name: 'ip_host' },
    { align: 'center', label: 'Empresa', field: 'empresa_name', name: 'empresa_name' },
    { name: 'estado', label: 'Estado', align: 'center', field: 'estado' },
  ]

  const filter                 = ref('')
  const rows                   = ref([]);
  const loading                = ref( false );
  const showModalImportClients = ref( false );
  const router_selected        = ref('');

  const { api, claim, mostrarNotify, confirmDelete, isDeleted } = useHelpers();

  const getRouters = async () => {
    loading.value = true;
    try {
      const { data } = await api.get('/router');
      data.forEach(x => {
        x.empresa_name = x.company_id.nombre_comercial
        x.estado = x.isActive ? 'Activo' : 'Inactivo',
        x.loading = false;
      });
      rows.value = data;
    } catch (error) {
      mostrarNotify( 'warning', error.response.data.message )
    }
    loading.value = false;
  }

  const activarDesactivarSucursal = async (router_id, estado) => {
    try {
      const { data: { msg } } = await api.patch(`/router/${ router_id }/${ estado }`)
      mostrarNotify('positive', msg );
      getRouters();
    } catch (error) {
      console.log(error);
    }
  }

  watch( isDeleted, ( newValue, _ ) => { if ( newValue ) getRouters() });
  const eliminarRouter = async (router_id ) => {
    try {
      confirmDelete('Estas seguro de eliminar este router?', `/router/${ router_id }`);
    } catch (error) {
      console.log(error);
    }
  }

  const confirmarRepararRouter = async ( router_id ) => {
    Dialog.create({
      title: 'Confirmar',
      message: '¿Deseas reescribir los clientes existente al mickrotik?',
      ok: { push: true, label:'SI', color: 'teal-7' },
      cancel: { push: true, color: 'blue-grey-8', label: 'Cancelar' }
    }).onOk( async () => {
      try {
        await api.post(`/mikrotik/reparar-router/${ router_id }`)

        mostrarNotify('warning', "Clientes agregados exitosamente");
      } catch (error) {
        if( typeof(error.response.data.message) == 'object' ){
          error.response.data.message.unshift('No pudo agregar los siguientes clientes porque ya existen:');
        }
        mostrarNotify('warning', error.response.data.message);
      }
    })
  }

  const downloadExcel = async ( router_id, index ) => {
    try {
      rows.value[index].loading = true

      const response = await api.post(`/mikrotik/download-clients-excel/${ router_id }`, { }, {responseType: 'arraybuffer'});
  
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'ejemplo.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);    
      
      rows.value[index].loading = false
    } catch (error) {
      console.log( error );
      rows.value[index].loading = false
    }
  }

  getRouters();

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
          <q-table title-class="text-grey-7 text-h6"          
            title="Listado de Routers"
            :rows="rows" :loading="loading" :hide-header="mode === 'grid'"
            :columns="columns" row-key="name" :grid="mode==='grid'"
            :filter="filter" :pagination.sync="pagination" >
            <template v-slot:header="props">
              <q-tr :props="props" style="height: 60px">
                <q-th v-for="col in props.cols" :key="col.name"
                  :props="props"
                  class="text-grey-7 text-weight-bold text-uppercase"
                  style="font-size: 13px">
                  {{ col.label }}
                </q-th>
              </q-tr>
            </template>

            <template v-slot:top-right="props">
              <q-btn v-if="!$q.screen.xs && claim.roles[0] == 'Super-Administrador'"
                @click="$router.push({ name: 'router.add' })"
                outline color="primary" label="Agregar Router" class="q-mr-xs"/>

              <q-input :style="$q.screen.width > 700 || 'width: 70%'"
                outlined dense debounce="300" v-model="filter" placeholder="Buscar...">
                <template v-slot:append>
                  <q-icon name="search"/>
                </template>
              </q-input>

              <q-btn flat round dense
                :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"
                @click="props.toggleFullscreen"
                v-if="mode === 'list'">
                <q-tooltip :disable="$q.platform.is.mobile" v-close-popup>
                  {{ props.inFullscreen ? 'Exit Fullscreen' : 'Toggle Fullscreen' }}
                </q-tooltip>
              </q-btn>

              <q-btn flat round dense
                :icon="mode === 'grid' ? 'list' : 'grid_on'"
                @click="mode = mode === 'grid' ? 'list' : 'grid'; separator = mode === 'grid' ? 'none' : 'horizontal'" v-if="!props.inFullscreen">
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
                  <q-btn round color="blue-grey" 
                    @click="$router.push({ name: 'router.edit', params: { router_id: props.row.id } })"
                    icon="edit" class="q-mr-sm" size="10px" />

                  <q-btn @click="confirmarRepararRouter( props.row.id )"
                    round color="blue-grey" 
                    icon="fa-solid fa-gears" class="q-mr-sm" size="10px">
                    <q-tooltip class="bg-indigo" anchor="top middle" self="center middle">
                      Reparar router
                    </q-tooltip>
                  </q-btn>
                  
                  <q-btn @click="downloadExcel( props.row.id, props.rowIndex )"
                    :loading="props.row.loading"
                    round color="blue-grey" 
                    icon="fa-solid fa-file-excel" class="q-mr-sm" size="10px">
                    <q-tooltip class="bg-indigo" anchor="top middle" self="center middle">
                      Descargar plantilla clientes
                    </q-tooltip>
                  </q-btn>

                  <q-btn @click="showModalImportClients = true, router_selected = props.row.id"
                    :loading="props.row.loading"
                    round color="blue-grey" 
                    icon="upload" class="q-mr-sm" size="10px">
                    <q-tooltip class="bg-indigo" anchor="top middle" self="center middle">
                      Importar Clientes
                    </q-tooltip>
                  </q-btn>

                  <q-btn round color="blue-grey"
                    v-if="props.row.isActive && claim.roles[0] == 'Super-Administrador'"
                    icon="close"
                    @click="activarDesactivarSucursal(props.row.id, false)"
                    size="10px" />
                </template>

                <template v-else>
                  <q-btn round color="blue-grey"
                    v-if="!props.row.isActive"
                    icon="done"
                    @click="activarDesactivarSucursal(props.row.id, true)"
                    size="10px" />

                  <q-btn round color="blue-grey" class="q-ml-sm"
                    v-if="!props.row.isActive && claim.roles[0] == 'Super-Administrador'"
                      icon="delete" @click="eliminarRouter(props.row.id)"
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

  <q-dialog v-model="showModalImportClients">
    <ModalImportarClientes :router_selected="router_selected" />
  </q-dialog>
  
  <q-page-sticky position="bottom-right" :offset="[18, 18]"
      v-if="$q.screen.xs && claim.roles[0] == 'Super-Administrador'">
    <q-btn round color="secondary" size="lg" icon="add" 
      @click="$router.push({ name: 'router.add' })" />
  </q-page-sticky>
  
</template>
  