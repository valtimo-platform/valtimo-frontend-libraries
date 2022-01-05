export const editProductAanvragenConnectorForm = {
  display: 'wizard',
  settings: {
    pdf: {
      id: '1ec0f8ee-6685-5d98-a847-26f67b67d6f0',
      src: 'https://files.form.io/pdf/5692b91fd1028f01000407e3/file/1ec0f8ee-6685-5d98-a847-26f67b67d6f0'
    }
  },
  components: [
    {
      title: 'connectorForm.productaanvraag.step0.title',
      breadcrumbClickable: true,
      buttonSettings: {
        previous: true,
        cancel: true,
        next: true
      },
      navigateOnEnter: false,
      saveOnEnter: false,
      scrollToTop: false,
      collapsible: false,
      key: 'page0',
      type: 'panel',
      label: 'Page 0',
      input: false,
      tableView: false,
      components: [
        {
          label: 'HTML',
          attrs: [
            {
              attr: '',
              value: ''
            }
          ],
          content: 'connectorForm.productaanvraag.step0.tip',
          refreshOnChange: false,
          key: 'html4',
          type: 'htmlelement',
          input: false,
          tableView: false
        },
        {
          key: 'productAanvraagTypes',
          type: 'editgrid',
          input: true,
          validate: {
            minLength: 1,
          },
          customClass: "edit-grid-component",
          components: [
            {
              label: 'connectorForm.productaanvraag.step0.typeMapping.productAanvraagType.label',
              tooltip: 'connectorForm.productaanvraag.step0.typeMapping.productAanvraagType.tooltip',
              tableView: true,
              validate: {
                required: true
              },
              key: 'productAanvraagType',
              type: 'textfield',
              input: true,
            },
            {
              label: 'connectorForm.productaanvraag.step0.typeMapping.caseDefinitionKey.label',
              widget: 'choicesjs',
              placeholder: 'connectorForm.productaanvraag.step0.typeMapping.caseDefinitionKey.placeholder',
              tableView: true,
              validate: {
                required: true
              },
              key: 'caseDefinitionKey',
              type: 'select',
              input: true
            },
            {
              label: "connectorForm.productaanvraag.step0.typeMapping.processDefinitionKey.label",
              widget: "choicesjs",
              tableView: true,
              dataSrc: "custom",
              data: {
                "custom": "values = window['productRequestDefinitions'][row.caseDefinitionKey] || []"
              },
              dataType: "string",
              refreshOn: "row",
              clearOnRefresh: true,
              key: "processDefinitionKey",
              type: "select",
              input: true,
              validate: {
                required: true
              },
              placeholder: 'connectorForm.productaanvraag.step0.typeMapping.processDefinitionKey.placeholder',
            }
          ]
        }
      ]
    },
    {
      title: 'connectorForm.productaanvraag.step1.title',
      breadcrumbClickable: true,
      buttonSettings: {
        previous: true,
        cancel: true,
        next: true
      },
      navigateOnEnter: false,
      saveOnEnter: false,
      scrollToTop: false,
      collapsible: false,
      key: 'page1',
      type: 'panel',
      label: 'Page 1',
      input: false,
      tableView: false,
      components: [
        {
          label: 'HTML',
          attrs: [
            {
              attr: '',
              value: ''
            }
          ],
          content: 'connectorForm.productaanvraag.step1.tip',
          refreshOnChange: false,
          key: 'html',
          type: 'htmlelement',
          input: false,
          tableView: false
        },
        {
          title: 'connectorForm.productaanvraag.step1.objectsApi.panelTitle',
          collapsible: false,
          key: 'connectorFormProductaanvraagStep1ObjectsApiPanelTitle',
          type: 'panel',
          label: 'Panel',
          input: false,
          tableView: false,
          components: [
            {
              label: 'connectorForm.productaanvraag.step1.objectsApi.url.label',
              tooltip: 'connectorForm.productaanvraag.step1.objectsApi.url.tooltip',
              tableView: true,
              validate: {
                required: true
              },
              key: 'objectsApiUrl',
              type: 'textfield',
              input: true
            },
            {
              label: 'connectorForm.productaanvraag.step1.objectsApi.token.label',
              tooltip: 'connectorForm.productaanvraag.step1.objectsApi.token.tooltip',
              tableView: true,
              validate: {
                required: true
              },
              key: 'objectsApiToken',
              type: 'textfield',
              input: true
            }
          ]
        },
        {
          title: 'connectorForm.productaanvraag.step1.objectTypesApi.panelTitle',
          collapsible: false,
          key: 'connectorFormProductaanvraagStep1ObjectTypesApiPanelTitle',
          type: 'panel',
          label: 'Panel',
          input: false,
          tableView: false,
          components: [
            {
              label: 'connectorForm.productaanvraag.step1.objectTypesApi.url.label',
              tooltip: 'connectorForm.productaanvraag.step1.objectTypesApi.url.tooltip',
              tableView: true,
              validate: {
                required: true
              },
              key: 'objectTypesApiUrl',
              type: 'textfield',
              input: true
            },
            {
              label: 'connectorForm.productaanvraag.step1.objectTypesApi.token.label',
              tooltip: 'connectorForm.productaanvraag.step1.objectTypesApi.token.tooltip',
              tableView: true,
              validate: {
                required: true
              },
              key: 'objectTypesApiToken',
              type: 'textfield',
              input: true
            }
          ]
        }
      ]
    },
    {
      title: 'connectorForm.productaanvraag.step2.title',
      breadcrumbClickable: true,
      buttonSettings: {
        previous: true,
        cancel: true,
        next: true
      },
      navigateOnEnter: false,
      saveOnEnter: false,
      scrollToTop: false,
      collapsible: false,
      key: 'page2',
      type: 'panel',
      label: 'Page 2',
      input: false,
      tableView: false,
      components: [
        {
          label: 'HTML',
          attrs: [
            {
              attr: '',
              value: ''
            }
          ],
          content: 'connectorForm.productaanvraag.step2.tip',
          refreshOnChange: false,
          key: 'html2',
          type: 'htmlelement',
          input: false,
          tableView: false
        },
        {
          title: 'connectorForm.productaanvraag.step2.objectType.panelTitle',
          collapsible: false,
          key: 'connectorFormProductaanvraagStep2ObjectTypePanelTitle',
          type: 'panel',
          label: 'Panel',
          input: false,
          tableView: false,
          components: [
            {
              label: 'connectorForm.productaanvraag.step2.objectType.name.label',
              tooltip: 'connectorForm.productaanvraag.step2.objectType.name.tooltip',
              tableView: true,
              validate: {
                required: true
              },
              key: 'objectTypeName',
              type: 'textfield',
              input: true
            },
            {
              label: 'connectorForm.productaanvraag.step2.objectType.title.label',
              tooltip: 'connectorForm.productaanvraag.step2.objectType.title.tooltip',
              tableView: true,
              validate: {
                required: true
              },
              key: 'objectTypeTitle',
              type: 'textfield',
              input: true
            },
            {
              label: 'connectorForm.productaanvraag.step2.objectType.url.label',
              tooltip: 'connectorForm.productaanvraag.step2.objectType.url.tooltip',
              tableView: true,
              validate: {
                required: true
              },
              key: 'objectTypeUrl',
              type: 'textfield',
              input: true
            },
            {
              label: 'connectorForm.productaanvraag.step2.objectType.typeVersion.label',
              tooltip: 'connectorForm.productaanvraag.step2.objectType.typeVersion.tooltip',
              tableView: true,
              validate: {
                required: true
              },
              key: 'objectTypeVersion',
              type: 'textfield',
              input: true
            }
          ]
        }
      ]
    },
    {
      title: 'connectorForm.productaanvraag.step3.title',
      breadcrumbClickable: true,
      buttonSettings: {
        previous: true,
        cancel: true,
        next: true
      },
      navigateOnEnter: false,
      saveOnEnter: false,
      scrollToTop: false,
      collapsible: false,
      key: 'page3',
      type: 'panel',
      label: 'Page 3',
      input: false,
      tableView: false,
      components: [
        {
          label: 'HTML',
          attrs: [
            {
              attr: '',
              value: ''
            }
          ],
          content: 'connectorForm.productaanvraag.step3.tip',
          refreshOnChange: false,
          key: 'html1',
          type: 'htmlelement',
          input: false,
          tableView: false
        },
        {
          title: 'connectorForm.productaanvraag.step3.openNotifications.panelTitle',
          collapsible: false,
          key: 'connectorFormProductaanvraagStep3OpenNotificationsPanelTitle',
          type: 'panel',
          label: 'Panel',
          input: false,
          tableView: false,
          components: [
            {
              label: 'connectorForm.productaanvraag.step3.openNotifications.baseUrl.label',
              tooltip: 'connectorForm.productaanvraag.step3.openNotifications.baseUrl.tooltip',
              tableView: true,
              validate: {
                required: true
              },
              key: 'openNotificationsBaseUrl',
              type: 'textfield',
              input: true
            },
            {
              label: 'connectorForm.productaanvraag.step3.openNotifications.clientId.label',
              tooltip: 'connectorForm.productaanvraag.step3.openNotifications.clientId.tooltip',
              tableView: true,
              validate: {
                required: true
              },
              key: 'openNotificationsClientId',
              type: 'textfield',
              input: true
            },
            {
              label: 'connectorForm.productaanvraag.step3.openNotifications.secret.label',
              tooltip: 'connectorForm.productaanvraag.step3.openNotifications.secret.tooltip',
              tableView: true,
              validate: {
                required: true
              },
              key: 'openNotificationsSecret',
              type: 'textfield',
              input: true
            },
            {
              label: 'connectorForm.productaanvraag.step3.openNotifications.callbackBaseUrl.label',
              tooltip: 'connectorForm.productaanvraag.step3.openNotifications.callbackBaseUrl.tooltip',
              tableView: true,
              validate: {
                required: true
              },
              key: 'openNotificationsCallbackBaseUrl',
              type: 'textfield',
              input: true
            }
          ]
        }
      ]
    },
    {
      title: 'connectorForm.productaanvraag.step4.title',
      breadcrumbClickable: true,
      buttonSettings: {
        previous: true,
        cancel: true,
        next: true
      },
      navigateOnEnter: false,
      saveOnEnter: false,
      scrollToTop: false,
      collapsible: false,
      key: 'page4',
      type: 'panel',
      label: 'Page 4',
      input: false,
      tableView: false,
      components: [
        {
          label: 'HTML',
          attrs: [
            {
              attr: '',
              value: ''
            }
          ],
          content: 'connectorForm.productaanvraag.step4.tip',
          refreshOnChange: false,
          key: 'html3',
          type: 'htmlelement',
          input: false,
          tableView: false
        },
        {
          title: 'connectorForm.productaanvraag.step4.applicant.panelTitle',
          collapsible: false,
          key: 'connectorFormProductaanvraagStep4ApplicantPanelTitle',
          type: 'panel',
          label: 'Panel',
          input: false,
          tableView: false,
          components: [
            {
              label: 'HTML',
              attrs: [
                {
                  attr: '',
                  value: ''
                }
              ],
              content: 'connectorForm.productaanvraag.step4.applicant.tip',
              refreshOnChange: false,
              key: 'html5',
              type: 'htmlelement',
              input: false,
              tableView: false
            },
            {
              label: 'connectorForm.productaanvraag.step4.applicant.roleTypeUrl.label',
              tooltip: 'connectorForm.productaanvraag.step4.applicant.roleTypeUrl.tooltip',
              tableView: true,
              validate: {
                required: true
              },
              key: 'applicantRoleTypeUrl',
              type: 'textfield',
              input: true
            }
          ]
        }
      ]
    },
    {
      title: 'connectorForm.productaanvraag.step5.title',
      breadcrumbClickable: true,
      buttonSettings: {
        previous: true,
        cancel: true,
        next: true
      },
      navigateOnEnter: false,
      saveOnEnter: false,
      scrollToTop: false,
      collapsible: false,
      key: 'page6',
      type: 'panel',
      label: 'Page 5',
      input: false,
      tableView: false,
      components: [
        {
          label: 'HTML',
          attrs: [
            {
              attr: '',
              value: ''
            }
          ],
          content: 'connectorForm.productaanvraag.step5.tip',
          refreshOnChange: false,
          key: 'html6',
          type: 'htmlelement',
          input: false,
          tableView: false
        },
        {
          label: 'connectorForm.productaanvraag.step5.name',
          tableView: true,
          validate: {
            required: true
          },
          key: 'connectorName',
          type: 'textfield',
          input: true
        }
      ]
    }
  ]
};
