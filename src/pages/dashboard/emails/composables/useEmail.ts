import { ref } from 'vue'
import { api } from "boot/axios";
import useHelpers from "../../../../composables/useHelpers";

const formEmail = ref({
  id: '',
  host: '',
  usuario: '',
  puerto: 0,
  password: '',
  email_client: '',
  seguridad: '',
  empresa: '',
  company_id: null
});

const loading = ref( false );   
const loadingTesting    = ref( false );
const isPwd             = ref( true );
const prompt            = ref(false);

export const useEmail = () => {

  const { mostrarNotify } = useHelpers();

  const limpiarFormulario = () => {
    formEmail.value = { 
      id: '',
      host: '',
      usuario: '',
      puerto: 0,
      password: '',
      email_client: '',
      seguridad: '',
      empresa: '',
      company_id: null
    }
  }

  const onSubmit = async ( ) => {
    try {
      loading.value = true;

      const { id, company_id, empresa, puerto: p, ...rest } = formEmail.value

      const { data } = await api.patch(`/email/${ id }`, { 
        ...rest, 
        company_id: empresa, 
        puerto: p
      });

      mostrarNotify( 'positive', data.msg );
      loading.value = false;

      loading.value = false;
    } catch (error: any) {
      loading.value = false;
      mostrarNotify( 'warning', error.response.data.message )
    }
  }

  return {
    api,
    formEmail,
    limpiarFormulario,
    loading,
    onSubmit,
    loadingTesting,
    isPwd,
    prompt
  }
}