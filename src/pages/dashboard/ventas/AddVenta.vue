<script setup>
  import { ref, watch, onBeforeUnmount } from 'vue';
  import useHelpers from "../../../composables/useHelpers";
  import { date, Dialog, Loading } from 'quasar'
  import SelectProduct from '../../../components/SelectProduct.vue'
  import { useProduct } from "../../../composables/useProduct";

  const {
    filterByCodBarra,
    columns,
    rows,
    modalSelectProducto,
    loadingState,
    listProductos,
    valorFactura,
    agregarAndValidarStock,
    filterArticulo,
    getSubtotalByProduct,
    sucursal_selected,
    iva_selected,
    quitarArticulo
  } = useProduct();

  let optionsClients = []
  const listClientes = ref([]);
  const { api, claim, mostrarNotify, route, router } = useHelpers();
  const sucursales = ref([]);
  const modalAgregarCliente = ref(false);
  const numFacturaCargado   = ref( false );
  const timeStamp = Date.now()
  let fechaActual = date.formatDate(timeStamp, 'DD/MM/YYYY');

  if ( claim.roles[0] !== 'SUPER-ADMINISTRADOR' || claim.roles[0] !== 'ADMINISTRADOR' )
    sucursal_selected.value = claim.sucursales[0]

  columns.value[7] = { name: 'pvp', label: 'Precio de Venta', align: 'center' }

  const formVenta = ref({
    customer_id: import.meta.env.VITE_CONSUMIDOR_FINAL_ID,
    numero_comprobante: '--- --- ---------',
    products: [],
    user_id: '',
    forma_pago: '',
    descripcion: ''
  });

  const validaciones = ref({
    customer_id: { message: '', isValid: true },
    sucursal_id: { message: '', isValid: true },
    forma_pago:  { message: '', isValid: true }
  })

  watch(sucursal_selected, (currentValue, _) => { getNumFactura(); });
  const getSucursales = async( company_id ) => {
    sucursales.value = [];

    const { data } = await api.get(`/sucursal/find/${ company_id }/company`);

    data.forEach( x => {
      sucursales.value.push({ label: x.nombre, value: x.id })
    })
  }

  const getProforma = async () => {
    if( route.params.venta_id !== '' ){
      const { data } = await api.get(`/invoices/filterInvoice/${ route.params.venta_id }`);
      formVenta.value.customer_id  = data.customer_id.id;
      formVenta.value.id           = data.id;
      formVenta.value.clave_acceso = data.clave_acceso;
      formVenta.value.estadoSRI    = data.estadoSRI;
      sucursal_selected.value      = data.sucursal_id.id

      data.invoiceToProduct.forEach(product => {
        product.product_id.cantidad = product.cantidad;
        product.product_id.descuento = parseFloat(product.descuento);
        product.product_id.v_total = product.v_total;

        agregarAndValidarStock( product.product_id, 'proforma' )
      });
    }
  }

  const agregarProduct = ( product ) => {
    agregarAndValidarStock( product, 'venta' )
    modalSelectProducto.value = false
  }
  const getClientes = async () => {
    const customer_id = formVenta.value.customer_id;
    formVenta.value.customer_id = ''

    modalAgregarCliente.value = false;

    try {
      const { data: clientes } = await api.get('/customers');

      listClientes.value = [];

      clientes.forEach(cliente => {
        listClientes.value.push({
          label: cliente.nombres,
          value: cliente.id,
          num_doc: cliente.numero_documento
        })
      });

      listClientes.value.unshift({
        label: 'CONSUMIDOR FINAL',
        value: import.meta.env.VITE_CONSUMIDOR_FINAL_ID,
        num_doc: '9999999999999'
      });
      optionsClients = listClientes.value;
      formVenta.value.customer_id = customer_id;

      getProforma();
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
          && sucursal_selected.value == '' ) {
        validaciones.value['sucursal_id'].message = 'Debes seleccionar una sucursal'
        validaciones.value['sucursal_id'].isValid = false;
        existError = true;
      }

      if ( valorFactura.value.total > 50 && formVenta.value.customer_id == import.meta.env.VITE_CONSUMIDOR_FINAL_ID ) {
        validaciones.value.customer_id.message = 'La factura supera los $50.00, no puede ser emitida a CONSUMIDOR FINAL'
        validaciones.value.customer_id.isValid = false;
        existError = true;
      }

      if ( valorFactura.value.total > 50 && formVenta.value.forma_pago == '01' ) {
        validaciones.value.forma_pago.message = 'La factura supera los $500.00, debes elegir otra forma de pago'
        validaciones.value.forma_pago.isValid = false;
        existError = true;
      }

      if (rows.value.length == 0){
        existError = true;
        mostrarNotify('warning', 'Debes agregar algun producto..');
      }

      if ( formVenta.value.forma_pago.length == 0 ){
        validaciones.value.forma_pago.message = 'Debes elegir una forma de pago'
        validaciones.value.forma_pago.isValid = false;
        existError = true;
      }

      rows.value.forEach((row, index) => {
        if (row.cantidad <= 0) {
          existError = true;
          mostrarNotify('warning', `Agrega una cantidad cantidad al producto: ${ row.nombre } de la fila: ${ index + 1 }`);
        }
        if (row.cantidad > row.stock && row.tipo != 'Servicio') {
          existError = true;
          mostrarNotify('warning', `La cantidad de venta del producto: ${ row.nombre } supera su stock disponible`);
        }
      });

      return existError;
  }

  const onSubmit = async ( tipo ) => {

    if ( validarCampos() ) return;

    formVenta.value = {
      ...formVenta.value,
      ...valorFactura.value,
      products: rows.value,
      user_id: claim.id,
      tipo,
      porcentaje_iva: iva_selected.value
    }

    let message;
    if (tipo == 'EMISION')
      message = '¿Deseas emitir factura de esta proforma?'
    if (tipo == 'FACTURA')
      message = '¿Deseas generar esta FACTURA?'
    if (tipo == 'PROFORMA')
      message = '¿Deseas guardar como PROFORMA?'

    Dialog.create({
      title: message,
      ok: { push: true, color: 'cyan-10', label: 'Enviar' },
      cancel: { push: true, color: 'blue-grey-6', label: 'Cancelar' }
    }).onOk(async () => {
      try {
        Loading.show({message: 'Cargando...'});

        let headers = { headers: { sucursal_id: sucursal_selected.value } };

        await api.post('/invoices', formVenta.value, headers)

        Loading.hide();
        mostrarNotify('positive', 'Venta realizada exitosamente');
        router.push('/ventas');

      } catch (error) {
        console.log(error);
        Loading.hide();
      }
    })
  }

  const buscarProducto = () => {
    if ( (claim.roles[0] == 'SUPER-ADMINISTRADOR' || claim.roles[0] == 'ADMINISTRADOR') && typeof(sucursal_selected.value) == 'undefined' ) {
      return mostrarNotify('warning', 'Elige una sucursal primeramente');
    }else{
      filterArticulo('venta')
    }
  }

  const getNumFactura = async () => {
    numFacturaCargado.value = true;

    let headers = { headers: { sucursal_id: sucursal_selected.value } };

    const { data } = await api.get('/CE/facturas/getNumFactura', headers);

    formVenta.value.numero_comprobante = data.numComprobante;

    numFacturaCargado.value = false;
  }

  onBeforeUnmount(() => {
    rows.value = [];
  })

  if ( claim.roles[0] == 'SUPER-ADMINISTRADOR' || claim.roles[0] == 'ADMINISTRADOR' )
    getSucursales( claim.company.id );
  else
    getNumFactura();

  getClientes();

