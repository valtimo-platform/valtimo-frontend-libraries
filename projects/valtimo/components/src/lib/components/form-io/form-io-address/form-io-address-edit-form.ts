export const formIoAddressEditForm = {
  components: [
    {
      type: 'tabs',
      key: 'tabs',
      components: [
        {
          "key": "display",
          "components": [
            {
              "weight": 200,
              "type": "textarea",
              "input": true,
              "key": "description",
              "label": "Description",
              "placeholder": "Description for this field.",
              "tooltip": "The description is text that will appear below the input field.",
              "editor": "ace",
              "as": "html",
              "wysiwyg": {
                "minLines": 3,
                "isUseWorkerDisabled": true
              }
            },
            {
              "weight": 500,
              "type": "textfield",
              "input": true,
              "key": "customClass",
              "label": "Custom CSS Class",
              "placeholder": "Custom CSS Class",
              "tooltip": "Custom CSS class to add to this component."
            },
            {
              "weight": 1100,
              "type": "checkbox",
              "label": "Hidden",
              "tooltip": "A hidden field is still a part of the form, but is hidden from view.",
              "key": "hidden",
              "input": true
            },
            {
              "weight": 1400,
              "type": "checkbox",
              "label": "Disabled",
              "tooltip": "Disable the form input.",
              "key": "disabled",
              "input": true
            },
            {
              "weight": 1500,
              "type": "checkbox",
              "label": "Table View",
              "tooltip": "Shows this value within the table view of the submissions.",
              "key": "tableView",
              "input": true
            }
          ],
          "label": "Display",
          "weight": 0
        },
        {
          "key": "data",
          "components": [
            {
              "weight": 700,
              "type": "checkbox",
              "label": "Clear Value When Hidden",
              "key": "clearOnHide",
              "defaultValue": true,
              "tooltip": "When a field is hidden, clear the value.",
              "input": true
            },
            {
              "type": "panel",
              "title": "Custom Default Value",
              "theme": "default",
              "collapsible": true,
              "collapsed": true,
              "key": "customDefaultValuePanel",
              "weight": 1000,
              "components": [
                {
                  "type": "htmlelement",
                  "tag": "div",
                  "content": "<p>The following variables are available in all scripts.</p><table class=\"table table-bordered table-condensed table-striped\"><tr><th>form</th><td>The complete form JSON object</td></tr><tr><th>submission</th><td>The complete submission object.</td></tr><tr><th>data</th><td>The complete submission data object.</td></tr><tr><th>row</th><td>Contextual \"row\" data, used within DataGrid, EditGrid, and Container components</td></tr><tr><th>component</th><td>The current component JSON</td></tr><tr><th>instance</th><td>The current component instance.</td></tr><tr><th>value</th><td>The current value of the component.</td></tr><tr><th>moment</th><td>The moment.js library for date manipulation.</td></tr><tr><th>_</th><td>An instance of <a href=\"https://lodash.com/docs/\" target=\"_blank\" rel=\"noopener noreferrer\">Lodash</a>.</td></tr><tr><th>utils</th><td>An instance of the <a href=\"http://formio.github.io/formio.js/docs/identifiers.html#utils\" target=\"_blank\" rel=\"noopener noreferrer\">FormioUtils</a> object.</td></tr><tr><th>util</th><td>An alias for \"utils\".</td></tr></table><br/>"
                },
                {
                  "type": "panel",
                  "title": "JavaScript",
                  "collapsible": true,
                  "collapsed": false,
                  "style": {
                    "margin-bottom": "10px"
                  },
                  "key": "customDefaultValue-js",
                  "components": [
                    {
                      "type": "textarea",
                      "key": "customDefaultValue",
                      "rows": 5,
                      "editor": "ace",
                      "hideLabel": true,
                      "as": "javascript",
                      "input": true
                    },
                    {
                      "type": "htmlelement",
                      "tag": "div",
                      "content": "<p>Enter custom javascript code.</p><p><h4>Example:</h4><pre>value = data.firstName + \" \" + data.lastName;</pre></p>"
                    }
                  ]
                },
                {
                  "type": "panel",
                  "title": "JSONLogic",
                  "collapsible": true,
                  "collapsed": true,
                  "key": "customDefaultValue-json",
                  "components": [
                    {
                      "type": "htmlelement",
                      "tag": "div",
                      "content": "<p>Execute custom logic using <a href=\"http://jsonlogic.com/\" target=\"_blank\" rel=\"noopener noreferrer\">JSONLogic</a>.</p><p>Full <a href=\"https://lodash.com/docs\" target=\"_blank\" rel=\"noopener noreferrer\">Lodash</a> support is provided using an \"_\" before each operation, such as <code>{\"_sum\": {var: \"data.a\"}}</code></p><p><h4>Example:</h4><pre>{\"cat\": [{\"var\": \"data.firstName\"}, \" \", {\"var\": \"data.lastName\"}]}</pre>"
                    },
                    {
                      "type": "textarea",
                      "key": "customDefaultValue",
                      "rows": 5,
                      "editor": "ace",
                      "hideLabel": true,
                      "as": "json",
                      "input": true
                    }
                  ]
                }
              ]
            }
          ],
          "label": "Data",
          "weight": 10
        },
        {
          "key": "validation",
          "components": [
            {
              "weight": 10,
              "type": "checkbox",
              "label": "Required",
              "tooltip": "A required field must be filled in before the form can be submitted.",
              "key": "validate.required",
              "input": true
            }
          ],
          "label": "Validation",
          "weight": 20
        },
        {
          "label": "API",
          "key": "api",
          "weight": 30,
          "components": [
            {
              "weight": 0,
              "type": "textfield",
              "input": true,
              "key": "key",
              "label": "Property Name",
              "tooltip": "The name of this field in the API endpoint."
            },
            {
              "weight": 100,
              "type": "tags",
              "input": true,
              "label": "Field Tags",
              "storeas": "array",
              "tooltip": "Tag the field for use in custom logic.",
              "key": "tags"
            },
            {
              "weight": 200,
              "type": "datamap",
              "label": "Custom Properties",
              "tooltip": "This allows you to configure any custom properties for this component.",
              "key": "properties",
              "valueComponent": {
                "type": "textfield",
                "key": "value",
                "label": "Value",
                "placeholder": "Value",
                "input": true
              }
            }
          ]
        },
        {
          "label": "Conditional",
          "key": "conditional",
          "weight": 40,
          "components": [
            {
              "type": "panel",
              "title": "Advanced Conditions",
              "theme": "default",
              "collapsible": true,
              "collapsed": true,
              "key": "customConditionalPanel",
              "weight": 110,
              "components": [
                {
                  "type": "htmlelement",
                  "tag": "div",
                  "content": "<p>The following variables are available in all scripts.</p><table class=\"table table-bordered table-condensed table-striped\"><tr><th>form</th><td>The complete form JSON object</td></tr><tr><th>submission</th><td>The complete submission object.</td></tr><tr><th>data</th><td>The complete submission data object.</td></tr><tr><th>row</th><td>Contextual \"row\" data, used within DataGrid, EditGrid, and Container components</td></tr><tr><th>component</th><td>The current component JSON</td></tr><tr><th>instance</th><td>The current component instance.</td></tr><tr><th>value</th><td>The current value of the component.</td></tr><tr><th>moment</th><td>The moment.js library for date manipulation.</td></tr><tr><th>_</th><td>An instance of <a href=\"https://lodash.com/docs/\" target=\"_blank\" rel=\"noopener noreferrer\">Lodash</a>.</td></tr><tr><th>utils</th><td>An instance of the <a href=\"http://formio.github.io/formio.js/docs/identifiers.html#utils\" target=\"_blank\" rel=\"noopener noreferrer\">FormioUtils</a> object.</td></tr><tr><th>util</th><td>An alias for \"utils\".</td></tr></table><br/>"
                },
                {
                  "type": "panel",
                  "title": "JavaScript",
                  "collapsible": true,
                  "collapsed": false,
                  "style": {
                    "margin-bottom": "10px"
                  },
                  "key": "customConditional-js",
                  "components": [
                    {
                      "type": "textarea",
                      "key": "customConditional",
                      "rows": 5,
                      "editor": "ace",
                      "hideLabel": true,
                      "as": "javascript",
                      "input": true
                    },
                    {
                      "type": "htmlelement",
                      "tag": "div",
                      "content": "<p>Enter custom javascript code.</p><p>You must assign the <strong>show</strong> variable a boolean result.</p><p><strong>Note: Advanced Conditional logic will override the results of the Simple Conditional logic.</strong></p><h5>Example</h5><pre>show = !!data.showMe;</pre>"
                    }
                  ]
                },
                {
                  "type": "panel",
                  "title": "JSONLogic",
                  "collapsible": true,
                  "collapsed": true,
                  "key": "customConditional-json",
                  "components": [
                    {
                      "type": "htmlelement",
                      "tag": "div",
                      "content": "<p>Execute custom logic using <a href=\"http://jsonlogic.com/\" target=\"_blank\" rel=\"noopener noreferrer\">JSONLogic</a>.</p><p>Full <a href=\"https://lodash.com/docs\" target=\"_blank\" rel=\"noopener noreferrer\">Lodash</a> support is provided using an \"_\" before each operation, such as <code>{\"_sum\": {var: \"data.a\"}}</code></p><p><a href=\"http://formio.github.io/formio.js/app/examples/conditions.html\" target=\"_blank\" rel=\"noopener noreferrer\">Click here for an example</a></p>"
                    },
                    {
                      "type": "textarea",
                      "key": "conditional.json",
                      "rows": 5,
                      "editor": "ace",
                      "hideLabel": true,
                      "as": "json",
                      "input": true
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "label": "Layout",
          "key": "layout",
          "weight": 60,
          "components": [
            {
              "label": "HTML Attributes",
              "type": "datamap",
              "input": true,
              "key": "attributes",
              "keyLabel": "Attribute Name",
              "valueComponent": {
                "type": "textfield",
                "key": "value",
                "label": "Attribute Value",
                "input": true
              },
              "tooltip": "Provide a map of HTML attributes for component's input element (attributes provided by other component settings or other attributes generated by form.io take precedence over attributes in this grid)",
              "addAnother": "Add Attribute"
            }
          ]
        },
        {
          "label": "Address",
          "key": "addressSettings",
          "weight": 70,
          "components": [
            {
              "type": "content",
              "key": "customContent",
              "html": "<h4>Key Language</h4><p>Change the language of the keys in the address object that will be stored.</p><br/>",
              "input": false
            },
            {
              "type": "select",
              "key": "customOptions.keyLanguage",
              "label": "Key language",
              "input": true,
              "defaultValue": "en",
              "data": {
                "values": [
                  {
                    "value": "nl",
                    "label": "Dutch"
                  },
                  {
                    "value": "en",
                    "label": "English"
                  },
                  {
                    "value": "de",
                    "label": "German"
                  }
                ]
              },
              "tooltip": "Choose a language for the keys in the address object that will be stored."
            },
            {
              "type": "content",
              "key": "customContent",
              "html": "<h4>Required Fields</h4><p>Use the checkboxes below to set \"Required\" validations for each field individually. If you want any of the fields to be required, make sure to enable \"Required\" under the \"Validation\" tab.</p><br/>",
              "input": false
            },
            {
              "type": "checkbox",
              "key": "customOptions.requiredStreet",
              "label": "Street Required",
              "defaultValue": true,
              "input": true,
              "weight": 10,
              "tooltip": "Check this if the street field should be required."
            },
            {
              "type": "checkbox",
              "key": "customOptions.requiredHouseNumber",
              "label": "House Number Required",
              "defaultValue": true,
              "input": true,
              "weight": 20,
              "tooltip": "Check this if the house number field should be required."
            },
            {
              "type": "checkbox",
              "key": "customOptions.requiredHouseLetter",
              "label": "House Letter Required",
              "defaultValue": false,
              "input": true,
              "weight": 30,
              "tooltip": "Check this if the house letter field should be required."
            },
            {
              "type": "checkbox",
              "key": "customOptions.requiredHouseNumberAddition",
              "label": "House Number Addition Required",
              "defaultValue": false,
              "input": true,
              "weight": 40,
              "tooltip": "Check this if the house number addition field should be required."
            },
            {
              "type": "checkbox",
              "key": "customOptions.requiredPostalCode",
              "label": "Postal Code Required",
              "defaultValue": true,
              "input": true,
              "weight": 50,
              "tooltip": "Check this if the postal code field should be required."
            },
            {
              "type": "checkbox",
              "key": "customOptions.requiredCity",
              "label": "City Required",
              "defaultValue": true,
              "input": true,
              "weight": 60,
              "tooltip": "Check this if the city field should be required."
            }
          ]
        }
      ]
    }
  ],
};
