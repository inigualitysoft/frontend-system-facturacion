import { ref, onMounted, watch } from "vue"
import useHelpers from "../../../../composables/useHelpers";
import { api } from "boot/axios";
import { date, Dialog } from 'quasar'

const loading  = ref( false );  
const step  = ref(1)
const done1 = ref(false), done2 = ref(false), done3 = ref(false)

let listRouter = ref([]);
let listServicionsInternet = ref([]);

const listRedes = ref([]);
const listIps = ref([]);
const optionsListIps = ref([]);
const mes_pago = ref({
  dia_pago: '',
  estado: ''
});

let listCajasNap = ref([]);
let listPuertosCajaNap = ref([]);

const formCliente = ref({
  nombres: '',
  tipo_documento: '',
  numero_documento: '',
  email: '',
  celular: '',
  direccion: ''
});

const formFacturacion = ref({
  tipo: '',
  dia_pago: '',
  tipo_impuesto: '',
  tipo_comprobante: '',
  dia_gracia: '',
  aplicar_corte: '',
  recordatorio_pago: null
});

const formInternet = ref({
  router_id: '',
  direccion: '',
  coordenadas: '',
  perfil_internet: '',
  precio: 0.00,
  fecha_instalacion: date.formatDate(Date.now(), 'YYYY/MM/DD'),
  mac: '',
  red_id: '',
  ipv4: '',
  caja_id: '',
  puerto_id: ''
});

const validacionesInternet = ref({
  router_id:          { message: '', isValid: true }, 
  direccion:          { message: '', isValid: true }, 
  coordenadas:        { message: '', isValid: true }, 
  perfil_internet:    { message: '', isValid: true },
  precio:             { message: '', isValid: true },
  fecha_instalacion:  { message: '', isValid: true },
  mac:                { message: '', isValid: true },
  red_id:             { message: '', isValid: true },
  ipv4:               { message: '', isValid: true },
  caja_id:            { message: '', isValid: true },
  puerto_id:          { message: '', isValid: true }
});

const validacionesFacturacion = ref({
  tipo:               { message: '', isValid: true },
  dia_pago:           { message: '', isValid: true },
  tipo_impuesto:      { message: '', isValid: true },
  tipo_comprobante:   { message: '', isValid: true },
  dia_gracia:         { message: '', isValid: true },
  aplicar_corte:      { message: '', isValid: true },
  recordatorio_pago:  { message: '', isValid: true }
})
const validaciones = ref({
  nombres:          { message: '', isValid: true },
  tipo_documento:   { message: '', isValid: true },
  numero_documento: { message: '', isValid: true },
  email:            { message: '', isValid: true },
  celular:          { message: '', isValid: true },
  direccion:        { message: '', isValid: true },
  company_id:       { message: '', isValid: true }
})

