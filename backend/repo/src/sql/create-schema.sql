DROP SCHEMA IF EXISTS dbo CASCADE;
CREATE SCHEMA IF NOT EXISTS dbo;

CREATE TABLE dbo.roles
(
    id                      SERIAL             PRIMARY KEY,
    name                    VARCHAR(255)       UNIQUE NOT NULL
);

CREATE TABLE dbo.users
(
    id                      SERIAL             PRIMARY KEY,
    name                    VARCHAR(255)       NOT NULL,
    email                   VARCHAR(255)       UNIQUE NOT NULL,
    password_validation     VARCHAR(255)       NOT NULL,
    roles                   INT[]              NOT NULL
);

create table dbo.Tokens
(
    token_validation VARCHAR(256) primary key,
    user_id          int references dbo.Users (id),
    created_at       bigint not null,
    last_used_at     bigint not null
);


CREATE TYPE dbo.report_status AS ENUM ('SUBMITTED', 'APPROVED', 'REJECTED', 'EDITING');

CREATE TABLE dbo.intervenor(
    id                      SERIAL             PRIMARY KEY,
    idNumber                VARCHAR(255)       UNIQUE NOT NULL,
    id_type                 VARCHAR(255)       NOT NULL,
    name                    VARCHAR(255)       NOT NULL,
    contact_info            VARCHAR(255)       UNIQUE NOT NULL,
    address                 VARCHAR(255)       NOT NULL
);

CREATE TYPE dbo.occurrence_type AS ENUM ('NORMAL','URGENT','CRITICAL');

CREATE TABLE dbo.occurrence
(
    id                      SERIAL               PRIMARY KEY,
    initDate                DATE                 NOT NULL,
    endDate                 DATE                 NOT NULL,
    reporter_id             INT[]                ,
    importance              dbo.occurrence_type  NOT NULL DEFAULT 'NORMAL'
);

CREATE TABLE dbo.report
(
    id                      SERIAL             PRIMARY KEY,
    creator_id              INT                REFERENCES dbo.users (id) ON DELETE CASCADE,
    occurrence_id           INT                REFERENCES dbo.occurrence (id) ON DELETE CASCADE,
    title                   VARCHAR(255)       NOT NULL,
    description             TEXT               NOT NULL,
    status                  dbo.report_status  NOT NULL DEFAULT 'EDITING',
    type                    JSONB              NOT NULL,
    addons                  JSONB              NOT NULL,
    created_at              bigint             NOT NULL,
    updated_at              bigint             NOT NULL,
    editors                 INT[]              ,
    intervenors             INT[]
);

CREATE TABLE dbo.report_users(
   report_id                INT                REFERENCES dbo.report(id) ON DELETE CASCADE,
   user_id                  INT                REFERENCES dbo.users(id) ON DELETE CASCADE,
   PRIMARY KEY (report_id, user_id)
);

CREATE TABLE dbo.evidence
(
    id                      SERIAL             PRIMARY KEY,
    type                    JSONB              NOT NULL,
    file_path               VARCHAR(255)       NOT NULL,
    location                VARCHAR(255)       NOT NULL,
    description             TEXT               NOT NULL,
    reporter_id             INT                REFERENCES dbo.users (id) ON DELETE CASCADE,
    report_id               INT                REFERENCES dbo.report (id) ON DELETE CASCADE,
    created_at              bigint             NOT NULL,
    updated_at              bigint             NOT NULL
);

INSERT INTO dbo.roles (name) VALUES ('admin'), ('investigator'), ('supervisor');