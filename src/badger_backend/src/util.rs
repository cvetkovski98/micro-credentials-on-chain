use candid::Principal;
use ic_cdk::api::caller as caller_api;

use crate::{NEXT_BADGE_ID, NEXT_ORGANISATION_ID, NEXT_ROLE_ID, NEXT_STUDENT_ID};

pub fn caller() -> Principal {
    let caller = caller_api();
    if caller == Principal::anonymous() {
        println!(
            "Caller is anonymous. Caller is {}. Anon is {}.",
            caller,
            Principal::anonymous()
        );
    }
    caller
}

pub fn next_student_id() -> u128 {
    NEXT_STUDENT_ID.with(|id| {
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
