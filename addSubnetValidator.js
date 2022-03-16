const args = require('yargs').argv;
const SubnetAuth = require('avalanche').platformvm.SubnetAuth
const { platform, info, pKeyChain, pAddressStrings, utxoSet } = require('./importDetails.js');

// --startTime $(date -v +5M +%s) --endTime $(date -v +14d +%s)

async function addSubnetValidator() {
    let {
        nodeID = await info.getNodeID(),
        startTime,
        endTime,
        weight = 20,
        subnetID
    } = args;

    // Creating subnet auth
    const addressIndex = Buffer.alloc(4);
    addressIndex.writeUIntBE(0x0, 0, 4);
    const subnetAuth = new SubnetAuth([addressIndex]);

    // Creating unsgined tx
    const unsignedTx = await platform.buildCreateSubnetTx(
		await utxoSet(),
		pAddressStrings,
		pAddressStrings,
		nodeID,
        startTime,
        endTime,
        weight,
        subnetID,
        subnetAuth
	);

    // signing unsgined tx with pKeyChain
	const tx = unsignedTx.sign(pKeyChain);

    // issuing tx
	const txId = await platform.issueTx(tx);
	console.log("Tx ID: ", txId);
}

addSubnetValidator();