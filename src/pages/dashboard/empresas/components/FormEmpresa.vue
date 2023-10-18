<script setup lang="ts">
  import { useEmpresa } from '../composables/useEmpresa';
  import { ref, watch } from 'vue';

  const props = defineProps<{ edit: boolean }>();

  const { 
    actualizarLista,
    formEmpresa,
    loading,
    limpiarFormulario,
    allowOnlyNumber,
    validateNumRuc,
    validateNumCelular,
    transformToUpperCase,
    onRejected,
    onSubmit,
    modalAgregarEmpresa,
    modalEditarEmpresa,
    isPwd,
    isValid
  } = useEmpresa();

  watch(
    () => formEmpresa.value.clave_certificado,
    (newValue, oldValue) => {
      if ( isValid.value && newValue !== oldValue ) isValid.value = false;
    },
    { deep: true }
  )

</script>

<template>
  <q-form @submit="onSubmit( props.edit )">
    <div class="row q-pt-lg q-gutter-lg justify-center">

      <div class="col-xs-12 col-md-5">
        <label>R.U.C</label>
        <q-input v-model="formEmpresa.ruc" 
          counter maxlength="13"
          :rules="validateNumRuc"
          @keyup="allowOnlyNumber" lazy-rules
          dense filled required />
      </div>

      <div class="col-xs-12 col-md-5">
        <label>Razón Social</label>
        <q-input v-model.trim="formEmpresa.razon_social" 
          @keyup="transformToUpperCase"
          dense filled required />
      </div>

      <div class="col-xs-12 col-md-5">
        <label>Nombre Comercial:</label>
        <q-input v-model.trim="formEmpresa.nombre_comercial" 
          @keyup="transformToUpperCase"
          dense filled required />
      </div>

      <div class="col-xs-12 col-md-5">
        <label>Dirección:</label>
        <q-input v-model.trim="formEmpresa.direccion_matriz" dense filled required />
      </div>

      <div class="col-xs-12 col-md-5">
        <label>Email:</label>
        <q-input v-model.trim="formEmpresa.email" type="email" dense filled required />
      </div>

      <div class="col-xs-12 col-md-5">
        <label>Obligado Contabilidad:</label>
        <q-toggle color="green" size="lg" v-model="formEmpresa.obligado_contabilidad"/>
      </div>

      <div class="col-xs-12 col-md-5">
        <label>Celular:</label>
        <q-input v-model="formEmpresa.telefono" 
          counter maxlength="10"
          :rules="validateNumCelular"
          @keyup="allowOnlyNumber" lazy-rules
          dense filled required />
      </div>

      <div class="col-xs-12 col-md-5">
        <label>Clave Certificado:</label>
        <q-input :type="isPwd ? 'password' : 'text'" filled v-model.trim="formEmpresa.clave_certificado" dense required 
        error-message="La clave del certificado es incorrecta"
        :error="isValid">
          <template v-slot:append>
            <q-icon :name="isPwd ? 'visibility_off' : 'visibility'" color="blue-grey"
              class="cursor-pointer" @click="isPwd = !isPwd" />
          </template>
          <template v-slot:prepend>
            <q-icon name="key" color="blue-grey-3" />
          </template>
        </q-input>
      </div>
      
      <div class="col-xs-12 col-md-5">
        <label>Cargar Certificado:</label>
        <q-file dense filled bottom-slots 
          accept=".p12" @rejected="onRejected"
          v-model="formEmpresa.archivo_certificado" 
          :label="formEmpresa.archivo_certificado_old == null ? 
            'Cargar Certificado' : formEmpresa.archivo_certificado_old">

          <template v-slot:prepend>
            <q-icon name="attach_file" />
          </template>

          <template v-slot:append>
            <q-icon name="close" 
              v-if="typeof(formEmpresa.archivo_certificado) === 'object' && formEmpresa.archivo_certificado !== null" 
              @click.stop.prevent="formEmpresa.archivo_certificado = null" class="cursor-pointer" />
          </template>

        </q-file>
      </div>
      <div class="col-xs-12 col-md-5">
        <label>Logo de la empresa:</label>
        <q-file dense filled bottom-slots 
          
          v-model="formEmpresa.logo" 
          :label="formEmpresa.logo_old == null ? 
            'Cargar Logo' : formEmpresa.logo_old">

          <template v-slot:prepend>
            <q-icon name="fa-solid fa-image" />
          </template>

          <template v-slot:append>
            <q-icon name="close" 
              v-if="typeof(formEmpresa.logo) === 'object' && formEmpresa.logo !== null" 
              @click.stop.prevent="formEmpresa.logo = null" class="cursor-pointer" />
          </template>

        </q-file>
      </div>

      <div class="col-xs-9 col-sm-12  flex justify-center">
        <q-btn :label=" !edit ? 'Guardar' : 'Editar'" :loading="loading"
          class="q-px-xl" type="submit" color="green-9"/>
      </div>

    </div>
  </q-form>
</template>


