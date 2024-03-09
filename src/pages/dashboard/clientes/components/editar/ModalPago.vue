<script setup>
  import { ref } from 'vue';
  import { date } from 'quasar'
  import { useCliente } from "../../composables/useCliente";
  import { useEditCliente } from "../../composables/useEditCliente";

  const camposRequeridos = ['forma_pago', 'montoPendiente', 'montoCancelar'];
  const props = defineProps(['servicio', 'nuevoPago']);
  const emit = defineEmits(['actualizarDatos']);

  const { api, claim, mostrarNotify, route } = useCliente()
  const { showModalPago } = useEditCliente()
  const sucursales = ref([]);
  const loading = ref(false);

  const formPago = ref({
    forma_pago: '',
    n_transaccion: '',
    importe_total: true,
    sucursal_id: '',
    montoCancelar: '',
    montoPendiente: '',
    detalle: ''
  })
  const validaciones = ref({
    forma_pago:     { message: '', isValid: true },
    montoPendiente: { message: '', isValid: true },
    montoCancelar:  { message: '', isValid: true },
    sucursal_id:    { message: '', isValid: true },
  })

  if ( props.nuevoPago ) {
    if ( props.servicio.pagos.length == 0 ) {
      formPago.value.montoPendiente = props.servicio.precio
      formPago.value.montoCancelar  = props.servicio.precio
    }else{
      let totalPagado = 0;
      props.servicio.pagos.forEach( pago => { totalPagado += parseFloat(pago.valor) });
  
      const resultado = parseFloat(props.servicio.precio) - totalPagado
  
      formPago.value.montoPendiente = resultado.toString();
      formPago.value.montoCancelar  = resultado.toString();
    }    
  }else{
    formPago.value = { 
      ...props.servicio.pago, 
      montoCancelar: parseFloat(props.servicio.pago.valor).toFixed(2) 
    }
  }

  const validDecimal = ( campo ) => {
    let currentValue = 0;
    currentValue = formPago.value[campo];    
    
    const regex = /^\d{0,9}(\.\d{1,2})?$/
    
    setTimeout(function(){
      let newValue = 0
      
      newValue = formPago.value[campo]
      
      if(!regex.test(newValue.toString())){
        const result = parseFloat(currentValue.toString().substring(0, currentValue.toString().length - 1));      
        formPago.value[campo] = result
      }
    }, 0); 
  }

  const validarDatos = () => {
    let existError = false;  

    if ( props.nuevoPago ) {
      camposRequeridos.forEach( campo => {
        if ( formPago.value[campo].length == 0 || formPago.value[campo] == 0) {
          validaciones.value[campo].message = 'Debes completar este campo'
          validaciones.value[campo].isValid = false;
          existError = true;
        }
      })
  
      if ( (claim.roles[0] == 'SUPER-ADMINISTRADOR' || claim.roles[0] == 'ADMINISTRADOR') 
            && formPago.value.sucursal_id == '' && props.servicio.tipo_comprobante != 'Recibo' &&
            parseFloat(formPago.value.montoCancelar) >= parseFloat(formPago.value.montoPendiente)) {
        validaciones.value['sucursal_id'].message = 'Debes seleccionar una sucursal'
        validaciones.value['sucursal_id'].isValid = false;
        existError = true;
      }      
    }

    return existError;
  }
  
  const formas_pago = ['Efectivo Oficina/Sucursal', 'Depósito Bancario', 'Transferencia Bancaria', 'Facilito', 'Punto Agil']
  
  const onSubmit = async () => {

    if ( validarDatos() ) return;
    
    const timeStamp = Date.now()
    const formattedString = date.formatDate(timeStamp, 'DD/MM/YYYY')
    const timeString = date.formatDate(timeStamp, 'HH:mma')
    const monto_pendiente = parseFloat(formPago.value.montoPendiente) - parseFloat(formPago.value.montoCancelar);

    let totalAbonado = 0;
    if ( props.nuevoPago ) 
      props.servicio.pagos.forEach( pago => {
        totalAbonado += parseFloat(pago.valor);
      })

    let listPagos;
    if ( props.nuevoPago ) {
      listPagos = props.servicio.pagos;
      listPagos.unshift({
        valor: formPago.value.montoCancelar,
        monto_pendiente: monto_pendiente.toString(),
        totalAbonado: (totalAbonado + parseFloat(formPago.value.montoCancelar)).toString(),
        fecha_abono: formattedString,
        hora_abono: timeString,
        detalle: formPago.value.detalle,
        n_transaccion: formPago.value.n_transaccion,
        forma_pago: formPago.value.forma_pago
      })
    }else{
      const index = props.servicio.pagos.pagos.findIndex( pago => 
      props.servicio.pago.hora_abono == pago.hora_abono && props.servicio.pago.valor == pago.valor);

      props.servicio.pagos.pagos[ index ] = { ...formPago.value }
    }

    let pago;
    let pago_id;
    if ( props.nuevoPago ){
      pago = { pagos: listPagos, estadoSRI: (monto_pendiente <= 0 ? 'PAGADO' : 'PENDIENTE') }      
      pago_id = props.servicio.pago_id
    }else{
      pago = { pagos: props.servicio.pagos.pagos }      
      pago_id = props.servicio.pagos.pago_id
    }

    try {
      let headers = { headers: { sucursal_id: formPago.value.sucursal_id } };

      loading.value = true;

      const { data } = await api.patch(`/pagos/${ pago_id }`, pago, headers);
      
      if ( monto_pendiente <= 0 && props.servicio.tipo_comprobante != 'Recibo' && props.nuevoPago) {
        
        let datosFactura = {
          customer_id: route.params.client_id,
          tipo: 'EMISION',
          subtotal:   parseFloat( props.servicio.precio ),
          iva:        parseFloat( props.servicio.iva ),
          descuento:  0.00,
          total:      parseFloat( props.servicio.precio ),
          entity: 'Pagos',
          pago_id: props.servicio.pago_id,
          user_id: claim.id,
          products: [{
            aplicaIva: props.servicio.iva > 0 ? true : false,
            cantidad: 1,
            pvp: props.servicio.precio,
            descuento: 0,
            nombre: 'SERVICIO DE INTERNET',
            codigoBarra: props.servicio.pago_id.split('-')[0]
          }]
        }
        await api.post('/CE/facturas/generarFacturaElectronica', datosFactura, headers);
      }

      loading.value = false;
      mostrarNotify( 'positive', data.msg );
      showModalPago.value = false;
      emit('actualizarDatos')
    } catch (error) {
      console.log( error );
    }
  }

  const getSucursales = async( company_id ) => {
    sucursales.value = [];
    
    const { data } = await api.get(`/sucursal/find/${ company_id }/company`);

    data.forEach( x => {
      sucursales.value.push({ label: x.nombre, value: x.id })
    })  

    if ( sucursales.value.length == 1 ) 
      formPago.value.sucursal_id = sucursales.value[0].value;
  }

  if ( claim.roles[0] == 'SUPER-ADMINISTRADOR' || claim.roles[0] == 'ADMINISTRADOR' )
    getSucursales( claim.company.id );

