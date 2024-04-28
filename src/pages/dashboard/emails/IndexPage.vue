<script setup lang="ts">
import { ref, onMounted } from 'vue'
import useHelpers from "../../../composables/useHelpers";
import useRolPermisos from "src/composables/useRolPermisos.js";

  const columns: any = [
    { name: 'acciones', label: 'acciones', align: 'center' },
    { name: 'empresa_name', label: 'Empresa', align: 'center', field: 'empresa_name' },
    { name: 'host', label: 'Host', align: 'center', field: 'host' },
    { name: 'puerto', label: 'Puerto', align: 'center', field: 'puerto' },
    { name: 'usuario', label: 'Usuario', align: 'center', field: 'usuario' },
    { name: 'password', label: 'Contraseña', align: 'center', field: 'password' },
  ]

  const { api } = useHelpers();
  const { validarPermisos } = useRolPermisos();

  const rows = ref([]);
  const filter = ref<any>('');
  const tableRef = ref();
  const loading = ref(false);

  const pagination = ref({
    sortBy: 'desc',
    descending: false,
    page: 1,
    rowsPerPage: 5,
    rowsNumber: 5
  })

  const getEmails = async (page: number = 1, rowsPerPage: number = 5, filtro = null) => {
    try {
      const { data } = await api.get('/email');

      data.forEach((email: any) => {
        email.empresa_name = email.company_id.nombre_comercial
        email.host = email.host == '' ? '----------' : email.host
        email.usuario = email.usuario == '' ? '----------' : email.usuario
        email.password = email.password == '' ? '----------' : email.password
      });

      rows.value = data;
    } catch (error) {
      console.log(error)
    }
  }

  async function onRequest ( props:any ) {

    const { page, rowsPerPage, sortBy, descending } = props.pagination;

    loading.value = true

    await getEmails( page, rowsPerPage );

    pagination.value.page        = page
    pagination.value.rowsPerPage = rowsPerPage
    pagination.value.sortBy      = sortBy
    pagination.value.descending  = descending

    loading.value = false
  }

  onMounted(() => {
    tableRef.value.requestServerInteraction()
  })

  const mode = ref("list");
</script>

<template>
  <div class="q-ma-lg q-pt-md">
    <div class="row q-col-gutter-lg">
      <div class="col-12">
        <q-card flat class="shadow_custom">
            <q-table title-class="text-grey-7 text-h6" title="Emails Config"
              :rows="rows" :loading="loading" :hide-header="mode === 'grid'"
              :columns="columns" row-key="name" :grid="mode==='grid'"
              :filter="filter" v-model:pagination="pagination"
              :rows-per-page-options="[3, 7, 15, 0]" ref="tableRef"
              binary-state-sort @request="onRequest">

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

            <template v-slot:body-cell-acciones="props">
              <q-td :props="props">
                <q-btn v-if="validarPermisos('editar.correo')" round color="blue-grey"
                @click="$router.push({ name: 'email.edit', params: { email_id: props.row.company_id.id } })"
                  icon="edit" class="q-mr-sm" size="12px" />
              </q-td>
            </template>

            <template v-slot:body-cell-estado="props">
              <q-td :props="props">
                <q-badge outline class="q-py-xs q-px-md"
                  :color="( props.row.isActive ) ? 'positive' : 'dark'">
                    <span v-if="props.row.isActive">Activo</span>
                    <span v-else>Inactivo</span>
                </q-badge>
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

</template>

