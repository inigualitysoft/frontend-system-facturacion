<script setup lang="ts">
  import { ref } from "vue";
  import { useAuthUserStore } from '../../stores/auth-user';
  import useHelpers from "../../composables/useHelpers";

  const isPwd = ref( true )
  const loading = ref( false )
  const form = ref({ email: '', password: '' });
  const { api, mostrarNotify } = useHelpers();

  const onSubmit = async () => {
    try {
      loading.value = true;
      const { data: { token, permisos } } = await api.post('/auth/login', form.value);
      const authUserStore = useAuthUserStore();
      authUserStore.setToken( token );
      authUserStore.setPermisos( permisos );
      location.href ='/'
    } catch ( error: any ) {
      if(error.response.data.message == 'Credentials not valid(password)')
        mostrarNotify('warning', 'La contraseña esta incorrecta');
      if(error.response.data.message == 'Credentials not valid(email)')
        mostrarNotify('warning', 'El email esta incorrecto');
      loading.value = false;
    }
  }
</script>

<!-- PRUEBAS  -->
<template>
  <div class="container">
    <section class="image-section">
      <!-- <img src="/imgs/" class="side-image" /> -->
    </section>
    <section class="login-section">
      <div class="login-container">
        <div class="element-form">
          <img src="/imgs/inigualitySoft.png" class="logo" />
          <p class="slogan">INGRESA A TU CUENTA</p>
        </div>
        <form @submit.prevent="onSubmit" class="element-form">
          <q-input label-color="blue-grey-10" color="primary" class="q-mb-lg custom-input"
            bg-color="blue-2" filled label="Ingresa tu email" rounded outlined
            v-model.trim="form.email" required>
            <template v-slot:prepend>
              <q-icon name="person" color="blue-grey-10" />
            </template>
          </q-input>

          <q-input :type="isPwd ? 'password' : 'text'" label-color="blue-grey-10" class="q-mb-lg custom-input"
            bg-color="blue-2" filled text-color="#000000" label="Ingresa tu contraseña" rounded outlined
            v-model.trim="form.password" required>
            <template v-slot:append>
              <q-icon :name="isPwd ? 'visibility_off' : 'visibility'" color="blue-grey-10"
                class="cursor-pointer" @click="isPwd = !isPwd" />
            </template>
            <template v-slot:prepend>
              <q-icon name="key" color="blue-grey-10" />
            </template>
          </q-input>

          <q-btn label="Ingresar" class="q-px-xl" :loading="loading" type="submit" color="primary" />
        </form>
        <p class="footer-text">¡El sistema contable que necesitas!</p>
      </div>
    </section>
  </div>
</template>
<!-- FIN -->

<!-- ESTILOS CSS ESTILO LIBROS -->
<style >
.container {
  display: flex;
  flex-direction: row; /* Muestra los elementos en fila */
  height: 100vh;
  width: 100%;
  background-color: rgb(255, 255, 255); /* Fondo blanco para todo el contenedor */
}

.login-section {
  flex: 1; /* Ocupa todo el espacio disponible */
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-section {
  flex: 2; /* Ocupa el doble de espacio que la sección de login */
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: url(/imgs/login_fon.jpg);
  background-repeat: no-repeat;
  background-size: cover;
}

.login-container {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  box-shadow: 0 5px 15px rgba(108, 108, 108, 0.461);
  border-radius: 20px;
  padding: 35px;
  max-width: 400px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo {
  width: 220px; /* Ajusta el tamaño del logo según sea necesario */
}

.slogan {
  margin-top: 10px; /* Espacio superior entre el logo y el texto */
  font-size: 18px; /* Tamaño de fuente del texto */
  color: #333; /* Color del texto */
}

.element-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%; /* Ajusta el ancho del formulario al 100% */
}

.custom-input {
  width: 80%; /* Ajusta el ancho de los inputs al 80% */
}

.custom-input input {
  color: #000000 !important; /* Cambia el color del texto del input a negro */
}

.side-image {
  width: 500px;
  height: auto;
  object-fit: cover;
}

.footer-text {
  margin-top: 20px; /* Espacio superior del pie de página */
  font-size: 14px; /* Tamaño de fuente del pie de página */
  color: #666; /* Color del texto del pie de página */
  text-align: center; /* Alineación centrada del texto */
}

@media (max-width: 768px) {
  .container {
    flex-direction: column;
  }

  .login-section {
    flex: none;
    width: 100%;
    height: 100vh; /* Ocupa toda la altura del dispositivo móvil */
  }

  .image-section {
    display: none; /* Ocultar la imagen en dispositivos móviles */
  }
}
</style>
<!-- FIN -->
