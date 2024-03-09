<script setup>
import { ref } from 'vue';
import useHelpers from "src/composables/useHelpers";
import { format } from 'quasar'

const props = defineProps(['clausulas', 'aceptacion']);
const { capitalize } = format
const loading = ref( false );
const formProforma = ref({
  nombre: '',
  descripcion: ''
})

const emit  = defineEmits(['hideModal']);

const { api, mostrarNotify } = useHelpers()

const onSubmit = async () => {
  try {
    props.clausulas.unshift({...formProforma.value})
    await api.post('/proforma/clausula', {
      clausulas: props.clausulas,
      aceptacion_proforma: props.aceptacion      
    });    
    mostrarNotify('positive', 'Clausula agregada exitosamente');
    emit('hideModal')
  } catch (error) {
    console.log( error );
    mostrarNotify('warning', 'No se pudo agregar la clausula');
  }
}

</script>

<template>
  <q-card style="width: 500px !important;max-width: 80vw;">
    <q-card-section>
      <div class="text-h6 text-center">
        Nueva Clausula
        <q-btn round flat dense icon="close" class="float-right" color="grey-8" v-close-popup></q-btn>
      </div>
    </q-card-section>

    <q-separator inset></q-separator>

    <q-card-section class="q-pt-none">
      <q-form @submit="onSubmit">
        <div class="row q-pt-lg q-gutter-lg justify-center">

          <div class="col-xs-12">
            <label class="text-center">Nombre:</label>
            <q-input v-model.trim="formProforma.nombre" 
              @keyup="formProforma.nombre = capitalize( formProforma.nombre )"
              dense filled required />
          </div>

          <div class="col-xs-12">
            <label class="text-center">Descripcion:</label>
            <q-input type="textarea" rows="3" 
              @keyup="formProforma.descripcion = capitalize( formProforma.descripcion )"
              v-model.trim="formProforma.descripcion" dense filled required />
          </div>

          <div class="col-xs-9 col-sm-12 q-mt-lg q-mb-md flex justify-center">
            <q-btn label="Guardar" :loading="loading" outline rounded
              class="q-px-xl" type="submit" style="color: #696cff" />
          </div>

        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

  