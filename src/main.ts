import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { bootstrapApplication } from '@angular/platform-browser';  // Import bootstrapApplication
import { AppComponent } from './app/app.component';  // Import AppComponent

// Use bootstrapApplication to bootstrap the standalone component
bootstrapApplication(AppComponent)
  .catch(err => console.error(err));
