"""add Clerk organizations and machine-scoped telemetry

Revision ID: 0003_add_organizations_and_machines
Revises: 0002_add_users_and_scope_by_user
Create Date: 2026-09-05 00:00:00
"""

from alembic import op
import sqlalchemy as sa


revision = "0003_add_organizations_and_machines"
down_revision = "0002_add_users_and_scope_by_user"
branch_labels = None
depends_on = None


TELEMETRY_TABLES = ["metrics", "services", "logs", "analysis_reports", "incidents"]


def upgrade():
    op.create_table(
        "organizations",
        sa.Column("id", sa.String(length=255), primary_key=True, nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
    )

    op.create_table(
        "machines",
        sa.Column("id", sa.Uuid(), primary_key=True, nullable=False),
        sa.Column("org_id", sa.String(length=255), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("hostname", sa.String(), nullable=False),
        sa.Column("machine_code_hash", sa.String(length=128), nullable=False),
        sa.Column("code_prefix", sa.String(length=32), nullable=False),
        sa.Column("status", sa.String(length=16), nullable=False, server_default=sa.text("'pending'")),
        sa.Column("created_by_user_id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("last_seen_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["org_id"], ["organizations.id"]),
        sa.ForeignKeyConstraint(["created_by_user_id"], ["users.id"]),
        sa.UniqueConstraint("machine_code_hash", name="uq_machines_machine_code_hash"),
        sa.CheckConstraint("status IN ('pending', 'active', 'revoked')", name="ck_machines_status"),
    )
    op.create_index("ix_machines_org_id", "machines", ["org_id"])
    op.create_index("ix_machines_machine_code_hash", "machines", ["machine_code_hash"])
    op.create_index("ix_machines_code_prefix", "machines", ["code_prefix"])
    op.create_index("ix_machines_status", "machines", ["status"])

    with op.batch_alter_table("users") as batch_op:
        batch_op.add_column(sa.Column("clerk_user_id", sa.String(length=255), nullable=True))
        batch_op.add_column(sa.Column("default_organization_id", sa.String(length=255), nullable=True))
        batch_op.create_foreign_key(
            "fk_users_default_organization_id_organizations",
            "organizations",
            ["default_organization_id"],
            ["id"],
        )
        batch_op.create_unique_constraint("uq_users_clerk_user_id", ["clerk_user_id"])

    op.create_index("ix_users_clerk_user_id", "users", ["clerk_user_id"])
    op.create_index("ix_users_default_organization_id", "users", ["default_organization_id"])

    for table_name in TELEMETRY_TABLES:
        with op.batch_alter_table(table_name) as batch_op:
            batch_op.add_column(sa.Column("org_id", sa.String(length=255), nullable=False))
            batch_op.add_column(sa.Column("machine_id", sa.Uuid(), nullable=False))
            batch_op.create_foreign_key(
                f"fk_{table_name}_org_id_organizations",
                "organizations",
                ["org_id"],
                ["id"],
            )
            batch_op.create_foreign_key(
                f"fk_{table_name}_machine_id_machines",
                "machines",
                ["machine_id"],
                ["id"],
            )

        op.create_index(f"ix_{table_name}_org_id", table_name, ["org_id"])
        op.create_index(f"ix_{table_name}_machine_id", table_name, ["machine_id"])
        op.create_index(
            f"ix_{table_name}_org_machine_created_at",
            table_name,
            ["org_id", "machine_id", "created_at"],
        )


def downgrade():
    for table_name in reversed(TELEMETRY_TABLES):
        op.drop_index(f"ix_{table_name}_org_machine_created_at", table_name=table_name)
        op.drop_index(f"ix_{table_name}_machine_id", table_name=table_name)
        op.drop_index(f"ix_{table_name}_org_id", table_name=table_name)
        with op.batch_alter_table(table_name) as batch_op:
            batch_op.drop_constraint(f"fk_{table_name}_machine_id_machines", type_="foreignkey")
            batch_op.drop_constraint(f"fk_{table_name}_org_id_organizations", type_="foreignkey")
            batch_op.drop_column("machine_id")
            batch_op.drop_column("org_id")

    op.drop_index("ix_users_default_organization_id", table_name="users")
    op.drop_index("ix_users_clerk_user_id", table_name="users")
    with op.batch_alter_table("users") as batch_op:
        batch_op.drop_constraint("uq_users_clerk_user_id", type_="unique")
        batch_op.drop_constraint("fk_users_default_organization_id_organizations", type_="foreignkey")
        batch_op.drop_column("default_organization_id")
        batch_op.drop_column("clerk_user_id")

    op.drop_index("ix_machines_status", table_name="machines")
    op.drop_index("ix_machines_code_prefix", table_name="machines")
    op.drop_index("ix_machines_machine_code_hash", table_name="machines")
    op.drop_index("ix_machines_org_id", table_name="machines")
    op.drop_table("machines")
    op.drop_table("organizations")
