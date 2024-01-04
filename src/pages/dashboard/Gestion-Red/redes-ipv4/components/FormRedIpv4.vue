<script setup lang="ts">
  import { ref, watch } from 'vue';
  import { useRedIpv4 } from "../composables/useRedIpv4";

  const props = defineProps<{ edit: boolean }>();
  const allowSelectCIDR = ref( true )
  let claseSelected = ref<string>('');
  let tipoIp = ref();

  const { 
    cargarRouter,
    formRed, 
    loading, 
    listRouter,
    validaciones,
    onSubmit 
  } = useRedIpv4( props.edit );

  const options = ref([
    {
      label: 'CLASE A',
      active: true,
      children: [
        { label: '8 (255.0.0.0 - 16777214 hosts, 16777216 IP)' },
        { label: '9 (255.128.0.0 - 8388606 hosts, 8388608 IP)' },
        { label: '10 (255.192.0.0 - 4194302 hosts, 4194304 IP)' },
        { label: '11 (255.224.0.0 - 2097150 hosts, 2097152 IP)' },
        { label: '12 (255.240.0.0 - 1048574 hosts, 1048576 IP)' },
        { label: '13 (255.248.0.0 - 524286 hosts, 524288 IP)' },
        { label: '14 (255.252.0.0 - 262142 hosts, 262144 IP)' },
        { label: '15 (255.254.0.0 - 131070 hosts, 131072 IP)' },
      ]
    },
    {
      label: 'CLASE B',
      active: true,
      children: [
        { label: '16 (255.255.0.0 - 65534 hosts, 65536 IP)' },
        { label: '17 (255.255.128.0 - 32766 hosts, 32768 IP)' },
        { label: '18 (255.255.192.0 - 16382 hosts, 16384 IP)' },
        { label: '19 (255.255.224.0 - 8190 hosts, 8192 IP)' },
        { label: '20 (255.255.240.0 - 4094 hosts, 4096 IP)' },
        { label: '21 (255.255.248.0 - 2046 hosts, 2048 IP)' },
        { label: '22 (255.255.252.0 - 1022 hosts, 1024 IP)' },
        { label: '23 (255.255.254.0 - 510 hosts, 512 IP)' },
      ]
    },
    {
      label: 'CLASE C',
      active: true,
      children: [
        { label: '24 (255.255.255.0 - 254 hosts, 256 IP)' },
        { label: '25 (255.255.255.128 - 126 hosts, 128 IP)' },
        { label: '26 (255.255.255.192 - 62 hosts, 64 IP)' },
        { label: '27 (255.255.255.224 - 30 hosts, 32 IP)' },
        { label: '28 (255.255.255.240 - 14 hosts, 16 IP)' },
        { label: '29 (255.255.255.248 - 6 hosts, 8 IP)' },
        { label: '30 (255.255.255.252 - 2 hosts, 4 IP)' },
        { label: '31 (255.255.255.254 - 0 hosts, 2 IP)' },
        { label: '32 (255.255.255.252 - 0 hosts, 1 IP)' },
      ]
    }
  ])

  const hasChild = (scope:any) => {
    return scope.opt.children.some((c: any) => c.label === formRed.value.cidr)
  }

  const obtenerClasePrivada = ( ip: string ) => {
    const octetos = ip.split('.').map(Number);

    if (octetos[0] === 10) {
      return 'Clase A'; // Clase A
    } else if (octetos[0] === 172 && octetos[1] >= 16 && octetos[1] <= 31) {
      return 'Clase B'; // Clase B
    } else if (octetos[0] === 192 && octetos[1] === 168) {
      return 'Clase C'; // Clase C
    }

  }

  const obtenerClaseIPPublica = (ip) => {
    // Convertir la dirección IP a un array de números
    var partes = ip.split('.').map(Number);

    // Verificar el primer octeto para determinar la clase
    if (partes[0] >= 1 && partes[0] <= 126) {
      return 'Clase A';
    } else if (partes[0] >= 128 && partes[0] <= 191) {
      return 'Clase B';
    } else if (partes[0] >= 192 && partes[0] <= 223) {
      return 'Clase C';
    } else {
      return 'No es una IP Privada o Publica';
    }
  }

  const onlyNumberAndPoint = ( event: any ) => {
    validaciones.value.red.isValid = true
    const soloNumerosYPuntos = event.target.value.replace(/[^0-9.]/g, "");
    formRed.value.red = soloNumerosYPuntos

     checkClasePerteneRed();
  }

  const esIPPrivada = (ip) => {
      // Convertir la dirección IP a un número entero
      function ipToNumber(ip) {
          const partes = ip.split('.');
          return partes.reduce((resultado, parte) => (resultado << 8) + parseInt(parte, 10), 0) >>> 0;
      }

      // Rangos de direcciones IP privadas
      const rangosPrivados = [
          { inicio: '10.0.0.0', fin: '10.255.255.255' },
          { inicio: '172.16.0.0', fin: '172.31.255.255' },
          { inicio: '192.168.0.0', fin: '192.168.255.255' }
      ];

      // Convertir la dirección IP de entrada a un número
      const ipNumerica = ipToNumber(ip);

      // Verificar si la dirección IP está en alguno de los rangos privados
      for (const rango of rangosPrivados) {
          const inicioNumerico = ipToNumber(rango.inicio);
          const finNumerico = ipToNumber(rango.fin);
          if (ipNumerica >= inicioNumerico && ipNumerica <= finNumerico) {
              return true; // Es una IP privada
          }
      }

      return false; // No es una IP privada
  }

  watch(
    () => formRed.value.cidr,
    ( cidr ) => { 
      checkIpClaseC( cidr );
      validaciones.value.cidr.isValid = true; 
  })
    
  const checkClasePerteneRed = () => {
    if( formRed.value.red.split('.').length == 4 
        && formRed.value.red.split('.')[3] != '' ) {

      const esPrivada = esIPPrivada(formRed.value.red);

      if (esPrivada) {
        claseSelected.value = obtenerClasePrivada( formRed.value.red );          
      }else{
        claseSelected.value = obtenerClaseIPPublica( formRed.value.red );          
      }

      if ( claseSelected.value != 'No es una IP Privada o Publica' ) {
        allowSelectCIDR.value = false;
        tipoIp.value = esPrivada
        if ( claseSelected.value == 'Clase A' ){
          options.value[0].active = true;
          options.value[1].active = true;
          options.value[2].active = true;
        } 
        if ( claseSelected.value == 'Clase B' ){
          options.value[0].active = false;
          options.value[1].active = true;
          options.value[2].active = true;
        } 
        if ( claseSelected.value == 'Clase C' ){
          options.value[0].active = false
          options.value[1].active = false
          options.value[2].active = true
        } 
      }else{
        tipoIp.value = null;
        allowSelectCIDR.value = true;
        validaciones.value.red.isValid = false;
        validaciones.value.red.message = claseSelected.value;
      }
    }else{
      allowSelectCIDR.value = true;
    }
  }

  const checkIpClaseC = ( cidr: any ) => {
    if ( formRed.value.cidr.length > 0 ) {
      const mascara  = cidr.split('-')[0].split(' ')[1].split('(')[1].split('.');  
      const prefijo  = parseInt(cidr.split('-')[0].split(' ')[0]);
      const arrayRed = formRed.value.red.split('.');

      if ( claseSelected.value == 'Clase C' ) {
        arrayRed.splice( 3, 1 );  
        formRed.value.red = `${ arrayRed.join('.') }.${ mascara[3] }`        
      }
      if ( claseSelected.value == 'Clase B' ) {
        if ( prefijo >= 16 && prefijo <= 23 ) {
          arrayRed.splice( 2, 2 );  
          formRed.value.red = `${ arrayRed.join('.') }.${ mascara[2] }.0 `        
        }else{
          arrayRed.splice( 3, 1 );  
          formRed.value.red = `${ arrayRed.join('.') }.${ mascara[3] }`        
        }        
      } 
      if ( claseSelected.value == 'Clase A' ) {
        if ( prefijo >= 8 && prefijo <= 15 ) {
          arrayRed.splice( 1, 3 );  
          formRed.value.red = `${ arrayRed.join('.') }.${ mascara[1] }.0.0 `        
        }else if( prefijo >= 16 && prefijo <= 23 ) {
          arrayRed.splice( 2, 2 );  
          formRed.value.red = `${ arrayRed.join('.') }.${ mascara[2] }.0 `        
        }else{
          arrayRed.splice( 3, 1 );  
          formRed.value.red = `${ arrayRed.join('.') }.${ mascara[3] }`        
        }        
      } 
    }
  }

  watch(
    () => formRed.value.red,
    ( cidr ) => { 
      setTimeout(() => {
        if ( formRed.value.cidr.length > 1 && 
            formRed.value.red.split('.').length == 4 && 
              formRed.value.red.split('.')[3] != '' ) {
          const arrayRed = formRed.value.red.split('.');
          const claseC = options.value[2].children;
          let mascaras: any = [];

          claseC.forEach( x => {
            let mascara = parseInt(x.label.split('-')[0].split(' ')[1].split('(')[1].split('.')[3])
            mascaras.push( mascara )
          })
            if( !mascaras.includes(parseInt(arrayRed[3])) )
              formRed.value.cidr = ''
        }
      }, 2000)
    }
  )

  cargarRouter();
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
              Nombre:
            </label>
          </div>
          <div class="col-xs-12 col-md-7">
            <q-input v-model.trim="formRed.nombre" 
            placeholder="nombre de red"
            :error="!validaciones.nombre.isValid" 
            @update:model-value="formRed.nombre = formRed.nombre.toUpperCase(), validaciones.nombre.isValid = true"
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
            :class="[ $q.screen.width < 1022 ? 'justify-center q-mt-sm q-pb-xs' : 'justify-end q-pb-md']">
            <label :class="$q.screen.width < 1022 || 'q-pr-md'">
              Router:
            </label>
          </div>
          <div class="col-xs-12 col-md-7">
            <q-select dense v-model.trim="formRed.router_id" outlined 
              :error="!validaciones.router_id.isValid" 
              @update:model-value="validaciones.router_id.isValid = true" 
              emit-value map-options
              :options="listRouter">
                <template v-slot:error>
                  <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                    {{ validaciones.router_id.message }}
                  </label>
                </template>
              </q-select>
          </div>
        </div>
      </div>

      <div class="col-xs-12 col-md-6">
        <div class="row">
          <div class="col-xs-12 col-md-4 flex items-center justify-end" 
            :class="[ $q.screen.width < 1022 ? 'justify-center q-mt-sm q-pb-xs' : 'texto-rigth q-pb-md']">
            <label :class="$q.screen.width < 1022 || 'q-pr-md'">
              Red:
            </label>
          </div>
          <div class="col-xs-12 col-md-7">
            <q-input v-model.trim="formRed.red"
            :error="!validaciones.red.isValid" 
            @keyup="onlyNumberAndPoint($event)"
            input-style="padding-right: 27px;"         
            input-class="resaltarTextoInput" dense outlined>
              <template v-slot:error>
                <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                  {{ validaciones.red.message }}
                </label>
              </template>
              <template v-slot:append>
                <q-badge outlined color="blue-grey-6" 
                  style="height: 100%;width: 19%;position: absolute;right: 0px;justify-content: center;font-size:14px; cursor: pointer;">
                  <q-icon name="fa-solid fa-network-wired" size="xs" />
                </q-badge>
              </template>
              <template v-slot:hint>
                <label v-if="formRed.red.split('.').length < 4 || formRed.red.split('.')[3] == ''">                  
                  Ejm: 192.168.1.0
                </label>
                <label v-else-if="tipoIp != null" 
                style="font-size: 13px"
                :class="$q.dark.isActive ? 'text-green-6' : 'text-green-9'">                  
                  {{ tipoIp ? 'IP Privada' : 'IP Publica' }}
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
              CIDR:
            </label>
          </div>
          <div class="col-xs-12 col-md-7">
            <q-select outlined v-model="formRed.cidr"
              :options="options" dense
              :error="!validaciones.cidr.isValid" 
              :readonly="allowSelectCIDR"
              color="teal" clearable options-selected-class="text-deep-orange-8">
              <template v-slot:option="scope">
                <q-expansion-item
                  expand-separator
                  :disable="!scope.opt.active"
                  group="somegroup"
                  :default-opened="hasChild(scope)"
                  header-class="text-weight-bold"
                  header-style="text-align: center;"
                  :label="scope.opt.label">

                    <q-expansion-item 
                      v-for="child in scope.opt.children"
                      :key="child"
                      hide-expand-icon clickable
                      v-close-popup
                      :class="(formRed.cidr === child.label && !$q.dark.isActive) 
                        ? 'bg-indigo-3' 
                        : (formRed.cidr === child.label && $q.dark.isActive) ? 'bg-deep-purple-13' : ''"   
                      dense-toggle :label="child.label" :header-inset-level="0"
                      @click="formRed.cidr = child.label">
                    </q-expansion-item>
                </q-expansion-item>
              </template>
              <template v-slot:error>
                <label :class="$q.dark.isActive ? 'text-red-4' : 'text-negative'">
                  {{ validaciones.cidr.message }}
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