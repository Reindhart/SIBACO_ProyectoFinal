"""Add deleted_at to all tables

Revision ID: 5c6451f0cc9b
Revises: 
Create Date: 2025-11-09 12:47:59.053505

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '5c6451f0cc9b'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Add deleted_at column to all tables
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.add_column(sa.Column('deleted_at', sa.DateTime(), nullable=True))
    
    with op.batch_alter_table('patients', schema=None) as batch_op:
        batch_op.add_column(sa.Column('deleted_at', sa.DateTime(), nullable=True))
    
    with op.batch_alter_table('diseases', schema=None) as batch_op:
        batch_op.add_column(sa.Column('deleted_at', sa.DateTime(), nullable=True))
    
    with op.batch_alter_table('symptoms', schema=None) as batch_op:
        batch_op.add_column(sa.Column('deleted_at', sa.DateTime(), nullable=True))
    
    with op.batch_alter_table('signs', schema=None) as batch_op:
        batch_op.add_column(sa.Column('deleted_at', sa.DateTime(), nullable=True))
    
    with op.batch_alter_table('lab_tests', schema=None) as batch_op:
        batch_op.add_column(sa.Column('deleted_at', sa.DateTime(), nullable=True))
    
    with op.batch_alter_table('postmortem_tests', schema=None) as batch_op:
        batch_op.add_column(sa.Column('deleted_at', sa.DateTime(), nullable=True))
    
    with op.batch_alter_table('diagnoses', schema=None) as batch_op:
        batch_op.add_column(sa.Column('deleted_at', sa.DateTime(), nullable=True))
    
    with op.batch_alter_table('follow_ups', schema=None) as batch_op:
        batch_op.add_column(sa.Column('deleted_at', sa.DateTime(), nullable=True))


def downgrade():
    # Remove deleted_at column from all tables
    with op.batch_alter_table('follow_ups', schema=None) as batch_op:
        batch_op.drop_column('deleted_at')
    
    with op.batch_alter_table('diagnoses', schema=None) as batch_op:
        batch_op.drop_column('deleted_at')
    
    with op.batch_alter_table('postmortem_tests', schema=None) as batch_op:
        batch_op.drop_column('deleted_at')
    
    with op.batch_alter_table('lab_tests', schema=None) as batch_op:
        batch_op.drop_column('deleted_at')
    
    with op.batch_alter_table('signs', schema=None) as batch_op:
        batch_op.drop_column('deleted_at')
    
    with op.batch_alter_table('symptoms', schema=None) as batch_op:
        batch_op.drop_column('deleted_at')
    
    with op.batch_alter_table('diseases', schema=None) as batch_op:
        batch_op.drop_column('deleted_at')
    
    with op.batch_alter_table('patients', schema=None) as batch_op:
        batch_op.drop_column('deleted_at')
    
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_column('deleted_at')
