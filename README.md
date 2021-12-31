# Spare Dart
Demo: https://marsper-main.github.io/SpareDart/

SpareDart is the new environment where people can create "products", which are elements, objects, and is designed so that people who need a spare part of a "product", can find their product, and see the spare parts that

### Methods

buyPart: Pays the price indicated by the owner of the spare part, and reduces by 1 de amount of pieces availables
createPart: Adds the part to the parts map, referenced by the "father" product index, also, with his own part index, adding this index to the products map
createProduct: Adds the product to the products map, referneced by his own index 
getPart: Gives the data of a part by his index
getPartsLength: Gives the total amount of parts
getProduct: Gives the data of a product by his index, included his "child" parts
getProductsLength: Gives the total amount of products

# Install

```

npm install

```

or 

```

yarn install

```

# Start

```

npm run dev

```

# Build

```

npm run build

```
# Usage
1. Install the [CeloExtensionWallet](https://chrome.google.com/webstore/detail/celoextensionwallet/kkilomkmpmkbdnfelcpgckmpcaemjcdh?hl=en) from the google chrome store.
2. Create a wallet.
3. Go to [https://celo.org/developers/faucet](https://celo.org/developers/faucet) and get tokens for the alfajores testnet.
4. Switch to the alfajores testnet in the CeloExtensionWallet.
