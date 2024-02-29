<script setup>
  import { ref } from 'vue';
  import { useCliente } from '../composables/useCliente';
  import { useEditCliente } from '../composables/useEditCliente';
  import { date } from 'quasar'

  const { api, mostrarNotify, formFacturacion, validacionesFacturacion, validarFormFact, step } = useCliente();
  const { dia_pago, dia_corte, dia_crear_factura } = useEditCliente()

  const props = defineProps(['edit']);
  const loadingUpdate = ref( false );

  const actualizarDatosFactura = async () => {
    const existError = validarFormFact();
    if ( !existError ) {
      try {
        loadingUpdate.value = true;
        const { data } = await api.put(`/customers/actualizarDatosFactura/${ formFacturacion.value.id }`, formFacturacion.value)      
        
        formFacturacion.value = { ...data.factura[0] }
        
        mostrarNotify( 'positive', data.msg);
        loadingUpdate.value = false;
      } catch (error) {
        loadingUpdate.value = false;
        mostrarNotify( 'warning', error.response.data.message )
      }
    }
  }

  let dias = new Array(28).fill(0).map( (_, idx) => idx + 1 );
  let diaCrearFactura = new Array(25).fill(0).map( (_, idx) => 
                      `${ idx + 1 }  ${ idx == 0 ? 'Día' : 'Días' } antes` );
  let diaGracia = new Array(25).fill(0).map( (_, idx) => `${ idx + 1 }  ${ idx == 0 ? 'Día' : 'Días' }` );

  let diaAplicarCorte = new Array(12).fill(0).map( (_, idx) => 
    `${ idx + 1 }  ${ idx == 0 ? 'Mes' : 'Meses' } ${ idx == 0 ? 'Vencido' : 'Vencidos' }` );

  diaCrearFactura.unshift('Desactivado')
  diaAplicarCorte.unshift('Desactivado')
  
</script>

