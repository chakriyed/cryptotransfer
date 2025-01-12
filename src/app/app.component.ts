import { Component } from '@angular/core';
import { BlockchainService } from './blockchain.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { formatUnits } from '@ethersproject/units';
import { ethers } from 'ethers';
import { Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const tokenAbi = [
  "function transfer(address recipient, uint256 amount) public returns (bool)",
  "function balanceOf(address account) public view returns (uint256)",
  "function decimals() public view returns (uint8)",
  "function symbol() public view returns (string)"
];

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class AppComponent {
  recipient: string = '';
  amount: number = 0;
  contractAddress: string = '';
  errorMessage: string = '';
  transactionHash: string = '';
  connectedAddress: string = '';
  balance: string = '';
  tokenBalance: string = '';
  tokenSymbol: string = '';

  constructor(
    private blockchainService: BlockchainService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  async connectWallet() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    try {
      if (!(window as any).ethereum) {
        throw new Error('MetaMask is not installed.');
      }

      const provider = new ethers.providers.Web3Provider((window as any).ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      this.connectedAddress = accounts[0];

      const balanceWei = await provider.getBalance(this.connectedAddress);
      this.balance = formatUnits(balanceWei, 18);
      this.errorMessage = '';
    } catch (error: any) {
      this.errorMessage = 'Error connecting to wallet: ' + error.message;
    }
  }

  async addAmoyNetwork() {
    try {
      await (window as any).ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0x13882', // 80002
          chainName: 'Polygon Amoy Testnet',
          nativeCurrency: {
            name: 'POL',
            symbol: 'POL',
            decimals: 18
          },
          rpcUrls: ['https://rpc-amoy.polygon.technology/'],
          blockExplorerUrls: ['https://www.oklink.com/amoy']
        }]
      });
    } catch (error: any) {
      console.error('Error adding network:', error);
    }
  }

  async sendTransaction() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    try {
      if (!this.recipient || !this.amount) {
        throw new Error('Please fill in all fields');
      }

      // Add network first
      await this.addAmoyNetwork();
      
      const provider = new ethers.providers.Web3Provider((window as any).ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();

      // Force switch to Amoy network
      await (window as any).ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x13882' }],
      });

      // Double check network
      const network = await provider.getNetwork();
      console.log('Current network:', network);
      if (network.chainId !== 80002) {
        throw new Error('Please switch to Polygon Amoy Testnet');
      }

      // Get transaction parameters
      const address = await signer.getAddress();
      const balance = await provider.getBalance(address);
      const amountWei = ethers.utils.parseEther(this.amount.toString());
      
      // Estimate gas
      const gasEstimate = await provider.estimateGas({
        from: address,
        to: this.recipient,
        value: amountWei
      });

      console.log('Transaction details:', {
        from: address,
        to: this.recipient,
        amount: this.amount,
        balance: formatUnits(balance, 18),
        gasEstimate: gasEstimate.toString()
      });

      // Check if we have enough balance including gas
      const gasPrice = await provider.getGasPrice();
      const gasCost = gasEstimate.mul(gasPrice);
      const totalCost = amountWei.add(gasCost);

      if (balance.lt(totalCost)) {
        throw new Error(`Insufficient balance. Need ${formatUnits(totalCost, 18)} POL but have ${formatUnits(balance, 18)} POL`);
      }

      // Send transaction with explicit gas settings
      const tx = await signer.sendTransaction({
        to: this.recipient,
        value: amountWei,
        gasLimit: gasEstimate.mul(120).div(100), // Add 20% buffer
        gasPrice: gasPrice
      });

      console.log('Transaction sent:', tx.hash);
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);
      
      this.transactionHash = tx.hash;
      this.errorMessage = '';
    } catch (error: any) {
      console.error('Detailed error:', error);
      this.errorMessage = error.message || 'Transaction failed';
    }
  }

  async checkBalance() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    try {
      if (!this.contractAddress) {
        throw new Error('Please enter a token contract address');
      }

      const provider = new ethers.providers.Web3Provider((window as any).ethereum);
      const tokenContract = new ethers.Contract(this.contractAddress, tokenAbi, provider);

      // Get connected wallet address if not already connected
      if (!this.connectedAddress) {
        const accounts = await provider.send('eth_requestAccounts', []);
        this.connectedAddress = accounts[0];
      }

      // Get token decimals and symbol
      const decimals = await tokenContract['decimals']();
      this.tokenSymbol = await tokenContract['symbol']();

      // Get balance
      const balance = await tokenContract['balanceOf'](this.connectedAddress);
      this.tokenBalance = ethers.utils.formatUnits(balance, decimals);
      
      this.errorMessage = '';
    } catch (error: any) {
      console.error('Error checking balance:', error);
      this.errorMessage = `Error checking balance: ${error.message}`;
    }
  }
}

