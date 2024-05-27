enum CaseWidgetDisplayTypeKey {
  BOOLEAN = 'boolean',
  CURRENCY = 'currency',
  DATE = 'date',
  ENUM = 'enum',
  NUMBER = 'number',
  PERCENT = 'percent',
}

interface CaseWidgetBooleanDisplayType {
  type: CaseWidgetDisplayTypeKey.BOOLEAN;
}

interface CaseWidgetCurrencyDisplayType {
  type: CaseWidgetDisplayTypeKey.CURRENCY;
  currencyCode?: string;
  display?: string;
  digitsInfo?: string;
}

interface CaseWidgetDateDisplayType {
  type: CaseWidgetDisplayTypeKey.DATE;
  format?: string;
}

interface CaseWidgetEnumDisplayType {
  type: CaseWidgetDisplayTypeKey.ENUM;
  values: {
    [key: string]: string;
  };
}

interface CaseWidgetNumberDisplayType {
  type: CaseWidgetDisplayTypeKey.NUMBER;
  digitsInfo: '1.0-0';
}

interface CaseWidgetPercentDisplayType {
  type: CaseWidgetDisplayTypeKey.PERCENT;
  digitsInfo: '1.0-0';
}

type CaseWidgetDisplayType =
  | CaseWidgetBooleanDisplayType
  | CaseWidgetCurrencyDisplayType
  | CaseWidgetDateDisplayType
  | CaseWidgetEnumDisplayType
  | CaseWidgetNumberDisplayType
  | CaseWidgetPercentDisplayType;

export {
  CaseWidgetDisplayTypeKey,
  CaseWidgetDisplayType,
  CaseWidgetBooleanDisplayType,
  CaseWidgetCurrencyDisplayType,
  CaseWidgetDateDisplayType,
  CaseWidgetEnumDisplayType,
  CaseWidgetNumberDisplayType,
  CaseWidgetPercentDisplayType,
};
