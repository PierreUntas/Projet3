//// HARDHAT LOCAL NETWORK
// import { createPublicClient, http} from "viem";
// import { hardhat, sepolia } from "viem/chains";
// export const publicClient = createPublicClient({
//     chain: hardhat,
//     transport: http(),
// });

//// ALCHEMY SEPOLIA
// import {createPublicClient, http} from "viem";
// import {sepolia} from "viem/chains";
// const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL_SEPOLIA;
//
// export const publicClient = createPublicClient({
// 	chain: sepolia,
// 	transport: http(RPC_URL), // utilise la variable d'env (avec fallback)
// });


//// PERSONNAL SEPOLIA NODE
import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";

const RPC_URL = process.env.NEXT_PUBLIC_PERSONNAL_RPC_URL_SEPOLIA;

export const publicClient = createPublicClient({
	chain: sepolia,
	transport: http(RPC_URL)
});