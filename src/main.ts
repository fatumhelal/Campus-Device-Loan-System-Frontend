import { createApp } from 'vue';
import { createAuth0 } from '@auth0/auth0-vue';

import App from './App.vue';
import router from './router';
import { appConfig, buildAuth0Options } from './config/appConfig';

const app = createApp(App);

// ✅ Auth0 plugin (Week 7)
app.use(createAuth0(buildAuth0Options(appConfig)));

app.use(router);
app.mount('#app');
