<script setup lang="ts">
  import { ref, watch } from 'vue';
  import { api } from "boot/axios";
  import useHelpers from "../../../../composables/useHelpers";
  import { useInternet } from "./composables/useInternet";
  
  const columns: any = [
    { name: 'acciones', label: 'acciones', align: 'center' },
    { align: 'center', label: 'Nombre', field: 'nombre_plan', name: 'nombre_plan' },
    { align: 'center', label: 'Descargar Mbps', field: 'descarga_Mbps', name: 'descarga_Mbps' },
    { align: 'center', label: 'Subida Mbps', field: 'subida_Mbps', name: 'subida_Mbps' },
    { align: 'center', label: 'Precio', field: 'precio', name: 'precio_plan' },
    { name: 'estado', label: 'Estado', align: 'center', field: 'estado' },
  ]

  let { cargarRouters, listRouters, selectedRouter } = useInternet();
  const { mostrarNotify, confirmDelete, isDeleted } = useHelpers();

  const filter  = ref('')
  const rows    = ref([]);
  const loading = ref( false );

  const getServiciosInternet = async () => {
    loading.value = true;
    try {
      if (listRouters.value.length == 0) await cargarRouters()

      let headers = { headers: { router_id: selectedRouter.value } };

      const { data } = await api.get('/internet', headers);
      data.forEach((x: any) => { 
        x.precio = `$${ x.precio_plan }` 
        x.estado = `${ x.isActive ? 'Activo' : 'Inactivo' }`
      });
      rows.value = data;
    } catch (error: any) {
      mostrarNotify( 'warning', error.response.data.message )
    }
    loading.value = false;
  }

  const activarDesactivarServicioInternet = async (id: string, estado: boolean) => {
    try {
      const { data: { msg } } = await api.patch(`/internet/${ id }/${ estado }`)
      mostrarNotify('positive', msg );
      getServiciosInternet();
    } catch (error) {
      console.log(error);
    }
  }

  watch( isDeleted, ( newValue, _ ) => { if ( newValue ) getServiciosInternet() });
  const eliminarServicioInternet = async (router_id: string ) => {
    try {
      confirmDelete('Estas seguro de eliminar este servicio de internet?', `/internet/${ router_id }`);
    } catch (error) {
      console.log(error);
    }
  }

  getServiciosInternet();

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
            title="Servicios de Internet"
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
              <div v-if="listRouters.length > 1"
              style="display: flex" :class="[ $q.screen.xs ? 'q-mb-md' : '' ]">
                <label class="q-mr-sm row items-center">
                  <span>Router: </span> 
                </label>
                <q-select outlined dense v-model="selectedRouter"
                  @update:model-value="getServiciosInternet"
                  emit-value map-options
                  :options="listRouters">
                </q-select>
              </div>
              <div v-else
                class="text-center row justify-center" style="width: 100%;">
                <label class="q-mb-sm text-grey-7 text-h6">
                  Servicios de Internet 
                </label>
              </div>
            </template>

            <template v-slot:top-right="props">
              <q-btn v-if="!$q.screen.xs"
                @click="$router.push({ name: 'internet.add' })"
                outline color="primary" label="Nuevo" class="q-mr-xs"/>

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
                <q-btn round color="blue-grey" v-if="props.row.isActive"
                  @click="$router.push({ name: 'internet.edit', params: { id: props.row.id } })"
                  icon="edit" class="q-mr-sm" size="10px" />

                <template v-if="props.row.isActive">
                  <q-btn round color="blue-grey"
                    v-if="props.row.isActive "
                    icon="close"
                    @click="activarDesactivarServicioInternet(props.row.id, false)"
                    size="10px" />
                </template>

                <template v-else>
                  <q-btn round color="blue-grey"
                    v-if="!props.row.isActive"
                    icon="done"
                    @click="activarDesactivarServicioInternet(props.row.id, true)"
                    size="10px" />

                  <q-btn round color="blue-grey" class="q-ml-sm"
                    v-if="!props.row.isActive"
                      icon="delete" @click="eliminarServicioInternet(props.row.id)"
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
    <q-btn round color="secondary" size="lg" icon="add" 
      @click="$router.push({ name: 'internet.add' })" />
  </q-page-sticky>
  
</template>
  