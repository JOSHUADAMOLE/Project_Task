<template>
  <div class="p-6">
    <h1 class="text-xl font-bold mb-4">Work Statistics</h1>
    <ul>
      <li>✅ Completed Tasks: {{ statistics.completed_tasks }}</li>
      <li>🕓 Incomplete Tasks: {{ statistics.incomplete_tasks }}</li>
      <li>📁 Total Projects: {{ statistics.total_projects }}</li>
    </ul>
  </div>
</template>

<script setup>
defineProps({
  statistics: Object
});
</script>
