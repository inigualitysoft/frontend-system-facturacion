<script setup lang="ts">
  import { onMounted } from 'vue';
  import { useInternet } from '../composables/useInternet';

  const props = defineProps<{ edit: boolean }>();

  const { 
    formInternet, 
    loading, 
    validaciones,
    listRouters,
    cargarRouters,
    validDecimal,
    onSubmit 
  } = useInternet( props.edit );

  onMounted(async () => {
    await cargarRouters()
  })

</script>

<template>
  <q-form @submit="onSubmit( props.edit )" class="q-mt-md">
    <div class="row q-col-gutter-md q-px-lg" 
    :class="$q.screen.width < 1022 || 'q-col-gutter-y-lg q-pt-md'">

      <div class="col-xs-12 col-md-6">
        <div class="row">
          <div class="col-xs-12 col-md-4 flex items-center justify-end" 
            :class="[ $q.screen.width < 1022 ? 'justify-center q-mt-sm q-pb-xs' : 'texto-rigth q-pb-md']">
            <label :class="$q.screen.width < 1022 || 'q-pr-md'">
              Nombre Plan:
            </label>
          </div>
          <div class="col-xs-12 col-md-7">
            <q-input v-model.trim="formInternet.nombre_plan" 
            placeholder="Plan Premium 4Mbps"
            :error="!validaciones.nombre_plan.isValid" 
            @update:model-value="formInternet.nombre_plan = formInternet.nombre_plan.toUpperCase(), validaciones.nombre_plan.isValid = true"
            input-class="resaltarTextoInput" dense outlined>
            <template v-slot:error>
              <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                {{ validaciones.nombre_plan.message }}
              </label>
            </template>
            </q-input>
          </div>
        </div>
      </div>
      <div class="col-xs-12 col-md-6">
        <div class="row">
          <div class="col-xs-12 col-md-4 flex items-center justify-end" 
            :class="[ $q.screen.width < 1022 ? 'justify-center q-mt-sm q-pb-xs' : 'justify-end q-pb-md']">
            <label :class="$q.screen.width < 1022 || 'q-pr-md'">
              Descripción:
            </label>
          </div>
          <div class="col-xs-12 col-md-7">
            <q-input v-model.trim="formInternet.descripcion" 
              placeholder="Internet banda ancha 4Mbps/2Mbps"
              hint="* Texto para la facturación"
              :error="!validaciones.descripcion.isValid" 
              @update:model-value="validaciones.descripcion.isValid = true" 
              input-class="resaltarTextoInput" dense outlined>
              <template v-slot:error>
                <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                  {{ validaciones.descripcion.message }}
                </label>
              </template>
            </q-input>
          </div>
        </div>
      </div>
      <div class="col-xs-12 col-md-6">
        <div class="row">
          <div class="col-xs-12 col-md-4 flex items-center justify-end" 
            :class="[ $q.screen.width < 1022 ? 'justify-center q-mt-sm q-pb-xs' : 'texto-rigth q-pb-md']">
            <label :class="$q.screen.width < 1022 || 'q-pr-md'">
              Precio Plan:
            </label>
          </div>
          <div class="col-xs-12 col-md-7">
            <q-input v-model.trim="formInternet.precio_plan" 
            placeholder="0.00"
            :error="!validaciones.precio_plan.isValid" type="number" step="0.01"
            @update:model-value="validDecimal('precio_plan'), validaciones.precio_plan.isValid = true"
            input-class="resaltarTextoInput" dense outlined>
              <template v-slot:error>
                <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                  {{ validaciones.precio_plan.message }}
                </label>
              </template>
              <template v-slot:prepend>
                <q-icon name="paid" />
              </template>
            </q-input>
          </div>
        </div>
      </div>
      <div class="col-xs-12 col-md-6">
        <div class="row">
          <div class="col-xs-12 col-md-4 flex items-center justify-end" 
            :class="[ $q.screen.width < 1022 ? 'justify-center q-mt-sm q-pb-xs' : 'justify-end q-pb-md']">
            <label :class="$q.screen.width < 1022 || 'q-pr-md'">
              Impuesto(%):
            </label>
          </div>
          <div class="col-xs-12 col-md-7">
            <q-input v-model.trim="formInternet.impuesto"
              placeholder="0"
              :type="$q.platform.is.mobile ? 'number' : 'text'"  
              :error="!validaciones.impuesto.isValid" 
              @update:model-value="validaciones.impuesto.isValid = true, formInternet.impuesto = parseInt(formInternet.impuesto.toString().replace(/\D/g, ''))" 
              input-class="resaltarTextoInput" dense outlined>
              <template v-slot:error>
                <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                  {{ validaciones.impuesto.message }}
                </label>
              </template>
              <template v-slot:append>
                <q-icon name="fa-solid fa-percent" size="xs" />
              </template>
            </q-input>
          </div>
        </div>
      </div>

      <div class="col-12 q-py-sm">
        <q-separator inset></q-separator>
      </div>

      <div class="col-xs-12 col-md-6">
        <div class="row">
          <div class="col-xs-12 col-md-4 flex items-center justify-end" 
            :class="[ $q.screen.width < 1022 ? 'justify-center q-mt-sm q-pb-xs' : 'texto-rigth q-pb-md']">
            <label :class="$q.screen.width < 1022 || 'q-pr-md'">
              Descarga Mbps:
            </label>
          </div>
          <div class="col-xs-12 col-md-7">
            <q-input v-model.trim="formInternet.descarga_Mbps"
            placeholder="0"
            :type="$q.platform.is.mobile ? 'number' : 'text'"   
            :error="!validaciones.descarga_Mbps.isValid" 
            @update:model-value="validaciones.descarga_Mbps.isValid = true, formInternet.descarga_Mbps = parseInt(formInternet.descarga_Mbps.toString().replace(/\D/g, ''))"
            input-class="resaltarTextoInput" dense outlined>
              <template v-slot:error>
                <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                  {{ validaciones.descarga_Mbps.message }}
                </label>
              </template>
              <template v-slot:append>
                <q-badge filled color="blue-grey-6" 
                  style="height: 100%;width: 19%;position: absolute;right: 0px;justify-content: center;font-size:14px"
                 label="Mbps" />
              </template>
            </q-input>
          </div>
        </div>
      </div>
      <div class="col-xs-12 col-md-6">
        <div class="row">
          <div class="col-xs-12 col-md-4 flex items-center justify-end" 
            :class="[ $q.screen.width < 1022 ? 'justify-center q-mt-sm q-pb-xs' : 'texto-rigth q-pb-md']">
            <label :class="$q.screen.width < 1022 || 'q-pr-md'">
              Subida Mbps:
            </label>
          </div>
          <div class="col-xs-12 col-md-7">
            <q-input v-model.trim="formInternet.subida_Mbps"
            placeholder="0"
            :type="$q.platform.is.mobile ? 'number' : 'text'"   
            :error="!validaciones.subida_Mbps.isValid" 
            @update:model-value="validaciones.subida_Mbps.isValid = true, formInternet.subida_Mbps = parseInt(formInternet.subida_Mbps.toString().replace(/\D/g, ''))"
            input-class="resaltarTextoInput" dense outlined>
              <template v-slot:error>
                <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                  {{ validaciones.subida_Mbps.message }}
                </label>
              </template>
              <template v-slot:append>
                <q-badge filled color="blue-grey-6" 
                  style="height: 100%;width: 19%;position: absolute;right: 0px;justify-content: center;font-size:14px"
                 label="Mbps" />
              </template>
            </q-input>
          </div>
        </div>
      </div>

      <div class="col-xs-12 col-md-6">
        <div class="row">
          <div class="col-xs-12 col-md-4 flex items-center justify-end" 
            :class="[ $q.screen.width < 1022 ? 'justify-center q-mt-sm q-pb-xs' : 'justify-end q-pb-md']">
            <label :class="$q.screen.width < 1022 || 'q-pr-md'">
              Limit At:
            </label>
          </div>
          <div class="col-xs-12 col-md-7">
            <q-input v-model.trim="formInternet.limit_at"
              :type="$q.platform.is.mobile ? 'number' : 'text'"  
              placeholder="0"
              :error="!validaciones.limit_at.isValid" 
              @update:model-value="validaciones.limit_at.isValid = true, formInternet.limit_at = parseInt(formInternet.limit_at.toString().replace(/\D/g, ''))" 
              input-class="resaltarTextoInput" dense outlined>
              <template v-slot:error>
                <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                  {{ validaciones.limit_at.message }}
                </label>
              </template>
              <template v-slot:append>
                <q-icon name="fa-solid fa-percent" size="xs" />
              </template>
            </q-input>
          </div>
        </div>
      </div>
      <div class="col-xs-12 col-md-6">
        <div class="row">
          <div class="col-xs-12 col-md-4 flex items-center justify-end" 
            :class="[ $q.screen.width < 1022 ? 'justify-center q-mt-sm q-pb-xs' : 'justify-end q-pb-md']">
            <label :class="$q.screen.width < 1022 || 'q-pr-md'">
              Burst Limit:
            </label>
          </div>
          <div class="col-xs-12 col-md-7">
            <q-input v-model.trim="formInternet.burst_limit"
              placeholder="0"
              :type="$q.platform.is.mobile ? 'number' : 'text'"  
              :error="!validaciones.burst_limit.isValid" 
              @update:model-value="validaciones.burst_limit.isValid = true, formInternet.burst_limit = parseInt(formInternet.burst_limit.toString().replace(/\D/g, ''))" 
              input-class="resaltarTextoInput" dense outlined>
              <template v-slot:error>
                <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                  {{ validaciones.burst_limit.message }}
                </label>
              </template>
              <template v-slot:prepend>
                <q-icon name="fa-solid fa-plus" size="xs" />
              </template>
              <template v-slot:append>
                <q-icon name="fa-solid fa-percent" size="xs" />
              </template>
            </q-input>
          </div>
        </div>
      </div>
      
      <div class="col-xs-12 col-md-6">
        <div class="row">
          <div class="col-xs-12 col-md-4 flex items-center justify-end" 
            :class="[ $q.screen.width < 1022 ? 'justify-center q-mt-sm q-pb-xs' : 'justify-end q-pb-md']">
            <label :class="$q.screen.width < 1022 || 'q-pr-md'">
              Prioridad:
            </label>
          </div>
          <div class="col-xs-12 col-md-7">
            <q-select v-model="formInternet.prioridad" outlined dense 
              :error="!validaciones.prioridad.isValid" 
              @update:model-value="validaciones.prioridad.isValid = true" 
                emit-value map-options
                :options="[{ label: 'Baja (8)', value: 8 }, { label: 'Baja (7)', value: 7 }, { label: 'Normal (6)', value: 6 }, { label: 'Normal (5)', value: 5 }, { label: 'Normal (4)', value: 4 }, { label: 'Alto (3)', value: 3 }, { label: 'Alto (2)', value: 2 }, { label: 'Alto (1)', value: 1 }]">
              <template v-slot:error>
                <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                  {{ validaciones.prioridad.message }}
                </label>
              </template> 
            </q-select>
          </div>
        </div>
      </div>

      <div class="col-xs-12 col-md-6">
        <div class="row">
          <div class="col-xs-12 col-md-4 flex items-center justify-end" 
            :class="[ $q.screen.width < 1022 ? 'justify-center q-mt-sm q-pb-xs' : 'justify-end q-pb-md']">
            <label :class="$q.screen.width < 1022 || 'q-pr-md'">
              Addresslist:
            </label>
          </div>
          <div class="col-xs-12 col-md-7">
            <q-input v-model.trim="formInternet.address_list" 
              hint="*Opcional Lista personalizada ejm: habiliados"
              :error="!validaciones.address_list.isValid" 
              @update:model-value="validaciones.address_list.isValid = true" 
              input-class="resaltarTextoInput" dense outlined>
              <template v-slot:error>
                <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                  {{ validaciones.address_list.message }}
                </label>
              </template>
            </q-input>
          </div>
        </div>
      </div>
      
      <div v-if="listRouters.length > 1"
        class="col-xs-12 col-md-6">
        <div class="row">
          <div class="col-xs-12 col-md-4 flex items-center justify-end" 
            :class="[ $q.screen.width < 1022 ? 'justify-center q-mt-sm q-pb-xs' : 'justify-end q-pb-md']">
            <label :class="$q.screen.width < 1022 || 'q-pr-md'">
              Router:
            </label>
          </div>
          <div class="col-xs-12 col-md-7">
            <q-select v-model="formInternet.router_id" outlined dense 
              :error="!validaciones.router_id.isValid"
              emit-value map-options 
              @update:model-value="validaciones.router_id.isValid = true"
                :options="listRouters">
              <template v-slot:error>
                <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                  {{ validaciones.router_id.message }}
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
          icon="arrow_back" @click="$router.push('/servicios/internet')"
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