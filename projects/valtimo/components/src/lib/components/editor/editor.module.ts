import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {EditorComponent} from './editor.component';
import {MonacoEditorModule} from 'ngx-monaco-editor-v2';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';

@NgModule({
  declarations: [EditorComponent],
  imports: [BrowserModule, CommonModule, FormsModule, MonacoEditorModule],
  exports: [EditorComponent],
})
export class EditorModule {}
