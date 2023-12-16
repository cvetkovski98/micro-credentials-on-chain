use candid::Principal;
use ic_cdk::api::{caller, time};

use crate::{
    model::{Badge, Organisation, Role, User},
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

/// Checks if the user has access to the badge.
/// If the user is an administrator, they have access to all badges.
/// If the user is a lecturer, they have access to all badges issued by their organisation.
/// If the user is a student, they have access to all badges they own.
pub fn has_role_based_badge_access(user: &User, badge: &Badge) -> bool {
    let is_admin = user.roles.iter().any(|r| r.id == ADMINISTRATOR_ROLE_ID);
    let is_lecturer = user.roles.iter().any(|r| r.id == LECTURER_ROLE_ID);
    let is_student = user.roles.iter().any(|r| r.id == STUDENT_ROLE_ID);

    if is_admin {
        return true;
    }

    if is_lecturer {
        return user.organisation_id == badge.issuer.id;
    }

    if is_student {
        return user.id == badge.owner.id;
    }

    false
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
