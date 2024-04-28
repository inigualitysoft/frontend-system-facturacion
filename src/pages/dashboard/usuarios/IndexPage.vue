<script setup>
  import { ref, watch, onMounted } from 'vue';
  import useHelpers from "../../../composables/useHelpers";
  import useRolPermisos from "src/composables/useRolPermisos.js";

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
  const listCompanies = ref([]);
  const selectEmpresa = ref('')

  const loading = ref( false );
  const { api, claim, mostrarNotify, confirmDelete, isDeleted } = useHelpers();
  const { validarPermisos } = useRolPermisos();

  const getUsers = async () => {
    loading.value = true;
    try {

      let headers = { 'company-id': selectEmpresa.value };

      const { data } = await api.get('/auth/users', { headers });
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

  const getCompanies = async () => {
    const { data } = await api.get(`/companies`);
    data.forEach(( company ) => {
      listCompanies.value.push({
        label:  company.nombre_comercial,
        value:  company.id
      })
    });
    selectEmpresa.value = claim.company.id
  }

  watch( isDeleted, ( newValue, _ ) => { if ( newValue ) getUsers() });
  const eliminarUsuario = async ( user_id ) => {
    try {
      confirmDelete('Estas seguro de eliminar este usuario?', `/auth/${ user_id }`);
    } catch (error) {
      console.log(error);
    }
  }

  onMounted(async () => {
    await getCompanies();
    await getUsers();
  })


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
              :filter="filter" :pagination.sync="pagination">

              <template v-slot:loading>
                <q-inner-loading showing color="primary" />
              </template>

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

              <template v-slot:top-left="props">
                <div v-if="claim.roles[0] !== 'SUPER-ADMINISTRADOR' && claim.roles[0] !== 'ADMINISTRADOR'"
                  class="text-center row justify-center" style="width: 100%;">
                  <label class="q-mb-sm text-grey-7 text-h6">
                    Listado de Usuarios
                  </label>
                </div>
                <div v-if="claim.roles[0] == 'SUPER-ADMINISTRADOR' || claim.roles[0] == 'ADMINISTRADOR'"
                style="display: flex" :class="[ $q.screen.xs ? 'q-mb-md' : '' ]">
                  <label class="q-mr-sm row items-center">
                    <span>Empresa: </span>
                  </label>
                  <q-select outlined dense v-model="selectEmpresa"
                    @update:model-value="getUsers()"
                    emit-value map-options
                  :options="listCompanies">
                  </q-select>
                </div>
              </template>

              <template v-slot:top-right="props">
                <q-btn v-if="!$q.screen.xs && validarPermisos('crear.usuario')"
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
                  <q-btn v-if="validarPermisos('editar.usuario')"
                    round color="blue-grey"
                    @click="$router.push({ name:'Editar Usuario', params: { term: props.row.id } })"
                    icon="edit" class="q-mr-sm" size="11px" />

                  <q-btn round color="blue-grey" class="q-ml-sm"
                    :disabled="claim.id == props.row.id"
                    v-if="props.row.estado == 'Activo' && validarPermisos('eliminar.usuario')"
                    icon="delete"
                    @click="eliminarUsuario(props.row.id)"
                    size="11px" />
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
      v-if="$q.screen.xs && validarPermisos('crear.usuario')">
    <q-btn round color="secondary" size="lg" icon="add"
      @click="$router.push({ name: 'Agregar Usuario' })" />
  </q-page-sticky>
</template>
