const { platform, pKeyChain, pAddressStrings, utxoSet } = require('./importDetails.js');

async function createSubnet() {
	// Creating unsgined tx
	const unsignedTx = await platform.buildCreateSubnetTx(
		await utxoSet(),
		pAddressStrings,
		pAddressStrings,
		pAddressStrings
	);

	// signing unsgined tx with pKeyChain
	const tx = unsignedTx.sign(pKeyChain);

	// issuing tx
	const txId = await platform.issueTx(tx);
	console.log("Tx ID: ", txId);
}

createSubnet();
