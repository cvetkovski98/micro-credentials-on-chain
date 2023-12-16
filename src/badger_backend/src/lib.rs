mod model;
mod util;

use crate::model::{Badge, NewBadge, NewUser, Organisation, Response, Role, User};
use candid::Principal;
use ic_cdk::api::time;
use ic_cdk::{init, post_upgrade, query, update};
use std::cell::RefCell;
use std::collections::BTreeMap;
use std::str::FromStr;
use util::{authenticate_caller, has_role_based_badge_access, next_badge_id};

const STUDENT_ROLE_ID: u128 = 1;
const LECTURER_ROLE_ID: u128 = 2;
const ADMINISTRATOR_ROLE_ID: u128 = 3;

thread_local! {
    // Users
    pub static PRINCIPALS: RefCell<BTreeMap<Principal, User>> = RefCell::new(BTreeMap::new());

    // Organizations
    pub static NEXT_ORGANISATION_ID: RefCell<u128> = RefCell::new(0);
    pub static ORGANISATIONS: RefCell<BTreeMap<u128, Organisation>> = RefCell::new(BTreeMap::new());

    // Badges
    pub static NEXT_BADGE_ID: RefCell<u128> = RefCell::new(0);
    pub static BADGES: RefCell<BTreeMap<u128, Badge>> = RefCell::new(BTreeMap::new());

    // Roles
    pub static NEXT_ROLE_ID: RefCell<u128> = RefCell::new(0);
    pub static ROLES: RefCell<BTreeMap<u128, Role>> = RefCell::new(BTreeMap::new());
}

#[query]
fn organisations_get_all() -> Response<Vec<Organisation>> {
    authenticate_caller();

    ORGANISATIONS.with(|orgs| Response::Ok(orgs.borrow().values().cloned().collect()))
}

#[query]
fn users_get_all(organisation_id: Option<u128>, role_id: Option<u128>) -> Response<Vec<User>> {
    authenticate_caller();

    // org_filter is a function that returns true if the user has the organisation.
    // If there is no organisation provided, it returns true for all users.
    fn f(user: &User, org_id: Option<u128>, role_id: Option<u128>) -> bool {
        let org_filter = |user: &User| match org_id {
            Some(org_id) => user.organisation_id == org_id,
            None => true,
        };

        let role_filter = |user: &User| match role_id {
            Some(role_id) => user.roles.iter().any(|r| r.id == role_id),
            None => true,
        };

        org_filter(user) && role_filter(user)
    }

    PRINCIPALS.with(|principals| {
        let principals = principals.borrow();
        let users: Vec<User> = principals
            .values()
            .cloned()
            .filter(|u| f(u, organisation_id, role_id))
            .collect();
        Response::Ok(users)
    })
}

#[query]
fn users_whoami() -> Response<User> {
    let p = authenticate_caller();

    PRINCIPALS.with(|principals| {
        let principals = principals.borrow();
        match principals.get(&p) {
            Some(user) => Response::Ok(user.clone()),
            None => Response::Err(format!("User with principal {} not found.", p)),
        }
    })
}

#[update]
fn users_create_one(user: NewUser) -> Response<User> {
    let p = authenticate_caller();

    if let Some(_) = PRINCIPALS.with(|principals| {
        let principals = principals.borrow();
        principals.get(&p).cloned()
    }) {
        return Response::Err(format!("User with principal {} already exists.", p));
    }

    let organisation: Option<Organisation> = ORGANISATIONS.with(|orgs| {
        let orgs = orgs.borrow();
        orgs.get(&user.organisation_id).cloned()
    });

    if organisation.is_none() {
        return Response::Err(format!(
            "Organisation with id {} not found.",
            user.organisation_id
        ));
    }

    let mut roles: Vec<Role> = vec![];

    for role_id in &user.roles {
        let role: Option<Role> = ROLES.with(|roles| roles.borrow().get(role_id).cloned());
        match role {
            Some(role) => roles.push(role),
            None => {
                return Response::Err(format!("Role with id {} not found.", role_id));
            }
        }
    }

    let inserted = User {
        principal_id: p.to_string(),
        name: user.name.clone(),
        email: user.email.clone(),
        organisation_id: user.organisation_id,
        roles,
        created_at: time(),
    };

    PRINCIPALS.with(|principals| {
        let mut principals = principals.borrow_mut();
        principals.insert(p, inserted.clone());
        Response::Ok(inserted)
    })
}

