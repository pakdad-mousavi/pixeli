<script setup lang="ts">
import { capitalize } from '@/utils/capitalize';

const props = defineProps<{
  options: [string, string];
}>();

const modelValue = defineModel<boolean>({ required: true });
</script>

<template>
  <ul class="flex gap-4 text-sm px-4">
    <li
      class="w-1/2 p-2 bg-gray-100 dark:bg-mist-950 border border-rust/40 dark:border-gold/40 rounded-lg dark:text-beige text-center duration-300 cursor-pointer"
      :class="{ 'bg-gold/30! border-rust! dark:border-gold! text-rust! dark:text-white!': !modelValue }"
      @click="modelValue = false"
    >
      {{ capitalize(options[0]) }}
    </li>
    <li
      class="w-1/2 p-2 bg-gray-100 dark:bg-mist-950 border border-rust/40 dark:border-gold/40 rounded-lg dark:text-beige text-center duration-300 cursor-pointer"
      :class="{ 'bg-gold/30! border-rust! dark:border-gold! text-rust! dark:text-white!': modelValue }"
      @click="modelValue = true"
    >
      {{ capitalize(options[1]) }}
    </li>
  </ul>
</template>
