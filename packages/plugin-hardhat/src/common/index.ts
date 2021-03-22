export * from './types';
export { withDefaults   } from './defaults';
export { deployProxy    } from './operations/deploy-proxy';
export { prepareUpgrade } from './operations/prepare-upgrade';
export { upgradeProxy   } from './operations/upgrade-proxy';
export {
  changeProxyAdmin,
  transferProxyAdminOwnership,
  getInstance,
} from './operations/admin';
