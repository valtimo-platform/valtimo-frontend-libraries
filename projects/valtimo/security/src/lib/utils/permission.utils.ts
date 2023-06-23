import {PermissionRequestCollection} from '../models';

const getCollectionKey = (requestCollection: PermissionRequestCollection): string => {
  const input = JSON.stringify(requestCollection);
  let hash = 0,
    len = input.length;
  for (let i = 0; i < len; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0; // to 32bit integer
  }
  return `${hash}`;
};

export {getCollectionKey};
