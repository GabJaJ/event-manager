use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)] //automatic space calc
pub struct Event {
    // event data
    #[max_len(40)] // event name should be 40 characters or less
    pub name: String,
    pub ticket_price: u64,
    pub active: bool,

    // event accounts
    pub authority: Pubkey,
    pub accepted_mint: Pubkey,

    // PDAs bumps
    pub event_bump: u8,
    pub event_mint_bump: u8,
    pub event_vault_bump: u8,
    pub gain_vault_bump: u8,
}

impl Event {
    pub const SEED_EVENT: &'static str = "event";
    pub const SEED_EVENT_MINT: &'static str = "event_mint";
    pub const SEED_TREASURY_VAULT: &'static str = "treasury_vault";
    pub const SEED_GAIN_VAULT: &'static str = "gain_vault";
}
