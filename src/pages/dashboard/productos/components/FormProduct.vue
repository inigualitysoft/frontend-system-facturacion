<script setup lang="ts">
  import { useProduct } from "../composables/useProducts";
  import { ref } from 'vue';

  const props = defineProps<{ edit: boolean }>();
  const listSucursales: any = ref([]);
  const { claim, api, mostrarNotify, selectSucursal } = useProduct();

  const getSucursales = async () => {
    try {
      const { data } = await api.get(`/sucursal/find/${ claim.company.id }/company`);
      data.forEach((companie: any) => {
        listSucursales.value.push({
          label:  companie.nombre,
          value:  companie.id
        })
      });
    } catch (error: any){
      mostrarNotify( 'warning', 'No se puedo cargar las sucursales' )
    }
  }

  getSucursales();

  const {
    formProduct,
    allowOnlyNumber,
    transformToUpperCase,
    validDecimal,
    onSubmit,
    loading
  } = useProduct();

</script>

<template>
    <q-form @submit="onSubmit( props.edit )">
      <div class="row q-pt-lg q-gutter-lg justify-center">

        <div class="col-xs-12 col-sm-5">
          <label>Codigo / Serial:</label>
          <q-input v-model="formProduct.codigoBarra"
            @keyup="allowOnlyNumber"
            dense filled required />
        </div>

        <div class="col-xs-12 col-sm-5">
          <label>Nombre:</label>
          <q-input v-model.trim="formProduct.nombre" @keyup="transformToUpperCase" dense filled required />
        </div>

        <div class="col-xs-12 col-sm-5">
          <label>Precio de Compra:</label>
          <q-input type="number" v-model.trim="formProduct.precio_compra"
            min="0" input-class="resaltarTextoInput"
            step=".01" @keyup="validDecimal('pvm')"
            dense filled />
        </div>

        <div class="col-xs-12 col-sm-5">
          <label>PVP:</label>
          <q-input v-model.trim="formProduct.pvp" type="number"
            min="0" input-class="resaltarTextoInput"
            step=".01" @keyup="validDecimal('pvp')"
            dense filled required />
        </div>

        <div class="col-xs-12 col-sm-5">
          <label>Aplica IVA:</label>
          <q-select v-model="formProduct.aplicaIva" filled dense required emit-value map-options
            :options="[{ label: 'SI', value: true }, { label: 'NO', value: false }]">
          </q-select>
        </div>

        <div class="col-xs-12 col-sm-5">
          <label>Descuento(%):</label>
          <q-input :type="$q.platform.is.mobile ? 'number' : 'text'"
            v-model="formProduct.descuento"
            input-class="resaltarTextoInput"
            @keyup="allowOnlyNumber"
            dense filled required />
        </div>

        <div class="col-xs-12 col-sm-5">
          <label>Tipo:</label>
          <q-select v-model="formProduct.tipo" filled dense required
            :options="['Producto', 'Servicio']">
          </q-select>
        </div>

        <div v-if="claim.roles[0] == 'SUPER-ADMINISTRADOR' || claim.roles[0] == 'ADMINISTRADOR'"
          class="col-xs-12 col-sm-5">
          <label>Sucursal:</label>
          <q-select filled dense v-model="selectSucursal"
            emit-value map-options :options="listSucursales">
          </q-select>
        </div>

        <div class="col-xs-9 col-sm-12 q-mt-lg q-mb-md flex justify-center">
          <q-btn type="submit" icon="save" :loading="loading"
            outline rounded class="q-px-xl" style="color: #696cff">
            &nbsp; Guardar Cambios
          </q-btn>
        </div>

      </div>
    </q-form>
</template>


<style>
.resaltarTextoInput{
  font-size: 18px;
  text-align: center;
  color: #313131;
  font-weight: 500;
}
.centrarTextoInput{
  text-align: center;
}
</style>