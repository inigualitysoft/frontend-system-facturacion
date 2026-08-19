<script setup lang="ts">
import { computed, ref } from "vue";
import useHelpers from "../composables/useHelpers";

const columns: any = [
  { label: 'Codigo', align: 'left', name: 'codigoBarra' },
  // Techo de ancho para que un nombre de servicio largo salte de línea en vez
  // de estirar la tabla del modal.
  { label: 'Producto', align: 'left', name: 'product',
    style: 'max-width: 340px; white-space: normal; word-break: break-word;',
    headerStyle: 'max-width: 340px' },
  { label: 'Cantidad', align: 'center', field: 'cantidad' },
  { label: 'Precio de Venta', align: 'center', name: 'pvp' },
  { name: 'descuento', label: 'Descuento($)', align: 'center' },
  { name: 'iva', label: 'Aplica IVA', align: 'center' },
  { name: 'total', label: 'Total', align: 'center' }
]

const props = defineProps<{ detalleData: any }>();
const { api, claim, mostrarNotify, formatearNumero } = useHelpers();

let estado: string;
if (props.detalleData.buyToProduct) {
  if( props.detalleData.isActive ) estado = 'Aceptado'
  else estado = 'Anulado'
}else{
  estado = props.detalleData.estadoSRI
}

/*
 * Los comprobantes ya no salen de disco: el backend los pide al microservicio
 * de facturación, así que la descarga tarda. Sin señal visible el operador cree
 * que no pasó nada y vuelve a hacer clic, disparando varias descargas.
 */
const descargando = ref(false);

/** La factura anulada conserva su propia clave y suma la de la nota de crédito. */
const tieneNotaCredito = computed(() => Boolean( props.detalleData.clave_acceso_nota_credito ));

/**
 * ICE del comprobante.
 *
 * Los comprobantes emitidos antes de que existiera la columna `ice` no lo
 * tienen guardado, pero se puede deducir: es lo que le falta al total para
 * cuadrar con subtotal − descuento + IVA. Así el bloque de totales suma bien
 * también para los comprobantes viejos.
 */
const iceComprobante = computed(() => {
  const guardado = Number( props.detalleData.ice ?? 0 );
  if ( guardado > 0 ) return guardado;

  const deducido = Number( props.detalleData.total ?? 0 )
    - ( Number( props.detalleData.subtotal ?? 0 ) - Number( props.detalleData.descuento ?? 0 ) )
    - Number( props.detalleData.iva ?? 0 );

  // Umbral de un centavo: por debajo es ruido de redondeo, no ICE.
  return deducido > 0.005 ? deducido : 0;
});

const descargarDocumento = async (
  clave_acceso: string,
  tipo_documento: string,
  name_proforma = '',
  tipo_comprobante: 'factura' | 'nota-credito' = 'factura'
) => {

  if ( descargando.value ) return;
  descargando.value = true;

  try {
    const { data } = await api.post('/invoices/download-ride-xml', {
      clave_acceso,
      tipo_documento,
      tipo_comprobante,
      // Solo lo usa la proforma: si su PDF no está en el disco, el backend lo
      // rehace con este id en vez de responder que no lo encuentra.
      invoice_id: props.detalleData.id,
      razon_social: claim.company.nombre_comercial
    },
      { responseType: 'arraybuffer' }
    );

    const esPDF = tipo_documento == 'ride' || tipo_documento == 'proforma';

    const blob = new Blob([ data ], {
      type: esPDF ?  'application/pdf' : 'application/xml'
    });

    let nombre = props.detalleData.numero_comprobante;
    if ( tipo_documento == 'proforma' )
      // Se quita el sufijo interno (-a1b2c3d4) para que el archivo descargado
      // quede como "proforma-3" y no con el fragmento del id del comprobante.
      nombre = name_proforma.replace(/^(proforma-\d+)-[0-9a-f]{8}\.pdf$/i, '$1').replace('.pdf', '');
    else if ( tipo_comprobante == 'nota-credito' )
      nombre = `NC-${ props.detalleData.numero_comprobante_nota_credito ?? props.detalleData.numero_comprobante }`;

    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `${ nombre }${ esPDF ? '.pdf' : '.xml' }`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

  } catch (error: any) {
    // Con responseType arraybuffer el cuerpo del error también llega binario, no
    // como objeto: sin decodificarlo se perdía el motivo real y siempre salía el
    // mensaje genérico, aunque el backend explicara qué faltaba.
    let motivo = '';
    try {
      const cuerpo = error?.response?.data;
      const texto  = cuerpo instanceof ArrayBuffer
        ? new TextDecoder().decode( cuerpo )
        : typeof cuerpo == 'string' ? cuerpo : '';

      const mensaje = texto ? JSON.parse( texto )?.message : '';
      motivo = Array.isArray( mensaje ) ? mensaje.join(', ') : ( mensaje ?? '' );
    } catch { /* el cuerpo no era JSON: se queda el mensaje genérico */ }

    mostrarNotify('negative', motivo || 'No se pudo descargar el comprobante')
  } finally {
    descargando.value = false;
  }
}

