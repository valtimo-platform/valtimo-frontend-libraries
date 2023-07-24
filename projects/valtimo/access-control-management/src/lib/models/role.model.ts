interface Role {
  roleKey: string;
}

interface DeleteRolesRequest {
  roles: Array<string>;
}

type RoleMetadataModal = 'add' | 'edit';

type RoleExport = 'unified' | 'separate';

interface ExportRoleOutput {
  roleKeys: Array<string>;
  type: RoleExport;
}

export {Role, DeleteRolesRequest, RoleMetadataModal, RoleExport, ExportRoleOutput};
