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
    invitation_code         VARCHAR(255)       DEFAULT NULL,
    role_id                 INT                REFERENCES dbo.roles (id) ON DELETE SET NULL
);

CREATE TYPE dbo.report_status AS ENUM ('submetido', 'aprovado', 'rejeitado', 'em edição');

CREATE TABLE dbo.intervenor(
    id                      SERIAL             PRIMARY KEY,
    idNumber                VARCHAR(255)       UNIQUE NOT NULL,
    id_type                 VARCHAR(255)       NOT NULL,
    name                    VARCHAR(255)       NOT NULL,
    contact_info            VARCHAR(255)       UNIQUE NOT NULL,
    address                 VARCHAR(255)       NOT NULL
);

CREATE TABLE dbo.report
(
    id                      SERIAL             PRIMARY KEY,
    creator_id              INT                REFERENCES dbo.users (id) ON DELETE CASCADE,
    title                   VARCHAR(255)       NOT NULL,
    description             TEXT               NOT NULL,
    status                  report_status      NOT NULL DEFAULT 'em edição',
    type                    JSONB              NOT NULL,
    addons                  JSONB              NOT NULL,
    created_at              TIMESTAMP          NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP          NOT NULL DEFAULT CURRENT_TIMESTAMP
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
    created_at              TIMESTAMP          NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP          NOT NULL DEFAULT CURRENT_TIMESTAMP
);