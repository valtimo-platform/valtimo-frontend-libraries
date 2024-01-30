import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {ConfigService} from '@valtimo/config';

@Injectable({
  providedIn: 'root'
})
export class StartModalService {
  private valtimoEndpointUri: string;

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    this.valtimoEndpointUri = configService.config.valtimoApi.endpointUri;
  }

  getStandardStartEventTitle(bpmnXml: string): string | null {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(bpmnXml, "application/xml");

    if (xmlDoc.getElementsByTagName("parsererror").length) {
      console.error("Error parsing XML");
      return null;
    }

    const startEvents = xmlDoc.getElementsByTagName('bpmn:startEvent');
    if (!startEvents) {
      return null;
    }

    const standardStartEvent = Array.from(startEvents).find(event =>
      !event.getElementsByTagName('bpmn:messageEventDefinition').length &&
      !event.getElementsByTagName('bpmn:timerEventDefinition').length
    );

    return standardStartEvent ? standardStartEvent.getAttribute('name') : null;
  }
}
