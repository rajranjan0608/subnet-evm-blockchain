const axios = require('axios').default;
const args = require('yargs').argv;
const SubnetAuth = require('avalanche').platformvm.SubnetAuth

const genesisJSON = require('./genesis.json');
const { protocol, ip, port } = require('./config.js');
const { platform, pKeyChain, pAddressStrings, bintools, utxoSet } = require('./importDetails');

// Creating blockchain with the subnetID, chain name and vmID (CB58 encoded VM name)
async function createBlockchain() {
    const { subnetID, chainName } = args;

    // Generating vmID if vmName is provied, else assigning args.vmID 
    const vmID = typeof args.vmID !== "undefined" ? args.vmID : get32ByteCB58(args.vmName);

    // Returning error if both vmID and vmName is passed but doesn't represent same thing
    if (typeof args.vmName != "undefined" && typeof args.vmID != "undefined") {
        if (args.vmID != get32ByteCB58(args.vmName)) {
            console.log("Error: vmID and vmName passed doesn't represent same thing!");
            return;
        }
    }

    // Getting CB58 encoded bytes of genesis
    const [genesisBytes, remarks, err] = await buildSbunetVMGenesis(vmID);

    if (!err) {
        // Creating subnet auth
        const addressIndex = Buffer.alloc(4);
        addressIndex.writeUIntBE(0x0, 0, 4);
        const subnetAuth = new SubnetAuth([addressIndex]);

        // Creating unsgined tx
        const unsignedTx = await platform.buildCreateChainTx(
            await utxoSet(),
            pAddressStrings,
            pAddressStrings,
            subnetID,
            chainName,
            vmID,
            [],
            genesisBytes,
            subnetAuth
        );

        // signing unsgined tx with pKeyChain
        const tx = unsignedTx.sign(pKeyChain);

        // issuing tx
        const txId = await platform.issueTx(tx);
        console.log("Create chain transaction ID: ", txId);
    } else {
        console.log(remarks);
    }
}

// Returns zero-extended in a 32 byte array and encoded in CB58 from a string
function get32ByteCB58(str) {
    const strBuffer = Buffer.from(str);

    if (strBuffer.length > 32) {
        console.log("Error:String size cannot be more than 32 bytes!");
        return;
    }

    const extendedBuffer = Buffer.alloc(32 - strBuffer.length);
    const finalBuffer = Buffer.concat([strBuffer, extendedBuffer]);
    return bintools.cb58Encode(finalBuffer);
}

// Building chain's genesis using VM's static method
async function buildSbunetVMGenesis(vmID) {
    // subnet vm's static RPC url
    const buildGenesisURL = `${protocol}://${ip}:${port}/ext/vm/${vmID}/rpc`;

    try {
        // Making RPC request to VM's static method to build genesis bytes
        const response = await axios.post(buildGenesisURL, {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "subnetevm.buildGenesis",
            "params": {
                "genesisData": genesisJSON
            }
        });

        return [response.data.result.genesisBytes, "Successful", false];
    } catch (err) {
        return [null, "Error building genesis byte code!", true];
    }
}

createBlockchain();