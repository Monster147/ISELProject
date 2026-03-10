DROP SCHEMA IF EXISTS dbo CASCADE;
CREATE SCHEMA IF NOT EXISTS dbo;

CREATE TYPE dbo.user_role AS ENUM ('averiguador', 'seguradora');

CREATE TABLE dbo.users
(
    id                      SERIAL             PRIMARY KEY,
    name                    VARCHAR(255)       NOT NULL,
    email                   VARCHAR(255)       UNIQUE NOT NULL,
    password_validation     VARCHAR(255)       NOT NULL,
    invitation_code         VARCHAR(255)       DEFAULT NULL,
    role                    user_role       NOT NULL
);

CREATE TYPE dbo.report_status AS ENUM ('submetido', 'aprovado', 'rejeitado', 'em edição');
CREATE TYPE dbo.report_type AS ENUM ('automóvel', 'patrimonial', 'saúde', 'trabalho', 'natural');

CREATE TABLE dbo.report_users(
    report_id INT REFERENCES dbo.report(id) ON DELETE CASCADE,
    user_id INT REFERENCES dbo.users(id) ON DELETE CASCADE,
    PRIMARY KEY (report_id, user_id)
);

CREATE TABLE dbo.report
(
    id                      SERIAL             PRIMARY KEY,
    creator_id              INT                REFERENCES dbo.users (id) ON DELETE CASCADE,
    title                   VARCHAR(255)       NOT NULL,
    description             TEXT               NOT NULL,
    status                  report_status      NOT NULL DEFAULT 'em edição',
    type                    report_type        NOT NULL,
    created_at              TIMESTAMP          NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP          NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE dbo.evidence_type AS ENUM ('foto', 'documento', 'vídeo', 'áudio', 'declaração');
CREATE TABLE dbo.evidence
(
    id                      SERIAL             PRIMARY KEY,
    type                    evidence_type      NOT NULL,
    reporter_id             INT                REFERENCES dbo.users (id) ON DELETE CASCADE,
    report_id               INT                REFERENCES dbo.report (id) ON DELETE CASCADE,
    created_at              TIMESTAMP          NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP          NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE dbo.photo_evidence(
    evidence_id            INT                PRIMARY KEY REFERENCES dbo.evidence (id) ON DELETE CASCADE,
    file_path              VARCHAR(255)       NOT NULL,
    description            TEXT               NOT NULL,
    taken_at               TIMESTAMP          NOT NULL,
    location               VARCHAR(255)       NOT NULL
);

CREATE TABLE dbo.document_evidence(
    evidence_id            INT                PRIMARY KEY REFERENCES dbo.evidence (id) ON DELETE CASCADE,
    file_path              VARCHAR(255)       NOT NULL,
    description            TEXT               NOT NULL,
    created_at             TIMESTAMP          NOT NULL
);

CREATE TABLE dbo.video_evidence(
    evidence_id            INT                PRIMARY KEY REFERENCES dbo.evidence (id) ON DELETE CASCADE,
    file_path              VARCHAR(255)       NOT NULL,
    description            TEXT               NOT NULL,
    taken_at               TIMESTAMP          NOT NULL,
    location               VARCHAR(255)       NOT NULL
    --duration ???
);

CREATE TABLE dbo.audio_evidence(
    evidence_id            INT                PRIMARY KEY REFERENCES dbo.evidence (id) ON DELETE CASCADE,
    file_path              VARCHAR(255)       NOT NULL,
    description            TEXT               NOT NULL,
    taken_at               TIMESTAMP          NOT NULL,
    location               VARCHAR(255)       NOT NULL
    --duration??
);

CREATE TABLE dbo.statement_evidence(
    evidence_id            INT                PRIMARY KEY REFERENCES dbo.evidence (id) ON DELETE CASCADE,
    witness_name           VARCHAR(255)       NOT NULL,
    witness_contact        VARCHAR(255)       NOT NULL,
    statement              TEXT               NOT NULL,
    created_at             TIMESTAMP          NOT NULL
);