<script setup lang="ts">
  import { MikroClient } from 'mikro-client'
  import { ref, watch } from 'vue';
  import JWT from 'jwt-client'
  import { useAuthUserStore } from "stores/auth-user"
  import { api } from "boot/axios";
  import useHelpers from "../../../composables/useHelpers";

  const formMikrotik = ref({
    ip: '192.168.6.130',
    login: 'admin',
    password: ''
  })

  const onSubmit = async () => {
    try {
      const { data } = await api.post('/mikrotik', formMikrotik.value) ;      
      data.forEach(x => { console.table( x ); });
    } catch (error) {
      console.log( error );
    }
  }

</script>

<template>
  <div class="q-ma-lg q-pt-md">
    <div class="row q-col-gutter-lg">
      <div class="col-md-2"></div>
      <div class="col-xs-12 col-md-8">
        <q-card class="my-card">
          <q-card-section class="text-white q-py-sm" 
            :class="[!$q.dark.isActive ? 'bg-blue-grey-10' : '']">
            <div class="text-h6 text-center">Obtener IP</div>
          </q-card-section>

          <q-card-section class="q-pt-none" style="padding-bottom: 21px;">
            <q-form @submit="onSubmit">

              <div class="row q-pt-md">
                <div class="col-12 flex justify-center items-center q-mb-lg">
                  <img src="https://dev.socialidnow.com/images/9/94/Mikrotik-logo.png" 
                    style="width:30%" >
                </div>

                <div class="col-4 flex justify-end items-center">
                  <label>Ip a Conectarse:</label>
                </div>
                <div class="col-6 q-ml-md">
                  <q-input v-model.trim="formMikrotik.ip" dense outlined required />
                </div>
                <div class="col-4 flex justify-end items-center q-py-md">
                  <label for="">Login:</label>
                </div>
                <div class="col-6 q-ml-md q-py-md">
                  <q-input v-model.trim="formMikrotik.login" dense outlined required />
                </div>
                <div class="col-4 flex justify-end items-center">
                  <label>Password:</label>
                </div>
                <div class="col-6 q-ml-md">
                  <q-input v-model.trim="formMikrotik.password" dense outlined />
                </div>

                <div class="col-12  q-ml-md q-mt-lg text-center">
                  <q-btn type="submit" icon="save" outline rounded class="q-ml-lg" color="primary" >
                    &nbsp; Ejecutar
                  </q-btn>
                </div>
              </div>

            </q-form>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>
  

  