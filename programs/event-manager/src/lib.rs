use anchor_lang::prelude::*;

declare_id!("5sgih4PHTwu1sqxK6Lmr8ZjA9WAHMjev1QMLVychFvrB");

#[program]
pub mod event_manager {
    use super::*;

    pub fn initialize(_ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
