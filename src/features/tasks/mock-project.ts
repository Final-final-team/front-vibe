export function getMockProjectIdForTask(taskId: number) {
  if (taskId >= 20 && taskId < 30) {
    return 20;
  }

  if (taskId >= 30 && taskId < 40) {
    return 30;
  }

  return 10;
}
