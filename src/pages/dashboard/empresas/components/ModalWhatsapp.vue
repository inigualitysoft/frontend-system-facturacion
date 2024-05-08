<script setup>
  import { Manager } from "socket.io-client";
  import { ref, onMounted } from "vue";
  import axios from "axios";

  const props = defineProps(['movil'])
  const emit = defineEmits(['sendMovil']);

  let socket;
  const estado = ref('desconectado')

  onMounted(async () => {
    const qrcode = document.getElementById("qrcode");
    const iduser = document.getElementById("iduser");

    await axios.post(`https://sms.rednuevaconexion.net/check-state`, { movil: props.movil });

    const manager = new Manager(`https://sms.rednuevaconexion.net/socket.io/socket.io.js`);

    socket = manager.socket('/');

    socket.on('conectado', data => {
      comprobarEstado( data );
    })

    socket.on('qr', data => {
      qrcode.setAttribute("src", data.qr)
    })

    const comprobarEstado = (data) => {
      setTimeout(() => {
        qrcode.setAttribute("src", data.qrstatus)
        iduser.innerHTML = data.user;

        if ( data.qrstatus.includes('check') ){
          estado.value = 'conectado'
          emit('sendMovil', data.user)
        }
        if ( data.qrstatus.includes('loader') ) estado.value = 'cargando'

      }, 2000)
    }
  })

</script>

<template>
  <q-card style="width: 643px !important;max-width: fit-content">
    <q-card-section>
        <div class="text-h6 text-center">
          WhatsApp API QR
          <q-btn round flat dense icon="close" class="float-right" color="grey-8" v-close-popup></q-btn>
        </div>
    </q-card-section>

    <q-separator inset></q-separator>

    <q-card-section class="q-pt-none">
      <q-form style="margin-top: 25px;">
        <div id="qrcode-container" style="text-align: center;">
          <img src="/imgs/loader.gif" alt="loading" id="qrcode" style="width: 250px;">
        </div>
        <div class="card">

          <div class="body">
            <p>

              <li v-if="estado != 'conectado'" class="q-mt-md">
                Escanea el siguiente código QR con tu aplicación de WhatsApp
              </li>

              <h5 id="iduser" class="text-h6"></h5>
            </p>
          </div>
        </div>
      </q-form>
    </q-card-section>

  </q-card>
</template>
<style>
.qrcode{
  padding: 16px;
  margin-bottom: 30px;
}
.qrcode img{
  margin: 0 auto;
  box-shadow: 0 0 10px rgba(67, 67, 68, 0.25);
  padding: 4px;
}

    </style>