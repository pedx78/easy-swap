import {config as dotEnvConfig} from "dotenv";
import {HardhatUserConfig} from "hardhat/types";
import "@nomiclabs/hardhat-waffle";
import "hardhat-typechain";
import {constants, utils} from "ethers";

import {task} from "hardhat/config";
import {ethers} from "hardhat";

dotEnvConfig();

const INFURA_API_KEY = process.env.INFURA_API_KEY || "";
const MAINNET_PRIVATE_KEY = process.env.MAINNET_PRIVATE_KEY || "";
const MAINNET_PRIVATE_KEY_2 = process.env.MAINNET_PRIVATE_KEY_2 || "";

task("swap", "Fill portfolio using UNISWAP V2 from ETH")
    .setAction(async (taskArgs, {ethers}) => {
        const signers = await ethers.getSigners();
        const receiver = await signers[0].getAddress();
        console.log(`Address of the receiver ${receiver}`);
        const uniswapRouterAddr = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
        //@ts-ignore
        const {IUniswapV2RouterFactory} = await import("./typechain/IUniswapV2RouterFactory");
        const pancakeRouter = IUniswapV2RouterFactory.connect(uniswapRouterAddr, signers[0]);
        // @ts-ignore
        const {Ierc20Factory} = await import("./typechain/Ierc20Factory");

        const usdtAddr = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
        const usdt = Ierc20Factory.connect(usdtAddr, signers[0]);

        const daiAddr = "0x6b175474e89094c44da98b954eedeac495271d0f";
        const dai = Ierc20Factory.connect(daiAddr, signers[0]);

        const usdcAddr = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
        const usdc = Ierc20Factory.connect(usdcAddr, signers[0]);

        const pbtcAddr = "0x5228a22e72ccc52d415ecfd199f99d0665e7733b";
        const pbtc = Ierc20Factory.connect(pbtcAddr, signers[0]);

        const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
        const val = constants.WeiPerEther;
        const pbtcVal = constants.WeiPerEther.mul(25);
        const deadline = 1646874353;

        console.log(`Performing swap USDT, USDC, DAI, pBTC...`);

        const usdtPath = [WETH, usdtAddr];
        const usdcPath = [WETH, usdcAddr];
        const daiPath = [WETH, daiAddr];
        const pbtcPath = [WETH, pbtcAddr];

        await pancakeRouter.swapExactETHForTokens(0, usdtPath, receiver, deadline, {value: val});
        await pancakeRouter.swapExactETHForTokens(0, usdcPath, receiver, deadline, {value: val});
        await pancakeRouter.swapExactETHForTokens(0, daiPath, receiver, deadline, {value: val});
        await pancakeRouter.swapExactETHForTokens(0, pbtcPath, receiver, deadline, {value: pbtcVal});

        const usdtBalance = await usdt.balanceOf(receiver);
        console.log(`USDT balance: ${utils.formatUnits(usdtBalance, 6)} USDT`);

        const usdcBalance = await usdc.balanceOf(receiver);
        console.log(`USDC balance: ${utils.formatUnits(usdcBalance, 6)} USDC`);

        const daiBalance = await dai.balanceOf(receiver);
        console.log(`DAI balance: ${utils.formatUnits(daiBalance, 18)} DAI`);

        const pbtcBalance = await pbtc.balanceOf(receiver);
        console.log(`pBTC balance: ${utils.formatUnits(pbtcBalance, 18)} pBTC`);

        const ethBalance = await ethers.provider.getBalance(receiver);
        console.log(`ETH balance: ${ethers.utils.formatEther(ethBalance)} ETH`);
});

task("swap-busd", "Get BUSD")
    .setAction(async (taskArgs, {ethers}) => {
        const signers = await ethers.getSigners();
        const receiver = await signers[0].getAddress();
        console.log(`Address of the receiver ${receiver}`);
        const pancakeRouterAddr = "0x05fF2B0DB69458A0750badebc4f9e13aDd608C7F";
        const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
        const busdAddr = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56";
        //@ts-ignore
        const {IPancakeRouterFactory} = await import("./typechain/IPancakeRouterFactory");
        // @ts-ignore
        const {Ierc20Factory} = await import("./typechain/Ierc20Factory");
        const pancakeRouter = IPancakeRouterFactory.connect(pancakeRouterAddr, signers[0]);
        const busd = Ierc20Factory.connect(busdAddr, signers[0]);
        const deadline = 1646874353;

        console.log(`Performing swap BUSD...`);

        const path = [WBNB, busdAddr];
        const val = constants.WeiPerEther.mul(10);
        await pancakeRouter.swapExactETHForTokens(0, path, receiver, deadline, {value: val});

        const busdBalance = await busd.balanceOf(receiver);
        console.log(`BUSD balance: ${utils.formatUnits(busdBalance, 18)} BUSD`);

        const bnbBalance = await ethers.provider.getBalance(receiver);
        console.log(`BNB balance: ${ethers.utils.formatEther(bnbBalance)} BNB`);
});

task("timetravel", "Time travel")
    .setAction(async (taskArgs, {ethers}) => {
        const ONE_DAY = 86400;
        const DAYS = 30;
        const MONTHS = 12;
        const seconds = ONE_DAY * DAYS * MONTHS ;
        await ethers.provider.send('evm_increaseTime', [seconds]);
        await ethers.provider.send('evm_mine', []);
});

const config: HardhatUserConfig = {
    defaultNetwork: "local",
    solidity: {
        compilers: [
             {
                     version: "0.6.6",
                     settings: {
                             optimizer: {
                                     enabled: true,
                                     runs: 200
                             }
                     }
             }
       ]
    },
    paths: {
        sources: "./contracts",
        tests: "./test",
        cache: "./cache",
        artifacts: "./artifacts"
    },
    networks: {
        hardhat: {
            forking: {
                url: `https://mainnet.infura.io/v3/${INFURA_API_KEY}`
                //url: `https://bsc-dataseed.binance.org/`
            },
            gasPrice: 0,
            accounts: [
                {
                    privateKey: MAINNET_PRIVATE_KEY, balance: "10000000000000000000000",
                },
                {
                    privateKey: MAINNET_PRIVATE_KEY_2, balance: "10000000000000000000000",
                }
            ]
        },
        local: {
            url: "http://127.0.0.1:8545",
            accounts: [MAINNET_PRIVATE_KEY, MAINNET_PRIVATE_KEY_2],
            gas: 4000000,
            timeout: 100000
        }
    },
};

export default config;
