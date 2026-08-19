<script setup lang="ts">
import Vue3QTelInput from 'vue3-q-tel-input'
import { useCliente } from '../composables/useCliente';
const props = defineProps<{ edit: boolean }>();

const {
    formCliente,
    loading,
    allowOnlyNumber,
    validateNumDocument,
    validaciones,
    onSubmit
  } = useCliente();

// El celular es opcional: vue3-q-tel-input marca error cuando el campo está
// vacío, y eso bloqueaba el guardado. Solo se valida el formato si hay número.
const existError = (value: any) => {
  validaciones.value.celular.isValid = !formCliente.value.celular || !value
}

</script>

<template>
  <q-form @submit="onSubmit( props.edit )">
    <div class="row q-pt-lg q-gutter-lg justify-center">

      <div class="col-xs-12 col-sm-11" :class="[ !$q.screen.xs ? 'q-px-md' : '' ]">
        <label>Razón Social: <span class="obligatorio">*</span></label>
        <q-input
            v-model.trim="formCliente.nombres"
            @update:model-value="validaciones.nombres.isValid = true"
            :error="!validaciones.nombres.isValid"
            dense outlined>
          <template v-slot:error>
            <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
              {{ validaciones.nombres.message }}
            </label>
          </template>
        </q-input>
      </div>

      <div class="col-xs-12 col-sm-5">
        <label>Tipo de Documento: <span class="obligatorio">*</span></label>
        <q-select
          @update:model-value="validaciones.tipo_documento.isValid = true"
          :error="!validaciones.tipo_documento.isValid"
          dense v-model.trim="formCliente.tipo_documento" outlined
          emit-value map-options
          :options="[
            { label: 'RUC', value: '04' },
            { label: 'Cedula', value: '05' },
            { label: 'Pasaporte', value: '06' }
            ]">
          <template v-slot:error>
            <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
              {{ validaciones.tipo_documento.message }}
            </label>
          </template>
        </q-select>
      </div>

      <div class="col-xs-12 col-sm-5">
        <label>Numero de Documento: <span class="obligatorio">*</span></label>
        <q-input v-model="formCliente.numero_documento"
          @update:model-value="validaciones.numero_documento.isValid = true"
          :error="!validaciones.numero_documento.isValid"
          :disable="formCliente.tipo_documento === '' "
          counter :maxlength="formCliente.tipo_documento === '04' ? 13 : 10"
          lazy-rules
          dense outlined @keyup="allowOnlyNumber">
          <template v-slot:error>
            <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
              {{ validaciones.numero_documento.message }}
            </label>
          </template>
        </q-input>
      </div>

      <div class="col-xs-12 col-sm-5">
        <label>Email:</label>
        <q-input
          v-model.trim="formCliente.email"
          dense outlined
          @update:model-value="validaciones.email.isValid = true"
          :error="!validaciones.email.isValid">
          <template v-slot:error>
            <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
              {{ validaciones.email.message }}
            </label>
          </template>
        </q-input>
      </div>

      <div class="col-xs-12 col-sm-5">
        <label>Celular:</label>
        <vue3-q-tel-input
          default-country="EC"
          search-text="Buscar pais..."
          @update:model-value="validaciones.celular.isValid = true"
          @error="existError"
          :error="!validaciones.celular.isValid"
          outlined dense v-model:tel="formCliente.celular">
          <template v-slot:error>
            <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
              {{ validaciones.celular.message }}
            </label>
          </template>
        </vue3-q-tel-input>
      </div>

      <div class="col-xs-12 col-sm-11" :class="[ !$q.screen.xs ? 'q-px-md' : '' ]">
        <label>Dirección:</label>
        <q-input
          @update:model-value="validaciones.direccion.isValid = true"
          :error="!validaciones.direccion.isValid"
          v-model="formCliente.direccion" dense outlined
          >
          <template v-slot:error>
            <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
              {{ validaciones.direccion.message }}
            </label>
          </template>
        </q-input>
      </div>

      <div class="col-xs-12 col-sm-5">
        <label>Tipo de Persona:</label>
        <q-select
          v-model="formCliente.tipo_persona"
          dense outlined emit-value map-options
          :options="[
            { label: 'NATURAL', value: 'NATURAL' },
            { label: 'JURIDICA', value: 'JURIDICA' }
            ]" />
      </div>

      <div class="col-xs-12 col-sm-5">
        <label>Observación:</label>
        <q-input
          v-model.trim="formCliente.observacion"
          placeholder="Nota interna, no sale en el comprobante"
          maxlength="300"
          dense outlined />
      </div>

      <div class="col-xs-9 col-sm-12  flex justify-center">
        <q-btn :label=" !edit ? 'Guardar' : 'Editar'" :loading="loading"
          class="q-px-xl" type="submit" outline rounded style="color: #696cff" />
      </div>

    </div>
  </q-form>
</template>

<style>
@import 'vue3-q-tel-input/dist/vue3-q-tel-input.esm.css';

/* Marca de campo obligatorio: el rojo se ve bien en claro y en oscuro. */
.obligatorio {
  color: #e53935;
  font-weight: 600;
}
</style>