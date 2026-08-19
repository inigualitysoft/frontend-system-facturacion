<script setup>
import { computed, watch } from 'vue';
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

/** Recorre el árbol y devuelve solo las hojas, que son los permisos reales. */
const permisosDeHoja = ( nodos ) =>
  nodos.flatMap( nodo => nodo.children ? permisosDeHoja( nodo.children ) : [ nodo.value ] );

const TODOS_LOS_PERMISOS = [
  ...permisosDeHoja( listPermisos ),
  ...permisosDeHoja( listPermisos2 )
];

const esSuperAdmin = computed(() =>
  props.edit && formRol.value.nombre === 'SUPER-ADMINISTRADOR'
);

// Se marcan todos sin mirar lo guardado: este rol manda sobre el sistema entero
// y su lista tiene que incluir los permisos de los módulos que se agreguen.
watch( esSuperAdmin, ( bloqueado ) => {
  if ( bloqueado ) permisosSelected.value = [ ...TODOS_LOS_PERMISOS ];
}, { immediate: true });
</script>

<template>
  <q-form @submit="onSubmit( props.edit )">
    <div class="row q-pt-lg q-gutter-lg justify-center">
      <div class="col-xs-12 col-md-10">
        <label>Nombre del Rol:</label>
        <q-input v-model.trim="formRol.nombre"
          :disable="props.edit && (formRol.nombre == 'SUPER-ADMINISTRADOR'
                                    || formRol.nombre == 'ADMINISTRADOR')"
          input-style="text-align: center"
          dense outlined required />
      </div>
    </div>

    <div class="row q-pt-lg q-gutter-sm justify-center">
      <div class="col-12 text-center">
        <label class="text-subtitle1">
          {{ esSuperAdmin ? 'Permisos del rol:' : 'Selecciona algún permiso:' }}
        </label>
      </div>

      <div v-if="esSuperAdmin" class="col-12">
        <q-banner dense class="rounded-borders text-body2"
          :class="$q.dark.isActive ? 'bg-grey-9 text-grey-3' : 'bg-grey-2 text-grey-8'">
          <template v-slot:avatar>
            <q-icon name="lock" :color="$q.dark.isActive ? 'blue-grey-3' : 'blue-grey-6'" />
          </template>
          Este rol tiene todos los permisos y no se puede modificar. Los módulos
          nuevos quedan habilitados automáticamente.
        </q-banner>
      </div>

      <!-- El árbol se muestra igual, pero sin recibir clics cuando está bloqueado. -->
      <div class="col-xs-12 col-md-6" :class="{ 'permisos-bloqueados': esSuperAdmin }">
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

      <div class="col-xs-12 col-md-5" :class="{ 'permisos-bloqueados': esSuperAdmin }">
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

      <div v-if="!esSuperAdmin" class="col-xs-9 col-md-12 flex justify-center q-mt-none">
        <q-btn
          :label=" !edit ? 'Guardar' : 'Editar'"
          :loading="loading"
          class="q-px-xl q-mt-md q-mb-md"
          type="submit"
          style="color: #696cff"
          outline
          rounded />
      </div>
    </div>
  </q-form>
</template>

<style scoped>
/* Deja el árbol a la vista y marcado, pero sin poder destildar nada. */
.permisos-bloqueados{
  pointer-events: none;
  opacity: .7;
}
</style>
