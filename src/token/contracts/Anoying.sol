// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

import "@openzeppelin/contracts/token/ERC1155/presets/ERC1155PresetMinterPauser.sol";
import "openzeppelin-solidity/contracts/utils/math/SafeMath.sol";

contract Anoying is ERC1155PresetMinterPauser {
    using SafeMath for uint256;
    uint256 tokenAmount = 0;

    struct Token{
        uint256 id;
        address owner;
        address sender;
        string dataKey;
        uint256 balance;
        uint256 till;
    }
    mapping(uint256 => Token) public ownership;

    constructor() ERC1155PresetMinterPauser('http://localhost:3003?token={id}') {
    }

    function mintToken(
        address to,
        uint256 amount,
        string memory data,
        uint256 daysTillExpire
    ) public virtual returns(uint256) {
        tokenAmount = tokenAmount.add(1);
        _mint(to, tokenAmount, amount, bytes(data));
        ownership[tokenAmount] = Token(tokenAmount, to, msg.sender, data, amount, block.timestamp.add(daysTillExpire.mul(86400)));
        return tokenAmount;
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

    function getTokensToBurn(address sender) public view returns(Token[] memory) {
        uint256 l = 0;
        for (uint256 index = 1; index <= tokenAmount; index++) {
            if(ownership[index].sender == sender && ownership[index].balance > 0){
                l = l.add(1);
            }
        }

        Token[] memory tokensBySender = new Token[](l);
        l = 0;
        for (uint256 _index = 1; _index <= tokenAmount; _index++) {
            if(ownership[_index].sender == sender && ownership[_index].balance > 0){
                tokensBySender[l] = ownership[_index];
                l = l.add(1);
            }
        }

        return tokensBySender;
    }

    function burnToken(uint256 tokenId, uint256 amount) public{
        address owner = ownership[tokenId].owner;
        address sender = ownership[tokenId].sender;
        uint256 balance = ownership[tokenId].balance;
        uint256 till = ownership[tokenId].till;
        require(msg.sender == owner || msg.sender == sender, "Cannot burn");
        require(till >= block.timestamp, "Coupon expired");
        require(balance >= amount, "Balance too small");
        emit TransferSingle(msg.sender, owner, address(0), tokenId, amount);
        // _burn(owner, tokenId, amount);
        ownership[tokenId].balance = balance.sub(amount);
    }
}
