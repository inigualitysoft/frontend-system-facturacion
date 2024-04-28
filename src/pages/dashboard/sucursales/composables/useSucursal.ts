import { ref } from "vue"
import useHelpers from "../../../../composables/useHelpers";

export interface Sucursal {
  id?:                                string;
  nombre:                             string;
  direccion:                          string;
  establecimiento:                    number;
  punto_emision:                      number;
  secuencia_factura_produccion:       number;
  secuencia_factura_pruebas?:         number;
  secuencia_nota_credito_produccion:  number;
  secuencia_nota_credito_pruebas?:    number;
  secuencia_retencion_produccion:     number;
  secuencia_retencion_pruebas?:       number;
  company_id:                         string;
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
  establecimiento: 0,
  punto_emision: 0,
  secuencia_factura_produccion: 0,
  secuencia_factura_pruebas: 0,
  secuencia_nota_credito_produccion: 0,
  secuencia_nota_credito_pruebas: 0,
  secuencia_retencion_produccion: 0,
  secuencia_retencion_pruebas: 0,
  ambiente: 'PRUEBA',
  company_id: ''
})

export const useSucursal = () => {

  const { api, mostrarNotify, claim, router, route } = useHelpers();

    const cargarCompanies = async () => {
      listCompanies.value = [];

      const { data } = await api.get('/companies/true');

      data.forEach((companie: any) => {
        listCompanies.value.push({
          label:  companie.nombre_comercial,
          value:  companie.id
        })
      });
      formSucursal.value.company_id = claim.company.id
    }

    const limpiarFormulario = () => {
      formSucursal.value.nombre = ''
      formSucursal.value.direccion = ''
      formSucursal.value.establecimiento = 1
      formSucursal.value.punto_emision = 1
      formSucursal.value.secuencia_factura_produccion = 1
      formSucursal.value.secuencia_factura_pruebas = 1
      formSucursal.value.secuencia_nota_credito_produccion = 1
      formSucursal.value.secuencia_nota_credito_pruebas = 1
    }

    const onSubmit = async( edit: boolean ) => {

      if (formSucursal.value.establecimiento <= 0 ||
        formSucursal.value.punto_emision <= 0 ||
        formSucursal.value.secuencia_factura_produccion <= 0)
        return mostrarNotify( 'warning', `Los valores deben ser mayor o igual a 1`);

      try {
        loading.value = true;
        formSucursal.value.nombre = formSucursal.value.nombre.toUpperCase()

        if ( !edit )
          await api.post('/sucursal', formSucursal.value)
        else
          await api.patch('/sucursal/' + formSucursal.value.id, formSucursal.value)

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
      onSubmit
    }
}
