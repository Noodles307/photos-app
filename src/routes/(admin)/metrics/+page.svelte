<script lang="ts">
  import { Chart } from "chart.js/auto";
  import { onMount } from "svelte";
  import type { PageData } from "./$types";

  export let data: PageData;

  let chartCanvas: HTMLCanvasElement;

  onMount(() => {
    if (!data.metrics) return;

    new Chart(chartCanvas, {
      type: "bar",
      data: {
        labels: data.metrics.map((m) => m.name),
        datasets: [
          {
            label: "duration in ms",
            data: data.metrics.map((m) => m.durationMs),
            backgroundColor: "#e0a82e",
          },
        ],
      },
    });
  });
</script>

<h1 class="text-2xl mb-10">Metrics</h1>

<div>Queries duration in ms:</div>
<canvas bind:this={chartCanvas} id="myChart" />
