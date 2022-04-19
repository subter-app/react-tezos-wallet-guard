// Reference(s)
// - https://usehooks.com/useAuth/
// - https://tacode.dev/courses/dev-starter/chapters/a31b419e-402f-4bc6-88ee-1bb59dd250e4

import { useState, useEffect, useContext, createContext } from "react";
import { TezosToolkit } from "@taquito/taquito";
import { BeaconWallet } from "@taquito/beacon-wallet";
import {
  NetworkType,
  BeaconEvent,
  defaultEventCallbacks
} from "@airgap/beacon-sdk";
import PropTypes from 'prop-types';

const networks = {
  mainnet: {
    url: "https://mainnet.api.tez.ie",
    type: NetworkType.MAINNET
  },
  hangzhounet: {
    url: "https://hangzhounet.api.tez.ie",
    type: NetworkType.HANGZHOUNET
  }
}

const authContext = createContext();

function useProvideAuth({ network, contractAddress, beaconWalletOptions: { eventHandlers, ...beaconWalletOptions } }) {
  const selectedNetwork = networks[network];
  const [Tezos, setTezos] = useState(
    new TezosToolkit(selectedNetwork.url)
  );
  const [contract, setContract] = useState(undefined);
  const [publicToken, setPublicToken] = useState("");
  const [wallet, setWallet] = useState(null);
  const [userAddress, setUserAddress] = useState("");
  const [userBalance, setUserBalance] = useState(0);
  const [storage, setStorage] = useState(0);
  const [beaconConnection, setBeaconConnection] = useState(false);

  const connectWallet = async () => {
    try {
      await wallet.requestPermissions({
        network: {
          type: selectedNetwork.type,
          rpcUrl: selectedNetwork.url
        }
      });

      // gets user's address
      const userAddress = await wallet.getPKH();
      await setup(userAddress);

      setBeaconConnection(true);
    } catch (error) {
      console.log(error);
    }
  };

  const disconnectWallet = async () => {
    setUserAddress("");
    setUserBalance(0);
    setWallet(null);
    const tezosTK = new TezosToolkit(selectedNetwork.url);
    setTezos(tezosTK);
    setBeaconConnection(false);
    setPublicToken(null);

    if (wallet) {
      await wallet.client.removeAllAccounts();
      // https://github.com/ecadlabs/taquito/issues/1421
      // await wallet.client.removeAllPeers();
      await wallet.client.destroy();
    }
  }

  const setup = async (userAddress) => {
    setUserAddress(userAddress);

    // updates balance
    const balance = await Tezos.tz.getBalance(userAddress);
    setUserBalance(balance.toNumber());

    // creates contract instance
    const contract = await Tezos.wallet.at(contractAddress);
    const storage = await contract.storage();
    setContract(contract);
    setStorage(storage);
  };

  const onTransaction = async () => {
    const newStorage = await contract.storage();
    setStorage(newStorage);
    const newUserBalance = await Tezos.tz.getBalance(userAddress);
    setUserBalance(newUserBalance);
  }

  useEffect(() => {
    (async () => {
      const wallet = new BeaconWallet({
        ...beaconWalletOptions,
        preferredNetwork: selectedNetwork.type,
        eventHandlers: {
          ...eventHandlers,
          // Bare minimum default event handlers
          [BeaconEvent.PAIR_INIT]: {
            handler: defaultEventCallbacks.PAIR_INIT
          },
          [BeaconEvent.PAIR_SUCCESS]: {
            handler: data => setPublicToken(data.publicKey)
          }
        },
      });

      Tezos.setWalletProvider(wallet);

      setWallet(wallet);

      // Was the wallet previously connected?
      const activeAccount = await wallet.client.getActiveAccount();

      if (activeAccount) {
        const userAddress = await wallet.getPKH();
        await setup(userAddress);
        setBeaconConnection(true);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Return the user object and auth methods
  return {
    Tezos,
    contract,
    publicToken,
    wallet,
    userAddress,
    userBalance,
    storage,
    onTransaction,
    beaconConnection,
    connectWallet,
    disconnectWallet
  };
}

function ProvideAuth({ network, contractAddress, beaconWalletOptions, children }) {
  const auth = useProvideAuth({ network, contractAddress, beaconWalletOptions });
  return <authContext.Provider value={auth}>{children}</authContext.Provider>;
}

const useAuth = () => {
  return useContext(authContext);
};

ProvideAuth.propTypes = {
  contractAddress: PropTypes.string.isRequired,
  network: PropTypes.oneOf(["mainnet", "hangzhounet"]).isRequired,
  beaconWalletOptions: PropTypes.object
}

export { ProvideAuth, useAuth };
