import { api } from "boot/axios";
import { ref } from "vue"
import useHelpers from "../../../../../composables/useHelpers";

const loading  = ref( false );  
const showPass  = ref( true );  
const listCompanies = ref([]);
const formRouter = ref({
  id: '',
  nombre: '',
  user_api: '',
  tipo_router: '',
  password_api: '',
  ubicacion: '',
  registro_trafico: '',
  ip_host: '',
  puerto_api: '',
  control_velocidad: '',
  seguridad: '',
  seguridad_alterna: '',
  company_id: ''
})

const validaciones = ref({
  nombre:             { message: '', isValid: true },
  user_api:           { message: '', isValid: true },
  tipo_router:        { message: '', isValid: true },
  password_api:       { message: '', isValid: true },
  ubicacion:          { message: '', isValid: true },
  registro_trafico:   { message: '', isValid: true },
  ip_host:            { message: '', isValid: true },
  puerto_api:         { message: '', isValid: true },
  control_velocidad:  { message: '', isValid: true },
  seguridad:          { message: '', isValid: true },
  seguridad_alterna:  { message: '', isValid: true },
  company_id:         { message: '', isValid: true }
})

const cargarCompanies = async () => {
  listCompanies.value = [];
  
  const { data } = await api.get('/companies/true');
  
  data.forEach(company => {
    listCompanies.value.push({
      label:  company.nombre_comercial,
      value:  company.id
    })
  });
}

export const useRouter = ( edit ) => {

    const { mostrarNotify, claim, router, route } = useHelpers();
    const camposRequeridos = ['nombre', 'user_api', 'tipo_router', 'password_api', 'ubicacion', 'registro_trafico', 'control_velocidad', 'seguridad', 'seguridad_alterna', 'ip_host', 'puerto_api']

    const limpiarFormulario = () => {
      formRouter.value = {
        id: '',
        nombre: '',
        user_api: '',
        tipo_router: '',
        password_api: '',
        ubicacion: '',
        registro_trafico: '',
        ip_host: '',
        control_velocidad: '',
        puerto_api: '',
        seguridad: '',
        seguridad_alterna: '',
        company_id: ''
      }
    }

    const quitarErrores = () => {
      camposRequeridos.push('ip_host', 'company_id')
      camposRequeridos.forEach( campo => { validaciones.value[campo].isValid = true; })
    }

    const validarCampos = () => {
      let existError = false;  
      // Patrón de expresión regular para validar una dirección IP
      const patronIP = /^([0-9]{1,3}\.){3}[0-9]{1,3}$/;
      const ip = formRouter.value.ip_host;

      if (patronIP.test( ip )) {
        // Dividir la IP en sus partes numéricas
        const partes = ip.split('.');

        // Verificar que cada parte esté en el rango correcto (0-255)
        if (partes.every(part => parseInt(part, 10) >= 0 && parseInt(part, 10) <= 255)) {
          validaciones.value['ip_host'].isValid = true;
          existError = false;
        }else{
          validaciones.value['ip_host'].message = 'la ip no es valida'
          validaciones.value['ip_host'].isValid = false;
          existError = true;
        }
      }

      camposRequeridos.forEach( campo => {
        if ( formRouter.value[campo].length == 0 ) {
          validaciones.value[campo].message = 'Debes completar este campo'
          validaciones.value[campo].isValid = false;
          existError = true;
        }
      });

      if ( !edit && formRouter.value.company_id.length == 0 && claim.roles[0] == 'Super-Administrador') {
        validaciones.value.company_id.message = 'Debes elegir una empresa'
        validaciones.value.company_id.isValid = false;
        existError = true;
      }

      return existError;
    }

    const onSubmit = async( edit ) => {

      if ( validarCampos() ) return;

      try {
        loading.value = true;

        let headers = { headers: { 
          company_id: formRouter.value.company_id, 
          NotSetHeaderCompany: claim.roles[0] == 'Super-Administrador' ? true : false
        }};

        let response;
        if ( !edit ){
          response = await api.post('/router', formRouter.value, headers)
        }else{
          response = await api.patch('/router/' + formRouter.value.id, formRouter.value)
        }
        
        mostrarNotify( 'positive', `Router ${ edit ? 'editado' : 'agregado' } exitosamente`);
        loading.value = false;

        router.push({ name: 'index.routers' });
      } catch (error) {
        loading.value = false;
        mostrarNotify( 'warning', error.response.data.message )
      }
    }

    return {
      api,
      claim,
      formRouter,
      loading,
      limpiarFormulario,
      listCompanies,
      showPass,
      validaciones,
      cargarCompanies,
      quitarErrores,
      route,
      onSubmit
    }
}
