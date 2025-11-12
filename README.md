# Voting DApp

This repository is a Next.js frontend for interacting with a Solidity voting smart contract (`Voting.sol`). The app uses RainbowKit and wagmi for wallet connection and transaction signing, and viem for read-only contract calls. The UI allows the owner to register voters, voters to submit proposals and cast votes, and anyone with the proper permissions to view results.
Original repository with the frontend and the backend Hardhat project: https://github.com/PierreUntas/Ethereum-Dev/tree/main/6.%20Dapp/Projet3
Link to public deployment: https://projet3-delta.vercel.app
Link to video demo: https://app.filmora.io/#/object/d4a6njau3bmubujchj9g?source=%7B%22product_id%22:%227556%22,%22product_page%22:%22share_url%22,%22product_version%22:%2214.10.5.8355%22%7D

## Quick overview

- Frontend: Next.js (app router), React components under `components/`
- Web3: wagmi / RainbowKit for wallet UX and transactions; viem for public reads
- Contract: `Voting` (Solidity, OpenZeppelin Ownable)

## Contract — technical summary

The `Voting` contract implements a sequential voting workflow.

Workflow status enum (`WorkflowStatus`):
- 0 — RegisteringVoters
- 1 — ProposalsRegistrationStarted
- 2 — ProposalsRegistrationEnded
- 3 — VotingSessionStarted
- 4 — VotingSessionEnded
- 5 — VotesTallied

Key structures and state:
- `Voter` : { isRegistered, hasVoted, votedProposalId }
- `Proposal` : { description, voteCount }
- `proposalsArray` : dynamic array of proposals
- `winningProposalID` : id of the winning proposal after `tallyVotes()` is called

Public functions and roles:
- Owner-only: `addVoter(address)`, `startProposalsRegistering()`, `endProposalsRegistering()`, `startVotingSession()`, `endVotingSession()`, `tallyVotes()`
- Registered voters: `addProposal(string)`, `setVote(uint)`
- Getters (available only to registered voters): `getVoter(address)`, `getOneProposal(uint)`

Events:
- `VoterRegistered(address voterAddress)`
- `ProposalRegistered(uint proposalId)`
- `Voted(address voter, uint proposalId)`
- `WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus)`

Constraints and validations:
- Proposal description max length: 256 characters
- Max proposals: 100
- `addProposal` and `getOneProposal` are restricted to registered voters via the `onlyVoters` modifier

Note: The contract uses custom errors (e.g. `VoterNotRegistered()`, `AlreadyVoted()`) and will revert calls to `getVoter`/`getOneProposal` if the caller is not a registered voter.

## Prerequisites

- Node.js 18+ (or a recent stable Node.js that matches the project's requirements)
- npm or pnpm
- A Web3 wallet (MetaMask, WalletConnect via RainbowKit)
- RPC access to the network where the contract is deployed (an HTTP or WSS RPC endpoint)

## Configuration

1. Create a `.env` file at the project root.

```env
NEXT_PUBLIC_RPC_URL_SEPOLIA="https://eth-sepolia.g.alchemy.com/{your-api-key}"
```

2. Confirm contract address and ABI
- Update in `constants/index.js` file `contractAddress` and `contractABI` to match with your deploy contract.

## Install & run

Install dependencies:

```bash
npm install
# or
# pnpm install
```

Run development server:

```bash
npm run dev
# Then open http://localhost:3000
```

Build for production:

```bash
npm run build
npm run start
```

## Usage (common flows)

1. Connect a wallet via the UI (RainbowKit). The app distinguishes the contract owner and registered voters.

2. Owner flow:
- During `RegisteringVoters` (status 0) the owner calls `addVoter` to register voter addresses.
- The owner starts proposal registration with `startProposalsRegistering()`.
- When finished, the owner calls `endProposalsRegistering()` and then `startVotingSession()` to open voting.
- After voting ends, the owner calls `endVotingSession()` and finally `tallyVotes()` to compute the winning proposal.

3. Voter flow:
- After being registered (check `VoterRegistered` events), a voter can:
  - submit a proposal with `addProposal` during `ProposalsRegistrationStarted` (status 1)
  - cast a vote with `setVote` during `VotingSessionStarted` (status 3)
  - read `getOneProposal(id)` and `getVoter(address)` only if the caller is a registered voter

4. Events and read operations:
- The frontend listens to logs/events (`VoterRegistered`, `ProposalRegistered`, `Voted`, `WorkflowStatusChange`) to display current state and history.
- Important: `getOneProposal` and `getVoter` revert when called by non-registered addresses — use events if you need more data visible to every users.

## Key frontend files / components

- `components/shared/Voting.jsx` — main component that displays workflow status and actions (register, propose, vote, etc.)
- `components/shared/AddVoter.jsx` — UI for the owner to add voter addresses
- `components/shared/AddProposal.jsx` — UI for voters to submit proposals
- `components/shared/SetVote.jsx` — UI for casting votes
- `utils/client.js` — configuration of the public client (viem)
- `constants/index.js` — expected location for contract address and ABI used by the frontend

## Troubleshooting

- `getVoter` / `getOneProposal` revert: verify that the address you use has been registered (check `VoterRegistered` event logs first).
- Transactions failing: ensure your wallet is connected to the correct network matching `NEXT_PUBLIC_RPC_URL` and the contract deployment chain.
- Owner-only failures: some actions can only be executed by the contract owner. Confirm owner address used during deployment.
- `addProposal` can revert if the description exceeds 256 characters or if the contract already has 100 proposals.

## Tests

- For the smart contract: write unit tests with Hardhat or Foundry. Cover registration, proposal submission, voting and tallying, and edge cases (limits, invalid calls).
- For the frontend: add unit/integration tests and mock wallet interactions for critical flows.

## Contribution

Contributions are welcome. Please open an issue to discuss new features or bug fixes. For PRs, follow the existing code style (React + Tailwind + functional components) and include tests for any critical logic changes.

## License

MIT

---
