<script setup lang="ts">
  import { ref, watch } from 'vue';
  import JWT from 'jwt-client'
  import { useAuthUserStore } from "stores/auth-user"
  import { api } from "boot/axios";
  import useHelpers from "../../../../composables/useHelpers";

  const authUserStore = useAuthUserStore();
  const { claim } = JWT.read( authUserStore.token );
  const { mostrarNotify } = useHelpers();
  const isPwd = ref( true )

  const getCompany = async () => {
    const { data } = await api.get(`/companies/find/${ claim.company.id }`);

    let { archivo_certificado, ...rest } = data[0]
    formFactura.value = { ...rest };
    formFactura.value.archivo_certificado_old = archivo_certificado;
  }

  const updateCompany = async () => {

    let formData:any = new FormData();
    formData.append('id', formFactura.value.id);
    formData.append('ruc', formFactura.value.ruc);
    formData.append('nombre_comercial', formFactura.value.nombre_comercial);
    formData.append('razon_social', formFactura.value.razon_social);
    formData.append('direccion_matriz', formFactura.value.direccion_matriz)
    formData.append('obligado_contabilidad', formFactura.value.obligado_contabilidad);
    formData.append('email', formFactura.value.email);
    formData.append('telefono', formFactura.value.telefono);
    formData.append('clave_certificado', formFactura.value.clave_certificado);
    formData.append('archivo_certificado', formFactura.value.archivo_certificado);
    formData.append('archivo_certificado_old', formFactura.value.archivo_certificado_old);
    formData.append('logo_empresa', formFactura.value.logo_empresa);
    formData.append('logo_empresa_old', formFactura.value.logo_empresa_old);

    try {
      const { data } = await api.post(`/companies/${ formFactura.value.id }`, 
        formData, { headers: { 'Content-Type': 'multipart/form-data' } });

      mostrarNotify( 'positive', data.msg );
      // getCompany();
    } catch (error: any) {
      isValid.value = true;
      mostrarNotify( 'warning', error.response.data.message );      
    }
  }

  const formFactura = ref({
    id: '',
    ruc: '',
    nombre_comercial: '',
    razon_social: '',
    direccion_matriz: '',
    obligado_contabilidad: false,
    email: '',
    telefono: '',
    clave_certificado: '',
    archivo_certificado: null,
    archivo_certificado_old: null,
    logo_empresa: null,
    logo_empresa_old: null,
  })

  const allowOnlyNumber = () => {
    formFactura.value.ruc = formFactura.value.ruc.replace(/\D/g, '');
	}
  const validateNumRuc = [ (val: any) => val.length >= 13 || 'Debes completar 13 digitos' ];
  const validateNumCelular = [ (val: any) => val.length >= 10 || 'Debes completar 10 digitos' ];

  const transformToUpperCase = () => {
    formFactura.value.nombre_comercial = formFactura.value.nombre_comercial.toUpperCase()
    formFactura.value.razon_social = formFactura.value.razon_social.toUpperCase()
	}

  const onRejected = () => {
    mostrarNotify( 'negative', `El tipo de archivo es invalido` );
  }

  getCompany();

  const isValid = ref( false );

  watch(
    () => formFactura.value.clave_certificado,
    (newValue, oldValue) => {
      if ( isValid.value && newValue !== oldValue ) isValid.value = false;
    },
    { deep: true }
  )

</script>

