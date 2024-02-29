import { ref, watch } from "vue";
import useHelpers from "../../../../composables/useHelpers.js";
import { useCliente } from "./useCliente.js";
import { date } from 'quasar'

const mes_pago = ref({
  dia_pago: '',
  dia_vencimiento: '',
  meses_vencidos: 0,
  estado: ''
});

let dia_pago = ref('');
let dia_corte = ref('');
let dia_crear_factura = ref('');

const { formFacturacion } = useCliente()
const servicios       = ref([]);
const factura         = ref();
const dia_vencimiento = ref('');
const showModalPago   = ref( false );
const showModalNuevaFactura   = ref( false );
const pagos           = ref([]);
const client_name     = ref('');

export const useEditCliente = () => {

  const { api, claim, route, mostrarNotify } = useHelpers();

   //----------------------------- RESUMEN DE LOS PAGOS --------------------------
    watch( mes_pago.value, ( x ) => {
      if( x.estado == 'pagado' ){
        let siguiente_pago = date.addToDate(x.dia_vencimiento, { months: 1 })
        dia_pago.value = date.formatDate(siguiente_pago, 'DD/MM/YYYY')
      }else{
        dia_pago.value = date.formatDate(x.dia_vencimiento, 'DD/MM/YYYY')
      }
    
      if ( formFacturacion.value.aplicar_corte.trim() !== 'Desactivado' ) {
        const meses_corte = parseInt(formFacturacion.value.aplicar_corte.split(' ')[0] ) - x.meses_vencidos;
      
        dia_corte.value = date.addToDate(x.dia_vencimiento, { months: meses_corte })
        dia_corte.value = date.formatDate(dia_corte.value, 'DD/MM/YYYY');
    
        if (new Date(dia_pago.value) >= new Date(dia_corte.value)) dia_corte.value = 'Suspendido'
        
      }else
          dia_corte.value = 'Desactivado' ;
    
      const arrayFechaPago = x.dia_pago.split('-');
      dia_crear_factura.value = date.addToDate(`${arrayFechaPago[0]}-${ arrayFechaPago[1] }-02`, { months: 1 });
    })
   //-------------------------------------------------------------------------------

  return {
    api,
    client_name,
    claim,
    dia_pago,
    dia_corte,
    dia_crear_factura,
    dia_vencimiento,
    mes_pago,
    servicios,
    showModalPago,
    showModalNuevaFactura,
    mostrarNotify,
    factura,
    pagos,
    route
  }
}
