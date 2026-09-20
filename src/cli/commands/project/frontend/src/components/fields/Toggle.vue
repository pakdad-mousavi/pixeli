<script setup lang="ts">
defineProps<{
  options: [string, string];
  togglee: boolean;
  cb: () => void;
}>();
</script>

<template>
  <div
    class="flex gap-x-2 items-center bg-gray-100 dark:bg-mist-800 border border-rust/40 dark:border-gold/40 rounded-lg m-4 p-1.5 text-sm relative"
  >
    <div
      class="absolute left-1.5 h-[calc(100%-16px)] w-[calc(50%-6px)] bg-white dark:bg-mist-900 rounded-lg border border-rust dark:border-gold duration-500"
      :class="{ 'translate-x-0': !togglee, 'translate-x-full': togglee }"
    ></div>
    <div
      class="w-1/2 text-center py-2 relative z-10 cursor-pointer rounded-lg duration-150"
      :class="{ 'hover:bg-gray-200 dark:hover:bg-mist-700': togglee }"
      @click="() => (togglee ? cb() : '')"
    >
      {{ options[0] }}
    </div>
    <div
      class="w-1/2 text-center py-2 relative z-10 cursor-pointer rounded-lg duration-150"
      :class="{ 'hover:bg-gray-200 dark:hover:bg-mist-700': !togglee }"
      @click="() => (!togglee ? cb() : '')"
    >
      {{ options[1] }}
    </div>
  </div>
</template>
