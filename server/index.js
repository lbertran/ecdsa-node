const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const secp = require("ethereum-cryptography/secp256k1");
const utils = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");

app.use(cors());
app.use(express.json());

const balances = {
  "bdb271aa13d326c0f0a0c6effb9a65c9eb307577": 100,
  "ea56476293abb55cf716711bcd9af20309af2da4": 50,
  "df1bd11072586f0b3efe91eb7eb5dbeabb380fec": 75,
};

/*
privateKey: 290b9145dc22c73960efafc5192b4b71fc938fcb194de04e5a8985eea5d7b551
publicKey: 04aa6c60f5b47363bb7198713c29dd00935bc4288c203f8618c78246f3d5fc2fec28826a33a40983fc87e3549b4db9c8384a7e752aab64e157da8ee2502c993f81
publicKeyEth: bdb271aa13d326c0f0a0c6effb9a65c9eb307577

privateKey: b3c940d076fb3dabd1fe8d786899bfdbb9c29fc3b152589282af00e507867193
publicKey: 0456a8ec4ce722ade1a4a4c58fce005667e29f50325b54ef1215579c18bbbb15c363484db84b44736d0722190d3b94345aec5d53b7114a0d492626497f01188baf
publicKeyEth: ea56476293abb55cf716711bcd9af20309af2da4

privateKey: 47f98f28ef845a5b4021dca99d12f381a5fb08e9b6eae72ffb889203bd4d64da
publicKey: 045f7e690acc8ad194e5a2e7203b472ad25593e4637f170ed907113ad847cb62f684f6d2adca5e9948fc31e610c3bcd05d1205d71473c1b3570d65bfb102e83019
publicKeyEth: df1bd11072586f0b3efe91eb7eb5dbeabb380fec
*/

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  // TODO: get a signature from de client-side application
  // recover the public address from the signature

  const { sign, recoveryBit, recipient, amount } = req.body;

  const signature = new Uint8Array(sign);

  console.log(signature);

  const hashMessage = (message) => {
    return keccak256(utils.utf8ToBytes(message))
  }

  publicKey = secp.recoverPublicKey( hashMessage(recipient+parseInt(amount)), signature, recoveryBit);

  const sender = utils.toHex(keccak256(publicKey.slice(1)).slice(-20));

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
