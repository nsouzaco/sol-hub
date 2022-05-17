import React, { useEffect, useState } from 'react';
import './App.css';
import CandyMachine from './CandyMachine';
import CheckMembership from './components/CheckMembership';
import { PublicKey, clusterApiUrl, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useMoralisSolanaApi } from "react-moralis"
import { Connection } from '@solana/web3.js';
import bs58 from 'bs58';


// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const MAX_NAME_LENGTH = 32;
const MAX_URI_LENGTH = 200;
const MAX_SYMBOL_LENGTH = 10;
const MAX_CREATOR_LEN = 32 + 1 + 1;
const MAX_CREATOR_LIMIT = 5;
const MAX_DATA_SIZE = 4 + MAX_NAME_LENGTH + 4 + MAX_SYMBOL_LENGTH + 4 + MAX_URI_LENGTH + 2 + 1 + 4 + MAX_CREATOR_LIMIT * MAX_CREATOR_LEN;
const MAX_METADATA_LEN = 1 + 32 + 32 + MAX_DATA_SIZE + 1 + 1 + 9 + 172;
const CREATOR_ARRAY_START = 1 + 32 + 32 + 4 + MAX_NAME_LENGTH + 4 + MAX_URI_LENGTH + 4 + MAX_SYMBOL_LENGTH + 2 + 1 + 4;
const TOKEN_METADATA_PROGRAM = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');
const CANDY_MACHINE_V2_PROGRAM = new PublicKey('cndy3Z4yapfJBmL3ShUp5exZKqR3z33thTzeNMm2gRZ');
const candyMachineId = new PublicKey('9P2iixJXWjvE4wJHRoTXyrYVeSBgnmhqtxfeL5vgsEEz');

const App = () => {
  const SolanaApi = useMoralisSolanaApi();
  const [walletAddress, setWalletAddress] = useState(null);
  const [hasMinted, setHasMinted] = useState(false);
  const [mintText, setMintText] = useState("Mint an NFT and get membership access");

  const checkIfWalletIsConnected = async () => {
    try {
      const { solana } = window;

      if (solana && solana.isPhantom) {
          console.log('Phantom wallet found!');
      } else {
        alert('Solana object not found! Get a Phantom Wallet 👻');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const connectWallet = async () => {
    const { solana } = window;
  
    if (solana) {
      const response = await solana.connect();
      setWalletAddress(response.publicKey.toString());
      console.log('Connected with Public Key:', walletAddress);
    }
  };
  
  const renderNotConnectedContainer = () => (
    <button
      className="cta-button connect-wallet-button"
      onClick={connectWallet}
    >
      Connect Wallet
    </button>
  );

  const renderCheckMembership = () => (
    <button
      className="cta-button"
      onClick={connectWallet}
    >
      Check Membership
    </button>
  );

  const handleHasMinted = () => {
    setHasMinted(true);
    setMintText("");
  };
  /*
   * When our component first mounts, let's check to see if we have a connected
   * Phantom Wallet
   */
  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    };
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);

  const getMintAddresses = async (firstCreatorAddress) => {
    const connection = new Connection(clusterApiUrl('devnet'));
    const metadataAccounts = await connection.getProgramAccounts(
        TOKEN_METADATA_PROGRAM,
        {
          // The mint address is located at byte 33 and lasts for 32 bytes.
          dataSlice: { offset: 33, length: 32 },
  
          filters: [
            // Only get Metadata accounts.
            { dataSize: MAX_METADATA_LEN },
  
            // Filter using the first creator.
            {
              memcmp: {
                offset: CREATOR_ARRAY_START,
                bytes: firstCreatorAddress.toBase58(),
              },
            },
          ],
        },
    );
  
    return metadataAccounts.map((metadataAccountInfo) => (
        bs58.encode(metadataAccountInfo.account.data)
    ));
  };
  
  const getCandyMachineCreator = async (candyMachine)  => (
      PublicKey.findProgramAddress(
          [Buffer.from('candy_machine'), candyMachine.toBuffer()],
          CANDY_MACHINE_V2_PROGRAM,
      )
  );
  

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header">🌞 SOL HUB 🌞</p>
          <p className="sub-text">{mintText}</p>
          {!walletAddress && renderNotConnectedContainer()}
        </div>
        {/* Check for walletAddress and then pass in walletAddress */}
      {(walletAddress && !hasMinted) && <CandyMachine walletAddress={window.solana} />}
      {walletAddress && <CheckMembership walletAddress={walletAddress} hasMinted={handleHasMinted} />}
      </div>
    </div>
  );
};

export default App;
