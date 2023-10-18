<script setup lang="ts">
  import { useProduct } from "../composables/useProducts";

  const props = defineProps<{ edit: boolean }>();

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
          <label>Codigo Barra / Serial:</label>
          <q-input v-model="formProduct.codigoBarra" 
            counter maxlength="15"
            @keyup="allowOnlyNumber" 
            dense filled required />
        </div>

        <div class="col-xs-12 col-sm-6">
          <label>Nombre Producto:</label>
          <q-input v-model.trim="formProduct.nombre" @keyup="transformToUpperCase" dense filled required />
        </div>

        <div class="col-xs-12 col-sm-3">
          <label>Precio de Compra:</label>
          <q-input type="number" v-model.trim="formProduct.precio_compra" 
            min="0"
            input-class="resaltarTextoInput"
            step=".01"
            @keyup="validDecimal('pvm')"
            dense filled required />
        </div>

        <div class="col-xs-12 col-sm-3">
          <label>PVP:</label>
          <q-input v-model.trim="formProduct.pvp" type="number" 
            min="0"
            input-class="resaltarTextoInput"
            step=".01"
            @keyup="validDecimal('pvp')"
            dense filled required />
        </div>

        <div class="col-xs-12 col-sm-3">
          <label>Aplica IVA:</label>
          <q-select v-model="formProduct.aplicaIva" filled dense required emit-value map-options
            :options="[{ label: 'SI', value: true }, { label: 'NO', value: false }]">
          </q-select>
        </div>

        <div class="col-xs-12 col-sm-4">
          <label>Descuento(%):</label>
          <q-input v-model="formProduct.descuento" 
            input-class="resaltarTextoInput"
            @keyup="allowOnlyNumber" 
            dense filled required />
        </div>

        <div class="col-xs-12 col-sm-4">
          <label>Stock:</label>
          <q-input v-model="formProduct.stock" 
            input-class="resaltarTextoInput"
            @keyup="allowOnlyNumber" dense filled required />
        </div>

        <div class="col-xs-9 col-sm-12 q-mt-lg q-mb-md flex justify-center">
          <q-btn label="Guardar" :loading="loading"
            class="q-px-xl" type="submit" color="green-9"/>
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