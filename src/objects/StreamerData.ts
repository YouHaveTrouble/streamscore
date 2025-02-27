export default class StreamerData {

  lastCheck: number;

  name: string;
  hoursStreamed: number;
  averageViewers: number;
  viewerPeak: number;
  hoursWatched: number;
  score: number;

  constructor(
    name: string,
    hoursStreamed: number,
    averageViewers: number,
    viewerPeak: number,
    hoursWatched: number,
    lastCheck: number = new Date().getTime(),
  ) {
    this.name = name;
    this.hoursStreamed = hoursStreamed;
    this.averageViewers = averageViewers;
    this.viewerPeak = viewerPeak;
    this.hoursWatched = hoursWatched;
    this.lastCheck = lastCheck;
    this.score = this.getScore();
  }

  getScore(): number {
    return this.hoursStreamed * this.averageViewers;
  }

}
