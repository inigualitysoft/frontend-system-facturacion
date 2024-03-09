import { api } from "boot/axios";
import { ref } from "vue"
import useHelpers from "../../../../../composables/useHelpers";

const loading  = ref( false );  
const selectedRouter  = ref('');  
const listRouters = ref([]);
const formInternet = ref({
  id:             '',
  nombre_plan:    '',
  descripcion:    '',
  precio_plan:    0.00,
  impuesto:       0,
  descarga_Mbps:  0,
  subida_Mbps:    0,
  limit_at:       0,
  burst_limit:    0,
  prioridad:      '',
  address_list:   '',
  router_id:      ''
})

const validaciones = ref({
  nombre_plan:    { message: '', isValid: true },
  descripcion:    { message: '', isValid: true },
  precio_plan:    { message: '', isValid: true },
  impuesto:       { message: '', isValid: true },
  descarga_Mbps:  { message: '', isValid: true },
  subida_Mbps:    { message: '', isValid: true },
  limit_at:       { message: '', isValid: true },
  burst_limit:    { message: '', isValid: true },
  prioridad:      { message: '', isValid: true },
  address_list:   { message: '', isValid: true },
  router_id:      { message: '', isValid: true }
})

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
}

export const useInternet = ( edit ) => {
  
  const { mostrarNotify, claim, router, route } = useHelpers();
  const camposRequeridos = ['nombre_plan', 'precio_plan', 'descarga_Mbps', 'subida_Mbps', 'prioridad']
  
    const cargarRouters = async () => {
      listRouters.value = [];
      
      const { data } = await api.get(`/router/find/${ claim.company.id }`);
      
      data.forEach(route => {
        listRouters.value.push({
          label:  route.nombre,
          value:  route.id
        })
      });
      
      if( listRouters.value.length > 0 ){
        if ( !edit ) formInternet.value.router_id = listRouters.value[0].value;
        selectedRouter.value = listRouters.value[0].value;
      } 
    }

    const limpiarFormulario = () => {
      formInternet.value = {
        id: '',
        nombre_plan: '',
        descripcion: '',
        precio_plan: 0.00,
        impuesto: 0,
        descarga_Mbps: 0,
        subida_Mbps: 0,
        limit_at: 0,
        burst_limit: 0,
        prioridad: '',
        address_list: '',
        router_id: ''
      }
    }

    const quitarErrores = () => {
      camposRequeridos.push('router_id')
      camposRequeridos.forEach( campo => { validaciones.value[campo].isValid = true; })
    }

    const validarCampos = () => {
      let existError = false;  

      camposRequeridos.forEach( campo => {
        if ( formInternet.value[campo].length == 0 || formInternet.value[campo] == 0) {
          validaciones.value[campo].message = 'Debes completar este campo'
          validaciones.value[campo].isValid = false;
          existError = true;
        }
      })

      return existError;
    }

    const onSubmit = async( edit ) => {

      if ( validarCampos() ) return;

      try {
        loading.value = true;

        let headers = { headers: { 
          router_id: formInternet.value.router_id, 
          NotSetHeaderCompany: claim.roles[0] == 'SUPER-ADMINISTRADOR' ? true : false
        }};

        if ( !edit ){
          await api.post('/internet', formInternet.value, headers)
        }else{
          await api.patch(`/internet/${ formInternet.value.id }`, formInternet.value)
        }
        
        mostrarNotify( 'positive', `Router ${ edit ? 'editado' : 'agregado' } exitosamente`);
        loading.value = false;

        router.push({ name: 'internet.index' });
      } catch (error) {
        loading.value = false;
        mostrarNotify( 'warning', error.response.data.message )
      }
    }

    return {
      api,
      claim,
      formInternet,
      loading,
      limpiarFormulario,
      listRouters,
      validaciones,
      cargarRouters,
      quitarErrores,
      route,
      selectedRouter,
      validDecimal,
      onSubmit
    }
}
