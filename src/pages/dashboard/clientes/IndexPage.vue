<script setup>
  import { ref, watch } from 'vue';
  import { useCliente } from "./composables/useCliente";
  import { date } from 'quasar'

  const columns = [
    { name: 'acciones', label: 'acciones', align: 'center' },
    { name: 'nombre', align: 'center', label: 'Cliente', field: 'nombres', sortable: true },
    { name: 'ip', align: 'center', label: 'IP', field: 'ip', sortable: true },
    { name: 'direccion', align: 'center', label: 'Dirección Servicio', field: 'direccion', sortable: true },
    { name: 'tipo_documento', align: 'center', label: 'T. Doc.', field: 'tipo_documento' },
    { name: 'numero_documento', align: 'center', label: 'Num. de Doc.', field: 'numero_documento' },
    { name: 'email', label: 'Email', field: 'email', align: 'center'},
    { name: 'celular', label: 'Movil', field: 'celular',  align: 'center' },
    { name: 'instalado', label: 'Instalado', field: 'instalado',  align: 'center' },
    { name: 'total_cobrar', label: 'Total Cobrar', field: 'total_cobrar',  align: 'center' },
    { name: 'estado', label: 'Estado', align: 'center', field: 'estado' },
  ]

  let { api, mostrarNotify, confirmDelete, isDeleted, loading } = useCliente();

  const filter = ref('')
  const rows = ref([]);

  const getClientes = async () => {
    loading.value = true;
    try {
      const { data } = await api.get('/customers');
      if ( data.length > 0 ) {
        data.forEach(x => {
          x.ip = x.planInternet[0].ipv4,
          x.total_cobrar = `$${ x.planInternet[0].precio }`,
          x.direccion = `${ x.planInternet[0].direccion == '' ? '- - - - - -' : x.planInternet[0].direccion }`,
          x.instalado = date.formatDate(x.planInternet[0].fecha_instalacion, 'DD/MM/YYYY')
        });
        rows.value = data;
      }
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
  const eliminarCliente = async ( cliente_id ) => {
    try {
      confirmDelete('Estas seguro de eliminar este cliente?', `/customers/${ cliente_id }`);
    } catch (error) {
      console.log(error);
    }
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
              <q-btn v-if="!$q.screen.xs"
                @click="$router.push({ name: 'cliente.add' })"
                outline color="primary" label="Agregar Cliente" class="q-mr-xs"/>

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

                <q-btn v-if="props.row.isActive"
                round color="blue-grey"
                @click="$router.push({ name: 'cliente.edit', params: { client_id: props.row.id } })"
                icon="edit" class="q-mr-sm" size="10px">
                  <q-tooltip class="bg-indigo" anchor="top middle" self="center middle">
                    Editar
                  </q-tooltip>
                </q-btn>

                <template v-if="props.row.isActive">
                  <q-btn round color="blue-grey"
                    v-if="props.row.isActive"
                    icon="close"
                    @click="activarDesactivarCliente(props.row.id, false)"
                    size="10px" />
                </template>

                <template v-else>
                  <q-btn round color="blue-grey"
                    v-if="!props.row.isActive"
                    icon="done"
                    @click="activarDesactivarCliente(props.row.id, true)"
                    size="10px" />

                  <q-btn round color="blue-grey" class="q-ml-sm"
                  v-if="!props.row.estado"
                  icon="delete"
                  @click="eliminarCliente(props.row.id)"
                  size="10px">
                    <q-tooltip class="bg-indigo" anchor="top middle" self="center middle">
                      Eliminar
                    </q-tooltip>
                  </q-btn>

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
      v-if="$q.screen.xs">
    <q-btn round color="secondary" size="lg" icon="add"
    @click="$router.push({ name: 'cliente.add' })" />
  </q-page-sticky>

</template>
