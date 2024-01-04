import { api } from "boot/axios";
import { ref } from "vue"
import useHelpers from "../../../../../composables/useHelpers";

const loading  = ref( false );  
const listRouter = ref([])
const formRed = ref({
  id: '',
  nombre: '',
  router_id: '',
  red: '',
  cidr: '',
  tipo_uso: 'Estatico'
})

const validaciones = ref({
  nombre:     { message: '', isValid: true },
  router_id:  { message: '', isValid: true },
  red:        { message: '', isValid: true },
  cidr:       { message: '', isValid: true }
})

export const useRedIpv4 = ( edit ) => {
  
    const { mostrarNotify, claim, router, route } = useHelpers();
    const camposRequeridos = ['nombre', 'router_id', 'cidr' ]
    
    const cargarRouter = async () => {
      listRouter.value = []
      const { data } = await api.get(`/router/find/${ claim.company.id }`);
    
      data.forEach(router => {
        listRouter.value.push({ label: router.nombre, value: router.id })
      });
    }
    const limpiarFormulario = () => {
      formRed.value = {
        id: '',
        nombre: '',
        router_id: '',
        red: '',
        cidr: '',
        tipo_uso: 'Estatico'
      }
    }

    const quitarErrores = () => {
      camposRequeridos.push('red')
      camposRequeridos.forEach( campo => { validaciones.value[campo].isValid = true; })
    }

    const validarCampos = () => {
      let existError = false;  

      camposRequeridos.forEach( campo => {
        if ( formRed.value[campo].length == 0 || formRed.value[campo] == 0) {
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

        if ( !edit )
          await api.post('/red-ipv4', formRed.value)
        else
          await api.patch(`/red-ipv4/${ formRed.value.id }`, formRed.value)
        
        mostrarNotify( 'positive', `Router ${ edit ? 'editado' : 'agregado' } exitosamente`);
        loading.value = false;
        router.push({ name: 'redesIpv4.index' });
      } catch (error) {
        loading.value = false;
        mostrarNotify( 'warning', error.response.data.message )
      }
    }

    return {
      api,
      claim,
      cargarRouter,
      formRed,
      loading,
      listRouter,
      limpiarFormulario,
      validaciones,
      quitarErrores,
      route,
      onSubmit
    }
}
