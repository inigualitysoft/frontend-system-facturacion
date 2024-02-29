<script setup>
  import { computed, ref } from 'vue';
  import { date, Dialog } from 'quasar'
  import { useEditCliente } from "../../composables/useEditCliente";
  
  const { api, claim, pagos, mostrarNotify, route, showModalNuevaFactura } = useEditCliente();

  const columns = ref([
    { name: 'acciones', label: 'Quitar', align: 'left'  },
    { label: 'Producto/Servicio', align: 'left', field: 'producto', name: 'producto' },
    { name: 'cantidad', label: 'Cantidad', align: 'left'},
    { name: 'iva', label: 'IVA(%)', align: 'center' },
    { name: 'descuento', label: 'Descuento %', align: 'left', field: 'descuento' },
    { name: 'v_total', label: 'Total', align: 'center', field: 'v_total' }
  ]);
  const rows       = ref([]);
  const sucursales = ref([]);
  const loading    = ref( false );

  const formFactura = ref({
    fechaVencimiento: '',
    fecha: '',
    sucursal_id: ''
  })
  
  const { 
    vencimiento, 
    servicio: { perfil_internet: { nombre_plan, descarga_Mbps, subida_Mbps, impuesto }, 
    factura_id: { tipo_comprobante }, precio } 
  } = pagos.value[0];

  const arrayLastPay = vencimiento.split('/');
  const lastPay = `${ arrayLastPay[2] }-${ arrayLastPay[1] }-${ arrayLastPay[0] }`;

  formFactura.value.fechaVencimiento = date.addToDate(lastPay, { months: 1, day: 1 })
  const caducidaPago = date.addToDate(lastPay, { months: 2, day: 1 })
  formFactura.value.fechaVencimiento = date.formatDate(formFactura.value.fechaVencimiento, 'YYYY/MM/DD');
  formFactura.value.fecha = date.formatDate(Date.now(), 'YYYY/MM/DD');

  const plantilla = `
Servicio de Internet Banda ancha
facturación del ${ date.formatDate(formFactura.value.fechaVencimiento, 'DD/MM/YYYY') } al ${ date.formatDate(caducidaPago, 'DD/MM/YYYY') }
Fecha de Suspensión : ${ date.formatDate(formFactura.value.fechaVencimiento, 'DD/MM/YYYY') }
Plan de Internet : ${ nombre_plan }
Descarga : ${ descarga_Mbps } Mbps
Subida : ${ subida_Mbps } Mbps`;

  rows.value.unshift({
    tipo: 'servicio',
    producto: plantilla,
    cantidad: 1,
    iva: impuesto,
    descuento: 0.00,
    precio,
    v_total: parseFloat( precio ) - (impuesto * parseFloat( precio ) / 100)
  });

  const valorFactura = computed(() => {
    let subtotal = 0, iva = 0, descuento = 0, total = 0;

    rows.value.forEach( row => {
      if ( row.descuento > 0 )
        descuento += (parseFloat(row.v_total) * parseFloat(row.descuento)) / 100;

      if ( row.iva )
        iva += (parseFloat( row.v_total ) - (parseFloat(row.v_total) * parseFloat(row.descuento)) / 100) * (parseInt( row.iva ) / 100); 
      
      subtotal += parseFloat(row.v_total)
    })

    total = ( subtotal + iva ) - descuento;

    return {
      subtotal:   parseFloat((Math.floor( subtotal * 100 ) / 100).toString()),
      iva:        parseFloat((Math.floor( iva * 100 ) / 100).toString()),
      descuento:  parseFloat((Math.floor( descuento * 100) / 100).toString()),
      total:      parseFloat((Math.floor( total * 100) / 100).toString())
    }
  });

  const getSucursales = async( company_id ) => {
    sucursales.value = [];
    
    const { data } = await api.get(`/sucursal/find/${ company_id }/company`);

    data.forEach( (x, index) => {
      sucursales.value.push({ label: x.nombre, value: x.id })

      if ( ( index + 1 ) == data.length ) 
        if ( sucursales.value.length > 0 ) 
          formFactura.value.sucursal_id = sucursales.value[0].value;
    })  
  }

  if ( claim.roles[0] == 'Super-Administrador' || claim.roles[0] == 'Administrador' )
    getSucursales( claim.company.id );
  else
    formFactura.value.sucursal_id = claim.sucursales[0]

  const onSubmit = async () => {
    Dialog.create({
      title: '¿Deseas agregar esta factura?',
      ok: { push: true, color: 'cyan-10', label: 'Agregar' },
      cancel: { push: true, color: 'blue-grey-6', label: 'Cancelar' }
    }).onOk(async () => {
      try {
        let headers = { headers: { sucursal_id: formFactura.value.sucursal_id } };
  
        loading.value = true;
  
        const pago = {
          estadoSRI: 'PAGADO',
          pagos: [{
            detalle: '',
            fecha_abono: date.formatDate(formFactura.value.fecha, 'DD/MM/YYYY'),
            forma_pago: 'Efectivo',
            hora_abono: date.formatDate(Date.now(), 'HH:mma'),
            monto_pendiente: '0',
            n_transaccion: '',
            totalAbonado: `${valorFactura.value.total}`,
            valor: `${valorFactura.value.total}`
          }]
        }
  
        const { data } = await api.post('/pagos/create', {
          servicio: pagos.value[0].servicio.id, 
          ...pago,
          dia_pago: date.formatDate(formFactura.value.fechaVencimiento, 'YYYY-MM-DD')  
        }, headers);
  
        if ( tipo_comprobante != 'Recibo' ) {    
          
          let products = [];
          rows.value.forEach( (row, index) => {
            products.push({
              aplicaIva: row.iva > 0 ? true : false,
              cantidad: row.cantidad,
              pvp: row.v_total,
              descuento: row.descuento,
              nombre: row.tipo == 'servicio' ? 'SERVICIO DE INTERNET' : row.producto,
              codigoBarra: data.id.split('-')[0] + `${ index }`
            })
          })
          
          let datosFactura = {
            customer_id: route.params.client_id,
            tipo: 'EMISION',
            subtotal:   valorFactura.value.subtotal,
            iva:        valorFactura.value.iva,
            descuento:  valorFactura.value.descuento,
            total:      valorFactura.value.total,
            entity: 'Pagos',
            pago_id: data.id,
            user_id: claim.id,
            products
          }
          await api.post('/CE/facturas/generarFacturaElectronica', datosFactura, headers);
        }
  
        loading.value = false;
        showModalNuevaFactura.value = false;
        mostrarNotify( 'positive', "Factura Generado" );
        emit('actualizarDatos')
      } catch (error) {
        mostrarNotify( 'negative', "Algo salio mal" );
        console.log( error );
      }
    })
}

