<template>
  <v-card elevation="2">
    <v-card-title class="pa-4">
      <v-icon class="mr-2">mdi-chart-bar</v-icon>
      Прогресс за неделю
    </v-card-title>
    <v-card-text class="pa-4">
      <canvas ref="chartRef" style="max-height: 300px;"></canvas>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import Chart from 'chart.js/auto'

const props = defineProps({
  progressData: {
    type: Array,
    required: true
  }
})

const chartRef = ref(null)
let chart = null

onMounted(() => {
  renderChart()
})

watch(() => props.progressData, () => {
  if (chart) {
    chart.destroy()
  }
  renderChart()
}, { deep: true })

onBeforeUnmount(() => {
  if (chart) {
    chart.destroy()
  }
})

const renderChart = () => {
  if (!chartRef.value || !props.progressData || props.progressData.length === 0) return

  const ctx = chartRef.value.getContext('2d')
  
  const maxValue = Math.max(...props.progressData.map(d => d.count), 1)
  
  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: props.progressData.map(d => d.day),
      datasets: [{
        label: 'Выполнено привычек',
        data: props.progressData.map(d => d.count),
        backgroundColor: 'rgba(25, 118, 210, 0.6)',
        borderColor: 'rgba(25, 118, 210, 1)',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: 12,
          titleFont: {
            size: 14
          },
          bodyFont: {
            size: 13
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: maxValue + (maxValue > 0 ? 1 : 0),
          ticks: {
            stepSize: 1,
            precision: 0
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    }
  })
}
</script>

