<script setup>
  import { ref, watch, onBeforeUnmount } from 'vue';
  import useHelpers from "../../../composables/useHelpers";
  import { date, Dialog, Loading } from 'quasar'
  import { useProduct } from "../../../composables/useProduct";
  import ModalAddImpuesto from "./components/ModalAddImpuesto.vue";

  const {
    rows,
    formatearNumero,
    sucursal_selected,
    quitarArticulo
  } = useProduct();

  const columns = ref([
    { name: 'acciones', label: 'Quitar', align: 'left'  },
    { label: 'Impuesto', align: 'left', field: 'tipo_documento', name: 'tipo_documento' },
    { name: 'numero_comprobante_documento', label: 'Documento', align: 'center', field: 'numero_comprobante_documento' },
    { name: 'fecha', label: 'Fecha', align: 'center', field: 'inputDate' },
    { name: 'descripcion', label: 'Descripción', align: 'center', field: 'descripcion' },
    { name: 'base_imponible', label: 'Base imponible', align: 'center', field: 'base_imponible' },
    { name: 'porcentaje', label: '% de retención', align: 'center', field: 'porcentaje_iva' },
    { label: 'Valor retenido', align: 'center', field: 'valor_retenido', name: 'stock' }
  ])

  const { api, claim, mostrarNotify, router } = useHelpers();
  let optionsClients = []
  const listClientes = ref([]);
  const sucursales = ref([]);
  const numFacturaCargado = ref( false );
  const dialogAddImpuesto = ref( false );
  const send_messages = ref( true );
  const timeStamp = Date.now()
  let fechaActual = date.formatDate(timeStamp, 'DD/MM/YYYY');

  if ( claim.roles[0] !== 'SUPER-ADMINISTRADOR' || claim.roles[0] !== 'ADMINISTRADOR' )
    sucursal_selected.value = claim.sucursales[0]

  const formRetencion = ref({
    customer_id: '',
    numero_comprobante: '--- --- ---------',
    numero_comprobante_documento: '',
    clave_acceso: '',
    descripcion: '',
    inputDate: '',
    tipo_documento: 'FACTURA',
    tipo_impuesto: '',
    retencion: '',
    base_imponible: 0,
    valor_retenido: 0
  });

  const validaciones = ref({
    customer_id: { message: '', isValid: true },
    sucursal_id: { message: '', isValid: true },
    forma_pago:  { message: '', isValid: true }
  })

  const camposImpuestoValidaciones = ref({
    numero_comprobante_documento: { message: '', isValid: true },
    inputDate:      { message: '', isValid: true },
    tipo_impuesto:  { message: '', isValid: true },
    retencion:      { message: '', isValid: true },
    base_imponible: { message: '', isValid: true }
  })

  watch(
    () => formRetencion.value.inputDate,
    ( date ) => {
      camposImpuestoValidaciones.value.inputDate.isValid = true
    }
  )

  watch(sucursal_selected, (currentValue, _) => { getNumRetencion(); });
  const getSucursales = async( company_id ) => {
    sucursales.value = [];

    const { data } = await api.get(`/sucursal/find/${ company_id }/company`);

    data.forEach( x => {
      sucursales.value.push({ label: x.nombre, value: x.id })
    })
  }

  const getClientes = async () => {
    formRetencion.value.customer_id = ''

    try {
      let headers = { 'company-id': claim.company.id };
      const { data: clientes } = await api.get('/customers', { headers });

      listClientes.value = [];

      clientes.forEach(cliente => {
        listClientes.value.push({
          label: cliente.nombres,
          value: cliente.id,
          num_doc: cliente.numero_documento
        })
      });

      optionsClients = listClientes.value;

    } catch (error) {
      console.log(error)
    }
  }

  const filtrarCliente = (val = '', update ) => {
    if (val === '')
      return update(() => { listClientes.value = optionsClients })

    update(() => {
      const needle = val.toLowerCase();
      listClientes.value = listClientes.value.filter( v =>
        v.num_doc.indexOf(needle) > -1 || v.label.toLowerCase().indexOf(needle) > -1
      )
    })
  }

  const validarCampos = () => {
    let existError = false;

    if ( (claim.roles[0] == 'SUPER-ADMINISTRADOR' || claim.roles[0] == 'ADMINISTRADOR')
        && (sucursal_selected.value == '' || sucursal_selected.value == undefined) ) {
      validaciones.value['sucursal_id'].message = 'Debes seleccionar una sucursal'
      validaciones.value['sucursal_id'].isValid = false;
      existError = true;
    }

    if ( formRetencion.value.customer_id.length == 0 ) {
      validaciones.value['customer_id'].message = 'Debes seleccionar un cliente'
      validaciones.value['customer_id'].isValid = false;
      existError = true;
    }

    if (rows.value.length == 0){
      existError = true;
      mostrarNotify('warning', 'Debes agregar algun impuesto..');
    }

    return existError;
  }

  const validarCamposImpuesto = () => {
    let existError = false;

    const camposRequeridos = ['numero_comprobante_documento', 'inputDate', 'tipo_impuesto', 'retencion'];

    camposRequeridos.forEach( campo => {
      if ( formRetencion.value[campo].length == 0 ) {
        camposImpuestoValidaciones.value[campo].message = 'Debes completar este campo'
        camposImpuestoValidaciones.value[campo].isValid = false;
        existError = true;
      }
    })

    if (camposImpuestoValidaciones.value.numero_comprobante_documento.isValid &&
        formRetencion.value.numero_comprobante_documento.includes('_')) {
      camposImpuestoValidaciones.value['numero_comprobante_documento'].message = 'Debes completar este campo'
      camposImpuestoValidaciones.value['numero_comprobante_documento'].isValid = false;
      existError = true;
    }

    if ( formRetencion.value.base_imponible <= 0 ) {
      camposImpuestoValidaciones.value['base_imponible'].message = 'Debes completar este campo'
      camposImpuestoValidaciones.value['base_imponible'].isValid = false;
      existError = true;
    }

    return existError;
  }

  const limpiarFormularioImpuesto = () => {
    formRetencion.value = {
      ...formRetencion.value,
      descripcion: '',
      tipo_documento: 'FACTURA',
      tipo_impuesto: '',
      retencion: '',
      base_imponible: 0,
      valor_retenido: 0
    }
  }

  const agregarImpuesto = () => {
    if ( validarCamposImpuesto() ) return;

    let porcentaje_iva = 0;

    if (formRetencion.value.retencion == 9) porcentaje_iva = 10;
    if (formRetencion.value.retencion == 10) porcentaje_iva = 20;
    if (formRetencion.value.retencion == 1) porcentaje_iva = 30;
    if (formRetencion.value.retencion == 11) porcentaje_iva = 50;
    if (formRetencion.value.retencion == 2) porcentaje_iva = 70;
    if (formRetencion.value.retencion == 3) porcentaje_iva = 100;

    rows.value.push({
      codigo: rows.value.length + 1,
      numero_comprobante_documento: formRetencion.value.numero_comprobante_documento,
      tipo_documento: formRetencion.value.tipo_documento,
      tipo_impuesto: formRetencion.value.tipo_impuesto,
      porcentaje_iva,
      retencion: formRetencion.value.retencion,
      base_imponible: formRetencion.value.base_imponible,
      valor_retenido: formRetencion.value.valor_retenido
    })

    limpiarFormularioImpuesto()
  }

  const onSubmit = async () => {
    if ( validarCampos() ) return;

    const {
      tipo_documento,
      tipo_impuesto,
      retencion,
      base_imponible,
      valor_retenido,
      descripcion,
      numero_comprobante_documento,
      ...rest
    } = formRetencion.value;

    const formRetencionObj = {
      ...rest,
      sucursal_id: sucursal_selected.value,
      impuestos: rows.value,
      user_id: claim.id,
      send_messages: send_messages.value,
      tipo_documento: formRetencion.value.tipo_documento
    }

    Dialog.create({
      title: '¿Deseas emitir factura de esta retención?',
      ok: { push: true, color: 'cyan-10', label: 'Enviar' },
      cancel: { push: true, color: 'blue-grey-6', label: 'Cancelar' }
    }).onOk(async () => {
      try {
        // Loading.show({message: 'Cargando...'});

        console.log( formRetencionObj );

        let headers = { headers: { 'sucursal-id': sucursal_selected.value } };

        await api.post('/retenciones/generar-retencion', formRetencionObj, headers)

        // Loading.hide();
        // mostrarNotify('positive', 'Venta realizada exitosamente');
        // router.push('/ventas');

      } catch (error) {
        mostrarNotify('warning', error.response.data.message);
        Loading.hide();
      }
    })
  }

  const getNumRetencion = async () => {
    numFacturaCargado.value = true;

    let headers = { headers: { 'sucursal-id': sucursal_selected.value } };

    const { data } = await api.get('/retenciones/getNumRetencion', headers);

    formRetencion.value.numero_comprobante = data.numComprobante;

    numFacturaCargado.value = false;
  }

  const calcularValorRetenido = () => {

    if ( formRetencion.value.tipo_impuesto == 'IVA' ) {
      if ( formRetencion.value.retencion != '' && formRetencion.value.base_imponible > 0 ) {

        let porcentaje_iva = 0;

        if (formRetencion.value.retencion == 9) porcentaje_iva = 10;
        if (formRetencion.value.retencion == 10) porcentaje_iva = 20;
        if (formRetencion.value.retencion == 1) porcentaje_iva = 30;
        if (formRetencion.value.retencion == 11) porcentaje_iva = 50;
        if (formRetencion.value.retencion == 2) porcentaje_iva = 70;
        if (formRetencion.value.retencion == 3) porcentaje_iva = 100;

        const valor_retenido = formatearNumero((formRetencion.value.base_imponible * porcentaje_iva) / 100)

        formRetencion.value.valor_retenido = valor_retenido
      }
    }
  }

  const editarArticulo = ( impuesto ) => {
    formRetencion.value.numero_comprobante_documento = impuesto.numero_comprobante_documento
    formRetencion.value.inputDate = impuesto.inputDate
    formRetencion.value.tipo_documento = impuesto.tipo_documento
    formRetencion.value.tipo_impuesto = impuesto.tipo_impuesto
    formRetencion.value.retencion = impuesto.retencion
    formRetencion.value.base_imponible = impuesto.base_imponible
    formRetencion.value.valor_retenido = impuesto.valor_retenido

    rows.value = rows.value.filter( row => row.codigo != impuesto.codigo);
  }

  onBeforeUnmount(() => {
    rows.value = [];
  })

  if ( claim.roles[0] == 'SUPER-ADMINISTRADOR' || claim.roles[0] == 'ADMINISTRADOR' )
    getSucursales( claim.company.id );
  else
    getNumRetencion();

  getClientes();

