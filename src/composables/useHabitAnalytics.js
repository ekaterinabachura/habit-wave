import { computed } from 'vue'

export function useHabitAnalytics(habits) {
  const weeklyProgress = computed(() => {
    if (!habits.value || !Array.isArray(habits.value) || habits.value.length === 0) {
      const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
      return weekDays.map(day => ({
        day,
        count: 0,
        percentage: 0
      }))
    }

    const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay() + 1)
    startOfWeek.setHours(0, 0, 0, 0)

    return weekDays.map((day, index) => {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + index)
      
      const completedCount = habits.value.reduce((total, habit) => {
        return total + (habit.completedDates && habit.completedDates.includes(date.toDateString()) ? 1 : 0)
      }, 0)
      
      return {
        day,
        count: completedCount,
        percentage: habits.value.length > 0 
          ? Math.round((completedCount / habits.value.length) * 100) 
          : 0
      }
    })
  })

  const overallCompletion = computed(() => {
    if (!habits.value || !Array.isArray(habits.value) || habits.value.length === 0) return 0
    
    const totalPossible = habits.value.reduce((sum, habit) => {
      return sum + habit.frequency
    }, 0)
    
    const totalCompleted = habits.value.reduce((sum, habit) => {
      const completedDates = habit.completedDates || []
      const completedThisWeek = completedDates.filter(date => {
        const today = new Date()
        const startOfWeek = new Date(today)
        startOfWeek.setDate(today.getDate() - today.getDay() + 1)
        startOfWeek.setHours(0, 0, 0, 0)
        
        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(startOfWeek.getDate() + 6)
        endOfWeek.setHours(23, 59, 59, 999)

        const checkDate = new Date(date)
        return checkDate >= startOfWeek && checkDate <= endOfWeek
      }).length
      
      return sum + completedThisWeek
    }, 0)
    
    return totalPossible > 0 
      ? Math.round((totalCompleted / totalPossible) * 100) 
      : 0
  })

  return {
    weeklyProgress,
    overallCompletion
  }
}

