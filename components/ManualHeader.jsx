import { useMoralis } from "react-moralis";
import { useEffect } from "react";

const ManualHeader = () => {
  const {
    enableWeb3,
    account,
    isWeb3Enabled,
    Moralis,
    deactivateWeb3,
    isWeb3EnableLoading,
  } = useMoralis();

  useEffect(() => {
    if (isWeb3Enabled) return;
    if (
      typeof window !== undefined &&
      window.localStorage.getItem("connected")
    ) {
      console.log("Previous wallet connection founds. Connecting...");
      enableWeb3();
    }
  }, [enableWeb3, isWeb3Enabled]);

  useEffect(() => {
    Moralis.onAccountChanged((account) => {
      console.log(`Account changed to ${account}`);
      if (account == null) {
        window.localStorage.removeItem("connected");
        deactivateWeb3();
        console.log("null account found");
      }
    });
  }, [Moralis, deactivateWeb3]);

  return (
    <div>
      {account ? (
        <div>
          Connected to {account.slice(0, 6)}...{account.slice(-4)}
        </div>
      ) : (
        <button
          onClick={async () => {
            await enableWeb3();
            if (typeof window !== undefined) {
              window.localStorage.setItem("connected", "injected");
            }
          }}
          disabled={isWeb3EnableLoading}
        >
          Connect
        </button>
      )}
    </div>
  );
};

export default ManualHeader;
