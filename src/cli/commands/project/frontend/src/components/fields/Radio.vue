<script setup lang="ts">
import { capitalize } from '@/utils/capitalize';

const props = defineProps<{
  options: string[];
}>();

const model = defineModel<string>({ required: true });
</script>

<template>
  <ul class="flex flex-wrap gap-4 px-4 text-sm">
    <li
      v-for="option in options"
      class="w-[calc(50%-8px)] flex bg-gray-100 dark:bg-mist-950 border border-rust/40 dark:border-gold/40 rounded-lg dark:text-beige text-center duration-300"
      :class="{
        'last:': options.length % 2 !== 0,
        'bg-gold/30! border-rust! dark:border-gold! text-rust! dark:text-white!': model === option,
      }"
    >
      <input type="radio" name="options" :id="option" :value="option" hidden v-model="model" />
      <label :for="option" class="block w-full p-2 rounded-lg cursor-pointer">{{ capitalize(option) }}</label>
    </li>
  </ul>
</template>
