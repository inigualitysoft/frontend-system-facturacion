<script setup lang="ts">
import { ref } from 'vue';
import { useSucursal } from '../composables/useSucursal';

  const props = defineProps<{ edit: boolean }>();

  const { 
    api,
    claim,
    cargarCompanies,
    formSucursal, 
    loading, 
    allowOnlyNumber,
    listCompanies,
    onSubmit 
  } = useSucursal();

  cargarCompanies();
</script>

<template>
  <q-form @submit="onSubmit( props.edit )">
    <div class="row q-pt-lg q-gutter-lg justify-center">
      <div class="col-xs-12 col-md-11">
        <label>Nombre del establecimiento:</label>
        <q-input v-model.trim="formSucursal.nombre" dense filled required />
      </div>

      <div class="col-xs-12 col-md-11">
        <label>Dirección:</label>
        <q-input v-model.trim="formSucursal.direccion" dense filled required />
      </div>

      <div class="col-xs-12 col-md-5">
        <label>Numero de Establecimiento:</label>
        <q-input :type="$q.platform.is.mobile ? 'number' : 'text'"
          v-model="formSucursal.establecimiento" 
          :maxlength="3" dense filled required @keyup="allowOnlyNumber" />
      </div>

      <div class="col-xs-12 col-md-5">
        <label>N° punto de emisión:</label>
        <q-input :type="$q.platform.is.mobile ? 'number' : 'text'"
          v-model="formSucursal.punto_emision" 
          :maxlength="3" dense filled required @keyup="allowOnlyNumber" />
      </div>

      <div class="col-xs-12 col-md-5">
        <label>N° secuencial Factura:</label>
        <q-input :type="$q.platform.is.mobile ? 'number' : 'text'"
          v-model.trim="formSucursal.secuencia_factura_produccion" 
          :maxlength="9" @keyup="allowOnlyNumber"
          dense filled required />
      </div>

      <div class="col-xs-12 col-md-5">
        <label>N° secuencial Factura Pruebas:</label>
        <q-input :type="$q.platform.is.mobile ? 'number' : 'text'"
          v-model.trim="formSucursal.secuencia_factura_pruebas" 
          :maxlength="9" @keyup="allowOnlyNumber"
          dense filled required />
      </div>
      <div class="col-xs-12 col-md-5">
        <label>N° secuencial Nota de Crédito:</label>
        <q-input :type="$q.platform.is.mobile ? 'number' : 'text'"
          v-model.trim="formSucursal.secuencia_nota_credito_produccion" 
          :maxlength="9" @keyup="allowOnlyNumber"
          dense filled required />
      </div>

      <div class="col-xs-12 col-md-5">
        <label>N° secuencial Nota de Crédito Pruebas:</label>
        <q-input :type="$q.platform.is.mobile ? 'number' : 'text'"
          v-model.trim="formSucursal.secuencia_nota_credito_pruebas" 
          :maxlength="9" @keyup="allowOnlyNumber"
          dense filled required />
      </div>

      <div class="col-xs-12 col-md-5">
        <label>Ambiente:</label>
        <q-select dense v-model.trim="formSucursal.ambiente" filled 
          :options="['PRODUCCION', 'PRUEBA']" />
      </div>

      <div v-if="claim.roles[0] == 'Super-Administrador'"
        class="col-xs-12 col-md-5">
        <label>Empresa:</label>
        <q-select dense v-model.trim="formSucursal.company_id" filled 
          :options="listCompanies" emit-value map-options />
      </div>

      <div class="col-xs-9 col-md-12 flex justify-center">
        <q-btn :label=" !edit ? 'Guardar' : 'Editar'" :loading="loading"
          class="q-px-xl q-my-xs" type="submit" color="green-9"/>
      </div>

    </div>
  </q-form>
</template>
