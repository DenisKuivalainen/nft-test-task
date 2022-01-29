// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

import "@openzeppelin/contracts/token/ERC1155/presets/ERC1155PresetMinterPauser.sol";
import "openzeppelin-solidity/contracts/utils/math/SafeMath.sol";

contract Anoying is ERC1155PresetMinterPauser {
    using SafeMath for uint256;
    address MINTER;
    uint256 tokenAmount = 0;

    struct Token{
        uint256 id;
        address owner;
        string dataKey;
        uint256 balance;
    }
    mapping(uint256 => Token) public ownership;

    constructor() ERC1155PresetMinterPauser('http://localhost:3003?token={id}') {
        MINTER = msg.sender;
    }

    function mintToken(
        address to,
        uint256 amount,
        string memory data
    ) public virtual returns(uint256) {
        require(MINTER == msg.sender);
        tokenAmount = tokenAmount.add(1);
        mint(to, tokenAmount, amount, bytes(data));
        ownership[tokenAmount] = Token(tokenAmount, to, data, amount);
        return tokenAmount;
    }

    function isMinter(address from) public view returns(bool) {
        return MINTER == from;
    }

    function getTokens(address owner) public view returns(Token[] memory) {
        uint256 l = 0;
        for (uint256 index = 1; index <= tokenAmount; index++) {
            if(ownership[index].owner == owner && ownership[index].balance > 0){
                l = l.add(1);
            }
        }

        Token[] memory tokensOfOwner = new Token[](l);
        l = 0;
        for (uint256 _index = 1; _index <= tokenAmount; _index++) {
            if(ownership[_index].owner == owner && ownership[_index].balance > 0){
                tokensOfOwner[l] = ownership[_index];
                l = l.add(1);
            }
        }

        return tokensOfOwner;
    }

    function burnToken(uint256 tokenId, uint256 amount) public{
        address owner = ownership[tokenId].owner;
        uint256 balance = ownership[tokenId].balance;
        require(msg.sender == owner || msg.sender == MINTER, "Cannot burn");
        require(balance >= amount, "Balance too small");
        _burn(owner, tokenId, amount);
        ownership[tokenId].balance = balance.sub(1);
    }
}
