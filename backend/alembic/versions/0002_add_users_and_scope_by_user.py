"""add users and user scoping

Revision ID: 0002_add_users_and_scope_by_user
Revises: 0001_base_schema
Create Date: 2026-06-30 00:00:00
"""

from alembic import op
import sqlalchemy as sa


revision = "0002_add_users_and_scope_by_user"
down_revision = "0001_base_schema"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("hashed_password", sa.String(), nullable=False),
        sa.Column("registration_token", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email", name="uq_users_email"),
        sa.UniqueConstraint("registration_token", name="uq_users_registration_token"),
    )
    op.create_index(op.f("ix_users_id"), "users", ["id"], unique=False)
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=False)
    op.create_index(op.f("ix_users_registration_token"), "users", ["registration_token"], unique=False)

    with op.batch_alter_table("services") as batch_op:
        batch_op.add_column(sa.Column("user_id", sa.Integer(), nullable=False))
        batch_op.create_foreign_key("fk_services_user_id_users", "users", ["user_id"], ["id"])
        batch_op.drop_constraint("uq_services_name", type_="unique")
        batch_op.create_unique_constraint(
            "uq_services_user_name_hostname",
            ["user_id", "name", "hostname"],
        )

    with op.batch_alter_table("metrics") as batch_op:
        batch_op.add_column(sa.Column("user_id", sa.Integer(), nullable=False))
        batch_op.create_foreign_key("fk_metrics_user_id_users", "users", ["user_id"], ["id"])

    with op.batch_alter_table("incidents") as batch_op:
        batch_op.add_column(sa.Column("user_id", sa.Integer(), nullable=False))
        batch_op.create_foreign_key("fk_incidents_user_id_users", "users", ["user_id"], ["id"])

    with op.batch_alter_table("logs") as batch_op:
        batch_op.add_column(sa.Column("user_id", sa.Integer(), nullable=False))
        batch_op.create_foreign_key("fk_logs_user_id_users", "users", ["user_id"], ["id"])

    with op.batch_alter_table("analysis_reports") as batch_op:
        batch_op.add_column(sa.Column("user_id", sa.Integer(), nullable=False))
        batch_op.create_foreign_key(
            "fk_analysis_reports_user_id_users",
            "users",
            ["user_id"],
            ["id"],
        )


def downgrade():
    with op.batch_alter_table("analysis_reports") as batch_op:
        batch_op.drop_constraint("fk_analysis_reports_user_id_users", type_="foreignkey")
        batch_op.drop_column("user_id")

    with op.batch_alter_table("logs") as batch_op:
        batch_op.drop_constraint("fk_logs_user_id_users", type_="foreignkey")
        batch_op.drop_column("user_id")

    with op.batch_alter_table("incidents") as batch_op:
        batch_op.drop_constraint("fk_incidents_user_id_users", type_="foreignkey")
        batch_op.drop_column("user_id")

    with op.batch_alter_table("metrics") as batch_op:
        batch_op.drop_constraint("fk_metrics_user_id_users", type_="foreignkey")
        batch_op.drop_column("user_id")

    with op.batch_alter_table("services") as batch_op:
        batch_op.drop_constraint("uq_services_user_name_hostname", type_="unique")
        batch_op.drop_constraint("fk_services_user_id_users", type_="foreignkey")
        batch_op.drop_column("user_id")
        batch_op.create_unique_constraint("uq_services_name", ["name"])

    op.drop_index(op.f("ix_users_registration_token"), table_name="users")
    op.drop_index(op.f("ix_users_email"), table_name="users")
    op.drop_index(op.f("ix_users_id"), table_name="users")
    op.drop_table("users")
