<script setup lang="ts">
  import { ref, watch } from 'vue';
  import { api } from "boot/axios";
  import useHelpers from "../../../composables/useHelpers";
  import AddSucursal from './AddSucursal.vue'
  import EditSucursal from './EditSucursal.vue'
  import { useSucursal } from "./composables/useSucursal";
  
  const columns: any = [
    { name: 'acciones', label: 'acciones', align: 'center' },
    { align: 'center', label: 'Sucursal', field: 'nombre', name: 'nombre' },
    { align: 'center', label: 'Dirección', field: 'direccion', name: 'direccion' },
    { align: 'center', label: 'N° de establecimiento', field: 'establecimiento', name: 'esta' },
    { label: 'Punto de emisión', field: 'punto_emision', align: 'center', name: 'p_v'},
    { label: 'N° de factura', field: 'secuencia_factura_produccion',  align: 'center', name: 'sec' },
    { name: 'estado', label: 'Estado', align: 'center' },
  ]

  let { 
    actualizarLista,
    claim,
    modalAgregarSucursal,
    modalEditarSucursal,
    formSucursal,
    cargarCompanies,
    listCompanies
  } = useSucursal();

  const filter  = ref('')
  const rows    = ref([]);
  const loading = ref( false );
  const selectCompany = ref(claim.company.id);

  const { mostrarNotify, confirmDelete, isDeleted } = useHelpers();

  watch(actualizarLista, (currentValue, _) => {
    if ( currentValue ) getSucursales(); 
  });

  const getSucursales = async () => {
    loading.value = true;
    try {
      let headers = { headers: { company_id: selectCompany.value, NotSetHeaderCompany: true } };
      const { data } = await api.get('/sucursal', headers);
      rows.value = data;
      actualizarLista.value = false;
    } catch (error: any) {
      mostrarNotify( 'warning', error.response.data.message )
    }
    loading.value = false;
  }

  const activarDesactivarSucursal = async (sucursal_id: string, estado: boolean) => {
    try {
      const { data: { msg } } = await api.patch(`/sucursal/${ sucursal_id }/${ estado }`)
      mostrarNotify('positive', msg );
      getSucursales();
    } catch (error) {
      console.log(error);
    }
  }

  watch( isDeleted, ( newValue, _ ) => { if ( newValue ) getSucursales() });
  const eliminarSucursal = async (sucursal_id: string ) => {
    try {
      confirmDelete('Estas seguro de eliminar esta sucursal?', `/sucursal/${ sucursal_id }`);
    } catch (error) {
      console.log(error);
    }
  }

  getSucursales();
  cargarCompanies();

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

            <template v-slot:top-left="props">
              <div v-if="claim.roles[0] !== 'Super-Administrador'"
                class="text-center row justify-center" style="width: 100%;">
                <label class="q-mb-sm text-grey-7 text-h6">
                  Listado de Sucursales
                </label>
              </div>
              <div v-if="claim.roles[0] == 'Super-Administrador'"
              style="display: flex" :class="[ $q.screen.xs ? 'q-mb-md' : '' ]">
                <label class="q-mr-sm row items-center">
                  <span>Empresa: </span> 
                </label>
                <q-select outlined dense v-model="selectCompany"
                  @update:model-value="getSucursales"
                  emit-value map-options
                  :options="listCompanies">
                </q-select>
              </div>
            </template>

            <template v-slot:top-right="props">
              <q-btn v-if="!$q.screen.xs"
                @click="modalAgregarSucursal = !modalAgregarSucursal" 
                outline color="primary" label="Agregar Sucursal" class="q-mr-xs"/>

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
                <q-btn round color="blue-grey"
                  @click="formSucursal = { 
                    ...props.row,
                    company_id: props.row.company_id.id
                    }, modalEditarSucursal = true"
                  icon="edit" class="q-mr-sm" size="10px" />

                <template v-if="props.row.isActive">
                  <q-btn round color="blue-grey"
                    v-if="props.row.isActive"
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
                  v-if="!props.row.estado"
                  icon="delete"
                  @click="eliminarSucursal(props.row.id)"
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
      v-if="$q.screen.xs">
    <q-btn round color="secondary" size="lg" icon="add" @click="modalAgregarSucursal = !modalAgregarSucursal" />
  </q-page-sticky>
  
  <q-dialog v-model="modalAgregarSucursal">
    <AddSucursal  />
  </q-dialog>

  <q-dialog v-model="modalEditarSucursal">
    <EditSucursal />
  </q-dialog> 
  
</template>
  