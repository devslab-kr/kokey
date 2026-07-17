import { createApp } from 'vue'
import App from './App.vue'
import { vKokey } from '@devslab/kokey/vue'

createApp(App).directive('kokey', vKokey).mount('#app')
