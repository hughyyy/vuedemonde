import { createApp } from "vue";
import "@vuedemond/theme.css";
import "@vuedemond/kit.css";
import { FormDirectives } from "@vuedemond/kit/directives";
import App from "./src/App.vue";

createApp(App).use(FormDirectives).mount("#app");
