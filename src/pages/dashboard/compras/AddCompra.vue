<script setup lang="ts">
  import { ref, watch } from 'vue';
  import { api } from "boot/axios";
  import { useRouter } from "vue-router";
  import useHelpers from "../../../composables/useHelpers";
  import { date, Dialog, Loading } from 'quasar'
  import { Proveedor } from '../proveedores/composables/useProveedor';
  import AddProveedor from '../proveedores/AddProveedor.vue'
  import SelectProduct from '../../../components/SelectProduct.vue'
  import { Product } from '../productos/composables/useProducts';
  import { useProduct } from "../../../composables/useProduct";
  import { useProveedor } from "../proveedores/composables/useProveedor";
  import { useAuthUserStore } from "stores/auth-user"
  import JWT from 'jwt-client'

  const { 
    agregarAndValidarStock, 
    filterByCodBarra, 
    columns, 
    rows, 
    filterArticulo, 
    modalSelectProducto,
    getSubtotalByProduct,
    loadingState,
    listProductos,
    quitarArticulo,
    valorFactura
  } = useProduct();
  let { actualizarLista } = useProveedor();

  let optionsProveedores: any = []
  const listProveedores: any = ref([]);
  const modalAgregarProveedor = ref(false);
  const { mostrarNotify } = useHelpers();

  const formCompras: any = ref({
    proveedor_id: '',
    numero_comprobante: '',
    descripcion: '',
    inputDate: date.formatDate(Date.now(), 'YYYY/MM/DD')
  });

  const router = useRouter();

  const agregarProduct = ( product: Product ) => {
    agregarAndValidarStock( product )
    modalSelectProducto.value = false
  }

  watch(actualizarLista, (currentValue, _) => {
    if ( currentValue ) getProveedores(); 
  });
  const getProveedores = async () => {
    modalAgregarProveedor.value = false;
    try {
      const { data: proveedores } = await api.get('/providers/true');
      listProveedores.value = [];

      proveedores.forEach((proveedor: Proveedor) => {
        listProveedores.value.push({
          label: proveedor.razon_social,
          value: proveedor.id,
          num_doc: proveedor.numero_documento
        })
      });

      optionsProveedores = listProveedores.value;
    } catch (error) {
      console.log(error)
    }
  }

  const onSubmit = async () => {
    if ( formCompras.value.proveedor_id == '' ) 
      return mostrarNotify('warning', 'Debes elegir algun proveedor')
    if ( formCompras.value.numero_comprobante == '' ) 
      return mostrarNotify('warning', 'Por favor ingresa el numero de comprobante')
    if ( formCompras.value.descripcion == '' ) 
      return mostrarNotify('warning', 'Por favor ingresa una descripción')    
    if (rows.value.length == 0) 
      return mostrarNotify('warning', 'Debes agregar algun producto..');

    formCompras.value.products = rows.value

    const authUserStore = useAuthUserStore();
    const { claim } = JWT.read( authUserStore.token )

    formCompras.value = { 
      ...formCompras.value, 
      ...valorFactura.value, 
      fecha_compra: date.formatDate(formCompras.value.inputDate, 'YYYY-MM-DD'),
      user_id: claim.id
    }

    Dialog.create({
      title: '¿Deseas Agregar esta Compra?',
      ok: { push: true, label: 'Agregar' },
      cancel: { push: true, color: 'blue-grey-6', label: 'Cancelar' }
    }).onOk(async () => {
      try {
        Loading.show({message: 'Cargando...'});

        await api.post('/buys', formCompras.value)

        Loading.hide();

        mostrarNotify('positive', 'Compra realizada exitosamente');
        
        router.push('/compras');          
      } catch (error) {
        mostrarNotify('warning', error.response.data.message[0]);
        Loading.hide();
      }
    })
  }

  getProveedores();

  const filterFn = (val: string = '', update: any) => {
    if (val === '') 
      return update(() => { listProveedores.value = optionsProveedores })
    
    update(() => {
      const needle = val!.toLowerCase();
      listProveedores.value = listProveedores.value.filter((v: any) =>
        v.num_doc.indexOf(needle) > -1 || v.label.toLowerCase().indexOf(needle) > -1          
      )
    })
  }
  
