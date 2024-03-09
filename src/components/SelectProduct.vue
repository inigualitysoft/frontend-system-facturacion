<script setup lang="ts">
  import { ref, emit } from 'vue'
  import { Product } from '../pages/dashboard/productos/composables/useProducts';
  import { useProduct } from "../composables/useProduct.ts";

  const columns: any = [
    { name: 'add', label: 'Agregar' },
    { name: 'codigoBarra', label: 'Codigo Barra', align: 'left', field: 'codigoBarra' },
    { name: 'producto', label: 'Producto', align: 'left', field: 'nombre' },
    { name: 'stock', label: 'Stock', align: 'center', field: 'stock' },
    { name: 'aplicaIva', label: 'Aplica IVA', align: 'center', field: 'aplicaIva' },
    { name: 'stock', label: 'Stock', align: 'center', field: 'stock' },
    { name: 'pvm', label: 'Precio de Compra', align: 'center', field: 'pvm' },
    { name: 'sucursal', label: 'Sucursal', align: 'center', field: 'sucursal' },
  ]

  const props = defineProps<{ listProductos: any }>();
  const emit  = defineEmits(['agregarProduct']);
  const { claim, sucursal_selected } = useProduct();

  let sucursal_user;
  if ( claim.roles[0] == 'ADMINISTRADOR' || claim.roles[0] == 'SUPER-ADMINISTRADOR') 
    sucursal_user = sucursal_selected.value
  else
    sucursal_user = claim.sucursales[0]
  
  const rows = ref<Product[]>([]);
  const tipo = props.listProductos.tipo
  
  rows.value = props.listProductos.data;

</script>

<template>
    <q-card style="width: 1040px; max-width: 80vw;">
      <q-card-section class="q-pb-none">
        <div class="text-h6 text-center">Selecciona un producto</div>
      </q-card-section>
  
      <q-card-section>
        <div class="row q-gutter-sm">
         
          <div class="col-xs-12 col-sm-12 q-my-sm">
            <q-table :class="[!$q.dark.isActive ? 'my-sticky-header-table2' : '']" :rows="rows"
              :columns="columns" hide-bottom row-key="name">
  
              <template v-slot:body-cell-add="props">
                <q-td :props="props">
                  <q-btn v-if="sucursal_user == props.row.sucursal_id.id"
                    round color="green-9" class="q-ml-md" size="sm" 
                    @click="emit('agregarProduct', props.row)" icon="fa-solid fa-plus" />
                  
                  <q-icon v-else color="red-9" class="q-ml-md" size="sm"
                    name="fa-solid fa-ban" />
                </q-td>
              </template>
  
              <template v-slot:body-cell-descuento="props">
                <q-td :props="props">
                    {{ props.row.descuento }}%
                </q-td>
              </template>
  
              <template v-slot:body-cell-aplicaIva="props">
                <q-td :props="props">
                  {{ props.row.aplicaIva ? 'SI' : 'NO' }}
                </q-td>
              </template>

              <template v-slot:body-cell-pvp="props">
                <q-td :props="props">${{ props.row.pvp.toFixed(2) }}</q-td>
              </template>
  
              <template v-slot:body-cell-pvm="props">
                <q-td :props="props">${{ props.row.precio_compra }}</q-td>
              </template>

              <template v-slot:body-cell-sucursal="props">
                <q-td :props="props">{{ props.row.sucursal_id.nombre }}</q-td>
              </template>
  
              <template v-slot:loading>
                <q-inner-loading showing color="primary" />
              </template>

            </q-table>
          </div>  
        </div>
      </q-card-section>
    </q-card>
</template>
  
<style>
  .my-sticky-header-table2 .q-table__top,
  .my-sticky-header-table2 .q-table__bottom,
  .my-sticky-header-table2 thead tr:first-child th {
    /* bg color is important for th; just specify one */
    background-color: #3d403d;
    color: rgb(245, 241, 241);
  }
  
  .my-sticky-header-table2 tbody tr:nth-child(even) {
      background-color: rgb(240, 240, 240);
  }
</style>
  