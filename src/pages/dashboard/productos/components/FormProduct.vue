<script setup lang="ts">
  import { computed, ref } from 'vue';
  import { useProduct } from "../composables/useProducts";
  import { IVA_OPCIONES, ICE_OPCIONES, CODIGOS_ICE } from "src/utils/impuestos";
  import { resaltarCoincidencia } from "src/utils/resaltar-busqueda";

  const props = defineProps<{ edit: boolean }>();
  const listSucursales: any = ref([]);

  const {
    claim,
    api,
    mostrarNotify,
    selectSucursal,
    formProduct,
    allowOnlyNumber,
    validDecimal,
    onSubmit,
    loading
  } = useProduct();

  const esAdmin = ['SUPER-ADMINISTRADOR', 'ADMINISTRADOR'].includes( claim.roles[0] );

  /**
   * El selector solo tiene sentido cuando hay algo que elegir: con una sola
   * sucursal activa ya viene resuelta y el campo estorba.
   */
  const debeElegirSucursal = computed(() => esAdmin && listSucursales.value.length > 1 );

  const getSucursales = async () => {
    try {
      const { data } = await api.get(`/sucursal/find/${ claim.company.id }/company`);

      // El endpoint devuelve también las inactivas: no tiene sentido ofrecerlas
      // como destino de un producto nuevo.
      data
        .filter(( x: any ) => x.isActive !== false )
        .forEach(( x: any ) => {
          listSucursales.value.push({ label: x.nombre, value: x.id })
        });

      if ( listSucursales.value.length === 1 )
        selectSucursal.value = listSucursales.value[0].value;

    } catch (error: any){
      mostrarNotify( 'warning', 'No se puedo cargar las sucursales' )
    }
  }

  if ( esAdmin )
    getSucursales();
  else
    selectSucursal.value = claim.sucursales[0]

  // El código de ICE es una lista larga: se filtra escribiendo, como en ISPMAX.
  const codigosIce = ref([ ...CODIGOS_ICE ]);

  // Se guarda el término para poder resaltarlo en las opciones.
  const terminoIce = ref('');

  const filtrarCodigoIce = ( val: string, update: any ) => {
    terminoIce.value = val;

    if ( val === '' )
      return update(() => { codigosIce.value = [ ...CODIGOS_ICE ] })

    update(() => {
      const needle = val.toLowerCase();
      codigosIce.value = CODIGOS_ICE.filter(( c ) => c.label.toLowerCase().indexOf( needle ) > -1 )
    })
  }

  const aplicaIce = computed(() => ['tarifa', 'valor'].includes( formProduct.value.ice ?? '' ));

  // Al pasar a "No aplica" se limpian los campos dependientes para no dejar un
  // valor huérfano que después viaje al SRI.
  const onCambioIce = () => {
    if ( aplicaIce.value ) return;

    formProduct.value.valor_ice = null;
    formProduct.value.tipo_ice  = null;
  }

</script>

<template>
    <q-form @submit="onSubmit( props.edit )">
      <div class="row q-pt-lg q-col-gutter-x-md q-col-gutter-y-md q-px-md">

        <div class="col-xs-12 col-sm-4">
          <label>Codigo / Serial:</label>
          <q-input v-model="formProduct.codigoBarra"
            counter maxlength="20"
            dense outlined required />
        </div>

        <div class="col-xs-12 col-sm-8">
          <label>Nombre:</label>
          <q-input v-model.trim="formProduct.nombre"
            counter maxlength="300"
            dense outlined required />
        </div>

        <div class="col-xs-12 col-sm-4">
          <label>Precio de Compra:</label>
          <q-input type="number" v-model.trim="formProduct.precio_compra"
            min="0" input-class="resaltarTextoInput"
            step=".01" @keyup="validDecimal('pvm')"
            dense outlined />
        </div>

        <div class="col-xs-12 col-sm-4">
          <label>PVP:</label>
          <q-input v-model.trim="formProduct.pvp" type="number"
            min="0" input-class="resaltarTextoInput"
            step=".01" @keyup="validDecimal('pvp')"
            dense outlined required />
        </div>

        <div class="col-xs-12 col-sm-4">
          <label>Tipo:</label>
          <q-select v-model="formProduct.tipo" outlined dense required
            :options="['Producto', 'Servicio']" />
        </div>

        <div class="col-xs-12 col-sm-4">
          <label>Impuesto IVA:</label>
          <q-select v-model="formProduct.impuesto" outlined dense required
            emit-value map-options :options="IVA_OPCIONES" />
        </div>

        <div class="col-xs-12 col-sm-4">
          <label>Descuento($):</label>
          <q-input :type="$q.platform.is.mobile ? 'number' : 'text'"
            v-model="formProduct.descuento"
            input-class="resaltarTextoInput"
            @keyup="allowOnlyNumber"
            dense outlined required />
        </div>

        <div class="col-xs-12 col-sm-4">
          <label>ICE:</label>
          <q-select v-model="formProduct.ice" outlined dense
            emit-value map-options :options="ICE_OPCIONES"
            @update:model-value="onCambioIce" />
        </div>

        <template v-if="aplicaIce">
          <div class="col-xs-12 col-sm-3">
            <label>Valor Ice:</label>
            <q-input v-model="formProduct.valor_ice"
              type="text" inputmode="decimal"
              input-class="resaltarTextoInput"
              dense outlined required>

              <template v-if="formProduct.ice === 'valor'" v-slot:prepend>
                <q-icon name="attach_money" />
              </template>

              <template v-if="formProduct.ice === 'tarifa'" v-slot:append>
                <label style="font-size: 20px;">%</label>
              </template>
            </q-input>
          </div>

          <div class="col-xs-12 col-sm-9">
            <label>Codigo Ice:</label>
            <q-select v-model="formProduct.tipo_ice" outlined dense
              :rules="[ val => !!val || 'Elige un código de ICE' ]"
              emit-value map-options :options="codigosIce"
              @filter="filtrarCodigoIce" use-input input-debounce="0"
              popup-content-class="opciones-producto">

              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section>
                    <q-item-label>
                      <span v-html="resaltarCoincidencia(scope.opt.label, terminoIce)"></span>
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>
        </template>

        <div v-if="debeElegirSucursal" class="col-xs-12 col-sm-6">
          <label>Sucursal:</label>
          <q-select outlined dense v-model="selectSucursal"
            emit-value map-options :options="listSucursales" />
        </div>

        <div class="col-xs-12 q-mt-lg q-mb-md flex justify-center">
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
