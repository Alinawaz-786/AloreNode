const { ethers } = require('hardhat')
const hre = require("hardhat");
// const   BigNumber = require('big-number');

async function main() {

    const hex_router = await hre.ethers.getContractFactory("Comptroller");
    const hex_router_deploy = await hex_router.deploy();
    console.log("Demo Erc20 deployed to:", hex_router_deploy.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });