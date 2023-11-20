import { computed, ref } from "vue";
import { api } from "boot/axios";
import useHelpers from "../composables/useHelpers";

const rows: any = ref([]);
const filterByCodBarra = ref('');
const loadingState = ref( false );
const listProductos = ref({});
const modalSelectProducto = ref(false);
const sucursal_selected = ref('');

const columns: any = ref([
  { name: 'acciones', label: 'Quitar', align: 'left'  },
  { label: 'Codigo Barra', align: 'left', field: 'codigoBarra', name: 'codigoBarra' },
  { label: 'Producto', align: 'left', field: 'nombre', name: 'nombre' },
  { name: 'cantidad', label: 'Cantidad', align: 'left'},
  { name: 'iva', label: 'Aplica IVA', align: 'center' },
  { name: 'descuento', label: 'descuento %', align: 'left', field: 'descuento' },
  { label: 'Stock', align: 'center', field: 'stock', name: 'stock' },
  { name: 'pvm', label: 'Costo Neto', align: 'center' },
  { name: 'v_total', label: 'Valor Total', align: 'center', field: 'v_total' }
])

export const useProduct = () => {

  const { mostrarNotify, claim } = useHelpers();

  const agregarAndValidarStock = ( data: any, modulo: string ) => {
    //VERIFICAR SI YA SE AGREGO ESTE ARTICULO
    const resultado = rows.value.some( (row: any) => row.codigoBarra == data.codigoBarra )
    if ( !resultado ){
      if ( modulo !== 'compras' && data.stock <= 0 ) 
      return mostrarNotify('negative', `No hay stock del articulo ${ data.nombre }`);
    
      data.cantidad  = modulo == 'proforma' ? data.cantidad : 0;
      data.v_total   = modulo == 'proforma' ? data.v_total : 0;
      data.descuento = (modulo == 'venta' || modulo == 'proforma') ? data.descuento : 0;
    
      rows.value.unshift( data );
      filterByCodBarra.value = ''
    }
    else
      mostrarNotify('warning', 'Ya fue agregado este articulo');
  }

  const filterArticulo = async ( modulo: string ) => {
    if( filterByCodBarra.value.length == 0 ) 
      return mostrarNotify('warning', 'Ingresa el termino de busqueda');

    loadingState.value = true
    try {

      const { data } = await api.get(`/products/${ filterByCodBarra.value }`);

      if ( data.length > 1 ) {
        listProductos.value = {
          data,
          tipo: modulo
        };
        modalSelectProducto.value = true;
        return loadingState.value = false
      }

      //Verificar si se encontro el articulo
      if ( data.length === 0 ){
        mostrarNotify('warning', 'No se encontro el articulo...');
        return loadingState.value = false
      }else if (claim.roles[0] == 'Administrador' || claim.roles[0] == 'Super-Administrador') {
        if ( sucursal_selected.value !== data[0].sucursal_id.id ){
          mostrarNotify('warning', 'No se encontro el articulo...');
          return loadingState.value = false
        }
      }else{
        if ( claim.sucursales[0] !== data[0].sucursal_id.id ){
          mostrarNotify('warning', 'No se encontro el articulo...');
          return loadingState.value = false
        }
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
        iva += (parseFloat( row.v_total ) - (parseFloat(row.v_total) * parseFloat(row.descuento)) / 100) * 0.12 ; 
      
      subtotal += parseFloat(row.v_total)
    })

    total = ( subtotal + iva ) - descuento;
    return {
      subtotal:   parseFloat((Math.floor( subtotal * 100 ) / 100).toString()),
      iva:        parseFloat((Math.floor( iva * 100 ) / 100).toString()),
      descuento:  parseFloat((Math.floor( descuento * 100) / 100).toString()),
      total:      parseFloat((Math.floor( total * 100) / 100).toString())
    }
  })

  const getSubtotalByProduct = ( row: any, modulo: string = 'compras' ) => {
    if ( modulo == 'compras' ) 
      row.v_total = ( parseFloat(row.cantidad) * parseFloat(( Math.floor( row.precio_compra * 100) / 100).toString()))
    else
      row.v_total = ( parseFloat(row.cantidad) * parseFloat(( Math.floor( row.pvp * 100) / 100).toString()))
  }

  return {
    agregarAndValidarStock,
    columns,
    claim,
    filterArticulo,
    filterByCodBarra,
    loadingState,
    listProductos,
    modalSelectProducto,
    sucursal_selected,
    getSubtotalByProduct,
    quitarArticulo,
    valorFactura,
    rows
  }
}
