"""base schema

Revision ID: 0001_base_schema
Revises:
Create Date: 2026-06-30 00:00:00
"""

from alembic import op
import sqlalchemy as sa


revision = "0001_base_schema"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "services",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("hostname", sa.String(), nullable=True),
        sa.Column("process_name", sa.String(), nullable=True),
        sa.Column("status", sa.String(), nullable=False, server_default=sa.text("'unknown'")),
        sa.Column("last_seen_at", sa.DateTime(timezone=True), nullable=True, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name", name="uq_services_name"),
    )
    op.create_index(op.f("ix_services_id"), "services", ["id"], unique=False)
    op.create_index(op.f("ix_services_name"), "services", ["name"], unique=False)
    op.create_index(op.f("ix_services_hostname"), "services", ["hostname"], unique=False)

    op.create_table(
        "metrics",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("service_name", sa.String(), nullable=False),
        sa.Column("cpu", sa.Float(), nullable=False),
        sa.Column("memory", sa.Float(), nullable=False),
        sa.Column("disk", sa.Float(), nullable=True),
        sa.Column("network_sent", sa.Float(), nullable=True),
        sa.Column("network_recv", sa.Float(), nullable=True),
        sa.Column("load_average", sa.Float(), nullable=True),
        sa.Column("uptime", sa.Float(), nullable=True),
        sa.Column("hostname", sa.String(), nullable=True),
        sa.Column("operating_system", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_metrics_id"), "metrics", ["id"], unique=False)

    op.create_table(
        "incidents",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("service_id", sa.Integer(), nullable=True),
        sa.Column("service_name", sa.String(), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("severity", sa.String(), nullable=False),
        sa.Column("status", sa.String(), nullable=False, server_default=sa.text("'open'")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["service_id"], ["services.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_incidents_id"), "incidents", ["id"], unique=False)
    op.create_index(op.f("ix_incidents_service_id"), "incidents", ["service_id"], unique=False)
    op.create_index(op.f("ix_incidents_service_name"), "incidents", ["service_name"], unique=False)
    op.create_index(op.f("ix_incidents_status"), "incidents", ["status"], unique=False)

    op.create_table(
        "logs",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("service_name", sa.String(), nullable=False),
        sa.Column("hostname", sa.String(), nullable=True),
        sa.Column("level", sa.String(), nullable=False),
        sa.Column("message", sa.String(), nullable=False),
        sa.Column("source", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_logs_id"), "logs", ["id"], unique=False)
    op.create_index(op.f("ix_logs_service_name"), "logs", ["service_name"], unique=False)
    op.create_index(op.f("ix_logs_hostname"), "logs", ["hostname"], unique=False)
    op.create_index(op.f("ix_logs_level"), "logs", ["level"], unique=False)
    op.create_index(op.f("ix_logs_created_at"), "logs", ["created_at"], unique=False)

    op.create_table(
        "analysis_reports",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("service_name", sa.String(), nullable=False),
        sa.Column("hostname", sa.String(), nullable=True),
        sa.Column("risk_level", sa.String(), nullable=False),
        sa.Column("risk_score", sa.Integer(), nullable=False),
        sa.Column("summary", sa.String(), nullable=False),
        sa.Column("recommendation", sa.String(), nullable=False),
        sa.Column("predicted_failure", sa.String(), nullable=True),
        sa.Column("likely_failure_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("time_to_failure", sa.String(), nullable=True),
        sa.Column("prevention_steps", sa.String(), nullable=True),
        sa.Column("notification_target", sa.String(), nullable=True),
        sa.Column("notification_sent", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("notification_error", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_analysis_reports_id"), "analysis_reports", ["id"], unique=False)
    op.create_index(op.f("ix_analysis_reports_service_name"), "analysis_reports", ["service_name"], unique=False)
    op.create_index(op.f("ix_analysis_reports_hostname"), "analysis_reports", ["hostname"], unique=False)
    op.create_index(op.f("ix_analysis_reports_risk_level"), "analysis_reports", ["risk_level"], unique=False)
    op.create_index(op.f("ix_analysis_reports_created_at"), "analysis_reports", ["created_at"], unique=False)


def downgrade():
    op.drop_table("analysis_reports")
    op.drop_table("logs")
    op.drop_table("incidents")
    op.drop_table("metrics")
    op.drop_table("services")
