# Reactjs Tezos Wallet Guard

A reactjs component that is meant to wrap around your routes to manage connection and disconnect of the wallet (through [Beacon SDK](https://github.com/airgap-it/beacon-sdk))

## Installation & Usage

To install, run:

```bash
npm install @subter/react-tezos-wallet-guard
```

You can then use it in your code as follows:

```js
// index.js
import { ProvideAuth } from "@subter/react-tezos-wallet-guard";
import { BeaconEvent } from "@airgap/beacon-sdk";

// Your component code
// ...
// ...
ReactDOM.render(
  <React.StrictMode>
    <ProvideAuth
      network="hangzhounet"
      contractAddress={process.env.REACT_APP_BACKEND_CONTRACT_ADDRESS}
      beaconWalletOptions={{
        name: "Subter Development",
        disableDefaultEvents: true,
        eventHandlers={{
          [BeaconEvent.LOCAL_RATE_LIMIT_REACHED]: {
            handler: data => console.log("Local rate limit reached")
          }
        }}
      }}
    >
      {/** React Router */}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </ProvideAuth>
  </React.StrictMode>,
  document.getElementById("root")
);
```

and then in any of your defined components:

```js
import { useAuth } from "@subter/react-tezos-wallet-guard";

// Your component code
// ...
// ...
const { contract, storage, onTransaction, userAddress } = useAuth();
```

## Props

### network (string)(required)

The network in which to lookup the domain. Supported values:

- mainnet
- hangzhounet

### contractAddress (string)(required)

Your backend contract address

### beaconWalletOptions (object)(optional)

The config object passed to `BeaconWallet` from the [@taquito/beacon-wallet](https://www.npmjs.com/package/@taquito/beacon-wallet) package.

- The `preferredNetwork` is set to the value passed for the `network` prop
- For the `eventHandlers`, the `BeaconEvent.PAIR_INIT` and the `BeaconEvent.PAIR_SUCCESS` are being used by the library (and it will override any event handlers defined by you)


## Exports

### `<ProvideAuth />` component

A reactjs context provider.

### `useAuth()` hook

A reactjs hook that provides the following details:

- Tezos => The `TezosToolkit()`
- contract => The backend contract
- publicToken => Once the wallet is paired, the public key of the user's wallet address
- wallet => The `BeaconWallet()`
- userAddress => The Wallet's address
- userBalance => The tezos balance in the user's wallet
- storage => The storage on the backend contract
- onTransaction => Function to be called after each blockchain transaction, to update the contract's storage and user's balance details
- beaconConnection => Read this value to know if the wallet is connected or not
- connectWallet => Function to initiate connection with the user's wallet
- disconnectWallet => Function to initiate disconnection with the user's wallet
