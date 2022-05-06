import React, { useEffect, useState } from 'react';
import './App.css';
import { Program, Provider, web3 } from '@project-serum/anchor';
import twitterLogo from './assets/twitter-logo.svg';
import CandyMachine from './CandyMachine';
import { PublicKey, clusterApiUrl, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { FetchNFTClient } from '@audius/fetch-nft'
import { useMoralisSolanaApi } from "react-moralis"
import { Connection } from '@solana/web3.js';
import bs58 from 'bs58';
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';
import {
  resolveToWalletAddress,
  getParsedNftAccountsByOwner,
} from "@nfteyez/sol-rayz";


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
const candyMachineId = new PublicKey('52LNHR8d6Se5swgAFYHKr9d8bZxoiL2PgKje4KAMqfvA');

const App = () => {
  const SolanaApi = useMoralisSolanaApi();
  const [walletAddress, setWalletAddress] = useState(null);

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
      Connect to Wallet
    </button>
  );

  /*
   * When our component first mounts, let's check to see if we have a connected
   * Phantom Wallet
   */
  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
      try {
        console.log("Getting info on all nfts I own");
        const result = await SolanaApi.account.getNFTs({
            network: 'devnet',
            address: 'DdL4djgJWuu7aAs67NES1ZRbELP1xfDvMusngckyDM8S'
        })
        console.log(result);
        const candyMachineCreator = await getCandyMachineCreator(candyMachineId);
        const r = await getMintAddresses(candyMachineCreator[0]);
        console.log("Getting the mint addresses on specific candy machine id");
        console.log(r);  
        // let nftMetadata = await SolanaApi.nft.getNFTMetadata({
        //   network: 'devnet',
        //   address: walletAddress
      // })
      // console.log(nftMetadata);
            
      // const connection = new Connection('devnet');
      // const ownerPublickey = 'DdL4djgJWuu7aAs67NES1ZRbELP1xfDvMusngckyDM8S';
      // const nftsmetadata = await Metadata.findDataByOwner(connection, walletAddress);
      // console.log(nftsmetadata)
      // console.log("Metaplex api");
      // const nftArray = await getParsedNftAccountsByOwner(walletAddress);
      // console.log(nftArray);
    } catch (error) {
        console.log(error)
    }
  }
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
          <p className="header">🍭 Candy Drop</p>
          <p className="sub-text">NFT drop machine with fair mint</p>
          {!walletAddress && renderNotConnectedContainer()}
        </div>
        {/* Check for walletAddress and then pass in walletAddress */}
      {walletAddress && <CandyMachine walletAddress={window.solana} />}
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
