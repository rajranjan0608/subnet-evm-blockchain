require('dotenv').config();

module.exports = {
	protocol: "http",
	ip: "0.0.0.0",
	port: 14760,
	networkID: 1337,
	privKey: process.env.PRIVATEKEY
}
