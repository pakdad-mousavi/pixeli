<script setup lang="ts">
const toggleDark = () => {
  document.documentElement.classList.toggle('dark');
};
</script>

<template>
  <div class="w-full">123</div>
  <div
    class="min-w-80 bg-zinc-100 dark:bg-mist-900 rounded-xl overflow-hidden border border-gold/40 duration-300 transition-colors"
  >
    <div
      class="mb-4 bg-gold/5 p-4 border-b border-gold/40 text-rust dark:text-gold font-semibold flex gap-x-2 items-center duration-300 transition-colors"
      @click="toggleDark"
    >
      <Icon name="tabler:layout-sidebar" class="size-5"></Icon>
      <span class="uppercase font-serif">Grid Properties</span>
    </div>
    <div class="p-4">...</div>
  </div>
</template>
