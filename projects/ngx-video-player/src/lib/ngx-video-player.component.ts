import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'ngx-video-player',
  templateUrl: './ngx-video-player.component.html',
  styleUrls: ['./ngx-video-player.component.scss'],
})
export class NgxVideoPlayerComponent implements OnInit {
  @HostListener('document:mouseup', ['$event']) handleMouseUp(e: any) {
    if (this.isScrubbing) this.toggleScrubbing(e);
  }

  @HostListener('document:mousemove', ['$event']) handleMouseMove(e: any) {
    if (this.isScrubbing) this.updateTimeline(e);
  }

  @HostListener('document:keydown', ['$event']) keyPressed(event: any) {
    //Play/Pause video with k or space keys
    const tagName = document.activeElement?.tagName.toLowerCase();
    if (tagName === 'input') return;

    switch ((event.key as string).toLocaleLowerCase()) {
      case ' ': {
        if (tagName === 'button') return;
        this.togglePlay();
        break;
      }
      case 'k':
        this.togglePlay();
        break;
      case 'f':
        this.toggleFullScreen();
        break;
      case 't':
        this.toggleTheaterMode();
        break;
      case 'i':
        this.toggleMiniPlayer();
        break;
      case 'm':
        this.toggleMute();
        break;
      case 'arrowleft':
      case 'j':
        this.skip(-5);
        break;
      case 'arrowright':
      case 'l':
        this.skip(5);
        break;
      case 'c':
        this.toggleCaptions();
        break;
      default:
        return;
    }
  }

  paused: boolean = true;
  theater: boolean = false;
  fullScreen: boolean = false;
  miniPlayer: boolean = false;
  captions: boolean = false;
  isScrubbing: boolean = false;
  wasPaused: boolean = false;

  volumeSliderValue: number = 1;
  volumeLevel: string = 'high';
  totalTime = '00:00';
  currentTime = '00:00';
  playbackRateText: string = '1x';

  @Input() source: string = '';
  @Input() captionsSrc: string = '';

  @ViewChild('videoPlayer') videoPlayer!: ElementRef;
  @ViewChild('timeline') timeline!: ElementRef;

  constructor() {}

  ngOnInit(): void {}

  togglePlay() {
    if (this.videoPlayer.nativeElement.paused)
      this.videoPlayer.nativeElement.play();
    else this.videoPlayer.nativeElement.pause();
  }

  toggleTheaterMode() {
    this.theater = !this.theater;
    this.fullScreen = false;
  }

  toggleFullScreen() {
    this.fullScreen = !this.fullScreen;
    if(this.fullScreen){
      this.theater = false;
    }
  }

  toggleMiniPlayer() {
    if (this.miniPlayer) document.exitPictureInPicture();
    else this.videoPlayer.nativeElement.requestPictureInPicture();
  }

  enterPinP() {
    this.miniPlayer = true;
  }

  exitPinP() {
    this.miniPlayer = false;
  }

  //Volume
  toggleMute() {
    this.videoPlayer.nativeElement.muted =
      !this.videoPlayer.nativeElement.muted;
  }

  changeVolue(event: any) {
    this.videoPlayer.nativeElement.volume = event.target.value;
    this.videoPlayer.nativeElement.muted = event.target.value === 0;
  }

  onVolumeChange() {
    this.volumeSliderValue = this.videoPlayer.nativeElement.volume;
    if (
      this.videoPlayer.nativeElement.muted ||
      this.videoPlayer.nativeElement.volume === 0
    ) {
      this.volumeSliderValue = 0;
      this.volumeLevel = 'muted';
    } else if (this.videoPlayer.nativeElement.volume >= 0.5) {
      this.volumeLevel = 'high';
    } else {
      this.volumeLevel = 'low';
    }
  }

  //Duration

  updateTotalTime() {
    this.totalTime = this.formatDuration(
      this.videoPlayer.nativeElement.duration
    );
  }

  updateCurrentTime() {
    this.currentTime = this.formatDuration(
      this.videoPlayer.nativeElement.currentTime
    );
    const percent =
      this.videoPlayer.nativeElement.currentTime /
      this.videoPlayer.nativeElement.duration;
    this.timeline.nativeElement.style.setProperty(
      '--progress-position',
      percent
    );
  }

  skip(duration: number) {
    this.videoPlayer.nativeElement.currentTime += duration;
  }

  private leadingZeroFormatter = new Intl.NumberFormat(undefined, {
    minimumIntegerDigits: 2,
  });

  private formatDuration(time: number): string {
    const seconds = Math.floor(time % 60);
    const minutes = Math.floor(time / 60) % 60;
    const hours = Math.floor(time / 3600);

    if (hours === 0) {
      return `${minutes}:${this.leadingZeroFormatter.format(seconds)}`;
    }
    return `${hours}:${this.leadingZeroFormatter.format(
      minutes
    )}:${this.leadingZeroFormatter.format(seconds)}`;
  }

  //Captions

  setCaptionsMode() {
    this.videoPlayer.nativeElement.textTracks[0].mode = 'hidden';
  }

  toggleCaptions() {
    this.captions = !this.captions;
    this.videoPlayer.nativeElement.textTracks[0].mode = this.captions
      ? 'showing'
      : 'hidden';
  }

  //Playback Speed

  changePlaybackSpeed() {
    let newPlaybackRate = this.videoPlayer.nativeElement.playbackRate + 0.25;
    if (newPlaybackRate > 2) newPlaybackRate = 0.25;
    this.videoPlayer.nativeElement.playbackRate = newPlaybackRate;
    this.playbackRateText = `${newPlaybackRate}x`;
  }

  //Timeline
  updateTimeline(event: any) {
    console.log('updateTimeline');
    const rect = this.timeline.nativeElement.getBoundingClientRect();
    const percent =
      Math.min(Math.max(0, event.x - rect.x), rect.width) / rect.width;
    this.timeline.nativeElement.style.setProperty(
      '--preview-position',
      percent
    );

    if (this.isScrubbing) {
      event.preventDefault();
      this.timeline.nativeElement.style.setProperty(
        '--progress-position',
        percent
      );
    }
  }

  toggleScrubbing(event: any) {
    const rect = this.timeline.nativeElement.getBoundingClientRect();
    const percent =
      Math.min(Math.max(0, event.x - rect.x), rect.width) / rect.width;
    this.isScrubbing = (event.buttons & 1) === 1;

    if (this.isScrubbing) {
      this.wasPaused = this.videoPlayer.nativeElement.paused;
      this.videoPlayer.nativeElement.pause();
    } else {
      this.videoPlayer.nativeElement.currentTime =
        percent * this.videoPlayer.nativeElement.duration;
      if (!this.wasPaused) this.videoPlayer.nativeElement.play();
    }

    this.updateTimeline(event);
  }
}
