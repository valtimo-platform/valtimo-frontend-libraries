import {
  AfterViewInit,
  Component,
  EmbeddedViewRef,
  Inject,
  OnDestroy,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import {CommonModule, DOCUMENT} from '@angular/common';

@Component({
  selector: 'render-in-body',
  template: `<ng-template #content><ng-content></ng-content></ng-template>`,
  standalone: true,
  imports: [CommonModule],
})
export class RenderInBodyComponent implements AfterViewInit, OnDestroy {
  @ViewChild('content', {read: TemplateRef, static: true})
  private readonly contentTemplate!: TemplateRef<any>;

  private _viewRef!: EmbeddedViewRef<any>;

  constructor(
    private readonly viewContainerRef: ViewContainerRef,
    @Inject(DOCUMENT) private readonly document: Document
  ) {}

  public ngAfterViewInit(): void {
    this._viewRef = this.viewContainerRef.createEmbeddedView(this.contentTemplate);
    this._viewRef.detectChanges();

    this._viewRef.rootNodes.forEach(node => this.document.body.appendChild(node));
  }

  public ngOnDestroy(): void {
    this._viewRef?.rootNodes.forEach(node => {
      if (node instanceof Node && node.parentNode) {
        node.parentNode.removeChild(node);
      }
    });

    this._viewRef?.destroy();
  }
}
