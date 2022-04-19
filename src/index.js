import { ProvideAuth, useAuth } from './TezosWalletGuard.jsx';

const returnLibrary = () => {
  return {
    ProvideAuth,
    useAuth
  }
}
export default returnLibrary()
