<script setup>
import { onMounted, ref } from "vue";
import useHelpers from "../../../../../composables/useHelpers";

const props = defineProps(['router_selected'])
const { api, claim }  = useHelpers();
const listRouter      = ref([]);
const router          = ref('');
const excelFile       = ref( null );
const excelValidate   = ref( false );

const cargarRouter = async () => {
  const { data } = await api.get(`/router/find/${ claim.company.id }`);

  listRouter.value = [];
  data.forEach((router, index) => {
    listRouter.value.push({ 
      label: router.nombre, 
      value: router.id
    })    
  });    

  router.value = props.router_selected;
}

onMounted(() => {
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.17.5/xlsx.full.min.js';
  script.async = true;
  document.head.appendChild(script);
});

const readExcelFile = () => {
  if ( excelFile.value == null ) {
    excelValidate.value = true;
  }

  const lector = new FileReader();

  lector.onload = function(e) {
    const contenido = e.target.result;
    const libroDeTrabajo = XLSX.read(contenido, { type: 'binary' });
    
    // Accede a la hoja de cálculo que desees (puedes tener múltiples hojas)
    const primeraHoja = libroDeTrabajo.SheetNames[0];
    const datos = XLSX.utils.sheet_to_json(libroDeTrabajo.Sheets[primeraHoja]);

    // Haz algo con los datos, por ejemplo, imprímelos en la consola
    console.log(datos[2].__EMPTY_11);
  };

  lector.readAsBinaryString(excelFile.value);
}

cargarRouter();
</script>

<template>
  <q-card style="width: 1000px; max-width: 70vw;">
    <q-card-section class="q-py-sm">
      <div class="text-h6 text-center">
        Importar Clientes
        <q-btn round flat dense icon="close" class="float-right" color="grey-8" v-close-popup></q-btn>
      </div>
    </q-card-section>

    <q-separator inset></q-separator>

    <q-card-section class="q-pa-none" id="box-map">   
      <div class="row justify-center">
        <div class="col-xs-12 col-md-7 justify-center q-my-md">
          <label class="text-center" style="display: block;">
            Router:
          </label>
          <q-select dense v-model.trim="router" filled 
            emit-value map-options
            :options="listRouter">
          </q-select>
        </div>
        <div class="col-xs-12 col-md-7 justify-center q-my-md">
          <label class="text-center" style="display: block;">
            Subir archivo excel:
          </label>
          <q-file filled dense v-model="excelFile"
            error-message="Debes agregar el archivo excel"
            :error="!excelValidate" 
            accept=".xls, .xlsx">
            <template v-slot:prepend>
              <q-icon name="fa-solid fa-file-excel" />
            </template>
          </q-file>
        </div>
        <div @click="readExcelFile"
          class="col-xs-12 col-md-7 text-center q-my-md">
          <q-btn id="btn-coordenadas" color="teal-10" icon-right="group">
            Cargar Clientes &nbsp;
          </q-btn>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<style>

</style>

  