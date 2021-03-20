import { EthereumProvider, Manifest, getAdminAddress } from '@openzeppelin/upgrades-core';

import {
  Environment,
  ContractInstance,
  ChangeAdminFunction,
  TransferProxyAdminOwnershipFunction,
  GetInstanceFunction,
  getProxyAdminFactory,
  attach,
  Options,
  withDefaults,
} from './utils';

const changeProxyAdmin: ChangeAdminFunction = async function(proxyAddress: string, newAdmin: string, opts: Options = {}): Promise<void> {
  const env: Environment = withDefaults(opts);
  const admin = await getManifestAdmin(env);
  const proxyAdminAddress = await getAdminAddress(env.provider, proxyAddress);

  if (admin.address !== proxyAdminAddress) {
    throw new Error('Proxy admin is not the one registered in the network manifest');
  } else if (admin.address !== newAdmin) {
    await admin.changeProxyAdmin(proxyAddress, newAdmin);
  }
}

const transferProxyAdminOwnership: TransferProxyAdminOwnershipFunction = async function(newOwner: string, opts: Options = {}): Promise<void> {
  const env: Environment = withDefaults(opts);
  const admin = await getManifestAdmin(env);
  await admin.transferOwnership(newOwner);
}

const getInstance: GetInstanceFunction = async function(opts: Options = {}): Promise<ContractInstance> {
  const env: Environment = withDefaults(opts);
  return await getManifestAdmin(env);
}

export async function getManifestAdmin(env: Environment): Promise<ContractInstance> {
  const { provider } = env;
  const manifest = await Manifest.forNetwork(provider);
  const manifestAdmin = await manifest.getAdmin();
  const proxyAdminAddress = manifestAdmin?.address;

  if (proxyAdminAddress === undefined) {
    throw new Error('No ProxyAdmin was found in the network manifest');
  }

  const AdminFactory = await getProxyAdminFactory(env);
  return attach(AdminFactory, proxyAdminAddress);
}

export const admin = {
  getInstance,
  transferProxyAdminOwnership,
  changeProxyAdmin,
};