</script>

<template>
  <q-card style="width: 450px !important;max-width: fit-content">
    <q-card-section>
      <div class="text-h6 text-center">
        {{ props.nuevoPago ? 'Agregar Pago:' : 'Editar Pago' }}
        <q-btn round flat dense icon="close" class="float-right" color="grey-8" v-close-popup></q-btn>
      </div>
    </q-card-section>

    <q-separator inset></q-separator>

    <q-card-section class="q-pt-none">
      <q-form @submit="onSubmit">
        <div class="row q-pt-lg q-gutter-lg justify-center">

          <div class="col-12">
            <label>Forma de pago:</label>
            <q-select color="orange" 
              transition-show="scale" transition-hide="scale" 
              @update:model-value="validaciones.forma_pago.isValid = true"
              :error="!validaciones.forma_pago.isValid" 
              outlined v-model="formPago.forma_pago" dense 
              :options="formas_pago">
              <template v-slot:error>
                <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                  {{ validaciones.forma_pago.message }}
                </label>
              </template>
            </q-select>
          </div>

          <div class="col-12 q-mt-sm">
            <label>Nº transacción:</label>
            <q-input v-model="formPago.n_transaccion" dense outlined />
          </div>

          <div v-if="props.nuevoPago"
            class="col-12 q-mt-sm">
            <label>Pagar Importe Total:</label>
            <q-toggle color="green" 
              @update:model-value="formPago.montoCancelar = formPago.montoPendiente"
              size="lg" v-model="formPago.importe_total"/>
          </div>

          <div class="col-12 q-mt-sm">
            <label>
              {{ props.nuevoPago ? 'Monto a Cancelar:' : 'Monto Cancelado' }}
            </label>
            <q-input v-model.trim="formPago.montoCancelar"
              :readonly="formPago.importe_total || !props.nuevoPago"
              input-style="padding-right: 27px;"   
              type="number" step="0.01"  
              :error="!validaciones.montoCancelar.isValid"    
              @update:model-value="validDecimal('montoCancelar'), validaciones.montoCancelar.isValid = true" 
              input-class="resaltarTextoInput" dense outlined>
                <template v-slot:error>
                  <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                    {{ validaciones.montoCancelar.message }}
                  </label>
                </template>
                
                <template v-slot:prepend>
                  <q-icon name="attach_money" />
                </template>
              </q-input>
          </div>

          <div v-if="props.nuevoPago"
            class="col-12 q-mt-sm">
            <label>Monto Pendiente:</label>
            <q-input v-model.trim="formPago.montoPendiente"
              disable
              type="number" step="0.01"  
              :error="!validaciones.montoPendiente.isValid"    
              @update:model-value="validDecimal('montoPendiente'), validaciones.montoPendiente.isValid = true" 
              input-style="padding-right: 27px;"         
              input-class="resaltarTextoInput" dense outlined>
                <template v-slot:error>
                  <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                    {{ validaciones.montoCancelar.message }}
                  </label>
                </template>
                <template v-slot:prepend>
                  <q-icon name="attach_money" />
                </template>
              </q-input>
          </div>

          <div 
          v-if="props.servicio.tipo_comprobante != 'Recibo' && props.nuevoPago
             && parseFloat(formPago.montoCancelar) >= parseFloat(formPago.montoPendiente)"
            class="col-12 q-mt-sm">
            <label>Sucursal a Facturar:</label>
            <q-select v-if="sucursales.length > 1"
              v-model="formPago.sucursal_id"
              @update:model-value="validaciones.sucursal_id.isValid = true"
              :error="!validaciones.sucursal_id.isValid" outlined
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

          <div class="col-12 q-mt-none">
            <label>Notas:</label>
            <q-input v-model.trim="formPago.detalle"
              outlined rows="2" type="textarea" />
          </div>

          <div class="col-xs-9 col-sm-12 q-mt-lg q-mb-md flex justify-center">
            <q-btn type="submit" icon="save" :loading="loading"
            outline rounded class="q-mr-lg" style="color: #696cff">
            &nbsp; Guardar 
          </q-btn>
          </div>

        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>
<style scoped>
.append-logo{
  height: 100%;
  width: 19%;
  position: absolute;
  right: 0px;
  justify-content: center;
  font-size:14px; 
  cursor: pointer;
}
</style>
  