#[query]
fn badges_get_all(organisation_id: Option<u128>) -> Response<Vec<Badge>> {
    let p = authenticate_caller();

    let user = PRINCIPALS.with(|principals| {
        let principals = principals.borrow();
        principals.get(&p).cloned()
    });

    if user.is_none() {
        return Response::Err(format!("User with principal {} not found.", p));
    }

    let user = user.unwrap();

    fn f(user: &User, badge: &Badge, organisation_id: Option<u128>) -> bool {
        let has_access = has_role_based_badge_access(user, badge);
        match organisation_id {
            Some(organisation_id) => has_access && badge.issuer.id == organisation_id,
            None => has_access,
        }
    }

    BADGES.with(|badges| {
        let badges: Vec<Badge> = badges
            .borrow()
            .values()
            .filter(|b| f(&user, b, organisation_id))
            .cloned()
            .collect();
        Response::Ok(badges)
    })
}

#[query]
fn badges_get_one(badge_id: u128) -> Response<Badge> {
    let p = authenticate_caller();

    let user = PRINCIPALS.with(|principals| {
        let principals = principals.borrow();
        principals.get(&p).cloned()
    });

    if user.is_none() {
        return Response::Err(format!("User with principal {} not found.", p));
    }

    let user = user.unwrap();

    BADGES.with(|badges| match badges.borrow().get(&badge_id) {
        Some(badge) => {
            if !has_role_based_badge_access(&user, badge) {
                return Response::Err(format!(
                    "User with principal {} does not have access to badge with id {}.",
                    p, badge_id
                ));
            }
            Response::Ok(badge.clone())
        }
        None => Response::Err(format!("Badge with id {} not found.", badge_id)),
    })
}

#[update]
fn badges_revoke_one(badge_id: u128) -> Response<bool> {
    let p = authenticate_caller();

    let user = PRINCIPALS.with(|principals| {
        let principals = principals.borrow();
        principals.get(&p).cloned()
    });

    if user.is_none() {
        return Response::Err(format!("User with principal {} not found.", p));
    }

    let user = user.unwrap();

    let is_student = user
        .roles
        .iter()
        .find(|r| r.id == STUDENT_ROLE_ID)
        .is_some();

    if is_student {
        return Response::Err(String::from("Students cannot revoke badges."));
    }

    BADGES.with(|badges| match badges.borrow_mut().get_mut(&badge_id) {
        Some(badge) => {
            if !has_role_based_badge_access(&user, badge) {
                return Response::Err(format!(
                    "User with principal {} does not have access to badge with id {}.",
                    p, badge_id
                ));
            }
            badge.is_revoked = true;
            Response::Ok(true)
        }
        None => Response::Err(format!("Badge with id {} not found.", badge_id)),
    })
}

#[update]
fn badges_create_one(badge: NewBadge) -> Response<Badge> {
    let p = authenticate_caller();

    let user = PRINCIPALS.with(|principals| {
        let principals = principals.borrow();
        principals.get(&p).cloned()
    });

    if user.is_none() {
        return Response::Err(format!("User with principal {} not found.", p));
    }

    let user = user.unwrap();

    let is_admin = user
        .roles
        .iter()
        .find(|r| r.id == ADMINISTRATOR_ROLE_ID)
        .is_some();

    let is_lecturer = user
        .roles
        .iter()
        .find(|r| r.id == LECTURER_ROLE_ID)
        .is_some();

    if !is_admin && !is_lecturer {
        return Response::Err(format!(
            "User with principal {} is not an administrator or lecturer and cannot create badges.",
            p
        ));
    }

    if is_lecturer {
        if badge.issuer_id != user.organisation_id {
            return Response::Err(format!(
                "User with principal {} is not a member of organisation {} and cannot create badges for it.",
                p, badge.issuer_id
            ));
        }
    }

    let organisation = ORGANISATIONS.with(|orgs| {
        let orgs = orgs.borrow();
        orgs.get(&badge.issuer_id).cloned()
    });

    if organisation.is_none() {
        return Response::Err(format!(
            "Organisation with id {} not found.",
            badge.issuer_id
        ));
    }

    let owner = Principal::from_str(&badge.owner_id);

    if owner.is_err() {
        return Response::Err(format!("Invalid principal id: {}", badge.owner_id));
    }

    let owner = PRINCIPALS.with(|principals| {
        let principals = principals.borrow();
        principals.get(&owner.unwrap()).cloned()
    });

    let new_badge = Badge {
        id: next_badge_id(),
        title: badge.title,
        description: badge.description,
        badge_type: badge.badge_type,
        issuer: organisation.unwrap(),
        owner: owner.unwrap(),
        is_revoked: false,
        claims: badge.claims,
        signed_by: vec![p.to_string()],
        created_at: time(),
    };

    BADGES.with(|badges| {
        let mut badges = badges.borrow_mut();
        badges.insert(new_badge.id, new_badge.clone());
        Response::Ok(new_badge)
    })
}

#[query]
fn roles_get_all() -> Response<Vec<Role>> {
    ROLES.with(|roles| Response::Ok(roles.borrow().values().cloned().collect()))
}

#[post_upgrade]
fn post_upgrade() {
    util::generate_organisations();
    util::generate_roles();
}

#[init]
fn init() {
    util::generate_organisations();
    util::generate_roles();
}
