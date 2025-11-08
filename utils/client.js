/// HARDHAT LOCAL NETWORK
// import { createPublicClient, http} from "viem";
// import { hardhat, sepolia } from "viem/chains";

// export const publicClient = createPublicClient({
//     chain: hardhat,
//     transport: http(),
// });
//////////////////////

/// ALCHEMY SEPOLIA
import {createPublicClient, http} from "viem";
import {sepolia} from "viem/chains";

// Use NEXT_PUBLIC_RPC_URL_SEPOLIA so the variable is available in the browser (Next.js will inline it at build time).
// If you run this code from a Node/server context you can keep a different variable or load dotenv there.
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL_SEPOLIA;

export const publicClient = createPublicClient({
	chain: sepolia,
	transport: http(RPC_URL), // utilise la variable d'env (avec fallback)
});
//////////////////

//// A TESTER EN LOCAL
// import { createPublicClient, http } from "viem";
// import { sepolia } from "viem/chains";
//
// export const publicClient = createPublicClient({
// 	chain: sepolia,
// 	transport: http("http://127.0.0.1:8545"),
// });
//////////////:
