<script setup>
import listPermisos from "../listPermisos.json";
import listPermisos2 from "../listPermisos2.json";
import { useRol } from '../composables/useRol';

const props = defineProps(['edit']);

const { 
  formRol, 
  loading, 
  expanded,
  permisosSelected,
  onSubmit 
} = useRol();

</script>

<template>
  <q-form @submit="onSubmit( props.edit )">
    <div class="row q-pt-lg q-gutter-lg justify-center">
      <div class="col-xs-12 col-md-10">
        <label>Nombre del Rol:</label>
        <q-input v-model.trim="formRol.nombre" 
          input-style="text-align: center"
          dense outlined required />
      </div>
    </div>

    <div class="row q-pt-lg q-gutter-sm justify-center">
      <div class="col-12 text-center">
        <label class="text-subtitle1">
          Selecciona algún permiso:
        </label>
      </div>

      <div class="col-xs-12 col-md-6">
        <q-tree class="col-11 col-sm-11 q-ml-md q-mt-sm"
          :default-expand-all="false"
          :nodes="listPermisos"
          label-key="label"
          node-key="value"
          control-color="deep-orange-14"
          tick-strategy="leaf"
          v-model:expanded="expanded"
          v-model:ticked="permisosSelected" />
      </div>

      <div class="col-xs-12 col-md-5">
        <q-tree class="col-11 col-sm-11 q-ml-md q-mt-sm"
          :default-expand-all="false"
          :nodes="listPermisos2"
          label-key="label"
          node-key="value"
          control-color="deep-orange-14"
          tick-strategy="leaf"
          v-model:expanded="expanded"
          v-model:ticked="permisosSelected" />
      </div>
      
      <div class="col-xs-9 col-md-12 flex justify-center q-mt-none">
        <q-btn :label=" !edit ? 'Guardar' : 'Editar'" :loading="loading"
          class="q-px-xl q-mt-md q-mb-md" type="submit" style="color: #696cff" outline rounded />
      </div>
    </div>
  </q-form>
</template>

