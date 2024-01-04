<script setup lang="ts">
import { onBeforeUnmount } from 'vue';
import { useCliente } from '../composables/useCliente';
import DatosPersonales from "./DatosPersonales.vue";
import FactAndNot from "./FactAndNot.vue";
import ServicioInternet from "./ServicioInternet.vue";

const props = defineProps<{ edit: boolean }>();

const { done1, done2, done3, onSubmit, step, limpiarFormulario, quitarErrores } = useCliente();

onBeforeUnmount(() => {
  limpiarFormulario();
  quitarErrores();
  done1.value, done2.value, done3.value = false;
  step.value = 1;
})

</script>

<template>
  <q-form @submit="onSubmit( props.edit )" class="q-mt-md">
    <div class="row q-col-gutter-md q-px-lg q-pb-lg" 
      :class="$q.screen.width > 1022 ? 'q-col-gutter-y-lg' : ''">

      <div class="col-12">
        <q-stepper v-model="step" header-nav 
          ref="stepper" color="primary" animated>

          <q-step :name="1" title="Datos Personales" done-color="secondary"
          caption="Nombres, Dirección, Telefono..." icon="settings" 
            :done="step > 1" :header-nav="step > 1">              
              <DatosPersonales />
          </q-step>

          <q-step :name="2" title="Facturación y Notificaciones" caption="Dia de pago, Corte, aviso"
            icon="create_new_folder" :done="step > 2" :header-nav="step > 2" done-color="secondary">
            <FactAndNot />
          </q-step>

          <q-step :name="3" title="Servicios" 
            caption="Queues, PPPoE, Hotspot, etc" 
            icon="add_comment" :header-nav="step > 3">
             <ServicioInternet />
          </q-step>

        </q-stepper>
      </div>
    </div>
  </q-form>
</template>

<style>
.texto-rigth{
  text-align: right;
}
.resaltarTextoInput{
  font-size: 14px;
  text-align: center;
  color: #313131;
  font-weight: 500;
}
</style>

