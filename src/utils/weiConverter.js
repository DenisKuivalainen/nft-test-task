import Web3 from "web3";

export const toWei = (ammount) => Web3.utils.toWei(ammount.toString(), "ether");
export const fromWei = (ammount) =>
  Web3.utils.fromWei(ammount.toString(), "ether");
