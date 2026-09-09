<script setup lang="ts">
// ICONS
import UploadIcon from '@/components/icons/Upload.vue';
import XIcon from '@/components/icons/X.vue';

// VUE / UTILS
import { useFilesStore } from '@/stores/files';
import { formatBytes } from '@/utils/formatBytes';
import { traverseFileTree } from '@/utils/traverseFileTree';

import { ref, useTemplateRef } from 'vue';

const fileInput = useTemplateRef('fileInput');
const fileStore = useFilesStore();

const isDraggingOver = ref(false);

const onFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const files = target?.files;

  if (files && files.length > 0) {
    fileStore.addFiles(files);
  }
};

const handleDrop = async (e: DragEvent) => {
  e.preventDefault();
  if (!fileInput.value) return;

  // Collect and parse files/folders from dataTransfer object
  const items = e.dataTransfer?.items;
  if (!items) return;

  const files = [];
  for (const item of items) {
    const entry = item.webkitGetAsEntry();
    if (entry) {
      const result = traverseFileTree(entry);
      files.push(result);
    }
  }

  // Resolve all files and update fileInput
  const resolvedFiles = (await Promise.all(files)).flat();

  const dataTransferWrapper = new DataTransfer();
  resolvedFiles.forEach((file) => dataTransferWrapper.items.add(file));
  fileInput.value.files = dataTransferWrapper.files;

  // Update state
  fileInput.value.dispatchEvent(new Event('change'));
  isDraggingOver.value = false;
};
</script>

