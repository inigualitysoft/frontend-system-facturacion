<script setup>
  import { ref, onMounted, onUnmounted } from "vue";
  import axios from "axios";

  // sessionId de la sesión ya creada en el gateway (api-whats-app).
  const props = defineProps({ sessionId: { type: String, required: true } });
  const emit = defineEmits(['vinculado']);

  const qr      = ref('');
  const estado  = ref('cargando');
  const mensaje = ref('');

  let temporizador = null;
  let vivo = true;

  const api = import.meta.env.VITE_API_WHATSAPP;

  const pedirQR = async () => {
    try {
      const { data } = await axios.get(`${ api }/api/whatsapp/qr/${ props.sessionId }`);

      if ( data.status === 'ok' && data.qr ) {
        qr.value     = data.qr;
        estado.value = 'esperando';
        return;
      }

      // 'waiting' con el socket ya abierto significa que quedó vinculado.
      mensaje.value = data.message ?? '';
      estado.value  = data.status === 'disconnected' ? 'error' : 'cargando';
    } catch (error) {
      estado.value  = 'error';
      mensaje.value = error.response?.data?.message ?? 'No se pudo obtener el código QR.';
    }
  }

  /**
   * El gateway no avisa cuando termina la vinculación, así que se le pregunta.
   * Mientras no esté conectado se refresca el QR, que caduca cada pocos minutos.
   */
  const revisarEstado = async () => {
    if ( !vivo ) return;

    try {
      const { data } = await axios.get(`${ api }/api/whatsapp/session/${ props.sessionId }/info`);

      if ( data.connected && data.info?.number ) {
        estado.value = 'conectado';
        emit('vinculado', data.info.number);
        return;
      }

      if ( estado.value !== 'esperando' ) await pedirQR();
    } catch (error) {
      // Un fallo puntual no debe cortar el sondeo: se reintenta en el siguiente.
    }

    if ( vivo ) temporizador = setTimeout( revisarEstado, 4000 );
  }

  onMounted( async () => {
    await pedirQR();
    temporizador = setTimeout( revisarEstado, 4000 );
  })

  onUnmounted(() => {
    vivo = false;
    if ( temporizador ) clearTimeout( temporizador );
  })
</script>

<template>
  <q-card style="width: 480px; max-width: 92vw">
    <q-card-section>
      <div class="text-h6 text-center">
        Vincular WhatsApp
        <q-btn round flat dense icon="close" class="float-right" color="grey-8" v-close-popup />
      </div>
    </q-card-section>

    <q-separator inset />

    <q-card-section class="text-center q-pt-lg">

      <div v-if="estado === 'cargando'" class="q-py-xl">
        <q-spinner-dots color="teal-7" size="60px" />
        <div class="q-mt-md text-blue-grey">Preparando el código QR…</div>
      </div>

      <div v-else-if="estado === 'esperando'">
        <img :src="qr" alt="Código QR" style="width: 260px; max-width: 100%" />
        <div class="q-mt-md">
          Abre WhatsApp en el teléfono, entra en <b>Dispositivos vinculados</b>
          y escanea este código.
        </div>
        <div class="text-caption text-blue-grey q-mt-xs">
          El código se renueva solo mientras esta ventana esté abierta.
        </div>
      </div>

      <div v-else-if="estado === 'conectado'" class="q-py-xl">
        <q-icon name="check_circle" color="green-7" size="70px" />
        <div class="text-h6 q-mt-md">Dispositivo vinculado</div>
      </div>

      <div v-else class="q-py-lg">
        <q-icon name="error_outline" color="negative" size="60px" />
        <div class="q-mt-md">{{ mensaje }}</div>
        <q-btn class="q-mt-md" color="teal-7" no-caps label="Reintentar" @click="pedirQR" />
      </div>

    </q-card-section>
  </q-card>
</template>
