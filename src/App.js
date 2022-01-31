import { uid } from "uid";
import Tokens from "./Tokens";
import useLogin from "./utils/useLogin";

function App() {
  const { signIn, isSigned, loading } = useLogin();

  if (!isSigned)
    return (
      <div>
        Sign in with Ropsten testnet <button onClick={signIn}>SIGN IN</button>
      </div>
    );
  if (loading) return <p>loading...</p>;
  return <Tokens key={uid()} />;
}

export default () => (
  <div style={{ marginLeft: 25, marginTop: 25 }}>
    <App />
  </div>
);
