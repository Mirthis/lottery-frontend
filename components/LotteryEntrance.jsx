import { useWeb3Contract } from "react-moralis";
import { abi, contractAddresses } from "../constants";
import { useMoralis } from "react-moralis";
import { useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";
import { useNotification } from "web3uikit";

const LotteryEntrance = () => {
  const { chainId: chainIdHex, isWeb3Enabled } = useMoralis();

  const chainId = parseInt(chainIdHex);

  const dispatch = useNotification();

  const raffleAddress =
    chainId in contractAddresses ? contractAddresses[chainId][0] : null;

  const [entranceFee, setEntranceFee] = useState("0");
  const [numberOfPlayers, setNumberOfPlayers] = useState("0");
  const [recentWinner, setRecentWinner] = useState("0");

  const { runContractFunction: getEntranceFee } = useWeb3Contract({
    abi,
    contractAddress: raffleAddress,
    functionName: "getEntranceFee",
    params: {},
  });

  const {
    runContractFunction: enterRaffle,
    isLoading,
    isFetching,
  } = useWeb3Contract({
    abi,
    contractAddress: raffleAddress,
    functionName: "enterRaffle",
    params: {},
    msgValue: entranceFee,
  });

  const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
    abi,
    contractAddress: raffleAddress,
    functionName: "getNumberOfPlayers",
    params: {},
  });

  const { runContractFunction: getRecentWinner } = useWeb3Contract({
    abi,
    contractAddress: raffleAddress,
    functionName: "getRecentWinner",
    params: {},
  });

  const updateUI = useCallback(async () => {
    const entranceFeeFromContract = (await getEntranceFee()).toString();
    const numberOfPlayersFromContract = (await getNumberOfPlayers()).toString();
    const recentWinnerFromContract = await getRecentWinner();
    setEntranceFee(entranceFeeFromContract);
    setNumberOfPlayers(numberOfPlayersFromContract);
    setRecentWinner(recentWinnerFromContract);
  }, [getEntranceFee, getNumberOfPlayers, getRecentWinner]);

  useEffect(() => {
    if (isWeb3Enabled) {
      updateUI();
    }
  }, [isWeb3Enabled, updateUI]);

  const handleSuccess = async (tx) => {
    await tx.wait(1);
    handleNewNotification();
    updateUI();
  };

  const handleNewNotification = () => {
    dispatch({
      type: "Info",
      message: "Transaction complete",
      title: "Tx Notification",
      position: "topR",
      icon: "bell",
    });
  };

  return (
    <div className="p-5">
      Lottery entrance
      {raffleAddress ? (
        <div>
          <div>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
              onClick={async () => {
                await enterRaffle({
                  onSuccess: handleSuccess,
                  onError: (error) => console.log(error),
                });
              }}
              disabled={isLoading || isFetching}
            >
              {isLoading || isFetching ? (
                <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
              ) : (
                <div>Enter Raffle</div>
              )}
            </button>
          </div>
          <div>
            Entrance fee: {ethers.utils.formatUnits(entranceFee, "ether")} ETH
          </div>
          <div> Number of players: {numberOfPlayers}</div>
          <div>Recent winner: {recentWinner}</div>
        </div>
      ) : (
        <div>No Raffle address detected</div>
      )}
    </div>
  );
};

export default LotteryEntrance;
