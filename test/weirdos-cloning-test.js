const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber } = require('ethers');
const keccak256 = require("keccak256");
const { MerkleTree } = require("merkletreejs");


describe("WeirdosCloning Contract", function () {


    let baseURI = "ipfs://TODO/";
    let contractURI = "ipfs://QmNp32deSmnAm27KExDXe1Lhq9BZjKYC4ueMbG9NA98jXu";
    let apeCoin;
    let theWeirdos;
    let merkleTree;
    let globalMerkleLeaves;
    let globalMerkleRoot;
    let whiteListers;
    let mintPriceEth = ethers.utils.parseEther("0.1");
    let mintPriceApe = ethers.utils.parseEther("1");

    it('Deploy Contracts',async function () {
        [owner, bankAddress, wl1,wl2,wl3, ...addrs] = await ethers.getSigners();

        const ApeCoin = await ethers.getContractFactory("ApeCoin");
        apeCoin = await ApeCoin.deploy("ApeCoin", "APE", "1000000000000000000000000000");

        const WeirdosCloning = await ethers.getContractFactory("WeirdosCloning");
        theWeirdos = await WeirdosCloning.deploy(baseURI, apeCoin.address);
    });

    const generateLeaf = (key, object) => {
        return Buffer.from(
            ethers.utils
                .solidityKeccak256(["address", "string"], [object.address.address, object.allowance])
                .slice(2),
            "hex"
        );
    };

    const getUserProof = (toSearch) => {
        var indexOfSearch = null;
        for (var i = 0; i < whiteListers.length; i++) {
            if (whiteListers[i].address.address.indexOf(toSearch) != -1) {
                indexOfSearch = i;
            }
        }
        return merkleTree.getHexProof(globalMerkleLeaves[indexOfSearch]);
    };

    const generateLeafForPublic = (key, object) => {
        return Buffer.from(
            ethers.utils
                .solidityKeccak256(["string", "string"], [object.antiBotPhrase, object.antiBotPhraseAllowance])
                .slice(2),
            "hex"
        );
    };

    const getPublicUserProof = (toSearch) => {
        var indexOfSearch = null;
        for (var i = 0; i < whiteListers.length; i++) {
            if (whiteListers[i].antiBotPhrase.indexOf(toSearch) != -1) {
                indexOfSearch = i;
            }
        }
        return merkleTree.getHexProof(globalMerkleLeaves[indexOfSearch]);
    };


    it("setBaseURI", async function () {
        await theWeirdos.setBaseURI(baseURI)
        expect(await theWeirdos.baseURI()).to.equal(baseURI)
    });

    it("setcontractURI", async function () {
        await theWeirdos.setcontractURI(contractURI);
        expect(await theWeirdos.contractURI()).to.equal(contractURI)
    });

    it("getContractURI", async function () {
        expect(await theWeirdos.getContractURI()).to.equal(contractURI);
    });

    it("setBankAddress", async function () {
        await theWeirdos.setBankAddress(bankAddress.address)
        expect(await theWeirdos.bankAddress()).to.equal(bankAddress.address);
    });

    it("setTokenEthPrice", async function () {
        await theWeirdos.setTokenEthPrice(mintPriceEth)
        expect(await theWeirdos.mintPriceEth()).to.equal(mintPriceEth);
    });

    it("setTokenApePrice", async function () {
        await theWeirdos.setTokenApePrice(mintPriceApe);
        expect(await theWeirdos.mintPriceApe()).to.equal(mintPriceApe);
    });

    it("Merkle Tree", async function () {
        whiteListers = [
            { 'address': wl1, 'allowance': "1" }
        ];
        globalMerkleLeaves = Object.entries(whiteListers).map((whiteLister) => generateLeaf(...whiteLister));
        merkleTree = new MerkleTree(globalMerkleLeaves, keccak256, { sortPairs: true });
        globalMerkleRoot = merkleTree.getHexRoot();

    });

    it("Adding $APE tokens to wallet", async function () {
        const ownerBalance = await apeCoin.balanceOf(owner.address);
        expect(await apeCoin.totalSupply()).to.equal(ownerBalance);
    });

    it("setFreeClaimlistMerkleRoot", async function () {
        await theWeirdos.setFreeClaimlistMerkleRoot(globalMerkleRoot);
        expect(await theWeirdos.claimMerkleRoot()).to.equal(globalMerkleRoot);
    });
    it("setCreamlistMerkleRoot", async function () {
        await theWeirdos.setCreamlistMerkleRoot(globalMerkleRoot);
        expect(await theWeirdos.creamlistMerkleRoot()).to.equal(globalMerkleRoot);
    });

    it("setPublicSalelistMerkleRoot", async function () {
        await theWeirdos.setPublicSalelistMerkleRoot(globalMerkleRoot);
        expect(await theWeirdos.publicMerkleRoot()).to.equal(globalMerkleRoot);
    });

    it("setClaim", async function () {
        expect(await theWeirdos.claimActive()).to.equal(false);
        await theWeirdos.setClaim(true)
        expect(await theWeirdos.claimActive()).to.equal(true);
    });

    it("setCreamlist", async function () {
        expect(await theWeirdos.creamlistActive()).to.equal(false);
        await theWeirdos.setCreamlist(true)
        expect(await theWeirdos.creamlistActive()).to.equal(true);
    });

    it("setPublic", async function () {
        expect(await theWeirdos.publicActive()).to.equal(false);
        await theWeirdos.setPublic(true)
        expect(await theWeirdos.publicActive()).to.equal(true);
    });

    it("Free claim", async function () {

        whiteListers = [
            { 'address': wl1, 'allowance': "1" }
        ];
        globalMerkleLeaves = Object.entries(whiteListers).map((whiteLister) => generateLeaf(...whiteLister));
        merkleTree = new MerkleTree(globalMerkleLeaves, keccak256, { sortPairs: true });
        globalMerkleRoot = merkleTree.getHexRoot();

        await theWeirdos.setFreeClaimlistMerkleRoot(globalMerkleRoot);

        for (let index = 0; index < whiteListers.length; index++) {
            for (let count = 1; count <= parseInt(whiteListers[index].allowance); count++) {
                // console.log('      FREE MINT: ',count,whiteListers[index].address.address,parseInt(whiteListers[index].allowance))
                await theWeirdos
                    .connect(whiteListers[index].address)
                    .claimMint(1, parseInt(whiteListers[index].allowance), getUserProof(whiteListers[index].address.address))
            }
        }
    });

    it("Cream list claim ETH", async function () {

        whiteListers = [
            { 'address': wl2, 'allowance': "2" }
        ];
        globalMerkleLeaves = Object.entries(whiteListers).map((whiteLister) => generateLeaf(...whiteLister));
        merkleTree = new MerkleTree(globalMerkleLeaves, keccak256, { sortPairs: true });
        globalMerkleRoot = merkleTree.getHexRoot();

        await theWeirdos.setCreamlistMerkleRoot(globalMerkleRoot);
        let mintPriceEth = await theWeirdos.mintPriceEth();

        for (let index = 0; index < whiteListers.length; index++) {
            for (let count = 1; count <= parseInt(whiteListers[index].allowance); count++) {
                // console.log('      CREAM MINT: ',count,whiteListers[index].address.address,parseInt(whiteListers[index].allowance))

                await theWeirdos
                    .connect(whiteListers[index].address)
                    .creamMintETH(1, parseInt(whiteListers[index].allowance), getUserProof(whiteListers[index].address.address), {
                        from: whiteListers[index].address.address,
                        value: mintPriceEth.toString()
                    })
            }
        }
    });

    it("Cream list claim APE", async function () {

        whiteListers = [
            { 'address': wl3, 'allowance': "3" }
        ];
        globalMerkleLeaves = Object.entries(whiteListers).map((whiteLister) => generateLeaf(...whiteLister));
        merkleTree = new MerkleTree(globalMerkleLeaves, keccak256, { sortPairs: true });
        globalMerkleRoot = merkleTree.getHexRoot();

        await theWeirdos.setCreamlistMerkleRoot(globalMerkleRoot);
        let priceAPE = await theWeirdos.mintPriceApe();

        for (let index = 0; index < whiteListers.length; index++) {
            for (let count = 1; count <= parseInt(whiteListers[index].allowance); count++) {
                await apeCoin.connect(owner).transfer(whiteListers[index].address.address, priceAPE.toString())
                // console.log('      CREAM MINT: ',count,whiteListers[index].address.address,parseInt(whiteListers[index].allowance))

                await apeCoin.connect(whiteListers[index].address).approve(theWeirdos.address, priceAPE.toString())

                await theWeirdos
                    .connect(whiteListers[index].address)
                    .creamMintAPE(1, parseInt(whiteListers[index].allowance), getUserProof(whiteListers[index].address.address))
            }
        }
        
    });

    it("Public claim ETH", async function () {
        

        let mintPriceEth = await theWeirdos.mintPriceEth();
        /*RESETTING THE TREE FOR PUBLIC*/
        whiteListers = [
            { 'antiBotPhrase': 'SOME_PASSWORD', 'antiBotPhraseAllowance': "4" },
        ];
        globalMerkleLeaves = Object.entries(whiteListers).map((whiteLister) => generateLeafForPublic(...whiteLister));
        merkleTree = new MerkleTree(globalMerkleLeaves, keccak256, { sortPairs: true });
        globalMerkleRoot = merkleTree.getHexRoot();

        await theWeirdos.setPublicSalelistMerkleRoot(globalMerkleRoot);

        for (let index = 0; index < whiteListers.length; index++) {
            for (let count = 1; count <= parseInt(whiteListers[index].antiBotPhraseAllowance); count++) {
                // console.log('      PUBLIC MINT WITH ETH: ',count,wl1.address,parseInt(whiteListers[index].antiBotPhraseAllowance))

                await theWeirdos
                    .connect(wl1)
                    .publicMintEth(1, getPublicUserProof(whiteListers[index].antiBotPhrase), whiteListers[index].antiBotPhrase, whiteListers[index].antiBotPhraseAllowance, {
                        from: wl1.address,
                        value: mintPriceEth.toString()
                    })
            }
        }
    });

    it("Public claim APE", async function () {

        let priceAPE = await theWeirdos.mintPriceApe();
        /*RESETTING THE TREE FOR PUBLIC*/
        whiteListers = [
            { 'antiBotPhrase': 'SOME_PASSWORD', 'antiBotPhraseAllowance': "5" }
        ];
        globalMerkleLeaves = Object.entries(whiteListers).map((whiteLister) => generateLeafForPublic(...whiteLister));
        merkleTree = new MerkleTree(globalMerkleLeaves, keccak256, { sortPairs: true });
        globalMerkleRoot = merkleTree.getHexRoot();

        await theWeirdos.setPublicSalelistMerkleRoot(globalMerkleRoot);

        for (let index = 0; index < whiteListers.length; index++) {
            for (let count = 1; count <= parseInt(whiteListers[index].antiBotPhraseAllowance); count++) {
                await apeCoin.connect(owner).transfer(wl2.address, priceAPE.toString())
                // console.log('      PUBLIC MINT WITH $APE: ',count,wl2.address,parseInt(whiteListers[index].antiBotPhraseAllowance))

                await apeCoin.connect(wl2).approve(theWeirdos.address, priceAPE.toString())

                await theWeirdos
                    .connect(wl2)
                    .publicMintApe(1, getPublicUserProof(whiteListers[index].antiBotPhrase), whiteListers[index].antiBotPhrase, whiteListers[index].antiBotPhraseAllowance)
            }
        }

    });

    it("Total Supply", async function () {
        let totalSupply = await theWeirdos.totalSupply();
        // console.log('      TOTAL SUPPLY: ',totalSupply.toString())
    });

    it("Withdraw funds to bank", async function () {

        var expectedBalanceEth = await ethers.provider.getBalance(theWeirdos.address);
        var expectedBalanceApe = await apeCoin.balanceOf(theWeirdos.address);
        
        expect(await ethers.provider.getBalance(bankAddress.address)).to.equal(ethers.utils.parseEther("10000"));
		expect(await apeCoin.balanceOf(bankAddress.address)).to.equal(0);

        await theWeirdos.connect(owner).withdraw();
        await theWeirdos.connect(owner).withdrawAPE();

        expectedBalanceEth = await ethers.provider.getBalance(bankAddress.address);
        expectedBalanceApe = await apeCoin.balanceOf(bankAddress.address);     

        expect(await ethers.provider.getBalance(bankAddress.address)).to.equal(expectedBalanceEth);
		expect(await apeCoin.balanceOf(bankAddress.address)).to.equal(expectedBalanceApe);
    });    

    it('deploy the smart contract and reverts', async () => {

        // await expect()
        // .to.be.revertedWith('Num should be bigger than 5');

        // await expect(theWeirdos.myFunction(BigNumber.from('6')).to.be.rejectedWith("VM Exception while processing transaction: reverted with reason string ");

    });

    


});
