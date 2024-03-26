<script setup>
  import { Manager } from "socket.io-client";
  import { ref, watch } from 'vue'
  import useRolPermisos from "../../../composables/useRolPermisos";
  import useHelpers from "../../../composables/useHelpers";
  import { date, useQuasar } from 'quasar'
  import DetalleCompra from '../../../components/DetalleProducts.vue'
  import FiltrarVentas from './FiltrarVentas.vue'
  import { useImpresion } from "../clientes/composables/useImpresion";
  import ModalReenviarComprobantes from "./ModalReenviarComproantes.vue";

  /* --------------------- IMPLEMENTACION DE WEBSOCKET ---------------------- */
  let socket;

  const { api, claim, route } = useHelpers();

  const connectToServer = ( token ) => {
    const manager = new Manager(`${ import.meta.env.VITE_BASE_URL }/socket.io/socket.io.js`, {
      extraHeaders: {
        autentication: claim.id
      }
    });

    socket?.removeAllListeners();
    socket = manager.socket('/'); //conectarme algun namespace

    socket.on('updateStateInvoice', () => {
      setTimeout(async () => {
        await getVentas();
      }, 3000)
    })
  }
  // ---------------------------------------------------------------------------

  const columns = [
    { name: 'acciones', label: 'acciones', align: 'center' },
    { name: 'sucursal', label: 'Sucursal', align: 'center' },
    { name: 'num_comprobante', label: 'Num. Comprobante', field: 'numero_comprobante', align: 'center' },
    { name: 'usuario', label: 'Usuario', align: 'center' },
    { name: 'cliente', label: 'Cliente', align: 'center' },
    { name: 'f/h', label: 'Fecha/Hora', align: 'center', field: 'created_at' },
    { name: 'total', label: 'Total', name: 'total', align: 'center' },
    { name: 'estado', label: 'Estado', field: 'estado', align: 'center' }
  ]

  const dateOne = ref('');
  const dateTwo = ref('');
  const rows = ref([]);
  const showModalReenvioComprobantes = ref(false);
  const modalDetalle = ref(false);
  const consumidor_final_id = import.meta.env.VITE_CONSUMIDOR_FINAL_ID;

  const formFiltrarVentas = ref({ desde: '', hasta: '', pv_id: '' })

  const imprimirComprobanteFactura = async ( data, tipo) => {

    data.company_name = data.sucursal_id.company_id.nombre_comercial
    data.ruc = data.sucursal_id.company_id.ruc
    data.direccion = data.sucursal_id.direccion

    const dataCliente = {
      cliente: data.customer_id.nombres,
      tipoDoc: data.customer_id.tipo_documento,
      num_doc: data.customer_id.numero_documento,
      email: data.customer_id.email
    }

    if( data.forma_pago == '01') data.forma_pago = 'SIN UTILIZACION DEL SISTEMA FINANCIERO'
    if( data.forma_pago == '15') data.forma_pago = 'COMPENSACIÓN DE DEUDAS'
    if( data.forma_pago == '16') data.forma_pago = 'TARJETA DE DÉBITO'
    if( data.forma_pago == '17') data.forma_pago = 'DINERO ELECTRÓNICO'
    if( data.forma_pago == '18') data.forma_pago = 'TARJETA PREPAGO'
    if( data.forma_pago == '19') data.forma_pago = 'TARJETA DE CRÉDITO'
    if( data.forma_pago == '20') data.forma_pago = 'OTROS CON UTILIZACIÓN DEL SISTEMA FINANCIERO'
    if( data.forma_pago == '21') data.forma_pago = 'ENDOSO DE TÍTULOS'

    const { imprimirFactura } = useImpresion();

    let plantilla = imprimirFactura( data, dataCliente, claim.fullName, tipo );

    var ventanaImpresion = window.open('', '_blank');

    ventanaImpresion.document.write( plantilla );

    ventanaImpresion.print();
    ventanaImpresion.close();
  }

  const tipoComprobantes = ref('Todos');
  const filter = ref('');
  const detalleData = ref({})
  const sucursales = ref([]);
  const sucursal_selected = ref([]);
  const detalleFactura = ref({})
  const { validarPermisos } = useRolPermisos();

  const $q = useQuasar();
  const loading = ref( false )

  watch(tipoComprobantes, (currentValue, _) => { getVentas(); });

  const checkRoute = () => {
    const { tipo, fecha } = route.params;

    if ( tipo != '' )
      tipoComprobantes.value = tipo;

    if (fecha != '') {
      dateOne.value = fecha.split(' - ')[0].replace(/-/g, "/");
      dateTwo.value = fecha.split(' - ')[1].replace(/-/g, "/");
    }
  }

  const getVentas = async () => {
    try {
      loading.value = true;
      let headers = { headers: {
        tipo: tipoComprobantes.value,
        sucursal_id: sucursal_selected.value,
        desde: dateOne.value,
        hasta: dateTwo.value
      }};
      const { data } = await api.get('/invoices', headers);

      data.map( ( venta ) => {
        venta.created_at = date.formatDate(venta.created_at, 'DD/MM/YYYY HH:mm a'),
        venta.loading = false;
      });

      rows.value = data;
      loading.value = false;
    } catch (error) {
      console.log(error)
      loading.value = false;
    }
  }

  const downloadComprobantes = async() => {
    const { data } = await api.post('/invoices/download-comprobantes', {
      sucursal_id: sucursal_selected.value,
      desde: dateOne.value,
      hasta: dateTwo.value
    }, {
      responseType: 'arraybuffer'
    });

    const blob = new Blob([ data ], {
      type: 'application/zip'
    });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `facturas.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const anularFactura = ( venta ) => {
    $q.dialog({
      title: '<center>¿Estas seguro de anular esta factura?</center>',
      message: `<span style="display: block;width: 100%;display: flex;align-items: center;">
                  <strong style="display: inline-block;width: 40%;text-align: end;">
                    Num Comprobante:
                  </strong>
                  <label style="display: inline-block;width: 57%;" class="q-ml-xs">
                    ${ venta.numero_comprobante }
                  </label>
                </span>
              <span class='q-my-xs' style="display: block;width: 100%;display: flex;align-items: center;">
                <strong style="display: inline-block;width: 40%;text-align: end;">
                  Cliente:
                </strong>
                <label style="display: inline-block;width: 57%;" class="q-ml-xs">
                  ${ venta.customer_id.nombres }
                </label>
              </span>
              <span class='q-my-xs' style="display: block;width: 100%;display: flex;align-items: center;">
                <strong style="display: inline-block;width: 40%;text-align: end;">
                  Fecha/Hora:
                </strong>
                <label style="display: inline-block;width: 57%;" class="q-ml-xs">
                  ${ venta.created_at }
                </label>
              </span>
              <span style="display: block;width: 100%;display: flex;align-items: center;">
                <strong style="display: inline-block;width: 40%;text-align: end;">
                  Total:
                </strong>
                <label style="display: inline-block;width: 57%;" class="q-ml-xs">
                  $${ venta.total }
                </label>
              </span>`,
      html: true,
      ok: { push: true, label:'Anular', color: 'teal-7' },
      cancel: { push: true, color: 'blue-grey-8', label: 'Cancelar' }
    }).onOk(async () => {
      try {
        venta.loading = true;
        await api.post(`/CE/facturas/anularFactura`, { factura: { ...venta, entity: 'Ventas', tipo_comprobante: 'nota_credito' } });
        venta.loading = false;
      }catch (error){
        console.log(error);
      }
    })
  }

  const actualizarLista = ( data ) => {
    rows.value = data.compras;
    data.compras.map( ( compra ) => {
      const dateArray = compra.fecha_compra.split('T')[0].split('-');
      const timeArray = compra.hora_compra.split(':');
      compra.fecha = `${ dateArray[2] }/${ dateArray[1] }/${ dateArray[0] }  ${ timeArray[0] }:${ timeArray[1] } ${ (timeArray[0] < 12 ) ? 'am' : 'pm' }`
    })
  }

  watch(sucursal_selected, (newValue, oldValue) => {
    getVentas();
  })
  const getSucursales = async( company_id ) => {
    sucursales.value = [];

    const { data } = await api.get(`/sucursal/find/${ company_id }/company`);

    data.forEach(( x) => {
      sucursales.value.push({ label: x.nombre, value: x.id })
    })

    if ( sucursales.value.length != 0)
      sucursal_selected.value = sucursales.value[0].value;

    getVentas();
  }

  const reEmitirFactura = async ( data ) => {

    data.loading = true;

    let tipo_comprobante = '';
    let clave_acceso = '';
    if ( data.estadoSRI.trim() == 'ERROR ENVIO RECEPCION'
          || data.estadoSRI.trim() == 'ERROR ENVIO AUTORIZACION'
          || data.estadoSRI.trim() == 'ANULACION - RECIBIDA') {
      tipo_comprobante = 'factura'
      clave_acceso = data.clave_acceso
    }else{
      tipo_comprobante = 'nota_credito'
      clave_acceso = data.clave_acceso_nota_credito
    }

    const products = data.invoiceToProduct.map( p => {
      return {
        aplicaIva: p.product_id.aplicaIva,
        cantidad: p.cantidad,
        pvp: p.product_id.pvp,
        descuento: p.product_id.descuento,
        nombre: p.product_id.nombre,
        codigoBarra: p.product_id.codigoBarra
      }
    })

    let headers = { headers: { sucursal_id: data.sucursal_id.id } };
    let datosFactura = {
      ambiente: data.sucursal_id.ambiente,
      clave_acceso,
      company_name: claim.company.nombre_comercial,
      sucursal_id: data.sucursal_id.id,
      customer_id: data.customer_id.id,
      descripcion: data.descripcion,
      num_comprobante: data.numero_comprobante,
      tipo: 'EMISION',
      subtotal:   parseFloat( data.subtotal ),
      iva:        parseFloat( data.iva ),
      descuento:  parseFloat( data.descuento ),
      total:      parseFloat( data.total ),
      entity: 'Ventas',
      tipo_comprobante,
      pago_id: data.id,
      user_id: data.user_id.id,
      porcentaje_iva: data.porcentaje_iva,
      forma_pago: data.forma_pago,
      products
    }

    if (data.estadoSRI.trim() == 'ERROR ENVIO RECEPCION'
        || data.estadoSRI.trim() == 'ERROR ENVIO RECEPCION - ANULACION')
      await api.post('/CE/facturas/recepcionComprobantesOffline', datosFactura, headers);

    if (data.estadoSRI.trim() == 'RECIBIDA'
        || data.estadoSRI.trim() == 'ERROR ENVIO AUTORIZACION'
        || data.estadoSRI.trim() == 'ERROR ENVIO AUTORIZACION - ANULACION')
      await api.post('/CE/facturas/autorizacionComprobantesOffline', datosFactura, headers);

  }

  connectToServer();

  watch(filter, (newValue, oldValue) => {
    getVentas();
  })

  if (claim.roles[0] == 'SUPER-ADMINISTRADOR' || claim.roles[0] == 'ADMINISTRADOR')
    getSucursales(claim.company.id)
  else
    getVentas();

  checkRoute();

  const mode = ref("list");
  const pagination = ref({
    rowsPerPage: 10
  })

</script>

<template>
  <div class="q-mx-lg q-pt-md">

    <div class="row q-col-gutter-lg">
      <div class="col-12">

        <div class="q-my-md"
          style="display: flex;" :class="[ $q.screen.xs ? 'q-mb-md' : 'q-ml-lg' ]">
          <label class="q-mr-sm row q-pt-sm">
            <span>Filtrar por fecha: </span>
          </label>

          <q-input outlined dense v-model="dateOne" mask="date" >
            <template v-slot:append>

              <q-icon v-if="dateOne !== ''" name="close" @click="dateOne = '', getVentas()" class="cursor-pointer" />

              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="dateOne" @update:model-value="getVentas">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>

          <label class="q-mx-md q-pt-sm">Hasta</label>

          <q-input outlined dense v-model="dateTwo" mask="date">
            <template v-slot:append>

              <q-icon v-if="dateTwo !== ''" name="close" @click="dateTwo = '', getVentas()" class="cursor-pointer" />

              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="dateTwo" @update:model-value="getVentas">
                    <div class="row items-center justify-end">
                      <q-btn @click="getVentas"
                        v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>

          <q-btn @click="downloadComprobantes"
            class="q-ml-lg q-px-sm" dense outline color="primary" icon-right="picture_as_pdf"
              style="margin-top: 2px;" label="descargar facturas" />

        </div>

        <q-card flat class="shadow_custom">
          <q-table title-class="text-grey-7 text-h6" :rows="rows"
            :loading="loading" :hide-header="mode === 'grid'"
            :columns="columns" row-key="name" :grid="mode==='grid'"
            :filter="filter" :pagination.sync="pagination" >
            <template v-slot:header="props">
              <q-tr :props="props" style="height: 60px">
                <q-th
                  v-for="col in props.cols"
                  :key="col.name"
                  :props="props"
                  class="text-grey-7 text-weight-bold text-uppercase"
                  style="font-size: 13px"
                >
                  {{ col.label }}
                </q-th>
              </q-tr>
            </template>

            <template v-slot:top-left="props">
              <div v-if="$q.screen.xs"
                class="text-center row justify-center" style="width: 100%;">
                <label class="q-mb-sm text-grey-7 text-h6">
                  Listado de Comprobantes
                </label>
              </div>

                <div style="display: flex;"
                  :style="!$q.screen.xs || 'width: 100%;justify-content: center;position: relative;right: 8px;'"
                  :class="[ $q.screen.xs ? 'q-mb-md' : '' ]">
                  <label class="q-mr-sm row items-center">
                    <span>Tipo: </span>
                  </label>
                  <q-select outlined dense v-model="tipoComprobantes"
                  emit-value map-options
                  :options="[
                      { label: 'Todos', value: 'TODOS' },
                      { label: 'Proformas', value: 'PROFORMA' },
                      { label: 'Facturas', value: 'FACTURAS' },
                      { label: 'Facturas Anuladas', value: 'ANULADO' },
                      { label: 'Facturas Autorizadas', value: 'AUTORIZADO' },
                    ]">
                  </q-select>
                </div>

                <div v-if="claim.roles[0] == 'SUPER-ADMINISTRADOR' || claim.roles[0] == 'ADMINISTRADOR'"
                :style="!$q.screen.xs || 'width: 100%;justify-content: center;'"
                  style="display: flex;" :class="[ $q.screen.xs ? 'q-mb-md' : 'q-ml-lg' ]">
                  <label class="q-mr-sm row items-center">
                    <span>Por Sucursal: </span>
                  </label>
                  <q-select outlined dense v-model="sucursal_selected"
                      emit-value map-options :options="sucursales">
                  </q-select>
                </div>
            </template>

            <template v-slot:top-right="props">
              <q-btn v-if="$q.screen.width >= 1023 && validarPermisos('crear.venta')"
                @click="$router.push('/ventas/add')"
                outline color="primary" label="Agregar Venta" class="q-mr-xs"/>

              <q-input :style="$q.screen.width > 700 || 'width: 70%'"
                outlined dense debounce="300" v-model="filter" placeholder="Buscar...">
                <template v-slot:append>
                  <q-icon name="search"/>
                </template>
              </q-input>

              <q-btn flat round dense
                :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"
                @click="props.toggleFullscreen" v-if="mode === 'list'" >
                <q-tooltip :disable="$q.platform.is.mobile" v-close-popup>
                  {{ props.inFullscreen ? 'Exit Fullscreen' : 'Toggle Fullscreen' }}
                </q-tooltip>
              </q-btn>

              <q-btn flat round dense
                :icon="mode === 'grid' ? 'list' : 'grid_on'"
                @click="mode = mode === 'grid' ? 'list' : 'grid'; separator = mode === 'grid' ? 'none' : 'horizontal'" v-if="!props.inFullscreen"
              >
                <q-tooltip :disable="$q.platform.is.mobile" v-close-popup>
                  {{ mode === 'grid' ? 'List' : 'Grid' }}
                </q-tooltip>
              </q-btn>
            </template>

            <template v-slot:body-cell-total="props">
              <q-td :props="props"> ${{ props.row.total }} </q-td>
            </template>

            <template v-slot:body-cell-cliente="props">
              <q-td :props="props">{{ props.row.customer_id.nombres }}</q-td>
            </template>

            <template v-slot:body-cell-sucursal="props">
              <q-td :props="props">{{ props.row.sucursal_id.nombre }}</q-td>
            </template>

            <template v-slot:body-cell-usuario="props">
              <q-td :props="props">{{ props.row.user_id.fullName }}</q-td>
            </template>

            <template v-slot:body-cell-estado="props">
              <q-td :props="props">
                <q-badge v-if="props.row.estadoSRI == 'NO AUTORIZADO' || props.row.estadoSRI.trim() == 'DEVUELTA'"
                  outline class="q-py-xs q-px-md" :color="$q.dark.isActive ? 'warning' : 'orange-10'"
                  :label="props.row.estadoSRI">
                  <q-tooltip anchor="center left" self="center right" :offset="[10, 10]" class="blue-grey-9 text-subtitle2">
                    {{ props.row.respuestaSRI }}
                  </q-tooltip>
                </q-badge>

                <q-badge v-else-if="props.row.estadoSRI == 'AUTORIZADO'"
                  outline class="q-py-xs q-px-md" color="secondary" :label="props.row.estadoSRI" />

                <q-badge  v-else-if="props.row.estadoSRI == 'PROFORMA'" outline class="q-py-xs q-px-md"
                :color="$q.dark.isActive ? 'blue-grey-3' : 'blue-grey-7'" :label="props.row.estadoSRI" />

                <q-badge  v-else-if="props.row.estadoSRI == 'ANULADO'" outline class="q-py-xs q-px-md"
                    color="red-4" :label="props.row.estadoSRI" />

                <q-badge v-else outline class="q-py-xs q-px-md" :color="$q.dark.isActive ? 'blue-grey-3' : 'blue-grey-7'"
                  :label="props.row.estadoSRI">
                  <q-tooltip anchor="center left" self="center right" :offset="[10, 10]" class="blue-grey-9 text-subtitle2">
                    {{ props.row.respuestaSRI }}
                  </q-tooltip>
                </q-badge>

              </q-td>
            </template>

            <template v-slot:body-cell-acciones="props">
              <q-td :props="props">

                <q-btn v-if="props.row.estadoSRI.trim() == 'ERROR ENVIO RECEPCION'
                    || props.row.estadoSRI.trim() == 'ERROR ENVIO RECEPCION - ANULACION'
                    || props.row.estadoSRI.trim() == 'ERROR ENVIO AUTORIZACION'
                    || props.row.estadoSRI.trim() == 'ERROR ENVIO AUTORIZACION - ANULACION'
                    || props.row.estadoSRI.trim() == 'RECIBIDA'
                    || props.row.estadoSRI.trim() == 'ANULACION - RECIBIDA'"
                    round color="blue-grey" icon="fa-solid fa-retweet"
                    :loading="props.row.loading"
                    @click="reEmitirFactura( props.row )"
                    size="10px" class="q-mr-sm">
                  <q-tooltip class="bg-indigo" anchor="top middle" self="center middle">
                    Emitir Factura Electrónica
                  </q-tooltip>
                </q-btn>

                <q-btn v-if="props.row.estadoSRI.trim() !== 'PROFORMA'"
                    round color="blue-grey" icon="print"
                    @click="imprimirComprobanteFactura(props.row, 'factura')"
                    size="10px" class="q-mr-sm">
                  <q-tooltip class="bg-indigo" anchor="top middle" self="center middle">
                    Imprimir comprobante
                  </q-tooltip>
                </q-btn>

                <q-btn round color="blue-grey" icon="visibility" size="10px"
                class="q-mr-sm" @click="modalDetalle = true, detalleData = { ...props.row }" />

                <q-btn v-if="props.row.estadoSRI == 'PROFORMA' || props.row.estadoSRI.trim() == 'ERROR ENVIO RECEPCION' || props.row.estadoSRI.trim() == 'ERROR ENVIO RECEPCION - ANULACION' || props.row.estadoSRI.trim() == 'PENDIENTE'"
                  @click="$router.push(`ventas/add/${ props.row.id }`)"
                  round color="blue-grey" icon="description" size="10px" class="q-mr-sm" />

                <q-btn round color="blue-grey"
                  v-if="props.row.customer_id.nombres !== 'CONSUMIDOR FINAL' && (props.row.estadoSRI == 'AUTORIZADO' || props.row.respuestaSRI?.includes('ERROR SECUENCIAL REGISTRADO')) && validarPermisos('anular.venta')" class="q-mr-sm"
                  @click="anularFactura( props.row )"
                  :loading="props.row.loading"
                  icon="close" size="10px" />

                <q-btn v-if="props.row.estadoSRI == 'AUTORIZADO'
                              || props.row.estadoSRI == 'PROFORMA'"
                  round color="blue-grey"
                  @click="showModalReenvioComprobantes = true, detalleFactura = props.row"
                  icon="forward_to_inbox" size="11px">
                  <q-tooltip class="bg-indigo" anchor="top middle" self="center middle">
                    Enviar comprobante por email
                  </q-tooltip>
                </q-btn>
              </q-td>
            </template>

            <template v-slot:no-data="{ icon }">
              <div class="full-width row flex-center text-lime-10 q-gutter-sm">
                <q-icon size="2em" name="sentiment_dissatisfied" />
                <span class="text-subtitle1">
                  No se encontró ningun resultado
                </span>
                <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
              </div>
            </template>
          </q-table>
        </q-card>
      </div>
    </div>
  </div>

  <q-page-sticky position="bottom-right" :offset="[18, 18]"
      v-if="$q.screen.width <= 1023 && validarPermisos('crear.venta')">
    <q-btn round color="secondary" size="lg"
        icon="add" @click=" $router.push('/ventas/add')" />
  </q-page-sticky>

  <q-dialog v-model="modalDetalle">
    <DetalleCompra :detalleData="detalleData" />
  </q-dialog>

  <q-dialog v-model="showModalReenvioComprobantes">
    <ModalReenviarComprobantes
      @closeModal="showModalReenvioComprobantes = false"
      :detalleFactura="detalleFactura" />
  </q-dialog>

</template>

<style>
  .estadoVenta{
    font-size: 14px;
  }
  .totalVenta{
    font-size: 15px;
  }
  .table-ventas .q-table__top,
  .table-ventas .q-table__bottom,
  .table-ventas thead tr:first-child th {
    /* bg color is important for th; just specify one */
    background-color: #ddebdc; }

  .table-ventas tbody tr:nth-child(even) {
    background-color: rgb(124, 27, 27);
    white-space: normal;
  }
  .table-ventas tbody tr:nth-child(even) {
    background-color: rgb(240, 240, 240);
    white-space: normal;
  }
  .table-ventas thead th, .table-ventas tbody td {
    white-space: normal;
  }
</style>
