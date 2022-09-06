import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxVideoPlayerModule } from 'ngx-video-player';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    NgxVideoPlayerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
