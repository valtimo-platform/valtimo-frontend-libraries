/*
 * Copyright 2015-2023 Ritense BV, the Netherlands.
 *
 * Licensed under EUPL, Version 1.2 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://joinup.ec.europa.eu/collection/eupl/eupl-text-eupl-12
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {AfterViewInit, Component, ElementRef, HostListener, Input, ViewChild} from '@angular/core';
import {EditorService} from './editor.service';
import {first} from 'rxjs';
import {editor} from 'monaco-editor';
import {EditorModel} from '../../models';

declare var monaco: any;

@Component({
  selector: 'valtimo-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
})
export class EditorComponent implements AfterViewInit {
  @ViewChild('editorContainer', {static: true}) _editorContainer: ElementRef;

  @Input() set editorOptions(options: editor.IEditorOptions) {
    this._editorOptions = options;
    this.updateOptions(options);
  }
  @Input() set model(model: EditorModel) {
    this._model = model;
    this.updateModel();
  }
  @Input() formatOnLoad = true;
  @Input() widthPx!: number;
  @Input() heightPx!: number;

  @HostListener('window:resize', ['$event'])
  onResize() {
    if (this._editor) {
      this._editor.layout();
    }
  }

  private _editor: editor.IStandaloneCodeEditor;
  private _editorOptions: editor.IEditorOptions;
  private _model: EditorModel;

  constructor(private readonly editorService: EditorService) {
    this.editorService.load();
  }

  public ngAfterViewInit(): void {
    this.initMonaco();
  }

  private updateOptions(options: editor.IEditorOptions): void {
    if (this._editor) {
      this._editor.updateOptions(options);
    }
  }

  private updateModel(): void {
    if (this._editor && this._model && monaco?.editor) {
      const model = monaco.editor.createModel(
        this._model.value,
        this._model.language,
        this._model.uri
      );

      this._editor.setModel(model);
    }
  }

  private formatDocument = (): void => {
    if (this.formatOnLoad && this._editor) {
      this._editor.getAction('editor.action.formatDocument').run();
    }
  };

  private initMonaco(): void {
    if (!this.editorService.loaded) {
      this.editorService.loadingFinished.pipe(first()).subscribe(() => {
        this.initMonaco();
      });
      return;
    }

    this._editor = monaco.editor.create(this._editorContainer.nativeElement, this._editorOptions);
    this._editor.onDidChangeModelLanguageConfiguration(this.formatDocument);
    this._editor.onDidLayoutChange(this.formatDocument);
    this.updateModel();
  }
}
