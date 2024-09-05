type DossierDetailLayoutUnit = 'pixel' | 'percent';

interface DossierDetailLayout {
  unit: DossierDetailLayoutUnit;
  widthAdjustable: boolean;
  showRightPanel?: boolean;
  leftPanelWidth?: number;
  leftPanelMinWidth?: number;
  leftPanelMaxWidth?: number;
  rightPanelWidth?: number;
  rightPanelMinWidth?: number;
  rightPanelMaxWidth?: number;
}

export {DossierDetailLayoutUnit, DossierDetailLayout};
