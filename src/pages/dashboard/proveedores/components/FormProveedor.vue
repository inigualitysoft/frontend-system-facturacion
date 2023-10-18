<script setup lang="ts">
  import { useProveedor } from "../composables/useProveedor";

  const props = defineProps<{ edit: boolean }>();

  const { 
    formProveedor, 
    listProvincias, 
    listCantones, 
    loading, 
    allowOnlyNumber,
    validateNumDocument,
    validateNumCelular,
    onSubmit 
  } = useProveedor();

</script>

<template>
  <q-form @submit="onSubmit( props.edit )">
    <div class="row q-pt-lg q-gutter-lg justify-center">

      <div class="col-xs-12 col-sm-5">
        <label>Razon Social:</label>
        <q-input v-model.trim="formProveedor.razon_social" dense filled required />
      </div>

      <div class="col-xs-12 col-sm-5">
        <label>Email:</label>
        <q-input v-model.trim="formProveedor.email" type="email" dense filled required />
      </div>

      <div class="col-xs-12 col-sm-5">
        <label>Tipo de Documento:</label>
        <q-select dense v-model.trim="formProveedor.tipo_documento" filled 
          :options="['Cedula', 'RUC', 'Pasaporte']" />
      </div>

      <div class="col-xs-12 col-sm-5">
        <label>Numero de Documento:</label>
        <q-input v-model="formProveedor.numero_documento" 
          :disable="formProveedor.tipo_documento === '' "
          counter :maxlength="formProveedor.tipo_documento === 'RUC' ? 13 : 10"
          :rules="validateNumDocument"
          lazy-rules
          dense filled required @keyup="allowOnlyNumber" />
      </div>

      <div class="col-xs-12 col-sm-5">
        <label>Celular:</label>
        <q-input v-model.trim="formProveedor.celular" 
          counter maxlength="10"
          :rules="validateNumCelular"
          lazy-rules @keyup="allowOnlyNumber"
          dense filled required />
      </div>

      <div class="col-xs-12 col-sm-5">
        <label>Dirección:</label>
        <q-input v-model.trim="formProveedor.direccion" dense filled required />
      </div>

      <div class="col-xs-12 col-sm-5">
        <label>Provincia:</label>
        <q-select filled v-model.trim="formProveedor.provincia" dense :options="listProvincias" />
      </div>

      <div class="col-xs-12 col-sm-5">
        <label>Ciudad:</label>
        <q-select filled v-model.trim="formProveedor.ciudad" dense :options="listCantones" />
      </div>

      <div class="col-xs-9 col-sm-12  flex justify-center">
        <q-btn :label=" !edit ? 'Guardar' : 'Editar'" :loading="loading"
          class="q-px-xl" type="submit" color="green-9"/>
      </div>

    </div>
  </q-form>
</template>


