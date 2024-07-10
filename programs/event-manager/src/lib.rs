use {crate::instructions::*, anchor_lang::prelude::*};

mod collections;
mod instructions;

declare_id!("5sgih4PHTwu1sqxK6Lmr8ZjA9WAHMjev1QMLVychFvrB");

#[program]
pub mod event_manager {
    use super::*;

    pub fn create_event(ctx: Context<CreateEvent>, name: String, ticket_price: u64) -> Result<()> {
        instructions::create_event::handle(ctx, name, ticket_price)
    }

    // sponsor event (get event mint tokens)
    pub fn sponsor_event(ctx: Context<Sponsor>, quantity: u64) -> Result<()> {
        instructions::sponsor::handle(ctx, quantity)
    }
}
