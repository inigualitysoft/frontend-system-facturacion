<script setup>
  import { ref, watch } from 'vue';
  import useHelpers from "src/composables/useHelpers";

  const filesSelected     = ref(null);
  const loading           = ref( false );
  const rows              = ref([]);
  const products          = ref([]);
  const sucursales        = ref([]);
  const sucursal_selected = ref('');
  const emit              = defineEmits(['actualizarDatos']);
  const { api, claim }    = useHelpers();

  watch( filesSelected, ( file ) => {

    const archivo = file[0];

    const reader = new FileReader();

    reader.onload = function (e) {
      const data = e.target.result;
      procesarDatosExcel(data);
    };

    reader.readAsBinaryString(archivo);
  })

  const validaciones = ref({
    file:     { message: '', isValid: true },
    sucursal: { message: '', isValid: true }
  })

  const validarCampos = () => {
    let existError = false;

    if ( filesSelected.value == null ) {
      validaciones.value.file.message = 'Debes completar este campo'
      validaciones.value.file.isValid = false;
      existError = true;
    }

    if ( sucursal_selected.value.length == 0 ) {
      validaciones.value.sucursal.message = 'Debes completar este campo'
      validaciones.value.sucursal.isValid = false;
      existError = true;
    }

    if( validaciones.value.isValid && filesSelected.value[0].type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ){
      validaciones.value.file.message = 'Debes subir un archivo excel'
      validaciones.value.file.isValid = false;
      existError = true;
    }

    return existError;
  }

  function procesarDatosExcel(data) {
    const workbook = XLSX.read(data, { type: 'binary' });

    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

    const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

    rows.value = jsonData
  }

  function espera(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  const getSucursales = async() => {
    sucursales.value = [];

    const { data } = await api.get(`/sucursal/find/${ claim.company.id }/company`);

    data.forEach(( x ) => {
      sucursales.value.push({ label: x.nombre, value: x.id })
    })

    if(claim.roles[0] !== 'SUPER-ADMINISTRADOR' || claim.roles[0] !== 'ADMINISTRADOR')
      sucursal_selected.value = claim.sucursales[0]
  }

  const uploadFile = async () => {

    if( validarCampos() ) return;
    loading.value = true;
    for (let index = 1; index < rows.value.length; index++) {

      if(rows.value[index].length > 0){
        const element = rows.value[index];

        products.value.unshift({
          nombre: element[1],
          estado: 'cargando',
          message: '',
          index
        })

        try {
          await espera(70)

          let headers = { 'sucursal-id': sucursal_selected.value };

          await api.post('/products', {
            aplicaIva: element[4] == 'SI' ? true : false,
            codigoBarra: element[0].toString(),
            nombre: element[1].toUpperCase(),
            precio_compra: element[2],
            pvp: element[3],
            tipo: element[6],
            descuento: element[5]
          }, { headers })

          let product = products.value.find( product => product.index == index)
          product.estado = 'success'

        } catch (error) {
          let product     = products.value.find( product => product.index == index)
          product.estado  = 'error'
          console.log( error );
          product.message = error.response.data.message;
        }
      }

      if ( (index + 1) == rows.value.length ) {
        emit('actualizarDatos')
        loading.value = false;
      }
    }
  }

  getSucursales();
</script>

<template>
  <q-card style="width: 600px; max-width: 80vw;">
    <q-card-section>
      <div class="text-h6 text-center">
        Carga masiva de productos
        <q-btn round flat dense icon="close" class="float-right" color="grey-8" v-close-popup></q-btn>
      </div>
    </q-card-section>

    <q-separator inset></q-separator>

    <q-card-section class="q-pt-md">
      <div class="row flex flex-center">
        <div class="col-xs-11 col-sm-9 text-center q-mt-sm">
          <label>Subir archivo excel:</label>
          <q-file input-class="inputFileClick" accept=".xls, .xlsx" dense
            :error="!validaciones.file.isValid"
            @update:model-value="validaciones.file.isValid = true"
            v-model="filesSelected" outlined multiple append>
            <template v-slot:append>
              <q-icon name="fa-solid fa-file-excel">
              </q-icon>
            </template>
            <template v-slot:error>
              <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                {{ validaciones.file.message }}
              </label>
            </template>
          </q-file>
        </div>
        <div v-if="claim.roles[0] == 'SUPER-ADMINISTRADOR' || claim.roles[0] == 'ADMINISTRADOR'"
          class="col-xs-11 col-sm-9 text-center q-mt-md">
          <label>Elige una sucursal:</label>
          <q-select outlined dense v-model="sucursal_selected"
            :error="!validaciones.sucursal.isValid"
            @update:model-value="validaciones.sucursal.isValid = true"
            emit-value map-options :options="sucursales">
            <template v-slot:error>
              <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                {{ validaciones.sucursal.message }}
              </label>
            </template>
          </q-select>
        </div>
      </div>

      <div v-if="products.length > 0" class="col-12 q-mt-md">
        <q-list bordered id="scrollList">
          <q-item v-for="(product, index) in products" :key="index"
            clickable v-ripple>
            <q-item-section>{{ product.nombre }}</q-item-section>
            <q-item-section avatar>
              <q-spinner v-if="product.estado == 'cargando'"
                 size="30px" color="primary"></q-spinner>
              <q-icon v-if="product.estado == 'success'" name="check_circle" color="green-9" />
              <q-icon v-if="product.estado == 'error'" name="error" color="negative">
                <q-tooltip anchor="top middle" self="bottom middle" :offset="[10, 10]">
                  {{ product.message }}
                </q-tooltip>
              </q-icon>
            </q-item-section>
          </q-item>
        </q-list>
      </div>

      <div class="col-xs-9 col-md-12 flex justify-center q-mt-none q-ml-none">
        <q-btn label="Subir productos" :loading="loading"
          class="q-px-xl q-mt-md q-mb-md" @click="uploadFile" outline rounded style="color: #696cff" />
      </div>
    </q-card-section>

  </q-card>
</template>
<style>
#scrollList{
  min-height: 109px;
  max-height: 240px;
  overflow-y: auto;
}
#scrollList::-webkit-scrollbar {
  width: 12px;
}

/* Fondo del scrollbar (área no ocupada por el thumb) */
#scrollList::-webkit-scrollbar-track {
  background-color: #f1f1f1;
}

/* Estilo del thumb (la barra que puedes arrastrar) */
#scrollList::-webkit-scrollbar-thumb {
  background-color: #888;
  border-radius: 6px;
}

/* Estilo del thumb en hover */
#scrollList::-webkit-scrollbar-thumb:hover {
  background-color: #555;
}
</style>
