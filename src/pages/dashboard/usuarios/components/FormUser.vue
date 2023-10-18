<script setup lang="ts">
import listPermisos from "../listPermisos.json";
import { useUser } from "../composables/useUser";
import { ref, onMounted, watch } from 'vue';
import { api } from "boot/axios";

const props = defineProps<{ edit: boolean }>();
const listCompanies = ref<{ label: string; value: string; ruc: string, icon: string }[]>([]);
let optionsCompanies: any = [];
const sucursales = ref<{}[]>([]);
let cont = false;

  const { 
    getCompanies,
    formUser, 
    expanded, 
    validateNumCelular, 
    allowOnlyNumber, 
    transformToUpperCase,
    showConfirmPass, 
    showPass,
    loading,
    onSubmit
  } = useUser();

  onMounted( async () => {
    const companies = await getCompanies();
    
    companies.forEach((companie: any) => {
      listCompanies.value.push({
        label:  companie.nombre_comercial,
        value:  companie.id
      })
    });
    optionsCompanies = listCompanies.value;    
  })
  
  watch(
    () => formUser.value.company,
    ( company ) => {
      if ( formUser.value.company !== '' ){
        getSucursales( company );
      } 
    }
  )
  
  const getSucursales = async( company_id: string ) => {
    sucursales.value = [];
    if ( !props.edit || cont ) {
      formUser.value.sucursales = []
    }
    cont = true;

    const { data } = await api.get(`/sucursal/find/${ company_id }/company`);

    data.forEach(( x: any) => {
      sucursales.value.push({ label: x.nombre, value: x.id })
    })      
  }
</script>

