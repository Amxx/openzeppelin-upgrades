import { EthereumProvider, Manifest, getAdminAddress } from '@openzeppelin/upgrades-core';
import {
  ContractInstance,
  ChangeAdminFunction,
  TransferProxyAdminOwnershipFunction,
  GetInstanceFunction,
  Options,
  withDefaults,
} from './types/index';
import { getProxyAdminFactory, attach, wrapProvider } from './utils';

const changeProxyAdmin: ChangeAdminFunction = async function(proxyAddress: string, newAdmin: string, opts: Options = {}): Promise<void> {
  const { deployer } = withDefaults(opts);
  const provider = wrapProvider(deployer.provider);
  const admin = await getManifestAdmin(provider);
  const proxyAdminAddress = await getAdminAddress(provider, proxyAddress);

  if (admin.address !== proxyAdminAddress) {
    throw new Error('Proxy admin is not the one registered in the network manifest');
  } else if (admin.address !== newAdmin) {
    await admin.changeProxyAdmin(proxyAddress, newAdmin);
  }
}

const transferProxyAdminOwnership: TransferProxyAdminOwnershipFunction = async function(newOwner: string, opts: Options = {}): Promise<void> {
  const { deployer } = withDefaults(opts);
  const provider = wrapProvider(deployer.provider);
  const admin = await getManifestAdmin(provider);
  await admin.transferOwnership(newOwner);
}

const getInstance: GetInstanceFunction = async function(opts: Options = {}): Promise<ContractInstance> {
  const { deployer } = withDefaults(opts);
  const provider = wrapProvider(deployer.provider);
  return await getManifestAdmin(provider);
}

export async function getManifestAdmin(provider: EthereumProvider): Promise<ContractInstance> {
  const manifest = await Manifest.forNetwork(provider);
  const manifestAdmin = await manifest.getAdmin();
  const proxyAdminAddress = manifestAdmin?.address;

  if (proxyAdminAddress === undefined) {
    throw new Error('No ProxyAdmin was found in the network manifest');
  }

  const AdminFactory = getProxyAdminFactory();
  return attach(AdminFactory, proxyAdminAddress);
}

export const admin = {
  getInstance,
  transferProxyAdminOwnership,
  changeProxyAdmin,
};
