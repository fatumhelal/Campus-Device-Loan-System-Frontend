// src/main.ts
import { createApp } from 'vue';
import { createAuth0 } from '@auth0/auth0-vue';

import App from './App.vue';
import router from './router';
import { appConfig, buildAuth0Options } from './config/appConfig';

const app = createApp(App);

app.use(createAuth0(buildAuth0Options(appConfig)));
app.use(router);

app.mount('#app');
