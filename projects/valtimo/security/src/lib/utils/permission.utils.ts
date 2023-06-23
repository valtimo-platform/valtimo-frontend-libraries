import {PermissionRequestCollection} from '../models';

const getCollectionKey = (requestCollection: PermissionRequestCollection): string => {
  return JSON.stringify(requestCollection);
};

export {getCollectionKey};