<template>
  <div class="h-full w-full flex justify-center">
    <!-- IMAGE UPLOAD -->
    <div class="w-[calc(100%-40rem)] p-4">
      <div class="mb-4 flex flex-col justify-center">
        <h1 class="font-semibold text-3xl mb-2">Upload Images</h1>
        <p class="font-light">Upload your images below to get started. You can also upload a folder.</p>
      </div>
      <div
        class="relative cursor-pointer group mb-4"
        @click="fileInput?.click()"
        @dragover="
          (e) => {
            e.preventDefault();
            isDraggingOver = true;
          }
        "
        @dragenter="(e) => e.preventDefault()"
        @dragleave="isDraggingOver = false"
        @drop="handleDrop"
      >
        <div class="size-full relative overflow-hidden">
          <input type="file" multiple hidden @change="onFileChange" ref="fileInput" />
          <div
            class="absolute border border-dashed rounded-lg duration-150 z-10"
            :class="{
              'inset-10 border-rust dark:border-gold': isDraggingOver,
              'inset-4': !isDraggingOver,
            }"
          ></div>
          <div
            class="absolute border border-dashed rounded-lg duration-150 z-10"
            :class="{ 'inset-5 border-rust dark:border-gold': isDraggingOver, '-inset-1': !isDraggingOver }"
          ></div>

          <div
            class="border min-h-80 border-zinc-200 dark:border-mist-600 rounded-lg bg-[repeating-linear-gradient(180deg,var(--color-zinc-100)_0,var(--color-zinc-100)_1px,transparent_1px,transparent_100%),repeating-linear-gradient(90deg,var(--color-zinc-100)_0,var(--color-zinc-100)_1px,transparent_1px,transparent_100%)] dark:bg-[repeating-linear-gradient(180deg,var(--color-mist-700)_0,var(--color-mist-700)_1px,transparent_1px,transparent_100%),repeating-linear-gradient(90deg,var(--color-mist-700)_0,var(--color-mist-700)_1px,transparent_1px,transparent_100%)] bg-size-[25px_25px] flex flex-col items-center justify-center duration-150 p-4"
            :class="{
              'bg-white/90 backdrop-blur-md dark:bg-mist-800': !isDraggingOver,
              'bg-gold/10 dark:bg-gold/10': isDraggingOver,
            }"
          >
            <!-- <div v-if="isDropzoneMinified" class="absolute -top-4 w-full h-4 bg-amber-200"></div> -->
            <div class="flex flex-col text-center items-center">
              <div class="relative">
                <UploadIcon class="stroke-rust dark:stroke-gold size-16"></UploadIcon>
                <div class="absolute left-1/2 top-1/2 -translate-1/2 size-14 bg-rust dark:bg-gold rounded-full blur-3xl"></div>
              </div>
              <div>
                <h2 class="text-xl font-medium mb-2 tracking-wide">Drop Files and Folders Here</h2>
                <p class="text-zinc-800 dark:text-mist-300 max-w-120 mb-6 tracking-wide font-light">
                  Supported formats: JPEG, PNG, WebP, TIFF, and AVIF. Maximum batch size: 500 images.
                </p>
              </div>

              <button
                class="border rounded-md border-rust dark:border-gold px-4 py-1.5 bg-white dark:bg-mist-700 uppercase font-medium text-rust dark:text-gold duration-150 cursor-pointer"
              >
                Browse Files
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4 w-full pb-4">
        <TransitionGroup name="list">
          <div
            v-for="(file, index) in fileStore.files"
            :key="index"
            class="bg-white dark:bg-mist-800 p-2 rounded-lg flex items-center gap-4 border border-zinc-200 dark:border-mist-700 relative group hover:bg-rose-950/10 hover:border-rose-500 duration-150 cursor-pointer"
            :style="`transition-delay: ${index * 0.01}s`"
            @click="fileStore.removeFile(index)"
          >
            <img :src="fileStore.thumbnails[index]" :alt="file.name" class="w-16 aspect-square object-cover rounded-md border" />
            <div class="flex flex-col w-full font-serif">
              <div class="flex items-center gap-x-4">
                <span class="line-clamp-1 font-medium mr-auto">{{ file.name }}</span>
                <div
                  class="absolute rounded-full size-7 aspect-square bg-rose-200 dark:bg-rose-950 flex justify-center items-center -top-2 -right-2 opacity-0 group-hover:opacity-100 duration-150"
                >
                  <XIcon class="stroke-rose-500 scale-75"></XIcon>
                </div>
              </div>
              <div class="flex items-center text-sm my-2 text-zinc-600 dark:text-zinc-400 font-sans">
                <span class="flex-1">Uploading...</span>
                <span> {{ formatBytes(file.size, 0) }}</span>
              </div>
              <div class="h-2 rounded-full w-full bg-linear-to-r from-gold to-rust to-175% relative">
                <div class="ml-auto h-full rounded-r-full bg-zinc-200 dark:bg-mist-600 w-1/4 relative z-10"></div>
                <div class="absolute inset-0 bg-gold/50 blur-sm"></div>
              </div>
            </div>
          </div>
        </TransitionGroup>
      </div>
    </div>

    <!-- UPLOAD SETTINGS (FIXED TO RIGHT) -->
    <div
      class="fixed right-4 z-100 min-w-80 h-[calc(100vh-32px)] bg-white dark:bg-mist-900 rounded-xl overflow-hidden border border-gold/40 duration-300 transition-colors"
    >
      <div
        class="mb-4 bg-gold/5 p-4 border-b border-gold/40 text-rust dark:text-gold flex gap-x-2 items-center duration-300 transition-colors"
      >
        <UploadIcon class="stroke-rust dark:stroke-zinc-100 size-5.5 stroke-2"></UploadIcon>
        <span class="font-serif font-medium text-zinc-700 dark:text-zinc-100">Upload Settings</span>
      </div>
      <h2 class="text-xs px-4 font-light uppercase tracking-widest dark:text-gold">Files and Folders</h2>
      <div class="p-4 flex flex-col gap-2 text-rust dark:text-beige text-sm"></div>
      <h2 class="text-xs px-4 font-light uppercase tracking-widest dark:text-gold">Merge Modes</h2>
      <div class="p-4 flex flex-col gap-2 text-rust dark:text-beige text-sm"></div>
    </div>
  </div>
</template>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.list-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
