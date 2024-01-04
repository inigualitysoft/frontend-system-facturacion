import { api } from "boot/axios";
import { ref, onMounted, watch } from "vue"
import useHelpers from "../../../../composables/useHelpers";

export interface Sucursal {
  id?:                                string;
  nombre:                             string;
  direccion:                          string;
  establecimiento:                    string;
  punto_emision:                      string;
  secuencia_factura_produccion:       string;
  secuencia_factura_pruebas?:         string;
  secuencia_nota_credito_produccion:  string;
  secuencia_nota_credito_pruebas?:    string;
  ambiente?:                          string;
  created_at?:                        string;
  updated_at?:                        string;
  isActive?:                          boolean;
}

const loading  = ref( false );  
const listCompanies = ref<{ label: string; value: string; }[]>([]);
const formSucursal = ref<Sucursal>({
  nombre: '',
  direccion: '',
  establecimiento: '',
  punto_emision: '',
  secuencia_factura_produccion: '',
  secuencia_factura_pruebas: '',
  secuencia_nota_credito_produccion: '',
  secuencia_nota_credito_pruebas: '',
  ambiente: 'PRUEBA'
})

const cargarCompanies = async () => {
  listCompanies.value = [];
  
  const { data } = await api.get('/companies/true');

  data.forEach((companie: any) => {
    listCompanies.value.push({
      label:  companie.nombre_comercial,
      value:  companie.id
    })
  });
}

export const useSucursal = () => {

    const { mostrarNotify, claim, router, route } = useHelpers();

    const limpiarFormulario = () => {
      formSucursal.value.nombre = ''
      formSucursal.value.direccion = ''
      formSucursal.value.establecimiento = ''
      formSucursal.value.punto_emision = ''
      formSucursal.value.secuencia_factura_produccion = ''
      formSucursal.value.secuencia_factura_pruebas = ''
      formSucursal.value.secuencia_nota_credito_produccion = ''
      formSucursal.value.secuencia_nota_credito_pruebas = ''
    }

    const allowOnlyNumber = () => {
      formSucursal.value.establecimiento = formSucursal.value.establecimiento.toString().replace(/\D/g, '');
      formSucursal.value.punto_emision = formSucursal.value.punto_emision.toString().replace(/\D/g, '');
      formSucursal.value.secuencia_factura_produccion  = formSucursal.value.secuencia_factura_produccion.toString().replace(/\D/g, '');
      formSucursal.value.secuencia_nota_credito_produccion  = formSucursal.value.secuencia_nota_credito_produccion.toString().replace(/\D/g, '');
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
        if ( !edit ){
          let headers: any;
            await api.post('/sucursal', formSucursal.value, headers)
        }else{
          formSucursal.value.establecimiento = formSucursal.value.establecimiento.toString();
          formSucursal.value.punto_emision = formSucursal.value.punto_emision.toString();
          formSucursal.value.secuencia_factura_produccion = formSucursal.value.secuencia_factura_produccion.toString();
          formSucursal.value.secuencia_nota_credito_produccion = formSucursal.value.secuencia_nota_credito_produccion.toString();
          await api.patch('/sucursal/' + formSucursal.value.id, formSucursal.value)
        }
        
        mostrarNotify( 'positive', `Sucursal ${ edit ? 'editado' : 'agregado' } exitosamente`);
        loading.value = false;

        router.push({ name: 'Ver Sucursales' });
      } catch (error: any) {
        mostrarNotify( 'warning', error.response.data.message )
        loading.value = false;
      }
    }

    return {
      api,
      claim,
      formSucursal,
      loading,
      route,
      limpiarFormulario,
      cargarCompanies,
      listCompanies,
      allowOnlyNumber,
      onSubmit
    }
}
