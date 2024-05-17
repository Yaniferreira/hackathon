document.addEventListener("DOMContentLoaded", () => {
    const contractAddress = '0xddaAd340b0f1Ef65169Ae5E41A8b10776a75482d';
    const contractABI = [
        {
            "inputs": [
                { "internalType": "uint256", "name": "_nonce", "type": "uint256" },
                { "internalType": "bytes", "name": "_signature", "type": "bytes" }
            ],
            "name": "login",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "register",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "anonymous": false,
            "inputs": [
                { "indexed": false, "internalType": "address", "name": "user", "type": "address" },
                { "indexed": false, "internalType": "uint256", "name": "nonce", "type": "uint256" }
            ],
            "name": "UserLoggedIn",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                { "indexed": false, "internalType": "address", "name": "user", "type": "address" }
            ],
            "name": "UserRegistered",
            "type": "event"
        },
        {
            "inputs": [],
            "name": "getNonce",
            "outputs": [
                { "internalType": "uint256", "name": "", "type": "uint256" }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ];

    let provider;
    let signer;
    let contract;

    document.getElementById('connectWallet').onclick = async () => {
        try {
            if (!window.ethereum) {
                alert('MetaMask no está instalado!');
                return;
            }
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            provider = new ethers.providers.Web3Provider(window.ethereum);
            signer = provider.getSigner();
            contract = new ethers.Contract(contractAddress, contractABI, signer);

            document.getElementById('status').innerText = 'Billetera conectada';
            document.getElementById('login').disabled = false;
        } catch (error) {
            console.error(error);
            document.getElementById('status').innerText = 'Error al conectar la billetera: ' + error.message;
        }
    };

    document.getElementById('login').onclick = async () => {
        try {
            const userAddress = await signer.getAddress();
            const nonce = await contract.getNonce();

            const message = ethers.utils.solidityKeccak256(["address", "uint256"], [userAddress, nonce]);
            const messageHashBytes = ethers.utils.arrayify(message);
            const signature = await signer.signMessage(messageHashBytes);

			await contract.login(nonce, signature);
			document.getElementById('status').innerText = 'Inicio de sesión exitoso';
			const reverseClaimerAddress = 'tu_dirección_del_contrato_ReverseClaimer';
			const reverseClaimerContract = new ethers.Contract(reverseClaimerAddress, reverseClaimerABI, signer);
			await reverseClaimerContract.claim(userAddress);
		} catch (error) {
			console.error(error);
			document.getElementById('status').innerText = 'Error en el inicio de sesión: ' + error.message;
		}
	};
});
