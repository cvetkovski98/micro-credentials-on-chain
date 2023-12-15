mod model;
mod util;

use crate::model::{
    Badge, FileLocation, NewBadge, NewOrganisation, NewStudent, Organisation, Response, Role,
    Student,
};
use candid::Principal;
use ic_cdk::api::time;
use ic_cdk::{init, query, update};
use std::cell::RefCell;
use std::collections::BTreeMap;
use util::{caller, next_badge_id, next_organisation_id, next_role_id, next_student_id};

thread_local! {
    // Organizations
    pub static NEXT_ORGANISATION_ID: RefCell<u128> = RefCell::new(0);
    pub static ORGANISATIONS: RefCell<BTreeMap<u128, Organisation>> = RefCell::new(BTreeMap::new());

    // Students
    pub static NEXT_STUDENT_ID: RefCell<u128> = RefCell::new(0);
    pub static STUDENTS: RefCell<BTreeMap<u128, Student>> = RefCell::new(BTreeMap::new());

    // Badges
    pub static NEXT_BADGE_ID: RefCell<u128> = RefCell::new(0);
    pub static STUDENT_BADGES: RefCell<BTreeMap<u128, Vec<Badge>>> = RefCell::new(BTreeMap::new());

    // Roles
    pub static NEXT_ROLE_ID: RefCell<u128> = RefCell::new(0);
    pub static ROLES: RefCell<BTreeMap<u128, Role>> = RefCell::new(BTreeMap::new());
    pub static PRINCIPAL_ROLES: RefCell<BTreeMap<Principal, Role>> = RefCell::new(BTreeMap::new());
}

#[query]
fn whoami() -> String {
    format!("{}", caller())
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
fn students_get_all() -> Response<Vec<Student>> {
    STUDENTS.with(|students| Response::Ok(students.borrow().values().cloned().collect()))
}

#[query]
fn students_get_one(id: u128) -> Response<Student> {
    STUDENTS.with(|students| match students.borrow().get(&id) {
        Some(student) => Response::Ok(student.clone()),
        None => Response::Err(format!("Student with id {} not found.", id)),
    })
}

#[update]
fn students_delete_one(id: u128) -> Response<bool> {
    STUDENTS.with(|students| match students.borrow_mut().remove(&id) {
        Some(_) => Response::Ok(true),
        None => Response::Err(format!("Student with id {} not found.", id)),
    })
}

#[update]
fn students_create_one(student: NewStudent) -> Response<Student> {
    let has_org = ORGANISATIONS.with(|orgs| match orgs.borrow().get(&student.organisation_id) {
        Some(_) => true,
        None => false,
    });

    if !has_org {
        return Response::Err(format!(
            "Organisation with id {} not found.",
            student.organisation_id
        ));
    }

    let id = next_student_id();

    STUDENTS.with(|students| {
        let new_student = Student {
            id: id.clone(),
            name: student.name,
            email: student.email,
            organisation_id: student.organisation_id,
            created_at: time(),
        };

        students.borrow_mut().insert(id, new_student.clone());
        Response::Ok(new_student)
    })
}

#[query]
fn badges_get_all(student_id: u128) -> Response<Vec<Badge>> {
    let has_student = STUDENTS.with(|students| match students.borrow().get(&student_id) {
        Some(_) => true,
        None => false,
    });

    if !has_student {
        return Response::Err(format!("Student with id {} not found.", student_id));
    }

    let badges = STUDENT_BADGES.with(|badges| match badges.borrow().get(&student_id) {
        Some(student_badges) => student_badges.clone(),
        None => vec![],
    });

    return Response::Ok(badges);
}

#[query]
fn badges_get_one(student_id: u128, id: u128) -> Response<Badge> {
    STUDENT_BADGES.with(|badges| match badges.borrow().get(&student_id) {
        Some(student_badges) => match student_badges.iter().find(|b| b.id == id) {
            Some(badge) => Response::Ok(badge.clone()),
            None => Response::Err(format!("Badge with id {} not found.", id)),
        },
        None => Response::Err(format!("Student with id {} not found.", student_id)),
    })
}

#[update]
fn badges_delete_one(student_id: u128, id: u128) -> Response<bool> {
    STUDENT_BADGES.with(|badges| match badges.borrow_mut().get_mut(&student_id) {
        Some(student_badges) => {
            let index = student_badges.iter().position(|b| b.id == id);
            match index {
                Some(index) => {
                    student_badges.remove(index);
                    Response::Ok(true)
                }
                None => Response::Err(format!("Badge with id {} not found.", id)),
            }
        }
        None => Response::Err(format!("Student with id {} not found.", student_id)),
    })
}

#[update]
fn badges_create_one(badge: NewBadge) -> Response<Badge> {
    let has_student = STUDENTS.with(|students| match students.borrow().get(&badge.owner_id) {
        Some(_) => true,
        None => false,
    });

    if !has_student {
        return Response::Err(format!("Student with id {} not found.", badge.owner_id));
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

    STUDENT_BADGES.with(|badges| {
        let mut student_badges = badges.borrow_mut();
        match student_badges.get_mut(&badge.owner_id) {
            Some(student_badges) => student_badges.push(new_badge.clone()),
            None => {
                student_badges.insert(badge.owner_id, vec![new_badge.clone()]);
            }
        }
        Response::Ok(new_badge)
    })
}

#[update]
fn badges_get_qr_code(student_id: u128, id: u128) -> Response<FileLocation> {
    Response::Ok(FileLocation {
        location: String::from(format!("{}-{}.png", student_id, id)),
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

    for i in 1..=9 {
        let student = Student {
            id: next_student_id(),
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
        STUDENTS.with(|students| {
            let mut students = students.borrow_mut();
            students.insert(student.id, student);
        });
    }
}
