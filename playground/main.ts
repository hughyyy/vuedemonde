import { createApp } from "vue";
import "@vuedemonde/theme.css";
import "@vuedemonde/kit.css";
import { FormDirectives } from "@vuedemonde/kit/directives";
import App from "./src/App.vue";

createApp(App).use(FormDirectives).mount("#app");
