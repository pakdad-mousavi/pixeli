<script setup lang="ts">
// Define image type
import type { useFilesStore } from '@/stores/files';
type Image = ReturnType<typeof useFilesStore>['formattedImages']['0'];

import Breadcrumbs from './Breadcrumbs.vue';
import { formatBytes } from '@/utils/formatBytes';
import FileUpload from '../icons/FileUpload.vue';

const props = defineProps<{
  image: Image;
  isCompact: boolean;
}>();
</script>

<template>
  <div class="bg-white dark:bg-mist-800 p-2 rounded-lg flex items-center gap-4 border border-zinc-200 dark:border-mist-700">
    <div class="min-w-max">
      <img
        v-if="image.size < 5 * 1024 * 1024"
        :src="`/fs/preview?path=${encodeURIComponent(image.path)}`"
        :alt="image.path"
        class="object-cover rounded-md border size-20"
      />
      <div v-else class="flex justify-center items-center relative border rounded-md border-rust dark:border-gold size-20">
        <div class="absolute size-10 rounded-full bg-rust/50 dark:bg-gold/30 blur-xl"></div>
        <FileUpload class="size-10 stroke-rust dark:stroke-gold"></FileUpload>
      </div>
    </div>
    <div class="flex flex-col gap-3 w-full">
      <Breadcrumbs :crumbs="image.sections" :compact="isCompact"></Breadcrumbs>
      <span class="line-clamp-1">{{ image.name }}</span>
      <div class="text-xs flex gap-x-2">
        <span>{{ formatBytes(image.size, 0) }}</span>
        <span class="text-mist-800/60 dark:text-mist-500">•</span>
        <span class="text-mist-800/60 dark:text-mist-500">{{ image.width }} x {{ image.height }}</span>
      </div>
    </div>
  </div>
</template>
