<script setup lang="ts">
import UploadIcon from '@/components/icons/Upload.vue';

import { breakpointsTailwind, useBreakpoints, useStorage } from '@vueuse/core';
import { onMounted, ref, useTemplateRef, watch } from 'vue';
import { animate, AutoLayout, createLayout } from 'animejs';

import FileCard from '@/components/core/FileCard.vue';
import Toggle from '@/components/fields/Toggle.vue';

import { useFilesStore } from '@/stores/files';
import { STORAGE_KEYS } from '@/utils/storageKeys';

// -------------------------------------------------------

const breakpoints = useBreakpoints(breakpointsTailwind);
const smOrSmaller = breakpoints.smallerOrEqual('sm');
const xlOrGreater = breakpoints.greaterOrEqual('xl');

const selectionContainer = useTemplateRef('selection-container');
const selectionLayout = ref<AutoLayout | null>(null);

const fileStore = useFilesStore();
const isCompact = ref(false);

const state = useStorage(STORAGE_KEYS.STATE.KEY, STORAGE_KEYS.STATE.DEFAULT);

const recursive = ref(true);

// Toggle compact layout with animejs
const toggleCompactLayout = () => {
  const container = selectionContainer.value;
  if (!selectionLayout.value || !container || !container.children) return;

  selectionLayout.value.update(({ root }) => {
    root.classList.toggle('lg:grid-cols-2');
    root.classList.toggle('2xl:grid-cols-3');
    root.classList.toggle('md:grid-cols-2');
    root.classList.toggle('lg:grid-cols-4');
    root.classList.toggle('2xl:grid-cols-6');

    const cards = container.children;
    for (const card of Array.from(cards)) {
      card.classList.toggle('compact');
    }
  });
};

const onEnter = (el: Element, done: () => void) => {
  if (isCompact.value) {
    el.classList.toggle('compact');
  }

  animate(el, {
    y: [20, 0],
    opacity: [0, 1],
    duration: 300,
    ease: 'inOut',
    onComplete: done,
  });
};

const onLeave = (el: Element, done: () => void) => {
  animate(el, {
    y: [0, -20],
    opacity: [1, 0],
    duration: 300,
    ease: 'inOut',
    onComplete: done,
  });
};

// Toggle compact layout in sizes sm or smaller
watch(smOrSmaller, (isSmOrSmaller) => {
  if (isSmOrSmaller) isCompact.value = true;
});

// Handle layout changes
watch(isCompact, toggleCompactLayout);

// Handle image loading
watch(recursive, async (isRecursive) => {
  await fileStore.loadFiles(isRecursive);
});

onMounted(async () => {
  if (!selectionContainer.value) return;
  selectionLayout.value = createLayout(selectionContainer.value, {
    children: '.filecard, .filecard > *, .breadcrumbs',
    duration: 300,
    enterFrom: {
      transform: 'translateY(100px) scale(.25)',
      opacity: 0,
      duration: 350, // Applied to the elements entering the layout
      ease: 'out(3)', // Applied to the elements entering the layout
    },
  });

  if (!fileStore.isLoaded) {
    await fileStore.loadFiles(recursive.value);
  }
});
</script>

<template>
  <div class="h-full w-full flex">
    <!-- IMAGE LISTING -->
    <div
      class="p-4 duration-300"
      :class="{
        'w-[calc(100%-22rem)] ml-16': !state.isSidebarOpen || !xlOrGreater,
        'w-[calc(100%-36rem)] ml-72': state.isSidebarOpen && xlOrGreater,
      }"
    >
      <div class="mb-4 flex flex-col justify-center">
        <h1 class="font-semibold text-3xl mb-2">Image Selection</h1>
        <p class="font-light">Add, remove or edit the images you want to merge.</p>
      </div>
      <div class="grid lg:grid-cols-2 2xl:grid-cols-3 gap-4 w-full pb-4 relative" ref="selection-container">
        <TransitionGroup :css="false" @enter="onEnter" @leave="onLeave">
          <FileCard
            v-for="image in fileStore.formattedImages"
            :key="image.path"
            :image="image"
            :is-compact="isCompact"
            class="filecard"
          ></FileCard>
        </TransitionGroup>
      </div>
    </div>

    <!-- UPLOAD SETTINGS (FIXED TO RIGHT) -->
    <div
      class="fixed right-4 z-100 min-w-72 max-w-72 h-[calc(100vh-32px)] bg-white dark:bg-mist-900 rounded-xl overflow-hidden border border-rust/40 dark:border-gold/40 duration-300 transition-colors"
    >
      <div
        class="mb-4 bg-gold/5 p-4 border-b border-rust/40 dark:border-gold/40 text-rust dark:text-gold flex gap-x-2 items-center duration-300 transition-colors"
      >
        <UploadIcon class="stroke-rust dark:stroke-zinc-100 size-5.5 stroke-2"></UploadIcon>
        <span class="font-serif font-medium text-zinc-700 dark:text-zinc-100">Image Selection</span>
      </div>
      <ul>
        <li v-if="!smOrSmaller">
          <h2 class="text-xs px-4 my-4 font-light uppercase tracking-widest dark:text-beige">Display Mode</h2>
          <Toggle :options="['normal', 'compact']" v-model="isCompact"></Toggle>
        </li>
        <li>
          <h2 class="text-xs px-4 my-4 font-light uppercase tracking-widest dark:text-beige">Load Recursively</h2>
          <Toggle :options="['non-recursive', 'recursive']" v-model="recursive"></Toggle>
        </li>
      </ul>
    </div>
  </div>
</template>
<!-- <div class="p-4 flex flex-col gap-2 text-rust dark:text-beige text-sm"></div> -->
