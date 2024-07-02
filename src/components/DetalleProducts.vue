<script setup lang="ts">
import { ref } from "vue";
import useHelpers from "../composables/useHelpers";

const columns: any = [
  { label: 'Codigo', align: 'left', name: 'codigoBarra' },
  { label: 'Producto', align: 'left', name: 'product' },
  { label: 'Cantidad', align: 'center', field: 'cantidad' },
  { label: 'Precio de Venta', align: 'center', name: 'pvp' },
  { name: 'descuento', label: 'Descuento', align: 'center' },
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

const descargarDocumento = async ( clave_acceso: string, tipo_documento: string, name_proforma = '' ) => {

  try {
    const { data } = await api.post('/invoices/download-ride-xml', {
      clave_acceso,
      tipo_documento,
      razon_social: claim.company.nombre_comercial
    },
      { responseType: 'arraybuffer' }
    );

    const blob = new Blob([ data ], {
      type: tipo_documento == 'ride' || tipo_documento == 'proforma'
                                ?  'application/pdf'
                                : 'application/xml'
    });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `${ tipo_documento == 'proforma'
                        ? name_proforma.replace('.pdf', '')
                        : props.detalleData.numero_comprobante }${ tipo_documento == 'ride' || tipo_documento == 'proforma' ? '.pdf' : '.xml' }`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

  } catch (error) {
    mostrarNotify('negative', 'No se encontro el archivo')
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
              <q-td :props="props">{{ props.row.descuento }}%</q-td>
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
                  outline color="primary" icon="download">
                <q-list>
                  <q-item clickable v-close-popup
                    @click="descargarDocumento(props.detalleData.clave_acceso, 'ride')">
                    <q-item-section>
                      <q-item-label>Descargar RIDE</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item @click="descargarDocumento(props.detalleData.clave_acceso, 'xml')"
                    clickable v-close-popup>
                    <q-item-section>
                      <q-item-label>Descargar XML</q-item-label>
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

