/**
 * Crypto Payment System for AI Agents
 * Enables autonomous USDC/USDT transactions
 */

import { ethers } from 'ethers';

// Stablecoin contracts on Ethereum mainnet
const CONTRACTS = {
  USDC: {
    address: '0xA0b86a33E6441c8C673f4d2eb6c1c5e9eb3B9A6c', 
    decimals: 6,
    name: 'USDC'
  },
  USDT: {
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    decimals: 6, 
    name: 'USDT'
  }
};

const PLATFORM_COMMISSION = 0.12; // 12% commission rate

export class CryptoPaymentProcessor {
  constructor(providerUrl = process.env.ETHEREUM_RPC_URL) {
    this.provider = new ethers.JsonRpcProvider(providerUrl);
    this.platformWallet = process.env.PLATFORM_WALLET_ADDRESS;
    this.platformPrivateKey = process.env.PLATFORM_PRIVATE_KEY;
  }

  /**
   * Generate payment request for AI agent
   */
  async createPaymentRequest(orderId, amount, currency = 'USDC', sellerAddress) {
    const contract = CONTRACTS[currency];
    if (!contract) {
      throw new Error(`Unsupported currency: ${currency}`);
    }

    const platformFee = amount * PLATFORM_COMMISSION;
    const sellerAmount = amount - platformFee;
    
    // Convert to contract decimals
    const totalAmount = ethers.parseUnits(amount.toString(), contract.decimals);
    const platformFeeAmount = ethers.parseUnits(platformFee.toString(), contract.decimals);
    const sellerAmountWei = ethers.parseUnits(sellerAmount.toString(), contract.decimals);

    const paymentRequest = {
      orderId,
      currency,
      contractAddress: contract.address,
      totalAmount: totalAmount.toString(),
      platformFee: platformFeeAmount.toString(),
      sellerAmount: sellerAmountWei.toString(),
      platformWallet: this.platformWallet,
      sellerWallet: sellerAddress,
      instructions: {
        method: 'transfer',
        to: this.platformWallet,
        amount: totalAmount.toString(),
        data: `0x${orderId}` // Include order ID in transaction data
      }
    };

    return paymentRequest;
  }

  /**
   * Verify payment transaction
   */
  async verifyPayment(txHash, expectedAmount, currency = 'USDC') {
    try {
      const receipt = await this.provider.getTransactionReceipt(txHash);
      
      if (!receipt) {
        return { verified: false, reason: 'Transaction not found' };
      }

      if (receipt.status !== 1) {
        return { verified: false, reason: 'Transaction failed' };
      }

      // TODO: Parse transfer logs to verify amount and recipient
      // This is a simplified version - production needs full log parsing

      return {
        verified: true,
        txHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        timestamp: Date.now()
      };

    } catch (error) {
      return { 
        verified: false, 
        reason: `Verification error: ${error.message}` 
      };
    }
  }

  /**
   * Process automatic payout to seller
   */
  async processSellerPayout(sellerAddress, amount, currency = 'USDC', orderId) {
    try {
      if (!this.platformPrivateKey) {
        throw new Error('Platform private key not configured');
      }

      const contract = CONTRACTS[currency];
      const signer = new ethers.Wallet(this.platformPrivateKey, this.provider);
      
      // Create contract instance
      const tokenContract = new ethers.Contract(
        contract.address,
        [
          'function transfer(address to, uint256 amount) returns (bool)',
          'function balanceOf(address account) view returns (uint256)'
        ],
        signer
      );

      const amountWei = ethers.parseUnits(amount.toString(), contract.decimals);
      
      // Check platform balance
      const balance = await tokenContract.balanceOf(this.platformWallet);
      if (balance < amountWei) {
        throw new Error('Insufficient platform balance');
      }

      // Execute transfer
      const tx = await tokenContract.transfer(sellerAddress, amountWei);
      await tx.wait();

      return {
        success: true,
        txHash: tx.hash,
        orderId,
        amount,
        currency,
        recipient: sellerAddress,
        timestamp: Date.now()
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        orderId,
        amount,
        currency,
        recipient: sellerAddress
      };
    }
  }

  /**
   * Get payment status for order
   */
  async getPaymentStatus(orderId) {
    // TODO: Query database for payment records
    // This would integrate with Supabase to track payment status
    
    return {
      orderId,
      status: 'pending', // pending, verified, paid_out, failed
      paymentTx: null,
      payoutTx: null,
      timestamps: {
        created: Date.now(),
        paid: null,
        completed: null
      }
    };
  }

  /**
   * Generate agent-friendly payment instructions
   */
  generateAgentInstructions(paymentRequest) {
    const { currency, contractAddress, instructions } = paymentRequest;
    
    return {
      // Web3 library instructions
      web3: {
        contract: contractAddress,
        method: 'transfer',
        params: [instructions.to, instructions.amount],
        gas: 100000,
        data: instructions.data
      },
      
      // CLI command for agents with web3 tools
      cli: `web3 send --contract ${contractAddress} --method transfer --to ${instructions.to} --amount ${instructions.amount} --data ${instructions.data}`,
      
      // MetaMask deep link
      metamask: `ethereum:${contractAddress}/transfer?address=${instructions.to}&uint256=${instructions.amount}`,
      
      // Human-readable
      description: `Send ${instructions.amount} ${currency} to ${instructions.to}`,
      
      // QR code data
      qr: `ethereum:${instructions.to}@1?value=${instructions.amount}&token=${contractAddress}`
    };
  }
}

// Export utility functions
export const formatCryptoAmount = (amount, currency) => {
  const contract = CONTRACTS[currency];
  if (!contract) return `${amount} ${currency}`;
  
  const formatted = ethers.formatUnits(amount, contract.decimals);
  return `${parseFloat(formatted).toFixed(2)} ${currency}`;
};

export const validateWalletAddress = (address) => {
  try {
    return ethers.isAddress(address);
  } catch {
    return false;
  }
};