<template>
    <q-form @submit="onSubmit( props.edit )">
      <q-card class="my-card">

        <q-card-section class="q-pt-none">
          <div class="row q-pt-sm">
            <div class="col-xs-12 col-md-8">
              <div class="row">

                <div class="col-11 flex justify-start items-center">
                  <label class="text-h6 text-weight-medium">Datos:</label>
                </div>

                <div class="col-4 flex justify-end items-center">
                  <label>Nombre:</label>
                </div>
                <div class="col-6 q-ml-md">
                  <q-input v-model.trim="formUser.fullName" @keyup="transformToUpperCase" dense outlined required />
                </div>

                <div class="col-4 flex justify-end items-center q-my-sm">
                  <label>Usuario:</label>
                </div>
                <div class="col-6 q-ml-md q-my-sm">
                  <q-input v-model.trim="formUser.usuario" dense outlined required>
                    <template v-slot:append>
                      <q-icon name="person" size="1.3rem" />
                    </template>
                  </q-input>
                </div>

                <div class="col-4 flex justify-end items-center">
                  <label>Email:</label>
                </div>
                <div class="col-6 q-ml-md">
                  <q-input v-model.trim="formUser.email" type="email" dense outlined required>
                    <template v-slot:append>
                      <q-icon name="mail" size="1.2rem" />
                    </template>
                  </q-input>
                </div>

                <div class="col-4 flex justify-end items-center q-my-sm">
                  <label>Télefono Movil:</label>
                </div>
                <div class="col-6 q-ml-md q-my-sm">
                  <q-input v-model="formUser.celular" 
                    counter maxlength="10"
                    :rules="validateNumCelular"
                    @keyup="allowOnlyNumber" lazy-rules
                    dense outlined required>
                    <template v-slot:append>
                      <q-icon name="call" size="1.2rem" />
                    </template>
                  </q-input>
                </div>

                <div class="col-4 flex justify-end items-center q-mb-sm">
                  <label>Facebook:</label>
                </div>
                <div class="col-6 q-ml-md q-mb-sm">
                  <q-input v-model.trim="formUser.facebook" dense outlined>
                    <template v-slot:append>
                      <q-icon name="fa-brands fa-facebook" size="xs" />
                    </template>
                  </q-input>
                </div>
                
                <div class="col-4 flex justify-end items-center">
                  <label>Twitter:</label>
                </div>
                <div class="col-6 q-ml-md">
                  <q-input v-model.trim="formUser.twitter" dense outlined>
                    <template v-slot:append>
                      <q-icon name="fa-brands fa-square-x-twitter" size="xs" />
                    </template>
                  </q-input>
                </div>

                <div class="col-11 flex justify-start items-center" 
                  :class="[$q.screen.xs ? 'q-my-md' : '']">
                  <label class="text-h6 text-weight-medium">Configuración:</label>
                </div>

                <div class="col-4 flex justify-end items-center">
                  <label for="">Empresa:</label>
                </div>
                <div class="col-6 q-ml-md">
                  <q-select color="orange" 
                    transition-show="scale" transition-hide="scale" 
                    outlined v-model="formUser.company" dense 
                    :options="listCompanies" emit-value map-options
                    use-input input-debounce="0">

                    <template v-slot:no-option>
                      <q-item>
                        <q-item-section class="text-grey">
                          No hay resultados
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                </div>

                <div v-if="formUser.company.length !== 0"
                  class="col-4 flex justify-end items-center q-mt-sm">
                  <label>Rol:</label>
                </div>
                <div v-if="formUser.company.length !== 0"
                  class="col-6 q-ml-md q-mt-sm">
                  <q-select v-model="formUser.roles[0]" outlined dense required
                    transition-show="scale" transition-hide="scale" 
                  :options="['Super-Administrador', 'Administrador', 'Pagos', 'Soporte Tecnico', 'Vendedor']" />
                </div>

                <div 
                v-if="formUser.roles[0] !== '' && formUser.company.length !== 0 && formUser.roles[0] !== 'Administrador'"
                  class="col-4 flex justify-end items-center q-mt-sm">
                  <label>Establecimiento:</label>
                </div>
                <div 
                v-if="formUser.roles[0] !== '' && formUser.company.length !== 0 && formUser.roles[0] !== 'Administrador'"
                  class="col-6 q-ml-md q-mt-sm">
                  <q-select v-model="formUser.sucursales" outlined dense required
                    emit-value map-options transition-show="scale" transition-hide="scale" 
                    :options="sucursales" multiple stack-label>
                    <template v-slot:no-option>
                      <q-item>
                        <q-item-section class="text-grey">
                          No se encontro resultados
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                </div>
                
                <div class="col-4 flex justify-end items-center q-mt-sm">
                  <label for="">Estado:</label>
                </div>
                <div class="col-6 q-ml-md q-mt-sm">
                  <q-select v-model="formUser.isActive" outlined dense 
                    emit-value map-options
                  :options="[{ label: 'Activo', value: true }, { label: 'Inactivo', value: false }]">
                    <template v-slot:append>
                      <q-icon v-if="formUser.isActive" size="1.2rem"
                        name="fa-solid fa-user-check" color="blue-grey-7" />
                      <q-icon v-else name="fa-solid fa-user-xmark" size="1.2rem" color="blue-grey-7" />
                    </template>

                  </q-select>
                </div>

                <div class="col-4 flex justify-end items-center">
                  <label for="">Recibir correo soporte:</label>
                </div>
                <div class="col-6 q-ml-md">
                  <q-toggle color="green" size="lg" v-model="formUser.receiveSupportEmail"/>
                </div>
                <div class="col-4 flex justify-end items-center q-my-sm">
                  <!-- <label for="">Comisión Cobrador:</label> -->
                </div>
                <div class="col-6 q-ml-md q-my-sm">
                  <!-- <q-input v-model="formUser.confirmPassword" dense outlined />
                  <label style="font-size: 11px;" class="text-orange">
                    * Comisión a pagar por cada pago registrado por el operador.
                  </label> -->
                </div>
                <div class="col-4 flex justify-end items-center q-my-sm">
                  <label for="">Horario Acceso:</label>
                </div>
                <div class="col-6 q-ml-md q-my-sm flex"> 
                  <div style="display: flex;flex-direction: column;">
                    <q-toggle class="q-ml-sm" size="lg" val="Lunes"
                      v-model="formUser.horarios_dias"/>
                    <label class="q-ml-md">
                      Lunes
                    </label>
                  </div>
                  <div style="display: flex;flex-direction: column;">
                    <q-toggle class="q-ml-sm" size="lg" val="Martes"
                      v-model="formUser.horarios_dias"/>
                    <label class="q-ml-md">
                      Martes
                    </label>
                  </div>
                  <div style="display: flex;flex-direction: column;">
                    <q-toggle class="q-ml-sm" size="lg" val="Miercoles"
                      v-model="formUser.horarios_dias"/>
                    <label class="q-ml-md">
                      Miercoles
                    </label>
                  </div>
                  <div style="display: flex;flex-direction: column;">
                    <q-toggle class="q-ml-sm" size="lg" val="Jueves"
                      v-model="formUser.horarios_dias"/>
                    <label class="q-ml-md">Jueves</label>
                  </div>
                  <div style="display: flex;flex-direction: column;">
                    <q-toggle class="q-ml-sm" size="lg" val="Viernes"
                      v-model="formUser.horarios_dias"/>
                    <label class="q-ml-md">
                      Viernes
                    </label>
                  </div>
                  <div style="display: flex;flex-direction: column;">
                    <q-toggle class="q-ml-sm" size="lg" val="Sabado"
                      v-model="formUser.horarios_dias"/>
                    <label class="q-ml-md">
                      Sabado
                    </label>
                  </div>
                </div>
                <div class="col-4 flex justify-end items-center q-my-sm">
                  <label class="q-mb-md">Horario:</label>
                </div>
                <div class="col-6 q-ml-md q-my-sm">

                  <div class="row">
                    <div class="col-xs-12 col-sm-5">
                      <q-input outlined v-model="formUser.horarios_time[0]" mask="time" :rules="['time']" dense>
                        <template v-slot:append>
                          <q-icon name="access_time" class="cursor-pointer">
                            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                              <q-time v-model="formUser.horarios_time[0]">
                                <div class="row items-center justify-end">
                                  <q-btn v-close-popup label="Close" color="primary" flat />
                                </div>
                              </q-time>
                            </q-popup-proxy>
                          </q-icon>
                        </template>
                      </q-input>
                    </div>
                    <div class="col-xs-12 col-sm-5 offset-sm-1">
                      <q-input outlined v-model="formUser.horarios_time[1]" mask="time" :rules="['time']" dense>
                        <template v-slot:append>
                          <q-icon name="access_time" class="cursor-pointer">
                            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                              <q-time v-model="formUser.horarios_time[1]">
                                <div class="row items-center justify-end">
                                  <q-btn v-close-popup label="Close" color="primary" flat />
                                </div>
                              </q-time>
                            </q-popup-proxy>
                          </q-icon>
                        </template>
                      </q-input>
                    </div>
                  </div>

                </div>
                <div class="col-4 flex justify-end items-center">
                  <label for="">Token API:</label>
                </div>
                <div class="col-6 q-ml-md">
                  <q-input v-model="formUser.confirmPassword" dense outlined />
                </div>
                <div class="col-4 flex justify-end items-center">
                  <label for="">Activar clave API:</label>
                </div>
                <div class="col-6 q-ml-md">
                  <q-toggle color="green" size="lg" v-model="formUser.confirmPassword"/>
                </div>

                <div class="col-11 flex justify-start items-center">
                  <label class="text-h6 text-weight-medium" 
                    :class="[$q.screen.xs ? 'q-my-md' : '']">
                    Nueva Contraseña:
                  </label>
                </div>

                <div class="col-4 flex justify-end items-center">
                  <label>Contraseña:</label>
                </div>
                <div class="col-6 q-ml-md">
                  <q-input :type="showPass ? 'password' : 'text'" outlined dense
                    v-model.trim="formUser.password" :required="props.edit ? false : true">
                    <template v-slot:append>
                      <q-icon :name="showPass ? 'visibility_off' : 'visibility'" color="blue-grey"
                        class="cursor-pointer" @click="showPass = !showPass" />
                    </template>
                    <template v-slot:prepend>
                      <q-icon name="key" color="blue-grey-3" />
                    </template>
                  </q-input>
                </div>
                <div class="col-4 flex justify-end items-center q-my-sm">
                  <label for="">Repite Contraseña:</label>
                </div>
                <div class="col-6 q-ml-md q-my-sm">
                  <q-input :type="showConfirmPass ? 'password' : 'text'" outlined dense
                    v-model.trim="formUser.confirmPassword" :required="props.edit ? false : true">
                    <template v-slot:append>
                      <q-icon :name="showConfirmPass ? 'visibility_off' : 'visibility'" color="blue-grey"
                        class="cursor-pointer" @click="showConfirmPass = !showConfirmPass" />
                    </template>
                    <template v-slot:prepend>
                      <q-icon name="key" color="blue-grey-3" />
                    </template>
                  </q-input>
                </div>
              </div>
            </div>

            <div class="col-xs-11 col-md-4">
              <div class="row">
                <div class="col-11 flex justify-start items-center" 
                  :class="[$q.screen.xs ? 'q-my-md' : '']">
                  <label class="text-h6 text-weight-medium">Permisos:</label>
                </div>
                <q-tree class="col-11 col-sm-11"
                  :default-expand-all="false"
                  :nodes="listPermisos"
                  label-key="label"
                  node-key="value"
                  control-color="deep-orange-14"
                  tick-strategy="leaf"
                  v-model:expanded="expanded"
                  v-model:ticked="formUser.permisos" />
              </div>
            </div>

          </div>
        </q-card-section>

        <q-card-actions class="justify-end q-pb-md">
          <q-btn type="submit" icon="save" :loading="loading"
            outline rounded class="q-mr-lg" color="primary">
            &nbsp; Guardar Cambios
          </q-btn>
        </q-card-actions>

      </q-card>
    </q-form>
</template>
