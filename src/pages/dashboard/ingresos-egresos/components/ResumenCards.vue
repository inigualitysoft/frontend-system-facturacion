<script setup>
  const props = defineProps({ resumen: { type: Object, required: true } });

  const formatear = ( valor ) =>
    Number( valor ?? 0 ).toLocaleString('es-EC', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

  const tarjetas = [
    { titulo: 'INGRESOS HOY',   clave: 'totalIngresosHoy', icono: 'trending_up',    color: 'bg-teal-6' },
    { titulo: 'TOTAL INGRESOS', clave: 'totalIngresos',    icono: 'account_balance_wallet', color: 'bg-green-6' },
    { titulo: 'EGRESOS HOY',    clave: 'totalEgresosHoy',  icono: 'trending_down',  color: 'bg-orange-7' },
    { titulo: 'TOTAL EGRESOS',  clave: 'totalEgresos',     icono: 'payments',       color: 'bg-blue-7' }
  ];
</script>

<template>
  <div class="row q-col-gutter-md q-mb-md">

    <div v-for="tarjeta in tarjetas" :key="tarjeta.clave"
      class="col-12 col-sm-6 col-md">
      <q-card flat class="text-white" :class="tarjeta.color">
        <q-card-section class="row items-center no-wrap">
          <div class="col">
            <div class="text-caption text-weight-bold">{{ tarjeta.titulo }}</div>
            <div class="text-h6">$ {{ formatear( props.resumen[ tarjeta.clave ] ) }}</div>
          </div>
          <q-icon :name="tarjeta.icono" size="42px" class="q-ml-sm" style="opacity: .35" />
        </q-card-section>
      </q-card>
    </div>

    <!-- El balance decide de qué color se pinta: en rojo cuando se gastó de más. -->
    <div class="col-12 col-sm-6 col-md">
      <q-card flat class="text-white"
        :class="Number( props.resumen.balance ) < 0 ? 'bg-red-7' : 'bg-deep-purple-6'">
        <q-card-section class="row items-center no-wrap">
          <div class="col">
            <div class="text-caption text-weight-bold">BALANCE</div>
            <div class="text-h6">$ {{ formatear( props.resumen.balance ) }}</div>
          </div>
          <q-icon name="balance" size="42px" class="q-ml-sm" style="opacity: .35" />
        </q-card-section>
      </q-card>
    </div>

  </div>
</template>
