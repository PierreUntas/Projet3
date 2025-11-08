"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useWriteContract } from "wagmi";
import { contractAddress, contractABI } from "@/constants";

const AddProposal = ({ writeContract, isPending, onTransactionHash }) => {
    const [proposal, setProposal] = useState("");

    const addProposal = async (proposalText) => {
        if (!proposalText.trim()) {
            alert("Veuillez entrer une proposition valide");
            return;
        }

        writeContract({
            address: contractAddress,
            abi: contractABI,
            functionName: 'addProposal',
            args: [proposalText],
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        addProposal(proposal);
        setProposal("");
    };

    return (
        <form onSubmit={handleSubmit} className="flex mt-4">
            <Input
                className="mr-2"
                placeholder="add proposal"
                value={proposal}
                onChange={(e) => setProposal(e.target.value)}
            />
            <Button
                variant="outline"
                type="submit"
                disabled={isPending}
            >
                {isPending ? "Adding..." : "Add Proposal"}
            </Button>
        </form>
    );
};

export default AddProposal;