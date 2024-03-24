<script setup lang="ts">
  import { ref, watch, onBeforeUnmount } from 'vue';
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

  const {
    agregarAndValidarStock,
    claim,
    filterByCodBarra,
    columns,
    rows,
    filterArticulo,
    modalSelectProducto,
    getSubtotalByProduct,
    loadingState,
    listProductos,
    quitarArticulo,
    sucursal_selected,
    valorFactura
  } = useProduct();
  let { actualizarLista } = useProveedor();

  let optionsProveedores: any = []
  const listProveedores: any  = ref([]);
  const modalAgregarProveedor = ref(false);
  const { mostrarNotify }     = useHelpers();
  const sucursales            = ref([]);

  const formCompras: any = ref({
    proveedor_id: '',
    numero_comprobante: '',
    descripcion: '',
    inputDate: date.formatDate(Date.now(), 'YYYY/MM/DD')
  });

  const router = useRouter();

  const agregarProduct = ( product: Product ) => {
    agregarAndValidarStock( product, 'compras' )
    modalSelectProducto.value = false
  }

  const getSucursales = async( company_id: string ) => {
    sucursales.value = [];

    const { data } = await api.get(`/sucursal/find/${ company_id }/company`);

    data.forEach(( x: any) => {
      sucursales.value.push({ label: x.nombre, value: x.id })
    })
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
    let existeError = false;
    if ( formCompras.value.proveedor_id == '' )
      return mostrarNotify('warning', 'Debes elegir algun proveedor')
    if ( formCompras.value.numero_comprobante == '' )
      return mostrarNotify('warning', 'Por favor ingresa el numero de comprobante')
    if ( formCompras.value.descripcion == '' )
      return mostrarNotify('warning', 'Por favor ingresa una descripción')
    if ( (claim.roles[0] == 'SUPER-ADMINISTRADOR' || claim.roles[0] == 'ADMINISTRADOR')
          && sucursal_selected.value == '' )
      return mostrarNotify('warning', 'Debes seleccionar una sucursal');
    if (rows.value.length == 0)
      return mostrarNotify('warning', 'Debes agregar algun producto..');

    rows.value.forEach((row, index) => {
      if (row.cantidad <= 0) {
        mostrarNotify('warning', `Agrega una cantidad cantidad al producto: ${ row.nombre } de la fila: ${ index + 1 }`);
        existeError = true;
      }
    });

    if (existeError) return;

    formCompras.value.products = rows.value

    formCompras.value = {
      ...formCompras.value,
      ...valorFactura.value,
      fecha_compra: date.formatDate(formCompras.value.inputDate, 'DD/MM/YYYY'),
      user_id: claim.id
    }

    Dialog.create({
      title: '¿Deseas agregar esta compra?',
      ok: { push: true, color: 'cyan-10', label: 'Agregar' },
      cancel: { push: true, color: 'blue-grey-6', label: 'Cancelar' }
    }).onOk(async () => {
      try {
        Loading.show({message: 'Cargando...'});

        let headers = { headers: { sucursal_id: sucursal_selected.value } };

        await api.post('/buys', formCompras.value, headers)

        Loading.hide();

        mostrarNotify('positive', 'Compra realizada exitosamente');

        router.push('/compras');
      } catch (error: any) {
        mostrarNotify('warning', error.response.data.message);
        Loading.hide();
      }
    })
  }

  if ( claim.roles[0] == 'SUPER-ADMINISTRADOR' || claim.roles[0] == 'ADMINISTRADOR' )
    getSucursales( claim.company.id );

  getProveedores();

  const filtrarProveedores = (val: string = '', update: any) => {
    if (val === '')
      return update(() => { listProveedores.value = optionsProveedores })

    update(() => {
      const needle = val!.toLowerCase();
      listProveedores.value = listProveedores.value.filter((v: any) =>
        v.num_doc.indexOf(needle) > -1 || v.label.toLowerCase().indexOf(needle) > -1
      )
    })
  }

  const buscarProducto = () => {
    if ( (claim.roles[0] == 'SUPER-ADMINISTRADOR' || claim.roles[0] == 'ADMINISTRADOR') && sucursal_selected.value.length == 0 ) {
      return mostrarNotify('warning', 'Elige una sucursal primeramente');
    }else{
      filterArticulo('compras')
    }
  }

  onBeforeUnmount(() => {
    rows.value = [];
  })

