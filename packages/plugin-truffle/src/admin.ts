import chalk from 'chalk';
import { EthereumProvider, getAdminAddress, Manifest } from '@openzeppelin/upgrades-core';
import { ContractInstance, getProxyAdminFactory, wrapProvider, Options, withDefaults } from './utils';

const SUCCESS_CHECK = chalk.keyword('green')('✔') + ' ';
const FAILURE_CROSS = chalk.keyword('red')('✘') + ' ';

async function changeProxyAdmin(proxyAddress: string, newAdmin: string, opts: Options = {}): Promise<void> {
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
  const env: Environment = withDefaults(opts);
  const admin = await getManifestAdmin(env);
  await admin.transferOwnership(newOwner);

  const manifest = await Manifest.forNetwork(provider);
  const { proxies } = await manifest.read();
  for (const { address, kind } of proxies) {
    if (admin.address == (await getAdminAddress(provider, address))) {
      console.log(SUCCESS_CHECK + `${address} (${kind}) proxy ownership transfered through admin proxy`);
    } else {
      console.log(FAILURE_CROSS + `${address} (${kind}) proxy ownership not affected by admin proxy`);
    }
  }
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
