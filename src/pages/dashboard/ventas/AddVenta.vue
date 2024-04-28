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
    formatearNumero,
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
  const numFacturaCargado = ref( false );
  const send_messages = ref( true );
  const nombre_proforma = ref('');
  const listArticulos = ref([]);
  const listArticulosOptions = ref([]);
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

  watch(sucursal_selected, (currentValue, _) => {
    getNumFactura();
    getAllProducts();
  });
  const getSucursales = async( company_id ) => {
    sucursales.value = [];

    const { data } = await api.get(`/sucursal/find/${ company_id }/company`);

    data.forEach( x => {
      sucursales.value.push({ label: x.nombre, value: x.id })
    })
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

      listClientes.value.unshift({
        label: 'CONSUMIDOR FINAL',
        value: import.meta.env.VITE_CONSUMIDOR_FINAL_ID,
        num_doc: '9999999999999'
      });
      optionsClients = listClientes.value;
      formVenta.value.customer_id = customer_id;

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

  const validarCampos = (tipo_documento) => {
      let existError = false;

      if ( (claim.roles[0] == 'SUPER-ADMINISTRADOR' || claim.roles[0] == 'ADMINISTRADOR')
          && sucursal_selected.value == '' ) {
        validaciones.value['sucursal_id'].message = 'Debes seleccionar una sucursal'
        validaciones.value['sucursal_id'].isValid = false;
        existError = true;
      }

      if ( valorFactura.value.total > 50 &&
          formVenta.value.customer_id == import.meta.env.VITE_CONSUMIDOR_FINAL_ID &&
          tipo_documento != 'PROFORMA') {
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
    if ( validarCampos(tipo) ) return;

    formVenta.value = {
      ...formVenta.value,
      ...valorFactura.value,
      products: rows.value,
      user_id: claim.id,
      tipo,
      send_messages,
      porcentaje_iva: iva_selected.value,
      name_proforma: nombre_proforma.value
    }

    Dialog.create({
      title: '¿Deseas generar esta Factura?',
      ok: { push: true, color: 'cyan-10', label: 'Enviar' },
      cancel: { push: true, color: 'blue-grey-6', label: 'Cancelar' }
    }).onOk(async () => {
      try {
        Loading.show({message: 'Cargando...'});

        let headers = { headers: { 'sucursal-id': sucursal_selected.value } };

        await api.post('/invoices', formVenta.value, headers)

        Loading.hide();
        mostrarNotify('positive', 'Venta realizada exitosamente');
        router.push('/ventas');

      } catch (error) {
        mostrarNotify('warning', error.response.data.message);
        Loading.hide();
      }
    })
  }

  const getNumFactura = async () => {
    numFacturaCargado.value = true;

    let headers = { headers: { 'sucursal-id': sucursal_selected.value } };

    const { data } = await api.get('/CE/facturas/getNumFactura', headers);

    formVenta.value.numero_comprobante = data.numComprobante;

    numFacturaCargado.value = false;
  }

  onBeforeUnmount(() => {
    rows.value = [];
  })

  const getAllProducts = async () => {
    loadingState.value = true
    let headers = { 'sucursal-id': sucursal_selected.value };

    try {
      const { data } = await api.get('/products', {
        params: { page: 1, limit: 100000, busqueda: '' },
        headers: headers
      })

      listArticulos.value = [];

      data.items.forEach(x => {
        listArticulos.value.push({
          label: x.nombre,
          value: x.id,
          detalles: x
        })
      });

      listArticulosOptions.value = listArticulos.value;
      loadingState.value = false
    } catch (error) {
      console.log(error)
    }
  }

  const filtarArticulo = (val= '', update) => {
    if (val === '') {
      update(() => {
        listArticulos.value = listArticulosOptions.value
      })
      return
    }

    update(() => {
      const needle = val.toLowerCase()
      listArticulos.value = listArticulosOptions.value.filter(v => v.label.toLowerCase().indexOf(needle) > -1)
    })
  }

  if ( claim.roles[0] == 'SUPER-ADMINISTRADOR' || claim.roles[0] == 'ADMINISTRADOR' )
    getSucursales( claim.company.id );
  else{
    sucursal_selected.value = claim.sucursales[0]
    getNumFactura();
    getAllProducts();
  }

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
          <q-breadcrumbs-el label="Facturas" icon="payments" to="/ventas" />
          <q-breadcrumbs-el label="Factura" icon="add_circle" />
        </q-breadcrumbs>
      </div>

      <div class="col-xs-12 col-md-6"
        :class="[ $q.screen.width < 1022 ? 'text-center q-pt-sm' : 'text-right q-pt-sm']">
        <label class="text-h6 text-center">Nueva Factura</label>
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
            class="col-xs-12 col-md-5"
            :class="$q.screen.width <= 1023 ? 'q-pl-none q-mt-xs' : 'offset-1 q-mt-md'">
            <label>Seleccionar Sucursal:</label>
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

        <div class="row q-pt-lg q-col-gutter-md"
          :class="[$q.screen.xs ? 'q-mx-xs' : 'q-mx-lg']">
          <div class="col-xs-12 col-md-6 q-pl-none">
            <label>Filtrar por codigo de barra o nombre del producto:</label>
            <q-select
              filled v-model="filterByCodBarra" dense
              :options="listArticulos"
              @update:model-value="agregarAndValidarStock( filterByCodBarra.detalles, 'venta')"
              @filter="filtarArticulo" use-input input-debounce="900">

              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    No hay resultados
                  </q-item-section>
                </q-item>
              </template>

              <template v-slot:append>
                <q-spinner v-if="loadingState" size="1.2rem" />
              </template>

              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps"
                  :class="rows.some( r => r.id == scope.opt.value)
                    ? $q.dark.isActive ? 'bg-indigo-4' : 'bg-indigo-1'
                    : ''">
                  <q-item-section>
                    <q-item-label>{{ scope.opt.label }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>

          <div class="col-xs-12 col-sm-5"
            :class="$q.screen.width <= 1023 ? 'q-pl-none q-mb-sm q-mt-md' : 'offset-1'">
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
      </q-card-section>
    </q-card>

    <q-form @submit="onSubmit('EMISION')">
      <div class="q-mx-lg justify-center q-mt-md">

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
              <q-td :props="props" class="flex flex-center">
                  <q-input input-class="resaltarTextoInput" dense required
                  @change="getSubtotalByProduct( props.row, 'ventas' )"
                  min="0" :max="props.row.stock"
                  type="number" style="width: 80px;" v-model.trim="props.row.cantidad" />
              </q-td>
            </template>

            <template v-slot:body-cell-descuento="props">
              <q-td :props="props" class="flex flex-center">
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
              <q-td :props="props" class="flex flex-center">
                <q-input input-class="resaltarTextoInput" dense required
                  @change="getSubtotalByProduct( props.row, 'ventas' )" min="0"
                  type="number" style="width: 100px;" v-model="props.row.pvp" />
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

        <q-card class="q-mt-md">
          <q-card-section class="q-pt-none row">
            <div class="col-xs-12 col-sm-8 col-md-7 row items-center q-mt-md"
            :class="$q.screen.width <= 1023 ? 'q-mt-lg q-mb-sm' : ''">
              <div class="row" style="width: 100%;">
                <div
                  class="col-xs-12 col-sm-5 col-md-3 flex flex-center"
                  :class="$q.screen.xs ? 'text-center' : 'text-right'">
                  <label class="q-pr-md">
                    Descripción (Opcional)
                  </label>
                </div>
                <div class="col-xs-12 col-sm-7 col-md-9">
                  <q-input v-model="formVenta.descripcion" filled type="textarea" rows="4" />
                </div>
              </div>
              <div class="q-ml-sm q-mt-md">
                <q-checkbox
                  left-label
                  size="xl"
                  v-model="send_messages"
                  label="Enviar mensaje al cliente"
                  color="deep-orange-9"
                  checked-icon="task_alt"
                  unchecked-icon="highlight_off"
                />
              </div>
            </div>

            <div class="col-xs-12 col-sm-4 col-md-5"
              style="display: flex;justify-content: end;">
              <table :class="[!$q.screen.xs ? 'linearTablaDetalle' : '']">
                <tr class="text-right">
                  <td><b>TOTAL BRUTO:</b></td>
                  <td style="width: 50px;" class="text-subtitle1 text-weight-regular">
                    ${{ valorFactura.subtotal.toFixed(2) }}
                  </td>
                </tr>
                <tr class="text-right">
                  <td><b>DESCUENTOS:</b></td>
                  <td style="width: 50px;" class="text-subtitle1 text-weight-regular">
                    ${{ valorFactura.descuento.toFixed(2) }}
                  </td>
                </tr>
                <tr class="text-right">
                  <td><b>SUBTOTAL:</b></td>
                  <td style="width: 50px;" class="text-subtitle1 text-weight-regular">
                    ${{
                      formatearNumero(valorFactura.subtotal - valorFactura.descuento).toFixed(2)
                    }}
                  </td>
                </tr>
                <tr class="text-right">
                  <td><b>IVA({{ iva_selected }}%):</b></td>
                  <td style="width: 50px;" class="text-subtitle1 text-weight-regular">
                    ${{ valorFactura.iva.toFixed(2) }}
                  </td>
                </tr>
                <tr class="text-right">
                  <td><b>TOTAL DE VENTA:</b></td>
                  <td style="width: 50px;">
                    <q-badge outline class="text-subtitle1 text-weight-bold"
                        color="secondary" :label="`$${ valorFactura.total.toFixed(2) }`" />
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

              <q-btn
                @click="onSubmit('FACTURA')"
                outline rounded
                style="color: #696cff">
                &nbsp; GENERAR FACTURA
              </q-btn>

            </div>
          </q-card-section>
        </q-card>
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
