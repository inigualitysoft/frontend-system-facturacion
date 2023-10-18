import { ref, onMounted, watch } from "vue"
import useHelpers from "../../../../composables/useHelpers";
import { api } from "boot/axios";

export interface Sucursal {
  id?:                          string;
  nombre:                       string;
  direccion:                    string;
  establecimiento:              string;
  punto_emision:                string;
  secuencia_factura_produccion: string;
  secuencia_factura_pruebas?:   string;
  ambiente?:                    string;
  created_at?:                  string;
  updated_at?:                  string;
  isActive?:                    boolean;
}

const loading  = ref( false );  
const formSucursal = ref<Sucursal>({
  nombre: '',
  direccion: '',
  establecimiento: '',
  punto_emision: '',
  secuencia_factura_produccion: '',
  secuencia_factura_pruebas: '',
  ambiente: 'PRUEBA'
})

const modalAgregarSucursal = ref(false);
const modalEditarSucursal  = ref(false);
const actualizarLista     = ref(false);

export const useSucursal = () => {

    const { mostrarNotify }   = useHelpers();

    const limpiarFormulario = () => {
      formSucursal.value.nombre = ''
      formSucursal.value.direccion = ''
      formSucursal.value.establecimiento = ''
      formSucursal.value.punto_emision = ''
      formSucursal.value.secuencia_factura_produccion = ''
    }

    const allowOnlyNumber = () => {
      formSucursal.value.establecimiento = formSucursal.value.establecimiento.toString().replace(/\D/g, '');
      formSucursal.value.punto_emision = formSucursal.value.punto_emision.toString().replace(/\D/g, '');
      formSucursal.value.secuencia_factura_produccion  = formSucursal.value.secuencia_factura_produccion.toString().replace(/\D/g, '');
		}

    onMounted(() => {
      watch(formSucursal.value, (currentValue, oldValue) => {
        formSucursal.value.nombre = currentValue.nombre.toUpperCase();  
      });      
    })

    const onSubmit = async( edit: boolean ) => {

      if (parseInt(formSucursal.value.establecimiento) <= 0 ||
        parseInt(formSucursal.value.punto_emision) <= 0 || 
        parseInt(formSucursal.value.secuencia_factura_produccion) <= 0) 
        return mostrarNotify( 'warning', `Los valores deben ser mayor o igual a 1`);

      try {
        loading.value = true;
        if ( !edit ) 
          await api.post('/sucursal', formSucursal.value)
        else{
          formSucursal.value.establecimiento = formSucursal.value.establecimiento.toString();
          formSucursal.value.punto_emision = formSucursal.value.punto_emision.toString();
          formSucursal.value.secuencia_factura_produccion = formSucursal.value.secuencia_factura_produccion.toString();
          await api.patch('/sucursal/' + formSucursal.value.id, formSucursal.value)
        }
        
        mostrarNotify( 'positive', `Sucursal ${ edit ? 'editado' : 'agregado' } exitosamente`);
        
        modalAgregarSucursal.value = false;
        modalEditarSucursal.value  = false;
        actualizarLista.value      = true

        loading.value = false;
      } catch (error: any) {
        mostrarNotify( 'warning', error.response.data.message )
        loading.value = false;
      }
    }

    return {
      actualizarLista,
      formSucursal,
      loading,
      limpiarFormulario,
      allowOnlyNumber,
      modalAgregarSucursal,
      modalEditarSucursal,
      onSubmit
    }
}