const pagination = ref({
  sortBy: 'desc',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 15
});
</script>

<template>
  <q-card
    :style="$q.screen.width <= 1023 ? 'max-width: 92vw;' : 'max-width: 60vw;'">
    <q-card-section class="q-pb-none">
      <div class="text-h6 text-center">
        {{ props.detalleData.buyToProduct
            ? 'Detalle de Compra'
            : props.detalleData.estadoSRI == 'PROFORMA' ? 'Detalle de la Proforma' : 'Detalle de la Factura'
        }}
      </div>
    </q-card-section>

    <q-card-section class="q-pb-none q-pt-xs">
      <div class="row q-gutter-sm text-center">
        <div class="col-xs-12 col-sm-5"
          :class="[$q.screen.xs ? 'text-center' : 'text-right']">
          <label class="text-subtitle1 text-weight-medium">
            Num. Comprobantes:
          </label>
        </div>
        <div class="col-xs-12 col-sm-5 q-mt-sm flex items-center"
        :class="[$q.screen.xs ? 'justify-center' : 'q-ml-lg']">
          <label>{{ props.detalleData.numero_comprobante }}</label>
        </div>
        <div v-if="!props.detalleData.buyToProduct"
          class="col-xs-12 col-sm-5 q-mt-none"
          :class="[$q.screen.xs ? 'text-center' : 'text-right']">
          <label class="text-subtitle1 text-weight-medium">Clave de Acceso:</label>
        </div>
        <div v-if="!props.detalleData.buyToProduct"
          class="col-xs-12 col-sm-6 q-mt-none flex items-center"
          :class="[$q.screen.xs ? 'justify-left' : 'q-ml-lg text-left']">
          <label style="width: 100%;word-wrap: break-word;">
            {{ props.detalleData.clave_acceso }}
          </label>
        </div>
        <div v-if="props.detalleData.buyToProduct"
          class="col-xs-12 col-sm-5 q-mt-none"
          :class="[$q.screen.xs ? 'text-center' : 'text-right']">
          <label class="text-subtitle1 text-weight-medium">Descripción:</label>
        </div>
        <div v-if="props.detalleData.buyToProduct"
          class="col-xs-12 col-sm-5 q-mt-none flex items-center"
          :class="[$q.screen.xs ? 'justify-center' : 'q-ml-lg']">
          <label>{{ props.detalleData.descripcion }}</label>
        </div>
        <div class="col-xs-12 col-sm-5 q-mt-none"
          :class="[$q.screen.xs ? 'text-center' : 'text-right']">
          <label class="text-subtitle1 text-weight-medium">Sucursal:</label>
        </div>
        <div class="col-xs-12 col-sm-5 q-mt-none flex items-center"
          :class="[$q.screen.xs ? 'justify-center' : 'q-ml-lg']">
          <label>{{ props.detalleData.sucursal_id.nombre }}</label>
        </div>
        <div class="col-xs-12 col-sm-5 q-mt-none"
        :class="[$q.screen.xs ? 'text-center' : 'text-right']">
          <label class="text-subtitle1 text-weight-medium">
            {{ props.detalleData.buyToProduct ? 'Proveedor' : 'Cliente' }}
          </label>
        </div>
        <div class="col-xs-12 col-sm-5 q-mt-none flex items-center"
          :class="[$q.screen.xs ? 'justify-center' : 'q-ml-lg']">
          <label v-if="props.detalleData.buyToProduct">
            {{ props.detalleData.proveedor_id.razon_social }}
          </label>
          <label v-else>
            {{ props.detalleData.customer_id.nombres }}
          </label>
        </div>
        <div class="col-xs-12 col-sm-5 q-mt-none"
          :class="[$q.screen.xs ? 'text-center' : 'text-right']">
          <label class="text-subtitle1 text-weight-medium">Usuario:</label>
        </div>
        <div class="col-xs-12 col-sm-5 q-mt-none flex items-center"
          :class="[$q.screen.xs ? 'justify-center' : 'q-ml-lg']">
          <label>{{ props.detalleData.user_id.fullName.toUpperCase() }}</label>
        </div>
        <div class="col-xs-12 col-sm-5 q-mt-none"
          :class="[$q.screen.xs ? 'text-center' : 'text-right']">
          <label class="text-subtitle1 text-weight-medium">
            {{ props.detalleData.buyToProduct ? 'Fecha de Compra:' : 'Fecha de Emisión:' }}
          </label>
        </div>
        <div class="col-xs-12 col-sm-5 q-mt-none flex items-center"
          :class="[$q.screen.xs ? 'justify-center' : 'q-ml-lg']">
          <label v-if="props.detalleData.buyToProduct">
            {{ props.detalleData.fecha_compra }}
          </label>
          <label v-else>
            {{ props.detalleData.created_at }}
          </label>
        </div>
        <div class="col-xs-12 col-sm-5 q-mt-none"
          :class="[$q.screen.xs ? 'text-center' : 'text-right']">
          <label class="text-subtitle1 text-weight-medium">
            Estado:
          </label>
        </div>
        <div class="col-xs-12 col-sm-5 q-mt-none flex items-center"
          :class="[$q.screen.xs ? 'justify-center' : 'q-ml-lg']">
          <q-badge  outline class="q-py-xs q-px-md"
            :color="$q.dark.isActive ? 'blue-grey-3' : 'blue-grey-7'"
            :label="estado" />
        </div>

        <div class="col-xs-12 col-sm-12 q-my-sm">
          <q-table
            style="max-height: 300px"
            :class="[$q.dark.isActive ? '' : 'my-sticky-header-table2']"
            :rows="props.detalleData.invoiceToProduct ?
              props.detalleData.invoiceToProduct : props.detalleData.buyToProduct"
            :columns="columns"
            v-model:pagination="pagination"
            hide-bottom
            row-key="name">
            <template v-slot:body-cell-indice="props">
              <q-td :props="props">{{  props.pageIndex + 1 }}</q-td>
            </template>

            <template v-slot:body-cell-descuento="props">
              <!-- El descuento por línea pasó de porcentaje a monto. -->
              <q-td :props="props">{{ formatearNumero(props.row.descuento) }}</q-td>
            </template>

            <template v-slot:body-cell-product="props">
              <q-td :props="props">{{ props.row.product_id.nombre }}</q-td>
            </template>

            <template v-slot:body-cell-iva="producto">

              <q-td v-if="props.detalleData.buyToProduct"
                :props="producto">
                {{ producto.row.iva ? 'SI' : 'NO' }}
              </q-td>
              <q-td v-else>
                {{ producto.row.product_id.aplicaIva ? 'SI' : 'NO' }}
              </q-td>

            </template>

            <template v-slot:body-cell-total="props">
              <q-td :props="props">
                {{ props.row.v_total }}
              </q-td>
            </template>

            <template v-slot:body-cell-codigoBarra="props">
              <q-td :props="props">{{ props.row.product_id.codigoBarra }}</q-td>
            </template>

            <template v-slot:body-cell-pvp="props">
              <q-td :props="props">
                {{ formatearNumero((parseFloat(props.row.v_total) / parseInt(props.row.cantidad))) }}
              </q-td>
            </template>

            <template v-slot:loading>
              <q-inner-loading showing color="primary" />
            </template>
          </q-table>

          <div class="row">

            <div v-if="!$q.screen.xs && estado !== 'PROFORMA' && !props.detalleData.buyToProduct"
              class="col-xs-12 col-sm-6 row items-center">
              <q-btn-dropdown class="q-mr-xs" label="Descargar Documento"
                  outline color="primary" icon="download"
                  :loading="descargando" :disable="descargando">
                <q-list>
                  <q-item clickable v-close-popup :disable="descargando"
                    @click="descargarDocumento(props.detalleData.clave_acceso, 'ride')">
                    <q-item-section>
                      <q-item-label>Descargar RIDE</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item @click="descargarDocumento(props.detalleData.clave_acceso, 'xml')"
                    clickable v-close-popup :disable="descargando">
                    <q-item-section>
                      <q-item-label>Descargar XML</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-separator v-if="tieneNotaCredito" />

                  <q-item v-if="tieneNotaCredito" clickable v-close-popup :disable="descargando"
                    @click="descargarDocumento(props.detalleData.clave_acceso_nota_credito, 'ride', '', 'nota-credito')">
                    <q-item-section>
                      <q-item-label>Descargar Nota Crédito</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item v-if="tieneNotaCredito" clickable v-close-popup :disable="descargando"
                    @click="descargarDocumento(props.detalleData.clave_acceso_nota_credito, 'xml', '', 'nota-credito')">
                    <q-item-section>
                      <q-item-label>Descargar XML Nota Crédito</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-btn-dropdown>
            </div>

            <div
              v-if="!$q.screen.xs && estado == 'PROFORMA'"
              class="col-xs-12 col-sm-6 row items-center">
              <q-btn
                @click="descargarDocumento(props.detalleData.name_proforma, 'proforma', props.detalleData.name_proforma)"
                outline rounded
                :loading="descargando" :disable="descargando"
                style="color: #696cff">
                &nbsp; DESCARGAR PROFORMA
              </q-btn>
            </div>

            <div
              class="col-xs-12"
              :class="props.detalleData.buyToProduct ? 'col-sm-12' : 'col-sm-6'"
              style="display: flex;justify-content: end;">
              <table style="margin-right: 5px;">
                <tr class="text-right">
                  <td><b>TOTAL BRUTO:</b></td>
                  <td style="width: 90px;" class="text-subtitle1 text-weight-regular">
                    {{ formatearNumero(props.detalleData.subtotal) }}
                  </td>
                </tr>
                <tr class="text-right">
                  <td class=""><b>DESCUENTOS:</b></td>
                  <td style="width: 90px;" class="text-subtitle1 text-weight-regular">
                    {{ formatearNumero(props.detalleData.descuento) }}
                  </td>
                </tr>
                <tr class="text-right">
                  <td><b>SUBTOTAL:</b></td>
                  <td style="width: 90px;" class="text-subtitle1 text-weight-regular">
                    {{ formatearNumero(parseFloat(props.detalleData.subtotal) - parseFloat(props.detalleData.descuento))  }}
                  </td>
                </tr>
                <tr v-if="iceComprobante > 0" class="text-right">
                  <td class="q-py-none"><b>ICE:</b></td>
                  <td style="width: 90px;" class="text-subtitle1 text-weight-regular">
                    {{ formatearNumero(iceComprobante) }}
                  </td>
                </tr>
                <tr class="text-right">
                  <td class="q-py-none"><b>IVA({{ props.detalleData.porcentaje_iva }}%):</b></td>
                  <td style="width: 90px;" class="text-subtitle1 text-weight-regular">
                    {{ formatearNumero(props.detalleData.iva) }}
                  </td>
                </tr>
                <tr class="text-right">
                  <td><b>
                    {{ props.detalleData.buyToProduct
                      ? 'TOTAL DE COMPRA:'
                      : 'TOTAL DE VENTA:'
                    }}

                  </b></td>
                  <td style="width: 90px;">
                    <q-badge outline class="text-subtitle1 text-weight-bold"
                        color="secondary" :label="`${ formatearNumero(props.detalleData.total) }`" />
                  </td>
                </tr>
              </table>
            </div>

            <div v-if="$q.screen.xs"
              class="col-xs-12 row justify-center q-my-sm col-sm-5">
              <q-btn type="submit" label="Descargar Documento" icon-right="picture_as_pdf"
                outline rounded style="color: #696cff" size="14px" />
            </div>

          </div>
        </div>

      </div>
    </q-card-section>
  </q-card>
</template>

<style>
.my-sticky-header-table2 .q-table__top,
.my-sticky-header-table2 .q-table__bottom,
.my-sticky-header-table2 thead tr:first-child th {
  /* bg color is important for th; just specify one */
  background-color: #737873;
  color: rgb(245, 241, 241);
}

.my-sticky-header-table2 tbody tr:nth-child(even) {
    background-color: rgb(240, 240, 240);
}
.fuente-movil{
  font-size:11px
}
</style>

