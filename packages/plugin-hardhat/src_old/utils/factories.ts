import { FactoryGetter, makeFactoryGetter } from '../specialize/factories';

import ERC1967Proxy from '@openzeppelin/upgrades-core/artifacts/@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol/ERC1967Proxy.json';
import TransparentUpgradeableProxy from '@openzeppelin/upgrades-core/artifacts/@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol/TransparentUpgradeableProxy.json';
import ProxyAdmin from '@openzeppelin/upgrades-core/artifacts//@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol/ProxyAdmin.json';

export const getProxyFactory: FactoryGetter = makeFactoryGetter(ERC1967Proxy);
export const getTransparentUpgradeableProxyFactory: FactoryGetter = makeFactoryGetter(TransparentUpgradeableProxy);
export const getProxyAdminFactory: FactoryGetter = makeFactoryGetter(ProxyAdmin);
