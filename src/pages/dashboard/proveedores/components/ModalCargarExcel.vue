<script setup>
  import { ref, watch } from 'vue';
  import useHelpers from "src/composables/useHelpers";

  const filesSelected = ref( null );
  const loading       = ref( false );
  const rows          = ref([]);
  const proveedores   = ref([]);
  const { api, claim } = useHelpers();

  const emit = defineEmits(['actualizarDatos']);

  const validaciones = ref({
    file: { message: '', isValid: true }
  })

  watch( filesSelected, ( file ) => {
    const archivo = file[0];

    const reader = new FileReader();

    reader.onload = function (e) {
      procesarDatosExcel( e.target.result );
    };

    reader.readAsBinaryString( archivo );
  });

  function procesarDatosExcel(data) {
    const workbook = XLSX.read(data, { type: 'binary' });

    const firstSheet = workbook.Sheets[ workbook.SheetNames[0] ];

    rows.value = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
  }

  function espera(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * El backend solo acepta NATURAL o JURIDICA. Se tolera lo que el operador
   * escriba en la plantilla y si no coincide se deja que aplique su default.
   */
  const normalizarTipoPersona = ( valor ) => {
    const texto = String( valor ?? '' ).trim().toUpperCase();

    // Se compara por prefijo para no depender de la tilde de "JURÍDICA".
    if ( texto.startsWith('JUR') ) return 'JURIDICA';
    if ( texto.startsWith('NAT') ) return 'NATURAL';

    return undefined;
  }

  /**
   * A diferencia de clientes, el proveedor guarda el tipo de documento como
   * texto ("Cedula"), no como código del SRI.
   */
  const TIPOS_DOCUMENTO = { ruc: 'RUC', cedula: 'Cedula', pasaporte: 'Pasaporte' };

  const validarCampos = () => {
    let existError = false;

    if ( filesSelected.value == null ) {
      validaciones.value.file.message = 'Debes completar este campo'
      validaciones.value.file.isValid = false;
      existError = true;
    }

    if( validaciones.value.file.isValid &&
        filesSelected.value[0].type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ){
      validaciones.value.file.message = 'Debes subir un archivo excel'
      validaciones.value.file.isValid = false;
      existError = true;
    }

    return existError;
  }

  const uploadFile = async () => {
    if( validarCampos() ) return;

    loading.value = true;

    try {
      // La plantilla tiene banda de título (fila 1) y cabeceras (fila 2): los
      // datos empiezan en la 3, que es el índice 2.
      for (let index = 2; index < rows.value.length; index++) {

        const element = rows.value[index] ?? [];

        // Filas sin razón social o sin tipo de documento no son proveedores.
        if ( !element[0] || !element[1] ) continue;

        proveedores.value.unshift({
          nombre: element[0],
          estado: 'cargando',
          message: '',
          index
        })

        const proveedor = proveedores.value.find( p => p.index == index );

        const tipo_documento = TIPOS_DOCUMENTO[ String( element[1] ).trim().toLowerCase() ];

        if ( !tipo_documento ) {
          proveedor.estado  = 'error';
          proveedor.message = `Tipo de documento no válido: "${ element[1] }". Usa RUC, Cedula o Pasaporte.`;
          continue;
        }

        try {
          await espera(50)

          await api.post('/providers', {
            razon_social:     String( element[0] ).toUpperCase(),
            tipo_documento,
            numero_documento: String( element[2] ?? '' ).trim(),
            // Opcionales: el email tiene índice único, así que en blanco debe
            // viajar como undefined para que quede en NULL.
            email:            element[3] || undefined,
            celular:          element[4] ? String( element[4] ) : undefined,
            direccion:        element[5] || undefined,
            tipo_persona:     normalizarTipoPersona( element[6] ),
            observacion:      element[7] || undefined
          }, { headers: { 'company-id': claim.company.id } })

          proveedor.estado = 'success';

        } catch (error) {
          proveedor.estado  = 'error'
          proveedor.message = error?.response?.data?.message
            ?? error?.message
            ?? 'No se pudo guardar el proveedor';
        }
      }

      emit('actualizarDatos')

    } finally {
      loading.value = false;
    }
  }

</script>

<template>
  <q-card style="width: 600px; max-width: 80vw;">
    <q-card-section>
      <div class="text-h6 text-center">
        Carga masiva de proveedores
        <q-btn round flat dense icon="close" class="float-right" color="grey-8" v-close-popup></q-btn>
      </div>
    </q-card-section>

    <q-separator inset></q-separator>

    <q-card-section class="q-pt-md">
      <div class="row flex flex-center">
        <div class="col-xs-11 col-sm-9 text-center q-mt-sm">
          <label>Subir proveedores desde excel:</label>
          <q-file input-class="inputFileClick" accept=".xls, .xlsx" dense
            :error="!validaciones.file.isValid"
            @update:model-value="validaciones.file.isValid = true"
            v-model="filesSelected" outlined multiple append>
            <template v-slot:append>
              <q-icon name="fa-solid fa-file-excel" />
            </template>
            <template v-slot:error>
              <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                {{ validaciones.file.message }}
              </label>
            </template>
          </q-file>
        </div>
      </div>

      <div v-if="proveedores.length > 0" class="col-12 q-mt-md">
        <q-list bordered id="scrollList">
          <q-item v-for="(proveedor, index) in proveedores" :key="index"
            clickable v-ripple>
            <q-item-section>{{ proveedor.nombre }}</q-item-section>
            <q-item-section avatar>
              <q-spinner v-if="proveedor.estado == 'cargando'"
                size="30px" color="primary"></q-spinner>
              <q-icon v-if="proveedor.estado == 'success'" name="check_circle" color="green-9" />
              <q-icon v-if="proveedor.estado == 'error'" name="error" color="negative">
                <q-tooltip anchor="top middle" self="bottom middle" :offset="[10, 10]">
                  {{ proveedor.message }}
                </q-tooltip>
              </q-icon>
            </q-item-section>
          </q-item>
        </q-list>
      </div>

      <div class="col-xs-9 col-md-12 flex justify-center q-ml-none">
        <q-btn label="Subir proveedores" :loading="loading"
          class="q-px-xl q-mt-md q-mb-md" @click="uploadFile" outline rounded style="color: #696cff" />
      </div>
    </q-card-section>
  </q-card>
</template>

<style scoped>
#scrollList {
  max-height: 250px;
  overflow-y: auto;
}
</style>
