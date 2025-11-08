"use client";
import {useState, useEffect, use} from "react";
import {Input} from "@/components/ui/input";
import {Button as Button} from "@/components/ui/button";
import {Card, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import AddVoter from "@/components/shared/AddVoter";
import AddProposal from "@/components/shared/AddProposal";
import SetVote from "@/components/shared/SetVote";

import {
	Alert,
	AlertDescription,
	AlertTitle,
} from "@/components/ui/alert"

import {AlertCircleIcon, CheckCircle2Icon, PopcornIcon} from "lucide-react";
import {contractAddress, contractABI} from "@/constants";
import {WORKFLOW_LABELS} from "@/constants/workflow";

import {useWriteContract, useAccount, useWaitForTransactionReceipt} from "wagmi";
import {useReadContract, parseAbiItem} from "viem";

import {publicClient} from "@/utils/client";
import {readContract} from "viem/actions";

const Voting = () => {
	const {address} = useAccount();
	const [mounted, setMounted] = useState(false);
	const [workflowStatus, setWorkflowStatus] = useState(null);
	const [events, setEvents] = useState([]);
	const [winningProposalID, setWinningProposalID] = useState(0);
	const [winningProposal, setWinningProposal] = useState(null);
	const [voterRegisteredEvents, setVoterRegisteredEvents] = useState([]);
	const [proposalRegisteredEvents, setProposalRegisteredEvents] = useState([]);
	const [votedEvents, setVotedEvents] = useState([]);
	const [proposalsDetails, setProposalsDetails] = useState([]);
	const [isOwner, setIsOwner] = useState(false);
	const [isRegisteredVoter, setIsRegisteredVoter] = useState(false);
	const [voter, setVoter] = useState(null);

	const fromBlock = '0x' + Number(9582150).toString(16);
	const toBlock = 'latest';

	const {data: hash, error, isPending: setWorkflowIsPending, writeContract} = useWriteContract({});

	const {isLoading: isConfirming, isSuccess, error: errorConfirmation} = useWaitForTransactionReceipt({
		hash,
	});

	const startProposalsRegistering = async () => {
		writeContract({
			address: contractAddress,
			abi: contractABI,
			functionName: 'startProposalsRegistering',
			args: [],
		});
	}

	const endProposalsRegistering = async () => {
		writeContract({
			address: contractAddress,
			abi: contractABI,
			functionName: 'endProposalsRegistering',
			args: [],
		});
	}

	const startVotingSession = async () => {
		writeContract({
			address: contractAddress,
			abi: contractABI,
			functionName: 'startVotingSession',
			args: [],
		});
	}

	const endVotingSession = async () => {
		writeContract({
			address: contractAddress,
			abi: contractABI,
			functionName: 'endVotingSession',
			args: [],
		});
	}

	const tallyVotes = async () => {
		writeContract({
			address: contractAddress,
			abi: contractABI,
			functionName: 'tallyVotes',
			args: [],
		});
	}

	const getStatusVoting = async () => {
		return await readContract(publicClient, {
			address: contractAddress,
			abi: contractABI,
			functionName: 'workflowStatus',
			args: [],
		});
	}

	const getOwner = async () => {
		return await readContract(publicClient, {
			address: contractAddress,
			abi: contractABI,
			functionName: 'owner',
			args: [],
		});
	}

	const getVoter = async () => {
		if (!address) return null;

		try {
			const voterData = await readContract(publicClient, {
				address: contractAddress,
				abi: contractABI,
				functionName: 'getVoter',
				args: [address],
				account: address,
			});
			return voterData;
		} catch (err) {
			// Si revert → pas un votant enregistré
			console.warn("getVoter revert detected (non-voter):", err);
			return null;
		}
	};


	const isRegistered = async () => {
		return await voterRegisteredEvents.some(ev => ev.voterAddress?.toLowerCase() === address.toLowerCase());
	}

	const getWinningProposalID = async () => {
		return await readContract(publicClient, {
			address: contractAddress,
			abi: contractABI,
			functionName: 'winningProposalID',
			args: [],
		})
	}

	const getProposalByID = async (proposalID) => {
		if (!address) {
			console.warn('getProposalByID: pas d\'adresse connectée');
			return null;
		}
		try {
			return await readContract(publicClient, {
				address: contractAddress,
				abi: contractABI,
				functionName: 'getOneProposal',
				args: [proposalID],
				account: address,
			});
		} catch (err) {
			console.warn(`getOneProposal reverted for id=${proposalID}:`, err);
			return null;
		}
	}

	const getVoterRegisteredEvents = async () => {
		const voterRegistrationEvents = await publicClient.getLogs({
			address: contractAddress,
			event: parseAbiItem('event VoterRegistered(address voterAddress)'),
			fromBlock: fromBlock,
			toBlock: toBlock,
		});
		const mapped = voterRegistrationEvents.map(log => ({voterAddress: log.args.voterAddress}));
		setVoterRegisteredEvents(mapped);

		// Met à jour si l'adresse connectée est enregistrée
		if (address) {
			const registered = mapped.some(ev => ev.voterAddress?.toLowerCase() === address.toLowerCase());
			setIsRegisteredVoter(registered);
		} else {
			setIsRegisteredVoter(false);
		}
	};

	const getProposalRegisteredEvents = async () => {
		const proposalRegistrationEvents = await publicClient.getLogs({
			address: contractAddress,
			event: parseAbiItem('event ProposalRegistered(uint proposalId)'),
			fromBlock: fromBlock,
			toBlock: toBlock,
		})
		console.log("proposal events", proposalRegistrationEvents);
		setProposalRegisteredEvents(proposalRegistrationEvents.map(
			log => ({proposalId: Number(log.args.proposalId)})
		))
	}

	const getVotedEvents = async () => {
		const votedEvents = await publicClient.getLogs({
			address: contractAddress,
			event: parseAbiItem('event Voted(address voter, uint proposalId)'),
			fromBlock: fromBlock,
			toBlock: toBlock,
		})
		console.log("voted events", votedEvents)
		setVotedEvents(votedEvents.map(
			log => ({
				voter: log.args.voter,
				proposalId: Number(log.args.proposalId)
			})
		))
	}

	useEffect(() => {
		setMounted(true);
	}, []);


	useEffect(() => {

		const fetchData = async () => {
			if (!mounted) return;

			const status = await getStatusVoting();
			setWorkflowStatus(status);

			const owner = await getOwner();
			setIsOwner(owner.toLowerCase() === address?.toLowerCase());

			if (isRegisteredVoter) {
				const currentVoter = await getVoter();
				setVoter(currentVoter);
			} else {
				setVoter(null);
			}


			await getVoterRegisteredEvents();

			if (status === 5) {
				const winningID = await getWinningProposalID();
				const winningIDNumber = Number(winningID);
				setWinningProposalID(winningIDNumber);

				if (!isOwner) {
					const proposal = await getProposalByID(winningIDNumber);
					if (!proposal) {
						console.warn('Winning proposal non lisible (adresse peut‑être non enregistrée).');
						setWinningProposal(null);
					} else {
						setWinningProposal(proposal);
					}
				}
			}
		};

		fetchData();
	}, [isSuccess, mounted, isRegisteredVoter, address]);

	useEffect(() => {
		const fetchEvents = async () => {
			if (address) {
				await getVoterRegisteredEvents();
				await getProposalRegisteredEvents();
				await getVotedEvents();
			}
		}
		fetchEvents();
	}, [isSuccess, address]);

	useEffect(() => {

		const fetchProposalsDetails = async () => {
			if (proposalRegisteredEvents.length === 0) return;

			if (!isRegisteredVoter && !isOwner) {
				console.warn("Adresse non enregistrée — skipping getOneProposal calls");
				return;
			}

			const proposalsData = {};
			for (const proposal of proposalRegisteredEvents) {
				const details = await getProposalByID(proposal.proposalId);
				if (!details) {
					console.warn(`Impossible de lire la proposition ${proposal.proposalId} (skip).`);
					continue;
				}
				proposalsData[proposal.proposalId] = {
					description: details.description,
					voteCount: Number(details.voteCount)
				};
			}
			setProposalsDetails(proposalsData);
		};
		fetchProposalsDetails();
	}, [proposalRegisteredEvents, isRegisteredVoter, isOwner]);

	if (!mounted) {
		return null;
	}

	return (
		<div>
			<div className="flex flex-col w-full">
				<div className="mb-2 flex items-center justify-between">
					<div>
						<div className="mt-2 mb-2">
							Status : <span
							className="font-bold">{workflowStatus !== null ? WORKFLOW_LABELS[Number(workflowStatus)] : "Loading..."}</span>
						</div>

						{!isRegisteredVoter && (
							<Badge className="bg-red-100 text-red-800">Not registered as voter</Badge>
						)}
						{isRegisteredVoter && (
							<Badge className="bg-green-100 text-green-800">Registered as voter</Badge>
						)}
						{voter && (
							<>
								{!voter.hasVoted && (
									<Badge className="bg-gray-200 text-gray-800">Has not voted</Badge>
								)}
								{voter.hasVoted && voter.votedProposalId !== 0n && (
									<Badge className="bg-gray-200 ml-2 text-gray-800">
										Voted for proposal #{Number(voter.votedProposalId)}
									</Badge>
								)}
							</>
						)}
					</div>

				{workflowStatus === 0 && isOwner && (
					<Button className="border-2 cursor-pointer hover:bg-gray-100" variante="outline"
							disabled={setWorkflowIsPending} onClick={() => {
						startProposalsRegistering()
					}}>
						{setWorkflowIsPending ? "Starting..." : "Start Proposals Registering"}
					</Button>
				)}

				{workflowStatus === 1 && isOwner && (
					<Button className="border-2 cursor-pointer hover:bg-gray-100" variante="outline"
							disabled={setWorkflowIsPending} onClick={() => {
						endProposalsRegistering()
					}}>
						{setWorkflowIsPending ? "Ending..." : "End Proposals Registering"}
					</Button>
				)}

				{workflowStatus === 2 && isOwner && (
					<Button className="border-2 border-gray-300 cursor-pointer hover:bg-gray-100" variante="outline"
							disabled={setWorkflowIsPending} onClick={() => {
						startVotingSession()
					}}>
						{setWorkflowIsPending ? "Starting..." : "Start Voting Session"}
					</Button>
				)}

				{workflowStatus === 3 && isOwner && (
					<Button className="border-2 border-gray-300 cursor-pointer hover:bg-gray-100" variante="outline"
							disabled={setWorkflowIsPending} onClick={() => {
						endVotingSession()
					}}>
						{setWorkflowIsPending ? "Ending..." : "End Voting Session"}
					</Button>
				)}

				{workflowStatus === 4 && isOwner && (
					<div className="flex">
						<Button className="border-2 border-gray-300 cursor-pointer hover:bg-gray-100"
								variante="outline" disabled={setWorkflowIsPending} onClick={() => {
							tallyVotes()
						}}>
							{setWorkflowIsPending ? "Ending..." : "Tally Votes"}
						</Button>
					</div>
				)}
			</div>

			<div className="flex flex-col w-full">

				{workflowStatus === 0 && isOwner && (
					<div className="mt-4">
						<AddVoter
							writeContract={writeContract}
							isPending={setWorkflowIsPending}
							onTransactionHash={(hash) => {
							}}
						/>
					</div>
				)}

				{workflowStatus === 1 && isRegisteredVoter && (
					<div className="">
						<AddProposal
							writeContract={writeContract}
							isPending={setWorkflowIsPending}
							onTransactionHash={(hash) => {
							}}
						/>
					</div>
				)}

				{workflowStatus === 3 && isRegisteredVoter && (
					<div className="">
						<SetVote
							writeContract={writeContract}
							isPending={setWorkflowIsPending}
							onTransactionHash={(hash) => {
							}}
						/>
					</div>
				)}

				{winningProposal && isRegisteredVoter && (
					<div>
						<h2 className="mt-2 mb-2 font-bold">Winning Proposal</h2>
						<Card className="mt-2 mb-2 p-4">
							<div className="flex flex-col w-full">
								<div className="flex flex-col w-full">
									<p className="font-medium text-gray-500">ID: {winningProposalID}</p>
									<p className="font-medium text-gray-500">Description: {winningProposal?.description}</p>
									<p className="font-medium text-gray-500">Vote
										Count: {winningProposal?.voteCount}</p>
								</div>
							</div>
						</Card>
					</div>
				)}

				{(voterRegisteredEvents.length > 0 || proposalRegisteredEvents.length > 0 || votedEvents.length > 0) && (
					<div>
						<h2 className="mt-8 mb-2 font-bold">Events</h2>
						<Card className="mt-2 mb-2 p-4">
							{voterRegisteredEvents.length > 0 && (
								<div className="items-center">
									<div className="pb-2 font-medium text-gray-500">Registered Events</div>
									<div className="flex flex-col w-full">
										{voterRegisteredEvents.map((voter) => (
											<div key={voter.voterAddress}>
												<p className="text-sm">Voter address added: {voter.voterAddress}</p>
											</div>
										))}
									</div>
								</div>
							)}

							{proposalRegisteredEvents.length > 0 && isRegisteredVoter && (
								<div className="items-center">
									<div className="pb-2 font-medium text-gray-500">Proposal Events</div>
									<div className="flex flex-col w-full">
										{proposalRegisteredEvents.map((proposal) => (
											<div key={proposal.proposalId} className="">
												{proposalsDetails[proposal.proposalId] && (
													<p className="text-sm">Proposition
														#{proposal.proposalId}: {proposalsDetails[proposal.proposalId].description}</p>
												)}
											</div>
										))}
									</div>
								</div>
							)}

							{votedEvents.length > 0 && (
								<div className="items-center">
									<div className="pb-2 font-medium text-gray-500">Vote Events</div>
									<div className="flex flex-col w-full">
										{votedEvents.map((vote) => (
											<div key={vote.proposalId}>
												<p className="text-sm">Vote for proposition: #{vote.proposalId}</p>
												<p className="text-sm">Voter: {vote.voter}</p>
											</div>
										))}
									</div>
								</div>
							)}

						</Card>
					</div>
				)}

				{hash &&
					<Alert className="mt-8 mb-4 bg-orange-100">
						<CheckCircle2Icon className="h-4 w-4"/>
						<AlertTitle>Information</AlertTitle>
						<AlertDescription>
							Transaction hash: {hash}
						</AlertDescription>
					</Alert>
				}
				{isConfirming &&
					<Alert className="mb-4 bg-orange-100">
						<PopcornIcon className="h-4 w-4"/>
						<AlertTitle>Information</AlertTitle>
						<AlertDescription>
							Waiting for confirmation...
						</AlertDescription>
					</Alert>
				}
				{isSuccess &&
					<Alert className="mb-4 bg-green-100">
						<CheckCircle2Icon className="h-4 w-4"/>
						<AlertTitle>Success</AlertTitle>
						<AlertDescription>
							Transaction confirmed!
						</AlertDescription>
					</Alert>
				}
				{errorConfirmation &&
					<Alert className="mb-4 bg-red-100">
						<AlertCircleIcon className="h-4 w-4"/>
						<AlertTitle>Error</AlertTitle>
						<AlertDescription>
							{errorConfirmation.shortMessage || errorConfirmation.message}
						</AlertDescription>
					</Alert>
				}
				{error &&
					<Alert className="mb-4 bg-red-100">
						<AlertCircleIcon className="h-4 w-4"/>
						<AlertTitle>Error</AlertTitle>
						<AlertDescription>
							{error.shortMessage || error.message}
						</AlertDescription>
					</Alert>
				}

			</div>
		</div>
</div>
)
	;
};

export default Voting;
