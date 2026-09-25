<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints, useStorage } from "@vueuse/core";
import { STORAGE_KEYS } from "@/utils/storageKeys";
import Grid from "@/components/icons/Grid.vue";
import { useFilesStore } from "@/stores/files";
import NoFiles from "@/components/icons/NoFiles.vue";
import { onMounted } from "vue";
import { animate, createDrawable } from "animejs";

const filesStore = useFilesStore();
const state = useStorage(STORAGE_KEYS.STATE.KEY, STORAGE_KEYS.STATE.DEFAULT);

const breakpoints = useBreakpoints(breakpointsTailwind);
const xlOrGreater = breakpoints.greaterOrEqual("xl");

onMounted(() => {
  if (!filesStore.selected.size) {
    animate(createDrawable(".no-files-icon"), {
      draw: ["0 0", "0 0.025"],
      duration: 300,
    });
  }
});
</script>

<template>
  <div class="h-full w-full flex relative">
    <!-- GRID MERGE DISPLAY -->
    <div
      class="p-4 duration-300"
      :class="{
        'w-[calc(100%-22rem)] ml-16': !state.isSidebarOpen || !xlOrGreater,
        'w-[calc(100%-36rem)] ml-72': state.isSidebarOpen && xlOrGreater,
      }"
    >
      <div v-if="!filesStore.selected.size" class="flex flex-col size-full items-center justify-center">
        <NoFiles class="stroke-rust dark:stroke-gold stroke-[0.5px] size-32 sm:size-40 no-files-icon"></NoFiles>
        <span class="font-serif max-w-xs text-center">No Files Selected Yet! Select which files to merge first.</span>
      </div>
    </div>
  </div>

  <!-- SIDE BAR -->
  <div
    class="fixed right-4 z-100 min-w-72 max-w-72 h-[calc(100vh-32px)] bg-white dark:bg-mist-900 rounded-xl overflow-hidden border border-rust/40 dark:border-gold/40 duration-300 transition-colors flex flex-col"
  >
    <div
      class="mb-4 bg-gold/5 p-4 border-b border-rust/40 dark:border-gold/40 text-rust dark:text-gold flex gap-x-2 items-center duration-300 transition-colors"
    >
      <Grid class="stroke-rust dark:stroke-zinc-100 size-5.5 stroke-2"></Grid>
      <span class="font-serif font-medium text-zinc-700 dark:text-zinc-100">Merge Settings</span>
    </div>
  </div>
</template>
