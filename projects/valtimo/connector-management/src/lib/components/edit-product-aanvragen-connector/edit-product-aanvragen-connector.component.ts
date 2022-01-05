/*
 * Copyright 2015-2021 Ritense BV, the Netherlands.
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

import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {editProductAanvragenConnectorForm} from './edit-product-aanvragen-connector.form';
import {FormMappingService, FormTranslationService} from '@valtimo/form';
import {DocumentService} from '@valtimo/document';
import {ExtendedComponentSchema} from 'formiojs';
import {BehaviorSubject, combineLatest, Subject, Subscription} from 'rxjs';
import {ConnectorProperties, DocumentDefinition, DocumentDefinitions, ProcessDocumentDefinition} from '@valtimo/contract';
import {FormioForm, FormioRefreshValue} from 'angular-formio';
import {FormioOptions} from 'angular-formio/formio.common';
import {cloneDeep} from 'lodash';
import {TranslateService} from '@ngx-translate/core';
import {map, switchMap, tap} from 'rxjs/operators';

type FormioDropdownOption = {label: string, value: string};
type Definitions = Array<{caseDefinitionOption: FormioDropdownOption, processDefinitionOptions: Array<string>}>;

@Component({
  selector: 'valtimo-edit-product-aanvragen-connector',
  templateUrl: './edit-product-aanvragen-connector.component.html',
  styleUrls: ['./edit-product-aanvragen-connector.component.scss']
})
export class EditProductAanvragenConnectorComponent implements OnInit, OnDestroy {
  @Input() properties: ConnectorProperties;
  @Input() defaultName!: string;
  @Input() showDeleteButton = false;

  @Output() propertiesSave = new EventEmitter<{properties: ConnectorProperties, name: string}>();
  @Output() connectorDelete = new EventEmitter<any>();

  formRefresh$ = new Subject<FormioRefreshValue>();
  formDefinition$ = new BehaviorSubject<FormioForm>(undefined);
  translatedFormDefinition$ = this.formDefinition$.pipe(
    map((definition) => this.formTranslationService.translateForm(definition))
  );
  caseDefinitionId$ = new BehaviorSubject<string>('');
  documentDefinitions: DocumentDefinitions;
  processDocumentDefinitions: ProcessDocumentDefinition[];
  definitions!: Definitions;
  procesDocumentDefinitionOptions: {[caseDefinitionId: string]: Array<string>} = {};

  readonly options: FormioOptions = {
    disableAlerts: true
  };

  private formDefinitionSubscription!: Subscription;
  private translateSubscription!: Subscription;

  constructor(
    private readonly formTranslationService: FormTranslationService,
    private readonly formMappingService: FormMappingService,
    private readonly documentService: DocumentService,
    private readonly translateService: TranslateService
  ) {
  }

  ngOnInit(): void {
    this.openFormDefinitionSubscription();
    this.formDefinition$.next(editProductAanvragenConnectorForm);
    this.loadDefinitions();
  }

  ngOnDestroy(): void {
    this.formDefinitionSubscription?.unsubscribe();
    this.translateSubscription?.unsubscribe();
  }

  onChange(object: any): void {
    console.log('change object', object);
    const changeObjectValue = object?.changed?.value;
    const changeObjectComponentKey = object?.changed?.component?.key;
    const changeObjectComponentRowIndex = object?.changed?.instance?.rowIndex;
    console.log(changeObjectComponentKey, changeObjectComponentRowIndex, changeObjectValue, this.formDefinition$.getValue());
    // const productRequestTypes: Array<{caseDefinitionKey: string; processDefinitionKey: string; productAanvraagType: string}> =
    //   object?.data?.productAanvraagTypes;
    // const productRequestHasCaseDefinitionId = productRequestTypes.find((request) => request.caseDefinitionKey);

    // if (productRequestHasCaseDefinitionId) {
    //   const definitionWithProcessDefinitionKeyValues =
    //     this.formMappingService.mapComponents(this.formDefinition$.getValue(), this.mapProcessDefinitionKeyComponent);
    //
    //   this.formDefinition$.next(definitionWithProcessDefinitionKeyValues);
    // }
  }

  onSubmit(event: any): void {
    const submission = event.data;
    const properties = cloneDeep(this.properties);

    properties.objectsApiProperties.objectsApi.url = submission.objectsApiUrl;
    properties.objectsApiProperties.objectsApi.token = submission.objectsApiToken;
    properties.objectsApiProperties.objectsTypeApi.url = submission.objectTypesApiUrl;
    properties.objectsApiProperties.objectsTypeApi.token = submission.objectTypesApiToken;

    properties.objectsApiProperties.objectType.name = submission.objectTypeName;
    properties.objectsApiProperties.objectType.title = submission.objectTypeTitle;
    properties.objectsApiProperties.objectType.url = submission.objectTypeUrl;
    properties.objectsApiProperties.objectType.typeVersion = submission.objectTypeVersion;

    properties.openNotificatieProperties.baseUrl = submission.openNotificationsBaseUrl;
    properties.openNotificatieProperties.clientId = submission.openNotificationsClientId;
    properties.openNotificatieProperties.secret = submission.openNotificationsSecret;
    properties.openNotificatieProperties.callbackBaseUrl = submission.openNotificationsCallbackBaseUrl;

    properties.aanvragerRolTypeUrl = submission.applicantRoleTypeUrl;

    properties.typeMapping = [
      {
        productAanvraagType: submission.productAanvraagType,
        caseDefinitionKey: submission.caseDefinitionKey,
        processDefinitionKey: submission.processDefinitionKey
      }
    ];

    this.propertiesSave.emit({properties, name: submission.connectorName});
  }

  onDelete(): void {
    this.connectorDelete.emit();
  }

  private openFormDefinitionSubscription(): void {
    this.formDefinitionSubscription = combineLatest([this.formDefinition$, this.translateService.stream('key')])
      .subscribe(([form]) => {
        const translatedForm = this.formTranslationService.translateForm(form);
        this.refreshForm({form: translatedForm});
      });
  }

  private prefillForm(): void {
    const properties = cloneDeep(this.properties);
    const submission: {[key: string]: string} = {};

    submission.objectsApiUrl = properties.objectsApiProperties.objectsApi.url;
    submission.objectsApiToken = properties.objectsApiProperties.objectsApi.token;
    submission.objectTypesApiUrl = properties.objectsApiProperties.objectsTypeApi.url;
    submission.objectTypesApiToken = properties.objectsApiProperties.objectsTypeApi.token;

    submission.objectTypeName = properties.objectsApiProperties.objectType.name;
    submission.objectTypeTitle = properties.objectsApiProperties.objectType.title;
    submission.objectTypeUrl = properties.objectsApiProperties.objectType.url;
    submission.objectTypeVersion = properties.objectsApiProperties.objectType.typeVersion;

    submission.openNotificationsBaseUrl = properties.openNotificatieProperties.baseUrl;
    submission.openNotificationsClientId = properties.openNotificatieProperties.clientId;
    submission.openNotificationsSecret = properties.openNotificatieProperties.secret;
    submission.openNotificationsCallbackBaseUrl = properties.openNotificatieProperties.callbackBaseUrl;

    submission.applicantRoleTypeUrl = properties.aanvragerRolTypeUrl;

    submission.productAanvraagType = properties.typeMapping[0].productAanvraagType;
    submission.caseDefinitionKey = properties.typeMapping[0].caseDefinitionKey;
    submission.processDefinitionKey = properties.typeMapping[0].processDefinitionKey;

    submission.connectorName = this.defaultName;

    this.refreshForm({submission: {data: submission}});
  }

  private mapCaseDefinitionKeyComponent = (component: ExtendedComponentSchema): ExtendedComponentSchema => {
    if (component.key === 'caseDefinitionKey') {
      const definitionOptions = this.definitions.map((definitions) => definitions.caseDefinitionOption);

      return {...component, disabled: false, data: {values: definitionOptions}};
    }

    return component;
  }

  private mapProcessDefinitionKeyComponent = (component: ExtendedComponentSchema): ExtendedComponentSchema => {
    if (component.key === 'processDefinitionKey') {
      const processOptions = this.definitions[0].processDefinitionOptions;

      if (this.processDocumentDefinitions?.length > 0) {
        return {...component, disabled: false, data: {values: processOptions}};
      } else {
        return {...component, disabled: true, data: {values: []}};
      }
    }

    return component;
  }

  private refreshForm(refreshValue: FormioRefreshValue): void {
    this.formRefresh$.next(refreshValue);
  }

  private loadDocumentDefinitions(): void {
    this.documentService.getAllDefinitions().subscribe((definitions) => {
      this.documentDefinitions = definitions;
      const definitionWithCaseDefinitionKeyValues =
        this.formMappingService.mapComponents(this.formDefinition$.getValue(), this.mapCaseDefinitionKeyComponent);

      this.formDefinition$.next(definitionWithCaseDefinitionKeyValues);
    });
  }

  private loadDefinitions(): void {
    let documentDefinitions: Array<DocumentDefinition>;

    this.documentService.getAllDefinitions().pipe(
      tap((resDocumentDefinitions) => documentDefinitions = resDocumentDefinitions.content),
      switchMap((resDocumentDefinitions) =>
        combineLatest(resDocumentDefinitions.content.map((definition) =>
          this.documentService.findProcessDocumentDefinitions(definition.id.name)))
      ),
      tap((res) => {
        this.definitions = documentDefinitions.map((documentDefinition, index) => {
          const documentDefinitionOption: FormioDropdownOption = {label: documentDefinition.id.name, value: documentDefinition.id.name};
          const processDocumentDefinitionOptions: Array<string> = res[index].map((processDocumentDefinition) => {
            return processDocumentDefinition.id.processDefinitionKey
          });

          return {caseDefinitionOption: documentDefinitionOption, processDefinitionOptions: processDocumentDefinitionOptions};
        });

        documentDefinitions.forEach((documentDefinition, index) => {
          this.procesDocumentDefinitionOptions[documentDefinition.id.name] = res[index].map((processDocumentDefinition) =>
            processDocumentDefinition.id.processDefinitionKey);
        })

        window['productRequestDefinitions'] = this.procesDocumentDefinitionOptions;

        const definitionWithCaseDefinitionKeyValues =
          this.formMappingService.mapComponents(this.formDefinition$.getValue(), this.mapCaseDefinitionKeyComponent);

        this.formDefinition$.next(definitionWithCaseDefinitionKeyValues);

        if (this.properties?.aanvragerRolTypeUrl) {
          this.prefillForm();
        }
      })
    ).subscribe();
  }
}
