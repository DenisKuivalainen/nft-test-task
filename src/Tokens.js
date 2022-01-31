import axios from "axios";
import { useEffect, useState } from "react";
import Anoying from "./Anoying.json";
// import Anoying from "./token/build/contracts/Anoying.json";
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

  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [name, setName] = useState("");
  const [days, setDays] = useState("");
  const [tokens, setTokens] = useState([]);

  const [amountToBurn, setAmountToBurn] = useState("");
  const [idToBurn, setIdToBurn] = useState("");
  const [tokensToBurn, setTokensToBurn] = useState([]);

  const [pending, setPending] = useState(false);

  const contract = useContract(Anoying);

  const reload = (e) => {
    if (e) console.log(e);
    window.alert("Some error happened i-i");
    window.reload();
  };

  const getTokens = async () => {
    setPending(true);
    if (!contract) return;
    await contract.methods
      .getTokens(account)
      .call()
      .then((ts) =>
        ts.map((t) => ({
          id: t[0],
          data: t[3],
          balance: t[4],
        }))
      )
      .then((ts) => {
        setTokens(ts);
      })
      .catch(reload);

    await contract.methods
      .getTokensToBurn(account)
      .call()
      .then((ts) => ts.filter((t) => t[5] * 1000 >= Date.now()))
      .then((ts) =>
        ts.map((t) => ({
          id: t[0],
          balance: t[4],
          expiration: t[5],
        }))
      )
      .then((ts) => {
        setTokensToBurn(ts);
      })
      .catch(reload);

    setPending(false);
  };

  const burnToken = () => {
    setPending(true);
    contract?.methods
      .burnToken(idToBurn, amountToBurn)
      .send({ from: account })
      .then(() => {
        setPending(false);
        reloadWeb3();
        setAmountToBurn("");
        setIdToBurn("");
      })
      .catch(reload);
  };

  useEffect(() => {
    if (!contract) return;
    getTokens();
    setTo(account);
  }, [contract]);

  const mint = async () => {
    setPending(true);
    axios({
      url: "/api/upload",
      data: {
        name,
        minter: account.substr(2),
        reciever: to.substr(2),
        expiration: Math.floor(Date.now() / 1000) + parseInt(days) * 86400,
      },
      method: "POST",
    })
      .then((res) => res.data)
      .then((res) => {
        return res;
      })
      .then((data) =>
        contract.methods
          .mintToken(to, amount, data, days)
          .send({ from: account })
          .then(() => {
            reloadWeb3();
            setName("");
            setAmount("");
            setDays("");
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

  const numValHandler = (fn) => (e) => {
    const val = e.target.value;
    if (/^\d*$/.test(val)) fn(val);
  };

  if (!isLoaded || !account || !contract) return <p>Loading...</p>;
  if (pending) return <p>Pending operation...</p>;
  return (
    <div>
      <p>{account}</p>
      <p>{ethBalance} ETH</p>
      <div>
        <input
          placeholder="name"
          onChange={(e) => setName(e.target.value)}
          value={name}
        ></input>
        <input
          onChange={numValHandler(setAmount)}
          value={amount}
          placeholder="amount"
        ></input>
        <input
          placeholder="reciever"
          onChange={(e) => setTo(e.target.value)}
          value={to}
        ></input>
        <input
          placeholder="days till expire"
          onChange={numValHandler(setDays)}
          value={days}
        ></input>
        <button
          onClick={mint}
          disabled={
            !name.length || !to.length || !amount.length || !days.length
          }
        >
          Mint
        </button>
        <br />
        <br />

        {tokensToBurn.length ? (
          <>
            <select
              onChange={(e) => {
                setIdToBurn(e.target.value);
                setAmountToBurn("");
              }}
              value={idToBurn}
              style={{ width: 153 }}
            >
              <option hidden disabled selected value=""></option>
              {tokensToBurn.map((t) => (
                <option value={t.id}>{t.id}</option>
              ))}{" "}
            </select>
            {idToBurn.length ? (
              <select
                onChange={(e) => setAmountToBurn(e.target.value)}
                value={amountToBurn}
                style={{ width: 153 }}
              >
                <option hidden disabled selected value=""></option>
                {"t"
                  .repeat(
                    parseInt(
                      tokensToBurn.find((t) => t.id === idToBurn).balance
                    )
                  )
                  .split("")
                  .map((t, i) => (
                    <option value={`${i + 1}`}>{i + 1}</option>
                  ))}{" "}
              </select>
            ) : (
              <div style={{ width: 153, display: "inline-block" }} />
            )}
            <button
              onClick={burnToken}
              disabled={!idToBurn.length || !amountToBurn.length}
            >
              Burn
            </button>
            <br />
            <br />
          </>
        ) : (
          <></>
        )}
      </div>
      <div style={{ marginTop: 20 }}>
        {tokens.length ? <p>Press on any token to use it:</p> : <></>}
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
    </div>
  );
};
