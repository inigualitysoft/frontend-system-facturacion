<script setup>
import { ref } from "vue";
import { useEditCliente } from "../../composables/useEditCliente.js";
import { useCliente } from "../../composables/useCliente.js";
import { useImpresion } from "../../composables/useImpresion.js";
import ModalPago from "./ModalPago.vue";
import ModalNuevaFactura from "./ModalNuevaFactura.vue";
import { date, Dialog } from 'quasar'
import { Manager } from "socket.io-client";

  const columns = ref([
    { name: 'x', align: 'center', label: ' ', field: 'x' },
    { name: 'n_comprobantes', align: 'center', label: 'N. Comprobante', field: 'n_comprobantes' },
    { name: 'emitido', label: 'Emitido', field: 'emitido', align: 'center' },
    { name: 'vencimiento', label: 'Vencimiento', field: 'vencimiento', align: 'center' },
    { name: 'precio', label: 'Total', field: 'precio', align: 'center' },
    { name: 'iva', label: 'Impuesto', field: 'iva', align: 'center' },
    { name: 'pagado', label: 'Pagado', field: 'pagado', align: 'center' },
    { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
    { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' }
  ])
  const nuevoPago = ref( true );
  const servicioSelected = ref({});

  const {
    api,
    servicios,
    pagos,
    showModalPago,
    showModalNuevaFactura,
    dia_vencimiento
  } = useEditCliente();
  const { claim, route } = useCliente();

  /* --------------------- IMPLEMENTACION DE WEBSOCKET ---------------------- */
  let socket;

  const connectToServer = () => {
    const manager = new Manager(`${ import.meta.env.VITE_BASE_URL }/socket.io/socket.io.js`, {
      extraHeaders: {
        autentication: claim.id
      }
    });

    socket?.removeAllListeners();
    socket = manager.socket('/'); //conectarme algun namespace

    socket.on('updateStateInvoice', () => {
      pagos.value = []
      getPagosServicio();
    })
  }
  // ---------------------------------------------------------------------------

  const getClient = async () => {
    const { data } = await api.get('/customers/find/' + route.params.client_id);
    return data
  }

  const getPagosServicio = async () => {
    try {
      pagos.value = []
      const { data } = await api.get('/pagos/find/' + servicios.value[0].servicio_id);

      if( data.length > 0 ){
        if( data[0].servicio.factura_id.tipo_comprobante == 'Recibo' )
          columns.value[1].label = 'Tipo Comprobante'
      }

      data.forEach(x => {

        let impuesto;
        if(x.servicio.factura_id.tipo_impuesto == 'Impuestos incluido')
        impuesto = `${ Math.floor((parseFloat( x.servicio.precio ) * 0.12) * 100) / 100 }`
      else
          impuesto = 0.00

        let totalPagado = 0;
        x.pagos.forEach( pago => { totalPagado += parseFloat(pago.valor) });
        const estado = x.estadoSRI?.trim();

        let diasGracias = parseInt(x.servicio.factura_id.dia_gracia.split(' ')[0]);
        const fechaPago = date.addToDate(x.dia_pago, { days: ( diasGracias + 1 ) })

        pagos.value.push({
          ambiente: x.sucursal_id ? x.sucursal_id.ambiente : '',
          clave_acceso: x.clave_acceso,
          company_name: x.servicio.router_id.company_id.nombre_comercial,
          num_comprobante: x.num_comprobante,
          sucursal_id: x.sucursal_id !== null ? x.sucursal_id.id : null,
          pago_id: x.id,
          ruc: x.servicio.perfil_internet.router_id.company_id.ruc,
          direccion: x.sucursal_id !== null ? x.sucursal_id.direccion : null,
          emitido: date.formatDate(x.created_at, 'DD/MM/YYYY'),
          vencimiento: date.formatDate(fechaPago, 'DD/MM/YYYY'),
          precio: `${ x.servicio.precio }`,
          tipo_comprobante: x.servicio.factura_id.tipo_comprobante,
          iva: impuesto,
          pagos: x.pagos,
          pagado: totalPagado,
          servicio: x.servicio,
          estado,
          cancelado: ( totalPagado >= parseFloat(x.servicio.precio)) ? true : false,
          expand: false,
          loading: false
        })
      });
    } catch (error) {
      console.log( error );
    }
  }

  const reEmitirFactura = async ( data, index ) => {
    pagos.value[index].loading = true;

    let headers = { headers: { 'sucursal-id': data.sucursal_id } };
    let datosFactura = {
      ambiente: data.ambiente,
      clave_acceso: data.clave_acceso,
      company_name: data.company_name,
      sucursal_id: data.sucursal_id,
      customer_id: route.params.client_id,
      num_comprobante: data.num_comprobante,
      tipo: 'EMISION',
      subtotal:   parseFloat( data.precio ),
      iva:        parseFloat( data.iva ),
      descuento:  0.00,
      total:      parseFloat( data.precio ),
      entity: 'Pagos',
      pago_id: data.pago_id,
      user_id: claim.id,
      products: [{
        aplicaIva: data.iva > 0 ? true : false,
        cantidad: 1,
        pvp: data.precio,
        descuento: 0,
        nombre: 'SERVICIO DE INTERNET',
        codigoBarra: data.pago_id.split('-')[0]
      }]
    }

    if (data.estado.trim() == 'ERROR ENVIO RECEPCION')
      await api.post('/CE/facturas/recepcionComprobantesOffline', datosFactura, headers);

    if (data.estado.trim() == 'RECIBIDA')
      await api.post('/CE/facturas/autorizacionComprobantesOffline', datosFactura, headers);

    pagos.value[index].loading = false;
  }

  const imprimir = async ( data, tipo, pago = null) => {

    if ( pago ) {
      data.company_name = pago.company_name
      data.ruc = pago.ruc
      data.direccion = pago.direccion
    }

    const cliente =  await getClient();
    const dataCliente = {
      cliente: cliente[0].nombres,
      tipoDoc: cliente[0].tipo_documento,
      num_doc: cliente[0].numero_documento,
      email: cliente[0].email
    }

    const { imprimirAbono, imprimirFactura } = useImpresion();

    let plantilla = ''
    if ( tipo == 'Recibo' )
      plantilla = imprimirAbono( data, dataCliente, claim.fullName, tipo );
    else
      plantilla = imprimirFactura( data, dataCliente, claim.fullName, tipo );

    var ventanaImpresion = window.open('', '_blank');

    ventanaImpresion.document.write( plantilla );

    ventanaImpresion.print();
    ventanaImpresion.close();
  }

  const borrarAbono = ( abono, abonos, valorServicio, pago_id ) => {
    Dialog.create({
      title: '¿Estas seguro de eliminar este abono?',
      message: `<span style="display: block;width: 100%;display: flex;align-items: center;">
                  <strong style="display: inline-block;width: 40%;text-align: end;">
                    Fecha abonado:
                  </strong>
                  <label style="display: inline-block;width: 57%;" class="q-ml-xs">
                    ${ abono.fecha_abono } ${ abono.hora_abono }
                  </label>
                </span>
                <span style="display: block;width: 100%;display: flex;align-items: center;">
                  <strong style="display: inline-block;width: 40%;text-align: end;">
                    Forma de pago:
                  </strong>
                  <label style="display: inline-block;width: 57%;" class="q-ml-xs">
                    ${ abono.forma_pago }
                  </label>
                </span>
                <span style="display: block;width: 100%;display: flex;align-items: center;">
                  <strong style="display: inline-block;width: 40%;text-align: end;">
                    Valor Abonado:
                  </strong>
                  <label style="display: inline-block;width: 57%;" class="q-ml-xs">
                    $${ parseFloat(abono.valor).toFixed(2) }
                  </label>
                </span>`,
      html: true,
      ok: { push: true, label:'Eliminar', color: 'teal-7' },
      cancel: { push: true, color: 'blue-grey-8', label: 'Cancelar' }
    }).onOk( async () => {
      try {
        const pagoss = [ ...abonos ];
        let totalAbonado = 0;

        pagoss.reverse().map( (pago, index) => {
          if ( abono.hora_abono == pago.hora_abono && abono.valor == pago.valor ) {
            pago.delete = true;
          }else{
            pago.totalAbonado = (parseFloat( pago.valor ) + totalAbonado).toString();
            pago.monto_pendiente = (parseFloat( valorServicio ) - parseFloat( pago.totalAbonado )).toString();
            totalAbonado += parseFloat(pago.totalAbonado);
          }
        })

        setTimeout(async () => {
          const array = pagoss.filter( x => x.delete !== true);

          await api.patch(`/pagos/${ pago_id }`, { pagos: array });
          getPagosServicio();
        }, 1000)

      } catch (error) {
        mostrarNotify('negative', error.response.data.message);
      }
    })
  }

  const downloadRide = async ( clave_acceso ) => {
    await api.post(`/CE/facturas/getRide/${ clave_acceso }`, { }, {responseType: 'blob'}).then(response => {
      var oMyBlob = new Blob([response.data], {type : 'application/pdf'});
      var url = URL.createObjectURL(oMyBlob);
      window.open(url);
    }).catch(error => {
      if(error.response.status == 422) {
        this.$setLaravelErrors(error.response.data.errors);
      }
    })
  }

  getPagosServicio();
  connectToServer();

</script>
<template>
  <q-form @submit="">
    <div class="my-card">

      <div class="q-pt-none">
        <div class="row">
          <div class="col-12">
            <div class="row">

              <div class="col-12 text-right">
                <q-btn @click="showModalNuevaFactura = true"
                  outline color="primary" label="Factura de Servicio"
                  class="q-mr-xs" :class="!$q.screen.xs || 'q-mt-sm'" />
              </div>

              <div class="col-12 q-mt-md">
                <q-table :rows="pagos" :columns="columns"
                  :class="[$q.dark.isActive ? '' : 'my-sticky-header-table3']"
                  :hide-pagination="true" :rows-per-page-options="[50]"
                  row-key="name">

                  <template v-slot:body="props">
                    <q-tr :props="props">

                      <q-td v-if="props.row.estado != 'NO PAGADO'"
                        auto-width>
                        <q-btn size="sm" color="accent" round dense
                        @click="props.row.expand = !props.row.expand"
                        :icon="props.row.expand ? 'remove' : 'add'" />
                      </q-td>
                      <q-td v-else auto-width>
                      </q-td>

                      <q-td key="n_comprobantes" :props="props">
                        {{
                          props.row.tipo_comprobante == 'Recibo'
                          ? 'Recibo'
                          : (props.row.num_comprobante == '' || props.row.num_comprobante == null)
                          ? '- - - - - -'
                          : props.row.num_comprobante
                        }}
                      </q-td>
                      <q-td key="emitido" :props="props">
                        {{ props.row.emitido }}
                      </q-td>
                      <q-td key="vencimiento" :props="props">
                        {{ props.row.vencimiento}}
                      </q-td>
                      <q-td key="precio" :props="props">
                        ${{ props.row.precio}}
                      </q-td>
                      <q-td key="iva" :props="props">
                        ${{ props.row.iva }}
                      </q-td>
                      <q-td key="pagado" :props="props">
                        ${{ props.row.pagado }}
                      </q-td>
                      <q-td key="estado" :props="props">
                        <q-badge v-if="props.row.estado == 'AUTORIZADO'"
                          outline class="q-py-xs q-px-md" color="secondary">
                          PAGADO <br> Y <br> AUTORIZADO
                        </q-badge>

                        <q-badge v-else-if="props.row.estado == 'NO PAGADO'
                                            || props.row.estado == 'PENDIENTE'"
                        outline class="q-py-xs q-px-md"
                        :color="$q.dark.isActive ? 'blue-grey-3' : 'blue-grey-7'"
                        :label="props.row.estado" />

                        <q-badge v-else-if="props.row.estado == 'PAGADO'"
                        outline class="q-py-xs q-px-md"
                        :color="'secondary'"
                        :label="props.row.estado" />

                        <q-badge v-else outline class="q-py-xs q-px-md"
                          :color="$q.dark.isActive ? 'warning' : 'orange-10'">
                          PAGADO <br> - <br> {{ props.row.estado }}
                        </q-badge>
                      </q-td>
                      <q-td key="acciones" :props="props">
                        <q-btn v-if="!props.row.cancelado"
                          round color="blue-grey"
                          @click="showModalPago = true, servicioSelected = props.row"
                          icon="done" size="10px" class="q-mr-sm">
                          <q-tooltip class="bg-indigo" anchor="top middle" self="center middle">
                            Agregar Pago
                          </q-tooltip>
                        </q-btn>
                        <q-btn v-if="props.row.estado == 'ERROR ENVIO RECEPCION'
                              || props.row.estado == 'ERROR ENVIO RECEPCION - ANULACION'
                              || props.row.estado == 'RECIBIDA'"
                              round color="blue-grey" icon="fa-solid fa-retweet"
                                :loading="props.row.loading"
                               @click="reEmitirFactura( props.row, props.rowIndex )"
                              size="10px" class="q-mr-sm">
                          <q-tooltip class="bg-indigo" anchor="top middle" self="center middle">
                            Emitir Factura Electrónica
                          </q-tooltip>
                        </q-btn>
                        <q-btn v-if="props.row.estado == 'AUTORIZADO'"
                            round color="blue-grey" icon="print"
                            @click="imprimir(props.row, 'factura')"
                            size="10px" class="q-mr-sm">
                          <q-tooltip class="bg-indigo" anchor="top middle" self="center middle">
                            Imprimir comprobante
                          </q-tooltip>
                        </q-btn>
                        <q-btn v-if="props.row.estado == 'AUTORIZADO'"
                            round color="blue-grey" icon="fa-solid fa-file-pdf"
                            @click="downloadRide(props.row.clave_acceso)"
                            size="10px" class="q-mr-sm">
                          <q-tooltip class="bg-indigo" anchor="top middle" self="center middle">
                            Descargar PDF
                          </q-tooltip>
                        </q-btn>
                      </q-td>
                    </q-tr>

                    <q-tr v-show="props.row.expand" :props="props">
                      <q-td colspan="100%">
                        <div class="row q-col-gutter-sm">
                          <div v-for="(pago, index) in props.row.pagos" :key="index"
                          class="col-4" >
                            <q-list bordered padding dense>
                              <q-item-label header class="text-center">
                                Fecha Abonado: {{ pago.fecha_abono }} {{ pago.hora_abono }}
                              </q-item-label>

                              <q-item tag="label" v-ripple>
                                <q-item-section>
                                  <q-item-label>Forma de Pago:</q-item-label>
                                </q-item-section>
                                <q-item-section side top class="justify-center">
                                  <q-item-label>
                                    {{ pago.forma_pago }}
                                  </q-item-label>
                                </q-item-section>
                              </q-item>

                              <q-item tag="label" v-ripple class="">
                                <q-item-section>
                                  <q-item-label>Valor Abonado:</q-item-label>
                                </q-item-section>
                                <q-item-section side top class="justify-center">
                                  <q-item-label>${{ pago.valor }}</q-item-label>
                                </q-item-section>
                              </q-item>

                              <q-item tag="label" v-ripple>
                                <q-item-section>
                                  <q-item-label>Nº transacción:</q-item-label>
                                </q-item-section>
                                <q-item-section side top class="justify-center">
                                  <q-item-label>{{ pago.n_transaccion }}</q-item-label>
                                </q-item-section>
                              </q-item>

                              <q-item tag="label" v-ripple>
                                <q-item-section>
                                  <q-item-label>Detalle:</q-item-label>
                                </q-item-section>
                                <q-item-section side top class="justify-center">
                                  <q-item-label>
                                    {{ pago.detalle == '' ? 'Sin detalles' : pago.detalle }}
                                  </q-item-label>
                                </q-item-section>
                              </q-item>

                              <q-item tag="label" v-ripple>
                                <q-item-section>
                                  <q-item-label class="text-center">

                                    <q-btn v-if="props.row.estado == 'PENDIENTE'" square
                                    @click="showModalPago = true, servicioSelected = { pagos: props.row, pago}, nuevoPago = false"
                                    :color="$q.dark.isActive ? 'blue-grey-2' : 'blue-grey-7'"
                                      class="q-px-md q-mr-md" outline rounded
                                      dense icon-right="edit" />

                                    <q-btn square
                                    @click="imprimir(pago, 'Recibo', props.row)"
                                    :color="$q.dark.isActive ? 'blue-grey-2' : 'blue-grey-7'"
                                      class="q-px-md" outline rounded
                                      dense icon-right="print" />

                                    <q-btn v-if="props.row.estado == 'PENDIENTE'" square
                                      @click="borrarAbono( pago, props.row.pagos, props.row.precio, props.row.pago_id )"
                                      :color="$q.dark.isActive ? 'blue-grey-2' : 'blue-grey-7'"
                                      class="q-px-md q-ml-md" outline rounded
                                      dense icon-right="delete" />
                                  </q-item-label>
                                </q-item-section>
                              </q-item>
                            </q-list>
                          </div>
                        </div>
                      </q-td>
                    </q-tr>
                  </template>

                  <template v-slot:no-data="{ icon }">
                    <div class="full-width row flex-center text-lime-10 q-gutter-sm">
                      <span class="text-subtitle1">
                        No se encontró ningun registros
                      </span>
                    </div>
                  </template>

                </q-table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-form>

  <q-dialog v-model="showModalPago">
    <ModalPago :servicio="servicioSelected" :nuevoPago="nuevoPago"
      @actualizar-datos="getPagosServicio" />
  </q-dialog>

  <q-dialog v-model="showModalNuevaFactura">
    <ModalNuevaFactura @actualizar-datos="getPagosServicio" />
  </q-dialog>
</template>

<style>
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