</script>

<template>
  <q-card style="width: 1000px; max-width: 80vw;">
    <q-card-section>
      <div class="text-h6 text-center">
        Nueva Factura Servicio
        <q-btn round flat dense icon="close" class="float-right" color="grey-8" v-close-popup></q-btn>
      </div>
    </q-card-section>

    <q-separator inset></q-separator>

    <q-card-section class="q-pt-none">
      <q-form @submit.prevent="onSubmit">
          <div class="row q-col-gutter-lg q-mt-md justify-center">

            <div class="col-xs-12 col-md-9">
              <div class="row q-col-gutter-lg">

                <div class="col-xs-12 col-sm-6 q-pt-sm">
                  <label class="q-mr-md row items-center">Vencimiento:</label>
    
                  <q-input dense filled v-model="formFactura.fechaVencimiento" mask="date" :rules="['date']">
                    <template v-slot:append>
                      <q-icon name="event" class="cursor-pointer">
                        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                          <q-date v-model="formFactura.fechaVencimiento">
                            <div class="row items-center justify-end">
                              <q-btn v-close-popup label="Close" color="primary" flat />
                            </div>
                          </q-date>
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                </div>
    
                <div class="col-xs-12 col-sm-6 q-pt-sm">
                  <label class="q-mr-md row items-center">Fecha:</label>
                  <q-input dense filled v-model="formFactura.fecha" mask="date" :rules="['date']" hint="ejfiojwef"
                  hide-hint>
                    <template v-slot:append>
                      <q-icon name="event" class="cursor-pointer">
                        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                          <q-date v-model="formFactura.fecha">
                            <div class="row items-center justify-end">
                              <q-btn v-close-popup label="Close" color="primary" flat />
                            </div>
                          </q-date>
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                </div>

              </div>
            </div>

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

                <template v-slot:body-cell-producto="props">
                  <q-td :props="props">
                    <pre class="q-my-none">
                      {{ props.row.producto }}
                    </pre>
                  </q-td>
                </template>

                <template v-slot:body-cell-cantidad="props">
                  <q-td :props="props">
                    <q-input input-class="resaltarTextoInput" dense required 
                      :readonly="props.row.tipo == 'servicio'" min="0" :max="props.row.stock"
                      type="number" style="width: 100px;" v-model.trim="props.row.cantidad" />
                  </q-td>
                </template>

                <template v-slot:body-cell-descuento="props">
                  <q-td :props="props">
                    <q-input input-class="resaltarTextoInput" dense required min="0" max="100"
                       type="number" style="width: 100px;" v-model="props.row.descuento" />
                  </q-td>
                </template>

                <template v-slot:body-cell-iva="props">
                  <q-td :props="props">
                    <q-input input-class="resaltarTextoInput" dense required 
                      min="0" max="100" type="number" style="width: 100px;" 
                      v-model.trim="props.row.iva" />
                  </q-td>
                </template>        

                <template v-slot:body-cell-v_total="props">
                  <q-td :props="props">
                    ${{ props.row.v_total}}
                  </q-td>
                </template>        

                <template v-slot:body-cell-acciones="props">
                  <q-td :props="props">
                    <q-btn round color="deep-orange"
                    :disable="props.row.tipo == 'servicio'"
                    @click="quitarArticulo(props.row.id)"
                    icon="close" size="8px" />
                  </q-td>
                </template>  
              </q-table>    
            </div>
            <div v-if="claim.roles[0] == 'Super-Administrador' || claim.roles[0] == 'Administrador'"
              class="col-xs-12 col-sm-5 q-mt-sm">
              <label>Sucursal a Facturar:</label>
              <q-select v-if="sucursales.length > 1"
                v-model="formFactura.sucursal_id" outlined
                :options="sucursales" emit-value map-options dense>

                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      No se encontro sucursales
                    </q-item-section>
                  </q-item>
                </template>

              </q-select>
            </div>
            <div class="col-xs-12 col-sm-7" style="display: flex;justify-content: end;">
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
                  <td><b>IVA(12%):</b></td>
                  <td style="width: 50px;" class="text-subtitle1 text-weight-regular">
                    ${{ valorFactura.iva }}
                  </td>
                </tr>
                <tr class="text-right">
                  <td><b>TOTAL:</b></td>
                  <td style="width: 50px;">
                    <q-badge outline class="text-subtitle1 text-weight-bold"
                        color="secondary" :label="`$${ valorFactura.total }`" />
                  </td>
                </tr>
              </table>
            </div>

            <div class="col-xs-9 col-sm-12 q-pt-none q-mb-md flex justify-center">
              <q-btn type="submit" icon="save" :loading="loading"
                outline rounded class="q-mr-lg" style="color: #696cff">
                &nbsp; Crear Factura
              </q-btn>
            </div>
          </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>