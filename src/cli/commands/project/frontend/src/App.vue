<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';

// ICONS
import GridIcon from './components/icons/Grid.vue';
import MasonryIcon from './components/icons/Masonry.vue';
import CollageIcon from './components/icons/Collage.vue';
import TemplateIcon from './components/icons/Template.vue';
import UploadIcon from './components/icons/Upload.vue';
import SidebarIcon from './components/icons/Sidebar.vue';

import { breakpointsTailwind, useBreakpoints, useStorage } from '@vueuse/core';
import { STORAGE_KEYS } from './utils/storageKeys.ts';
import { watch } from 'vue';

const breakpoints = useBreakpoints(breakpointsTailwind);
const lgOrSmaller = breakpoints.smallerOrEqual('xl');

const state = useStorage(STORAGE_KEYS.STATE.KEY, STORAGE_KEYS.STATE.DEFAULT);

watch(lgOrSmaller, (isLgOrSmaller) => {
  state.value.isSidebarOpen = !isLgOrSmaller;
});

const mergePages = [
  {
    link: '/grid',
    icon: GridIcon,
    label: 'Grid Merge',
  },
  {
    link: '/masonry',
    icon: MasonryIcon,
    label: 'Masonry Merge',
  },
  {
    link: '/collage',
    icon: CollageIcon,
    label: 'Collage Merge',
  },
  {
    link: '/template',
    icon: TemplateIcon,
    label: 'Template Merge',
  },
];
</script>

<template>
  <div
    class="h-svh w-full mx-auto dark:bg-mist-900 dark:bg-[repeating-radial-gradient(var(--color-zinc-800)_0,var(--color-zinc-800)_1px,transparent_1px,transparent_100%)] bg-[repeating-radial-gradient(var(--color-zinc-200)_0,var(--color-zinc-200)_1px,transparent_1px,transparent_100%)] bg-size-[20px_20px] duration-300 transition-colors"
  >
    <div class="flex w-full h-full p-4">
      <div
        class="fixed z-1000 w-72 min-w-72 h-[calc(100vh-32px)] bg-white dark:bg-mist-900 rounded-xl overflow-hidden border border-rust/40 dark:border-gold/40 duration-300"
        :class="{ 'w-16! min-w-16!': !state.isSidebarOpen }"
      >
        <div
          class="bg-gold/5 h-14 p-4 border-b border-rust/40 dark:border-gold/40 text-rust dark:text-gold flex gap-x-2 items-center duration-300 transition-colors cursor-pointer"
          :class="{ 'mb-4': state.isSidebarOpen }"
          @click="state.isSidebarOpen = !state.isSidebarOpen"
        >
          <SidebarIcon class="stroke-rust dark:stroke-zinc-100 size-5.5 min-w-5.5 m-1"></SidebarIcon>
          <span
            class="uppercase font-serif font-semibold text-zinc-700 dark:text-zinc-100 line-clamp-1"
            :class="{ hidden: !state.isSidebarOpen }"
          >
            Pixeli
          </span>
        </div>
        <h2
          class="text-xs px-4 font-light uppercase tracking-widest text-black dark:text-gold line-clamp-1"
          :class="{ hidden: !state.isSidebarOpen }"
        >
          Files and Folders
        </h2>
        <div class="p-4 flex flex-col gap-2 text-rust dark:text-beige text-sm">
          <RouterLink
            to="/"
            class="flex items-center justify-center gap-x-4 font-semibold size-8 rounded-md duration-150 hover:bg-zinc-200 dark:hover:bg-mist-800"
            :class="{ 'justify-start size-auto px-2 py-2.5': state.isSidebarOpen }"
          >
            <UploadIcon class="stroke-rust dark:stroke-beige size-5.5 duration-150 stroke-2"></UploadIcon>
            <span class="duration-150 line-clamp-1" :class="{ hidden: !state.isSidebarOpen }">Upload Folders</span>
          </RouterLink>
        </div>
        <h2
          class="text-xs px-4 font-light uppercase tracking-widest text-black dark:text-gold line-clamp-1"
          :class="{ hidden: !state.isSidebarOpen }"
        >
          Merge Modes
        </h2>
        <hr class="mx-4 border-rust/40 dark:border-gold/40" :class="{ hidden: state.isSidebarOpen }" />
        <div class="p-4 flex flex-col gap-4 text-rust dark:text-beige text-sm" :class="{ 'gap-2': state.isSidebarOpen }">
          <RouterLink
            :to="page.link"
            class="flex items-center justify-center gap-x-4 font-semibold size-8 rounded-md duration-150 hover:bg-zinc-200 dark:hover:bg-mist-800"
            :class="{ 'justify-start size-auto px-2 py-2.5': state.isSidebarOpen }"
            v-for="page in mergePages"
          >
            <component :is="page.icon" class="size-5.5 min-w-5.5 duration-150 stroke-rust dark:stroke-beige"></component>
            <span class="line-clamp-1 duration-150" :class="{ hidden: !state.isSidebarOpen }">{{ page.label }}</span>
          </RouterLink>
        </div>
      </div>
      <RouterView />
    </div>
  </div>

  <Transition>
    <div
      class="bg-zinc-300/50 dark:bg-mist-900/50 backdrop-blur-sm fixed inset-0 z-900"
      v-if="state.isSidebarOpen && lgOrSmaller"
      @click="state.isSidebarOpen = !state.isSidebarOpen"
    ></div>
  </Transition>
</template>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.3s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
