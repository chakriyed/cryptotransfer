import { Injectable } from '@angular/core';
import { Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ethers } from 'ethers';
import { JsonRpcProvider } from '@ethersproject/providers';
import { Contract } from 'ethers';
import { formatUnits, parseUnits } from '@ethersproject/units';
import { isAddress } from '@ethersproject/address';

@Injectable({
  providedIn: 'root',
})
export class BlockchainService {
  private provider!: JsonRpcProvider;
  private contract!: Contract;
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    if (this.isBrowser) {
      const rpcUrl = 'https://rpc-amoy.polygon.technology/';
      this.provider = new JsonRpcProvider(rpcUrl);

      const contractAddress = '0x932d60E605293da00724AD6AcDEBa7C3157A1C10';
      const contractABI = [
        "function transfer(address recipient, uint256 amount) public returns (bool)",
        "function balanceOf(address account) public view returns (uint256)"
      ];

      this.contract = new Contract(contractAddress, contractABI, this.provider);
    }
  }

  // Fetch the balance of an address
  async getBalance(address: string): Promise<string> {
    const balanceWei = await this.provider.getBalance(address);
    return formatUnits(balanceWei, 18); // Convert from Wei to Ether
  }

  // Send ERC-20 tokens
  async transferToken(
    tokenAddress: string,
    recipient: string,
    amount: number,
    signer: ethers.Signer
  ): Promise<string> {
    try {
      const address = await signer.getAddress();
      
      const network = await this.provider.getNetwork();
      console.log('Current Network:', {
        chainId: network.chainId,
        name: network.name
      });

      // Get native balance once and reuse
      const nativeBalance = await this.provider.getBalance(address);
      console.log('Native POL Balance:', formatUnits(nativeBalance, 18));

      // Rest of your existing validation
      if (!tokenAddress || !recipient || !amount) {
        throw new Error('Missing required parameters');
      }

      // Add more detailed logging
      console.log('Token Address:', tokenAddress);
      console.log('Recipient:', recipient);
      console.log('Amount:', amount);

      const contractWithSigner = new Contract(
        tokenAddress,
        [
          "function transfer(address recipient, uint256 amount) public returns (bool)",
          "function balanceOf(address account) public view returns (uint256)",
          "function decimals() public view returns (uint8)"
        ],
        signer
      );

      // Add balance check logging
      console.log('Sender address:', address);
      
      const balance = await contractWithSigner['balanceOf'](address);
      console.log('Current balance:', balance.toString());

      // Get token decimals
      const decimals = await contractWithSigner['decimals']().catch(() => 18);
      
      // Convert amount to proper decimal places
      const tokenAmount = parseUnits(amount.toString(), decimals);

      // Check ERC20 token balance
      const tokenBalance = await contractWithSigner['balanceOf'](address);
      const tokenDecimals = await contractWithSigner['decimals']().catch(() => 18);
      console.log('Token Balance:', formatUnits(tokenBalance, tokenDecimals));
      console.log('Attempting to transfer:', amount);
      
      if (tokenBalance.lt(tokenAmount)) {
        throw new Error(`Insufficient token balance. You have ${formatUnits(tokenBalance, tokenDecimals)} tokens but trying to send ${amount} tokens`);
      }

      // Estimate gas to check if transaction will fail
      const gasEstimate = await contractWithSigner['estimateGas']['transfer'](recipient, tokenAmount)
        .catch((error: any) => {
          throw new Error(`Gas estimation failed: ${error.message}`);
        });

      // Send transaction with estimated gas limit
      const tx = await contractWithSigner['transfer'](recipient, tokenAmount, {
        gasLimit: gasEstimate.mul(120).div(100), // 20% buffer
        maxFeePerGas: parseUnits('100', 'gwei'), // Use imported parseUnits
        maxPriorityFeePerGas: parseUnits('2', 'gwei') // Use imported parseUnits
      });

      console.log('Transaction details:', {
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: tx.value.toString(),
        gasLimit: tx.gasLimit.toString()
      });
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);
      
      return tx.hash;
    } catch (error: any) {
      console.error('Detailed error:', {
        message: error.message,
        code: error.code,
        data: error.data,
        transaction: error.transaction,
        reason: error.reason,
        method: error.method,
        stack: error.stack
      });
      throw new Error(`Transaction failed: ${error.message}`);
    }
  }

  // Fetch the token balance of an address
  async getTokenBalance(address: string, tokenAddress: string): Promise<string> {
    const contract = new Contract(tokenAddress, [
      "function balanceOf(address account) public view returns (uint256)"
    ], this.provider);

    const balance = await contract['balanceOf'](address);
    return formatUnits(balance, 18); // Convert from Wei to token units
  }

  // Add this method to check token balance more easily
  async checkTokenBalance(address: string): Promise<void> {
    try {
      const tokenAddress = '0x9f7f0fA54F325C9959881FB9ECF95dc45fB5113E'; // Your deployed token address
      const balance = await this.getTokenBalance(address, tokenAddress);
      console.log('Token Balance:', balance);
      
      // Also check POL balance
      const nativeBalance = await this.getBalance(address);
      console.log('POL Balance:', nativeBalance);
    } catch (error) {
      console.error('Error checking balance:', error);
    }
  }

  // Add this new method for native token transfer
  async transferNativeToken(
    recipient: string,
    amount: string,
    signer: ethers.Signer
  ): Promise<string> {
    if (!this.isBrowser) {
      throw new Error('This method is only available in browser environment');
    }
    
    try {
      // Basic validation
      if (!isAddress(recipient)) {
        throw new Error('Invalid recipient address');
      }

      const address = await signer.getAddress();
      console.log('Sender:', address);
      console.log('Recipient:', recipient);
      console.log('Amount:', amount, 'POL');

      // Get network and check if we're on Amoy
      const network = await signer.provider?.getNetwork();
      console.log('Network:', network);

      // Check balance
      const balance = await signer.provider?.getBalance(address);
      console.log('Balance:', formatUnits(balance || '0', 18), 'POL');

      // Create transaction
      const tx = await signer.sendTransaction({
        to: recipient,
        value: parseUnits(amount, 18),
      });

      console.log('Transaction hash:', tx.hash);
      return tx.hash;

    } catch (error: any) {
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        error
      });
      throw new Error(error.message || 'Transaction failed');
    }
  }
}

