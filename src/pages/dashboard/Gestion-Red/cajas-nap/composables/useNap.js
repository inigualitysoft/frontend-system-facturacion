import { api } from "boot/axios";
import { ref } from "vue"
import useHelpers from "../../../../../composables/useHelpers";

const loading  = ref( false );
const selectedRouter  = ref('');  
const listRouters = ref([]);  
const formNap = ref({
  id: '',
  nombre: '',
  coordenadas: '',
  ubicacion: '',
  puertos: '',
  detalles: '',
  router_id: ''
})

const validaciones = ref({
  nombre:       { message: '', isValid: true },
  coordenadas:  { message: '', isValid: true },
  ubicacion:    { message: '', isValid: true },
  puertos:      { message: '', isValid: true },
  detalles:     { message: '', isValid: true },
  router_id:   { message: '', isValid: true }
})

export const useNap = ( edit ) => {

    const { mostrarNotify, claim, router, route } = useHelpers();
    const camposRequeridos = ['nombre', 'coordenadas', 'ubicacion', 'puertos', 'router_id']

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
        if ( !edit ) formNap.value.router_id = listRouters.value[0].value;
        selectedRouter.value = listRouters.value[0].value;
      } 
    }

    const limpiarFormulario = () => {
      formNap.value = {
        id: '',
        nombre: '',
        coordenadas: '',
        ubicacion: '',
        puertos: '',
        detalles: '',
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
        if ( formNap.value[campo].length == 0 || formNap.value[campo] == 0) {
          validaciones.value[campo].message = 'Debes completar este campo'
          validaciones.value[campo].isValid = false;
          existError = true;
        }
      })

      return existError;
    }

    const timeout = (ms) => {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    const onSubmit = async( edit ) => {

      if ( validarCampos() ) return;

      try {
        loading.value = true;

        let headers = { headers: { 
          router_id: formNap.value.router_id, 
          NotSetHeaderCompany: claim.roles[0] == 'SUPER-ADMINISTRADOR' ? true : false
        }};

        if ( !edit ){
          await api.post('/caja-nap', formNap.value, headers)
        }else{
          await api.patch(`/caja-nap/${ formNap.value.id }`, formNap.value)
        }
        
        if ( edit ) await timeout(500);
        
        mostrarNotify( 'positive', `Router ${ edit ? 'editado' : 'agregado' } exitosamente`);
        loading.value = false;
        router.push({ name: 'cNap.index' });
      } catch (error) {
        loading.value = false;
        mostrarNotify( 'warning', error.response.data.message )
      }
    }

    return {
      api,
      claim,
      cargarRouters,
      formNap,
      listRouters,
      loading,
      limpiarFormulario,
      validaciones,
      quitarErrores,
      route,
      selectedRouter,
      onSubmit
    }
}
