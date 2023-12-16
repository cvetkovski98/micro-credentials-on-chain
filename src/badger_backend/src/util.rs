use candid::Principal;
use ic_cdk::api::{caller, time};

use crate::{
    model::{Organisation, Role},
    ADMINISTRATOR_ROLE_ID, LECTURER_ROLE_ID, NEXT_BADGE_ID, NEXT_ORGANISATION_ID, NEXT_USER_ID,
    ORGANISATIONS, ROLES, STUDENT_ROLE_ID,
};

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

pub fn generate_organisations() {
    let initial: Vec<String> = vec![
        String::from("Zurich University of Applied Sciences"),
        String::from("ETH Zurich"),
        String::from("University of Zurich"),
        String::from("University of Bern"),
        String::from("FHNW"),
        String::from("EPFL"),
    ];

    ORGANISATIONS.with(|orgs| {
        let mut orgs = orgs.borrow_mut();
        for name in initial {
            let org = Organisation {
                id: next_organisation_id(),
                name,
                created_at: time(),
            };
            orgs.insert(org.id, org);
        }
    });
}

pub fn generate_roles() {
    let initial: Vec<(u128, String)> = vec![
        (STUDENT_ROLE_ID, String::from("Student")),
        (LECTURER_ROLE_ID, String::from("Lecturer")),
        (ADMINISTRATOR_ROLE_ID, String::from("Administator")),
    ];

    ROLES.with(|roles| {
        let mut roles = roles.borrow_mut();
        for (id, name) in initial {
            let role = Role { id, name };
            roles.insert(role.id, role);
        }
    });
}