<template>
  <q-page>

    <div class="q-px-md q-mt-md">
      <div class="row q-col-gutter-md flex-center">

        <div class="col-xs-12 col-md-8">
          <q-card class="my-card">
            <q-card-section class="bg-blue-grey-10 text-white q-py-sm">
              <div class="text-h6">Configuración Basica</div>
            </q-card-section>

            <q-card-section class="q-pt-none" style="padding-bottom: 21px;">
              <q-form @submit="updateCompany">
                <div class="row q-pt-lg">
                  <div class="col-4 flex justify-end items-center">
                    <label for="">R.U.C:</label>
                  </div>
                  <div class="col-6 q-ml-md">
                    <q-input v-model="formFactura.ruc" 
                      counter maxlength="13"
                      :rules="validateNumRuc"
                      @keyup="allowOnlyNumber" lazy-rules
                      dense outlined required />
                  </div>

                  <div class="col-4 flex justify-end items-center q-mt-md">
                    <label>Razón Social:</label>
                  </div>
                  <div class="col-6 q-ml-md q-mt-md">
                    <q-input v-model.trim="formFactura.razon_social" 
                      @keyup="transformToUpperCase"
                      dense outlined required />
                  </div>

                  <div class="col-4 flex justify-end items-center q-mt-md">
                    <label for="">Nombre Comercial:</label>
                  </div>
                  <div class="col-6 q-ml-md q-mt-md">
                    <q-input v-model.trim="formFactura.nombre_comercial" 
                      @keyup="transformToUpperCase"
                      dense outlined required />
                  </div>

                  <div class="col-4 flex justify-end items-center q-mt-md">
                    <label for="">Dirección:</label>
                  </div>
                  <div class="col-6 q-ml-md q-mt-md">
                    <q-input v-model.trim="formFactura.direccion_matriz" dense outlined required />
                  </div>

                  <div class="col-4 flex justify-end items-center q-mt-md">
                    <label>Email:</label>
                  </div>
                  <div class="col-6 q-ml-md q-mt-md">
                    <q-input v-model.trim="formFactura.email" type="email" dense outlined required />
                  </div>

                  <div class="col-4 flex justify-end items-center">
                    <label>Obligado Contabilidad:</label>
                  </div>
                  <div class="col-6 q-ml-md">
                    <q-toggle color="green" size="lg" v-model="formFactura.obligado_contabilidad"/>
                  </div>

                  <div class="col-4 flex justify-end items-center q-mt-md">
                    <label>Celular:</label>
                  </div>
                  <div class="col-6 q-ml-md q-mt-md">
                    <q-input v-model="formFactura.telefono" 
                      counter maxlength="10"
                      :rules="validateNumCelular"
                      @keyup="allowOnlyNumber" lazy-rules
                      dense outlined required />
                  </div>

                  <div class="col-4 flex justify-end items-center q-mt-md">
                    <label>Clave Certificado:</label>
                  </div>
                  <div class="col-6 q-ml-md q-mt-md">
                    <q-input :type="isPwd ? 'password' : 'text'" outlined v-model.trim="formFactura.clave_certificado" dense required 
                    error-message="La clave del certificado es incorrecta"
                    :error="isValid">
                      <template v-slot:append>
                        <q-icon :name="isPwd ? 'visibility_off' : 'visibility'" color="blue-grey"
                          class="cursor-pointer" @click="isPwd = !isPwd" />
                      </template>
                      <template v-slot:prepend>
                        <q-icon name="key" color="blue-grey-3" />
                      </template>
                    </q-input>
                  </div>
                  <div class="col-4 flex justify-end items-center q-mt-md">
                    <label>Cargar Certificado:</label>
                  </div>
                  <div class="col-6 q-ml-md q-mt-lg">
                    <q-file dense outlined bottom-slots 
                      accept=".p12" @rejected="onRejected"
                      v-model="formFactura.archivo_certificado" 
                      :label="formFactura.archivo_certificado_old == null ? 
                        'Cargar Certificado' : formFactura.archivo_certificado_old">

                      <template v-slot:prepend>
                        <q-icon name="attach_file" />
                      </template>

                      <template v-slot:append>
                        <q-icon name="close" 
                          v-if="typeof(formFactura.archivo_certificado) === 'object' && formFactura.archivo_certificado !== null" 
                          @click.stop.prevent="formFactura.archivo_certificado = null" class="cursor-pointer" />
                      </template>

                    </q-file>
                  </div>
                  <div class="col-4 flex justify-end items-center q-mt-md">
                    <label>Logo Empresa:</label>
                  </div>
                  <div class="col-6 q-ml-md q-mt-lg">
                    <q-file dense outlined bottom-slots 
                      accept=".jpg, image/*" @rejected="onRejected"
                      v-model="formFactura.logo_empresa" 
                      :label="formFactura.logo_empresa_old == null ? 
                        'Cargar Imagen' : formFactura.logo_empresa_old">

                      <template v-slot:prepend>
                        <q-icon name="fa-solid fa-image" />
                      </template>

                      <template v-slot:append>
                        <q-icon name="close" 
                          v-if="typeof(formFactura.logo_empresa) === 'object' && formFactura.logo_empresa !== null" 
                          @click.stop.prevent="formFactura.logo_empresa = null" class="cursor-pointer" />
                      </template>

                    </q-file>
                  </div>
                  <div class="col-12 q-ml-md q-mt-lg text-center">
                    <q-btn type="submit" icon="save" outline rounded class="q-ml-lg" color="primary" 
                        style="position: relative;left: 60px;">
                      &nbsp; Guardar Cambios
                    </q-btn>
                  </div>

                </div>
              </q-form>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>
  

  