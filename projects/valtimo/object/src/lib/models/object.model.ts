interface ObjectConfiguration {
  content: ObjectConfigurationItem[];
}

interface ObjectConfigurationItem {
  id: string;
  items: Item[];
}

interface Item {
  key: string;
  value: string;
}

enum FormType {
  SUMMARY = 'SUMMARY',
  EDITFORM = 'EDITFORM',
}

export {ObjectConfiguration, ObjectConfigurationItem, Item, FormType};
