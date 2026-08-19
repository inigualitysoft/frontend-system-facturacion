import { ref, onMounted, watch } from "vue"
import useHelpers from "../../../../composables/useHelpers";

const loading  = ref( false );
const formCliente = ref({
  nombres: '',
  tipo_documento: '',
  numero_documento: '',
  email: '',
  celular: '',
  direccion: '',
  observacion: '',
  tipo_persona: 'NATURAL'
})

const modalAgregarCliente = ref(false);
const modalEditarCliente  = ref(false);
const actualizarLista     = ref(false);

export const useCliente = () => {

    const { api, claim, mostrarNotify } = useHelpers();

    const limpiarFormulario = () => {
      formCliente.value.nombres = ''
      formCliente.value.tipo_documento = ''
      formCliente.value.numero_documento = ''
      formCliente.value.email = ''
      formCliente.value.celular = ''
      formCliente.value.direccion = ''
      formCliente.value.observacion = ''
      formCliente.value.tipo_persona = 'NATURAL'
    }

    const validaciones = ref({
      nombres:          { message: '', isValid: true },
      tipo_documento:   { message: '', isValid: true },
      numero_documento: { message: '', isValid: true },
      email:            { message: '', isValid: true },
      celular:          { message: '', isValid: true },
      direccion:        { message: '', isValid: true },
    })

    const validarCampos = () => {
      let existError = false;
      var validEmail =  /^\w+([.-_+]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/;

      // Email, celular y dirección son opcionales: hay clientes de los que solo
      // se tiene la identificación. Lo único que se sigue exigiendo es que, si
      // el correo se llena, tenga formato válido.
      const camposRequeridos = ['nombres', 'tipo_documento', 'numero_documento'];

      camposRequeridos.forEach( campo => {
        if ( ( formCliente.value[campo] ?? '' ).length == 0 ) {
          validaciones.value[campo].message = 'Debes completar este campo'
          validaciones.value[campo].isValid = false;
          existError = true;
        }
      })

      const email = formCliente.value.email ?? '';
      if( email.length > 0 && !validEmail.test( email ) ){
        validaciones.value.email.message = 'Ingresa un email valido'
        validaciones.value.email.isValid = false
        existError = true;
      }

      return existError;
    }

    const allowOnlyNumber = () => {
      formCliente.value.numero_documento = formCliente.value.numero_documento.replace(/\D/g, '');
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

    const onSubmit = async( edit ) => {

      if ( validarCampos() || !validaciones.value.celular.isValid) return;

      try {
        loading.value = true;
        let headers = { 'company-id': claim.company.id }

        if ( !edit )
          await api.post('/customers/create', formCliente.value, { headers })
        else
          await api.patch('/customers/' + formCliente.value.id, formCliente.value, { headers })

        mostrarNotify( 'positive', `Cliente ${ edit ? 'editado' : 'agregado' } exitosamente`);

        modalAgregarCliente.value = false;
        modalEditarCliente.value  = false;
        actualizarLista.value     = true

        loading.value = false;
      } catch (error) {
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
        (val) => val.length >= ((formCliente.value.tipo_documento === '04') ? 13 : 10) ||
          `Debes completar ${ ((formCliente.value.tipo_documento === '04') ? 13 : 10) } digitos`,
      ],
      validaciones,
      validateNumCelular: [
        (val) => val.length >= 10 || 'Debes completar 10 digitos'
      ],
      onSubmit
    }
}