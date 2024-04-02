<script setup>
  import { ref, watch } from 'vue'
  import AddRol from './AddRol.vue'
  import EditRol from './EditRol.vue'
  import { useRol } from "./composables/useRol.js";
  import useRolPermisos from "src/composables/useRolPermisos.js";

  let  columns = [
    { name: "id", align: "center", label: "#", field: "change_id", sortable: true },
    { name: "rol", align: "center", label: "Rol", field: "nombre", sortable: true },
    { name: "acciones", align: "center", label: "Acciones" }
  ];

  const {
    api,
    mostrarNotify,
    confirmDelete,
    isDeleted,
    actualizarLista,
    loading,
    modalAgregarRol,
    modalEditarRol,
    permisosSelected,
    formRol
  } = useRol();
  const { validarPermisos } = useRolPermisos();

  const rows = ref([]);
  const filter = ref("");
  const mode = ref("list");
  const pagination = ref({
    rowsPerPage: 10
  })

  watch(actualizarLista, (currentValue, _) => {
    if ( currentValue ) getRoles();
  });
  const getRoles = async () => {
    loading.value = true;
    try {
      const { data } = await api.get('/roles-and-permisos');

      rows.value = data;

      actualizarLista.value = false;
    } catch (error) {
      mostrarNotify( 'negative', error.response.data.message )
    }
    loading.value = false;
  }

  const editRol = ( rol ) => {
    permisosSelected.value = rol.permisos;
    formRol.value.id        = rol.id;
    formRol.value.permisos  = [];
    formRol.value.nombre = rol.nombre;
    modalEditarRol.value = true;
  }

  watch( isDeleted, ( newValue, _ ) => { if ( newValue ) getRoles() });
  const eliminarRol = async ( rol_id ) => {
    try {
      confirmDelete('Estas seguro de eliminar este rol?', `/roles-and-permisos/${ rol_id }`);
    } catch (error) {
      console.log(error);
    }
  }

  getRoles();

</script>
<template>
    <div class="q-ma-lg q-pt-md">
      <div class="row q-col-gutter-lg">
        <div class="col-12">
          <q-card flat class="shadow_custom">
            <q-table title-class="text-grey-7 text-h6"
              title="Listado de Roles" :loading="loading"
              :rows="rows" :hide-header="mode === 'grid'"
              :columns="columns" row-key="name" :grid="mode==='grid'"
              :filter="filter" :pagination.sync="pagination">

              <template v-slot:loading>
                <q-inner-loading showing color="secondary" />
              </template>

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

                <q-btn v-if="!$q.screen.xs && validarPermisos('crear.rol')"
                  @click="modalAgregarRol = !modalAgregarRol"
                  outline color="primary" label="Agregar Rol"
                  :class="$q.screen.width < 700 ? 'q-mb-md q-mt-sm q-mr-xl' : 'q-mr-xs'" />

                <q-input :style="$q.screen.width < 700 ? 'width: 70%' : ''"
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

              <template v-slot:body-cell-id="props">
                <q-td :props="props">
                  {{ props.pageIndex + 1 }}
                </q-td>
              </template>

              <template v-slot:body-cell-acciones="props">
                <q-td :props="props">
                  <q-btn v-if="validarPermisos('editar.rol')"
                    round color="blue-grey"
                    @click="editRol( props.row )"
                    icon="edit" class="q-mr-sm" size="11px" />

                  <q-btn round color="blue-grey" class="q-ml-sm"
                    v-if="validarPermisos('eliminar.rol')"
                    icon="delete"
                    :disable="props.row.nombre == 'SUPER-ADMINISTRADOR'
                            || props.row.nombre == 'ADMINISTRADOR'"
                    @click="eliminarRol(props.row.id)"
                    size="11px" />
                </q-td>
              </template>

              <template v-slot:no-data="{  }">
                <div class="full-width row flex-center text-lime-10 q-gutter-sm">
                  <span class="text-subtitle1">
                    No se encontró registros
                  </span>
                  <q-icon size="2em" name="playlist_add" />
                </div>
              </template>

            </q-table>
          </q-card>
        </div>
      </div>
    </div>

    <q-page-sticky position="bottom-right" :offset="[18, 18]"
        v-if="$q.screen.xs && validarPermisos('crear.rol')">
      <q-btn round color="secondary" size="lg" icon="add" @click="modalAgregarCliente = !modalAgregarCliente" />
    </q-page-sticky>

    <q-dialog v-model="modalAgregarRol">
      <AddRol />
    </q-dialog>

    <q-dialog v-model="modalEditarRol">
      <EditRol />
    </q-dialog>

  </template>