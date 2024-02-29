<script setup>
  import { ref } from 'vue';
  import { date } from 'quasar'
  import { useCliente } from '../../composables/useCliente';
  import { useEditCliente } from '../../composables/useEditCliente';

  const { api, mostrarNotify, formCliente, validaciones, validarDatosPersonales } = useCliente();
  
  const { dia_pago, dia_corte, dia_crear_factura } = useEditCliente();

  const loadingUpdate = ref( false )
  const actualizarDatosPersonales = async () => {
    const existError = validarDatosPersonales();

    if ( !existError ) {
      try {
        loadingUpdate.value = true;
        const { planInternet, created_at, updated_at, ...rest } = formCliente.value;
        const { data } = await api.put(`/customers/actualizarDatosPersonales/${ formCliente.value.id }`, rest)      
        formCliente.value = { ...data.cliente[0] }
        
        mostrarNotify( 'positive', data.msg);
        loadingUpdate.value = false;
      } catch (error) {
        loadingUpdate.value = false;
        mostrarNotify( 'warning', error.response.data.message );
      }
    }    
  }

</script>
<template>
  <q-form @submit="actualizarDatosPersonales">
    <div class="my-card">

      <div class="q-pt-none">
        <div class="row q-pt-sm">

          <div class="col-xs-12 col-md-7">
            <div class="row">

              <div class="col-11 flex justify-start items-center">
                <label class="text-h6 text-weight-medium"> >> Datos del Cliente:</label>
              </div>

              <div class="col-xs-12 col-md-4 flex items-center"
              :class="[ $q.screen.width < 1022 ? 'justify-center q-mt-sm q-pb-xs' : 'justify-end']">
                <label :class="$q.screen.width < 1022 || 'q-pr-md'">
                  Cliente:
                </label>
              </div>
              <div class="col-xs-12 col-md-6 col-sm-6">
                <q-input v-model.trim="formCliente.nombres" 
                  :error="!validaciones.nombres.isValid" 
                  @update:model-value="formCliente.nombres = formCliente.nombres.toUpperCase(), validaciones.nombres.isValid = true"
                  input-class="resaltarTextoInput" dense outlined>
                  <template v-slot:error>
                    <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                      {{ validaciones.nombres.message }}
                    </label>
                  </template>
                </q-input>
              </div>

              <div class="col-xs-12 col-md-4 flex items-center" 
              :class="[ $q.screen.width < 1022 ? 'justify-center q-mt-sm q-pb-xs' : 'justify-end']">
                <label :class="$q.screen.width < 1022 || 'q-pr-md'">
                  Email:
                </label>
              </div>
              <div class="col-xs-12 col-md-6 col-sm-6">
                <q-input v-model.trim="formCliente.email" 
                  :error="!validaciones.email.isValid" 
                  input-class="resaltarTextoInput"
                  @keyup="validaciones.email.isValid = true"
                  dense outlined>
                  <template v-slot:error>
                    <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                      {{ validaciones.email.message }}
                    </label>
                  </template>
                </q-input>
              </div>

              <div class="col-xs-12 col-md-4 flex items-center" 
              :class="[ $q.screen.width < 1022 ? 'justify-center q-mt-sm q-pb-xs' : 'justify-end']">
                <label :class="$q.screen.width < 1022 || 'q-pr-md'">
                  Celular:
                </label>
              </div>
              <div class="col-xs-12 col-md-6 col-sm-6">
                <q-input :type="$q.platform.is.mobile ? 'number' : 'text'"
                  v-model.trim="formCliente.celular" 
                  counter maxlength="10" input-class="resaltarTextoInput"
                  :error="!validaciones.celular.isValid" 
                  @keyup="validaciones.celular.isValid = true, formCliente.celular = formCliente.celular.replace(/\D/g, '')"
                  dense outlined>
                  <template v-slot:error>
                    <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                      {{ validaciones.celular.message }}
                    </label>
                  </template>
                </q-input>
              </div>

              <div class="col-xs-12 col-md-4 flex items-center" 
              :class="[ $q.screen.width < 1022 ? 'justify-center q-mt-sm q-pb-xs' : 'justify-end']">
                <label :class="$q.screen.width < 1022 || 'q-pr-md'">
                  Dirección:
                </label>
              </div>
              <div class="col-xs-12 col-md-6 col-sm-6">
                <q-input v-model="formCliente.direccion" 
                  :error="!validaciones.direccion.isValid"
                  input-class="resaltarTextoInput" 
                  @keyup="validaciones.direccion.isValid = true"
                  dense outlined>
                  <template v-slot:error>
                    <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                      {{ validaciones.direccion.message }}
                    </label>
                  </template>
                </q-input>
              </div>

              <div class="col-xs-12 col-md-4 flex items-center" 
              :class="[ $q.screen.width < 1022 ? 'justify-center q-mt-sm q-pb-xs' : 'justify-end']">
                <label :class="$q.screen.width < 1022 || 'q-pr-md'">
                  Tipo de Documento:
                </label>
              </div>
              <div class="col-xs-12 col-md-6 col-sm-6">
                <q-select dense v-model.trim="formCliente.tipo_documento" outlined 
                  @update:model-value="validaciones.tipo_documento.isValid = true"
                  :error="!validaciones.tipo_documento.isValid" 
                  emit-value map-options
                  :options="[
                    { label: 'RUC', value: '04' }, 
                    { label: 'Cedula', value: '05' },
                    { label: 'Pasaporte', value: '06' }
                    ]">
                    <template v-slot:error>
                      <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                        {{ validaciones.tipo_documento.message }}
                      </label>
                    </template>
                </q-select>
              </div>

              <div class="col-xs-12 col-md-4 flex items-center" 
              :class="[ $q.screen.width < 1022 ? 'justify-center q-mt-sm q-pb-xs' : 'justify-end']">
                <label :class="$q.screen.width < 1022 || 'q-pr-md'">
                  N. Identificación:
                </label>
              </div>
              <div class="col-xs-12 col-md-6 col-sm-6">
                <q-input :type="$q.platform.is.mobile ? 'number' : 'text'"
                  v-model="formCliente.numero_documento" 
                  :readonly="formCliente.tipo_documento === '' "
                  input-class="resaltarTextoInput"
                  counter :maxlength="formCliente.tipo_documento === '04' ? 13 : 10"
                  :error="!validaciones.numero_documento.isValid" 
                  @keyup="validaciones.numero_documento.isValid = true, formCliente.numero_documento = formCliente.numero_documento.replace(/\D/g, '')" 
                  dense outlined>
                  <template v-slot:error>
                    <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                      {{ validaciones.numero_documento.message }}
                    </label>
                  </template>
                </q-input>
              </div>
            </div>
          </div>

          <div class="col-xs-11 col-md-5">
            <div class="row q-col-gutter-sm q-col-gutter-y-md">
              <div class="col-11 flex justify-start items-center" 
                :class="[$q.screen.xs ? 'q-my-md' : '']">
                <label class="text-h6 text-weight-medium"> >> Resumen Notificaciones:</label>
              </div>


                <div class="col-xs-12 col-md-6">
                  <div>
                    <q-badge class="text-center q-py-sm"
                      style="width: 100%;text-align: center;font-size: 15px;display: block;"
                      :color="$q.dark.isActive ? 'indigo-6' : 'indigo-8'" 
                      filled>
                      <div style="display: flex;">
                        <div style="width: 30%;" class="q-mr-xs q-ml-md">
                          <q-icon name="calendar_month" style="font-size: 32px;" />
                        </div>
                        <div style="width: 70%; text-align: left;">
                          <div>{{ dia_pago }}</div>
                          <br>
                          <div>Día de pago</div>                      
                        </div>
                      </div>
                    </q-badge>
                  </div>
                </div>

                <div class="col-xs-12 col-md-6">
                  <div>
                    <q-badge class="text-center q-py-sm"
                      style="width: 100%;text-align: center;font-size: 15px;display: block;"
                      :color="$q.dark.isActive ? 'orange-9' : 'orange-9'" 
                      filled>
                      <div style="display: flex;">
                        <div style="width: 30%;" class="q-mr-xs q-ml-md">
                          <q-icon name="calendar_month" style="font-size: 32px;" />
                        </div>
                        <div style="width: 70%; text-align: left;">
                          <div>{{ date.formatDate(dia_crear_factura, 'DD/MM/YYYY') }} 12:00 AM</div>
                          <br>
                          <div>Crear Factura</div>                      
                        </div>
                      </div>
                    </q-badge>
                  </div>
                </div>

                <div class="col-xs-12 col-md-6">
                  <div>
                    <q-badge class="text-center q-py-sm"
                      style="width: 100%;text-align: center;font-size: 15px;display: block;"
                      :color="$q.dark.isActive ? 'red-7' : 'red-9'" 
                      filled>
                      <div style="display: flex;">
                        <div style="width: 30%;" class="q-mr-xs q-ml-md">
                          <q-icon name="calendar_month" style="font-size: 32px;" />
                        </div>
                        <div style="width: 70%; text-align: left;">
                          <div>{{ dia_corte }}</div>
                          <br>
                          <div>Día de corte</div>                      
                        </div>
                      </div>
                    </q-badge>
                  </div>
                </div>

            </div>
          </div>
        </div>
      </div>

      <div class="row justify-center q-mt-md">
        <div class="q-pb-md" :class="[ $q.screen.width > 600 || ' q-ml-lg']">
          <q-btn type="submit" icon="save" 
            :loading="loadingUpdate"
            outline rounded class="q-mr-lg" style="color: #696cff">
            &nbsp; Guardar Cambios
          </q-btn>
        </div>
      </div>

    </div>
  </q-form>
</template>