import axios from "axios";
import { useEffect, useState } from "react";
import Anoying from "./token/build/contracts/Anoying.json";
import Ticket from "./utils/Ticket";
import useWeb3 from "./utils/useWeb3";

export default () => {
  const {
    account,
    balance: ethBalance,
    isLoaded,
    reload: reloadWeb3,
    useContract,
  } = useWeb3();

  const [isMinter, setIsMinter] = useState(false);
  const [to, setTo] = useState("0x0b935E0249d8C6e58a9299e5FA22f6333a3EE5af");
  const [amountToBurn, setAmountToBurn] = useState("");
  const [idToBurn, setIdToBurn] = useState("");
  const [amount, setAmount] = useState("");
  const [name, setName] = useState("");
  const [tokens, setTokens] = useState([]);
  const [pending, setPending] = useState(false);

  const { contract } = useContract(Anoying);

  const reload = (e) => {
    if (e) console.log(e);
    window.alert("Some error happened i-i");
    window.reload();
  };

  const getTokens = () => {
    setPending(true);
    if (!contract) return;
    contract.methods
      .getTokens(account)
      .call()
      .then((ts) =>
        ts.map((t) => ({
          id: t[0],
          data: t[2],
          balance: t[3],
        }))
      )
      .then((ts) => {
        setTokens(ts);
        setPending(false);
      })
      .catch(reload);
  };

  const burnToken = () => {
    setPending(true);
    contract?.methods
      .burnToken(idToBurn, amountToBurn)
      .send({ from: account })
      .then(() => {
        setPending(false);
        reloadWeb3();
      })
      .catch(reload);
  };

  useEffect(() => {
    setIsMinter(false);
    if (!contract) return;
    contract?.methods.isMinter(account).call().then(setIsMinter);
    getTokens();
  }, [contract]);

  const mint = async () => {
    setPending(true);
    axios({
      url: "/api/upload",
      data: { name },
      method: "POST",
    })
      .then((res) => res.data)
      .then((data) =>
        contract.methods
          .mintToken(to, amount, data)
          .send({ from: account })
          .then(() => {
            reloadWeb3();
            setName("");
            setAmount("");
            setPending(false);
          })
          .catch(reload)
      )
      .catch(reload);
  };
  const useToken = (id) => {
    setPending(true);
    contract?.methods
      .burnToken(id, "1")
      .send({ from: account })
      .then(() => {
        setPending(false);
        reloadWeb3();
      })
      .catch(reload);
  };

  if (!isLoaded || !account || !contract) return <p>Loading...</p>;
  if (pending) return <p>Pending operation...</p>;
  return (
    <div>
      <p>{account}</p>
      <p>{ethBalance} ETH</p>
      {isMinter && (
        <div>
          <input
            placeholder="name"
            onChange={(e) => setName(e.target.value)}
            value={name}
          ></input>
          <input
            onChange={(e) => {
              const val = e.target.value;
              if (/^\d*$/.test(val)) setAmount(val);
            }}
            value={amount}
            placeholder="amount"
          ></input>
          <input
            placeholder="reciever"
            onChange={(e) => setTo(e.target.value)}
            value={to}
          ></input>
          <button
            onClick={mint}
            disabled={!name.length || !to.length || !amount.length}
          >
            Mint
          </button>
          <br />
          <input
            placeholder="token id"
            onChange={(e) => setIdToBurn(e.target.value)}
            value={idToBurn}
          ></input>
          <input
            onChange={(e) => {
              const val = e.target.value;
              if (/^\d*$/.test(val)) setAmountToBurn(val);
            }}
            value={amountToBurn}
            placeholder="amount"
          ></input>
          <button
            onClick={burnToken}
            disabled={!idToBurn.length || !amountToBurn.length}
          >
            Burn
          </button>
          <br />
        </div>
      )}
      {tokens.map((t) => (
        <Ticket
          code={t.data}
          ticketId={t.id}
          uses={t.balance}
          key={`token-${t.id}`}
          onUse={() => useToken(t.id)}
        />
      ))}
    </div>
  );
};
