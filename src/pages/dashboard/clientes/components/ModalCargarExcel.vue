<script setup>
  import { computed, ref, watch } from 'vue';
  import useHelpers from "src/composables/useHelpers";

  const filesSelected     = ref( null );
  const loading           = ref( false );
  const rows              = ref([]);
  const clientes          = ref([]);
  const sucursales        = ref([]);
  const sucursal_selected = ref('');
  const { api, claim }    = useHelpers();

  const emit = defineEmits(['actualizarDatos']);

  const validaciones = ref({
    file:     { message: '', isValid: true },
    sucursal: { message: '', isValid: true }
  })

  watch( filesSelected, ( file ) => {

    const archivo = file[0];

    const reader = new FileReader();

    reader.onload = function (e) {
      const data = e.target.result;
      procesarDatosExcel(data);
    };

    reader.readAsBinaryString(archivo);
  });

  /**
   * El selector solo tiene sentido cuando hay algo que elegir: con una sola
   * sucursal activa ya viene resuelta y el campo estorba.
   */
  const debeElegirSucursal = computed(() =>
    sucursales.value.length > 1 &&
    ['SUPER-ADMINISTRADOR', 'ADMINISTRADOR'].includes( claim.roles[0] )
  );

  const getSucursales = async() => {
    sucursales.value = [];

    const { data } = await api.get(`/sucursal/find/${ claim.company.id }/company`);

    // El endpoint devuelve también las inactivas: no tiene sentido ofrecerlas
    // como destino de una carga masiva.
    data
      .filter(( x ) => x.isActive !== false )
      .forEach(( x ) => {
        sucursales.value.push({ label: x.nombre, value: x.id })
      })

    // Con una sola sucursal activa no hay nada que preguntar.
    //
    // La condición anterior (`!== 'SUPER-ADMINISTRADOR' || !== 'ADMINISTRADOR'`)
    // era siempre verdadera —un rol no puede ser distinto de ambos a la vez— y
    // dejaba el campo en undefined cuando el usuario no tenía sucursales
    // asignadas, rompiendo la validación al enviar.
    if ( sucursales.value.length === 1 ) {
      sucursal_selected.value = sucursales.value[0].value;
      return;
    }

    const esAdmin = ['SUPER-ADMINISTRADOR', 'ADMINISTRADOR'].includes( claim.roles[0] );

    if ( !esAdmin && claim.sucursales?.length === 1 )
      sucursal_selected.value = claim.sucursales[0];
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

  /**
   * El backend solo acepta NATURAL o JURIDICA. Se tolera lo que el operador
   * escriba en la plantilla (minúsculas, acentos, espacios) y si no coincide
   * se deja que el backend aplique su valor por defecto.
   */
  const normalizarTipoPersona = ( valor ) => {
    const texto = String( valor ?? '' ).trim().toUpperCase();

    // Se compara por prefijo para no depender de la tilde de "JURÍDICA".
    if ( texto.startsWith('JUR') ) return 'JURIDICA';
    if ( texto.startsWith('NAT') ) return 'NATURAL';

    return undefined;
  }

  const validarCampos = () => {
    let existError = false;

    if ( filesSelected.value == null ) {
      validaciones.value.file.message = 'Debes completar este campo'
      validaciones.value.file.isValid = false;
      existError = true;
    }

    if ( !sucursal_selected.value ) {
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

  const CODIGOS_DOCUMENTO = { ruc: '04', cedula: '05', pasaporte: '06' };

  const uploadFile = async () => {
    if( validarCampos() ) return;

    loading.value = true;

    // El loading se apagaba dentro del for, solo al llegar a la última fila. Si
    // algo reventaba antes (o la última fila se saltaba) el modal se quedaba
    // girando para siempre.
    try {
      // La plantilla tiene banda de título (fila 1) y cabeceras (fila 2): los
      // datos empiezan en la 3, que es el índice 2.
      for (let index = 2; index < rows.value.length; index++) {

        const element = rows.value[index] ?? [];

        // La plantilla guarda las listas de los desplegables en columnas
        // auxiliares, así que llegan filas sin razón social ni tipo de
        // documento. Esas no son clientes.
        if ( !element[0] || !element[1] ) continue;

        clientes.value.unshift({
          nombre: element[0],
          estado: 'cargando',
          message: '',
          index
        })

        const cliente = clientes.value.find( cliente => cliente.index == index );

        const codigo = CODIGOS_DOCUMENTO[ String( element[1] ).trim().toLowerCase() ];

        if ( !codigo ) {
          cliente.estado  = 'error';
          cliente.message = `Tipo de documento no válido: "${ element[1] }". Usa RUC, Cedula o Pasaporte.`;
          continue;
        }

        try {
          await espera(50)
          let headers = { 'company-id': claim.company.id };

          await api.post('/customers/create', {
            nombres:          element[0],
            tipo_documento:   codigo,
            numero_documento: String( element[2] ?? '' ).trim(),
            // Columnas opcionales: una celda vacía llega como undefined y el
            // .toString() del celular reventaba la carga de esa fila.
            email:            element[3] || undefined,
            celular:          element[4] ? String( element[4] ) : undefined,
            direccion:        element[5] || undefined,
            tipo_persona:     normalizarTipoPersona( element[6] ),
            observacion:      element[7] || undefined
          }, { headers })

          cliente.estado = 'success';

        } catch (error) {
          cliente.estado = 'error'
          // No siempre es un error HTTP: si no lo era, este acceso reventaba
          // dentro del catch y mataba el bucle completo.
          cliente.message = error?.response?.data?.message
            ?? error?.message
            ?? 'No se pudo guardar el cliente';
        }
      }

      emit('actualizarDatos')

    } finally {
      loading.value = false;
    }
  }

  getSucursales();

</script>

<template>
  <q-card style="width: 600px; max-width: 80vw;">
    <q-card-section>
      <div class="text-h6 text-center">
        Carga masiva de clientes
        <q-btn round flat dense icon="close" class="float-right" color="grey-8" v-close-popup></q-btn>
      </div>
    </q-card-section>

    <q-separator inset></q-separator>

    <q-card-section class="q-pt-md">
      <div class="row flex flex-center">
        <div class="col-xs-11 col-sm-9 text-center q-mt-sm">
          <label>Subir clientes desde excel:</label>
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
        <div v-if="debeElegirSucursal"
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

      <div v-if="clientes.length > 0" class="col-12 q-mt-md">
        <q-list bordered id="scrollList">
          <q-item v-for="(cliente, index) in clientes" :key="index"
            clickable v-ripple>
            <q-item-section>{{ cliente.nombre }}</q-item-section>
            <q-item-section avatar>
              <q-spinner v-if="cliente.estado == 'cargando'"
                 size="30px" color="primary"></q-spinner>
              <q-icon v-if="cliente.estado == 'success'" name="check_circle" color="green-9" />
              <q-icon v-if="cliente.estado == 'error'" name="error" color="negative">
                <q-tooltip anchor="top middle" self="bottom middle" :offset="[10, 10]">
                  {{ cliente.message }}
                </q-tooltip>
              </q-icon>
            </q-item-section>
          </q-item>
        </q-list>
      </div>

      <div class="col-xs-9 col-md-12 flex justify-center q-ml-none">
        <q-btn label="Subir clientes" :loading="loading"
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

