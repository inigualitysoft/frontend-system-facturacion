<script setup>
  import { ref, watch } from 'vue';
  import { api } from "boot/axios";
  import useHelpers from "../../../composables/useHelpers";
  
  const columns = [
    { name: 'acciones', label: 'acciones', align: 'center' },
    { name: 'fullName', align: 'center', label: 'Nombre', field: 'fullName', sortable: true },
    { name: 'usuario', label: 'Usuario', field: 'usuario', align: 'center'},
    { name: 'email', align: 'center', label: 'Email', field: 'email' },
    { name: 'celular', label: 'Celular', field: 'celular',  align: 'center' },
    { name: 'rol_name', align: 'center', label: 'Rol', field: 'rol_name' },
    { name: 'estado', label: 'Estado', align: 'center', field: 'estado' },
  ]
  
  const filter = ref('')
  const rows = ref([]);

  const loading = ref( false );
  const { mostrarNotify, confirmDelete, isDeleted } = useHelpers();

  const getUsers = async () => {
    loading.value = true;
    try {
      const { data } = await api.get('/auth/users');
      data.forEach(user => {
        user.rol_name = user.roles[0]
        user.estado = user.isActive ? 'Activo' : 'Inactivo'
      });
      rows.value = data;
    } catch ( error ) {
      mostrarNotify( 'warning', error.response.data.message )
    }
    loading.value = false;
  }

  watch( isDeleted, ( newValue, _ ) => { if ( newValue ) getUsers() });
  const eliminarUsuario = async ( user_id ) => {
    try {
      confirmDelete('Estas seguro de eliminar este usuario?', `/auth/${ user_id }`);
    } catch (error) {
      console.log(error);
    }
  }

  getUsers();

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
            <q-table title-class="text-grey-7 text-h6" title="Listado de Usuarios"
              :rows="rows" :loading="loading" :hide-header="mode === 'grid'"
              :columns="columns" row-key="name" :grid="mode==='grid'"
              :filter="filter" :pagination.sync="pagination" >
              <template v-slot:header="props">
                <q-tr :props="props" style="height: 60px">
                  <q-th v-for="col in props.cols"
                    :key="col.name" :props="props"
                    class="text-grey-7 text-weight-bold text-uppercase"
                    style="font-size: 13px" >
                    {{ col.label }}
                  </q-th>
                </q-tr>
              </template>
              <template v-slot:top-right="props">
                <q-btn v-if="!$q.screen.xs"
                  @click="$router.push({ name: 'Agregar Usuario' })" 
                  outline color="primary" label="Agregar Usuario" class="q-mr-xs" />

                <q-input :style="$q.screen.width > 700 || 'width: 70%'"
                  outlined dense debounce="300" v-model="filter" placeholder="Buscar...">
                  <template v-slot:append>
                    <q-icon name="search"/>
                  </template>
                </q-input>

                <q-btn flat round dense :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"
                  @click="props.toggleFullscreen" v-if="mode === 'list'" >
                  <q-tooltip :disable="$q.platform.is.mobile" v-close-popup>
                    {{ props.inFullscreen ? 'Exit Fullscreen' : 'Toggle Fullscreen' }}
                  </q-tooltip>
                </q-btn>

                <q-btn flat round dense
                  :icon="mode === 'grid' ? 'list' : 'grid_on'"
                  @click="mode = mode === 'grid' ? 'list' : 'grid'; separator = mode === 'grid' ? 'none' : 'horizontal'" v-if="!props.inFullscreen" >
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
                    @click="$router.push({ name:'Editar Usuario', params: { term: props.row.id } })"
                    icon="edit" class="q-mr-sm" size="11px" />

                  <q-btn round color="blue-grey" class="q-ml-sm"
                    v-if="props.row.estado == 'Activo'"
                    icon="delete"
                    @click="eliminarUsuario(props.row.id)"
                    size="11px" />                    
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
      @click="$router.push({ name: 'Agregar Usuario' })" />
  </q-page-sticky>
</template>
  