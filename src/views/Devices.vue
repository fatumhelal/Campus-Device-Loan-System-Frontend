<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useAuth0 } from '@auth0/auth0-vue';
import { useDevices } from '@/composables/useDevices';

const { devices, loading, error, fetchDevices } = useDevices();
const { isAuthenticated, user } = useAuth0();

onMounted(() => {
  fetchDevices();
});


function hasPermission(permission: string): boolean {
  const perms = (user.value as any)?.permissions as string[] | undefined;
  return perms?.includes(permission) ?? false;
}

const isStudent = computed(() => hasPermission('reserve:device'));
const isStaff = computed(() => hasPermission('manage:devices'));
</script>

<template>
  <div class="devices-view">
    <h1>Available Devices</h1>

    <!-- STATES -->
    <div v-if="loading">Loading devices…</div>

    <div v-else-if="error">
      <p>Error: {{ error }}</p>
      <button @click="fetchDevices">Retry</button>
    </div>

    <div v-else-if="devices.length === 0">
      No devices found.
    </div>

    <!-- DEVICE LIST -->
    <ul v-else class="list">
      <li v-for="d in devices" :key="d.id" class="card">
        <strong>{{ d.brand }} {{ d.model }}</strong>
        <p>Category: {{ d.category }}</p>

        <!-- STUDENT -->
        <button v-if="isAuthenticated && isStudent">
          Reserve device
        </button>

        <!-- STAFF -->
        <div v-if="isAuthenticated && isStaff" class="staff-actions">
          <button>Mark collected</button>
          <button>Mark returned</button>
        </div>
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

.staff-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}
</style>
