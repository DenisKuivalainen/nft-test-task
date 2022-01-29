import { useState } from "react";
import { toChecksumAddress } from "ethereumjs-util";
import { recoverTypedSignature_v4 } from "eth-sig-util";
import Web3 from "web3";
import { useEffect } from "react";
import { fromWei } from "./weiConverter";

export default () => {
  const [signedAddresses, setSignedAddresses] = useState([]);
  const [userAddress, setUserAddress] = useState();
  const [ethBalance, setEthBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  const getBalance = async () => {
    if (!isSigned || !userAddress) return;
    const web3 = new Web3(window.ethereum);
    setEthBalance(
      parseFloat(fromWei(await web3.eth.getBalance(userAddress))).toFixed(4)
    );
  };

  const signin = async () => {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    const account = accounts[0];

    const msgParams = {
      domain: {
        chainId: 3,
        name: "Ether Mail",
        verifyingContract: "https.hornykittens.com",
        version: "1",
      },
      message: {},
      primaryType: "Mail",
      types: {
        EIP712Domain: [
          { name: "name", type: "string" },
          { name: "version", type: "string" },
          { name: "chainId", type: "uint256" },
          { name: "verifyingContract", type: "address" },
        ],
        Mail: [],
      },
    };

    window.ethereum.sendAsync(
      {
        method: "eth_signTypedData_v4",
        params: [account, JSON.stringify(msgParams)],
        from: account,
      },
      (err, result) => {
        if (err || result.error) return console.log(err, result.error);

        const recovered = recoverTypedSignature_v4({
          data: msgParams,
          sig: result.result,
        });

        if (toChecksumAddress(recovered) === toChecksumAddress(account)) {
          setUserAddress(account);
          setSignedAddresses([account, ...signedAddresses]);
        }
      }
    );
  };

  useEffect(() => {
    getBalance().then(() => setLoading(false));
  }, [userAddress, signedAddresses]);

  window.ethereum.on("accountsChanged", (accounts) => {
    setLoading(true);
    setUserAddress(accounts[0]);
  });

  const isSigned = signedAddresses.includes(userAddress || "");
  return {
    isSigned,
    signIn: async () => {
      if (!isSigned) await signin();
    },
    address: userAddress,
    ethBalance,
    loading,
  };
};
