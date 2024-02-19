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
            },
            {
              "type": "panel",
              "title": "Calculated Value",
              "theme": "default",
              "collapsible": true,
              "collapsed": true,
              "key": "calculateValuePanel",
              "weight": 1100,
              "components": [
                {
                  "type": "htmlelement",
                  "tag": "div",
                  "content": "<p>The following variables are available in all scripts.</p><table class=\"table table-bordered table-condensed table-striped\"><tr><th>token</th><td>The decoded JWT token for the authenticated user.</td></tr><tr><th>form</th><td>The complete form JSON object</td></tr><tr><th>submission</th><td>The complete submission object.</td></tr><tr><th>data</th><td>The complete submission data object.</td></tr><tr><th>row</th><td>Contextual \"row\" data, used within DataGrid, EditGrid, and Container components</td></tr><tr><th>component</th><td>The current component JSON</td></tr><tr><th>instance</th><td>The current component instance.</td></tr><tr><th>value</th><td>The current value of the component.</td></tr><tr><th>moment</th><td>The moment.js library for date manipulation.</td></tr><tr><th>_</th><td>An instance of <a href=\"https://lodash.com/docs/\" target=\"_blank\" rel=\"noopener noreferrer\">Lodash</a>.</td></tr><tr><th>utils</th><td>An instance of the <a href=\"http://formio.github.io/formio.js/docs/identifiers.html#utils\" target=\"_blank\" rel=\"noopener noreferrer\">FormioUtils</a> object.</td></tr><tr><th>util</th><td>An alias for \"utils\".</td></tr></table><br/>"
                },
                {
                  "type": "panel",
                  "title": "JavaScript",
                  "collapsible": true,
                  "collapsed": false,
                  "style": {
                    "margin-bottom": "10px"
                  },
                  "key": "calculateValue-js",
                  "components": [
                    {
                      "type": "textarea",
                      "key": "calculateValue",
                      "rows": 5,
                      "editor": "ace",
                      "hideLabel": true,
                      "as": "javascript",
                      "input": true
                    },
                    {
                      "type": "htmlelement",
                      "tag": "div",
                      "content": "<p>Enter custom javascript code.</p><p><h4>Example:</h4><pre>value = data.a + data.b + data.c;</pre></p>"
                    }
                  ]
                },
                {
                  "type": "panel",
                  "title": "JSONLogic",
                  "collapsible": true,
                  "collapsed": true,
                  "key": "calculateValue-json",
                  "components": [
                    {
                      "type": "htmlelement",
                      "tag": "div",
                      "content": "<p>Execute custom logic using <a href=\"http://jsonlogic.com/\" target=\"_blank\" rel=\"noopener noreferrer\">JSONLogic</a>.</p><p>Full <a href=\"https://lodash.com/docs\" target=\"_blank\" rel=\"noopener noreferrer\">Lodash</a> support is provided using an \"_\" before each operation, such as <code>{\"_sum\": {var: \"data.a\"}}</code></p><p><h4>Example:</h4><pre>{\"+\": [{\"var\": \"data.a\"}, {\"var\": \"data.b\"}, {\"var\": \"data.c\"}]}</pre><p><a href=\"http://formio.github.io/formio.js/app/examples/calculated.html\" target=\"_blank\" rel=\"noopener noreferrer\">Click here for an example</a></p>"
                    },
                    {
                      "type": "textarea",
                      "key": "calculateValue",
                      "rows": 5,
                      "editor": "ace",
                      "hideLabel": true,
                      "as": "json",
                      "input": true
                    }
                  ]
                }
              ]
            },
            {
              "type": "checkbox",
              "input": true,
              "weight": 1100,
              "key": "calculateServer",
              "label": "Calculate Value on server",
              "tooltip": "Checking this will run the calculation on the server. This is useful if you wish to override the values submitted with the calculations performed on the server."
            },
            {
              "type": "checkbox",
              "input": true,
              "weight": 1200,
              "key": "allowCalculateOverride",
              "label": "Allow Manual Override of Calculated Value",
              "tooltip": "When checked, this will allow the user to manually override the calculated value."
            }
          ],
          "label": "Data",
          "weight": 10
        },
        {
          "key": "validation",
          "components": [
            {
              "weight": 0,
              "type": "select",
              "key": "validateOn",
              "defaultValue": "change",
              "input": true,
              "label": "Validate On",
              "tooltip": "Determines when this component should trigger front-end validation.",
              "dataSrc": "values",
              "data": {
                "values": [
                  {
                    "label": "Change",
                    "value": "change"
                  },
                  {
                    "label": "Blur",
                    "value": "blur"
                  }
                ]
              }
            },
            {
              "weight": 10,
              "type": "checkbox",
              "label": "Required",
              "tooltip": "A required field must be filled in before the form can be submitted.",
              "key": "validate.required",
              "input": true
            },
            {
              "weight": 100,
              "type": "checkbox",
              "label": "Unique",
              "tooltip": "Makes sure the data submitted for this field is unique, and has not been submitted before.",
              "key": "unique",
              "input": true
            },
            {
              "weight": 110,
              "key": "validate.minLength",
              "label": "Minimum Length",
              "placeholder": "Minimum Length",
              "type": "number",
              "tooltip": "The minimum length requirement this field must meet.",
              "input": true
            },
            {
              "weight": 120,
              "key": "validate.maxLength",
              "label": "Maximum Length",
              "placeholder": "Maximum Length",
              "type": "number",
              "tooltip": "The maximum length requirement this field must meet.",
              "input": true
            },
            {
              "weight": 125,
              "key": "validate.minWords",
              "label": "Minimum Word Length",
              "placeholder": "Minimum Word Length",
              "type": "number",
              "tooltip": "The minimum amount of words that can be added to this field.",
              "input": true
            },
            {
              "weight": 126,
              "key": "validate.maxWords",
              "label": "Maximum Word Length",
              "placeholder": "Maximum Word Length",
              "type": "number",
              "tooltip": "The maximum amount of words that can be added to this field.",
              "input": true
            },
            {
              "weight": 130,
              "key": "validate.pattern",
              "label": "Regular Expression Pattern",
              "placeholder": "Regular Expression Pattern",
              "type": "textfield",
              "tooltip": "The regular expression pattern test that the field value must pass before the form can be submitted.",
              "input": true
            },
            {
              "weight": 190,
              "type": "textfield",
              "input": true,
              "key": "errorLabel",
              "label": "Error Label",
              "placeholder": "Error Label",
              "tooltip": "The label for this field when an error occurs."
            },
            {
              "weight": 200,
              "key": "validate.customMessage",
              "label": "Custom Error Message",
              "placeholder": "Custom Error Message",
              "type": "textfield",
              "tooltip": "Error message displayed if any error occurred.",
              "input": true
            },
            {
              "type": "panel",
              "title": "Custom Validation",
              "collapsible": true,
              "collapsed": true,
              "style": {
                "margin-bottom": "10px"
              },
              "key": "custom-validation-js",
              "weight": 300,
              "components": [
                {
                  "type": "htmlelement",
                  "tag": "div",
                  "content": "<p>The following variables are available in all scripts.</p><table class=\"table table-bordered table-condensed table-striped\"><tr><th>input</th><td>The value that was input into this component</td></tr><tr><th>form</th><td>The complete form JSON object</td></tr><tr><th>submission</th><td>The complete submission object.</td></tr><tr><th>data</th><td>The complete submission data object.</td></tr><tr><th>row</th><td>Contextual \"row\" data, used within DataGrid, EditGrid, and Container components</td></tr><tr><th>component</th><td>The current component JSON</td></tr><tr><th>instance</th><td>The current component instance.</td></tr><tr><th>value</th><td>The current value of the component.</td></tr><tr><th>moment</th><td>The moment.js library for date manipulation.</td></tr><tr><th>_</th><td>An instance of <a href=\"https://lodash.com/docs/\" target=\"_blank\" rel=\"noopener noreferrer\">Lodash</a>.</td></tr><tr><th>utils</th><td>An instance of the <a href=\"http://formio.github.io/formio.js/docs/identifiers.html#utils\" target=\"_blank\" rel=\"noopener noreferrer\">FormioUtils</a> object.</td></tr><tr><th>util</th><td>An alias for \"utils\".</td></tr></table><br/>"
                },
                {
                  "type": "textarea",
                  "key": "validate.custom",
                  "rows": 5,
                  "editor": "ace",
                  "hideLabel": true,
                  "as": "javascript",
                  "input": true
                },
                {
                  "type": "htmlelement",
                  "tag": "div",
                  "content": "\n          <small>\n            <p>Enter custom validation code.</p>\n            <p>You must assign the <strong>valid</strong> variable as either <strong>true</strong> or an error message if validation fails.</p>\n            <h5>Example:</h5>\n            <pre>valid = (input === 'Joe') ? true : 'Your name must be \"Joe\"';</pre>\n          </small>"
                },
                {
                  "type": "well",
                  "components": [
                    {
                      "weight": 100,
                      "type": "checkbox",
                      "label": "Secret Validation",
                      "tooltip": "Check this if you wish to perform the validation ONLY on the server side. This keeps your validation logic private and secret.",
                      "description": "Check this if you wish to perform the validation ONLY on the server side. This keeps your validation logic private and secret.",
                      "key": "validate.customPrivate",
                      "input": true
                    }
                  ]
                }
              ]
            },
            {
              "type": "panel",
              "title": "JSONLogic Validation",
              "collapsible": true,
              "collapsed": true,
              "key": "json-validation-json",
              "weight": 400,
              "components": [
                {
                  "type": "htmlelement",
                  "tag": "div",
                  "content": "<p>Execute custom logic using <a href=\"http://jsonlogic.com/\" target=\"_blank\" rel=\"noopener noreferrer\">JSONLogic</a>.</p><h5>Example:</h5><pre>{\n  \"if\": [\n    {\n      \"===\": [\n        {\n          \"var\": \"input\"\n        },\n        \"Bob\"\n      ]\n    },\n    true,\n    \"Your name must be 'Bob'!\"\n  ]\n}</pre>"
                },
                {
                  "type": "textarea",
                  "key": "validate.json",
                  "hideLabel": true,
                  "rows": 5,
                  "editor": "ace",
                  "as": "json",
                  "input": true
                }
              ]
            },
            {
              "type": "panel",
              "title": "Custom Errors",
              "collapsible": true,
              "collapsed": true,
              "key": "errors",
              "weight": 400,
              "components": [
                {
                  "type": "textarea",
                  "key": "errors",
                  "hideLabel": true,
                  "rows": 5,
                  "editor": "ace",
                  "as": "json",
                  "input": true
                },
                {
                  "type": "htmlelement",
                  "tag": "div",
                  "content": "\n          <p>This allows you to set different custom error messages for different errors\n          (in contrast to “Custom Error Message”, which only allows you to set one\n          error message for all errors). E.g.</p>\n\n<pre>{\n  \"required\": \"{<span/>{ field }} is required. Try again.\",\n  \"maxLength\": \"{<span/>{ field }} is too long. Try again.\"\n}</pre>\n\n          <p>You can set the following keys (among others):</p>\n          <ul>\n            <li>r<span/>equired</li>\n            <li>m<span/>in</li>\n            <li>m<span/>ax</li>\n            <li>m<span/>inLength</li>\n            <li>m<span/>axLength</li>\n            <li>m<span/>inWords</li>\n            <li>m<span/>axWords</li>\n            <li>i<span/>nvalid_email</li>\n            <li>i<span/>nvalid_date</li>\n            <li>i<span/>nvalid_day</li>\n            <li>i<span/>nvalid_regex</li>\n            <li>m<span/>ask</li>\n            <li>p<span/>attern</li>\n            <li>c<span/>ustom</li>\n          </ul>\n\n          <p>Depending on the error message some of the following template variables can be used in the script:</p>\n          <ul>\n           <li><code>{<span/>{ f<span/>ield }}</code> is replaced with the label of the field.</li>\n           <li><code>{<span/>{ m<span/>in }}</code></li>\n           <li><code>{<span/>{ m<span/>ax }}</code></li>\n           <li><code>{<span/>{ l<span/>ength }}</code></li>\n           <li><code>{<span/>{ p<span/>attern }}</code></li>\n           <li><code>{<span/>{ m<span/>inDate }}</code></li>\n           <li><code>{<span/>{ m<span/>axDate }}</code></li>\n           <li><code>{<span/>{ m<span/>inYear }}</code></li>\n           <li><code>{<span/>{ m<span/>axYear }}</code></li>\n           <li><code>{<span/>{ r<span/>egex }}</code></li>\n          </ul>\n        "
                }
              ]
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
              "title": "Simple",
              "key": "simple-conditional",
              "theme": "default",
              "weight": 105,
              "components": [
                {
                  "type": "select",
                  "input": true,
                  "label": "This component should Display:",
                  "key": "conditional.show",
                  "dataSrc": "values",
                  "data": {
                    "values": [
                      {
                        "label": "True",
                        "value": "true"
                      },
                      {
                        "label": "False",
                        "value": "false"
                      }
                    ]
                  }
                },
                {
                  "type": "select",
                  "input": true,
                  "label": "When the form component:",
                  "key": "conditional.when",
                  "dataSrc": "custom",
                  "valueProperty": "value",
                  "data": {}
                },
                {
                  "type": "textfield",
                  "input": true,
                  "label": "Has the value:",
                  "key": "conditional.eq"
                }
              ]
            },
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
          "label": "Logic",
          "key": "logic",
          "weight": 50,
          "components": [
            {
              "weight": 0,
              "input": true,
              "label": "Advanced Logic",
              "key": "logic",
              "templates": {
                "header": "<div class=\"row\"> \n  <div class=\"col-sm-6\">\n    <strong>{{ value.length }} {{ ctx.t(\"Advanced Logic Configured\") }}</strong>\n  </div>\n</div>",
                "row": "<div class=\"row\"> \n  <div class=\"col-sm-6\">\n    <div>{{ row.name }} </div>\n  </div>\n  <div class=\"col-sm-2\"> \n    <div class=\"btn-group pull-right\"> \n      <button class=\"btn btn-default editRow\">{{ ctx.t(\"Edit\") }}</button> \n      <button class=\"btn btn-danger removeRow\">{{ ctx.t(\"Delete\") }}</button> \n    </div> \n  </div> \n</div>",
                "footer": ""
              },
              "type": "editgrid",
              "addAnother": "Add Logic",
              "saveRow": "Save Logic",
              "components": [
                {
                  "weight": 0,
                  "input": true,
                  "inputType": "text",
                  "label": "Logic Name",
                  "key": "name",
                  "validate": {
                    "required": true
                  },
                  "type": "textfield"
                },
                {
                  "weight": 10,
                  "key": "triggerPanel",
                  "input": false,
                  "title": "Trigger",
                  "tableView": false,
                  "components": [
                    {
                      "weight": 0,
                      "input": true,
                      "tableView": false,
                      "components": [
                        {
                          "weight": 0,
                          "input": true,
                          "label": "Type",
                          "key": "type",
                          "tableView": false,
                          "data": {
                            "values": [
                              {
                                "value": "simple",
                                "label": "Simple"
                              },
                              {
                                "value": "javascript",
                                "label": "Javascript"
                              },
                              {
                                "value": "json",
                                "label": "JSON Logic"
                              },
                              {
                                "value": "event",
                                "label": "Event"
                              }
                            ]
                          },
                          "dataSrc": "values",
                          "template": "<span>{{ item.label }}</span>",
                          "type": "select"
                        },
                        {
                          "weight": 10,
                          "label": "",
                          "key": "simple",
                          "type": "container",
                          "tableView": false,
                          "components": [
                            {
                              "input": true,
                              "key": "show",
                              "label": "Show",
                              "type": "hidden",
                              "tableView": false
                            },
                            {
                              "type": "select",
                              "input": true,
                              "label": "When the form component:",
                              "key": "when",
                              "dataSrc": "custom",
                              "valueProperty": "value",
                              "tableView": false,
                              "data": {}
                            },
                            {
                              "type": "textfield",
                              "input": true,
                              "label": "Has the value:",
                              "key": "eq",
                              "tableView": false
                            }
                          ]
                        },
                        {
                          "weight": 10,
                          "type": "textarea",
                          "key": "javascript",
                          "rows": 5,
                          "editor": "ace",
                          "as": "javascript",
                          "input": true,
                          "tableView": false,
                          "placeholder": "result = (data['mykey'] > 1);",
                          "description": "\"row\", \"data\", and \"component\" variables are available. Return \"result\"."
                        },
                        {
                          "weight": 10,
                          "type": "textarea",
                          "key": "json",
                          "rows": 5,
                          "editor": "ace",
                          "label": "JSON Logic",
                          "as": "json",
                          "input": true,
                          "tableView": false,
                          "placeholder": "{ ... }",
                          "description": "\"row\", \"data\", \"component\" and \"_\" variables are available. Return the result to be passed to the action if truthy."
                        },
                        {
                          "weight": 10,
                          "type": "textfield",
                          "key": "event",
                          "label": "Event Name",
                          "placeholder": "event",
                          "description": "The event that will trigger this logic. You can trigger events externally or via a button.",
                          "tableView": false
                        }
                      ],
                      "key": "trigger",
                      "type": "container"
                    }
                  ],
                  "type": "panel"
                },
                {
                  "weight": 20,
                  "input": true,
                  "label": "Actions",
                  "key": "actions",
                  "tableView": false,
                  "templates": {
                    "header": "<div class=\"row\"> \n  <div class=\"col-sm-6\"><strong>{{ value.length }} {{ ctx.t(\"actions\") }}</strong></div>\n</div>",
                    "row": "<div class=\"row\"> \n  <div class=\"col-sm-6\">\n    <div>{{ row.name }} </div>\n  </div>\n  <div class=\"col-sm-2\"> \n    <div class=\"btn-group pull-right\"> \n      <button class=\"btn btn-default editRow\">{{ ctx.t(\"Edit\") }}</button> \n      <button class=\"btn btn-danger removeRow\">{{ ctx.t(\"Delete\") }}</button> \n    </div> \n  </div> \n</div>",
                    "footer": ""
                  },
                  "type": "editgrid",
                  "addAnother": "Add Action",
                  "saveRow": "Save Action",
                  "components": [
                    {
                      "weight": 0,
                      "title": "Action",
                      "input": false,
                      "key": "actionPanel",
                      "type": "panel",
                      "components": [
                        {
                          "weight": 0,
                          "input": true,
                          "inputType": "text",
                          "label": "Action Name",
                          "key": "name",
                          "validate": {
                            "required": true
                          },
                          "type": "textfield"
                        },
                        {
                          "weight": 10,
                          "input": true,
                          "label": "Type",
                          "key": "type",
                          "data": {
                            "values": [
                              {
                                "value": "property",
                                "label": "Property"
                              },
                              {
                                "value": "value",
                                "label": "Value"
                              },
                              {
                                "label": "Merge Component Schema",
                                "value": "mergeComponentSchema"
                              },
                              {
                                "label": "Custom Action",
                                "value": "customAction"
                              }
                            ]
                          },
                          "dataSrc": "values",
                          "template": "<span>{{ item.label }}</span>",
                          "type": "select"
                        },
                        {
                          "weight": 20,
                          "type": "select",
                          "template": "<span>{{ item.label }}</span>",
                          "dataSrc": "json",
                          "tableView": false,
                          "data": {
                            "json": [
                              {
                                "label": "Hidden",
                                "value": "hidden",
                                "type": "boolean"
                              },
                              {
                                "label": "Required",
                                "value": "validate.required",
                                "type": "boolean"
                              },
                              {
                                "label": "Disabled",
                                "value": "disabled",
                                "type": "boolean"
                              },
                              {
                                "label": "Label",
                                "value": "label",
                                "type": "string"
                              },
                              {
                                "label": "Title",
                                "value": "title",
                                "type": "string"
                              },
                              {
                                "label": "Prefix",
                                "value": "prefix",
                                "type": "string"
                              },
                              {
                                "label": "Suffix",
                                "value": "suffix",
                                "type": "string"
                              },
                              {
                                "label": "Tooltip",
                                "value": "tooltip",
                                "type": "string"
                              },
                              {
                                "label": "Description",
                                "value": "description",
                                "type": "string"
                              },
                              {
                                "label": "Placeholder",
                                "value": "placeholder",
                                "type": "string"
                              },
                              {
                                "label": "Input Mask",
                                "value": "inputMask",
                                "type": "string"
                              },
                              {
                                "label": "CSS Class",
                                "value": "className",
                                "type": "string"
                              },
                              {
                                "label": "Container Custom Class",
                                "value": "customClass",
                                "type": "string"
                              }
                            ]
                          },
                          "key": "property",
                          "label": "Component Property",
                          "input": true
                        },
                        {
                          "weight": 30,
                          "input": true,
                          "label": "Set State",
                          "key": "state",
                          "tableView": false,
                          "data": {
                            "values": [
                              {
                                "label": "True",
                                "value": "true"
                              },
                              {
                                "label": "False",
                                "value": "false"
                              }
                            ]
                          },
                          "dataSrc": "values",
                          "template": "<span>{{ item.label }}</span>",
                          "type": "select"
                        },
                        {
                          "weight": 30,
                          "type": "textfield",
                          "key": "text",
                          "label": "Text",
                          "inputType": "text",
                          "input": true,
                          "tableView": false,
                          "description": "Can use templating with {{ data.myfield }}. \"data\", \"row\", \"component\" and \"result\" variables are available."
                        },
                        {
                          "weight": 20,
                          "input": true,
                          "label": "Value (Javascript)",
                          "key": "value",
                          "editor": "ace",
                          "as": "javascript",
                          "rows": 5,
                          "placeholder": "value = data.myfield;",
                          "type": "textarea",
                          "tableView": false,
                          "description": "\"row\", \"data\", \"component\", and \"result\" variables are available. Return the value."
                        },
                        {
                          "weight": 20,
                          "input": true,
                          "label": "Schema Defenition",
                          "key": "schemaDefinition",
                          "editor": "ace",
                          "as": "javascript",
                          "rows": 5,
                          "placeholder": "schema = { label: 'Updated' };",
                          "type": "textarea",
                          "tableView": false,
                          "description": "\"row\", \"data\", \"component\", and \"result\" variables are available. Return the schema."
                        },
                        {
                          "type": "htmlelement",
                          "tag": "div",
                          "content": "<p>The following variables are available in all scripts.</p><table class=\"table table-bordered table-condensed table-striped\"><tr><th>input</th><td>The value that was input into this component</td></tr><tr><th>form</th><td>The complete form JSON object</td></tr><tr><th>submission</th><td>The complete submission object.</td></tr><tr><th>data</th><td>The complete submission data object.</td></tr><tr><th>row</th><td>Contextual \"row\" data, used within DataGrid, EditGrid, and Container components</td></tr><tr><th>component</th><td>The current component JSON</td></tr><tr><th>instance</th><td>The current component instance.</td></tr><tr><th>value</th><td>The current value of the component.</td></tr><tr><th>moment</th><td>The moment.js library for date manipulation.</td></tr><tr><th>_</th><td>An instance of <a href=\"https://lodash.com/docs/\" target=\"_blank\" rel=\"noopener noreferrer\">Lodash</a>.</td></tr><tr><th>utils</th><td>An instance of the <a href=\"http://formio.github.io/formio.js/docs/identifiers.html#utils\" target=\"_blank\" rel=\"noopener noreferrer\">FormioUtils</a> object.</td></tr><tr><th>util</th><td>An alias for \"utils\".</td></tr></table><br/>"
                        },
                        {
                          "weight": 20,
                          "input": true,
                          "label": "Custom Action (Javascript)",
                          "key": "customAction",
                          "editor": "ace",
                          "rows": 5,
                          "placeholder": "value = data.myfield;",
                          "type": "textarea",
                          "tableView": false
                        }
                      ]
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
            },
            {
              "type": "panel",
              "legend": "PDF Overlay",
              "title": "PDF Overlay",
              "key": "overlay",
              "tooltip": "The settings inside apply only to the PDF forms.",
              "weight": 2000,
              "collapsible": true,
              "collapsed": true,
              "components": [
                {
                  "type": "textfield",
                  "input": true,
                  "key": "overlay.style",
                  "label": "Style",
                  "placeholder": "",
                  "tooltip": "Custom styles that should be applied to this component when rendered in PDF."
                },
                {
                  "type": "textfield",
                  "input": true,
                  "key": "overlay.page",
                  "label": "Page",
                  "placeholder": "",
                  "tooltip": "The PDF page to place this component."
                },
                {
                  "type": "textfield",
                  "input": true,
                  "key": "overlay.left",
                  "label": "Left",
                  "placeholder": "",
                  "tooltip": "The left margin within a page to place this component."
                },
                {
                  "type": "textfield",
                  "input": true,
                  "key": "overlay.top",
                  "label": "Top",
                  "placeholder": "",
                  "tooltip": "The top margin within a page to place this component."
                },
                {
                  "type": "textfield",
                  "input": true,
                  "key": "overlay.width",
                  "label": "Width",
                  "placeholder": "",
                  "tooltip": "The width of the component (in pixels)."
                },
                {
                  "type": "textfield",
                  "input": true,
                  "key": "overlay.height",
                  "label": "Height",
                  "placeholder": "",
                  "tooltip": "The height of the component (in pixels)."
                }
              ]
            }
          ]
        },
        {
          "label": "Address Settings",
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
