<script setup lang="ts">
  import { useSucursal } from '../composables/useSucursal';
  const props = defineProps<{ edit: boolean }>();

  const {
    claim,
    cargarCompanies,
    formSucursal,
    loading,
    listCompanies,
    onSubmit
  } = useSucursal();

  cargarCompanies();
</script>

<template>
  <q-form @submit="onSubmit( props.edit )" class="q-mt-md">
    <div class="row q-col-gutter-md q-px-lg"
    :class="$q.screen.width < 1022 || 'q-col-gutter-y-lg'">

      <div class="col-xs-12 col-md-6">
        <div class="row">
          <div class="col-xs-12 col-md-5 flex items-center justify-end"
            :class="[ $q.screen.width < 1022 ? 'justify-center q-mt-sm q-pb-xs' : 'texto-rigth']">
            <label :class="$q.screen.width < 1022 || 'q-pr-md'">
              Nombre del establecimiento:
            </label>
          </div>
          <div class="col-xs-12 col-md-7">
            <q-input v-model.trim="formSucursal.nombre"
              input-style="text-transform: uppercase;"
              input-class="resaltarTextoInput" dense filled required />
          </div>
        </div>
      </div>
      <div class="col-xs-12 col-md-6">
        <div class="row">
          <div class="col-xs-12 col-md-5 flex items-center justify-end"
            :class="[ $q.screen.width < 1022 ? 'justify-center q-mt-sm q-pb-xs' : 'justify-end']">
            <label :class="$q.screen.width < 1022 || 'q-pr-md'">
              Dirección:
            </label>
          </div>
          <div class="col-xs-12 col-md-7">
            <q-input v-model.trim="formSucursal.direccion" input-class="resaltarTextoInput" dense filled required />
          </div>
        </div>
      </div>
      <div class="col-xs-12 col-md-6">
        <div class="row">
          <div class="col-xs-12 col-md-5 flex items-center justify-end"
            :class="[ $q.screen.width < 1022 ? 'justify-center q-mt-sm q-pb-xs' : 'texto-rigth']">
            <label :class="$q.screen.width < 1022 || 'q-pr-md'">
              Numero de Establecimiento:
            </label>
          </div>
          <div class="col-xs-12 col-md-7">
            <q-input type="number"
              v-model="formSucursal.establecimiento" input-class="resaltarTextoInput"
              :maxlength="3" dense filled required
              @keyup="formSucursal.establecimiento = parseInt(formSucursal.establecimiento.toString().replace(/\D/g, ''));" />
          </div>
        </div>
      </div>
      <div class="col-xs-12 col-md-6">
        <div class="row">
          <div class="col-xs-12 col-md-5 flex items-center justify-end"
            :class="[ $q.screen.width < 1022 ? 'justify-center q-mt-sm q-pb-xs' : 'justify-end']">
            <label :class="$q.screen.width < 1022 || 'q-pr-md'">
              N° punto de emisión:
            </label>
          </div>
          <div class="col-xs-12 col-md-7">
            <q-input type="number"
              v-model="formSucursal.punto_emision" input-class="resaltarTextoInput"
              :maxlength="3" dense filled required
              @keyup="formSucursal.punto_emision = parseInt(formSucursal.punto_emision.toString().replace(/\D/g, ''));" />
          </div>
        </div>
      </div>
      <div class="col-xs-12 col-md-6">
        <div class="row">
          <div class="col-xs-12 col-md-5 flex items-center justify-end"
            :class="[ $q.screen.width < 1022 ? 'justify-center q-mt-sm q-pb-xs' : 'justify-end']">
            <label :class="$q.screen.width < 1022 || 'q-pr-md'">
              N° secuencial Factura:
            </label>
          </div>
          <div class="col-xs-12 col-md-7">
            <q-input type="number"
              v-model.trim="formSucursal.secuencia_factura_produccion"
              input-class="resaltarTextoInput"
              :maxlength="9"
              @keyup="formSucursal.secuencia_factura_produccion = parseInt(formSucursal.secuencia_factura_produccion.toString().replace(/\D/g, ''));"
              dense filled required />
          </div>
        </div>
      </div>
      <div class="col-xs-12 col-md-6">
        <div class="row">
          <div class="col-xs-12 col-md-5 flex items-center justify-end"
            :class="[ $q.screen.width < 1022 ? 'justify-center q-mt-sm q-pb-xs' : 'texto-rigth']">
            <label :class="$q.screen.width < 1022 || 'q-pr-md'">
              N° secuencial Factura Pruebas:
            </label>
          </div>
          <div class="col-xs-12 col-md-7">
            <q-input type="number"
              v-model.trim="formSucursal.secuencia_factura_pruebas"
              input-class="resaltarTextoInput"
              :maxlength="9"
              @keyup="formSucursal.secuencia_factura_pruebas! = parseInt(formSucursal.secuencia_factura_pruebas!.toString().replace(/\D/g, ''));"
              dense filled required />
          </div>
        </div>
      </div>
      <div class="col-xs-12 col-md-6">
        <div class="row">
          <div class="col-xs-12 col-md-5 flex items-center justify-end"
            :class="[ $q.screen.width < 1022 ? 'justify-center q-mt-sm q-pb-xs' : 'texto-rigth']">
            <label :class="$q.screen.width < 1022 || 'q-pr-md'">
              N° secuencial Nota de Crédito:
            </label>
          </div>
          <div class="col-xs-12 col-md-7">
            <q-input type="number"
              v-model.trim="formSucursal.secuencia_nota_credito_produccion"
              input-class="resaltarTextoInput"
              :maxlength="9"
              @keyup="formSucursal.secuencia_nota_credito_produccion! = parseInt(formSucursal.secuencia_nota_credito_produccion!.toString().replace(/\D/g, ''));"
              dense filled required />
          </div>
        </div>
      </div>
      <div class="col-xs-12 col-md-6">
        <div class="row">
          <div class="col-xs-12 col-md-5 flex items-center justify-end"
            :class="[ $q.screen.width < 1022 ? 'justify-center q-mt-sm q-pb-xs' : 'texto-rigth']">
            <label :class="$q.screen.width < 1022 || 'q-pr-md'">
              Secuencial nota de crédito Pruebas:
            </label>
          </div>
          <div class="col-xs-12 col-md-7">
            <q-input type="number"
            input-class="resaltarTextoInput"
            v-model.trim="formSucursal.secuencia_nota_credito_pruebas"
            :maxlength="9"
            @keyup="formSucursal.secuencia_nota_credito_pruebas! = parseInt(formSucursal.secuencia_nota_credito_pruebas!.toString().replace(/\D/g, ''));"
            dense filled required />
          </div>
        </div>
      </div>
      <div class="col-xs-12 col-md-6">
        <div class="row">
          <div class="col-xs-12 col-md-5 flex items-center justify-end"
            :class="[ $q.screen.width < 1022 ? 'justify-center q-mt-sm q-pb-xs' : 'texto-rigth']">
            <label :class="$q.screen.width < 1022 || 'q-pr-md'">
              N° secuencial Retención:
            </label>
          </div>
          <div class="col-xs-12 col-md-7">
            <q-input type="number"
              v-model.trim="formSucursal.secuencia_retencion_produccion"
              input-class="resaltarTextoInput"
              :maxlength="9"
              @keyup="formSucursal.secuencia_retencion_produccion! = parseInt(formSucursal.secuencia_retencion_produccion!.toString().replace(/\D/g, ''));"
              dense filled required />
          </div>
        </div>
      </div>
      <div class="col-xs-12 col-md-6">
        <div class="row">
          <div class="col-xs-12 col-md-5 flex items-center justify-end"
            :class="[ $q.screen.width < 1022 ? 'justify-center q-mt-sm q-pb-xs' : 'texto-rigth']">
            <label :class="$q.screen.width < 1022 || 'q-pr-md'">
              N° secuencial Retención: Pruebas:
            </label>
          </div>
          <div class="col-xs-12 col-md-7">
            <q-input type="number"
            input-class="resaltarTextoInput"
            v-model.trim="formSucursal.secuencia_retencion_pruebas"
            :maxlength="9"
            @keyup="formSucursal.secuencia_retencion_pruebas! = parseInt(formSucursal.secuencia_retencion_pruebas!.toString().replace(/\D/g, ''));"
            dense filled required />
          </div>
        </div>
      </div>
      <div class="col-xs-12 col-md-6">
        <div class="row">
          <div class="col-xs-12 col-md-5 flex items-center justify-end"
            :class="[ $q.screen.width < 1022 ? 'justify-center q-mt-sm q-pb-xs' : 'justify-end']">
            <label :class="$q.screen.width < 1022 || 'q-pr-md'">
              Ambiente:
            </label>
          </div>
          <div class="col-xs-12 col-md-7">
            <q-select dense v-model.trim="formSucursal.ambiente" filled
              :options="['PRODUCCION', 'PRUEBA']" />
          </div>
        </div>
      </div>
      <div v-if="claim.roles[0] == 'SUPER-ADMINISTRADOR'" class="col-xs-12 col-md-6">
        <div class="row">
          <div class="col-xs-12 col-md-5 flex items-center justify-end"
            :class="[ $q.screen.width < 1022 ? 'justify-center q-mt-sm q-pb-xs' : 'justify-end']">
            <label :class="$q.screen.width < 1022 || 'q-pr-md'">
              Empresa:
            </label>
          </div>
          <div class="col-xs-12 col-md-7">
            <q-select dense v-model.trim="formSucursal.company_id" filled
            :options="listCompanies" emit-value map-options />
          </div>
        </div>
      </div>
      <div class="col-xs-12 col-md-12 flex q-py-lg"
      :class="[ $q.screen.width < 600 ? 'justify-center q-ml-xl q-pt-none q-mb-md' : 'justify-between']">
        <q-btn v-if="$q.screen.width > 600"
          icon="arrow_back" @click="$router.push('/sucursales')"
          outline rounded class="q-ml-md"
          :color="!$q.dark.isActive ? 'blue-grey-10' : 'blue-grey-2'">
          &nbsp; Regresar
        </q-btn>

        <q-btn type="submit" icon="save" :loading="loading"
          outline rounded class="q-mr-lg" style="color: #696cff">
          &nbsp; Guardar Cambios
        </q-btn>
      </div>
    </div>
  </q-form>
</template>

<style>
.texto-rigth{
  text-align: right;
}
.resaltarTextoInput{
  font-size: 15px;
  text-align: center;
  color: #313131;
  font-weight: 500;
}
</style>