# CryptoTransfer - Polygon Token Transfer dApp

A decentralized application built with Angular that enables users to send both native POL on the Polygon Amoy testnet.

## Features

- Connect to MetaMask wallet
- Send native POL tokens
- Check token balances
- View transaction details on Polygonscan by clicking the generated transaction hash

## Prerequisites

- Node.js (v16 or v18/should be compatible with hardhat)
- MetaMask browser extension
- POL token balance
  
## Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/cryptotransfer.git
cd cryptotransfer
```

2. **Install dependencies (if required)**
```bash
npm install
```

3. **Start development server**
```bash
ng serve
```

4. Open your browser and navigate to `http://localhost:4200`

## Network Configuration

Make sure your MetaMask is configured for Polygon Amoy Testnet:

- Network Name: Polygon Amoy Testnet
- RPC URL: https://rpc-amoy.polygon.technology/
- Chain ID: 80002
- Currency Symbol: POL
- Block Explorer: https://www.oklink.com/amoy

## Smart Contracts

The project includes two main contracts:

- `MyContract.sol`: Basic ERC-20 implementation
- `MyToken.sol`: OpenZeppelin-based ERC-20 token

### Deploying Contracts

```bash
npx hardhat run scripts/deploy.js --network amoy
```

## Environment Setup

Create a `.env` file in the root directory:

```env
PRIVATE_KEY=your_private_key_here
```



## Project Structure

```
├── src/
│   ├── app/
│   │   ├── components/
│   │   ├── services/
│   │   └── blockchain.service.ts
│   ├── assets/
│   └── environments/
├── contracts/
│   ├── MyContract.sol
│   └── MyToken.sol
└── hardhat.config.js
```


## Built With

- [Angular](https://angular.io/) - Frontend framework
- [ethers.js](https://docs.ethers.org/v5/) - Ethereum library
- [Hardhat](https://hardhat.org/) - Development environment
- [OpenZeppelin](https://openzeppelin.com/) - Smart contract library

## WORKING 

The application allows you to connect your wallet, send POL tokens, and monitor transactions. Once a transaction is completed, a transaction hash is generated and displayed. Clicking on this transaction hash will automatically redirect you to Polygonscan where you can view detailed information about the transaction including status, gas fees, and confirmation blocks.



<img width="450" alt="Screenshot 2025-01-12 at 7 25 44 PM" src="https://github.com/user-attachments/assets/36350aa6-9e71-4673-ba3a-abbb8c7ec4a3" /> 

<img width="450" alt="Screenshot 2025-01-12 at 7 26 11 PM" src="https://github.com/user-attachments/assets/369826ae-0f97-424f-8fa7-b5fe4aca8383" />

<img width="400" alt="Screenshot 2025-01-12 at 7 14 33 PM" src="https://github.com/user-attachments/assets/9cb8062b-7b30-48d1-b532-6f07cd98ab70" />

<img width="700" alt="Screenshot 2025-01-12 at 5 33 32 PM" src="https://github.com/user-attachments/assets/3273583a-a3e4-4ca2-b0e3-964321190e03" />

<img width="700" alt="Screenshot 2025-01-12 at 7 39 53 PM" src="https://github.com/user-attachments/assets/ec3e047f-4337-4d0c-a70f-4ea034fbd361" />

