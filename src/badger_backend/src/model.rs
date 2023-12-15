use candid::CandidType;
use serde::{Deserialize, Serialize};

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

    #[serde(rename = "issuerID")]
    pub issuer_id: u128,

    #[serde(rename = "ownerID")]
    pub owner_id: u128,

    pub claims: Vec<Claim>,

    #[serde(rename = "signedBy")]
    pub signed_by: Vec<u128>,

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
    pub owner_id: u128,

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
pub struct NewOrganisation {
    pub name: String,
}

#[derive(Debug, Clone, CandidType, Serialize, Deserialize)]
pub struct User {
    #[serde(rename = "userID")]
    pub id: u128,

    #[serde(rename = "principalID")]
    pub principal_id: String,

    pub name: String,

    pub email: String,

    #[serde(rename = "organisationID")]
    pub organisation_id: u128,

    #[serde(rename = "createdAt")]
    pub created_at: u64,
}

#[derive(Debug, Clone, CandidType, Serialize, Deserialize)]
pub struct NewUser {
    pub name: String,

    pub email: String,

    #[serde(rename = "organisationID")]
    pub organisation_id: u128,
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
