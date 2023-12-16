mod model;
mod util;

use crate::model::{Badge, NewBadge, NewUser, Organisation, Response, Role, User};
use candid::Principal;
use ic_cdk::api::time;
use ic_cdk::{init, post_upgrade, query, update};
use std::cell::RefCell;
use std::collections::BTreeMap;
use util::{authenticate_caller, next_badge_id, next_user_id};

const STUDENT_ROLE_ID: u128 = 1;
const LECTURER_ROLE_ID: u128 = 2;
const ADMINISTRATOR_ROLE_ID: u128 = 3;

thread_local! {
    pub static PRINCIPALS: RefCell<BTreeMap<Principal, User>> = RefCell::new(BTreeMap::new());

    // Organizations
    pub static NEXT_ORGANISATION_ID: RefCell<u128> = RefCell::new(0);
    pub static ORGANISATIONS: RefCell<BTreeMap<u128, Organisation>> = RefCell::new(BTreeMap::new());

    // Users
    pub static NEXT_USER_ID: RefCell<u128> = RefCell::new(0);
    pub static USERS: RefCell<BTreeMap<u128, User>> = RefCell::new(BTreeMap::new());

    // Badges
    pub static NEXT_BADGE_ID: RefCell<u128> = RefCell::new(0);
    pub static USER_BADGES: RefCell<BTreeMap<u128, Vec<Badge>>> = RefCell::new(BTreeMap::new());

    // Roles
    pub static NEXT_ROLE_ID: RefCell<u128> = RefCell::new(0);
    pub static ROLES: RefCell<BTreeMap<u128, Role>> = RefCell::new(BTreeMap::new());
    pub static PRINCIPAL_ROLES: RefCell<BTreeMap<Principal, Role>> = RefCell::new(BTreeMap::new());
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
    let org_filter = |user: &User| match organisation_id {
        Some(organisation_id) => user.organisation_id == organisation_id,
        None => true,
    };

    // role_filter is a function that returns true if the user has the role.
    // If there is no role provided, it returns true for all users.
    let role_filter = |user: &User| match role_id {
        Some(role_id) => user.roles.iter().any(|r| r.id == role_id),
        None => true,
    };

    USERS.with(|users| {
        let users: Vec<User> = users
            .borrow()
            .values()
            .cloned()
            .filter(org_filter)
            .filter(role_filter)
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
        id: next_user_id(),
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
    });

    USERS.with(|users| {
        users.borrow_mut().insert(inserted.id, inserted.clone());
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

    // We decide the badge filter based on the user's roles.
    // If the user has the admin role, we return all badges and we filter by organisation if provided.
    // If the user has the issuer role, we return all badges from the organisation.
    // If the user has the student role, we return all badges from the user.
    let badge_filter =
        |badge: &Badge| match user.roles.iter().find(|r| r.id == ADMINISTRATOR_ROLE_ID) {
            Some(_) => match organisation_id {
                Some(organisation_id) => badge.issuer_id == organisation_id,
                None => true,
            },
            None => match user.roles.iter().find(|r| r.id == LECTURER_ROLE_ID) {
                Some(_) => badge.issuer_id == user.organisation_id,
                None => match user.roles.iter().find(|r| r.id == STUDENT_ROLE_ID) {
                    Some(_) => badge.owner_id == user.id,
                    None => false,
                },
            },
        };

    USER_BADGES.with(|badges| {
        let badges: Vec<Badge> = badges
            .borrow()
            .values()
            .flatten()
            .cloned()
            .filter(badge_filter)
            .collect();
        Response::Ok(badges)
    })
}

#[query]
fn badges_get_one(user_id: u128, id: u128) -> Response<Badge> {
    USER_BADGES.with(|badges| match badges.borrow().get(&user_id) {
        Some(user_badges) => match user_badges.iter().find(|b| b.id == id) {
            Some(badge) => Response::Ok(badge.clone()),
            None => Response::Err(format!("Badge with id {} not found.", id)),
        },
        None => Response::Err(format!("User with id {} not found.", user_id)),
    })
}

#[update]
fn badges_delete_one(user_id: u128, id: u128) -> Response<bool> {
    USER_BADGES.with(|badges| match badges.borrow_mut().get_mut(&user_id) {
        Some(user_badges) => {
            let index = user_badges.iter().position(|b| b.id == id);
            match index {
                Some(index) => {
                    user_badges.remove(index);
                    Response::Ok(true)
                }
                None => Response::Err(format!("Badge with id {} not found.", id)),
            }
        }
        None => Response::Err(format!("User with id {} not found.", user_id)),
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

    let new_badge = Badge {
        id: next_badge_id(),
        title: badge.title,
        description: badge.description,
        badge_type: badge.badge_type,
        issuer_id: badge.issuer_id,
        owner_id: badge.owner_id,
        claims: badge.claims,
        signed_by: vec![badge.issuer_id],
        created_at: time(),
    };

    USER_BADGES.with(|badges| {
        let mut user_badges = badges.borrow_mut();
        match user_badges.get_mut(&badge.owner_id) {
            Some(user_badges) => user_badges.push(new_badge.clone()),
            None => {
                user_badges.insert(badge.owner_id, vec![new_badge.clone()]);
            }
        }
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
