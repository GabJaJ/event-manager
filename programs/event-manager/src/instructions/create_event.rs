use {crate::colections::Event, anchor_lang::prelude::*, anchor_spl::teken::*};

#[derive(Accounts)]
pub struct CreateEvent<'info> {
    // "event"
    #[account(
        init,
        seeds = [
            Event::SEED_EVENT.as_ref(), // "event"
            authority.key().as_ref(), // event authority
        ],
        bump, // canonic bump
        payer = authority,
        space = 8 + Event::INIT_SPACE
    )]
    pub event: Account<'info, Event>,

    pub accepted_mint: Account<'info, Mint>,

    // "event_mint"
    #[account(
        init,
        seed = [
            Event::SEED_EVENT_MINT.as_ref(), // "event_mint"
            event.key().as_ref() // event public key
        ],
        bump,
        payer = authority,
        mint::decimals = 0, // no decimals = 1:1
        mint::authority = event, // only "event" can print tokens
    )]
    pub event_mint: Account<'info, Mint>,

    // "treasury_vault"
    #[account(
        init,
        payer = authority,
        seeds = [
            Event::SEED_TREASURY_VAULT.as_ref(), // "treasury_vault"
            event.key().as_ref() // event public key
        ],
        bump,
        token::mint = accepted_mint, // accepted mint
        token:: authority = event,
    )]
    pub treasury_vault: Account<'info, TokenAccount>,

    // "gain_vault"
    #[account(
        init,
        payer = authority,
        seeds = [
            Event::SEED_GAIN_VAULT.as_ref(), // "gain_vault"
            event.key().as_ref() // event public key
        ],
        bump,
        token::mint = accepted_mint, // accepted mint
        token:: authority = event,
    )]
    pub gain_vault: Account<'info, TokenAccount>,

    #[account(mut)]
    pub authority: Signer<'info>, // event authority
    pub rent: Sysvar<'info, Rent>,
    pub token_program: Program<'info, Token>, // token mint & token acounts
    pub system_program: Program<'info, System>, // accounts created
}
