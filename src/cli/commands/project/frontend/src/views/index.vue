<script setup lang="ts">
// ICONS
import UploadIcon from '@/components/icons/Upload.vue';

// VUE / UTILS / ANIMATIONS
import { useFilesStore } from '@/stores/files';
import { AutoLayout, createLayout } from 'animejs';
import { onMounted, ref, useTemplateRef, watch } from 'vue';
import FileCard from '@/components/core/FileCard.vue';
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core';

const breakpoints = useBreakpoints(breakpointsTailwind);
const mdOrSmaller = breakpoints.smallerOrEqual('md');

const selectionContainer = useTemplateRef('selection-container');
const selectionLayout = ref<AutoLayout | null>(null);

const fileStore = useFilesStore();
const isCompact = ref(false);

const toggleCompactLayout = () => {
  if (!selectionLayout.value) return;

  selectionLayout.value.update(({ root }) => {
    root.classList.toggle('lg:grid-cols-2');
    root.classList.toggle('2xl:grid-cols-3');
    root.classList.toggle('lg:grid-cols-4');
    root.classList.toggle('2xl:grid-cols-6');

    const cards = selectionContainer.value!.children!;
    for (const card of cards) {
      card.classList.toggle('compact');
    }

    isCompact.value = !isCompact.value;
  });
};

watch(mdOrSmaller, (isMdOrSmaller) => {
  if (isMdOrSmaller) {
    if (!isCompact.value) {
      toggleCompactLayout();
    }
  }
});

onMounted(async () => {
  if (!selectionContainer.value) return;
  selectionLayout.value = createLayout(selectionContainer.value, {
    children: '.filecard, .filecard > *, .breadcrumbs',
    duration: 400,
  });

  if (!fileStore.isLoaded) {
    await fileStore.loadFiles();
  }
});
</script>

<template>
  <div class="h-full w-full flex justify-center">
    <!-- IMAGE UPLOAD -->
    <div class="w-[calc(100%-36rem)] p-4 mx-auto max-w-7xl">
      <div class="mb-4 flex flex-col justify-center">
        <h1 class="font-semibold text-3xl mb-2">Image Selection</h1>
        <p class="font-light">Add, remove or edit the images you want to merge.</p>
      </div>
      <div class="grid lg:grid-cols-2 2xl:grid-cols-3 gap-4 w-full pb-4 relative" ref="selection-container">
        <FileCard v-for="image in fileStore.formattedImages" :image="image" :is-compact="isCompact" class="filecard"></FileCard>
      </div>
    </div>

    <!-- UPLOAD SETTINGS (FIXED TO RIGHT) -->
    <div
      class="fixed right-4 z-100 min-w-72 h-[calc(100vh-32px)] bg-white dark:bg-mist-900 rounded-xl overflow-hidden border border-rust/40 dark:border-gold/40 duration-300 transition-colors"
    >
      <div
        class="mb-4 bg-gold/5 p-4 border-b border-rust/40 dark:border-gold/40 text-rust dark:text-gold flex gap-x-2 items-center duration-300 transition-colors"
      >
        <UploadIcon class="stroke-rust dark:stroke-zinc-100 size-5.5 stroke-2"></UploadIcon>
        <span class="font-serif font-medium text-zinc-700 dark:text-zinc-100">Upload Settings</span>
      </div>
      <div v-if="!mdOrSmaller">
        <h2 class="text-xs px-4 font-light uppercase tracking-widest dark:text-gold">Display Mode</h2>
        <!-- SWITCH -->
        <div
          class="flex gap-x-2 items-center bg-gray-100 dark:bg-mist-800 border border-rust/40 dark:border-gold/40 rounded-lg m-4 p-1.5 text-sm relative"
        >
          <div
            class="absolute left-1.5 h-[calc(100%-16px)] w-[calc(50%-6px)] bg-white dark:bg-mist-900 rounded-lg border border-rust dark:border-gold duration-500"
            :class="{ 'translate-x-0': !isCompact, 'translate-x-full': isCompact }"
          ></div>
          <div
            class="w-1/2 text-center py-2 relative z-10 cursor-pointer rounded-lg duration-150"
            :class="{ 'hover:bg-gray-200 dark:hover:bg-mist-700': isCompact }"
            @click="() => (isCompact ? toggleCompactLayout() : '')"
          >
            Normal
          </div>
          <div
            class="w-1/2 text-center py-2 relative z-10 cursor-pointer rounded-lg duration-150"
            :class="{ 'hover:bg-gray-200 dark:hover:bg-mist-700': !isCompact }"
            @click="() => (!isCompact ? toggleCompactLayout() : '')"
          >
            Compact
          </div>
        </div>
      </div>
      <div class="p-4 flex flex-col gap-2 text-rust dark:text-beige text-sm"></div>
      <h2 class="text-xs px-4 font-light uppercase tracking-widest dark:text-gold">Merge Modes</h2>
      <div class="p-4 flex flex-col gap-2 text-rust dark:text-beige text-sm" @click="toggleCompactLayout">test</div>
    </div>
  </div>
</template>
