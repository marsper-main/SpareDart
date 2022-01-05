
// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;

interface IERC20Token {
    function transfer(address, uint256) external returns (bool);

    function approve(address, uint256) external returns (bool);

    function transferFrom(
        address,
        address,
        uint256
    ) external returns (bool);

    function totalSupply() external view returns (uint256);

    function balanceOf(address) external view returns (uint256);

    function allowance(address, address) external view returns (uint256);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );
}

contract SparePart {
    uint256 internal productsLength = 0;
    uint256 internal partsLength = 0;
    address internal cUsdTokenAddress =
        0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;

    struct Product {
        string name;
        string image;
        string description;
        uint256[] parts;
    }

    struct Part {
        address payable owner;
        string name;
        uint256 price;
        uint256 pieces;
    }

    mapping(uint256 => Product) internal products;

    mapping(uint256 => Part) internal parts;

    modifier isPartOwner(uint part_id){
        // a modifier that makes sure that only the owner of a part can access it
        require(parts[part_id].owner == msg.sender);
        _;
    }
    function createProduct(
        // create a new product
        string memory _name,
        string memory _image,
        string memory _description
    ) public {
        uint256[] memory _parts;
        products[productsLength] = Product(_name, _image, _description, _parts);
        productsLength++;
    }

    function createPart(
        string memory _name,
        uint256 _price,
        uint256 _pieces,
        uint256 _prodIndex
    ) public {
        parts[partsLength] = Part(payable(msg.sender), _name, _price, _pieces);
        products[_prodIndex].parts.push(partsLength);
        partsLength++;
    }

    function getProduct(uint256 _index)
        public
        view
        returns (
            string memory,
            string memory,
            string memory,
            uint256[] memory
        )
    {
        return (
            products[_index].name,
            products[_index].image,
            products[_index].description,
            products[_index].parts
        );
    }

    function getPart(uint256 _index)
        public
        view
        returns (
            address payable,
            string memory,
            uint256,
            uint256
        )
    {
        return (
            parts[_index].owner,
            parts[_index].name,
            parts[_index].price,
            parts[_index].pieces
        );
    }

    function buyPart(uint256 _index) public payable {
        require(parts[_index].pieces > 0, "Sold Out");
        require(
            IERC20Token(cUsdTokenAddress).transferFrom(
                msg.sender,
                parts[_index].owner,
                parts[_index].price
            ),
            "Transfer failed."
        );
        parts[_index].pieces--;
    }

    function restockParts(uint part_id, uint extra) public isPartOwner(part_id) {
        // allows the seller/creator of a part to restock it when it gets exhausted

        parts[part_id].pieces += extra;
    }

    function updatePartsPrice(uint part_id, uint new_price) public isPartOwner(part_id) {
        // update the price of a part 
        parts[part_id].price = new_price;
    }

    function getProductsLength() public view returns (uint256) {
        // get the total lenght of products that currently exists on chain
        return (productsLength);
    }

    function getPartsLength() public view returns (uint256) {
        return (partsLength);
    }
}
