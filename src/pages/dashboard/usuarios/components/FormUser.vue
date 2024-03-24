<script setup lang="ts">
import listPermisos from "../listPermisos.json";
import { useUser } from "../composables/useUser.js";
import { ref, onMounted, watch } from 'vue';
import { Screen } from 'quasar'

const props         = defineProps<{ edit: boolean }>();
const listCompanies = ref<{ label: string; value: string; ruc?: string, icon?: string }[]>([]);
const permisos      = ref<any>( listPermisos )
const sucursales    = ref<{}[]>([]);
const roles         = ref<{ label: string, value: string, permisos: string[] }[]>([]);
let cont = false;

  const {
    api,
    getCompanies,
    formUser,
    expanded,
    validaciones,
    showConfirmPass,
    showPass,
    onRejected,
    loading,
    onSubmit
  } = useUser();

  onMounted( async () => {
    await Promise.all([cargarCompanies(), getRolesAndPermisos()]);

    if ( props.edit && formUser.value.roles[0] == 'SUPER-ADMINISTRADOR' ){
      await Promise.resolve();
      permisos.value[0].disabled = true;
    }else{
      permisos.value[0].disabled = false;
    }

  })

  const cargarCompanies = async () => {
    listCompanies.value = [];

    const companies = await getCompanies();

    companies.forEach((companie: any) => {
      listCompanies.value.push({
        label:  companie.nombre_comercial,
        value:  companie.id
      })
    });
  }

  const getRolesAndPermisos = async () => {

    const { data } = await api.get('/roles-and-permisos');

    data.forEach((rol: any) => {
      roles.value.unshift({
        label:    rol.nombre,
        value:    rol.nombre,
        permisos: rol.permisos
      })
    });
  }

  const getPermisos = () => {
    const permisosFound = roles.value.find(( rol: any ) => rol.value == formUser.value.roles[0])

    if ( permisosFound?.label == 'SUPER-ADMINISTRADOR' )
      permisos.value[0].disabled = true;
    else
      permisos.value[0].disabled = false;

    formUser.value.permisos = permisosFound!.permisos
  }

  watch(
    () => formUser.value.permisos,
    ( permisos ) => {
      if( permisos.length > 0 )
        validaciones.value.permisos.isValid = true
      else
        validaciones.value.permisos.isValid = false
    }
  )

  watch(
    () => formUser.value.company,
    ( company ) => {
      getSucursales( formUser.value.company )
    }
  )

  const getSucursales = async( company_id: string ) => {
    sucursales.value = [];
    if ( !props.edit || cont ) formUser.value.sucursales = ['']

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
              <div class="col-xs-7 col-sm-6 q-ml-md">
                <q-input v-model.trim="formUser.fullName"
                @update:model-value="validaciones.fullName.isValid = true"
                :error="!validaciones.fullName.isValid"
                input-style="text-transform: uppercase;" dense outlined>
                  <template v-slot:error>
                    <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                      {{ validaciones.fullName.message }}
                    </label>
                  </template>
                </q-input>
              </div>

              <div class="col-4 flex justify-end items-center q-my-sm">
                <label>Usuario:</label>
              </div>
              <div class="col-xs-7 col-sm-6 q-ml-md q-my-sm">
                <q-input v-model.trim="formUser.usuario"
                  @update:model-value="validaciones.usuario.isValid = true"
                  :error="!validaciones.usuario.isValid"
                  dense outlined>
                  <template v-slot:error>
                    <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                      {{ validaciones.usuario.message }}
                    </label>
                  </template>
                  <template v-slot:append>
                    <q-icon name="person" size="1.3rem" />
                  </template>
                </q-input>
              </div>

              <div class="col-4 flex justify-end items-center">
                <label>Email:</label>
              </div>
              <div class="col-xs-7 col-sm-6 q-ml-md">
                <q-input v-model.trim="formUser.email"
                  @update:model-value="validaciones.email.isValid = true"
                  :error="!validaciones.email.isValid"
                  type="text" dense outlined>
                  <template v-slot:error>
                    <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                      {{ validaciones.email.message }}
                    </label>
                  </template>
                  <template v-slot:append>
                    <q-icon name="mail" size="1.2rem" />
                  </template>
                </q-input>
              </div>

              <div class="col-4 flex justify-end items-center q-my-sm">
                <label>Télefono Movil:</label>
              </div>
              <div class="col-xs-7 col-sm-6 q-ml-md q-my-sm">
                <q-input v-model="formUser.celular"
                  counter maxlength="10"
                  @keyup="formUser.celular = formUser.celular.replace(/\D/g, '')"
                  lazy-rules
                  @update:model-value="validaciones.celular.isValid = true"
                  :error="!validaciones.celular.isValid"
                  dense outlined>
                  <template v-slot:error>
                    <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                      {{ validaciones.celular.message }}
                    </label>
                  </template>
                  <template v-slot:append>
                    <q-icon name="call" size="1.2rem" />
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
              <div class="col-xs-7 col-sm-6 q-ml-md">
                <q-select color="orange"
                  transition-show="scale" transition-hide="scale"
                  outlined v-model="formUser.company" dense
                  @update:model-value="validaciones.company.isValid = true"
                  :error="!validaciones.company.isValid"
                  :options="listCompanies" emit-value map-options>
                  <template v-slot:error>
                    <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                      {{ validaciones.company.message }}
                    </label>
                  </template>
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
                class="col-xs-7 col-sm-6 q-ml-md q-mt-sm">
                <q-select v-model="formUser.roles[0]" outlined dense
                  transition-show="scale" transition-hide="scale"
                  :error="!validaciones.roles.isValid"
                  @update:model-value="validaciones.roles.isValid = true, getPermisos()"
                  :options="roles" emit-value map-options>
                  <template v-slot:error>
                    <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                      {{ validaciones.roles.message }}
                    </label>
                  </template>
                </q-select>
              </div>

              <div
              v-if="formUser.roles[0] !== '' && formUser.company.length !== 0 && formUser.roles[0] !== 'ADMINISTRADOR' && formUser.roles[0] !== 'SUPER-ADMINISTRADOR'"
                class="col-4 flex justify-end items-center q-mt-sm">
                <label>Sucursal:</label>
              </div>
              <div
              v-if="formUser.roles[0] !== '' && formUser.company.length !== 0 && formUser.roles[0] !== 'ADMINISTRADOR' && formUser.roles[0] !== 'SUPER-ADMINISTRADOR'"
                class="col-xs-7 col-sm-6 q-ml-md q-mt-sm">
                <q-select v-model="formUser.sucursales[0]" outlined dense required
                  emit-value map-options transition-show="scale" transition-hide="scale"
                  @update:model-value="validaciones.sucursales.isValid = true"
                  :error="!validaciones.sucursales.isValid"
                  :options="sucursales">
                  <template v-slot:error>
                    <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                      {{ validaciones.sucursales.message }}
                    </label>
                  </template>
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
              <div class="col-xs-7 col-sm-6 q-ml-md q-mt-sm">
                <q-select v-model="formUser.isActive" outlined dense
                  emit-value map-options
                :options="[{ label: 'Activo', value: true }, { label: 'Inactivo', value: false }]">
                  <template v-slot:append>
                    <q-icon v-if="formUser.isActive" size="1.2rem"
                      name="fa-solid fa-user-check" />
                    <q-icon v-else name="fa-solid fa-user-xmark" size="1.2rem" />
                  </template>
                </q-select>
              </div>

              <div class="col-4 flex justify-end items-center q-mt-sm">
                <label for="">Foto:</label>
              </div>
              <div class="col-xs-7 col-sm-6 q-ml-md q-mt-lg">
                <q-file dense outlined bottom-slots
                    accept=".jpg, .png, .jpeg" @rejected="onRejected"
                    @update:model-value="validaciones.foto.isValid = true"
                    :error="!validaciones.foto.isValid"
                    v-model="formUser.foto"
                    :label="formUser.foto_old == null ?
                      'Cargar Imagen' : formUser.foto_old">

                    <template v-slot:error>
                      <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                        {{ validaciones.foto.message }}
                      </label>
                    </template>

                    <template v-slot:prepend>
                      <q-icon name="fa-solid fa-image" />
                    </template>

                    <template v-slot:append>
                      <q-icon name="close"
                        v-if="typeof(formUser.foto) === 'object' && formUser.foto !== null"
                        @click.stop.prevent="formUser.foto = null" class="cursor-pointer" />
                    </template>

                  </q-file>
              </div>

              <div class="col-4 flex justify-end items-center q-my-sm"></div>
              <div class="col-6 q-ml-md q-my-sm"></div>

              <div class="col-4 flex justify-end items-center q-my-sm">
                <label for="">Horario Acceso:</label>
              </div>
              <div class="col-xs-7 col-sm-6 q-ml-md q-my-sm flex">
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
              <div class="col-xs-7 col-sm-6 q-ml-md q-my-sm">

                <div class="row">
                  <div class="col-xs-12 col-sm-5">
                    <q-input outlined v-model="formUser.horarios_time[0]" mask="time" dense>
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
                    <q-input outlined v-model="formUser.horarios_time[1]" mask="time" dense>
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

              <div class="col-11 flex justify-start items-center">
                <label class="text-h6 text-weight-medium"
                  :class="[$q.screen.xs ? 'q-my-md' : '']">
                  Nueva Contraseña:
                </label>
              </div>

              <div class="col-4 flex justify-end items-center">
                <label>Contraseña:</label>
              </div>
              <div class="col-xs-7 col-sm-6 q-ml-md">
                <q-input :type="showPass ? 'password' : 'text'" outlined dense
                  @update:model-value="validaciones.password.isValid = true"
                  :error="!validaciones.password.isValid"
                  v-model.trim="formUser.password">
                  <template v-slot:error>
                    <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                      {{ validaciones.password.message }}
                    </label>
                  </template>
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
              <div class="col-xs-7 col-sm-6 q-ml-md q-my-sm">
                <q-input :type="showConfirmPass ? 'password' : 'text'" outlined dense
                  @update:model-value="validaciones.confirmPassword.isValid = true"
                  :error="!validaciones.confirmPassword.isValid"
                  v-model.trim="formUser.confirmPassword">
                  <template v-slot:error>
                    <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                      {{ validaciones.confirmPassword.message }}
                    </label>
                  </template>
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
              <q-tree class="col-xs-11 col-sm-11 col-sm-11"
                :class="[$q.screen.xs ? 'offset-1' : '']"
                :default-expand-all="false"
                :nodes="permisos"
                label-key="label"
                node-key="value"
                control-color="deep-orange-14"
                tick-strategy="leaf"
                v-model:expanded="expanded"
                v-model:ticked="formUser.permisos" />

                <div v-if="!validaciones.permisos.isValid"
                  class="col-11 text-center"
                  :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                  <label>
                    {{ validaciones.permisos.message }}
                  </label>
                </div>
            </div>
          </div>

        </div>
      </q-card-section>

      <q-card-actions class="q-pb-md" :class="[ Screen.width < 600 ? 'justify-center q-ml-xl' : 'justify-between']">

        <q-btn v-if="Screen.width > 600"
          type="submit" icon="arrow_back" @click="$router.push('/usuarios')"
          outline rounded class="q-mr-lg"
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
</template>
