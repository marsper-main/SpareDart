import Web3 from "web3"
import { newKitFromWeb3 } from "@celo/contractkit"
import BigNumber from "bignumber.js"
import marketplaceAbi from "../contract/spacedart.abi.json"
import erc20Abi from "../contract/erc20.abi.json"
import {MPContractAddress, ERC20_DECIMALS, cUSDContractAddress} from "./utils/constants";


let kit
let contract
let products = []
let parts = []
let viewPos

const connectCeloWallet = async function () {
  if (window.celo) {
    notification("⚠️ Please approve this DApp to use it.")
    try {
      await window.celo.enable()
      notificationOff()

      const web3 = new Web3(window.celo)
      kit = newKitFromWeb3(web3)

      const accounts = await kit.web3.eth.getAccounts()
      kit.defaultAccount = accounts[0]

      contract = new kit.web3.eth.Contract(marketplaceAbi, MPContractAddress)
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
  } else {
    notification("⚠️ Please install the CeloExtensionWallet.")
  }
}

async function approve(_price) {
  const cUSDContract = new kit.web3.eth.Contract(erc20Abi, cUSDContractAddress)

  return  await cUSDContract.methods
    .approve(MPContractAddress, _price)
    .send({ from: kit.defaultAccount })

}

const getBalance = async function () {
  const totalBalance = await kit.getTotalBalance(kit.defaultAccount)
  document.querySelector("#balance").textContent = totalBalance.cUSD.shiftedBy(-ERC20_DECIMALS).toFixed(2)

}

const getProducts = async function() {
  const _productsLength = await contract.methods.getProductsLength().call()
  const _products = []
  for (let i = 0; i < _productsLength; i++) {
    let _product = new Promise(async (resolve) => {
      let p = await contract.methods.getProduct(i).call()
      resolve({
        index: i,
        name: p[0],
        image: p[1],
        descriptiion: p[2],
        parts: p[3]
      })
    })
    _products.push(_product)
  }
  products = await Promise.all(_products)
  renderProducts()
}

function renderProducts() {
  document.getElementById("marketplace").innerHTML = ""
  products.forEach((_product) => {
    const newDiv = document.createElement("div")
    newDiv.className = "col-md-4"
    newDiv.innerHTML = productTemplate(_product)
    document.getElementById("marketplace").appendChild(newDiv)
  })
}

function productTemplate(_product) {
  return `
    <div class="card" style="width: 18rem;">
      <img src="${_product.image}" class="card-img-top" alt="...">
      <div class="position-absolute top-0 end-0 bg-info mt-4 px-2 py-1 rounded-start">
        ${_product.parts.length} ${_product.parts.length == 1 ? "Part" : "Parts"}
      </div>
      <div class="card-body">
        <h5 class="card-title">${_product.name}</h5>
        <p class="card-text">${_product.descriptiion}</p>
        <a data-bs-toggle="modal" data-bs-target="#seePartsModal" class="btn btn-primary seeParts" id="${_product.index}">See Parts</a>
      </div>
    </div>
  `
}


function notification(_text) {
  document.querySelector(".alert").style.display = "block"
  document.querySelector("#notification").textContent = _text
}

function notificationOff() {
  document.querySelector(".alert").style.display = "none"
}

window.addEventListener("load", async () => {
  notification("⌛ Loading...")
  await connectCeloWallet()
  await getBalance()
  await getProducts()
  notificationOff()
});

document
  .querySelector("#newProductBtn")
  .addEventListener("click", async () => {
    const params = [
      document.getElementById("newProductName").value,
      document.getElementById("newImgUrl").value,
      document.getElementById("newProductDescription").value
    ]
    notification(`⌛ Adding "${params[0]}"...`)
    try {
      await contract.methods
        .createProduct(...params)
        .send({ from: kit.defaultAccount })
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
    notification(`🎉 You successfully added "${params[0]}".`)
    getProducts()
  })

document.querySelector("#newPartBtn").addEventListener("click", async () => {
  console.log("newpart");
  const params = [
    document.getElementById("newPartName").value,
    new BigNumber(document.getElementById("newPrice").value)
      .shiftedBy(ERC20_DECIMALS)
      .toString(),
    document.getElementById("newPieces").value,
    viewPos
  ]
  console.log(params);
  
  notification(`⌛ Adding "${params[0]}"...`)
  try {
     await contract.methods
      .createPart(...params)
      .send({ from: kit.defaultAccount })
  } catch (error) {
    notification(`⚠️ ${error}.`)
  }
  notification(`🎉 You successfully added "${params[0]}".`)
  renderParts(viewPos)
  getProducts()
})

document.querySelector("#partsRender").addEventListener("click", async (e) => {
  if (e.target.className.includes("buyBtn")) {
    const index = e.target.id
    console.log(index);
    console.log(parts);
    const found = parts.find(element => element.index == index);
    console.log(found);
    notification("⌛ Waiting for payment approval...")
    try {

      await approve(found.price)
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
    notification(`⌛ Awaiting payment for "${found.name}"...`)
    try {

      await contract.methods
        .buyPart(index)
        .send({ from: kit.defaultAccount })
      notification(`🎉 You successfully bought "${found.name}".`)
      getProducts()
      renderParts(viewPos)
      getBalance()
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
  }
})  

document.querySelector("#marketplace").addEventListener("click", async (e) => {
  if(e.target.className.includes("seeParts")){
    const index = e.target.id
    viewPos = index
    renderParts(index)
  }
})

async function renderParts(index) {
    document.getElementById("partsRender").innerHTML = ""

    const partsList = products[index].parts

    const group = document.createElement("ul")
    group.className = "list-group list-group-flush"

    for (let _partIndex of partsList){
      const _part = await contract.methods.getPart(_partIndex).call()
      parts.push({
        index: _partIndex,
        owner: _part[0],
        name: _part[1],
        price: new BigNumber(_part[2]),
        pieces: _part[3]
      })
      const lastIndex = parts.length - 1
      console.log(parts[lastIndex]);
      let buttonRender
      if (parts[lastIndex].pieces > 0) {
        buttonRender = `<a id="${_partIndex}" class="btn btn-primary buyBtn">Buy for ${parts[lastIndex].price.shiftedBy(-ERC20_DECIMALS).toFixed(2)} cUSD</a>`
      }
      else {
        buttonRender = `<button type="button" class="btn btn-outline-primary" disabled>Sold Out</button>`
      }
      group.innerHTML += `<li class="list-group-item">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">${parts[lastIndex].name}</h5>
            <p class="card-text">${parts[lastIndex].pieces} available</p>
            ${buttonRender}
          </div>
        </div>
      </li>`
    }
    document.getElementById("partsRender").appendChild(group)
}