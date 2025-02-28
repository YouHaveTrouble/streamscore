export default class StreamerData {

  static HOURS_STREAMED_EXPONENT = 0.8;
  static AVERAGE_VIEWERS_EXPONENT = 1.2;
  static VIEWER_PEAK_EXPONENT = 0.5;

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
    return (this.hoursStreamed ^ StreamerData.HOURS_STREAMED_EXPONENT)
      + (this.averageViewers ^ StreamerData.AVERAGE_VIEWERS_EXPONENT)
      + (this.viewerPeak ^ StreamerData.VIEWER_PEAK_EXPONENT);
  }

  serialize(): object {
    return {
      name: this.name,
      hoursStreamed: this.hoursStreamed,
      averageViewers: this.averageViewers,
      viewerPeak: this.viewerPeak,
      hoursWatched: this.hoursWatched,
      lastCheck: this.lastCheck,
    };
  }

}
