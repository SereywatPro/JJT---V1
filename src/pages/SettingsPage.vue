<template>
  <Layout>
    <div class="max-w-2xl mx-auto space-y-6">
      <h2 class="text-xl font-bold">Settings</h2>

      <!-- Account -->
      <Card>
        <h3 class="text-sm font-semibold mb-4 text-neutral-300">Account & Risk</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input v-model.number="form.starting_balance" label="Starting Balance ($)" type="number" step="0.01" />
          <Input v-model.number="form.default_risk_pct" label="Default Risk (%)" type="number" step="0.1" />
          <Input v-model.number="form.daily_loss_limit" label="Daily Loss Limit ($)" type="number" step="0.01" />
          <Input v-model.number="form.max_trades_per_day" label="Max Trades / Day" type="number" step="1" />
        </div>
      </Card>

      <!-- Lists -->
      <Card>
        <h3 class="text-sm font-semibold mb-4 text-neutral-300">Symbols</h3>
        <ChipInput v-model="form.symbols" placeholder="Add symbol..." />
      </Card>
      <Card>
        <h3 class="text-sm font-semibold mb-4 text-neutral-300">Setups</h3>
        <ChipInput v-model="form.setups" placeholder="Add setup..." />
      </Card>
      <Card>
        <h3 class="text-sm font-semibold mb-4 text-neutral-300">Mistake Tags</h3>
        <ChipInput v-model="form.mistake_tags" placeholder="Add tag..." />
      </Card>

      <!-- Integration -->
      <Card>
        <h3 class="text-sm font-semibold mb-4 text-neutral-300">Google Sheets Integration</h3>
        <div class="space-y-3">
          <Input
            v-model="form.gas_url"
            label="Apps Script Web App URL"
            placeholder="https://script.google.com/macros/s/.../exec"
          />
          <div class="flex items-center gap-3">
            <Button variant="outline" size="sm" @click="testConnection" :disabled="testing">
              <Spinner v-if="testing" size="sm" />
              <span v-else>Test Connection</span>
            </Button>
            <span v-if="gasStatus === true" class="text-xs text-profit-400 flex items-center gap-1">
              <CheckCircle :size="14" /> Connected
            </span>
            <span v-else-if="gasStatus === false" class="text-xs text-loss-400 flex items-center gap-1">
              <XCircle :size="14" /> Connection failed
            </span>
          </div>
          <a
            v-if="form.gas_url"
            :href="`https://docs.google.com/spreadsheets/d/${sheetId}`"
            target="_blank"
            class="inline-flex items-center gap-1 text-xs text-blue-400 hover:underline"
          >
            <ExternalLink :size="12" /> Open in Google Sheets
          </a>
        </div>
      </Card>

      <!-- Save -->
      <div class="flex justify-end">
        <Button @click="save" :disabled="saving">
          <Spinner v-if="saving" size="sm" />
          <span v-else>Save Settings</span>
        </Button>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { CheckCircle, XCircle, ExternalLink } from '@lucide/vue'
import Layout from '../components/layout/Layout.vue'
import Card from '../components/ui/Card.vue'
import Input from '../components/ui/Input.vue'
import Button from '../components/ui/Button.vue'
import Spinner from '../components/ui/Spinner.vue'
import ChipInput from '../components/ui/ChipInput.vue'
import { useSettingsStore } from '../stores/settings'
import { pingGAS, setGasUrl } from '../lib/gas'

const store = useSettingsStore()
const testing = ref(false)
const saving = ref(false)
const gasStatus = ref<boolean | null>(null)
const sheetId = ref('')

const form = reactive({ ...store.settings })

onMounted(() => {
  Object.assign(form, store.settings)
})

async function testConnection() {
  if (form.gas_url) setGasUrl(form.gas_url)
  testing.value = true
  gasStatus.value = await pingGAS()
  testing.value = false
}

async function save() {
  saving.value = true
  if (form.gas_url) setGasUrl(form.gas_url)
  await store.saveSettings({ ...form })
  saving.value = false
}
</script>
