<script setup lang="ts">
  import { ref, watch } from 'vue';
  import { api } from "boot/axios";
  import { useRouter } from "vue-router";
  import useHelpers from "../../../composables/useHelpers";
  import { date, Dialog, Loading } from 'quasar'
  import AddCliente from '../clientes/AddCliente.vue'
  import SelectProduct from '../../../components/SelectProduct.vue'
  import { Product } from '../productos/composables/useProducts';
  import { useProduct } from "../../../composables/useProduct";
  import { useCliente } from "../clientes/composables/useCliente";
  import { useAuthUserStore } from "stores/auth-user"
  import JWT from 'jwt-client'

  let optionsClients: any = []
  const listClientes: any = ref([]);

  const modalAgregarCliente = ref(false);
  const numFacturaCargado   = ref( false );
  const timeStamp = Date.now()
  let fechaActual = date.formatDate(timeStamp, 'DD/MM/YYYY')

  const { mostrarNotify } = useHelpers();

  const { 
    filterByCodBarra, 
    columns, 
    rows, 
    modalSelectProducto,
    loadingState,
    listProductos,
    valorFactura,
    agregarAndValidarStock, 
    filterArticulo, 
    getSubtotalByProduct,
    quitarArticulo
  } = useProduct();
  let { actualizarLista } = useCliente();

  columns.value[7] = { name: 'pvp', label: 'Precio de Venta', align: 'center' }

  const formVenta = ref({
    customer_id: '0fa3a37d-310e-4d3b-a304-c0cd8e58f7ac',
    numero_comprobante: '',
    products: [],
    user_id: ''
  });

  const router = useRouter();

  const agregarProduct = ( product: Product ) => {
    agregarAndValidarStock( product, 'venta' )
    modalSelectProducto.value = false
  }

  watch(actualizarLista, (currentValue, _) => {
    if ( currentValue ) getClientes(); 
  });
  const getClientes = async () => {
    //Cerrar modal de agregar cliente
    modalAgregarCliente.value = false;
    try {
      const { data: clientes } = await api.get('/customers');

      listClientes.value = [];

      clientes.forEach((cliente: any) => {
        if ( cliente.nombres != 'CONSUMIDOR FINAL' ) {
          listClientes.value.push({
            label: cliente.nombres,
            value: cliente.id,
            num_doc: cliente.numero_documento
          })
        }
      });

      listClientes.value.push({ 
        label: 'CONSUMIDOR FINAL', 
        value: '0fa3a37d-310e-4d3b-a304-c0cd8e58f7ac', 
        cedula: '0' 
      });
      optionsClients = listClientes.value;

    } catch (error) {
      console.log(error)
    }
  }

  const onSubmit = async () => {
    if ( formVenta.value.customer_id == '' ) 
      return mostrarNotify('warning', 'Debes elegir algún cliente')
    if (rows.value.length == 0) 
      return mostrarNotify('warning', 'Debes agregar algun producto..');

    // formVenta.value.products = rows.value

    const authUserStore = useAuthUserStore();

    const { claim } = JWT.read( authUserStore.token )
    formVenta.value = { 
      ...formVenta.value, 
      ...valorFactura.value, 
      products: rows.value,
      user_id: claim.id
    }

    try {
      Dialog.create({
        title: '¿Deseas Generar esta venta?',
        ok: { push: true, label: 'Agregar' },
        cancel: { push: true, color: 'blue-grey-6', label: 'Cancelar' }
      }).onOk(async () => {
        Loading.show({message: 'Cargando...'});

        await api.post('/invoices', formVenta.value)

        Loading.hide();

        mostrarNotify('positive', 'Compra realizada exitosamente');

        router.push('/ventas');
      })
    } catch (error) {
      console.log(error);
      Loading.hide();
    }
  }

  const getNumFactura = async () => {
    numFacturaCargado.value = true;
    const { data } = await api.get('/CE/facturas/getNumFactura');

    formVenta.value.numero_comprobante = data.numComprobante;

    numFacturaCargado.value = false;
  }

  getClientes();
  getNumFactura();
  
  const filterFn = (val: string = '', update: any) => { //filtrar clientes
    if (val === '') 
      return update(() => { listClientes.value = optionsClients })
    
    update(() => {
      const needle = val!.toLowerCase();
      listClientes.value = listClientes.value.filter((v: any) =>
        v.num_doc.indexOf(needle) > -1 || v.label.toLowerCase().indexOf(needle) > -1          
      )
    })
  }
  
</script>

