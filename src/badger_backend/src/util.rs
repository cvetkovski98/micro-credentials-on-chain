use std::str::FromStr;

use candid::Principal;
use ic_cdk::api::{caller, time};

use crate::{
    model::{Badge, Organisation, Role, User},
    ADMINISTRATOR_ROLE_ID, BADGE_ACCESS_APPROVALS, COMPANY_ROLE_ID, LECTURER_ROLE_ID,
    ORGANISATIONS, PRINCIPALS, ROLES, STUDENT_ROLE_ID,
};

pub fn authenticated_caller() -> Principal {
    let principal = caller();
    if principal == Principal::anonymous() {
        panic!("Anonymous caller not allowed.");
    }
    principal
}

pub fn authenticated_user(p: Principal) -> Option<User> {
    PRINCIPALS.with(|it| it.borrow().get(&p).cloned())
}

/// clear_claims returns a copy of the badge with all claims removed if the user is a company.
pub fn clear_claims(user: &User, badge: &Badge) -> Badge {
    let mut result = badge.clone();
    if !user.is_company() {
        return result;
    }

    let is_approved = BADGE_ACCESS_APPROVALS.with(|it| {
        let it_ref = it.borrow();
        let approved_for_badge = it_ref.get(&badge.id);
        if approved_for_badge.is_none() {
            return false;
        }
        let approved_for_badge = approved_for_badge.unwrap();
        let requeting_principal = Principal::from_str(&user.principal_id).unwrap();
        approved_for_badge.contains(&requeting_principal)
    });

    if !is_approved {
        result.claims = Vec::new();
    }
    result
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
        (COMPANY_ROLE_ID, String::from("Company")),
    ];

    ROLES.with(|roles| {
        let mut roles = roles.borrow_mut();
        for (id, name) in initial {
            let role = Role { id, name };
            roles.insert(role.id, role);
        }
    });
}
