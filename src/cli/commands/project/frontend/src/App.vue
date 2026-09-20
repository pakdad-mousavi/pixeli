<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';

// ICONS
import GridIcon from './components/icons/Grid.vue';
import MasonryIcon from './components/icons/Masonry.vue';
import CollageIcon from './components/icons/Collage.vue';
import TemplateIcon from './components/icons/Template.vue';
import UploadIcon from './components/icons/Upload.vue';
import SidebarIcon from './components/icons/Sidebar.vue';

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
    class="h-svh w-full dark:bg-mist-900 dark:bg-[repeating-radial-gradient(var(--color-zinc-800)_0,var(--color-zinc-800)_1px,transparent_1px,transparent_100%)] bg-[repeating-radial-gradient(var(--color-zinc-200)_0,var(--color-zinc-200)_1px,transparent_1px,transparent_100%)] bg-size-[20px_20px] duration-300 transition-colors"
  >
    <div class="flex w-full h-full p-4">
      <div
        class="fixed z-100 min-w-72 h-[calc(100vh-32px)] bg-white dark:bg-mist-900 rounded-xl overflow-hidden border border-rust/40 dark:border-gold/40 duration-300 transition-colors"
      >
        <div
          class="mb-4 bg-gold/5 p-4 border-b border-rust/40 dark:border-gold/40 text-rust dark:text-gold flex gap-x-2 items-center duration-300 transition-colors"
        >
          <SidebarIcon class="stroke-rust dark:stroke-zinc-100 size-5"></SidebarIcon>
          <span class="uppercase font-serif font-semibold text-zinc-700 dark:text-zinc-100">PIXELI</span>
        </div>
        <h2 class="text-xs px-4 font-light uppercase tracking-widest text-black dark:text-gold">Files and Folders</h2>
        <div class="p-4 flex flex-col gap-2 text-rust dark:text-beige text-sm">
          <RouterLink
            to="/"
            class="flex items-center gap-x-4 font-semibold px-2 py-2.5 rounded-md duration-150 hover:bg-zinc-200 dark:hover:bg-mist-800"
          >
            <UploadIcon class="stroke-rust dark:stroke-beige size-5.5 duration-150 stroke-2"></UploadIcon>
            <span class="duration-150">Upload Folders</span>
          </RouterLink>
        </div>
        <h2 class="text-xs px-4 font-light uppercase tracking-widest text-black dark:text-gold">Merge Modes</h2>
        <div class="p-4 flex flex-col gap-2 text-rust dark:text-beige text-sm">
          <RouterLink
            :to="page.link"
            class="flex items-center gap-x-4 font-semibold px-2 py-2.5 rounded-md duration-150 hover:bg-zinc-200 dark:hover:bg-mist-800"
            v-for="page in mergePages"
          >
            <component :is="page.icon" class="size-5.5 duration-150 stroke-rust dark:stroke-beige"></component>
            <span class="duration-150">{{ page.label }}</span>
          </RouterLink>
        </div>
      </div>
      <RouterView />
    </div>
  </div>
</template>
