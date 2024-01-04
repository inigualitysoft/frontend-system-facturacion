<script setup lang="ts">
  import { ref } from "vue";
  import { api } from "boot/axios";
  import { useAuthUserStore } from '../../stores/auth-user';
  import useHelpers from "../../composables/useHelpers";

  const isPwd = ref( true )
  const loading = ref( false )
  const form = ref({ email: 'juan@gmail.com', password: 'testing' });
  const { mostrarNotify } = useHelpers();

  const onSubmit = async () => {
    try {
      loading.value = true;

      const { data: { token } } = await api.post('/auth/login', form.value);
      
      const authUserStore = useAuthUserStore();

      authUserStore.setToken( token );

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

<template>
    <section class="area-login">
      <h1 class="title">Iniciar Sesion</h1>
      <div class="login">
        <div class="element-form">
          <img src="~assets/logo.png" 
            style="width: 80%;margin-left: 29px;margin-top: 48px;margin-bottom: 24px;" />
        </div>
        <form @submit.prevent="onSubmit" class="element-form q-mt-md">
            <q-input label-color="blue-grey-3" class="q-mb-lg"
              bg-color="blue-grey-10" filled label="Ingresa tu email"
              v-model.trim="form.email" required>

              <template v-slot:prepend>
                <q-icon name="person" color="blue-grey-3" />
              </template>
            </q-input>
  
            <q-input :type="isPwd ? 'password' : 'text'" label-color="blue-grey-3"
              filled bg-color="blue-grey-10" label="Ingresa tu contraseña"
              v-model.trim="form.password" required>
              <template v-slot:append>
                <q-icon :name="isPwd ? 'visibility_off' : 'visibility'" color="blue-grey"
                  class="cursor-pointer" @click="isPwd = !isPwd" />
              </template>
              <template v-slot:prepend>
                <q-icon name="key" color="blue-grey-3" />
              </template>
            </q-input>

            <q-btn label="Ingresar" class="q-px-xl" :loading="loading"
              type="submit" color="deep-purple-6" />
        </form>
      </div>
    </section>
</template>
  
<style >
.area-login {
display: flex;
height: 100vh;
flex-direction: column;
justify-content: center;
align-items: center;
gap: 10px;
background-color: #1b1f27;
}

.title {
color: #cbd0f7;
font-size: 22px;
font-weight: bold;
margin-bottom: 0px;
margin-top: 40px;
}

.login {
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;

background-color: #181920;
width: 340px;
height: 494px;
border-radius: 8px;
padding: 35px;
}

.login form {
display: flex;
flex-direction: column;
width: 100%;
}

.login input {
color: #cbd0f7;
border: none;
outline: none;
border-radius: 8px;
}

.login img {
width: 16rem;
height: auto;
margin-top: 84px;
margin-bottom: 17px;
}

input::placeholder {
color: #cbd0f7;
font-size: 14px;
text-transform: capitalize;
}

form [type="submit"] {
display: inline-block;
background-color: #5568fe;
font-size: 17px;
text-transform: uppercase;
font-weight: bold;
margin: 25px 0;
margin-top: 30px;
cursor: pointer;
opacity: 0.8;
}

form [type="submit"]:hover {
opacity: 1;
}
p a {
color: #5568fe;
text-decoration: none;
font-weight: 500;
}
.title, .login{
position: relative;
bottom: 4rem;
}
.element-form{
position: relative;
bottom: 2rem;
}
.crear-cuenta{
margin-bottom: 5rem;
}

</style>
  