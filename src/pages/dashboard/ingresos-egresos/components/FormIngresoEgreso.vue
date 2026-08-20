<script setup>
  import { computed } from 'vue';
  import { useIngresoEgreso } from '../composables/useIngresoEgreso';

  const {
    formIE,
    editando,
    loading,
    listProveedores,
    listSucursales,
    listFormasPago,
    onSubmit
  } = useIngresoEgreso();

  const esEgreso = computed(() => formIE.value.tipo === 'egreso');

  const soloNumeros = () => {
    // Se admite un solo punto decimal: el input es de texto para no heredar las
    // flechas ni el scroll del type=number.
    formIE.value.monto = String( formIE.value.monto )
      .replace(/[^\d.]/g, '')
      .replace(/(\..*)\./g, '$1');
  }
</script>

<template>
  <q-card style="width: 620px; max-width: 92vw">
    <q-card-section>
      <div class="text-h6 text-center">
        {{ editando ? 'Editar movimiento' : 'Nuevo movimiento' }}
        <q-btn round flat dense icon="close" class="float-right" color="grey-8" v-close-popup />
      </div>
    </q-card-section>

    <q-separator inset />

    <q-form @submit="onSubmit">
      <q-card-section class="q-pt-lg">
        <div class="row q-col-gutter-md">

          <div class="col-12 col-sm-6">
            <label>Tipo: <span class="text-negative">*</span></label>
            <q-btn-toggle
              v-model="formIE.tipo"
              spread no-caps unelevated
              class="q-mt-xs"
              :toggle-color="esEgreso ? 'orange-8' : 'teal-7'"
              text-color="blue-grey-8"
              :options="[
                { label: 'Ingreso', value: 'ingreso', icon: 'trending_up' },
                { label: 'Egreso',  value: 'egreso',  icon: 'trending_down' }
              ]" />
          </div>

          <div class="col-12 col-sm-6">
            <label>Monto: <span class="text-negative">*</span></label>
            <q-input v-model="formIE.monto" outlined dense class="q-mt-xs"
              prefix="$" @update:model-value="soloNumeros"
              :rules="[ val => Number( val ) > 0 || 'Ingresa un monto mayor a 0' ]" />
          </div>

          <div class="col-12">
            <label>Referencia: <span class="text-negative">*</span></label>
            <q-input v-model.trim="formIE.referencia" outlined dense class="q-mt-xs"
              placeholder="Concepto del movimiento"
              :rules="[ val => !!val || 'La referencia es obligatoria' ]" />
          </div>

          <div class="col-12 col-sm-6">
            <label>Fecha:</label>
            <q-input v-model="formIE.fecha" outlined dense mask="####-##-##" class="q-mt-xs"
              hint="Si se deja vacío se guarda con la fecha de hoy">
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer" />
              </template>
              <q-popup-proxy transition-show="scale" transition-hide="scale">
                <q-date v-model="formIE.fecha" mask="YYYY-MM-DD" minimal>
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Cerrar" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-input>
          </div>

          <div class="col-12 col-sm-6">
            <label>Forma de pago:</label>
            <q-select v-model="formIE.forma_pago" outlined dense class="q-mt-xs"
              :options="listFormasPago" emit-value map-options clearable />
          </div>

          <!-- El proveedor solo tiene sentido en una salida de dinero. -->
          <div v-if="esEgreso" class="col-12 col-sm-6">
            <label>Proveedor:</label>
            <q-select v-model="formIE.proveedor_id" outlined dense class="q-mt-xs"
              :options="listProveedores" emit-value map-options clearable
              hint="Opcional" />
          </div>

          <div class="col-12" :class="esEgreso ? 'col-sm-6' : 'col-sm-6'">
            <label>Sucursal:</label>
            <q-select v-model="formIE.sucursal_id" outlined dense class="q-mt-xs"
              :options="listSucursales" emit-value map-options clearable
              hint="Opcional" />
          </div>

          <div class="col-12">
            <label>Descripción:</label>
            <q-input v-model.trim="formIE.descripcion" outlined dense type="textarea"
              rows="2" class="q-mt-xs" />
          </div>

        </div>
      </q-card-section>

      <q-card-actions align="center" class="q-pb-lg">
        <q-btn type="submit" :label="editando ? 'Actualizar' : 'Guardar'"
          :loading="loading" icon-right="save"
          outline rounded class="q-px-xl" style="color: #696cff" />
      </q-card-actions>
    </q-form>
  </q-card>
</template>
