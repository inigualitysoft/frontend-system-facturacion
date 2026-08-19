<script setup lang="ts">
  import Vue3QTelInput from 'vue3-q-tel-input'
  import { ref } from 'vue';
  import { useProveedor } from "../composables/useProveedor";

  const props = defineProps<{ edit: boolean }>();

  const {
    formProveedor,
    loading,
    allowOnlyNumber,
    validateNumDocument,
    onSubmit
  } = useProveedor();

  // El celular es opcional: vue3-q-tel-input marca error con el campo vacío,
  // así que solo se valida el formato cuando hay número escrito.
  const celularInvalido = ref( false );

  const validarCelular = ( hayError: any ) => {
    celularInvalido.value = Boolean( formProveedor.value.celular ) && Boolean( hayError );
  }

  const enviar = () => {
    if ( celularInvalido.value ) return;
    onSubmit( props.edit );
  }

</script>

<template>
  <q-form @submit="enviar">
    <div class="row q-pt-lg q-gutter-lg justify-center">

      <div class="col-xs-12 col-sm-11" :class="[ !$q.screen.xs ? 'q-px-md' : '' ]">
        <label>Razon Social: <span class="obligatorio">*</span></label>
        <q-input v-model.trim="formProveedor.razon_social" dense outlined required />
      </div>

      <div class="col-xs-12 col-sm-5">
        <label>Tipo de Documento: <span class="obligatorio">*</span></label>
        <q-select dense v-model.trim="formProveedor.tipo_documento" outlined required
          :options="['Cedula', 'RUC', 'Pasaporte']" />
      </div>

      <div class="col-xs-12 col-sm-5">
        <label>Numero de Documento: <span class="obligatorio">*</span></label>
        <q-input :type="$q.platform.is.mobile ? 'number' : 'text'"
          v-model="formProveedor.numero_documento"
          :readonly="formProveedor.tipo_documento === '' "
          counter :maxlength="formProveedor.tipo_documento === 'RUC' ? 13 : 10"
          :rules="validateNumDocument"
          lazy-rules
          dense outlined required @keyup="allowOnlyNumber" />
      </div>

      <div class="col-xs-12 col-sm-5">
        <label>Email:</label>
        <q-input v-model.trim="formProveedor.email" type="email" dense outlined />
      </div>

      <div class="col-xs-12 col-sm-5">
        <label>Celular:</label>
        <vue3-q-tel-input
          default-country="EC"
          search-text="Buscar pais..."
          @error="validarCelular"
          :error="celularInvalido"
          outlined dense v-model:tel="formProveedor.celular">
          <template v-slot:error>
            <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
              Ingresa un celular válido
            </label>
          </template>
        </vue3-q-tel-input>
      </div>

      <div class="col-xs-12 col-sm-11" :class="[ !$q.screen.xs ? 'q-px-md' : '' ]">
        <label>Dirección:</label>
        <q-input v-model.trim="formProveedor.direccion" dense outlined />
      </div>

      <div class="col-xs-12 col-sm-5">
        <label>Tipo de Persona:</label>
        <q-select
          v-model="formProveedor.tipo_persona"
          dense outlined emit-value map-options
          :options="[
            { label: 'NATURAL', value: 'NATURAL' },
            { label: 'JURIDICA', value: 'JURIDICA' }
            ]" />
      </div>

      <div class="col-xs-12 col-sm-5">
        <label>Observación:</label>
        <q-input
          v-model.trim="formProveedor.observacion"
          placeholder="Nota interna, no sale en ningún documento"
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
