<script setup>
  import { ref } from 'vue'
  import useHelpers from "../../../composables/useHelpers";

  const props = defineProps(['detalleFactura']);
  const emit  = defineEmits(['closeModal']);
  const { api, mostrarNotify } = useHelpers();

  const existError = ref(false);
  const loading = ref(false);
  const formEnvio = ref({
    tipo_envio: '',
    telefono: '',
    email: ''
  })

  const validarCampos = () => {
    existError.value = false;
    const validEmail =  /^\w+([.-_+]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/;

    let camposRequeridos = [];

    if ( formEnvio.value.tipo_envio == 'whatsapp' ) camposRequeridos.push('telefono')
    if ( formEnvio.value.tipo_envio == 'email' ) camposRequeridos.push('email')
    if ( formEnvio.value.tipo_envio == 'ambas' ) camposRequeridos = ['telefono', 'email']
    if ( formEnvio.value.tipo_envio == '' ) camposRequeridos = ['tipo_envio']

    if( formEnvio.value.email.length > 5 && !validEmail.test(formEnvio.value.email) ){
      validaciones.value.email.message = 'Ingresa un email valido'
      validaciones.value.email.isValid = false
      existError.value = true;
    }

    camposRequeridos.forEach( campo => {
      if ( formEnvio.value[campo].length == 0 ) {
        validaciones.value[campo].message = 'Debes completar este campo'
        validaciones.value[campo].isValid = false;
        existError.value = true;
      }
    })
    return existError.value;
  }

  const validaciones = ref({
    telefono:   { message: '', isValid: true },
    tipo_envio: { message: '', isValid: true },
    email:      { message: '', isValid: true },
  })

  const sendEmail = async () => {
    if ( validarCampos() ) return;

    try {
      loading.value = true;
      await api.post('/CE/facturas/reenviar-comprobantes', {
        ...formEnvio.value,
        factura: props.detalleFactura
      });
      mostrarNotify('positive', 'Comprobantes enviados')
      emit('closeModal')
      loading.value = false;
    } catch (error) {
      loading.value = false;
      mostrarNotify('warning', error.response.data.message)
      emit('closeModal')
    }
  }

</script>

<template>
  <q-card style="width: 400px; max-width: 80vw;">
    <q-card-section>
      <div class="text-h6 text-center">
        Enviar Comprobantes
        <q-btn round flat dense icon="close" class="float-right" color="grey-8" v-close-popup></q-btn>
      </div>
    </q-card-section>

    <q-separator inset></q-separator>

    <q-card-section class="q-pt-none">
      <div class="row flex flex-center">
        <div class="col-xs-11 col-sm-9 text-center q-mt-md q-mb-lg">
          <label>Enviar por:</label>
          <q-select filled dense v-model="formEnvio.tipo_envio"
            :error="!validaciones.tipo_envio.isValid"
            @update:model-value="validaciones.email.isValid = true,
                validaciones.telefono.isValid = true, validaciones.tipo_envio.isValid = true"
            emit-value map-options :options="[
                  { label: 'WhatsApp', value: 'whatsapp' },
                  { label: 'Email', value: 'email' },
                  { label: 'Ambas', value: 'ambas' },
                ]">
            <template v-slot:append>
              <q-icon v-if="formEnvio.tipo_envio.length != 0 && formEnvio.tipo_envio == 'whatsapp'"
                name="fa-brands fa-whatsapp" color="teal-7" />
              <q-icon v-if="formEnvio.tipo_envio.length != 0 && formEnvio.tipo_envio == 'email'"
                        name="mail" color="indigo-5" />
              <q-icon v-if="formEnvio.tipo_envio.length != 0 && formEnvio.tipo_envio == 'ambas'"
                        name="fa-solid fa-list-check" color="deep-orange-4" />
            </template>
            <template v-slot:error>
              <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                {{ validaciones.tipo_envio.message }}
              </label>
            </template>
          </q-select>
        </div>
        <div v-if="formEnvio.tipo_envio == 'whatsapp' || formEnvio.tipo_envio == 'ambas'"
          class="col-xs-11 col-sm-9 text-center q-mb-md">
          <label>Numero Celular:</label>
          <q-input :type="$q.platform.is.mobile ? 'number' : 'text'"
            v-model="formEnvio.telefono"
            counter maxlength="10"
            input-class="resaltarTextoInput"
            :error="!validaciones.telefono.isValid"
            @keyup="formEnvio.telefono = formEnvio.telefono.replace(/\D/g, ''), validaciones.telefono.isValid = true"
            lazy-rules dense filled>
            <template v-slot:error>
              <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                {{ validaciones.telefono.message }}
              </label>
            </template>
          </q-input>
        </div>
        <div v-if="formEnvio.tipo_envio == 'email' || formEnvio.tipo_envio == 'ambas'"
          class="col-xs-11 col-sm-9 text-center">
          <label>Email del cliente:</label>
          <q-input type="text"
            v-model="formEnvio.email"
            input-class="resaltarTextoInput"
            :error="!validaciones.email.isValid"
            @update:model-value="validaciones.email.isValid = true"
            lazy-rules dense filled>
            <template v-slot:error>
              <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                {{ validaciones.email.message }}
              </label>
            </template>
          </q-input>
        </div>

        <div class="col-xs-9 col-md-12 flex justify-center q-ml-none">
          <q-btn label="Enviar" @click="sendEmail" :loading="loading"
          class="q-px-xl q-mt-md q-mb-md" outline rounded style="color: #696cff" />
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>
<style>
.resaltarTextoInput{
  font-size: 15px;
  text-align: center;
  color: #313131;
  font-weight: 500;
}
</style>