</script>

<template>
  <div class="q-ma-lg q-pt-md q-mb-none" style="margin-bottom: 10px;">
    <div class="row q-col-gutter-lg flex items-center">
      <div class="col-xs-12 col-md-6"
      :class="[ $q.screen.width < 1022 ? 'q-pt-sm' : 'q-pt-sm']">
        <q-breadcrumbs class="row q-mr-xs"
          :class="[ $q.screen.width < 1022 ? 'justify-center q-pt-sm' : 'justify-start ']">
          <q-breadcrumbs-el label="Inicio" icon="home" to="/" />
          <q-breadcrumbs-el label="Retenciones" icon="payments" to="/retenciones" />
          <q-breadcrumbs-el label="Retención" icon="add_circle" />
        </q-breadcrumbs>
      </div>

      <div class="col-xs-12 col-md-6"
        :class="[ $q.screen.width < 1022 ? 'text-center q-pt-sm' : 'text-right q-pt-sm']">
        <label class="text-h6 text-center">Nueva Retención</label>
      </div>
    </div>
  </div>

    <q-card class="q-mx-lg q-mt-lg">
      <q-card-section class="q-pt-none">

        <div class="row q-col-gutter-md"
          :class="[$q.screen.xs ? 'q-mx-xs' : 'q-mx-lg']">
          <div class="col-xs-12 col-md-6 q-pt-xs q-mt-md"
          :class="$q.screen.width >= 1023 || 'text-center q-pl-none'">
            <label class="text-weight-medium"
            :class="[$q.screen.xs ? 'text-subtitle1' : 'text-h5']">Fecha de Emisión:
              <span class="text-weight-regular">{{ fechaActual }}</span>
            </label>
          </div>
          <div class="col-xs-12 col-md-6"
            :class="$q.screen.width <= 1023 ? 'text-center q-pt-sm q-pl-none' : 'text-right q-pt-xs q-mt-md'">
            <label class="text-weight-medium"
              :class="[$q.screen.xs ? 'text-subtitle1' : 'text-h5 q-mr-lg']">
              <span class="q-mr-sm">N° Retención:</span>
              <q-spinner-facebook v-if="numFacturaCargado"
                color="primary" class="q-ml-md" size="2em" />
              <span v-else class="text-weight-regular">
                {{ formRetencion.numero_comprobante }}
              </span>
            </label>
          </div>

          <div class="col-xs-12 col-sm-12 col-md-6 q-mt-md q-pl-none">
            <label>Seleccionar Cliente:
            </label>
            <q-select color="orange" filled v-model="formRetencion.customer_id"
              @update:model-value="validaciones.customer_id.isValid = true"
              :options="listClientes" emit-value map-options dense
              :error="!validaciones.customer_id.isValid"
              @filter="filtrarCliente" use-input input-debounce="0">

              <template v-slot:error>
                <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                  {{ validaciones.customer_id.message }}
                </label>
              </template>

              <template v-if="formRetencion.customer_id && formRetencion.customer_id !== 'CONSUMIDOR FINAL'" v-slot:append>
                <q-icon name="cancel"
                  @click.stop.prevent="formRetencion.customer_id = 'CONSUMIDOR FINAL'" class="cursor-pointer" />
              </template>

              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    No hay resultados
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>

          <div v-if="claim.roles[0] == 'SUPER-ADMINISTRADOR' || claim.roles[0] == 'ADMINISTRADOR'"
            class="col-xs-12 col-md-5 q-mt-md" :class="$q.screen.width <= 1023 ? 'q-pl-none' : 'offset-1'">
            <label>Seleccionar Sucursal:
            </label>
            <q-select filled v-model="sucursal_selected"
              @update:model-value="validaciones.sucursal_id.isValid = true"
              :error="!validaciones.sucursal_id.isValid"
              :options="sucursales" emit-value map-options dense>

              <template v-slot:error>
                <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                  {{ validaciones.sucursal_id.message }}
                </label>
              </template>

              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    No se encontro sucursal
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>

          <div
            class="col-xs-12 col-md-7 q-mt-md"
            :class="$q.screen.width <= 1023 ? 'q-pl-none' : 'q-pl-none q-pt-none'">
            <label>Clave Acceso:
            </label>
            <q-input
              v-model.trim="formRetencion.clave_acceso"
              dense filled
              >
            </q-input>
          </div>
        </div>

        <div class="row q-pt-none q-col-gutter-md"
          :class="[$q.screen.xs ? 'q-mx-xs' : 'q-mx-lg q-mb-md']">

          <div class="col-xs-12 col-md-4 q-pl-none"
            :class="$q.screen.width <= 1023 ? 'q-pl-none' : 'q-mt-lg'">
            <label>Numero de Comprobante: </label>
            <q-input v-model="formRetencion.numero_comprobante_documento"
              :input-style="{ textAlign: 'center', fontSize: '16px' }"
              @update:model-value="camposImpuestoValidaciones.numero_comprobante_documento.isValid = true"
              :error="!camposImpuestoValidaciones.numero_comprobante_documento.isValid"
              filled mask="###-###-#########" fill-mask dense>
              <template v-slot:error>
                <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                  {{ camposImpuestoValidaciones.numero_comprobante_documento.message }}
                </label>
              </template>
            </q-input>
          </div>

          <div class="col-xs-12 col-md-4"
            :class="$q.screen.width <= 1023 ? 'q-pl-none' : 'q-mt-lg'">
            <label>Fecha emisión sustento: </label>
            <q-input
              filled dense v-model="formRetencion.inputDate"
              :input-style="{ textAlign: 'center' }"
              hint="Fecha de Emisión del comprobante de venta autorizado"
              :error="!camposImpuestoValidaciones.inputDate.isValid">
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="formRetencion.inputDate">
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="Close" color="primary" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
              <template v-slot:error>
                <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                  {{ camposImpuestoValidaciones.inputDate.message }}
                </label>
              </template>
            </q-input>
          </div>

          <div class="col-xs-12 col-md-4"
            :class="$q.screen.width <= 1023 ? 'q-pl-none' : 'q-mt-lg'">
            <label>Tipo de documento:</label>
            <q-select
            v-model.trim="formRetencion.tipo_documento" filled
            emit-value map-options dense
              :options="[
                { label: 'FACTURA', value: 'FACTURA' },
                { label: 'NOTA DE DEBITO', value: 'NOTA_DE_DEBITO' },
                { label: 'LIQ. DE COMPRAS', value: 'LIQ_COMPRAS' }
                ]">
            </q-select>
          </div>

          <div
            class="col-xs-12 col-md-4 q-pl-none"
            :class="$q.screen.width <= 1023 ? 'q-pl-none' : ''">
            <label>Impuesto:</label>
            <q-select
              v-model.trim="formRetencion.tipo_impuesto" filled
              emit-value map-options dense
              @update:model-value="calcularValorRetenido, camposImpuestoValidaciones.tipo_impuesto.isValid = true"
              :error="!camposImpuestoValidaciones.tipo_impuesto.isValid"
              :options="[
                { label: 'I.V.A', value: 'IVA' },
                { label: 'Impuesto a la Renta', value: 'impuesto_renta' }
              ]">
              <template v-slot:error>
                <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                  {{ camposImpuestoValidaciones.tipo_impuesto.message }}
                </label>
              </template>
            </q-select>
          </div>

          <div class="col-xs-12 col-md-2"
            :class="$q.screen.width <= 1023 ? 'q-pl-none' : ''">
            <label>Retención del I.V.A:</label>
            <q-select
              v-model.trim="formRetencion.retencion" filled
              emit-value map-options dense
              @update:model-value="calcularValorRetenido, camposImpuestoValidaciones.retencion.isValid = true"
              :error="!camposImpuestoValidaciones.retencion.isValid"
              :options="[
                { label: '10%', value: 9 },
                { label: '20%', value: 10 },
                { label: '30%', value: 1 },
                { label: '50%', value: 11 },
                { label: '70%', value: 2 },
                { label: '100%', value: 3 }
              ]">
              <template v-slot:error>
                <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                  {{ camposImpuestoValidaciones.retencion.message }}
                </label>
              </template>
            </q-select>
          </div>

          <div class="col-xs-12 col-md-2"
            :class="$q.screen.width <= 1023 ? 'q-pl-none' : ''">
            <label>Base Imponible:</label>
            <q-input
              input-class="resaltarTextoInput" dense filled
              @change="formRetencion.base_imponible = formatearNumero(formRetencion.base_imponible), calcularValorRetenido()"
              @update:model-value="camposImpuestoValidaciones.base_imponible.isValid = true"
              :error="!camposImpuestoValidaciones.base_imponible.isValid"
              min="0" type="number"
              v-model="formRetencion.base_imponible">
              <template v-slot:error>
                <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                  {{ camposImpuestoValidaciones.base_imponible.message }}
                </label>
              </template>
            </q-input>
          </div>

          <div class="col-xs-12 col-md-2"
            :class="$q.screen.width <= 1023 ? 'q-pl-none' : ''">
            <label>Valor Retenido:</label>
            <q-input
              input-class="resaltarTextoInput"
              dense outlined readonly
              @change="formRetencion.valor_retenido = formatearNumero(formRetencion.valor_retenido)"
              min="0" type="number" v-model="formRetencion.valor_retenido" />
          </div>

          <div class="col-xs-12 col-md-2 flex flex-center">
            <q-btn
              @click="agregarImpuesto"
              class="q-mt-xs"
              icon-right="add_circle"
              outline rounded
              :color="!$q.dark.isActive ? 'blue-grey-8' : 'teal-4'">
              Añadir impuesto&nbsp;
              </q-btn>
          </div>

        </div>
      </q-card-section>
    </q-card>

    <q-form @submit="onSubmit">
      <div class="q-mx-lg justify-center q-mt-md">

        <div class="col-12">
          <q-table
            :rows="rows" :columns="columns"
            row-key="name" dense
            :class="[$q.dark.isActive ? '' : 'my-sticky-header-table3']"
            :hide-pagination="true" :rows-per-page-options="[50]">

            <template v-slot:top-left="props">
              <div
                class="text-center row justify-center" style="width: 100%;">
                <label class="q-mb-sm text-grey-7 text-h6">
                  Listado de Comprobantes
                </label>
              </div>
            </template>

            <template v-slot:top-right="props">
              <q-icon
                @click="dialogAddImpuesto = true"
                class="cursor-pointer"
                name="add_circle"
                size="md">
              </q-icon>
            </template>

            <template v-slot:no-data="{ }">
              <div class="full-width row flex-center text-lime-10 q-gutter-sm">
                <span class="text-subtitle1">
                  No existen impuestos
                </span>
                <q-icon size="2em" name="playlist_add" />
              </div>
            </template>

            <template v-slot:body-cell-fecha="props">
              <q-td :props="props">
                {{ date.formatDate(props.row.inputDate, 'DD/MM/YYYY') }}
              </q-td>
            </template>

            <template v-slot:body-cell-descripcion="props">
              <q-td :props="props">
                {{ props.row.porcentaje_iva }}%
              </q-td>
            </template>

            <template v-slot:body-cell-acciones="props">
              <q-td :props="props">
                <q-btn round color="indigo-6"
                @click="editarArticulo(props.row)"
                class="q-mr-sm"
                icon="edit" size="8px" />

                <q-btn round color="deep-orange"
                @click="quitarArticulo(props.row.id)"
                icon="close" size="8px" />

              </q-td>
            </template>
          </q-table>
        </div>

        <q-card class="q-mt-md">
          <q-card-section class="q-py-none row">

            <div class="col-12 flex q-my-md"
              :class="[ $q.screen.width < 600 ? 'justify-center' : 'justify-between']">

              <q-btn v-if="$q.screen.width > 600" icon="arrow_back"
                @click="$router.push('/ventas')"
                outline rounded class="q-mr-lg"
                :color="!$q.dark.isActive ? 'blue-grey-10' : 'blue-grey-2'">
                &nbsp; Regresar
              </q-btn>

              <q-btn
                type="submit"
                icon-right="send"
                outline rounded
                class="q-mr-lg"
                style="color: #696cff">
                Enviar &nbsp;
              </q-btn>

            </div>
          </q-card-section>
        </q-card>
      </div>
    </q-form>

    <q-dialog v-model="dialogAddImpuesto">
      <ModalAddImpuesto />
    </q-dialog>

</template>

<style>
  .linearTablaDetalle{
    margin-right: 0px;
    margin-top: 8px;
  }
  #labelNV{
    font-size: 25px;
    font-weight: 500;
    margin-left: 10px;
  }
  .btnAddCliente{
    margin-top: 48px;
    margin-left: 20px;
  }
  .resaltarTextoInput{
    font-size: 16px;
    text-align: center;
    color: #313131;
    font-weight: 500;
  }
  .my-sticky-header-table3 .q-table__top,
  .my-sticky-header-table3 thead tr:first-child th {
    /* bg color is important for th; just specify one */
    background-color: #3d403d;
    color: rgb(245, 241, 241);
  }
  .my-sticky-header-table3 tbody tr:nth-child(even) {
      background-color: rgb(243, 235, 245);
  }
</style>
