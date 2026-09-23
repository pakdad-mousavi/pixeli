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
    <!-- <div
      class="absolute left-1.5 h-[calc(100%-16px)] w-[calc(50%-6px)] bg-white dark:bg-mist-900 rounded-lg border border-rust dark:border-gold"
      :class="{ 'translate-x-0': !togglee, 'translate-x-full': togglee }"
      :style="`transition-duration: ${duration || 500}ms;`"
    ></div>
    <div
      class="w-1/2 text-center py-2 relative z-10 cursor-pointer rounded-lg duration-150"
      :class="{ 'hover:bg-gray-200 dark:hover:bg-mist-800': togglee }"
      @click="() => (togglee ? cb() : '')"
    >
      {{ options[0] }}
    </div>
    <div
      class="w-1/2 text-center py-2 relative z-10 cursor-pointer rounded-lg duration-150"
      :class="{ 'hover:bg-gray-200 dark:hover:bg-mist-800': !togglee }"
      @click="() => (!togglee ? cb() : '')"
    >
      {{ options[1] }}
    </div> -->
  </ul>
</template>
