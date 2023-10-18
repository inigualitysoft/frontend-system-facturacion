<template>
    <q-card style="width: 990px; max-width: 80vw;">
      <q-card-section class="q-pb-none">
        <div class="text-h6 text-center">Detalle de la Factura</div>
      </q-card-section>
  
      <q-card-section>
        <div class="row q-gutter-sm text-center">
          <div class="col-xs-12 col-sm-5" 
            :class="[$q.screen.xs ? 'text-center' : 'text-right']">
            <label class="text-subtitle1 text-weight-medium">
              Num. Comprobantes:
            </label>
          </div>
          <div class="col-xs-12 col-sm-5 q-ml-lg q-mt-sm flex items-center" 
          :class="[$q.screen.xs ? 'justify-center' : '']">
            <label>{{ props.detalleData.numero_comprobante }}</label>
          </div>
          <div v-if="!props.detalleData.buyToProduct"
            class="col-xs-12 col-sm-5 q-mt-none" 
            :class="[$q.screen.xs ? 'text-center' : 'text-right']">
            <label class="text-subtitle1 text-weight-medium">Clave de Acceso:</label>
          </div>
          <div v-if="!props.detalleData.buyToProduct"
            class="col-xs-12 col-sm-5 q-mt-none flex items-center" 
            :class="[$q.screen.xs ? 'justify-left' : 'q-ml-lg']">
            <label>{{ props.detalleData.clave_acceso }}</label>
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
          <div class="col-xs-12 col-sm-5 q-ml-lg q-mt-none flex items-center" 
            :class="[$q.screen.xs ? 'justify-center' : '']">
            <label>{{ props.detalleData.sucursal_id.nombre }}</label>
          </div>
          <div class="col-xs-12 col-sm-5 q-mt-none" 
          :class="[$q.screen.xs ? 'text-center' : 'text-right']">
            <label class="text-subtitle1 text-weight-medium">
              {{ props.detalleData.buyToProduct ? 'Proveedor' : 'Cliente' }}
            </label>
          </div>
          <div class="col-xs-12 col-sm-5 q-ml-lg q-mt-none flex items-center" 
            :class="[$q.screen.xs ? 'justify-center' : '']">
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
          <div class="col-xs-12 col-sm-5 q-ml-lg q-mt-none flex items-center" 
            :class="[$q.screen.xs ? 'justify-center' : '']">
            <label>{{ props.detalleData.user_id.fullName }}</label>
          </div>
          <div class="col-xs-12 col-sm-5 q-mt-none" 
            :class="[$q.screen.xs ? 'text-center' : 'text-right']">
            <label class="text-subtitle1 text-weight-medium">
              {{ props.detalleData.buyToProduct ? 'Fecha de Compra' : 'Fecha de Emisión' }}
            </label>
          </div>
          <div class="col-xs-12 col-sm-5 q-ml-lg q-mt-none flex items-center" 
            :class="[$q.screen.xs ? 'justify-center' : '']">
            <label v-if="props.detalleData.buyToProduct">
              {{ props.detalleData.fecha_compra }}
            </label>
            <label v-else>
              {{ props.detalleData.created_at }}
            </label>
          </div>

          <div class="col-xs-12 col-sm-12 q-my-sm">
            <q-table :class="[$q.dark.isActive ? '' : 'my-sticky-header-table2']"
              :rows="props.detalleData.invoiceToProduct ? 
                props.detalleData.invoiceToProduct : props.detalleData.buyToProduct"
              :columns="columns"
              hide-bottom
              row-key="name">
              <template v-slot:body-cell-indice="props">
                <q-td :props="props">{{  props.pageIndex + 1 }}</q-td>
              </template>
  
              <template v-slot:body-cell-descuento="props">
                <q-td :props="props">{{ props.row.product_id.descuento }}%</q-td>
              </template>
  
              <template v-slot:body-cell-product="props">
                <q-td :props="props">{{ props.row.product_id.nombre }}</q-td>
              </template>

              <template v-slot:body-cell-iva="props">
                <q-td :props="props">{{ props.row.product_id.aplicaIva ? 'SI' : 'NO' }}</q-td>
              </template> 

              <template v-slot:body-cell-total="props">
                <q-td :props="props">${{ props.row.v_total }}</q-td>
              </template> 

              <template v-slot:body-cell-codigoBarra="props">
                <q-td :props="props">{{ props.row.product_id.codigoBarra }}</q-td>
              </template> 

              <template v-slot:body-cell-pvp="props">
                <q-td :props="props">${{ props.row.product_id.pvp }}</q-td>
              </template> 
  
              <template v-slot:loading>
                <q-inner-loading showing color="primary" />
              </template>
            </q-table>
            <div class="col-xs-12 col-md-12" style="display: flex;justify-content: end;">
            <table style="margin-right: 5px;">
              <tr class="text-right">
                <td><b>SUBTOTAL:</b></td>
                <td style="width: 90px;" class="text-subtitle1 text-weight-regular">
                  {{ props.detalleData.subtotal }}
                </td>
              </tr>
              <tr class="text-right">
                <td class="q-py-none"><b>IVA(12%):</b></td>
                <td style="width: 90px;" class="text-subtitle1 text-weight-regular">
                  {{ props.detalleData.iva }}
                </td>
              </tr>
              <tr class="text-right">
                <td class=""><b>TOTAL DESCUENTO:</b></td>
                <td style="width: 90px;" class="text-subtitle1 text-weight-regular">
                  {{ props.detalleData.descuento }}
                </td>
              </tr>
              <tr class="text-right">
                <td><b>TOTAL DE VENTA:</b></td>
                <td style="width: 90px;">
                  <q-badge outline class="text-subtitle1 text-weight-bold"
                      color="secondary" :label="`$${ props.detalleData.total }`" />
                </td>
              </tr>
            </table>
          </div>
          </div>
  
        </div>
      </q-card-section>
    </q-card>
  </template>
  
<script setup lang="ts">

  const columns: any = [
    { label: 'Codigo Barra', align: 'left', name: 'codigoBarra' },
    { label: 'Producto', align: 'left', name: 'product' },
    { label: 'Cantidad', align: 'center', field: 'cantidad' },
    { label: 'Precio de Venta', align: 'center', name: 'pvp' },
    { name: 'descuento', label: 'Descuento', align: 'center' },
    { name: 'iva', label: 'Aplica IVA', align: 'center' },
    { name: 'total', label: 'Total', align: 'center' }
  ]
  
  const props = defineProps<{ detalleData: any }>();
  console.log( props.detalleData );
  
</script>
  
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
  