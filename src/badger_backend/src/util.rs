use candid::Principal;
use ic_cdk::api::caller;

use crate::{NEXT_BADGE_ID, NEXT_ORGANISATION_ID, NEXT_ROLE_ID, NEXT_USER_ID};

pub fn authenticate_caller() -> Principal {
    let principal = caller();
    if principal == Principal::anonymous() {
        panic!("Anonymous caller not allowed.");
    }
    principal
}

pub fn next_user_id() -> u128 {
    NEXT_USER_ID.with(|id| {
        let mut id = id.borrow_mut();
        *id += 1;
        *id
    })
}

pub fn next_organisation_id() -> u128 {
    NEXT_ORGANISATION_ID.with(|id| {
        let mut id = id.borrow_mut();
        *id += 1;
        *id
    })
}

pub fn next_badge_id() -> u128 {
    NEXT_BADGE_ID.with(|id| {
        let mut id = id.borrow_mut();
        *id += 1;
        *id
    })
}

pub fn next_role_id() -> u128 {
    NEXT_ROLE_ID.with(|id| {
        let mut id = id.borrow_mut();
        *id += 1;
        *id
    })
}
