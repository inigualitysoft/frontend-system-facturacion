import { ref, onMounted, watch } from "vue"
import useHelpers from "../../../../composables/useHelpers";
import { api } from "boot/axios";

export interface Cliente {
  id?:              string;
  nombres:          string;
  tipo_documento:   string;
  numero_documento: string;
  email:            string;
  celular:          string;
  direccion:        string;
  created_at?:      string;
  updated_at?:      string;
  isActive?:        boolean;
}

const loading  = ref( false );  
const formCliente = ref<Cliente>({
  nombres: '',
  tipo_documento: '',
  numero_documento: '',
  email: '',
  celular: '',
  direccion: ''
})

const modalAgregarCliente = ref(false);
const modalEditarCliente  = ref(false);
const actualizarLista     = ref(false);

export const useCliente = () => {

    const { mostrarNotify }   = useHelpers();

    const limpiarFormulario = () => {
      formCliente.value.nombres = ''
      formCliente.value.tipo_documento = ''
      formCliente.value.numero_documento = ''
      formCliente.value.email = ''
      formCliente.value.celular = ''
      formCliente.value.direccion = ''
    }

    const allowOnlyNumber = () => {
      formCliente.value.numero_documento = formCliente.value.numero_documento.replace(/\D/g, '');
      formCliente.value.celular          = formCliente.value.celular.replace(/\D/g, '');
		}

    onMounted(() => {
      watch(formCliente.value, (currentValue, oldValue) => {

        formCliente.value.nombres = currentValue.nombres.toUpperCase();
  
        if ( currentValue.tipo_documento !== '' ) {
          if (currentValue.tipo_documento !== '04' && formCliente.value.numero_documento.length > 10) {
            const chacarterToDelete = currentValue.numero_documento.length - 10;
            const str2 = currentValue.numero_documento.substring(0, currentValue.numero_documento.length - chacarterToDelete);
            formCliente.value.numero_documento = str2
          }
        }
      });      
    })

    const onSubmit = async( edit: boolean ) => {
      try {
        loading.value = true;
        if ( !edit ) 
          await api.post('/customers', formCliente.value)
        else
          await api.patch('/customers/' + formCliente.value.id, formCliente.value)
        
        mostrarNotify( 'positive', `Cliente ${ edit ? 'editado' : 'agregado' } exitosamente`);
        
        modalAgregarCliente.value  = false;
        modalEditarCliente.value   = false;
        actualizarLista.value      = true

        loading.value = false;
      } catch (error: any) {
        mostrarNotify( 'warning', error.response.data.message )
        loading.value = false;
      }
    }

    return {
      actualizarLista,
      formCliente,
      loading,
      limpiarFormulario,
      allowOnlyNumber,
      modalAgregarCliente,
      modalEditarCliente,
      validateNumDocument: [
        (val: any) => val.length >= ((formCliente.value.tipo_documento === '04') ? 13 : 10) || 
          `Debes completar ${ ((formCliente.value.tipo_documento === '04') ? 13 : 10) } digitos`,
      ],
      validateNumCelular: [
        (val: any) => val.length >= 10 || 'Debes completar 10 digitos'
      ],
      onSubmit
    }
}
