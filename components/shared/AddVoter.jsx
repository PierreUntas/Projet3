"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useWriteContract } from "wagmi";
import { contractAddress, contractABI } from "@/constants";

const AddVoter = ({ writeContract, isPending, onTransactionHash })  => {
  const [voterAddress, setVoterAddress] = useState("");

  const addVoter = async (address) => {
    if (!address.trim()) {
      alert("Veuillez entrer une adresse valide");
      return;
    }
    
    writeContract({
      address: contractAddress,
      abi: contractABI,
      functionName: 'addVoter',
      args: [address],
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addVoter(voterAddress);
    setVoterAddress(""); // Reset l'input après soumission
  };

  return (
    <form onSubmit={handleSubmit} className="flex mt-2">
      <Input 
        className="mr-2" 
        placeholder="add voter address" 
        value={voterAddress}
        onChange={(e) => setVoterAddress(e.target.value)}
      />
      <Button 
        variant="outline" 
        type="submit"
        disabled={isPending}
      >
        {isPending ? "Adding..." : "Add Voter"}
      </Button>
    </form>
  );
};

export default AddVoter;