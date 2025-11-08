"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useWriteContract } from "wagmi";
import { contractAddress, contractABI } from "@/constants";

const SetVote = ({ writeContract, isPending, onTransactionHash }) => {
    const [vote, setVote] = useState("");

    const addVote = (voteId) => {
        writeContract({
            address: contractAddress,
            abi: contractABI,
            functionName: 'setVote',
            args: [voteId],
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!vote.trim()) {
            alert("Veuillez entrer un id de proposition valide");
            return;
        }
        addVote(vote);
        setVote("");
    };

    return (
        <form onSubmit={handleSubmit} className="flex mt-4">
            <Input
                className="mr-2"
                placeholder="set vote"
                value={vote}
                onChange={(e) => setVote(e.target.value)}
            />
            <Button
                variant="outline"
                type="submit"
                disabled={isPending}
            >
                {isPending ? "Setting..." : "Set Vote"}
            </Button>
        </form>
    );
};

export default SetVote;