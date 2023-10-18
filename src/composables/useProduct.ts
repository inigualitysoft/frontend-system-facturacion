import { computed, ref } from "vue";
import { api } from "boot/axios";
import useHelpers from "../composables/useHelpers";

const rows: any = ref([]);
const filterByCodBarra = ref('');
const loadingState = ref( false );
const listProductos = ref([]);
const modalSelectProducto = ref(false);

const columns: any = ref([
  { name: 'acciones', label: 'Quitar', align: 'left'  },
  { label: 'Codigo Barra', align: 'left', field: 'codigoBarra', name: 'codigoBarra' },
  { label: 'Producto', align: 'left', field: 'nombre', name: 'nombre' },
  { name: 'cantidad', label: 'Cantidad', align: 'center'},
  { name: 'iva', label: 'Aplica IVA', align: 'center' },
  { name: 'descuento', label: 'Valor de descuento($)', align: 'center', field: 'descuento' },
  { label: 'Stock', align: 'center', field: 'stock', name: 'stock' },
  { name: 'pvm', label: 'Costo Neto', align: 'center' },
  { name: 'v_total', label: 'Valor Total', align: 'center', field: 'v_total' }
])

export const useProduct = () => {

  const { mostrarNotify } = useHelpers();

  const agregarAndValidarStock = ( data: any, modulo: string ) => {
    //VERIFICAR SI YA SE AGREGO ESTE ARTICULO
    const resultado = rows.value.some( (row: any) => row.codigoBarra == data.codigoBarra )
    if ( !resultado ){

      data.cantidad  = 0;
      data.v_total   = 0;
      data.descuento = modulo == 'venta' ? data.descuento : 0;

      rows.value.unshift( data );
      filterByCodBarra.value = ''
    }
    else
      mostrarNotify('warning', 'Ya fue agregado este articulo');
  }

  const filterArticulo = async ( modulo:string = 'compras' ) => {
    if( filterByCodBarra.value.length == 0 ) 
      return mostrarNotify('warning', 'Ingresa el termino de busqueda');

    loadingState.value = true
    try {

      const { data } = await api.get(`/products/${ filterByCodBarra.value }`);

      if ( data.length > 1 ) {
        listProductos.value = data;
        modalSelectProducto.value = true;
        return loadingState.value = false
      }

      // //Verificar si se encontro el articulo
      if ( data.length === 0 ){
        mostrarNotify('warning', 'No se encontro el articulo...');
        return loadingState.value = false
      } 

      loadingState.value = false
      agregarAndValidarStock( data[0], modulo );
    } catch (error) {
      console.log(error)
      loadingState.value = false
    }
  }

  const quitarArticulo = ( articulo_id: string ) => {
    const indice = rows.value.findIndex( (row: any) => row.id == articulo_id )
    rows.value.splice(indice, 1);
  }
  
  const valorFactura = computed(() => {
    let subtotal = 0, iva = 0, descuento = 0, total = 0;

    rows.value.forEach( (row: any) => {
      if ( row.descuento > 0 ) 
        descuento += (parseFloat(row.v_total) * parseFloat(row.descuento)) / 100;

      if ( row.aplicaIva )
        iva += (parseFloat( row.v_total ) - (parseFloat(row.v_total) * parseFloat(row.descuento)) / 100) * 0.12  
      
      subtotal += parseFloat(row.v_total)
    })

    total = ( subtotal + iva ) - descuento;
    return {
      subtotal:   parseFloat(subtotal.toFixed(2)),
      iva:        parseFloat(iva.toFixed(2)),
      descuento:  parseFloat(descuento.toFixed(2)),
      total:      parseFloat(total.toFixed(2))
    }
  })

  const getSubtotalByProduct = ( row: any, modulo: string = 'compras' ) => {
    if ( modulo == 'compras' ) 
      row.v_total = ( parseFloat(row.cantidad) * parseFloat(row.precio_compra)).toFixed(2)
    else
      row.v_total = ( parseFloat(row.cantidad) * parseFloat(row.pvp)).toFixed(2)
  }


  return {
    agregarAndValidarStock,
    columns,
    filterArticulo,
    filterByCodBarra,
    loadingState,
    listProductos,
    modalSelectProducto,
    getSubtotalByProduct,
    quitarArticulo,
    valorFactura,
    rows
  }
}
