import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { EventManager } from "../target/types/event_manager";
import { BN } from "bn.js";
import { Keypair, PublicKey } from '@solana/web3.js';
import { createFundedWallet, createMint, createAssociatedTokenAccount } from './utils';
import { getAssociatedTokenAddress, getAccount } from '@solana/spl-token';

describe("event-manager", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.EventManager as Program<EventManager>;

  // event test data
  const name: string = "my_event";
  const ticketPrice = new BN(1);

  // event accounts adress
  let acceptedMint: PublicKey;

  // PDAs
  let eventPublicKey: PublicKey;
  let eventMint: PublicKey;
  let treasuryVault: PublicKey;
  let gainVault: PublicKey;

  // Sponsor
  let alice: Keypair; // alice key pair - first sponsor
  let aliceAcceptedMintData: PublicKey; // alice accepted mint ATA
  let aliceEventMintATA: PublicKey; // alice event mint ATA

  before(async () => {
    acceptedMint = await createMint(provider); // aux functions solana web3

    // find event account PDA
    [eventPublicKey] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("event", "utf-8"), provider.wallet.publicKey.toBuffer()],
      program.programId
    );

    // find event mint account PDA
    [eventMint] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("event_mint", "utf-8"), eventPublicKey.toBuffer()],
      program.programId
    );

    // find treasury vault account PDA
    [treasuryVault] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("treasury_vault", "utf-8"), eventPublicKey.toBuffer()],
      program.programId
    );

    // find gain vault account PDA
    [gainVault] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("gain_vault", "utf-8"), eventPublicKey.toBuffer()],
      program.programId
    );

    // creates a new wallet funded with 3 SOL 
    alice = await createFundedWallet(provider, 3);
    // create alice accepted mint ata with 100 accepted mint
    // Accepted mint = USDC  -> alice wallet = 100 USDC 
    aliceAcceptedMintATA = await createAssociatedTokenAccount(provider, acceptedMint, 100, alice);
    // find alice event mint ata (only finds address)
    aliceEventMintATA = await getAssociatedTokenAddress(eventMint, alice.publicKey);

    // find provided (event organizer) wallet acceptend mint ata
    // only the address
    walletAcceptedMintATA = await getAssociatedTokenAddress(acceptedMint, provider.wallet.publicKey);


  });

  // TEST: Create an Event
  it("Is initialized!", async () => {
    const name: string = "my_event";
    const ticketPrice = new BN(1);
    const tx = await program.methods.createEvent(name, ticketPrice)
      .accounts({
        event: eventPublicKey,
        acceptedMint: acceptedMint,
        eventMint: eventMint,
        treasuryVault: treasuryVault,
        gainVault: gainVault,
        authority: provider.wallet.publicKey,
      })
      .rpc();
    // show new event info
    const eventAccount = await program.account.event.fetch(eventPublicKey);
    console.log("Event info: ", eventAccount);
  });

  // TEST: Sponsor event
  it("Alice Should get 5 event tokens", async () => {
    // show alice accepted mint (USDC) ATA info
    // should have 100 USDC
    let aliceUSDCBalance = await getAccount(
      provider.connection,
      aliceAcceptedMintATA // Alice Accepted mint account (USDC account)
    );
    console.log("Alice Accepted mint ATA: ", aliceUSDCBalance);

    const quantity = new BN(5); // 5 USDC 
    await program.methods
      .sponsorEvent(quantity)
      .accounts({
        eventMint: eventMint, // 1:1 with USDC
        payerAcceptedMintAta: aliceAcceptedMintATA, // Alice USDC Account 
        event: eventPublicKey,
        authority: alice.publicKey,
        payerEventMintAta: aliceEventMintATA, // Alice Event Mint Account
        treasuryVault: treasuryVault // store all Accepted mint (USDC) from sponsorships
      })
      .signers([alice])
      .rpc();
    // show alice event mint ATA info
    // should have 5 Event mint
    const aliceAccount = await getAccount(
      provider.connection,
      aliceEventMintATA // Alice Event Mint account (should have <quantity> tokens from sponsorship)
    );
    console.log("Alice Event mint ATA: ", aliceAccount);

    // show alice accepted mint (USDC) ATA info
    // should have 95 (100-5) USDC
    aliceUSDCBalance = await getAccount(
      provider.connection,
      aliceAcceptedMintATA // Alice Accepted mint account (USDC account)
    );
    console.log("Alice Accepted mint ATA: ", aliceUSDCBalance);

    
  });