<template>
  <div class="row q-col-gutter-md" 
      :class="$q.screen.width > 1022 ? 'q-col-gutter-y-lg q-pt-md' : ''">
  
    <div class="col-12 flex justify-start items-center q-pt-none">
      <label class="text-h6 text-weight-medium" :class="$q.screen.width > 1022 || 'q-pt-xs'">
        <q-icon name="description" /> Facturación:
      </label>
    </div>

    <div class="col-xs-12 col-md-6" :class="$q.screen.width < 1022 ? 'q-pt-xs' : 'q-pt-xs'">
      <div class="row">
        <div class="col-xs-12 col-md-4 flex items-center justify-end" 
          :class="[ $q.screen.width < 1022 ? 'justify-center q-mt-sm q-pb-xs' : 'texto-rigth q-pb-md']">
          <label :class="$q.screen.width < 1022 || 'q-pr-md'">
            Tipo:
          </label>
        </div>
        <div class="col-xs-12 col-md-7">
          <q-select dense v-model.trim="formFacturacion.tipo" outlined 
            @update:model-value="validacionesFacturacion.tipo.isValid = true"
            :error="!validacionesFacturacion.tipo.isValid" 
            emit-value map-options
            :options="[
              { label: 'Prepago (Adelantado)', value: 'prepago' }, 
              { label: 'Postpago (Vencido)', value: 'postpago' }
              ]">
              <template v-slot:error>
                <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                  {{ validacionesFacturacion.tipo.message }}
                </label>
              </template>
          </q-select>
        </div>
      </div>
    </div>    
    <div class="col-xs-12 col-md-6" :class="$q.screen.width < 1022 ? 'q-pt-none' : 'q-pt-xs'">
      <div class="row">
        <div class="col-xs-12 col-md-4 flex items-center justify-end" 
          :class="[ $q.screen.width < 1022 
            ? 'justify-center q-mt-md q-pb-xs' 
            : 'justify-end text-right q-pb-md']">
          <label :class="$q.screen.width < 1022 || 'q-pr-md'">
            Dia Pago:
          </label>
        </div>
        <div class="col-xs-12 col-md-7">
          <q-select dense v-model.trim="formFacturacion.dia_pago" outlined 
            :options="dias"
            @update:model-value="validacionesFacturacion.dia_pago.isValid = true"
            :error="!validacionesFacturacion.dia_pago.isValid" >
              <template v-slot:error>
                <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                  {{ validacionesFacturacion.dia_pago.message }}
                </label>
              </template>
          </q-select>
        </div>
      </div>
    </div>
    <div class="col-xs-12 col-md-6" :class="$q.screen.width < 1022 ? 'q-pt-none' : 'q-pt-xs'">
      <div class="row">
        <div class="col-xs-12 col-md-4 flex items-center justify-end" 
          :class="[ $q.screen.width < 1022 
            ? 'justify-center q-mt-md q-pb-xs' 
            : 'justify-end text-right q-pb-md']">
          <label :class="$q.screen.width < 1022 || 'q-pr-md'">
            Tipo Impuesto:
          </label>
        </div>
        <div class="col-xs-12 col-md-7">
          <q-select dense v-model.trim="formFacturacion.tipo_impuesto" outlined 
            :options="['Impuestos incluido', 'Mas impuestos', 'Ninguno']"
            @update:model-value="validacionesFacturacion.tipo_impuesto.isValid = true"
            :error="!validacionesFacturacion.tipo_impuesto.isValid" >
              <template v-slot:error>
                <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                  {{ validacionesFacturacion.tipo_impuesto.message }}
                </label>
              </template>
          </q-select>
        </div>
      </div>
    </div>
    <div class="col-xs-12 col-md-6" :class="$q.screen.width < 1022 ? 'q-pt-none' : 'q-pt-xs'">
      <div class="row">
        <div class="col-xs-12 col-md-4 flex items-center justify-end" 
          :class="[ $q.screen.width < 1022 
            ? 'justify-center q-mt-md q-pb-xs' 
            : 'justify-end text-right q-pb-md']">
          <label :class="$q.screen.width < 1022 || 'q-pr-md'">
            Días de gracia:
          </label>
        </div>
        <div class="col-xs-12 col-md-7">
          <q-select dense v-model.trim="formFacturacion.dia_gracia" outlined 
            :options="diaGracia"
            hint="*días tolerancia para aplicar corte"
            @update:model-value="validacionesFacturacion.dia_gracia.isValid = true"
            :error="!validacionesFacturacion.dia_gracia.isValid" >
              <template v-slot:error>
                <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                  {{ validacionesFacturacion.dia_gracia.message }}
                </label>
              </template>
          </q-select>
        </div>
      </div>
    </div>
    <div class="col-xs-12 col-md-6" :class="$q.screen.width < 1022 ? 'q-pt-none' : 'q-pt-xs'">
      <div class="row">
        <div class="col-xs-12 col-md-4 flex items-center justify-end" 
          :class="[ $q.screen.width < 1022 
            ? 'justify-center q-mt-md q-pb-xs' 
            : 'justify-end text-right q-pb-md']">
          <label :class="$q.screen.width < 1022 || 'q-pr-md'">
            Aplicar Corte:
          </label>
        </div>
        <div class="col-xs-12 col-md-7">
          <q-select dense v-model.trim="formFacturacion.aplicar_corte" outlined 
            :options="diaAplicarCorte"
            @update:model-value="validacionesFacturacion.aplicar_corte.isValid = true"
            :error="!validacionesFacturacion.aplicar_corte.isValid" >
              <template v-slot:error>
                <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                  {{ validacionesFacturacion.aplicar_corte.message }}
                </label>
              </template>
          </q-select>
        </div>
      </div>
    </div>
    <div class="col-xs-12 col-md-6" :class="$q.screen.width < 1022 ? 'q-pt-none' : 'q-pt-xs'">
      <div class="row">
        <div class="col-xs-12 col-md-4 flex items-center justify-end" 
          :class="[ $q.screen.width < 1022 
            ? 'justify-center q-mt-md q-pb-xs' 
            : 'justify-end text-right q-pb-md']">
          <label :class="$q.screen.width < 1022 || 'q-pr-md'">
            Tipo Comprobante:
          </label>
        </div>
        <div class="col-xs-12 col-md-7">
          <q-select dense v-model.trim="formFacturacion.tipo_comprobante" outlined 
            :options="['Factura', 'Recibo']"
            @update:model-value="validacionesFacturacion.tipo_comprobante.isValid = true"
            :error="!validacionesFacturacion.tipo_comprobante.isValid" >
              <template v-slot:error>
                <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                  {{ validacionesFacturacion.tipo_comprobante.message }}
                </label>
              </template>
          </q-select>
        </div>
      </div>
    </div>

    <div class="col-12 flex justify-start items-center q-py-md">
      <label class="text-h6 text-weight-medium" :class="$q.screen.width > 1022 || 'q-pt-xs'">
        <q-icon name="notifications" /> Notificaciones:
      </label>
    </div>

    <div class="col-xs-12 col-md-6" :class="$q.screen.width < 1022 ? 'q-pt-xs' : 'q-pt-xs'">
      <div class="row">
        <div class="col-xs-12 col-md-4 flex items-center justify-end" 
          :class="[ $q.screen.width < 1022 ? 'justify-center q-mt-sm q-pb-xs' : 'texto-rigth q-pb-md']">
          <label :class="$q.screen.width < 1022 || 'q-pr-md'">
            Recordatorios de pago:
          </label>
        </div>
        <div class="col-xs-12 col-md-7">
          <q-select dense v-model.trim="formFacturacion.recordatorio_pago" outlined
            @update:model-value="validacionesFacturacion.recordatorio_pago.isValid = true"
            :error="!validacionesFacturacion.recordatorio_pago.isValid" multiple stack-label
            :options="['Correo', 'Telegram']">
              <template v-slot:error>
                <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                  {{ validacionesFacturacion.recordatorio_pago.message }}
                </label>
              </template>
              <template v-slot:selected-item="scope">
                <q-chip color="deep-orange-14" text-color="white" icon="done"
                  removable dense
                  @remove="scope.removeAtIndex(scope.index)"
                  :tabindex="scope.tabindex"
                  class="q-ma-none q-mr-sm">
                  {{ scope.opt }}
                </q-chip>
              </template>
          </q-select>
        </div>
      </div>
    </div> 

    <!---------------------- RESUMEN DE LOS PAGOS --------------------->
    <template v-if="edit">
      <div class="col-md-12 q-py-md">
        <div class="row q-col-gutter-sm">

          <div class="col-xs-12 col-md-4">
            <q-badge 
              class="text-center flex-center q-py-md"
              style="width: 100%;text-align: center;font-size: 15px;"
              outline color="lime-7">
              Día de pago: <span class="text-weight-bold"> 
                &nbsp;{{ dia_pago }}
              </span> 
            </q-badge>
          </div>

          <div class="col-xs-12 col-md-4">
            <q-badge 
              class="text-center flex-center q-py-md"
              style="width: 100%;text-align: center;font-size: 15px;"
              outline color="red-4">
              Día de corte: <span class="text-weight-bold">
                &nbsp;{{ dia_corte }}
              </span> 
            </q-badge>
          </div>

          <div class="col-xs-12 col-md-4">
            <q-badge 
              class="text-center flex-center q-py-md"
              style="width: 100%;text-align: center;font-size: 15px;"
              outline color="cyan-4">
              Crear factura: <span class="text-weight-bold">
                &nbsp;{{ date.formatDate(dia_crear_factura, 'DD/MM/YYYY') }} 12:00 AM
              </span>
            </q-badge>
          </div>
        </div>
      </div>
      <!---------------------- FIN RESUMEN DE LOS PAGOS --------------------->

      <div class="col-xs-12 col-md-12 flex q-py-md justify-center" 
        style="padding-bottom: 0px;"
        :class="[ $q.screen.width < 600 
            ? ' q-pt-none q-ml-md' 
            : '']">

          <q-btn icon-right="save" 
            @click="actualizarDatosFactura"
            :loading="loadingUpdate"
            outline rounded class="q-mr-lg" style="color: #696cff">
            &nbsp; Guardar&nbsp;
          </q-btn>
      </div>
    </template>

    <div v-else
      class="col-xs-12 col-md-12 flex q-py-md" 
      style="padding-bottom: 0px;"
      :class="[ $q.screen.width < 600 
          ? 'justify-center q-pt-none q-ml-md' 
          : 'justify-between']">

        <q-btn v-if="$q.screen.width > 600"
          icon="arrow_back" @click="step = 1"
          outline rounded class="q-ml-md" 
          :color="!$q.dark.isActive ? 'blue-grey-10' : 'blue-grey-2'">
          &nbsp; Anterior
        </q-btn>

        <q-btn @click="validarFormFact" icon-right="arrow_forward" 
          outline rounded class="q-mr-lg" style="color: #696cff">
          &nbsp; Siguiente&nbsp;
        </q-btn>
    </div>

  </div>
</template>

