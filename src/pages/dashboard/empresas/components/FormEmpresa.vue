<script setup lang="ts">
  import { useEmpresa } from '../composables/useEmpresa.js';
  import ModalWhatsapp from "../components/ModalWhatsapp.vue";
  import { ref, watch } from 'vue';

  const props = defineProps<{ edit: boolean }>();
  const modalAsociarWhatsApp = ref( false );

  const {
    formEmpresa,
    loading,
    validaciones,
    onRejected,
    onSubmit,
    isPwd,
    isValid
  } = useEmpresa();

  watch(
    () => formEmpresa.value.clave_certificado,
    (newValue, oldValue) => {
      if ( isValid.value && newValue !== oldValue ) isValid.value = false;
    },
    { deep: true }
  )

</script>

<template>
  <q-form @submit="onSubmit( props.edit )">
    <q-card class="my-card">
      <q-card-section class="q-pt-lg">
        <div class="row q-pt-sm q-gutter-lg justify-center">

          <div class="col-xs-11 col-md-5" :class="[ $q.screen.width > 600 || 'q-mt-md']">
            <label>R.U.C</label>
            <q-input :type="$q.platform.is.mobile ? 'number' : 'text'"
              v-model="formEmpresa.ruc"
              @update:model-value="validaciones.ruc.isValid = true"
              counter maxlength="13"
              @keyup="formEmpresa.ruc = formEmpresa.ruc.replace(/\D/g, '')" lazy-rules
              :error="!validaciones.ruc.isValid"
              dense filled>
              <template v-slot:error>
                <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                  {{ validaciones.ruc.message }}
                </label>
              </template>
            </q-input>
          </div>

          <div class="col-xs-11 col-md-5"
            :class="[ $q.screen.width > 600 || 'q-mt-xs']">
            <label>Razón Social</label>
            <q-input v-model.trim="formEmpresa.razon_social"
              input-style="text-transform: uppercase;"
              readonly
              dense outlined>
            </q-input>
          </div>

          <div class="col-xs-11 col-md-5">
            <label>Nombre Comercial:</label>
            <q-input v-model.trim="formEmpresa.nombre_comercial"
              input-style="text-transform: uppercase;"
              @update:model-value="validaciones.nombre_comercial.isValid = true"
              :error="!validaciones.nombre_comercial.isValid"
              dense filled>
              <template v-slot:error>
                <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                  {{ validaciones.nombre_comercial.message }}
                </label>
              </template>
            </q-input>
          </div>

          <div class="col-xs-11 col-md-5">
            <label>Dirección:</label>
            <q-input v-model.trim="formEmpresa.direccion_matriz"
              @update:model-value="validaciones.direccion_matriz.isValid = true"
              :error="!validaciones.direccion_matriz.isValid"
              dense filled>
              <template v-slot:error>
                <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                  {{ validaciones.direccion_matriz.message }}
                </label>
              </template>
            </q-input>
          </div>

          <div class="col-xs-11 col-md-5">
            <label>Email:</label>
            <q-input v-model.trim="formEmpresa.email" type="text"
              @update:model-value="validaciones.email.isValid = true"
              :error="!validaciones.email.isValid"
              dense filled>
              <template v-slot:error>
                <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                  {{ validaciones.email.message }}
                </label>
              </template>
            </q-input>
          </div>

          <div class="col-xs-11 col-md-5"
            :class="$q.screen.width < 600 || 'obligadoContb'">
            <label>Obligado Contabilidad:</label>
            <q-toggle color="green" size="lg" v-model="formEmpresa.obligado_contabilidad"/>
          </div>

          <div class="col-xs-11 col-md-5">
            <label>Celular:</label>
            <q-input :type="$q.platform.is.mobile ? 'number' : 'text'"
              v-model="formEmpresa.telefono"
              counter maxlength="10"
              :error="!validaciones.telefono.isValid"
              input-style="width: 81%"
              @update:model-value="validaciones.telefono.isValid = true"
              @keyup="formEmpresa.telefono = formEmpresa.telefono.replace(/\D/g, '')"
              lazy-rules dense filled>
              <template v-slot:error>
                <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                  {{ validaciones.telefono.message }}
                </label>
              </template>
              <template v-slot:append>
                <q-badge filled color="teal-8"
                  @click="modalAsociarWhatsApp = true"
                  style="height: 100%;width: 19%;position: absolute;right: 0px;justify-content: center;font-size:14px; cursor: pointer;">
                  <q-icon name="fa-brands fa-whatsapp" size="sm" />
                </q-badge>
              </template>
            </q-input>
          </div>

          <div class="col-xs-11 col-md-5" :class="[ $q.screen.width > 600 || 'q-mt-sm']">
            <label>Logo de la empresa:</label>
            <q-file dense filled bottom-slots
              accept=".jpg, image/*" @rejected="onRejected"
              @update:model-value="validaciones.logo.isValid = true"
              v-model="formEmpresa.logo"
              :error="!validaciones.logo.isValid"
              :label="formEmpresa.logo_old == null ?
                'Cargar Logo' : formEmpresa.logo_old">

              <template v-slot:error>
                <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                  {{ validaciones.logo.message }}
                </label>
              </template>

              <template v-slot:prepend>
                <q-icon name="fa-solid fa-image" />
              </template>

              <template v-slot:hint>
                <div>
                  Tamaño máximo 100 KB, extensión .jpg o .png y ser menor o igual a 200px por 200px."
                </div>
              </template>

              <template v-slot:append>
                <q-icon name="close"
                  v-if="typeof(formEmpresa.logo) === 'object' && formEmpresa.logo !== null"
                  @click.stop.prevent="formEmpresa.logo = null" class="cursor-pointer" />
              </template>

            </q-file>
          </div>

          <div class="col-xs-11 col-md-5" :class="[ $q.screen.width > 600 || 'q-mt-sm']">
            <label>Cargar Certificado:</label>
            <q-file dense filled bottom-slots
              accept=".p12" @rejected="onRejected"
              v-model="formEmpresa.archivo_certificado"
              @update:model-value="validaciones.archivo_certificado.isValid = true"
              :error="!validaciones.archivo_certificado.isValid"
              :label="formEmpresa.archivo_certificado_old == null ?
                'Cargar Certificado' : formEmpresa.archivo_certificado_old">

              <template v-slot:error>
                <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                  {{ validaciones.archivo_certificado.message }}
                </label>
              </template>

              <template v-slot:prepend>
                <q-icon name="attach_file" />
              </template>

              <template v-slot:append>
                <q-icon name="close"
                  v-if="typeof(formEmpresa.archivo_certificado) === 'object' && formEmpresa.archivo_certificado !== null"
                  @click.stop.prevent="formEmpresa.archivo_certificado = null" class="cursor-pointer" />
              </template>

            </q-file>
          </div>

          <div class="col-xs-11 col-md-5" :class="[ $q.screen.width > 600 || 'q-mt-xs']">
            <label>Clave Certificado:</label>
            <q-input :type="isPwd ? 'password' : 'text'" filled
              v-model.trim="formEmpresa.clave_certificado" dense
              @update:model-value="validaciones.clave_certificado.isValid = true"
              :error="!validaciones.clave_certificado.isValid">
              <template v-slot:error>
                <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                  {{ validaciones.clave_certificado.message }}
                </label>
              </template>
              <template v-slot:append>
                <q-icon :name="isPwd ? 'visibility_off' : 'visibility'" color="blue-grey"
                  class="cursor-pointer" @click="isPwd = !isPwd" />
              </template>
              <template v-slot:prepend>
                <q-icon name="key" color="blue-grey-3" />
              </template>
            </q-input>
          </div>

          <div class="col-xs-11 col-md-4" :class="[ $q.screen.width > 600 || 'q-mt-sm']">
            <label>Fecha Exp. Firma Electrónica:</label>
            <q-input v-model.trim="formEmpresa.fecha_caducidad_certificado"
              input-style="text-transform: uppercase;"
              readonly
              dense outlined>
            </q-input>
          </div>

          <div class="col-xs-11 col-md-3" :class="[ $q.screen.width > 600 || 'q-mt-sm']">
            <label>Valor del IVA:</label>
            <q-select filled dense v-model="formEmpresa.iva"
              @update:model-value="validaciones.iva.isValid = true"
              :error="!validaciones.iva.isValid"
              emit-value map-options
              :options="[
                  { label: '12%', value: '2' },
                  { label: '14%', value: '3' },
                  { label: '15%', value: '4' },
                ]">
              <template v-slot:error>
                <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                  {{ validaciones.iva.message }}
                </label>
              </template>
            </q-select>
          </div>

        </div>
      </q-card-section>
      <q-card-actions class="q-pb-md"
        :class="[ $q.screen.width < 600 ? 'justify-center q-ml-xl q-pt-none q-mb-md' : 'justify-between']">

      <q-btn v-if="$q.screen.width > 600"
        type="submit" icon="arrow_back" @click="$router.push('/empresas')"
        outline rounded class="q-ml-md"
        :color="!$q.dark.isActive ? 'blue-grey-10' : 'blue-grey-2'">
        &nbsp; Regresar
      </q-btn>

      <q-btn type="submit" icon="save" :loading="loading"
        outline rounded class="q-mr-lg" style="color: #696cff">
        &nbsp; Guardar Cambios
      </q-btn>
      </q-card-actions>
    </q-card>
  </q-form>

  <q-dialog v-model="modalAsociarWhatsApp">
    <ModalWhatsapp />
  </q-dialog>
</template>

<style>
.obligadoContb{
  position: relative;
  top: 12px;
  left: 24px;
}
.resaltarTextoInput{
  font-size: 18px;
  text-align: center;
  color: #313131;
  font-weight: 500;
}
</style>
