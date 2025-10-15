import { computed, ref } from "vue";
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
  { name: 'cantidad', label: 'Cantidad', align: 'center'},
  { name: 'iva', label: 'Aplica IVA', align: 'center' },
  { name: 'descuento', label: 'Descuento(%)', align: 'center', field: 'descuento' },
  { label: 'Stock', align: 'center', field: 'stock', name: 'stock' },
  { name: 'pvm', label: 'Costo Neto', align: 'center' },
  { name: 'v_total', label: 'Valor Total', align: 'center', field: 'v_total' }
])

export const useProduct = () => {

  const iva_selected = ref(0);
  const { api, mostrarNotify, claim } = useHelpers();

  const agregarAndValidarStock = ( data: any, modulo: string ) => {
    //VERIFICAR SI YA SE AGREGO ESTE ARTICULO
    const resultado = rows.value.some( (row: any) => row.id == data.id )
    if ( !resultado ) {
      if ( modulo !== 'proforma' && modulo !== 'compras' && data.stock <= 0 && data.tipo != 'Servicio')
        return mostrarNotify('negative', `No hay stock del articulo ${ data.nombre }`);

      let cantidad = 0;
      if (data.tipo == 'Servicio' || modulo == 'proforma'){
        cantidad = 1;
        data.v_total = data.pvp
      }
      else cantidad = 0;

      data.cantidad  = cantidad;
      data.v_total   = modulo == 'proforma' ? parseFloat(data.v_total) : 0;
      data.descuento = (modulo == 'venta' || modulo == 'proforma') ? data.descuento : 0;

      rows.value.unshift( data );

      if (data.tipo == 'Servicio') getSubtotalByProduct( data, 'ventas' )
    }
    else
      mostrarNotify('warning', 'Ya fue agregado este producto/servicio');

    filterByCodBarra.value = ''
  }

  const filterArticulo = async ( modulo: string ) => {
    if( filterByCodBarra.value.length == 0 )
      return mostrarNotify('warning', 'Ingresa el termino de busqueda');

    loadingState.value = true
    try {

      let headers = { 'company-id': claim.company.id };
      let { data } = await api.get(`/products/${ filterByCodBarra.value }`, { headers });

      data = data.filter( (x: any) => {
        if (modulo == 'compras' && x.tipo == 'Producto') return x
        if (modulo == 'venta') return x
      })

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
      }else if (claim.roles[0] == 'ADMINISTRADOR' || claim.roles[0] == 'SUPER-ADMINISTRADOR') {
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

  const getValorIva = async() => {
    const { data: { iva: empresa_iva } } = await api.get(`/companies/get-iva/${ claim.company.id }`);

    if ( empresa_iva == '4' ) iva_selected.value = 15
    if ( empresa_iva == '3' ) iva_selected.value = 14
    if ( empresa_iva == '2' ) iva_selected.value = 12
  }

  const valorFactura = computed(() => {
    let subtotal = 0, iva = 0, descuento = 0, total = 0;

    rows.value.forEach( (row: any) => {
      if ( row.descuento > 0 )
        descuento += (parseFloat(row.v_total) * parseFloat(row.descuento)) / 100;

      if ( row.aplicaIva )
        iva += ((( +row.v_total ) - ((+row.v_total) * (+row.descuento)) / 100) * iva_selected.value) / 100;

      subtotal += +row.v_total
    })

    iva = Math.round(iva * 100) / 100;

    total = ( subtotal + iva ) - descuento;
    return {
      subtotal:   formatearNumero(subtotal),
      iva:        formatearNumero(iva),
      descuento:  formatearNumero(descuento),
      total:      formatearNumero(total)
    }
  })

  const getSubtotalByProduct = ( row: any, modulo: string = 'compras' ) => {
    if ( modulo == 'compras' )
      row.v_total = ( parseInt(row.cantidad) * parseFloat(( Math.floor( row.precio_compra * 100) / 100).toString()))
    else
      row.v_total = formatearNumero(parseInt(row.cantidad) * parseFloat(row.pvp))

    row.pvp = formatearNumero(row.pvp)
  }

  const formatearNumero = (numero: any) => {
    let partes = numero.toString().split('.');
    let numeroFormateado = parseFloat(partes[0]);

    if (partes.length > 1) {
        numeroFormateado += parseFloat('.' + partes[1].substring(0, 2));
    } else {
        numeroFormateado += parseFloat('.00');
    }

    return parseFloat(numeroFormateado.toFixed(2));
  }

  getValorIva()

  return {
    agregarAndValidarStock,
    columns,
    claim,
    formatearNumero,
    filterArticulo,
    filterByCodBarra,
    loadingState,
    listProductos,
    modalSelectProducto,
    sucursal_selected,
    iva_selected,
    getSubtotalByProduct,
    quitarArticulo,
    valorFactura,
    rows
  }
}
