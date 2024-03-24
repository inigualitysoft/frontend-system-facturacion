<script setup>
  import { Manager } from "socket.io-client";
  import { onMounted, ref } from "vue";

  let socket;
  const estado = ref('desconectado')

  onMounted(() => {
    const qrcode = document.getElementById("qrcode");
    const iduser = document.getElementById("iduser");

    const manager = new Manager(`${ import.meta.env.VITE_API_WHATSAPP }/socket.io/socket.io.js`);

      socket = manager.socket('/');

      socket.on('qr', url => {
        console.log(qrcode);
        qrcode.setAttribute("src", url)
      });

      socket.on('qrstatus',src => {
        if ( src.includes('check') ) estado.value = 'conectado'
        if ( src.includes('loader') ) estado.value = 'cargando'

        qrcode.setAttribute("src",src)
      })

      socket.on("user",user =>{
        iduser.innerHTML=user
      })
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