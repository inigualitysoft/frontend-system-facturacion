<script setup lang="ts">
  import { ref, watch } from 'vue';
  import useHelpers from "../../../composables/useHelpers";
  import useRolPermisos from "src/composables/useRolPermisos.js";

  const columns: any = [
    { name: 'acciones', label: 'Acciones', align: 'center' },
    { label: "R.U.C", field: "ruc", align: "left", name: 'b' },
    { label: "Nombre Comercial", field: "nombre_comercial", align: "left", name: 'c' },
    { label: "Razón Social", field: "razon_social", align: "left", name: 'd' } ,
    { label: "Telefono", field: "telefono", align: "center", name: 'e' },
    { label: "Email", field: "email", name: "email", align: "center" },
    { label: "Obligado Contabilidad", name: "obligadoContabilidad", align: "center" },
    { label: "Estado", name: "estado", align: "center" }
  ];

  const { validarPermisos } = useRolPermisos();

  const filter = ref('')
  const rows = ref([]);
  const loading = ref( false );

  const { api, claim, mostrarNotify, confirmDelete, isDeleted } = useHelpers();

  const getCompanies = async () => {
    loading.value = true;
    let headers = { 'company-id': claim.company.id };
    const { data } = await api.get('/companies', { headers });
    rows.value = data;
    loading.value = false;
  }

  const activarDesactivarEmpresa = async (company_id: string, estado: boolean) => {
    try {
      const { data: { msg } } = await api.patch(`/companies/${ company_id }/${ estado }`)
      mostrarNotify('positive', msg );
      getCompanies();
    } catch (error) {
      console.log(error);
    }
  }

  watch( isDeleted, ( newValue, _ ) => { if ( newValue ) getCompanies() })
  const eliminarCompany = async (company_id: string ) => {
    confirmDelete('Estas seguro de eliminar esta empresa?', `/companies/${ company_id }`);
  }

  getCompanies();

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
          <q-table title-class="text-grey-7 text-h6" title="Listado de Empresas"
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
                  style="font-size: 13px">
                  {{ col.label }}
                </q-th>
              </q-tr>
            </template>

            <template v-slot:top-right="props">
              <q-btn v-if="!$q.screen.xs && validarPermisos('crear.empresa')"
                @click="$router.push({ name: 'Agregar Empresa' })"
                outline color="primary" label="Agregar Empresa" class="q-mr-xs"/>

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

            <template v-slot:body-cell-obligadoContabilidad="props">
              <q-td :props="props">
                {{ props.row.obligado_contabilidad ? 'SI' : 'NO' }}
              </q-td>
            </template>

            <template v-slot:body-cell-estado="props">
              <q-td :props="props">
                <template v-if="props.row.isActive">
                    <q-badge outline color="positive" label="Activo"  ss="q-pa-sm" />
                </template>
                <template v-else>
                    <q-badge outline color="red" label="Inactivo" class="q-pa-sm" />
                </template>
              </q-td>
            </template>

            <template v-slot:body-cell-acciones="props">
              <q-td :props="props">

                <template v-if="props.row.isActive">
                  <q-btn v-if="validarPermisos('editar.empresa')"
                    round color="blue-grey"
                    @click="$router.push({ name: 'Editar Empresa', params: { empresa_id: props.row.id } })"
                    icon="edit" class="q-mr-sm" size="10px" />

                  <q-btn round color="blue-grey"
                    v-if="validarPermisos('inactivar.empresa')"
                    icon="close" @click="activarDesactivarEmpresa(props.row.id, false)"
                    size="10px" />
                </template>

                <template v-else>
                  <q-btn round color="blue-grey"
                    v-if="validarPermisos('activar.empresa')"
                    icon="done" @click="activarDesactivarEmpresa(props.row.id, true)"
                    size="10px" />

                  <q-btn round color="blue-grey" class="q-ml-sm"
                    v-if="!props.row.estado && validarPermisos('eliminar.empresa')"
                    icon="delete" @click="eliminarCompany(props.row.id)"
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
      v-if="$q.screen.xs && validarPermisos('crear.empresa')">
    <q-btn round color="secondary" size="lg" icon="add" @click="$router.push({ name: 'Agregar Empresa' })"  />
  </q-page-sticky>

</template>
