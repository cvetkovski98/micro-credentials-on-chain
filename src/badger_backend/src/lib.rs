mod model;
mod util;

use crate::model::{Badge, NewBadge, NewUser, Organisation, Response, Role, StableData, User};
use crate::util::{authenticated_caller, authenticated_user};
use candid::Principal;
use ic_cdk::api::time;
use ic_cdk::{init, post_upgrade, pre_upgrade, query, storage, update};
use std::cell::RefCell;
use std::collections::BTreeMap;
use std::str::FromStr;

const STUDENT_ROLE_ID: u128 = 1;
const LECTURER_ROLE_ID: u128 = 2;
const ADMINISTRATOR_ROLE_ID: u128 = 3;

type UsersMap = BTreeMap<Principal, User>;
type OrganizationsMap = BTreeMap<u128, Organisation>;
type BadgesMap = BTreeMap<u128, Badge>;
type RolesMap = BTreeMap<u128, Role>;

thread_local! {
    pub static PRINCIPALS: RefCell<UsersMap> = RefCell::default();
    pub static ORGANISATIONS: RefCell<OrganizationsMap> = RefCell::default();
    pub static BADGES: RefCell<BadgesMap> = RefCell::default();
    pub static ROLES: RefCell<RolesMap> = RefCell::default();
}

#[query]
fn organisations_get_all() -> Response<Vec<Organisation>> {
    authenticated_caller();

    ORGANISATIONS.with(|orgs| Response::Ok(orgs.borrow().values().cloned().collect()))
}

#[query]
fn users_get_all(organisation_id: Option<u128>, role_id: Option<u128>) -> Response<Vec<User>> {
    let p = authenticated_caller();
    let auth_user = PRINCIPALS.with(|it| it.borrow().get(&p).cloned());

    if auth_user.is_none() {
        return Response::Err(format!("User with principal {} not found.", p));
    }

    let auth_user = auth_user.unwrap();

    /// user_filter returns true if the user should be included in the result set.
    fn user_filter(
        auth_user: &User,
        other_user: &User,
        org_id: Option<u128>,
        role_id: Option<u128>,
    ) -> bool {
        if !auth_user.has_user_access(other_user) {
            return false;
        }

        let org_filter = |user: &User| match org_id {
            Some(org_id) => user.organisation_id == org_id,
            None => true,
        };

        let role_filter = |user: &User| match role_id {
            Some(role_id) => user.has_role(role_id),
            None => true,
        };

        org_filter(other_user) && role_filter(other_user)
    }

    PRINCIPALS.with(|principals| {
        let principals = principals.borrow();
        let users: Vec<User> = principals
            .values()
            .cloned()
            .filter(|user| user_filter(&auth_user, user, organisation_id, role_id))
            .collect();
        Response::Ok(users)
    })
}

#[query]
fn users_whoami() -> Response<User> {
    let p = authenticated_caller();

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
    let p = authenticated_caller();

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

    let roles_result: Result<Vec<Role>, String> = ROLES.with(|roles_map| {
        let roles_map = roles_map.borrow();
        let mut roles = Vec::new();
        for role_id in user.roles {
            match roles_map.get(&role_id) {
                Some(role) => roles.push(role.clone()),
                None => return Err(format!("Role with id {} not found.", role_id)),
            }
        }
        Ok(roles)
    });

    if roles_result.is_err() {
        return Response::Err(roles_result.unwrap_err());
    }

    let inserted = User {
        principal_id: p.to_string(),
        name: user.name.clone(),
        email: user.email.clone(),
        organisation_id: user.organisation_id,
        roles: roles_result.unwrap(),
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
    let p = authenticated_caller();
    let user = authenticated_user(p);

    if user.is_none() {
        return Response::Err(format!("User with principal {} not found.", p));
    }

    let user = user.unwrap();

    fn f(user: &User, badge: &Badge, organisation_id: Option<u128>) -> bool {
        if !user.has_badge_access(badge) {
            return false;
        }

        match organisation_id {
            Some(organisation_id) => badge.issuer.id == organisation_id,
            None => true,
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
    let p = authenticated_caller();
    let user = authenticated_user(p);

    if user.is_none() {
        return Response::Err(format!("User with principal {} not found.", p));
    }

    let user = user.unwrap();

    BADGES.with(|badges| match badges.borrow().get(&badge_id) {
        Some(badge) => {
            if !user.has_badge_access(badge) {
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
    let p = authenticated_caller();
    let user = authenticated_user(p);

    if user.is_none() {
        return Response::Err(format!("User with principal {} not found.", p));
    }

    let user = user.unwrap();

    if user.is_student() {
        return Response::Err(String::from("Students cannot revoke badges."));
    }

    BADGES.with(|badges| match badges.borrow_mut().get_mut(&badge_id) {
        Some(badge) => {
            if !user.has_badge_access(badge) {
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
    let p = authenticated_caller();
    let user = authenticated_user(p);

    if user.is_none() {
        return Response::Err(format!("User with principal {} not found.", p));
    }

    let user = user.unwrap();
    let is_lecturer = user.is_lecturer();

    if !user.is_admin() && !is_lecturer {
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

    BADGES.with(|badges| {
        let mut badges = badges.borrow_mut();

        let new_badge = Badge {
            id: badges.len() as u128 + 1,
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
        badges.insert(new_badge.id, new_badge.clone());
        Response::Ok(new_badge)
    })
}

#[query]
fn roles_get_all() -> Response<Vec<Role>> {
    ROLES.with(|roles| Response::Ok(roles.borrow().values().cloned().collect()))
}

#[pre_upgrade]
fn pre_upgrade() {
    // Create an instance of stable data and persist it in stable memory
    let stable_data = StableData {
        principals: PRINCIPALS.with(|it| it.borrow().clone()),
        badges: BADGES.with(|it| it.borrow().clone()),
    };

    storage::stable_save((stable_data,)).expect("Could not save stable data.");
}

#[post_upgrade]
fn post_upgrade() {
    util::generate_organisations();
    util::generate_roles();

    // Load the stable data that was saved in pre_upgrade
    let (stable_data,): (StableData,) =
        storage::stable_restore().expect("Could not restore stable data.");

    // Load the stable data into the new data structures
    PRINCIPALS.with(|principals| {
        let mut principals = principals.borrow_mut();
        for (p, user) in stable_data.principals {
            principals.insert(p, user);
        }
    });

    BADGES.with(|badges| {
        let mut badges = badges.borrow_mut();
        for (id, badge) in stable_data.badges {
            badges.insert(id, badge);
        }
    });
}

#[init]
fn init() {
    util::generate_organisations();
    util::generate_roles();
}
