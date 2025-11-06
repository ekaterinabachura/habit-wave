<template>
  <v-card 
    :color="habit.color" 
    dark
    class="habit-card"
    elevation="4"
  >
    <v-card-title class="d-flex align-center pa-4">
      <span class="text-h6">{{ habit.title }}</span>
      <v-spacer />
      <v-chip 
        :color="getCompletionColor(habit.completionRate)"
        size="small"
        class="mr-2"
      >
        {{ habit.completionRate }}%
      </v-chip>
      <v-btn
        icon
        variant="text"
        size="small"
        @click="$emit('delete', habit.id)"
        class="delete-btn"
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-card-title>

    <v-card-text class="pa-4">
      <div class="text-caption mb-3 d-flex align-center">
        <v-icon size="small" class="mr-1">mdi-target</v-icon>
        <span class="mr-4">Цель: {{ habit.frequency }} раз/неделю</span>
        <v-icon size="small" class="mr-1">mdi-fire</v-icon>
        <span>Серия: {{ habit.streak }} дней</span>
      </div>
      
      <!-- Прогресс-бар -->
      <v-progress-linear
        :model-value="habit.completionRate"
        height="20"
        :color="getProgressColor(habit.completionRate)"
        rounded
        class="mb-3"
      >
        <template v-slot:default="{ value }">
          <strong class="text-white">{{ Math.ceil(value) }}%</strong>
        </template>
      </v-progress-linear>
      
      <!-- Мини-календарь недели -->
      <div class="d-flex justify-space-between align-center">
        <v-btn
          v-for="day in weekDays"
          :key="day.date.toISOString()"
          icon
          :color="isDateCompleted(day.date) ? 'white' : 'rgba(255, 255, 255, 0.3)'"
          size="small"
          variant="text"
          @click="$emit('toggle', habit.id, day.date)"
          class="week-day-btn"
        >
          <div class="text-center">
            <div class="text-caption">{{ day.name }}</div>
            <v-icon size="small">
              {{ isDateCompleted(day.date) ? 'mdi-check-circle' : 'mdi-circle-outline' }}
            </v-icon>
          </div>
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  habit: {
    type: Object,
    required: true
  }
})

defineEmits(['toggle', 'delete'])

const weekDays = computed(() => {
  const days = []
  const today = new Date()
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay() + 1)
  startOfWeek.setHours(0, 0, 0, 0)
  
  const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek)
    date.setDate(startOfWeek.getDate() + i)
    days.push({
      date,
      name: dayNames[date.getDay()]
    })
  }
  return days
})

const isDateCompleted = (date) => {
  const completedDates = props.habit.completedDates || []
  return completedDates.includes(date.toDateString())
}

const getCompletionColor = (rate) => {
  if (rate >= 80) return 'success'
  if (rate >= 50) return 'warning'
  return 'error'
}

const getProgressColor = (rate) => {
  if (rate >= 80) return 'success'
  if (rate >= 50) return 'warning'
  return 'error'
}
</script>

<style scoped>
.habit-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.habit-card:hover {
  transform: translateY(-2px);
}

.week-day-btn {
  min-width: 48px;
}

.delete-btn {
  opacity: 0.7;
}

.delete-btn:hover {
  opacity: 1;
}
</style>

