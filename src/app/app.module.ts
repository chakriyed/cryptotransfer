import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { BlockchainService } from './blockchain.service';

@NgModule({
  imports: [
    BrowserModule,
    AppComponent
  ],
  providers: [BlockchainService],
  bootstrap: [AppComponent]
})
export class AppModule { }