</script>

<template>
  
  <div class="row q-pt-lg q-gutter-md justify-center">
    <div class="col-xs-10 col-md-5 q-mt-lg">
      <label>Seleccionar Proveedor: </label>
      <q-select color="orange" filled v-model="formCompras.proveedor_id" dense
        :options="listProveedores" emit-value map-options
        @filter="filterFn" use-input input-debounce="0">

        <template v-slot:append>
          <q-btn round dense flat icon="person_add" @click.stop.prevent="modalAgregarProveedor = true" />
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

    <div class="col-xs-10 col-md-3 q-mt-lg">
      <label>Numero de Comprobante: </label>
      <q-input v-model="formCompras.numero_comprobante" dense filled required />
    </div>

    <div class="col-xs-10 col-md-3 q-mt-lg q-ml-md">
      <label>Fecha de compra: </label>
      <q-input filled dense v-model="formCompras.inputDate" mask="date" :rules="['date']">
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-date v-model="formCompras.inputDate">
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Close" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
    </div>

    <div class="col-xs-10 col-md-5">
      <label>Filtrar por codigo de barra o nombre del producto:</label>
      <q-input outlined bottom-slots :loading="loadingState" dense
        v-model.trim="filterByCodBarra" @keyup.enter="filterArticulo">
  
        <template v-slot:append>
          <q-icon v-if="filterByCodBarra !== ''" name="close" @click="filterByCodBarra = ''"
          class="cursor-pointer" />
          <q-icon name="search" />
        </template>  
      </q-input>
    </div>  
    
    <div class="col-xs-10 col-md-6">
      <label>Descripción: </label>
      <q-input v-model.trim="formCompras.descripcion" dense filled required />
    </div>
    
  </div>

  <q-form @submit="onSubmit">
    <div class="row q-ma-lg q-pt-md justify-center">
      <div class="col-xs-11 col-md-12">
        <q-table :rows="rows" :columns="columns" row-key="name" 
          :hide-pagination="true" :rows-per-page-options="[50]"
          :class="[$q.dark.isActive ? '' : 'my-sticky-header-table3']">

          <template v-slot:no-data="{  }">
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
                @change="getSubtotalByProduct( props.row )" min="0"
                type="number" style="width: 100px;" v-model.trim="props.row.cantidad" />
            </q-td>
          </template>

          <template v-slot:body-cell-iva="props">
            <q-td :props="props">
              <q-checkbox v-model="props.row.aplicaIva" />
            </q-td>
          </template>

          <template v-slot:body-cell-descuento="props">
            <q-td :props="props">
              <q-input input-class="resaltarTextoInput" dense required min="0"
                @change="getSubtotalByProduct( props.row )" 
                type="number" style="width: 100px;" v-model.trim="props.row.descuento" />
            </q-td>
          </template>

          <template v-slot:body-cell-pvm="props">
            <q-td :props="props">
              ${{ props.row.precio_compra }}
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
      <div class="col-xs-11 col-md-12" style="display: flex;justify-content: end;">
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
            <td><b>TOTAL DE COMPRA:</b></td>
            <td style="width: 90px;">
              <q-badge outline class="text-subtitle1 text-weight-bold"
                  color="secondary" :label="`$${ valorFactura.total }`" />
            </td>
          </tr>
        </table>
      </div>
      <div class="col-md-4 offset-4">
        <q-btn square color="green-10" type="submit" label="Agregar Compra"
          class="full-width" icon="shopping_cart" />
      </div>
    </div>
  </q-form>

  <!-- AGREGAR UN NUEVO PROVEEDOR -->
  <q-dialog v-model="modalAgregarProveedor">
    <AddProveedor />
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
  