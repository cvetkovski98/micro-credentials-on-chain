use candid::CandidType;
use serde::{Deserialize, Serialize};

use crate::{BadgesMap, UsersMap, ADMINISTRATOR_ROLE_ID, LECTURER_ROLE_ID, STUDENT_ROLE_ID};

#[derive(Debug, Clone, CandidType, Serialize, Deserialize)]
pub enum Response<T> {
    #[serde(rename = "ok")]
    Ok(T),

    #[serde(rename = "error")]
    Err(String),
}

#[derive(Debug, Clone, CandidType, Serialize, Deserialize)]
pub struct Claim {
    pub key: String,

    pub value: String,
}

#[derive(Debug, Clone, CandidType, Serialize, Deserialize)]
pub struct Badge {
    #[serde(rename = "badgeID")]
    pub id: u128,

    pub title: String,

    pub description: Option<String>,

    #[serde(rename = "badgeType")]
    pub badge_type: u16,

    #[serde(rename = "issuer")]
    pub issuer: Organisation,

    #[serde(rename = "owner")]
    pub owner: User,

    #[serde(rename = "isRevoked")]
    pub is_revoked: bool,

    pub claims: Vec<Claim>,

    #[serde(rename = "signedBy")]
    pub signed_by: Vec<String>,

    #[serde(rename = "createdAt")]
    pub created_at: u64,
}

#[derive(Debug, Clone, CandidType, Serialize, Deserialize)]
pub struct NewBadge {
    pub title: String,

    pub description: Option<String>,

    #[serde(rename = "badgeType")]
    pub badge_type: u16,

    #[serde(rename = "issuerID")]
    pub issuer_id: u128,

    #[serde(rename = "ownerID")]
    pub owner_id: String,

    pub claims: Vec<Claim>,
}

#[derive(Debug, Clone, CandidType, Serialize, Deserialize)]
pub struct Organisation {
    #[serde(rename = "organisationID")]
    pub id: u128,

    pub name: String,

    #[serde(rename = "createdAt")]
    pub created_at: u64,
}

#[derive(Debug, Clone, CandidType, Serialize, Deserialize)]
pub struct User {
    pub name: String,

    pub email: String,

    #[serde(rename = "principalID")]
    pub principal_id: String,

    #[serde(rename = "organisation")]
    pub organisation: Organisation,

    #[serde(rename = "createdAt")]
    pub created_at: u64,

    pub roles: Vec<Role>,
}

impl User {
    pub fn has_role(&self, role_id: u128) -> bool {
        self.roles.iter().any(|r| r.id == role_id)
    }

    pub fn is_admin(&self) -> bool {
        self.has_role(ADMINISTRATOR_ROLE_ID)
    }

    pub fn is_lecturer(&self) -> bool {
        self.has_role(LECTURER_ROLE_ID)
    }

    pub fn is_student(&self) -> bool {
        self.has_role(STUDENT_ROLE_ID)
    }

    /// Checks if the user has access to the badge.
    /// If the user is an administrator, they have access to all badges.
    /// If the user is a lecturer, they have access to all badges issued by their organisation.
    /// If the user is a student, they have access to all badges they own.
    pub fn has_badge_access(&self, badge: &Badge) -> bool {
        self.is_admin()
            || (self.is_lecturer() && self.organisation.id == badge.issuer.id)
            || (self.is_student() && self.principal_id == badge.owner.principal_id)
    }

    /// Checks if the user has access to the user.
    /// If the user is an administrator, they have access to all users.
    /// If the user is a lecturer, they have access to all users from their organisation and all students.
    /// If the user is a student, they have access to all users they own.
    pub fn has_user_access(&self, other_user: &User) -> bool {
        self.is_admin()
            || (self.is_lecturer()
                && (self.organisation.id == other_user.organisation.id || other_user.is_student()))
            || (self.is_student() && self.principal_id == other_user.principal_id)
    }
}

#[derive(Debug, Clone, CandidType, Serialize, Deserialize)]
pub struct NewUser {
    pub name: String,

    pub email: String,

    #[serde(rename = "organisationID")]
    pub organisation_id: u128,

    pub roles: Vec<u128>,
}

#[derive(Debug, Clone, CandidType, Serialize, Deserialize)]
pub struct FileLocation {
    pub location: String,
}

#[derive(Debug, Clone, CandidType, Serialize, Deserialize)]
pub struct Role {
    #[serde(rename = "roleID")]
    pub id: u128,

    pub name: String,
}

#[derive(CandidType, Serialize, Deserialize)]
pub struct StableData {
    pub principals: UsersMap,

    pub badges: BadgesMap,
}
