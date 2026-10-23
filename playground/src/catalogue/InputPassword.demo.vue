<script setup lang="ts">
/** Catalogue demo: masked field, strength meter at each level, disabled state. */
import { ref } from "vue";
import { InputPassword } from "@vuedemonde";

const strong = ref("Vuedem0nd!kit");
const weak = ref("abc");
const empty = ref("");
</script>

<template>
  <div class="cat-demo cat-fill">
    <InputPassword v-model="strong" placeholder="Password" show-toggle strength aria-label="Account password" />
    <InputPassword v-model="weak" placeholder="Weak password" show-toggle strength aria-label="Weak password" />
    <InputPassword v-model="empty" placeholder="No toggle or meter" :show-toggle="false" aria-label="Plain password" />
    <InputPassword :model-value="'hidden'" placeholder="Disabled" disabled aria-label="Disabled password" />
  </div>
</template>
