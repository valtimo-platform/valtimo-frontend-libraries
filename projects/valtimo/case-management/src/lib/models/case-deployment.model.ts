export class CaseDeploymentData {
  caseDefinitionKey: string;
  caseDefinitionVersionTag: string;
  name: string;
  description: string;
  createdBy: string;
  createdDate: Date;
  basedOnVersionTag: string;
  final: boolean;
  canHaveAssignee: boolean;
  autoAssignTasks: boolean;
  active: boolean;
  conflictingVersions: string;
}

export class ReleaseVersionData {
  caseDefinitionVersionTag: string;
  basedOnVersionTag: string;
}

export class ReleaseInformationData {
  createdBy: string;
  createdDate: Date;
  description: string;
}
