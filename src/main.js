import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/main.css'
// import 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css'

const app = createApp(App)

app.use(router)

app.mount('#app')
