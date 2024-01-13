<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { useRouter } from '../composables/useRouter';
  import ModalMapBox from '../../../../../components/ModalMapBox.vue'

  const props = defineProps<{ edit: boolean }>();
  const modalAgregarCoordenadas = ref( false );
  const objMap = ref({ edit: false, coords: '' });

  const { 
    claim,
    formRouter, 
    loading, 
    showPass,
    validaciones,
    listCompanies,
    cargarCompanies,
    onSubmit 
  } = useRouter( props.edit );

  const onlyNumberAndPoint = ( event: any ) => {
    validaciones.value.ip_host.isValid = true
    const soloNumerosYPuntos = event.target.value.replace(/[^0-9.]/g, "");
    formRouter.value.ip_host = soloNumerosYPuntos
  }

  const coordenadasSelected = ( coords: any ) => {
    formRouter.value.ubicacion = `${ coords.lng }, ${ coords.lat }`
    modalAgregarCoordenadas.value = false
  }

  const showModalMap = () => {
    if ( props.edit ) 
      objMap.value = { edit: true, coords: formRouter.value.ubicacion }

    modalAgregarCoordenadas.value = true;
  }

  onMounted(async () => {
    await cargarCompanies()
  })

</script>

<template>
  <q-form @submit="onSubmit( props.edit )" class="q-mt-md">
    <div class="row q-col-gutter-md q-px-lg" 
    :class="$q.screen.width < 1022 || 'q-col-gutter-y-lg q-pt-md'">

      <div class="col-xs-12 col-md-6">
        <div class="row">
          <div class="col-xs-12 col-md-4 flex items-center justify-end" 
            :class="[ $q.screen.width < 1022 ? 'justify-center q-mt-sm q-pb-xs' : 'texto-rigth']">
            <label :class="$q.screen.width < 1022 || 'q-pr-md'">
              Nombre Router:
            </label>
          </div>
          <div class="col-xs-12 col-md-7">
            <q-input v-model.trim="formRouter.nombre" 
            :error="!validaciones.nombre.isValid" 
            @update:model-value="formRouter.nombre = formRouter.nombre.toUpperCase(), validaciones.nombre.isValid = true"
            input-class="resaltarTextoInput" dense outlined>
            <template v-slot:error>
              <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                {{ validaciones.nombre.message }}
              </label>
            </template>
            </q-input>
          </div>
        </div>
      </div>
      <div class="col-xs-12 col-md-6">
        <div class="row">
          <div class="col-xs-12 col-md-4 flex items-center justify-end" 
            :class="[ $q.screen.width < 1022 ? 'justify-center q-mt-sm q-pb-xs' : 'justify-end']">
            <label :class="$q.screen.width < 1022 || 'q-pr-md'">
              Usuario (API):
            </label>
          </div>
          <div class="col-xs-12 col-md-7">
            <q-input v-model.trim="formRouter.user_api" 
              :error="!validaciones.user_api.isValid" 
              @update:model-value="validaciones.user_api.isValid = true" 
              input-class="resaltarTextoInput" dense outlined>
              <template v-slot:error>
                <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                  {{ validaciones.user_api.message }}
                </label>
              </template>
            </q-input>
          </div>
        </div>
      </div>
      <div class="col-xs-12 col-md-6">
        <div class="row">
          <div class="col-xs-12 col-md-4 flex items-center justify-end" 
            :class="[ $q.screen.width < 1022 ? 'justify-center q-mt-sm q-pb-xs' : 'justify-end']">
            <label :class="$q.screen.width < 1022 || 'q-pr-md'">
              Tipo Router:
            </label>
          </div>
          <div class="col-xs-12 col-md-7">
            <q-select v-model="formRouter.tipo_router" outlined dense 
              :error="!validaciones.tipo_router.isValid" 
              @update:model-value="validaciones.tipo_router.isValid = true" 
                :options="['MikroTik']">
              <template v-slot:error>
                <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                  {{ validaciones.tipo_router.message }}
                </label>
              </template>  
            </q-select>
          </div>
        </div>
      </div>
      <div class="col-xs-12 col-md-6">
        <div class="row">
          <div class="col-xs-12 col-md-4 flex items-center justify-end" 
            :class="[ $q.screen.width < 1022 ? 'justify-center q-mt-sm q-pb-xs' : 'justify-end']">
            <label :class="$q.screen.width < 1022 || 'q-pr-md'">
              Contraseña (API):
            </label>
          </div>
          <div class="col-xs-12 col-md-7">
            <q-input :type="showPass ? 'password' : 'text'" outlined dense
              :error="!validaciones.password_api.isValid" 
              @update:model-value="validaciones.password_api.isValid = true" 
              v-model.trim="formRouter.password_api">
              <template v-slot:error>
                <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                  {{ validaciones.password_api.message }}
                </label>
              </template> 
              <template v-slot:append>
                <q-icon :name="showPass ? 'visibility_off' : 'visibility'" color="blue-grey"
                  class="cursor-pointer" @click="showPass = !showPass" />
              </template>
            </q-input>
          </div>
        </div>
      </div>
      <div class="col-xs-12 col-md-6">
        <div class="row">
          <div class="col-xs-12 col-md-4 flex items-center justify-end" 
            :class="[ $q.screen.width < 1022 ? 'justify-center q-mt-sm q-pb-xs' : 'justify-end']">
            <label :class="$q.screen.width < 1022 || 'q-pr-md'">
              Ubicación:
            </label>
          </div>
          <div class="col-xs-12 col-md-7">
            <q-input v-model.trim="formRouter.ubicacion"
            placeholder="Coordenadas Longitud, Latitud" input-style="width: 81%"
            :error="!validaciones.ubicacion.isValid"           
             dense outlined>
              <template v-slot:error>
                <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                  {{ validaciones.ubicacion.message }}
                </label>
              </template>
              <template v-slot:append>
                <q-badge filled color="blue-grey-6" 
                  @click="showModalMap"
                  style="height: 100%;width: 19%;position: absolute;right: 0px;justify-content: center;font-size:14px; cursor: pointer;">
                  <q-icon name="fa-solid fa-location-dot" size="xs" />
                </q-badge>
              </template>
            </q-input>
          </div>
        </div>
      </div>
      <div class="col-xs-12 col-md-6">
        <div class="row">
          <div class="col-xs-12 col-md-4 flex items-center justify-end" 
            :class="[ $q.screen.width < 1022 ? 'justify-center q-mt-sm q-pb-xs' : 'justify-end']">
            <label :class="$q.screen.width < 1022 || 'q-pr-md'">
              Puerto API:
            </label>
          </div>
          <div class="col-xs-12 col-md-7">
            <q-input v-model.trim="formRouter.puerto_api" 
              :error="!validaciones.puerto_api.isValid"
              :type="$q.platform.is.mobile ? 'number' : 'text'" 
              @update:model-value="validaciones.puerto_api.isValid = true, 
                                  formRouter.puerto_api = formRouter.puerto_api.replace(/\D/g, '')" 
              input-class="resaltarTextoInput" dense outlined>
              <template v-slot:error>
                <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                  {{ validaciones.puerto_api.message }}
                </label>
              </template> 
            </q-input>
          </div>
        </div>
      </div>
      <div class="col-xs-12 col-md-6">
        <div class="row">
          <div class="col-xs-12 col-md-4 flex items-center justify-end" 
            :class="[ $q.screen.width < 1022 ? 'justify-center q-mt-sm q-pb-xs' : 'justify-end']">
            <label :class="$q.screen.width < 1022 || 'q-pr-md'">
              Registro de tráfico:
            </label>
          </div>
          <div class="col-xs-12 col-md-7">
            <q-select v-model="formRouter.registro_trafico" outlined dense 
              :error="!validaciones.registro_trafico.isValid" 
              @update:model-value="validaciones.registro_trafico.isValid = true" 
                :options="['Accounting (RouterOS V6.x)', 'Traffic Flow (RouterOS V6x, V7.x)']">
              <template v-slot:error>
                <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                  {{ validaciones.registro_trafico.message }}
                </label>
              </template> 
            </q-select>
          </div>
        </div>
      </div>
      <div class="col-xs-12 col-md-6">
        <div class="row">
          <div class="col-xs-12 col-md-4 flex items-center justify-end" 
            :class="[ $q.screen.width < 1022 ? 'justify-center q-mt-sm q-pb-xs' : 'justify-end']">
            <label :class="$q.screen.width < 1022 || 'q-pr-md'">
              IP / Host:
            </label>
          </div>
          <div class="col-xs-12 col-md-7">
            <q-input v-model.trim="formRouter.ip_host"
              @keyup="onlyNumberAndPoint($event)"
              :error="!validaciones.ip_host.isValid" 
              @update:model-value="validaciones.ip_host.isValid = true" 
              input-class="resaltarTextoInput" dense outlined>
              <template v-slot:error>
                <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                  {{ validaciones.ip_host.message }}
                </label>
              </template> 
            </q-input>
          </div>
        </div>
      </div>
      <div class="col-xs-12 col-md-6">
        <div class="row">
          <div class="col-xs-12 col-md-4 flex items-center justify-end" 
            :class="[ $q.screen.width < 1022 ? 'justify-center q-mt-sm q-pb-xs' : 'justify-end']">
            <label :class="$q.screen.width < 1022 || 'q-pr-md'">
              Control Velocidad:
            </label>
          </div>
          <div class="col-xs-12 col-md-7">
            <q-select v-model="formRouter.control_velocidad" outlined dense 
              :error="!validaciones.control_velocidad.isValid" 
              @update:model-value="validaciones.control_velocidad.isValid = true" 
                :options="['Colas Simples (Estáticas)', 'PCQ + Addresslist', 'DHCP Lease (Colas Simples Dinamicas)', 'Ninguno']">
              <template v-slot:error>
                <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                  {{ validaciones.control_velocidad.message }}
                </label>
              </template> 
            </q-select>
          </div>
        </div>
      </div>
      <div class="col-xs-12 col-md-6">
        <div class="row">
          <div class="col-xs-12 col-md-4 flex items-center justify-end" 
            :class="[ $q.screen.width < 1022 ? 'justify-center q-mt-sm q-pb-xs' : 'justify-end']">
            <label :class="$q.screen.width < 1022 || 'q-pr-md'">
              Seguridad:
            </label>
          </div>
          <div class="col-xs-12 col-md-7">
            <q-select v-model="formRouter.seguridad" outlined dense 
              :error="!validaciones.seguridad.isValid" 
              @update:model-value="validaciones.seguridad.isValid = true" 
                :options="['Ninguno / Accounting API', 'PPP / Accounting API', 'Hotspot / Accounting API', 'PPP / Accounting Radius', 'Hotspot / Accounting Radius']">
              <template v-slot:error>
                <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                  {{ validaciones.seguridad.message }}
                </label>
              </template> 
            </q-select>
          </div>
        </div>
      </div>
      <div class="col-xs-12 col-md-6">
        <div class="row">
          <div class="col-xs-12 col-md-4 flex items-center justify-end" 
            :class="[ $q.screen.width < 1022 ? 'justify-center q-mt-sm q-pb-xs' : 'justify-end']">
            <label :class="$q.screen.width < 1022 || 'q-pr-md'">
              Seguridad alterna:
            </label>
          </div>
          <div class="col-xs-12 col-md-7">
            <q-select v-model="formRouter.seguridad_alterna" outlined dense 
              :error="!validaciones.seguridad_alterna.isValid" 
              @update:model-value="validaciones.seguridad_alterna.isValid = true"
                :options="['Amarre de IP y MAC', 'Ninguno']">
              <template v-slot:error>
                <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                  {{ validaciones.seguridad_alterna.message }}
                </label>
              </template> 
            </q-select>
          </div>
        </div>
      </div>
      <div v-if="claim.roles[0] == 'Super-Administrador' && !edit"
        class="col-xs-12 col-md-6">
        <div class="row">
          <div class="col-xs-12 col-md-4 flex items-center justify-end" 
            :class="[ $q.screen.width < 1022 ? 'justify-center q-mt-sm q-pb-xs' : 'justify-end']">
            <label :class="$q.screen.width < 1022 || 'q-pr-md'">
              Empresa:
            </label>
          </div>
          <div class="col-xs-12 col-md-7">
            <q-select v-model="formRouter.company_id" outlined dense 
              :error="!validaciones.company_id.isValid"
              emit-value map-options 
              @update:model-value="validaciones.company_id.isValid = true"
                :options="listCompanies">
              <template v-slot:error>
                <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                  {{ validaciones.company_id.message }}
                </label>
              </template> 
            </q-select>
          </div>
        </div>
      </div>

      <div class="col-xs-12 col-md-12 flex q-py-lg" 
      :class="[ $q.screen.width < 600 
          ? 'justify-center q-pt-none q-mb-md q-ml-md' 
          : 'justify-between']">
        <q-btn v-if="$q.screen.width > 600"
          icon="arrow_back" @click="$router.push('/router')"
          outline rounded class="q-ml-md" 
          :color="!$q.dark.isActive ? 'blue-grey-10' : 'blue-grey-2'">
          &nbsp; Regresar
        </q-btn>

        <q-btn type="submit" icon="save" :loading="loading"
          outline rounded class="q-mr-lg" style="color: #696cff">
          &nbsp; Guardar Cambios
        </q-btn>
      </div>
    </div>
  </q-form>

  <q-dialog v-model="modalAgregarCoordenadas">
    <ModalMapBox :objMap="objMap"
      @coordenadasSelected="coordenadasSelected" />
  </q-dialog>
</template>

<style>
.texto-rigth{
  text-align: right;
}
.resaltarTextoInput{
  font-size: 15px;
  text-align: center;
  color: #313131;
  font-weight: 500;
}
</style>