<script setup>
  import { ref } from 'vue'
  import Vue3QTelInput from 'vue3-q-tel-input'
  import useHelpers from "../../../composables/useHelpers";

  const props = defineProps(['detalleFactura']);
  const emit  = defineEmits(['closeModal']);
  const { api, mostrarNotify, claim } = useHelpers();

  const existError = ref(false);
  const loading = ref(false);
  const formEnvio = ref({
    tipo_envio: '',
    telefono: '',
    email: ''
  })

  formEnvio.value.telefono = props.detalleFactura.customer_id.celular
  formEnvio.value.email = props.detalleFactura.customer_id.email

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

  function convertirFormatoTelefono(numero) {
      // Verificar si el número ya está en el formato correcto para Ecuador (comienza con '593')
      if (numero.startsWith('593')) {
          // Si ya está en el formato correcto, no hacemos nada
          return numero;
      } else {
          // Si no está en el formato correcto, lo convertimos
          // Eliminamos cualquier espacio en blanco o guiones en el número
          numero = numero.replace(/\s/g, '').replace(/-/g, '');

          // Verificar si el número comienza con '0' (indicativo de Ecuador)
          if (numero.startsWith('0')) {
              // Eliminar el '0' inicial y agregar '593' al principio
              return '593' + numero.substring(1);
          } else {
              // Si no comienza con '0', agregar '593' al principio
              return '593' + numero;
          }
      }
  }

  const validaciones = ref({
    telefono:   { message: '', isValid: true },
    tipo_envio: { message: '', isValid: true },
    email:      { message: '', isValid: true },
  })

  const sendEmail = async () => {

    const { data } = await api.get(`/companies/find/${ claim.company.id }`);

    if ( validarCampos() ) return;

    if ( (formEnvio.value.tipo_envio == 'whatsapp' || formEnvio.value.tipo_envio == 'ambas')
      && !validaciones.value.telefono.isValid ) return

    try {
      loading.value = true;

      await api.post('/CE/facturas/reenviar-comprobantes', {
        ...formEnvio.value,
        factura: props.detalleFactura,
        number: formEnvio.value.telefono,
        telefono: convertirFormatoTelefono(data[0].telefono)
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

  const showError = (value) => {
    validaciones.value.telefono.isValid = !value
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
          <label>Celular del cliente:</label>
          <vue3-q-tel-input
            default-country="EC"
            search-text="Buscar pais..."
            @update:model-value="validaciones.telefono.isValid = true"
            @error="showError"
            :error="!validaciones.telefono.isValid"
            filled dense v-model:tel="formEnvio.telefono">
            <template v-slot:error>
              <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                {{ validaciones.telefono.message }}
              </label>
            </template>
          </vue3-q-tel-input>
        </div>
        <div v-if="formEnvio.tipo_envio == 'email' || formEnvio.tipo_envio == 'ambas'"
          class="col-xs-11 col-sm-9 text-center">
          <label>Email del cliente:</label>
          <q-input type="email"
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
@import 'vue3-q-tel-input/dist/vue3-q-tel-input.esm.css';
.resaltarTextoInput{
  font-size: 15px;
  text-align: center;
  color: #313131;
  font-weight: 500;
}
</style>
