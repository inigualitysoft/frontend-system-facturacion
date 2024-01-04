<script setup>
  import { ref, watch } from 'vue';
  import { api } from "boot/axios";
  import useHelpers from "../../../../composables/useHelpers";
  import { useNap } from "./composables/useNap";
  
  let puertosUsados = []
  const columns = [
    { name: 'acciones', label: 'acciones', align: 'center' },
    { align: 'center', label: 'Nombre', field: 'nombre', name: 'nombre' },
    { align: 'center', label: 'Ubicación', field: 'ubicacion', name: 'ubicacion' },
    { align: 'center', label: 'Coordenadas', field: 'coordenadas', name: 'coordenadas' },
    { align: 'center', label: 'Puertos', name: 'xd', style: 'width: 200px',  headerStyle: 'width: 200px', },
    { align: 'center', label: 'Detalles', field: 'detalles', name: 'detalles' },
    { name: 'estado', label: 'Estado', align: 'center', field: 'estado' },
  ]

  let { claim, cargarRouters, listRouters, selectedRouter } = useNap();
  const { mostrarNotify, confirmDelete, isDeleted } = useHelpers();

  const filter  = ref('')
  const rows    = ref([]);
  const loading = ref( false );

  const getCajasNap = async () => {
    loading.value = true;
    try {
      if (listRouters.value.length == 0) await cargarRouters()

      let headers = { headers: { router_id: selectedRouter.value } };

      const resp = await api.get(`/customers/get-ips/${ selectedRouter.value }`);
      resp.data.forEach( x => { 
        if ( x.puerto_id ) puertosUsados.push( x.puerto_id.id ) 
      })

      const { data } = await api.get('/caja-nap', headers);

      data.forEach((x) => { 
        x.puertos.sort((x, y) => x.puerto - y.puerto);

        x.puertos.map(p => {
          if ( puertosUsados.includes( p.id ) ) p.isActive = false
        });
      });

      rows.value = data;
    } catch (error) {
      mostrarNotify( 'warning', error.response.data.message )
    }
    loading.value = false;
  }

  const activarDesactivarCajaNap = async (id, estado) => {
    try {
      const { data: { msg } } = await api.patch(`/caja-nap/${ id }/${ estado }`)
      mostrarNotify('positive', msg );
      getCajasNap();
    } catch (error) {
      console.log(error);
    }
  }

  watch( isDeleted, ( newValue, _ ) => { if ( newValue ) getCajasNap() });
  const eliminarCajaNap = async (id ) => {
    try {
      confirmDelete('Estas seguro de eliminar esta Caja Nap?', `/caja-nap/${ id }`);
    } catch (error) {
      console.log(error);
    }
  }

  getCajasNap();

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
                  @update:model-value="getCajasNap"
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
                @click="$router.push({ name: 'cNap.add' })"
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
                v-if="!props.inFullscreen">
                <q-tooltip :disable="$q.platform.is.mobile" v-close-popup>
                  {{ mode === 'grid' ? 'List' : 'Grid' }}
                </q-tooltip>
              </q-btn>

            </template>            

            <template v-slot:body-cell-xd="props">
              <q-td :props="props">
                <template v-if="true">
                  <div class="row q-col-gutter-y-xs" 
                   style="min-width: 220px;">
                    <div v-for="{ puerto, isActive } in props.row.puertos" class="col-2">
                      <div class="">
                        <q-badge filled 
                          :color="isActive ? 'secondary' : 'red-9'" 
                          :label="puerto" 
                        style="width: 30px; height: 30px;justify-content: center;" />
                      </div>
                    </div>
                  </div>  
                </template>
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
                <q-btn round color="blue-grey" v-if="props.row.isActive"
                  @click="$router.push({ name: 'cNap.edit', params: { id: props.row.id } })"
                  icon="edit" class="q-mr-sm" size="10px" />

                <template v-if="props.row.isActive">
                  <q-btn round color="blue-grey"
                    v-if="props.row.isActive "
                    icon="close"
                    @click="activarDesactivarCajaNap(props.row.id, false)"
                    size="10px" />
                </template>

                <template v-else>
                  <q-btn round color="blue-grey"
                    v-if="!props.row.isActive"
                    icon="done"
                    @click="activarDesactivarCajaNap(props.row.id, true)"
                    size="10px" />

                  <q-btn round color="blue-grey" class="q-ml-sm"
                    v-if="!props.row.isActive"
                      icon="delete" @click="eliminarCajaNap(props.row.id)"
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
      @click="$router.push({ name: 'cNap.add' })" />
  </q-page-sticky>
  
</template>
  