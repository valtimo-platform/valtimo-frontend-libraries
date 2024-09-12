import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer';
import {is, isAny} from 'bpmn-js/lib/util/ModelUtil';
import {append as svgAppend, create as svgCreate} from 'tiny-svg';
import {black} from 'bpmn-js/lib/draw/BpmnRenderUtil';
import BpmnRenderer from 'bpmn-js/lib/draw/BpmnRenderer';
import Styles from 'diagram-js/lib/draw/Styles';
import {zakenApiPluginSpecification} from '@valtimo/plugin';
import EventBus from 'diagram-js/lib/core/EventBus';

export class ValtimoRenderer extends BaseRenderer {
  test: string;

  constructor(
    private eventBus: EventBus,
    private styles: Styles,
    private bpmnRenderer: BpmnRenderer,
    private config: any
  ) {
    console.log('init', arguments)
    super(eventBus, 1500);

    this.test = config && config.valtimoRenderer.test
  }

  canRender(element) {

    console.log('canRender')

    // only render tasks and events (ignore labels)
    return isAny(element, [ 'bpmn:Task' ]) && !element.labelTarget;
  }

  drawShape(parentNode, element) {
    const shape = this.bpmnRenderer.drawShape(parentNode, element);

    console.log('drawShape')

    if (is(element, 'bpmn:Task')) {
      const pluginImageUrl = zakenApiPluginSpecification.pluginLogoBase64
      const img = this.drawImage(parentNode, pluginImageUrl, 30, 30, {
        x: 68,
      })
      return shape;
    }

    return shape;
  }

  drawImage(parentGfx, imgSource, width, height, attrs = {}): SVGElement {

    attrs = this.shapeStyle(attrs);

    var image = svgCreate('image', {
      href: imgSource,
      width: width,
      height: height,
      ...attrs
    }) as SVGElement;

    svgAppend(parentGfx, image);

    return image;
  }

  // copied from https://github.com/bpmn-io/bpmn-js/blob/master/lib/draw/BpmnRenderer.js
  shapeStyle(attrs) {
    return this.styles.computeStyle(attrs, {
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      stroke: black,
      strokeWidth: 2,
      fill: 'white'
    });
  }
}

