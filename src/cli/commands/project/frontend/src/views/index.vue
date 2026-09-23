<script setup lang="ts">
import UploadIcon from "@/components/icons/Upload.vue";

import { breakpointsTailwind, onClickOutside, useBreakpoints, useStorage, type Fn } from "@vueuse/core";
import { onMounted, ref, useTemplateRef, watch } from "vue";
import { animate, AutoLayout, createLayout, type DOMTarget } from "animejs";

import FileCard from "@/components/core/FileCard.vue";
import Toggle from "@/components/fields/Toggle.vue";

import { useFilesStore } from "@/stores/files";
import { STORAGE_KEYS } from "@/utils/storageKeys";

// -------------------------------------------------------

const fileStore = useFilesStore();
const state = useStorage(STORAGE_KEYS.STATE.KEY, STORAGE_KEYS.STATE.DEFAULT);

const breakpoints = useBreakpoints(breakpointsTailwind);
const smOrSmaller = breakpoints.smallerOrEqual("sm");
const xlOrGreater = breakpoints.greaterOrEqual("xl");

const selectionContainer = useTemplateRef("selection-container");
const selectionLayout = ref<AutoLayout | null>(null);
let stop: null | Fn = null;

const lastSelectedImageIdx = ref(-1);
const recursive = ref(true);

const updateGrid = (root: DOMTarget) => {
  root.classList.toggle("compact");
  root.classList.toggle("lg:grid-cols-2");
  root.classList.toggle("2xl:grid-cols-3");
  root.classList.toggle("md:grid-cols-2");
  root.classList.toggle("lg:grid-cols-4");
  root.classList.toggle("2xl:grid-cols-6");
};

// Toggle compact layout with animejs
const toggleCompactLayout = (instant?: boolean) => {
  if (!selectionLayout.value) return;
  selectionLayout.value.update(({ root }) => updateGrid(root), {
    duration: instant ? 0 : 300,
  });
};

const onEnter = (el: Element, done: () => void) => {
  animate(el, {
    y: [20, 0],
    opacity: [0, 1],
    duration: 300,
    ease: "inOut",
    onComplete: done,
  });
};

const onLeave = (el: Element, done: () => void) => {
  animate(el, {
    y: [0, -20],
    opacity: [1, 0],
    duration: 300,
    ease: "inOut",
    onComplete: done,
  });
};

const selectImage = (e: MouseEvent, imageDetails: { imagePath: string; index: number }) => {
  if (!stop) {
    stop = onClickOutside(selectionContainer.value, () => {
      lastSelectedImageIdx.value = -1;
      if (stop) stop();
      stop = null;
    });
  }

  if (!e.shiftKey || lastSelectedImageIdx.value < 0) {
    fileStore.toggleImageSelection(imageDetails.imagePath);
    lastSelectedImageIdx.value = imageDetails.index;
    return;
  }

  const increment = imageDetails.index > lastSelectedImageIdx.value ? 1 : -1;

  for (let i = lastSelectedImageIdx.value + increment; i !== imageDetails.index + increment; i += increment) {
    const image = fileStore.formattedImages[i]!;
    fileStore.toggleImageSelection(image.path);
  }

  lastSelectedImageIdx.value = imageDetails.index;
};

// Toggle compact layout in sizes sm or smaller
watch(smOrSmaller, (isSmOrSmaller) => {
  if (isSmOrSmaller) state.value.isCompact = true;
});

// Handle layout changes
watch(
  () => state.value.isCompact,
  () => toggleCompactLayout(),
);

// Handle image loading
watch(recursive, async (isRecursive) => {
  await fileStore.loadFiles(isRecursive);
});

onMounted(async () => {
  if (!selectionContainer.value) return;
  selectionLayout.value = createLayout(selectionContainer.value, {
    children: ".filecard, .filecard > *, .breadcrumbs",
    duration: 300,
    enterFrom: {
      transform: "translateY(100px) scale(.25)",
      opacity: 0,
      duration: 350, // Applied to the elements entering the layout
      ease: "out(3)", // Applied to the elements entering the layout
    },
  });

  if (state.value.isCompact) {
    toggleCompactLayout(true);
  }

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
      <div class="grid lg:grid-cols-2 2xl:grid-cols-3 gap-4 w-full pb-4 relative select-none" ref="selection-container">
        <TransitionGroup :css="false" @enter="onEnter" @leave="onLeave">
          <FileCard
            v-for="(image, index) in fileStore.formattedImages"
            :key="image.path"
            :image="image"
            :is-compact="state.isCompact"
            :is-selected="fileStore.selected.has(image.path)"
            class="filecard"
            :class="{ 'border-dashed border-rust!': lastSelectedImageIdx === index }"
            @click="
              (e: MouseEvent) =>
                selectImage(e, {
                  imagePath: image.path,
                  index,
                })
            "
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
          <Toggle :options="['normal', 'compact']" v-model="state.isCompact"></Toggle>
        </li>
        <li>
          <h2 class="text-xs px-4 my-4 font-light uppercase tracking-widest dark:text-beige">Load Recursively</h2>
          <Toggle :options="['non-recursive', 'recursive']" v-model="recursive"></Toggle>
        </li>
        <li class="px-4 py-8">
          <hr class="border-rust/40 dark:border-gold/40" />
        </li>
        <li>
          <h2 class="text-xs px-4 mb-4 font-light uppercase tracking-widest dark:text-beige">Image Selection</h2>
          <ul class="flex flex-wrap gap-4 px-4 text-sm">
            <li
              class="w-full p-2 bg-gray-100 dark:bg-mist-950 border border-rust/40 dark:border-gold/40 rounded-lg dark:text-beige text-center duration-150 cursor-pointer hover:border-rust active:translate-y-0.5 dark:hover:border-gold"
              @click="fileStore.selectAll()"
            >
              Select All
            </li>
            <li
              class="w-full p-2 bg-gray-100 dark:bg-mist-950 border border-rust/40 dark:border-gold/40 rounded-lg dark:text-beige text-center duration-150 cursor-pointer hover:border-rust active:translate-y-0.5 dark:hover:border-gold"
              @click="fileStore.deselectAll()"
            >
              Deselect All
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </div>
</template>
