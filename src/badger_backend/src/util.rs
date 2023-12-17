use candid::Principal;
use ic_cdk::api::{caller, time};

use crate::{
    model::{Badge, Organisation, Role, User},
    ADMINISTRATOR_ROLE_ID, LECTURER_ROLE_ID, ORGANISATIONS, ROLES, STUDENT_ROLE_ID,
};

pub fn authenticate_caller() -> Principal {
    let principal = caller();
    if principal == Principal::anonymous() {
        panic!("Anonymous caller not allowed.");
    }
    principal
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
        return user.principal_id == badge.owner.principal_id;
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
        let mut id: u128 = 1;
        let created_at = time();
        for name in initial {
            let org = Organisation {
                id,
                name,
                created_at,
            };
            orgs.insert(org.id, org);
            id += 1;
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
