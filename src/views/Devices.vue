<script setup lang="ts">
import { onMounted, computed, ref, watch } from 'vue';
import { useAuth0 } from '@auth0/auth0-vue';
import { useDevices } from '@/composables/useDevices';

const { devices, loading, error, fetchDevices, reserveDevice } = useDevices();
const { isAuthenticated, user } = useAuth0();

const showSignInHint = ref(false);
const reserveError = ref<string | null>(null);
const reservationMessage = ref<string | null>(null);
const subscriptionMessage = ref<string | null>(null);


onMounted(() => {
  fetchDevices();
});

watch(isAuthenticated, () => {
  fetchDevices();
});

// ✅ ROLE DETECTION (UNCHANGED)
const isStaff = computed(() => {
  const u = user.value as any;
  return !!u?.email?.startsWith('staff');
});

const isStudent = computed(() => {
  const u = user.value as any;
  return isAuthenticated.value && !u?.email?.startsWith('staff');
});

const visibleDevices = computed(() => {
  if (isStaff.value) {
    // Staff see ONLY reserved devices
    return devices.value.filter(d => d.isAvailable === false);
  }

  // Students & unauthenticated users see all devices
  return devices.value;
});

function handleDeviceClick() {
  if (!isAuthenticated.value) {
    showSignInHint.value = true;
  }
}

async function handleReserve(deviceId: string) {
  reserveError.value = null;
  reservationMessage.value = null;

  try {
    const result = await reserveDevice(deviceId);

    const returnDate = result?.returnBy
      ? new Date(result.returnBy).toLocaleDateString()
      : new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString();

    reservationMessage.value =
      `Device reserved successfully. Return by ${returnDate}.`;
  } catch (e) {
    reserveError.value =
      e instanceof Error ? e.message : 'Failed to reserve device';
  }
}

async function handleMarkCollected(deviceId: string) {
  reserveError.value = null;
  reservationMessage.value = null;

  try {
    const base = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '');
    await fetch(`${base}/devices/${deviceId}/collect`, { method: 'POST' });

    reservationMessage.value = 'Device marked as collected.';
    await fetchDevices();
  } catch {
    reserveError.value = 'Failed to mark device as collected';
  }
}

async function handleMarkReturned(deviceId: string) {
  reserveError.value = null;
  reservationMessage.value = null;

  try {
    const base = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '');
    await fetch(`${base}/devices/${deviceId}/return`, { method: 'POST' });

    reservationMessage.value = 'Device marked as returned.';
    await fetchDevices();
  } catch {
    reserveError.value = 'Failed to mark device as returned';
  }
}

async function handleSubscribe(model: string) {
  reserveError.value = null;
  subscriptionMessage.value = null;

  try {
    const email = (user.value as any)?.email;
    if (!email) throw new Error('No user email');

    const notifyBase =
      import.meta.env.VITE_NOTIFICATION_API_BASE_URL.replace(/\/$/, '');

    await fetch(`${notifyBase}/subscriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, email }),
    });

    subscriptionMessage.value =
      `You will be notified when ${model} becomes available.`;
  } catch {
    reserveError.value = 'Failed to subscribe for notifications';
  }
}

</script>

<template>
  <div class="devices-view">
    <h1>{{ isStaff ? 'Manage Loans' : 'Available Devices' }}</h1>

    <div v-if="showSignInHint && !isAuthenticated" class="signin-hint">
      Sign in to reserve a device.
    </div>

    <div v-if="reserveError" class="signin-hint">
      {{ reserveError }}
    </div>

    <div v-if="reservationMessage" class="signin-hint">
      {{ reservationMessage }}
    </div>

    <div v-if="subscriptionMessage" class="signin-hint">
      {{ subscriptionMessage }}
    </div>

    <div v-if="loading">Loading devices…</div>

    <div v-else-if="error">
      <p>Error: {{ error }}</p>
      <button @click="fetchDevices">Retry</button>
    </div>

    <div v-else-if="devices.length === 0">
      No devices found.
    </div>

    <ul v-else class="list">
      <li
        v-for="d in visibleDevices"
        :key="d.id"

        class="card"
        @click="handleDeviceClick"
      >
        <strong>{{ d.brand }} {{ d.model }}</strong>
        <p>Category: {{ d.category }}</p>

        <p v-if="isAuthenticated">
          Available: <strong>{{ d.isAvailable ? 1 : 0 }}</strong>
        </p>

        <!-- STUDENT ONLY -->
        <div style="margin: 0.5rem 0;">
          <button
            v-if="isAuthenticated && isStudent && d.isAvailable"
            @click.stop="handleReserve(d.id)"
          >
            Reserve device
          </button>
        <button
          v-if="isAuthenticated && isStudent && !d.isAvailable"
          @click.stop="handleSubscribe(d.model)"
        >
          Notify me when available
        </button>
        </div>

        <!-- STAFF ONLY -->
        <div v-if="isAuthenticated && isStaff" class="staff-actions">
          <button @click.stop="handleMarkCollected(d.id)">
            Mark collected
          </button>
          <button @click.stop="handleMarkReturned(d.id)">
            Mark returned
          </button>
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

.signin-hint {
  margin-bottom: 1rem;
  padding: 0.75rem 1rem;
  background: #eef2ff;
  border: 1px solid #c7d2fe;
  color: #1e3a8a;
  border-radius: 6px;
  font-size: 0.95rem;
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
  cursor: pointer;
}

.card:hover {
  background: #f9fafb;
}

.staff-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}
</style>
