mod model;
mod util;

use crate::model::{
    Badge, FileLocation, NewBadge, NewOrganisation, NewUser, Organisation, Response, Role, User,
};
use candid::Principal;
use ic_cdk::api::time;
use ic_cdk::{init, query, update};
use std::cell::RefCell;
use std::collections::BTreeMap;
use util::{authenticate_caller, next_badge_id, next_organisation_id, next_role_id, next_user_id};

thread_local! {
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
fn users_get_all() -> Response<Vec<User>> {
    USERS.with(|users| Response::Ok(users.borrow().values().cloned().collect()))
}

#[query]
fn users_get_one(id: u128) -> Response<User> {
    USERS.with(|users| match users.borrow().get(&id) {
        Some(user) => Response::Ok(user.clone()),
        None => Response::Err(format!("User with id {} not found.", id)),
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

    let id = next_user_id();

    USERS.with(|users| {
        let new_user = User {
            id: id.clone(),
            principal_id: p.to_string(),
            name: user.name,
            email: user.email,
            organisation_id: user.organisation_id,
            created_at: time(),
        };

        users.borrow_mut().insert(id, new_user.clone());
        Response::Ok(new_user)
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

#[init]
fn init() {
    let zhaw_id = next_organisation_id();
    let eth_id = next_organisation_id();
    let uzh_id = next_organisation_id();

    let zhaw = Organisation {
        id: zhaw_id.clone(),
        name: String::from("ZHAW"),
        created_at: time(),
    };
    let eth = Organisation {
        id: eth_id.clone(),
        name: String::from("ETH"),
        created_at: time(),
    };
    let uzh = Organisation {
        id: uzh_id.clone(),
        name: String::from("UZH"),
        created_at: time(),
    };

    ORGANISATIONS.with(|orgs| {
        let mut orgs = orgs.borrow_mut();
        orgs.insert(zhaw_id, zhaw);
        orgs.insert(eth_id, eth);
        orgs.insert(uzh_id, uzh);
    });

    let student_role = Role {
        id: next_role_id(),
        name: String::from("Student"),
    };
    let lecturer_role = Role {
        id: next_role_id(),
        name: String::from("Lecturer"),
    };
    let admin_role = Role {
        id: next_role_id(),
        name: String::from("Administration"),
    };

    ROLES.with(|roles| {
        let mut roles = roles.borrow_mut();
        roles.insert(student_role.id, student_role);
        roles.insert(lecturer_role.id, lecturer_role);
        roles.insert(admin_role.id, admin_role);
    });

    // TODO: Remove this once we have a login system.
    for i in 1..=9 {
        let user = User {
            id: next_user_id(),
            principal_id: String::from(format!("user_{}", i)),
            name: String::from(format!("Student {}", i)),
            email: String::from(format!("sudent_{}@students.mse.ch", i)),
            organisation_id: match i {
                1..=3 => zhaw_id,
                4..=6 => eth_id,
                7..=9 => uzh_id,
                _ => panic!("Invalid student id."),
            },
            created_at: time(),
        };
        USERS.with(|users| {
            let mut users = users.borrow_mut();
            users.insert(user.id, user);
        });
    }
}