</script>

<template>

  <div class="q-ma-lg q-pt-md q-mb-none" style="margin-bottom: 10px;">
    <div class="row q-col-gutter-lg">
      <div class="col-xs-12 col-md-6" :class="[ $q.screen.width < 1022 ? 'q-pt-sm' : '']">
        <q-breadcrumbs class="row q-mr-xs"
          :class="[ $q.screen.width < 1022 ? 'justify-center q-pt-sm' : 'justify-start ']">
          <q-breadcrumbs-el label="Inicio" icon="home" to="/" />
          <q-breadcrumbs-el label="Compras" icon="shopping_cart" to="/compras" />
          <q-breadcrumbs-el label="Agregar Compra" icon="add_circle" />
        </q-breadcrumbs>
      </div>

      <div class="col-xs-12 col-md-6"
        :class="[ $q.screen.width < 1022 ? 'text-center q-pt-sm' : 'text-right']">
        <label class="text-h6 text-center">Nueva Compra</label>
      </div>
    </div>
  </div>

  <div class="row q-pt-none q-mx-lg q-col-gutter-md">
    <div class="col-xs-12 col-md-5 q-mt-lg q-pl-none">
      <label>Seleccionar Proveedor: </label>
      <q-select color="orange" filled v-model="formCompras.proveedor_id" dense
        :options="listProveedores" emit-value map-options
        @filter="filtrarProveedores" use-input input-debounce="0">

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

    <div class="col-xs-12 col-md-3"
      :class="$q.screen.width <= 1023 ? 'q-pl-none' : 'q-mt-lg'">
      <label>Numero de Comprobante: </label>
      <q-input v-model="formCompras.numero_comprobante"
        :input-style="{textAlign: 'center', fontSize: '16px'}"
        filled mask="###-###-#########" fill-mask dense required />
    </div>

    <div class="col-xs-12 col-md-4"
      :class="$q.screen.width <= 1023 ? 'q-pl-none' : 'q-mt-lg'">
      <label>Fecha de compra: </label>
      <q-input filled dense v-model="formCompras.inputDate"
      :input-style="{textAlign: 'center'}"
        mask="date" :rules="['date']">
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

    <div v-if="claim.roles[0] == 'SUPER-ADMINISTRADOR' || claim.roles[0] == 'ADMINISTRADOR'"
      class="col-xs-12 col-md-5 q-ml-none q-pl-none"
      :class="$q.screen.width >= 1023 || 'q-pt-none'">
      <label>Seleccionar Sucursal:
      </label>
      <q-select filled v-model="sucursal_selected"
        @update:model-value="rows = []"
        :options="sucursales" emit-value map-options dense>
        <template v-slot:no-option>
          <q-item>
            <q-item-section class="text-grey">
              No se encontro sucursal
            </q-item-section>
          </q-item>
        </template>
      </q-select>
    </div>

    <div v-if="claim.roles[0] !== 'SUPER-ADMINISTRADOR' && claim.roles[0] !== 'ADMINISTRADOR' && $q.screen.width >= 1023"
      class="col-xs-12 col-md-5 q-pl-none">
      <label>Filtrar por codigo de barra o nombre del producto:</label>
      <q-input outlined bottom-slots :loading="loadingState" dense
        v-model.trim="filterByCodBarra" @keyup.enter="buscarProducto">
        <template v-slot:append>
          <q-icon v-if="filterByCodBarra !== ''" name="close" @click="filterByCodBarra = ''"
          class="cursor-pointer" />
          <q-icon name="search" />
        </template>
      </q-input>
    </div>

    <div class="col-xs-12 col-sm-12 col-md-7"
      :class="$q.screen.width <= 1023 ? 'q-pl-none q-pt-sm' : 'q-pt-md'">
      <label>Descripción: </label>
      <q-input v-model.trim="formCompras.descripcion" dense filled required />
    </div>

    <div v-if="claim.roles[0] == 'SUPER-ADMINISTRADOR' || claim.roles[0] == 'ADMINISTRADOR'"
      class="col-xs-12 col-md-5 q-pl-none">
      <label>Filtrar por codigo de barra o nombre del producto:</label>
      <q-input outlined bottom-slots :loading="loadingState" dense
        v-model.trim="filterByCodBarra" @keyup.enter="buscarProducto">
        <template v-slot:append>
          <q-icon v-if="filterByCodBarra !== ''" name="close" @click="filterByCodBarra = ''"
          class="cursor-pointer" />
          <q-icon name="search" />
        </template>
      </q-input>
    </div>
  </div>

  <div v-if="claim.roles[0] !== 'SUPER-ADMINISTRADOR' && claim.roles[0] !== 'ADMINISTRADOR' && $q.screen.width <= 1023"
    class="row q-pt-lg q-mx-lg"
    :class="[$q.screen.width <= 1023 ? 'justify-center' : 'justify-left q-ml-md']">
    <div class="col-xs-12 col-md-5">
      <label>Filtrar por codigo de barra o nombre del producto: </label>
      <q-input outlined bottom-slots :loading="loadingState" dense
        v-model.trim="filterByCodBarra" @keyup.enter="buscarProducto">
        <template v-slot:append>
          <q-icon v-if="filterByCodBarra !== ''" name="close" @click="filterByCodBarra = ''"
          class="cursor-pointer" />
          <q-icon name="search" />
        </template>
      </q-input>
    </div>
  </div>

  <q-form @submit="onSubmit">
    <div class="row q-mx-lg justify-center"
      :class="$q.screen.xs ? 'q-mt-lg' : 'q-mt-md'">
      <div class="col-12">
        <q-table :rows="rows" :columns="columns" row-key="name"
          :hide-pagination="true" :rows-per-page-options="[50]"
          :class="[$q.dark.isActive ? '' : 'my-sticky-header-table3']">

          <template v-slot:no-data="{  }">
            <div class="full-width row flex-center text-lime-10 q-gutter-sm">
              <span class="text-subtitle1">
                Agrega algún producto
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

      <div class="col-12"
        style="display: flex;justify-content: end;">
        <table :class="[!$q.screen.xs ? 'linearTablaDetalle' : 'q-pt-sm']">
          <tr class="text-right">
            <td><b>SUBTOTAL:</b></td>
            <td style="width: 50px;" class="text-subtitle1 text-weight-regular">
              ${{ valorFactura.subtotal }}
            </td>
          </tr>
          <tr class="text-right">
            <td><b>IVA(12%):</b></td>
            <td style="width: 50px;" class="text-subtitle1 text-weight-regular">
              ${{ valorFactura.iva }}
            </td>
          </tr>
          <tr class="text-right">
            <td><b>TOTAL DESCUENTO:</b></td>
            <td style="width: 50px;" class="text-subtitle1 text-weight-regular">
              ${{ valorFactura.descuento }}
            </td>
          </tr>
          <tr class="text-right">
            <td><b>TOTAL DE COMPRA:</b></td>
            <td style="width: 50px;">
              <q-badge outline class="text-subtitle1 text-weight-bold"
                  color="secondary" :label="`$${ valorFactura.total }`" />
            </td>
          </tr>
        </table>
      </div>

      <div class="col-12 flex q-mt-md q-pb-md"
        :class="[ $q.screen.width < 600
                ? 'justify-center' : 'justify-between']">

        <q-btn v-if="$q.screen.width > 600" icon="arrow_back" @click="$router.push('/compras')"
          outline rounded class="q-mr-lg"
          :color="!$q.dark.isActive ? 'blue-grey-10' : 'blue-grey-2'">
          &nbsp; Regresar
        </q-btn>

        <q-btn type="submit" icon="save" outline rounded
          :class="$q.screen.width < 600 ? 'q-px-xl' : 'q-px-lg'"
          style="color: #696cff">
          &nbsp; Guardar
        </q-btn>
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
