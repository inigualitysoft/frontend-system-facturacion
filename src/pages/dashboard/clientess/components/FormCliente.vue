<script setup lang="ts">
import { useCliente } from '../composables/useCliente';
const props = defineProps<{ edit: boolean }>();
const {
    formCliente,
    loading,
    allowOnlyNumber,
    validateNumDocument,
    validateNumCelular,
    onSubmit
  } = useCliente();
</script>

<template>
  <q-form @submit="onSubmit( props.edit )">
    <div class="row q-pt-lg q-gutter-lg justify-center">

      <div class="col-xs-12 col-sm-11" :class="[ !$q.screen.xs ? 'q-px-md' : '' ]">
        <label>Razón Social:</label>
        <q-input v-model.trim="formCliente.nombres" dense filled required />
      </div>

      <div class="col-xs-12 col-sm-5">
        <label>Tipo de Documento:</label>
        <q-select dense v-model.trim="formCliente.tipo_documento" filled
          emit-value map-options
          :options="[
            { label: 'RUC', value: '04' },
            { label: 'Cedula', value: '05' },
            { label: 'Pasaporte', value: '06' }
            ]" />
      </div>

      <div class="col-xs-12 col-sm-5">
        <label>Numero de Documento:</label>
        <q-input v-model="formCliente.numero_documento"
          :disable="formCliente.tipo_documento === '' "
          counter :maxlength="formCliente.tipo_documento === '04' ? 13 : 10"
          :rules="validateNumDocument"
          lazy-rules
          dense filled required @keyup="allowOnlyNumber" />
      </div>

      <div class="col-xs-12 col-sm-5">
        <label>Email:</label>
        <q-input v-model.trim="formCliente.email" type="email" dense filled required />
      </div>

      <div class="col-xs-12 col-sm-5">
        <label>Celular:</label>
        <q-input v-model.trim="formCliente.celular"
          counter maxlength="10"
          :rules="validateNumCelular"
          lazy-rules @keyup="allowOnlyNumber"
          dense filled required />
      </div>

      <div class="col-xs-12 col-sm-11" :class="[ !$q.screen.xs ? 'q-px-md' : '' ]">
        <label>Dirección:</label>
        <q-input v-model="formCliente.direccion" dense filled required />
      </div>

      <div class="col-xs-9 col-sm-12  flex justify-center">
        <q-btn :label=" !edit ? 'Guardar' : 'Editar'" :loading="loading"
          class="q-px-xl" type="submit" outline rounded style="color: #696cff" />
      </div>

    </div>
  </q-form>
</template>