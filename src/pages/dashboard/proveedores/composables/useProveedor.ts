import { ref, onMounted, watch } from "vue"
import useHelpers from "../../../../composables/useHelpers";

export interface Proveedor {
  id?:              string;
  razon_social:     string;
  tipo_documento:   string;
  numero_documento: string;
  email:            string;
  celular:          string;
  direccion:        string;
  observacion:      string;
  tipo_persona:     string;
  created_at?:      string;
  updated_at?:      string;
  isActive?:        boolean;
}

const modalAgregarProveedor = ref(false);
const modalEditarProveedor  = ref(false);
const loading               = ref( false );
const actualizarLista       = ref( false );

const formProveedor = ref<Proveedor>({
  razon_social: '',
  tipo_documento: '',
  numero_documento: '',
  email: '',
  celular: '',
  direccion: '',
  observacion: '',
  tipo_persona: 'NATURAL'
})

export const useProveedor = () => {

    const { api, claim, mostrarNotify } = useHelpers();

    const limpiarFormulario = () => {
      formProveedor.value.razon_social = ''
      formProveedor.value.tipo_documento = ''
      formProveedor.value.numero_documento = ''
      formProveedor.value.email = ''
      formProveedor.value.celular = ''
      formProveedor.value.direccion = ''
      formProveedor.value.observacion = ''
      formProveedor.value.tipo_persona = 'NATURAL'
    }

    // El celular ya no pasa por aquí: lo maneja el selector de país, que guarda
    // el número formateado ("+593 98 659 0824"); quitarle los símbolos lo rompía.
    const allowOnlyNumber = () => {
      formProveedor.value.numero_documento = formProveedor.value.numero_documento.replace(/\D/g, '');
		}

    onMounted(() => {
      watch(formProveedor.value, (currentValue, _) => {

        formProveedor.value.razon_social = currentValue.razon_social.toUpperCase();

        if ( currentValue.tipo_documento !== '' ) {
          if (currentValue.tipo_documento !== 'RUC' && formProveedor.value.numero_documento.length > 10) {
            const chacarterToDelete = currentValue.numero_documento.length - 10;
            const str2 = currentValue.numero_documento.substring(0, currentValue.numero_documento.length - chacarterToDelete);
            formProveedor.value.numero_documento = str2
          }
        }

      });
    })

    const onSubmit = async ( edit: boolean ) => {
      try {
        loading.value = true;
        let headers = { 'company-id': claim.company.id }

        // El email tiene índice único: mandarlo en blanco haría chocar al segundo
        // proveedor sin correo. Los opcionales vacíos se envían como undefined
        // para que queden en NULL.
        const payload = {
          ...formProveedor.value,
          email:     formProveedor.value.email     || undefined,
          celular:   formProveedor.value.celular   || undefined,
          direccion: formProveedor.value.direccion || undefined
        }

        if ( !edit )
          await api.post('/providers', payload, { headers })
        else
          await api.patch('/providers/' + formProveedor.value.id, payload, { headers })

        actualizarLista.value = true
        modalAgregarProveedor.value = false;
        modalEditarProveedor.value  = false;
        actualizarLista.value = true;

        mostrarNotify( 'positive', `Proveedor ${ edit ? 'editado' : 'agregado' } exitosamente`, 'top' )
        loading.value = false;
      } catch (error: any) {
        mostrarNotify( 'warning', error.response.data.message )
        loading.value = false;
      }
    }

    return {
      actualizarLista,
      formProveedor,
      loading,
      limpiarFormulario,
      allowOnlyNumber,
      modalAgregarProveedor,
      modalEditarProveedor,
      validateNumDocument: [
        (val: any) => val.length >= ((formProveedor.value.tipo_documento === 'RUC') ? 13 : 10) ||
          `Debes completar ${ ((formProveedor.value.tipo_documento === 'RUC') ? 13 : 10) } digitos`,
      ],
      onSubmit
    }
}
