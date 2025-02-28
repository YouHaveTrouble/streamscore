<template>
  <section>
    <form>
      <input
        type="text"
        v-model="addStreamerName"
      >
      <button
        @click.prevent="addStreamer"
        :disabled="addStreamerDisabled"
      >
        Add Streamer
      </button>
    </form>
    <table>
      <thead>
      <tr>
        <th>Rank</th>
        <th>Streamer</th>
        <th>Score</th>
        <th>Options</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(streamer, index) in sortedStreamers" :key="streamer.name">
        <td>{{ index + 1 }}</td>
        <td>{{ streamer.name }}</td>
        <td>{{ streamer.score.toFixed(2) }}</td>
        <td class="tools">
          <button
            @click="async () => {
               const streamerData = await getStreamerDataFromApi(streamer.name);
                if (streamerData === null) {
                  console.error('Streamer named \'%s\' not found'.replace('%s', streamer.name));
                  return;
                }
                streamers[streamer.name] = streamerData;
            }"
            :disabled="updates.has(streamer.name.toLowerCase())"
            title="Update streamer data"
          >↻</button>
          <button
            @click="delete streamers[streamer.name]"
            title="Delete streamer"
          >x</button>
        </td>
      </tr>
      </tbody>
    </table>
  </section>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import StreamerData from "../objects/StreamerData.ts";

export default defineComponent({
  name: "SortedList",
  watch: {
    streamers: {
      handler() {
        const serializedStreamers = {} as { [key: string]: unknown };
        for (const [name, data] of Object.entries(this.streamers)) {
          serializedStreamers[name] = data.serialize();
        }
        localStorage.setItem("streamers", JSON.stringify(serializedStreamers));
        this.sortedStreamers = Object.values(this.streamers).toSorted((a, b) => b.score - a.score);
      },
      deep: true
    }
  },
  computed: {
    addStreamerDisabled() {
      return this.addStreamerName.length === 0 || this.streamers[this.addStreamerName.toLowerCase()] !== undefined;
    }
  },
  data: () => ({
    streamers: {} as { [key: string]: StreamerData },
    sortedStreamers: [] as StreamerData[],
    addStreamerName: "" as string,
    updates: new Set<string>(),
  }),
  methods: {
    async addStreamer() {
      const name = this.addStreamerName.toLowerCase();
      this.addStreamerName = "";
      console.log("Adding streamer", name);

      const streamerData = await this.getStreamerDataFromApi(name);
      if (streamerData === null) {
        console.error("Streamer named \"%s\" not found".replace("%s", name));
        return;
      }
      this.streamers[name] = streamerData;
    },
    async getStreamerDataFromApi(name: string): Promise<StreamerData | null> {
      this.updates.add(name.toLowerCase());
      try {
        const request = await fetch(`https://twitchtracker.com/api/channels/summary/${name}`);
        const response = await request.json();

        if (JSON.stringify(response) === "{}") {
          return null;
        }

        console.log(response);

        const minutesStreamed = response?.minutes_streamed ?? 0;
        const hoursStreamed = minutesStreamed / 60;
        const averageViewers = response?.avg_viewers ?? 0;
        const viewerPeak = response?.max_viewers ?? 0;
        const hoursWatched = response?.hours_watched ?? 0;
        return new StreamerData(name, hoursStreamed, averageViewers, viewerPeak, hoursWatched);
      } catch (e) {
        console.error(e);
        return null;
      } finally {
        this.updates.delete(name.toLowerCase());
      }
    }
  },
  mounted() {
    const streamersData = localStorage.getItem("streamers") ?? "{}";
    const parsedData = JSON.parse(streamersData);
    for (const [name, data] of Object.entries(parsedData)) {
      const entry = data as { hoursStreamed: number, averageViewers: number, viewerPeak: number, hoursWatched: number };
      if (!name) continue;
      this.streamers[name] = new StreamerData(
        name,
        entry.hoursStreamed ?? 0,
        entry?.averageViewers ?? 0,
        entry?.viewerPeak ?? 0,
        entry?.hoursWatched ?? 0,
      );
    }

    setInterval(() => {
      for (const streamer of Object.values(this.streamers)) {
        // update streamer data if last check was more than 30 minutes ago
        if (Date.now() - streamer.lastCheck > 1000 * 60 * 30) {
          streamer.lastCheck = new Date().getTime();
          this.getStreamerDataFromApi(streamer.name).then(data => {
            if (data === null) {
              console.error("Streamer named \"%s\" not found".replace("%s", streamer.name));
              return;
            }
            this.streamers[streamer.name] = data;
          });
        }
      }
    }, 1000 * 30);
  }
});
</script>

<style lang="scss" scoped>
  form {
    display: flex;
    gap: .5rem;
  }
  table {
    td, th {
      padding-inline: 10px;
      text-align: start;
    }
  }
  .tools {
    display: flex;
    flex-direction: row;
    gap: .2rem;
    button {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 1.2rem;
      height: 1.2rem;
    }
  }
</style>
