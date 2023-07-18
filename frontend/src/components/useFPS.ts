import { ref, onMounted, onUnmounted } from 'vue';

export default function useFPS() {
  const fps = ref(0);

  let frameCount = 0;
  let lastTimestamp = performance.now();
  let animationFrameId: number;

  const calculateFPS = (timestamp: number) => {
    frameCount++;
    const diff = timestamp - lastTimestamp;
    if (diff > 1000) {
      fps.value = (frameCount / diff) * 1000;
      frameCount = 0;
      lastTimestamp = timestamp;
    }
    animationFrameId = requestAnimationFrame(calculateFPS);
  };

  onMounted(() => {
    animationFrameId = requestAnimationFrame(calculateFPS);
  });

  onUnmounted(() => {
    cancelAnimationFrame(animationFrameId);
  });

  return {
    fps,
  };
}
