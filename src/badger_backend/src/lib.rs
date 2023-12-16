mod model;
mod util;

use crate::model::{
    Badge, FileLocation, NewBadge, NewOrganisation, NewUser, Organisation, Response, Role, User,
};
use candid::Principal;
use ic_cdk::api::time;
use ic_cdk::{init, post_upgrade, query, update};
use std::cell::RefCell;
use std::collections::BTreeMap;
use util::{authenticate_caller, next_badge_id, next_organisation_id, next_user_id};

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
fn whoami() -> String {
    format!("{}", authenticate_caller())
}

#[query]
fn organisations_get_all() -> Response<Vec<Organisation>> {
    ORGANISATIONS.with(|orgs| Response::Ok(orgs.borrow().values().cloned().collect()))
}

#[query]
fn organisations_get_one(id: u128) -> Response<Organisation> {
    ORGANISATIONS.with(|orgs| match orgs.borrow().get(&id) {
        Some(org) => Response::Ok(org.clone()),
        None => Response::Err(format!("Organisation with id {} not found.", id)),
    })
}

#[update]
fn organisations_delete_one(id: u128) -> Response<bool> {
    ORGANISATIONS.with(|orgs| match orgs.borrow_mut().remove(&id) {
        Some(_) => Response::Ok(true),
        None => Response::Err(format!("Organisation with id {} not found.", id)),
    })
}

#[update]
fn organisations_create_one(org: NewOrganisation) -> Response<Organisation> {
    let id = next_organisation_id();

    ORGANISATIONS.with(|orgs| {
        let new_org = Organisation {
            id: id.clone(),
            name: org.name,
            created_at: time(),
        };

        orgs.borrow_mut().insert(id, new_org.clone());
        Response::Ok(new_org)
    })
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
        let users = users.borrow();
        let users: Vec<User> = users.values().cloned().collect();
        let users: Vec<User> = users
            .into_iter()
            .filter(org_filter)
            .filter(role_filter)
            .collect();
        Response::Ok(users)
    })
}

#[query]
fn users_get_one(id: u128) -> Response<User> {
    USERS.with(|users| match users.borrow().get(&id) {
        Some(user) => Response::Ok(user.clone()),
        None => Response::Err(format!("User with id {} not found.", id)),
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
fn users_delete_one(id: u128) -> Response<bool> {
    USERS.with(|users| match users.borrow_mut().remove(&id) {
        Some(_) => Response::Ok(true),
        None => Response::Err(format!("User with id {} not found.", id)),
    })
}

#[update]
fn users_create_one(user: NewUser) -> Response<User> {
    let p = authenticate_caller();

    let has_org = ORGANISATIONS.with(|orgs| match orgs.borrow().get(&user.organisation_id) {
        Some(_) => true,
        None => false,
    });

    if !has_org {
        return Response::Err(format!(
            "Organisation with id {} not found.",
            user.organisation_id
        ));
    }

    let mut roles: Vec<Role> = vec![];

    for role_id in &user.roles {
        let role: Option<Role> = ROLES.with(|roles| roles.borrow().get(role_id).cloned());
        println!("Role: {:?}", role);
        match role {
            Some(role) => roles.push(role),
            None => {
                return Response::Err(format!("Role with id {} not found.", role_id));
            }
        }
    }

    let id = next_user_id();
    let inserted = User {
        id: id.clone(),
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
        users.borrow_mut().insert(id, inserted.clone());
        Response::Ok(inserted)
    })
}

#[query]
fn badges_get_all(user_id: u128) -> Response<Vec<Badge>> {
    let has_user = USERS.with(|users| match users.borrow().get(&user_id) {
        Some(_) => true,
        None => false,
    });

    if !has_user {
        return Response::Err(format!("User with id {} not found.", user_id));
    }

    let badges = USER_BADGES.with(|badges| match badges.borrow().get(&user_id) {
        Some(user_badges) => user_badges.clone(),
        None => vec![],
    });

    return Response::Ok(badges);
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
    let has_user = USERS.with(|users| match users.borrow().get(&badge.owner_id) {
        Some(_) => true,
        None => false,
    });

    if !has_user {
        return Response::Err(format!("User with id {} not found.", badge.owner_id));
    }

    let has_org = ORGANISATIONS.with(|orgs| match orgs.borrow().get(&badge.issuer_id) {
        Some(_) => true,
        None => false,
    });

    if !has_org {
        return Response::Err(format!(
            "Organisation with id {} not found.",
            badge.issuer_id
        ));
    }

    let id = next_badge_id();
    let new_badge = Badge {
        id: id.clone(),
        title: badge.title,
        description: badge.description,
        badge_type: badge.badge_type,
        issuer_id: badge.issuer_id,
        owner_id: badge.owner_id,
        claims: badge.claims,
        signed_by: vec![],
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

#[update]
fn badges_get_qr_code(user_id: u128, id: u128) -> Response<FileLocation> {
    Response::Ok(FileLocation {
        location: String::from(format!("{}-{}.png", user_id, id)),
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
