<script setup lang="ts">
  import { onMounted } from 'vue';
  import { useNap } from '../composables/useNap';

  const props = defineProps<{ edit: boolean }>();

  const { 
    formNap, 
    loading, 
    validaciones,
    listRouters,
    cargarRouters,
    onSubmit 
  } = useNap( props.edit );

  onMounted(async () => {
    await cargarRouters()
  })

</script>

<template>
  <q-form @submit="onSubmit( props.edit )" class="q-mt-md">
    <div class="row q-col-gutter-md q-px-lg" 
    :class="$q.screen.width < 1022 || 'q-col-gutter-y-lg q-pt-md'">

      <div class="col-xs-12 col-md-6">
        <div class="row">
          <div class="col-xs-12 col-md-4 flex items-center justify-end" 
            :class="[ $q.screen.width < 1022 ? 'justify-center q-mt-sm q-pb-xs' : 'texto-rigth q-pb-md']">
            <label :class="$q.screen.width < 1022 || 'q-pr-md'">
              Nombre:
            </label>
          </div>
          <div class="col-xs-12 col-md-7">
            <q-input v-model.trim="formNap.nombre" 
            placeholder="Caja N1"
            :error="!validaciones.nombre.isValid" 
            @update:model-value="formNap.nombre = formNap.nombre.toUpperCase(), validaciones.nombre.isValid = true"
            input-class="resaltarTextoInput" dense outlined>
            <template v-slot:error>
              <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                {{ validaciones.nombre.message }}
              </label>
            </template>
            </q-input>
          </div>
        </div>
      </div>
      <div class="col-xs-12 col-md-6">
        <div class="row">
          <div class="col-xs-12 col-md-4 flex items-center justify-end" 
            :class="[ $q.screen.width < 1022 ? 'justify-center q-mt-sm q-pb-xs' : 'justify-end q-pb-md']">
            <label :class="$q.screen.width < 1022 || 'q-pr-md'">
              Coordenadas:
            </label>
          </div>
          <div class="col-xs-12 col-md-7">
            <q-input v-model.trim="formNap.coordenadas" 
              placeholder="Lg, Lt"
              hint="* Texto para la facturación"
              :error="!validaciones.coordenadas.isValid" 
              @update:model-value="validaciones.coordenadas.isValid = true" 
              input-class="resaltarTextoInput" dense outlined>
              <template v-slot:error>
                <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                  {{ validaciones.coordenadas.message }}
                </label>
              </template>
            </q-input>
          </div>
        </div>
      </div>
      <div class="col-xs-12 col-md-6">
        <div class="row">
          <div class="col-xs-12 col-md-4 flex items-center justify-end" 
            :class="[ $q.screen.width < 1022 ? 'justify-center q-mt-sm q-pb-xs' : 'justify-end q-pb-md']">
            <label :class="$q.screen.width < 1022 || 'q-pr-md'">
              Ubicación:
            </label>
          </div>
          <div class="col-xs-12 col-md-7">
            <q-input v-model.trim="formNap.ubicacion" 
              placeholder="Av. xxx 123"
              hint="* Texto para la facturación"
              :error="!validaciones.ubicacion.isValid" 
              @update:model-value="validaciones.ubicacion.isValid = true" 
              input-class="resaltarTextoInput" dense outlined>
              <template v-slot:error>
                <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                  {{ validaciones.ubicacion.message }}
                </label>
              </template>
            </q-input>
          </div>
        </div>
      </div>
      <div class="col-xs-12 col-md-6">
        <div class="row">
          <div class="col-xs-12 col-md-4 flex items-center justify-end" 
            :class="[ $q.screen.width < 1022 ? 'justify-center q-mt-sm q-pb-xs' : 'justify-end q-pb-md']">
            <label :class="$q.screen.width < 1022 || 'q-pr-md'">
              Puertos:
            </label>
          </div>
          <div class="col-xs-12 col-md-7">
            <q-input v-model.trim="formNap.puertos" 
              :type="$q.platform.is.mobile ? 'number' : 'text'"  
              placeholder="16"
              :error="!validaciones.puertos.isValid" 
              @update:model-value="validaciones.puertos.isValid = true, formNap.puertos = formNap.puertos.replace(/\D/g, '')" 
              input-class="resaltarTextoInput stylePlaceholder" dense outlined>
              <template v-slot:error>
                <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                  {{ validaciones.puertos.message }}
                </label>
              </template>
            </q-input>
          </div>
        </div>
      </div>
      <div class="col-xs-12 col-md-6">
        <div class="row">
          <div class="col-xs-12 col-md-4 flex items-center justify-end" 
            :class="[ $q.screen.width < 1022 ? 'justify-center q-mt-sm q-pb-xs' : 'justify-end q-pb-md']">
            <label :class="$q.screen.width < 1022 || 'q-pr-md'">
              Detalles:
            </label>
          </div>
          <div class="col-xs-12 col-md-7">
            <q-input v-model.trim="formNap.detalles" 
              placeholder="Poste 5" autogrow
              :error="!validaciones.detalles.isValid" 
              @update:model-value="validaciones.detalles.isValid = true" 
              input-class="resaltarTextoInput" dense outlined>
              <template v-slot:error>
                <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                  {{ validaciones.detalles.message }}
                </label>
              </template>
            </q-input>
          </div>
        </div>
      </div>

      <div v-if="listRouters.length > 1"
        class="col-xs-12 col-md-6">
        <div class="row">
          <div class="col-xs-12 col-md-4 flex items-center justify-end" 
            :class="[ $q.screen.width < 1022 ? 'justify-center q-mt-sm q-pb-xs' : 'justify-end q-pb-md']">
            <label :class="$q.screen.width < 1022 || 'q-pr-md'">
              Router:
            </label>
          </div>
          <div class="col-xs-12 col-md-7">
            <q-select v-model="formNap.router_id" outlined dense 
              :error="!validaciones.router_id.isValid"
              emit-value map-options 
              @update:model-value="validaciones.router_id.isValid = true"
                :options="listRouters">
              <template v-slot:error>
                <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                  {{ validaciones.router_id.message }}
                </label>
              </template> 
            </q-select>
          </div>
        </div>
      </div>

      <div class="col-xs-12 col-md-12 flex q-py-lg" 
      :class="[ $q.screen.width < 600 
          ? 'justify-center q-pt-none q-mb-md q-ml-md' 
          : 'justify-between']">
        <q-btn v-if="$q.screen.width > 600"
          icon="arrow_back" @click="$router.push('/servicios/internet')"
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