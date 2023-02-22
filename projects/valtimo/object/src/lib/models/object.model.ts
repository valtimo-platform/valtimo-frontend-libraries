interface ObjectConfiguration {
  content: ObjectConfigurationItem[];
}

interface ObjectConfigurationItem {
  id: string;
  items: Object[];
}

interface Object {
  key: string;
  value: string;
}

enum FormType {
  SUMMARY = 'SUMMARY',
  EDITFORM = 'EDITFORM',
}

export {ObjectConfiguration, ObjectConfigurationItem, Object, FormType};
