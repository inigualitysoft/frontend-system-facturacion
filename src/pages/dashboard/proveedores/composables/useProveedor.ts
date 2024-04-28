import provincias from "../../../../apis/provincias.json";
import { ref, onMounted, watch } from "vue"
import useHelpers from "../../../../composables/useHelpers";

export interface Proveedor {
  id?:              string;
  razon_social:     string;
  tipo_documento:   string;
  numero_documento: string;
  email:            string;
  celular:          string;
  provincia:        string;
  ciudad:           string;
  direccion:        string;
  created_at?:      string;
  updated_at?:      string;
  isActive?:        boolean;
}

const modalAgregarProveedor = ref(false);
const modalEditarProveedor  = ref(false);
const listProvincias        = ref<string[] | any>([]);
const listCantones          = ref<string[] | any>([]);
const loading               = ref( false );
const actualizarLista       = ref( false );

const formProveedor = ref<Proveedor>({
  razon_social: '',
  tipo_documento: '',
  numero_documento: '',
  email: '',
  celular: '',
  provincia: '',
  ciudad: '',
  direccion: ''
})

export const useProveedor = () => {

    const { api, claim, mostrarNotify } = useHelpers();

    const limpiarFormulario = () => {
      formProveedor.value.razon_social = ''
      formProveedor.value.tipo_documento = ''
      formProveedor.value.numero_documento = ''
      formProveedor.value.email = ''
      formProveedor.value.celular = ''
      formProveedor.value.provincia = ''
      formProveedor.value.ciudad = ''
      formProveedor.value.direccion = ''
    }

    const allowOnlyNumber = () => {
      formProveedor.value.numero_documento = formProveedor.value.numero_documento.replace(/\D/g, '');
      formProveedor.value.celular          = formProveedor.value.celular.replace(/\D/g, '');
		}

    onMounted(() => {
      let list = Object.entries(provincias)
      list.forEach( (data: any) => {
          if ( data[1].provincia !== undefined )
            listProvincias.value.push( data[1].provincia )
      })

      watch(formProveedor.value, (currentValue, _) => {

        formProveedor.value.razon_social = currentValue.razon_social.toUpperCase();

        if ( currentValue.provincia !== '' ) {
          let list: any = Object.entries(provincias)
          const provincia = list.find( (x: any) => x[1].provincia === currentValue.provincia );

          listCantones.value = []

          let objectListCantones: any = Object.entries( provincia[1].cantones )
          objectListCantones.forEach( (y: any) => { listCantones.value.push( y[1].canton ) });
        }

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

        if ( !edit )
          await api.post('/providers', formProveedor.value, { headers })
        else
          await api.patch('/providers/' + formProveedor.value.id, formProveedor.value, { headers })

        actualizarLista.value = true
        modalAgregarProveedor.value = false;
        modalEditarProveedor.value  = false;
        actualizarLista.value = true;

        mostrarNotify( 'positive', 'Proveedor Agregado', 'top' )
        loading.value = false;
      } catch (error: any) {
        mostrarNotify( 'warning', error.response.data.message )
        loading.value = false;
      }
    }

    return {
      actualizarLista,
      formProveedor,
      listProvincias,
      listCantones,
      loading,
      limpiarFormulario,
      allowOnlyNumber,
      modalAgregarProveedor,
      modalEditarProveedor,
      validateNumDocument: [
        (val: any) => val.length >= ((formProveedor.value.tipo_documento === 'RUC') ? 13 : 10) ||
          `Debes completar ${ ((formProveedor.value.tipo_documento === 'RUC') ? 13 : 10) } digitos`,
      ],
      validateNumCelular: [
        (val: any) => val.length >= 10 || 'Debes completar 10 digitos'
      ],
      onSubmit
    }
}
