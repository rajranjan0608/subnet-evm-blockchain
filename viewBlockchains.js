const { platform } = require('./importDetails');

const viewBlockchains = async () => {const args = process.argv.slice(2);
    const subnetID = args[0];
    const vmID = args[1];
    const chainName = args[2];

    const blockchains = await platform.getBlockchains();
    console.log(res);
}

viewBlockchains();