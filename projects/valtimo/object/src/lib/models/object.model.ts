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

export  {ObjectConfiguration, ObjectConfigurationItem, Object}
