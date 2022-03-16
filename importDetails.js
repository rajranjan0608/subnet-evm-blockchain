const { Avalanche, BinTools } = require("avalanche")

const { ip, port, protocol, networkID, privKey } = require('./config.js')

const bintools = BinTools.getInstance();

const avalanche = new Avalanche(ip, port, protocol, networkID)

const platform = avalanche.PChain()
const info = avalanche.Info();

const pKeyChain = platform.keyChain()
pKeyChain.importKey(privKey)
const pAddressStrings = pKeyChain.getAddressStrings()

const utxoSet = async () => {
	const platformUTXOs = await platform.getUTXOs(pAddressStrings)
	return platformUTXOs.utxos
}

module.exports = {
	platform,
	info,
	pKeyChain,
	pAddressStrings,
	bintools,
	utxoSet
}