export const useCliente = () => {

    const { claim, router, mostrarNotify, confirmDelete, isDeleted, route } = useHelpers();
    const camposRequeridos = ['nombres', 'tipo_documento', 'numero_documento', 'email', 'celular', 'direccion'];
    const camposReqFacturacion = ['tipo', 'dia_pago', 'tipo_impuesto', 'dia_gracia', 'aplicar_corte', 'tipo_comprobante'];
    const camposReqInternet = ['perfil_internet', 'precio', 'red_id', 'ipv4'];

    const limpiarFormulario = () => {
      formCliente.value = {
        nombres: '',
        tipo_documento: '',
        numero_documento: '',
        email: '',
        celular: '',
        direccion: ''
      }
      formFacturacion.value = {
        tipo: '',
        dia_pago: '',
        tipo_impuesto: '',
        tipo_comprobante: '',
        dia_gracia: '',
        aplicar_corte: '',
        recordatorio_pago: null
      }
      formInternet.value = {
        router_id: '',
        direccion: '',
        coordenadas: '',
        perfil_internet: '',
        precio: 0.00,
        fecha_instalacion: date.formatDate(Date.now(), 'YYYY/MM/DD'),
        mac: '',
        red_id: '',
        ipv4: '',
        caja_id: '',
        puerto_id: ''
      }
    }

    const quitarErrores = () => {
      camposRequeridos.forEach( campo => { validaciones.value[campo].isValid = true; })
      camposReqFacturacion.forEach( campo => { validacionesFacturacion.value[campo].isValid = true; })
      camposReqInternet.forEach( campo => { validacionesInternet.value[campo].isValid = true; })
    }

    const validDecimal = ( campo ) => {
      let currentValue = 0;
      currentValue = formInternet.value[campo];    
      
      const regex = /^\d{0,9}(\.\d{1,2})?$/
      
      setTimeout(function(){
        let newValue = 0
        
        newValue = formInternet.value[campo]
        
        if(!regex.test(newValue.toString())){
          const result = parseFloat(currentValue.toString().substring(0, currentValue.toString().length - 1));      
          formInternet.value[campo] = result
        }
      }, 0); 
      validacionesInternet.value.precio.isValid = true;
    }

    const validarDatosPersonales = () => {
      let existError = false;  
      var validEmail =  /^\w+([.-_+]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/;
      
      if( !validEmail.test(formCliente.value.email) ){
        validaciones.value.email.message = 'Ingresa un email valido'
        validaciones.value.email.isValid = false;
        existError = true;        
      }

      camposRequeridos.forEach( campo => {
        if ( formCliente.value[campo].length == 0 || formCliente.value[campo] == 0) {
          validaciones.value[campo].message = 'Debes completar este campo'
          validaciones.value[campo].isValid = false;
          existError = true;
        }
      })
      
      let lengthAllow;
      if (formCliente.value.tipo_documento === '04') lengthAllow = 13;
      if (formCliente.value.tipo_documento === '05') lengthAllow = 10;
      if (formCliente.value.tipo_documento === '06') lengthAllow = 10;

      if( validaciones.value.numero_documento.isValid && formCliente.value.numero_documento.length != lengthAllow ){
        validaciones.value.numero_documento.message = `Debes completar ${ lengthAllow } digitos`
        validaciones.value.numero_documento.isValid = false
        existError = true;        
      }

      if( !existError) {
        done1.value = true; step.value = 2
      }
      return existError
    }

    const validarFormFact = () => {
      let existError = false;  

      camposReqFacturacion.forEach( campo => {
        if ( formFacturacion.value[campo].length == 0 || formFacturacion.value[campo] == 0) {
          validacionesFacturacion.value[campo].message = 'Debes completar este campo'
          validacionesFacturacion.value[campo].isValid = false;
          existError = true;
        }
      })
      
      if ( formFacturacion.value.recordatorio_pago == null || formFacturacion.value.recordatorio_pago.length == 0) {
        validacionesFacturacion.value.recordatorio_pago.message = 'Debes elegir al menos una opción'
        validacionesFacturacion.value.recordatorio_pago.isValid = false;
        existError = true;
      }

      if( !existError) {
        done2.value = true; step.value = 3
      }
      return existError;
    }

    const validarFormInternet = () => {
      let existError = false;  

      if (formInternet.value.router_id.length == 0) {
        validacionesInternet.value.router_id.message = 'Debes elegir un router'
        validacionesInternet.value.router_id.isValid = false;
        existError = true;        
      }else{
        camposReqInternet.forEach( campo => {
          if ( formInternet.value[campo].length == 0 || formInternet.value[campo] == 0) {
            validacionesInternet.value[campo].message = 'Debes completar este campo'
            validacionesInternet.value[campo].isValid = false;
            existError = true;
          }
        })
        
        if ( formInternet.value.caja_id.length > 0 && formInternet.value.puerto_id.length == '' ) {
          validacionesInternet.value['puerto_id'].message = 'Elige una opción'
          validacionesInternet.value['puerto_id'].isValid = false;
          existError = true;          
        }
      }


      if( !existError) {
        done3.value = true;
      }

      return existError;
    }

    onMounted(() => {
      watch(formCliente.value, (currentValue, oldValue) => {  
        if ( currentValue.tipo_documento !== '' ) {
          if (currentValue.tipo_documento !== '04' && formCliente.value.numero_documento.length > 10) {
            const chacarterToDelete = currentValue.numero_documento.length - 10;
            const str2 = currentValue.numero_documento.substring(0, currentValue.numero_documento.length - chacarterToDelete);
            formCliente.value.numero_documento = str2
          }
        }
      });      
    })

    const onSubmit = async( edit ) => {

      if ( validarFormInternet() ) return

      Dialog.create({
        title: '¿Deseas agregar este cliente?',
        ok: { push: true, color: 'cyan-10', label: 'Guardar' },
        cancel: { push: true, color: 'blue-grey-6', label: 'Cancelar' }
      }).onOk(async () => {
        try {
          loading.value = true;
          if ( !edit ){
            if ( formInternet.value.red_id.includes('|') ) 
              formInternet.value.red_id = formInternet.value.red_id.split('|')[0]
            
            await api.post('/customers', {
              cliente:      formCliente.value,
              facturacion:  formFacturacion.value,
              servicio:     formInternet.value
            })
          } 
          else
            await api.patch('/customers/' + formCliente.value.id, formCliente.value)
          
          mostrarNotify( 'positive', `Cliente ${ edit ? 'editado' : 'agregado' } exitosamente`);
  
          loading.value = false;
          router.push({ name: 'cliente.index' });
        } catch (error) {
          mostrarNotify( 'warning', error.response.data.message )
          loading.value = false;
        }        
      })

    }

    const groupedIpsByRed = ( ips ) => {
      const groupedIps = {};
  
      ips.forEach(ip => {
        // Extraer la parte de la red de la IP
        const network = ip.substring(0, ip.lastIndexOf('.'));
  
        // Verificar si ya existe una entrada para esa red en el objeto groupedIps
        if (!groupedIps.hasOwnProperty(network)) {
          groupedIps[network] = [];
        }
  
        // Agregar la IP a la red correspondiente
        groupedIps[network].push(ip);
      });
  
      return groupedIps;
    }

    const obtenerListaSubred = (ipSubred) => {
      // Parsear la dirección IP y la máscara de subred
      const [ip, mascara] = ipSubred.split('/');
      const ipNumerica = ip.split('.').map(Number);
      const mascaraNumerica = parseInt(mascara, 10);
  
      // Obtener la máscara en formato binario
      const mascaraBinaria = '1'.repeat(mascaraNumerica) + '0'.repeat(32 - mascaraNumerica);
  
      // Convertir la máscara binaria a una serie de cuatro octetos
      const octetosMascara = [];
      for (let i = 0; i < 4; i++) {
        octetosMascara.push(parseInt(mascaraBinaria.substr(i * 8, 8), 2));
      }
  
      // Obtener la dirección de red aplicando la máscara a cada octeto de la IP
      const red = ipNumerica.map((octeto, index) => octeto & octetosMascara[index]).join('.');
  
      // Obtener la lista de subredes
      const subredes = [];
      for (let i = 0; i < Math.pow(2, 32 - mascaraNumerica); i++) {
        const ipSubredActual = red.split('.').map((octeto, index) => parseInt(octeto, 10) + Math.floor(i / Math.pow(2, (3 - index) * 8)) % 256).join('.');
        
        if (ipSubredActual.split('.').every(octeto => parseInt(octeto, 10) <= 255)) {
          subredes.push(ipSubredActual);
        }
      }
  
      return subredes;
    }

    return {
      api,
      claim,
      mes_pago,
      formCliente,
      formFacturacion,
      loading,
      limpiarFormulario,
      groupedIpsByRed,
      obtenerListaSubred,
      listRedes,
      listRouter,
      listServicionsInternet,
      listCajasNap,
      listPuertosCajaNap,
      validaciones,
      validacionesFacturacion,
      validarDatosPersonales,
      validarFormFact,
      validarFormInternet,
      validacionesInternet,
      validDecimal,
      mostrarNotify, 
      quitarErrores,
      confirmDelete, 
      optionsListIps,
      listIps,
      route,
      step,
      done1,
      done2,
      done3,
      formInternet,
      isDeleted,
      onSubmit
    }
}
