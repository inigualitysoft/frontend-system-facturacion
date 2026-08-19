import { ref } from 'vue'
import useHelpers from "../../../../composables/useHelpers";

export interface Product {
  id?:            string;
  aplicaIva:      boolean;
  impuesto:       number;
  codigoBarra:    string;
  nombre:         string;
  precio_compra:  number;
  pvp:            number;
  stock:          number;
  tipo:           string;
  descuento:      number;
  // ICE: null = no aplica · 'tarifa' = porcentaje · 'valor' = monto fijo
  ice:            string | null;
  valor_ice:      number | null;
  tipo_ice:       number | null;
  created_at?:    Date;
  updated_at?:    Date;
  isActive?:      boolean;
}

const valoresIniciales: Product = {
  aplicaIva: false,
  impuesto: 0,
  codigoBarra: '',
  nombre: '',
  precio_compra: 0,
  pvp: 0,
  tipo: '',
  stock: 0,
  descuento: 0.00,
  ice: null,
  valor_ice: null,
  tipo_ice: null
}

const formProduct = ref<Product>({ ...valoresIniciales })

const loading              = ref( false );
const modalAgregarProducto = ref( false );
const modalEditarProducto  = ref( false );
const actualizarTabla      = ref( false );
const selectSucursal       = ref('')
const modalFiltrarArticulo = ref( false );

export const useProduct = () => {

  const { api, claim, mostrarNotify } = useHelpers();

  const limpiarFormulario = () => {
    formProduct.value    = { ...valoresIniciales };
    selectSucursal.value = ''
  }

  const allowOnlyNumber = () => {

    if (formProduct.value.stock.toString().length > 0)
      formProduct.value.stock = parseFloat(formProduct.value.stock.toString().replace(/\D/g, ''));
    else
      formProduct.value.stock = 0

    if (formProduct.value.descuento.toString().length > 0)
      formProduct.value.descuento = parseFloat(formProduct.value.descuento.toString().replace(/\D/g, ''));
    else
      formProduct.value.descuento = 0;
  }

  const validDecimal = ( campo: string ) => {
    let currentValue = 0;
    if ( campo == 'pvm' )
      currentValue = formProduct.value.precio_compra;
    else
      currentValue = formProduct.value.pvp;

    const regex = /^\d{0,9}(\.\d{1,2})?$/

    setTimeout(function(){
      let newValue = 0
      if ( campo == 'pvm' )
        newValue = formProduct.value.precio_compra;
      else
         newValue = formProduct.value.pvp;

      if(!regex.test(newValue.toString())){
        const result = parseFloat(currentValue.toString().substring(0, currentValue.toString().length - 1));
        if ( campo == 'pvm' )
          formProduct.value.precio_compra = result;
        else
          formProduct.value.pvp = result
      }
    }, 0);
  }

  const onSubmit = async ( edit: boolean ) => {
    try {
      if ( selectSucursal.value.length == 0 )
        return mostrarNotify('warning', 'Elige una sucursal por favor');
      if ( formProduct.value.tipo.length == 0 )
        return mostrarNotify('warning', 'Completa el campo tipo por favor');

      loading.value = true;

      let headers = { headers: { 'sucursal-id': selectSucursal.value } };

      if ( !edit )
        await api.post('/products', formProduct.value, headers)
      else
        await api.patch('/products/' + formProduct.value.id, formProduct.value, headers)

      mostrarNotify( 'positive', `Producto ${ edit ? 'editado' : 'agregado' } exitosamente`)

      modalAgregarProducto.value = false;
      modalEditarProducto.value  = false;
      actualizarTabla.value      = true;

      limpiarFormulario()

      loading.value = false;
    } catch (error: any) {
      loading.value = false;
      mostrarNotify( 'warning', error.response.data.message )
    }
  }

  return {
    api,
    allowOnlyNumber,
    actualizarTabla,
    claim,
    formProduct,
    limpiarFormulario,
    loading,
    mostrarNotify,
    onSubmit,
    selectSucursal,
    validDecimal,
    modalAgregarProducto,
    modalEditarProducto
  }
}