<script setup lang="ts">
import { onMounted } from 'vue';
import { useDevices } from '@/composables/useDevices';

const { devices, loading, error, fetchDevices } = useDevices();

onMounted(() => {
  fetchDevices();
});
</script>

<template>
  <div class="devices-view">
    <h1>Available Devices</h1>

    <div v-if="loading">Loading devices…</div>
    <div v-else-if="error">
      <p>Error: {{ error }}</p>
      <button @click="fetchDevices">Retry</button>
    </div>
    <div v-else-if="devices.length === 0">
      No devices found.
    </div>

    <ul v-else class="list">
      <li v-for="d in devices" :key="d.id" class="card">
        <strong>{{ d.brand }} {{ d.model }}</strong>
        <p>Category: {{ d.category }}</p>
        <p v-if="d.available !== undefined">
          Available: {{ d.available }}
        </p>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.devices-view {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}
.list {
  list-style: none;
  padding: 0;
  display: grid;
  gap: 1rem;
}
.card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  background: white;
}
</style>
