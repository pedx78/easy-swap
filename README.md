# easy-swap

## Building the project
Copy ``example.env`` to a new file called ``.env`` and edit the values in it.
```
yarn install
yarn build
```

## To start Ethereum Mainnet Fork
```
npx hardhat node
```

## To Get ERC20 tokens
```
npx hardhat swap
```
## To start BSC Fork
Change from
```
forking: {
            url: `https://mainnet.infura.io/v3/${INFURA_API_KEY}`
            //url: `https://bsc-dataseed.binance.org/`
         }
```
To
```
forking: {
            //url: `https://mainnet.infura.io/v3/${INFURA_API_KEY}`
            url: `https://bsc-dataseed.binance.org/`
         }
```
## To get BUSD tokens in Binance Smart Chain
```
npx hardhat swap-busd
```
## To go 1 year forward
```
npx hardhat timetravel
```
