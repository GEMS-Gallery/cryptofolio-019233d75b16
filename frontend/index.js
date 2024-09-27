import { backend } from 'declarations/backend';

const connectWalletBtn = document.getElementById('connectWallet');
const disconnectWalletBtn = document.getElementById('disconnectWallet');
const refreshPortfolioBtn = document.getElementById('refreshPortfolio');
const walletInfoDiv = document.getElementById('walletInfo');
const portfolioDiv = document.getElementById('portfolio');
const addressSpan = document.getElementById('address');
const tokenTableBody = document.querySelector('#tokenTable tbody');
const totalValueSpan = document.getElementById('totalValue');

let web3;
let selectedAccount;

async function connectWallet() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            web3 = new Web3(window.ethereum);
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            selectedAccount = accounts[0];
            addressSpan.textContent = selectedAccount;
            walletInfoDiv.style.display = 'block';
            portfolioDiv.style.display = 'block';
            refreshPortfolioBtn.style.display = 'block';
            connectWalletBtn.style.display = 'none';
            await fetchPortfolio();
        } catch (error) {
            console.error('Failed to connect wallet:', error);
            alert('Failed to connect wallet. Please try again.');
        }
    } else {
        alert('MetaMask is not installed. Please install it to use this dApp.');
    }
}

function disconnectWallet() {
    selectedAccount = null;
    walletInfoDiv.style.display = 'none';
    portfolioDiv.style.display = 'none';
    refreshPortfolioBtn.style.display = 'none';
    connectWalletBtn.style.display = 'block';
    tokenTableBody.innerHTML = '';
    totalValueSpan.textContent = '0.00';
}

async function fetchPortfolio() {
    try {
        const tokens = await backend.getTokens();
        tokenTableBody.innerHTML = '';
        let totalValue = 0;

        for (const [symbol, info] of tokens) {
            const row = tokenTableBody.insertRow();
            row.insertCell(0).textContent = info.name;
            row.insertCell(1).textContent = symbol;
            row.insertCell(2).textContent = info.balance.toFixed(4);
            row.insertCell(3).textContent = `$${info.price.toFixed(2)}`;
            const value = info.balance * info.price;
            row.insertCell(4).textContent = `$${value.toFixed(2)}`;
            totalValue += value;
        }

        totalValueSpan.textContent = totalValue.toFixed(2);
    } catch (error) {
        console.error('Failed to fetch portfolio:', error);
        alert('Failed to fetch portfolio. Please try again.');
    }
}

async function updateTokenPrices() {
    try {
        const tokens = await backend.getTokens();
        for (const [symbol, info] of tokens) {
            const price = await fetchTokenPrice(symbol);
            await backend.updateTokenInfo(symbol, info.name, info.balance, price);
        }
        await fetchPortfolio();
    } catch (error) {
        console.error('Failed to update token prices:', error);
        alert('Failed to update token prices. Please try again.');
    }
}

async function fetchTokenPrice(symbol) {
    // This is a placeholder. In a real application, you would fetch the price from a cryptocurrency API
    // For example, you might use the CoinGecko API: https://api.coingecko.com/api/v3/simple/price?ids=${symbol}&vs_currencies=usd
    return Math.random() * 1000; // Returns a random price between 0 and 1000
}

connectWalletBtn.addEventListener('click', connectWallet);
disconnectWalletBtn.addEventListener('click', disconnectWallet);
refreshPortfolioBtn.addEventListener('click', updateTokenPrices);

// Set up event listener for account changes
if (typeof window.ethereum !== 'undefined') {
    window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
            disconnectWallet();
        } else {
            selectedAccount = accounts[0];
            addressSpan.textContent = selectedAccount;
            fetchPortfolio();
        }
    });
}

// Fetch token prices every 60 seconds
setInterval(updateTokenPrices, 60000);
