import React, { useEffect, useState } from 'react';
import '../App.css';
import { PublicKey, clusterApiUrl, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useMoralisSolanaApi } from "react-moralis"
import { Connection } from '@solana/web3.js';
import bs58 from 'bs58';
import gif from '../assets/dif.gif'; 
import Alert from "@material-ui/lab/Alert";
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';

// Constants
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
const candyMachineId = new PublicKey('FWLamLhz75424XwTcMedo9njgiSSk5cNWfwwytKbPewG');

const CheckMembership = ( {walletAddress, hasMinted} ) => {
    const SolanaApi = useMoralisSolanaApi();
    const [checkString, setCheckString] = useState('Check Membership');
    const [checked, setChecked] = useState(false);
    const [isMember, setIsMember] = useState(false);

    const renderCheckMembership = () => (
        <button
          className="cta-button check-button"
          onClick={checkMember}>{`${checkString}`}
        </button>
    );
    
    const renderIsMember = () => (
        <div>
            <p className='member-message'>Congrats, you're a member!</p>
            <img src={gif} alt="gif" />;
        </div>
    );


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
        
    const checkMember  = async () => {
        setCheckString("Ckecking...")
        try {
            const connection = new Connection(clusterApiUrl('devnet')); 
            const candyMachineCreator = await getCandyMachineCreator(candyMachineId);
            const mintAddresses = await getMintAddresses(candyMachineCreator[0]);
            console.log("Getting the mint addresses on specific candy machine id");
            console.log(mintAddresses);
            const nftsmetadata = await Metadata.findDataByOwner(connection, walletAddress);
            console.log(nftsmetadata)
             nftsmetadata.forEach(nft => {
                for (let key in nft) {
                    if (key == "mint") {
                        if (mintAddresses.includes(nft[key])) {
                            console.log(`${key}: ${nft[key]}`);
                            setIsMember(true);
                            hasMinted();
                        }
                    }
                }
            });
            setChecked(true);
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div>
            {!checked && renderCheckMembership()}
            {checked && (
                isMember ? renderIsMember() : <p className='member-message' >you're not a member :(</p>
            )}
        </div>

    );
  };

export default CheckMembership;