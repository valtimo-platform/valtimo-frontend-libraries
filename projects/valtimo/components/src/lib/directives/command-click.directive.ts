import {
  Directive,
  ElementRef,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
} from '@angular/core';

@Directive({
  selector: '[ctrl-click]',
})
export class CtrlClickDirective implements OnInit, OnDestroy {
  @Output('ctrl-click') ctrlClickEvent = new EventEmitter();

  private unsubcribeFunction!: () => void;

  constructor(private readonly renderer: Renderer2, private readonly element: ElementRef) {}

  ngOnDestroy(): void {
    if (!this.unsubcribeFunction) {
      return;
    }
    this.unsubcribeFunction();
  }

  ngOnInit() {
    this.unsubcribeFunction = this.renderer.listen(this.element.nativeElement, 'click', event => {
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
        event.stopPropagation();
        document.getSelection().removeAllRanges();

        this.ctrlClickEvent.emit(event);
      }
    });
  }
}
