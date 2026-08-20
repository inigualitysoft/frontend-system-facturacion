<script setup>
  import { ref, computed, onMounted } from 'vue';
  import { useIngresoEgreso } from '../composables/useIngresoEgreso';

  const { api, cabecera } = useIngresoEgreso();

  const anio  = ref( new Date().getFullYear() );

  // Solo se resalta si se está viendo el año en curso: marcar "Agosto" mientras
  // se consulta 2025 señalaría un mes que ya pasó.
  const anioActual = new Date().getFullYear();
  const mesActual  = new Date().getMonth();

  const esMesActual = ( indice ) => anio.value === anioActual && indice === mesActual;
  const filas = ref([]);
  const cargando = ref( false );

  // Cinco años hacia atrás alcanza para comparar y evita un select interminable.
  const anios = Array.from({ length: 6 }, ( _, i ) => new Date().getFullYear() - i );

  const totales = computed(() => filas.value.reduce(( acumulado, fila ) => ({
    ingresos: acumulado.ingresos + Number( fila.ingresos ),
    egresos:  acumulado.egresos  + Number( fila.egresos ),
    total:    acumulado.total    + Number( fila.total )
  }), { ingresos: 0, egresos: 0, total: 0 }));

  const formatear = ( valor ) =>
    Number( valor ?? 0 ).toLocaleString('es-EC', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

  const cargar = async () => {
    cargando.value = true;
    try {
      const { data } = await api.get('/ingresos-egresos/estadisticas-anuales', {
        ...cabecera.value,
        params: { anio: anio.value }
      });

      filas.value = data;
    } catch (error) {
      console.log( error );
    } finally {
      cargando.value = false;
    }
  }

  defineExpose({ cargar });

  onMounted( cargar );
</script>

<template>
  <q-card flat class="shadow_custom q-mt-lg">
    <q-card-section class="row items-center q-pb-none">
      <q-icon name="bar_chart" size="24px" class="q-mr-sm text-blue-grey" />
      <div class="text-h6 col">Estadísticas por mes</div>

      <q-select v-model="anio" :options="anios" outlined dense emit-value
        style="min-width: 120px" @update:model-value="cargar" />
    </q-card-section>

    <q-card-section>
      <q-markup-table flat bordered dense wrap-cells class="tabla-estadisticas">
        <thead>
          <tr class="bg-blue-grey-9 text-white">
            <th class="text-left">MES</th>
            <th class="text-right">INGRESOS</th>
            <th class="text-right">EGRESOS</th>
            <th class="text-right">TOTAL</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="( fila, indice ) in filas" :key="fila.mes"
            :class="{ 'mes-actual': esMesActual( indice ) }">
            <td class="text-left">
              {{ fila.mes }}
              <q-badge v-if="esMesActual( indice )" color="primary" class="q-ml-sm">
                mes actual
              </q-badge>
            </td>
            <td class="text-right">{{ formatear( fila.ingresos ) }}</td>
            <td class="text-right">{{ formatear( fila.egresos ) }}</td>
            <td class="text-right text-weight-bold"
              :class="Number( fila.total ) < 0 ? 'text-negative' : ''">
              {{ formatear( fila.total ) }}
            </td>
          </tr>

          <tr class="bg-grey-3 text-weight-bold">
            <td class="text-left">TOTAL {{ anio }}</td>
            <td class="text-right">{{ formatear( totales.ingresos ) }}</td>
            <td class="text-right">{{ formatear( totales.egresos ) }}</td>
            <td class="text-right" :class="totales.total < 0 ? 'text-negative' : ''">
              {{ formatear( totales.total ) }}
            </td>
          </tr>
        </tbody>
      </q-markup-table>

      <q-inner-loading :showing="cargando">
        <q-spinner-dots size="40px" color="primary" />
      </q-inner-loading>
    </q-card-section>
  </q-card>
</template>

<style scoped>
/* La fila de totales se lee mejor separada del resto. */
.tabla-estadisticas tbody tr:last-child td{
  border-top: 2px solid rgba(0,0,0,.24);
}

/* El mes en curso, con una franja a la izquierda para ubicarlo de un vistazo. */
.mes-actual td{
  background: rgba(25, 118, 210, .09);
  font-weight: 600;
}
.mes-actual td:first-child{
  box-shadow: inset 3px 0 0 var(--q-primary);
}
.body--dark .mes-actual td{
  background: rgba(144, 202, 249, .14);
}
</style>