</script>

<template>
  <div class="q-ma-lg q-pt-md q-mb-none" style="margin-bottom: 10px;">
    <div class="row q-col-gutter-lg">
      <div class="col-xs-12 col-md-6" :class="[ $q.screen.width < 1022 ? 'q-pt-sm' : '']">
        <q-breadcrumbs class="row q-mr-xs"
          :class="[ $q.screen.width < 1022 ? 'justify-center q-pt-sm' : 'justify-start ']">
          <q-breadcrumbs-el label="Inicio" icon="home" to="/" />
          <q-breadcrumbs-el label="Ventas" icon="payments" to="/ventas" />
          <q-breadcrumbs-el label="Venta/Prof." icon="add_circle" />
        </q-breadcrumbs>
      </div>

      <div class="col-xs-12 col-md-6"
        :class="[ $q.screen.width < 1022 ? 'text-center q-pt-sm' : 'text-right']">
        <label class="text-h6 text-center">Nueva Venta/Proforma</label>
      </div>
    </div>
  </div>


  <!-- <div class="q-ma-lg q-pt-md"> -->
    <div class="row q-mx-lg q-col-gutter-md">

      <div class="col-xs-12 col-md-6 q-pt-xs q-mt-md"
      :class="$q.screen.width >= 1023 || 'text-center'">
        <label class="text-weight-medium"
        :class="[$q.screen.xs ? 'text-subtitle1' : 'text-h5']">Fecha de Emisión:
          <span class="text-weight-regular">{{ fechaActual }}</span>
        </label>
      </div>
      <div class="col-xs-12 col-md-6"
        :class="$q.screen.width <= 1023 ? 'text-center q-pt-sm' : 'text-right q-pt-xs q-mt-md'">
        <label class="q-mr-lg text-weight-medium" :class="[$q.screen.xs ? 'text-subtitle1' : 'text-h5']">
          <span class="q-mr-sm">N° Factura:</span>
          <q-spinner-facebook v-if="numFacturaCargado"
            color="primary" class="q-ml-md" size="2em" />
          <span v-else class="text-weight-regular">
            {{ formVenta.numero_comprobante }}
          </span>
        </label>
      </div>

      <div class="col-xs-12 col-sm-12 col-md-6 q-mt-md q-pl-none">
        <label>Seleccionar Cliente:
        </label>
        <q-select color="orange" filled v-model="formVenta.customer_id"
          @update:model-value="validaciones.customer_id.isValid = true"
          :options="listClientes" emit-value map-options dense
          :error="!validaciones.customer_id.isValid"
          @filter="filtrarCliente" use-input input-debounce="0">

          <template v-slot:error>
            <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
              {{ validaciones.customer_id.message }}
            </label>
          </template>

          <template v-if="formVenta.customer_id && formVenta.customer_id !== 'CONSUMIDOR FINAL'" v-slot:append>
            <q-icon name="cancel"
              @click.stop.prevent="formVenta.customer_id = 'CONSUMIDOR FINAL'" class="cursor-pointer" />
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

      <!-- <div class="col-xs-2 col-sm-2 col-md-1 btnAddCliente q-pt-none flex items-center"
        style="margin-left: 0px;align-items: normal;position: relative;top: 5px;">
        <div class="my-content">
          <q-btn round color="primary" size="13px" @click="modalAgregarCliente = true"
          icon="person_add" />
        </div>
      </div> -->

      <div v-if="claim.roles[0] == 'SUPER-ADMINISTRADOR' || claim.roles[0] == 'ADMINISTRADOR'"
        class="col-xs-12 col-md-5 q-mt-md" :class="$q.screen.width <= 1023 ? 'q-pl-none' : 'offset-1'">
        <label>Seleccionar Sucursal:
        </label>
        <q-select filled v-model="sucursal_selected"
          @update:model-value="validaciones.sucursal_id.isValid = true, rows = []"
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
    </div>

    <div class="row q-pt-lg q-mx-lg q-col-gutter-md">
      <div class="col-xs-12 col-md-6 q-pl-none">
        <label>Filtrar por codigo de barra o nombre del producto:</label>
        <q-input outlined bottom-slots :loading="loadingState" dense
          v-model.trim="filterByCodBarra" @keyup.enter="buscarProducto">
          <template v-slot:append>
            <q-icon v-if="filterByCodBarra !== ''" name="close" @click="filterByCodBarra = ''"
            class="cursor-pointer" />
            <q-icon name="search" />
          </template>
        </q-input>
      </div>

      <div class="col-xs-12 col-sm-5"
      :class="$q.screen.width <= 1023 ? 'q-pl-none q-mb-lg' : 'offset-1'">
        <label>Forma de pago:</label>
        <q-select dense v-model.trim="formVenta.forma_pago" filled
          emit-value map-options :error="!validaciones.forma_pago.isValid"
          @update:model-value="validaciones.forma_pago.isValid = true"
          :options="[
            { label: 'SIN UTILIZACION DEL SISTEMA FINANCIERO', value: '01' },
            { label: 'COMPENSACIÓN DE DEUDAS', value: '15' },
            { label: 'TARJETA DE DÉBITO', value: '16' },
            { label: 'DINERO ELECTRÓNICO', value: '17' },
            { label: 'TARJETA PREPAGO', value: '18' },
            { label: 'TARJETA DE CRÉDITO', value: '19' },
            { label: 'OTROS CON UTILIZACIÓN DEL SISTEMA FINANCIERO', value: '20' },
            { label: 'ENDOSO DE TÍTULOS', value: '21' },
            ]">
          <template v-slot:error>
            <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
              {{ validaciones.forma_pago.message }}
            </label>
          </template>
        </q-select>
      </div>

    </div>

    <q-form @submit="onSubmit('EMISION')">
      <div class="row q-mx-lg justify-center q-mt-md">
        <div class="col-12">
          <q-table :rows="rows" :columns="columns" row-key="name"
            :class="[$q.dark.isActive ? '' : 'my-sticky-header-table3']"
            :hide-pagination="true" :rows-per-page-options="[50]" >

            <template v-slot:no-data="{ }">
              <div class="full-width row flex-center text-lime-10 q-gutter-sm">
                <span class="text-subtitle1">
                  Agrega algún Producto
                </span>
                <q-icon size="2em" name="playlist_add" />
              </div>
            </template>

            <template v-slot:body-cell-cantidad="props">
              <q-td :props="props">
                  <q-input input-class="resaltarTextoInput" dense required
                  @change="getSubtotalByProduct( props.row, 'ventas' )"
                  min="0" :max="props.row.stock"
                  :readonly="props.row.tipo == 'Servicio'"
                  type="number" style="width: 100px;" v-model.trim="props.row.cantidad" />
              </q-td>
            </template>

            <template v-slot:body-cell-descuento="props">
              <q-td :props="props">
                  <q-input input-class="resaltarTextoInput" dense required
                  @change="getSubtotalByProduct( props.row, 'ventas' )" min="0"
                  type="number" style="width: 100px;" v-model="props.row.descuento" />
              </q-td>
            </template>

            <template v-slot:body-cell-iva="props">
              <q-td :props="props">
                {{ props.row.aplicaIva ? 'SI' : 'NO' }}
              </q-td>
            </template>

            <template v-slot:body-cell-pvp="props">
              <q-td :props="props">
                ${{ props.row.pvp }}
                <q-popup-edit v-model="props.row.pvp" v-slot="scope">
                  <q-input v-model="scope.value" dense autofocus counter @keyup.enter="scope.set" />
                </q-popup-edit>
              </q-td>
            </template>

            <template v-slot:body-cell-acciones="props">
              <q-td :props="props">
                <q-btn round color="deep-orange"
                @click="quitarArticulo(props.row.id)"
                icon="close" size="8px" />
              </q-td>
            </template>

          </q-table>
        </div>

        <div class="col-xs-12 col-sm-7 row items-center"
        :class="$q.screen.width <= 1023 ? 'q-mt-lg q-mb-sm' : ''">
          <div class="col-3 text-right">
            <label class="q-pr-md">Descripción</label>
          </div>
          <div class="col-9">
            <q-input v-model="formVenta.descripcion" filled type="textarea" rows="4" />
          </div>
        </div>

        <div class="col-xs-12 col-sm-5" style="display: flex;justify-content: end;">
          <table :class="[!$q.screen.xs ? 'linearTablaDetalle' : '']">
            <tr class="text-right">
              <td><b>TOTAL BRUTO:</b></td>
              <td style="width: 50px;" class="text-subtitle1 text-weight-regular">
                ${{ valorFactura.subtotal }}
              </td>
            </tr>
            <tr class="text-right">
              <td><b>DESCUENTOS:</b></td>
              <td style="width: 50px;" class="text-subtitle1 text-weight-regular">
                ${{ valorFactura.descuento }}
              </td>
            </tr>
            <tr class="text-right">
              <td><b>SUBTOTAL:</b></td>
              <td style="width: 50px;" class="text-subtitle1 text-weight-regular">
                ${{ valorFactura.subtotal - valorFactura.descuento }}
              </td>
            </tr>
            <tr class="text-right">
              <td><b>IVA({{ iva_selected }}%):</b></td>
              <td style="width: 50px;" class="text-subtitle1 text-weight-regular">
                ${{ valorFactura.iva }}
              </td>
            </tr>
            <tr class="text-right">
              <td><b>TOTAL DE VENTA:</b></td>
              <td style="width: 50px;">
                <q-badge outline class="text-subtitle1 text-weight-bold"
                    color="secondary" :label="`$${ valorFactura.total }`" />
              </td>
            </tr>
          </table>
        </div>

        <div class="col-12 flex q-mt-md q-my-lg"
          :class="[ $q.screen.width < 600 ? 'justify-center' : 'justify-between']">

          <q-btn v-if="$q.screen.width > 600" icon="arrow_back" @click="$router.push('/ventas')"
            outline rounded class="q-mr-lg"
            :color="!$q.dark.isActive ? 'blue-grey-10' : 'blue-grey-2'">
            &nbsp; Regresar
          </q-btn>

          <q-btn-dropdown v-if="$route.params.venta_id == ''" outline rounded
            style="color: #696cff" label="Generar"
            :class="$q.screen.width >= 1023 ? 'q-px-xl': 'full-width'">
            <q-list>
              <q-item clickable v-close-popup @click="onSubmit('FACTURA')">
                <q-item-section>
                  <q-item-label>FACTURA</q-item-label>
                </q-item-section>
              </q-item>

              <q-item type="submit" clickable v-close-popup @click="onSubmit('PROFORMA')">
                <q-item-section>
                  <q-item-label>PROFORMA</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>

          <q-btn v-else type="submit" label="Emitir Factura"
          :class="$q.screen.width >= 1023 ? 'q-px-xl': 'full-width'" outline rounded style="color: #696cff" />
        </div>
      </div>
    </q-form>

  <!-- BUSCAR ALGUN PRODUCTO -->
  <q-dialog v-model="modalSelectProducto">
    <SelectProduct :listProductos="listProductos" @agregarProduct="agregarProduct" />
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
    font-size: 17px;
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
