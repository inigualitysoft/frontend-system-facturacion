<script setup>
  import { ref, watch, onMounted, computed } from 'vue';
  import { api } from "boot/axios";
  import useHelpers from "../../../../composables/useHelpers";
  import { useRedIpv4 } from "./composables/useRedIpv4";
  import { useCliente } from "../../clientes/composables/useCliente.js";

  const { obtenerListaSubred, groupedIpsByRed } = useCliente();

  const columns = [
    { name: 'acciones', label: 'acciones', align: 'center' },
    { align: 'center', label: 'Nombre', field: 'nombre', name: 'nombre' },
    { align: 'center', label: 'Red', field: 'red', name: 'red' },
    { align: 'center', label: 'Uso IPS', field: 'uso_ips', name: 'uso_ips' },
    { align: 'center', label: 'CIDR', name: 'cidr', field: 'cidr' },
    { align: 'center', label: 'Router', field: 'router_name', name: 'router_name' },
    { name: 'estado', label: 'Estado', align: 'center', field: 'estado' },
  ]

  const selectedRouter = ref('');
  let { listRouter, cargarRouter } = useRedIpv4();
  const { mostrarNotify, confirmDelete, isDeleted } = useHelpers();

  const filter  = ref('')
  const rows    = ref([]);
  const loading = ref( false );
  const ipsUsadas = [];

  const obtenerRango = (ipCidr) => {
    // Divide la IP y el prefijo
    const [ip, prefijo] = ipCidr.split('/');
    const prefijoNum = parseInt(prefijo, 10);

    // Convierte la dirección IP a un número entero
    function ipToNumber(ip) {
      return ip.split('.').reduce((acc, octeto) => (acc << 8) + parseInt(octeto, 10), 0);
    }

    // Convierte un número entero a una dirección IP
    function numberToIp(numero) {
      return Array.from({ length: 4 }, (_, i) => (numero >> (8 * (3 - i))) & 255).join('.');
    }

    // Calcula el rango de inicio y fin
    const ipNumero = ipToNumber(ip);
    const mascara = (1 << (32 - prefijoNum)) - 1;
    const rangoInicio = numberToIp(ipNumero & ~mascara);
    const rangoFin = numberToIp(ipNumero | mascara);

    return { rangoInicio, rangoFin };
  }

  const perteneceARango = (ip, rangoInicio, rangoFin) => {
    // Convierte la dirección IP y los extremos del rango a números enteros
    function ipToNumber(ip) {
      return ip.split('.').reduce((acc, octeto) => (acc << 8) + parseInt(octeto, 10), 0);
    }

    const ipNumero = ipToNumber(ip);
    const rangoInicioNumero = ipToNumber(rangoInicio);
    const rangoFinNumero = ipToNumber(rangoFin);

    // Verifica si la IP está en el rango
    return ipNumero >= rangoInicioNumero && ipNumero <= rangoFinNumero;
  }

  const getRedesIpv4 = async () => {
    loading.value = true;
    try {

      let headers = { headers: { router_id: selectedRouter.value } };

      const resp = await api.get(`/customers/get-ips/${ selectedRouter.value }`);
      resp.data.forEach( x => { ipsUsadas.push( x.ipv4 ) })

      const { data } = await api.get('/red-ipv4', headers);

      data.forEach((x) => {
        x.router_name = x.router_id.nombre;
        x.cidr = x.cidr.split(' ')[0];

        const listIps = obtenerListaSubred(`${ x.red }/${ x.cidr }`);

        x.totalIps = listIps.length - 2;

        const { rangoInicio, rangoFin } = obtenerRango(`${x.red}/${x.cidr}`);
        const ipsEnRango = ipsUsadas.filter(ip => perteneceARango(ip, rangoInicio, rangoFin));

        x.totalIpsUsadas = ipsEnRango.length;

        const porcentaje = (Math.floor( ((x.totalIpsUsadas * 100) / x.totalIps) * 100) / 100) / 100;

        x.porcentaje = porcentaje;
      });
      rows.value = data;
    } catch (error) {
      mostrarNotify( 'warning', error.response.data.message )
    }
    loading.value = false;
  }

  const activarDesactivarRed = async (id, estado) => {
    try {
      const { data: { msg } } = await api.patch(`/red-ipv4/${ id }/${ estado }`)
      mostrarNotify('positive', msg );
      getRedesIpv4();
    } catch (error) {
      console.log(error);
    }
  }

  watch( isDeleted, ( newValue, _ ) => { if ( newValue ) getRedesIpv4() });
  const eliminarRedIPv4 = async (id ) => {
    try {
      confirmDelete('Estas seguro de eliminar esta red IPv4?', `/red-ipv4/${ id }`);
    } catch (error) {
      console.log(error);
    }
  }

  onMounted(async () => {
    await cargarRouter()
    if ( listRouter.value.length > 0 ) selectedRouter.value = listRouter.value[0].value
    getRedesIpv4();
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
            title="Redes IPv4"
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
              <div v-if="listRouter.length > 1"
              style="display: flex" :class="[ $q.screen.xs ? 'q-mb-md' : '' ]">
                <label class="q-mr-sm row items-center">
                  <span>Router: </span>
                </label>
                <q-select outlined dense v-model="selectedRouter"
                  @update:model-value="getRedesIpv4"
                  emit-value map-options
                  :options="listRouter">
                </q-select>
              </div>
              <div v-else
                class="text-center row justify-center" style="width: 100%;">
                <label class="q-mb-sm text-grey-7 text-h6">
                  Redes IPv4
                </label>
              </div>
            </template>

            <template v-slot:top-right="props">
              <q-btn v-if="!$q.screen.xs"
                @click="$router.push({ name: 'redesIpv4.add' })"
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

            <template v-slot:body-cell-uso_ips="props">
              <q-td :props="props">
                <template v-if="true">
                  <div :style="$q.screen.xs ? 'min-width: 180px;' : 'min-width: 140px;'">
                    <q-linear-progress stripe rounded size="25px"
                      :value="props.row.porcentaje" color="cyan-9">
                      <div class="absolute-full flex justify-around">

                        <q-badge color="transparent" class="text-weight-bold"
                        :text-color="$q.dark.isActive ? 'grey-3' : 'grey-9'"
                        :label="(props.row.porcentaje * 100).toFixed(2) + '%'" />

                        <q-badge color="transparent" class="text-weight-bolder"
                        :text-color="$q.dark.isActive ? 'grey-3' : 'grey-9'"
                          :label="`(${ props.row.totalIpsUsadas } de ${ props.row.totalIps })`" />

                      </div>
                    </q-linear-progress>
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
                  @click="$router.push({ name: 'redesIpv4.edit', params: { id: props.row.id } })"
                  icon="edit" class="q-mr-sm" size="10px" />

                <template v-if="props.row.isActive">
                  <q-btn round color="blue-grey"
                    v-if="props.row.isActive "
                    icon="close"
                    @click="activarDesactivarRed(props.row.id, false)"
                    size="10px" />
                </template>

                <template v-else>
                  <q-btn round color="blue-grey"
                    v-if="!props.row.isActive"
                    icon="done"
                    @click="activarDesactivarRed(props.row.id, true)"
                    size="10px" />

                  <q-btn round color="blue-grey" class="q-ml-sm"
                    v-if="!props.row.isActive"
                      icon="delete" @click="eliminarRedIPv4(props.row.id)"
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
      v-if="$q.screen.xs">
    <q-btn round color="secondary" size="lg" icon="add"
      @click="$router.push({ name: 'redesIpv4.add' })" />
  </q-page-sticky>

</template>