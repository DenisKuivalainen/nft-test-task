import { useEffect, useState } from "react";
import Web3 from "web3";
import { fromWei } from "./weiConverter";

export default () => {
  const [loading, setLoading] = useState(true);
  const [web3, setWeb3] = useState();
  const [account, setAccount] = useState();
  const [networkId, setNetworkId] = useState();
  const [eth, setEth] = useState();

  const getWeb3 = async () => {
    setLoading(true);
    if (window.ethereum) {
      const _web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
      return setWeb3(_web3);
    }
    const provider = new Web3.providers.HttpProvider("http://127.0.0.1:7545");
    const _web3 = new Web3(provider);
    return setWeb3(_web3);
  };

  const useContract = (contractJson, networkAddress) => {
    const [contract, setContract] = useState();
    const [balance, setBalance] = useState(0);

    useEffect(() => {
      if (web3 && networkId && account) {
        const deployedAddress =
          networkAddress || contractJson?.networks?.[networkId]?.address;
        const _contract = new web3.eth.Contract(
          contractJson.abi,
          deployedAddress
        );
        setContract(_contract);
        // _contract.methods
        //   .balanceOf?.(account)
        //   .call()
        //   .then(fromWei)
        //   .then(parseFloat)
        //   .then(setBalance)
        //   .catch((e) => 0);
      }
    }, [web3, networkId, account]);

    return {
      contract,
      balance,
    };
  };

  const getConfiguration = async () => {
    if (!web3) return;
    const accounts = await web3.eth.getAccounts();
    const _account = accounts[0];
    const _networkId = await web3.eth.net.getId();
    const _eth = parseFloat(fromWei(await web3.eth.getBalance(_account)));
    setAccount(_account);
    setNetworkId(_networkId);
    setEth(_eth);
  };

  const updateConfig = () => getConfiguration().then(() => setLoading(false));

  window.ethereum.on("accountsChanged", updateConfig);
  useEffect(() => {
    getWeb3();
    return () => {
      window.ethereum.removeListener("accountsChanged", updateConfig);
      setLoading(true);
    };
  }, []);

  useEffect(() => {
    updateConfig();
  }, [web3]);

  return {
    web3,
    account,
    networkId,
    balance: eth,
    useContract,
    isLoaded: !loading,
    reload: getWeb3,
  };
};
