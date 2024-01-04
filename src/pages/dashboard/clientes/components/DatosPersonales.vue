<script setup>
  import { useCliente } from '../composables/useCliente';

  const {  formCliente, validaciones, validarDatosPersonales } = useCliente();
</script>

<template>
  
  <div class="row q-col-gutter-md" 
      :class="$q.screen.width > 1022 ? 'q-col-gutter-y-lg q-pt-md' : ''">
  
    <div class="col-xs-12 col-md-6">
      <div class="row">
        <div class="col-xs-12 col-md-4 flex items-center justify-end" 
          :class="[ $q.screen.width < 1022 ? 'justify-center q-mt-sm q-pb-xs' : 'texto-rigth q-pb-md']">
          <label :class="$q.screen.width < 1022 || 'q-pr-md'">
            Nombres:
          </label>
        </div>
        <div class="col-xs-12 col-md-7">
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
      </div>
    </div>
    <div class="col-xs-12 col-md-6" :class="$q.screen.width > 1022 || 'q-pt-none'">
      <div class="row">
        <div class="col-xs-12 col-md-4 flex items-center justify-end" 
          :class="[ $q.screen.width < 1022 ? 'justify-center q-mt-md q-pb-xs' : 'justify-end text-right']">
          <label :class="$q.screen.width < 1022 || 'q-pr-md'">
            Tipo de Documento:
          </label>
        </div>
        <div class="col-xs-12 col-md-7">
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
      </div>
    </div>
    <div class="col-xs-12 col-md-6" :class="$q.screen.width > 1022 || 'q-pt-none'">
      <div class="row">
        <div class="col-xs-12 col-md-4 flex items-center justify-end" 
          :class="[ $q.screen.width < 1022 ? 'justify-center q-mt-sm q-pb-xs' : 'justify-end q-pb-md']">
          <label :class="$q.screen.width < 1022 || 'q-pr-md text-right'">
            Numero de Documento:
          </label>
        </div>
        <div class="col-xs-12 col-md-7">
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
    <div class="col-xs-12 col-md-6" :class="$q.screen.width > 1022 || 'q-pt-none'">
      <div class="row">
        <div class="col-xs-12 col-md-4 flex items-center justify-end" 
          :class="[ $q.screen.width < 1022 ? 'justify-center q-mt-sm q-pb-xs' : 'justify-end q-pb-md']">
          <label :class="$q.screen.width < 1022 || 'q-pr-md'">
            Celular:
          </label>
        </div>
        <div class="col-xs-12 col-md-7">
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
      </div>
    </div>
    <div class="col-xs-12 col-md-6" :class="$q.screen.width > 1022 || 'q-pt-none'">
      <div class="row">
        <div class="col-xs-12 col-md-4 flex items-center justify-end" 
          :class="[ $q.screen.width < 1022 ? 'justify-center q-mt-sm q-pb-xs' : 'justify-end']">
          <label :class="$q.screen.width < 1022 || 'q-pr-md'">
            Email:
          </label>
        </div>
        <div class="col-xs-12 col-md-7">
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
      </div>
    </div>
    <div class="col-xs-12 col-md-6" :class="$q.screen.width > 1022 || 'q-pt-none'">
      <div class="row">
        <div class="col-xs-12 col-md-4 flex items-center justify-end" 
          :class="[ $q.screen.width < 1022 ? 'justify-center q-mt-sm q-pb-xs' : 'justify-end']">
          <label :class="$q.screen.width < 1022 || 'q-pr-md'">
            Direccion:
          </label>
        </div>
        <div class="col-xs-12 col-md-7">
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
      </div>
    </div>

    <div class="col-xs-12 col-md-12 flex q-py-md" 
      style="padding-bottom: 0px;"
      :class="[ $q.screen.width < 600 
          ? 'justify-center q-pt-none q-ml-md' 
          : 'justify-between']">

        <q-btn v-if="$q.screen.width > 600"
          icon="arrow_back" @click="$router.push('/clientes')"
          outline rounded class="q-ml-md" 
          :color="!$q.dark.isActive ? 'blue-grey-10' : 'blue-grey-2'">
          &nbsp; Salir
        </q-btn>

        <q-btn @click="validarDatosPersonales" icon-right="arrow_forward" 
          outline rounded class="q-mr-lg" style="color: #696cff">
          &nbsp; Siguiente&nbsp;
        </q-btn>
    </div>
  </div>

</template>