<template>
  <div class="q-ma-lg q-pt-md">
    <div class="row q-col-gutter-lg">
      <div class="col-xs-12 col-md-6 text-left">
        <label class="text-weight-medium"
        :class="[$q.screen.xs ? 'text-h6' : 'text-h5']">Fecha de Emisión:
          <span class="text-weight-regular">{{ fechaActual }}</span>
        </label>
      </div>
      <div class="col-xs-12 col-md-6" :class="[$q.screen.xs ? 'text-left' : 'text-right']">
        <label class="q-mr-lg text-weight-medium" :class="[$q.screen.xs ? 'text-h6' : 'text-h5']">
          <span class="q-mr-sm">N° Factura:</span>
          <q-spinner-facebook v-if="numFacturaCargado"
            color="primary" class="q-ml-md" size="2em" />
          <span v-else class="text-weight-regular">
            {{ formVenta.numero_comprobante }}
          </span>
        </label>
      </div>

      <div class="col-xs-9 col-md-6 q-mt-md">
        <label>Seleccionar Cliente: 
          <!-- <q-badge outline class="q-mb-lg" color="orange" label="Factura que superen los 50 USD no puede ser emitida a nombre del CONSUMIDOR FINAL" /> -->
        </label>
        <q-select color="orange" filled v-model="formVenta.customer_id"
          :options="listClientes" emit-value map-options dense
          @filter="filterFn" use-input input-debounce="0">

          <template v-if="formVenta.customer_id && formVenta.customer_id !== 'CONSUMIDOR FINAL'" v-slot:append>
            <q-icon name="cancel"
              @click.stop.prevent="formVenta.customer_id = 'CONSUMIDOR FINAL'" class="cursor-pointer" />
          </template>

          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey">
                No hay resultados
              </q-item-section>
            </q-item>
          </template>

        </q-select>
      </div>

      <div class="col-xs-2 col-md-4 q-mt-lg btnAddCliente q-pt-sm q-pl-xs">
        <q-btn round color="primary" size="13px" style="margin-top: 5px"
          @click="modalAgregarCliente = true"
          icon="person_add" />
      </div>
    </div>

    <div class="row q-mt-lg q-mb-xs">
      <div class="col-xs-12 col-md-6">
        <label>Filtrar por codigo de barra o nombre del producto:</label>
        <q-input outlined bottom-slots :loading="loadingState" dense
          v-model.trim="filterByCodBarra" @keyup.enter="filterArticulo('venta')">
          <template v-slot:append>
            <q-icon v-if="filterByCodBarra !== ''" name="close" @click="filterByCodBarra = ''"
            class="cursor-pointer" />
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
    </div>
  
    <q-form @submit="onSubmit">
      <div class="row">
        <div class="col-12">
          <q-table :rows="rows" :columns="columns" row-key="name" 
            :class="[$q.dark.isActive ? '' : 'my-sticky-header-table3']"
            :hide-pagination="true" :rows-per-page-options="[50]" >

            <template v-slot:no-data="{ }">
              <div class="full-width row flex-center text-lime-10 q-gutter-sm">
                <span class="text-subtitle1">
                  Agrega algún Producto
                </span>
                <q-icon size="2em" name="playlist_add" />
              </div>
            </template>

            <template v-slot:body-cell-cantidad="props">
              <q-td :props="props">
                  <q-input input-class="resaltarTextoInput" dense required 
                  @change="getSubtotalByProduct( props.row, 'ventas' )" min="0"
                  type="number" style="width: 100px;" v-model.trim="props.row.cantidad" />
              </q-td>
            </template>

            <template v-slot:body-cell-iva="props">
              <q-td :props="props">
                {{ props.row.aplicaIva ? 'SI' : 'NO' }}
              </q-td>
            </template>

            <template v-slot:body-cell-descuento="props">
              <q-td :props="props">
                {{ props.row.descuento }}%
              </q-td>
            </template>

            <template v-slot:body-cell-pvp="props">
              <q-td :props="props">
                ${{ props.row.pvp }}
              </q-td>
            </template>

            <template v-slot:body-cell-acciones="props">
              <q-td :props="props">
                <q-btn round color="deep-orange"
                @click="quitarArticulo(props.row.id)"
                icon="close" size="8px" />
              </q-td>
            </template>  

          </q-table>    
        </div>
        <div class="col-12" style="display: flex;justify-content: end;">
          <table :class="[!$q.screen.xs ? 'linearTablaDetalle' : '']">
            <tr class="text-right">
              <td><b>SUBTOTAL:</b></td>
              <td style="width: 90px;" class="text-subtitle1 text-weight-regular">
                ${{ valorFactura.subtotal }}
              </td>
            </tr>
            <tr class="text-right">
              <td class="q-py-sm"><b>IVA(12%):</b></td>
              <td style="width: 90px;" class="q-py-sm text-subtitle1 text-weight-regular">
                ${{ valorFactura.iva }}
              </td>
            </tr>
            <tr class="text-right">
              <td class="q-py-sm"><b>TOTAL DESCUENTO:</b></td>
              <td style="width: 90px;" class="q-py-sm text-subtitle1 text-weight-regular">
                ${{ valorFactura.descuento }}
              </td>
            </tr>
            <tr class="text-right">
              <td><b>TOTAL DE VENTA:</b></td>
              <td style="width: 90px;">
                <q-badge outline class="text-subtitle1 text-weight-bold"
                    color="secondary" :label="`$${ valorFactura.total }`" />
              </td>
            </tr>
          </table>
        </div>
        <div class="col-md-4 offset-4" :class="[$q.screen.xs ? 'q-mt-md' : '']">
          <q-btn square color="green-10" type="submit" label="Agregar Venta"
            class="full-width" icon="shopping_cart" />
        </div>
      </div>
    </q-form>
    
  </div>
  
  <!-- AGREGAR UN NUEVO CLIENTE -->
  <q-dialog v-model="modalAgregarCliente">
    <AddCliente />
  </q-dialog>

  <!-- BUSCAR ALGUN PRODUCTO -->
  <q-dialog v-model="modalSelectProducto">
    <SelectProduct :listProductos="listProductos" @agregarProduct="agregarProduct" />
  </q-dialog>
  
</template>
  
<style>
  .linearTablaDetalle{
    margin-right: 0px;
    margin-top: 8px;
  }
  #labelNV{
    font-size: 25px;
    font-weight: 500;
    margin-left: 10px;
  }
  .btnAddCliente{
    margin-top: 48px;
    margin-left: 20px;
  }
  .resaltarTextoInput{
    font-size: 17px;
    text-align: center;
    color: #313131;
    font-weight: 500;
  }
  .my-sticky-header-table3 .q-table__top,
  .my-sticky-header-table3 thead tr:first-child th {
    /* bg color is important for th; just specify one */
    background-color: #3d403d;
    color: rgb(245, 241, 241);
  }
  .my-sticky-header-table3 tbody tr:nth-child(even) {
      background-color: rgb(243, 235, 245);
  }
</style>
  