"""Add patient basal fields and patient_*_log tables

Revision ID: 20251112_add_patient_logs_and_basals
Revises: 
Create Date: 2025-11-12 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20251112_add_patient_logs_and_basals'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Añadir columnas basales a la tabla patients
    with op.batch_alter_table('patients') as batch_op:
        batch_op.add_column(sa.Column('height', sa.Float(), nullable=True))
        batch_op.add_column(sa.Column('weight', sa.Float(), nullable=True))
        batch_op.add_column(sa.Column('bmi', sa.Float(), nullable=True))
        batch_op.add_column(sa.Column('smoking_status', sa.String(length=50), nullable=True))
        batch_op.add_column(sa.Column('alcohol_consumption', sa.String(length=50), nullable=True))

    # Crear tabla patient_symptoms_log
    op.create_table(
        'patient_symptoms_log',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('patient_id', sa.Integer(), sa.ForeignKey('patients.id'), nullable=False, index=True),
        sa.Column('symptom_id', sa.Integer(), sa.ForeignKey('symptoms.id'), nullable=False, index=True),
        sa.Column('recorded_at', sa.DateTime(), nullable=False),
        sa.Column('visit_id', sa.String(length=64), nullable=True, index=True),
        sa.Column('diagnosis_id', sa.Integer(), sa.ForeignKey('diagnoses.id'), nullable=True, index=True),
        sa.Column('followup_id', sa.Integer(), sa.ForeignKey('follow_ups.id'), nullable=True, index=True),
        sa.Column('note', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True)
    )

    # Crear tabla patient_signs_log
    op.create_table(
        'patient_signs_log',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('patient_id', sa.Integer(), sa.ForeignKey('patients.id'), nullable=False, index=True),
        sa.Column('sign_id', sa.Integer(), sa.ForeignKey('signs.id'), nullable=False, index=True),
        sa.Column('value_numeric', sa.Float(), nullable=True),
        sa.Column('value_text', sa.String(length=200), nullable=True),
        sa.Column('unit', sa.String(length=50), nullable=True),
        sa.Column('recorded_at', sa.DateTime(), nullable=False),
        sa.Column('visit_id', sa.String(length=64), nullable=True, index=True),
        sa.Column('diagnosis_id', sa.Integer(), sa.ForeignKey('diagnoses.id'), nullable=True, index=True),
        sa.Column('followup_id', sa.Integer(), sa.ForeignKey('follow_ups.id'), nullable=True, index=True),
        sa.Column('note', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True)
    )

    # Crear tabla patient_lab_results_log
    op.create_table(
        'patient_lab_results_log',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('patient_id', sa.Integer(), sa.ForeignKey('patients.id'), nullable=False, index=True),
        sa.Column('lab_test_id', sa.Integer(), sa.ForeignKey('lab_tests.id'), nullable=False, index=True),
        sa.Column('value_numeric', sa.Float(), nullable=True),
        sa.Column('value_text', sa.String(length=200), nullable=True),
        sa.Column('unit', sa.String(length=50), nullable=True),
        sa.Column('recorded_at', sa.DateTime(), nullable=False),
        sa.Column('visit_id', sa.String(length=64), nullable=True, index=True),
        sa.Column('diagnosis_id', sa.Integer(), sa.ForeignKey('diagnoses.id'), nullable=True, index=True),
        sa.Column('followup_id', sa.Integer(), sa.ForeignKey('follow_ups.id'), nullable=True, index=True),
        sa.Column('note', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True)
    )


def downgrade():
    # Eliminar tablas de logs
    op.drop_table('patient_lab_results_log')
    op.drop_table('patient_signs_log')
    op.drop_table('patient_symptoms_log')

    # Eliminar columnas de patients
    with op.batch_alter_table('patients') as batch_op:
        batch_op.drop_column('alcohol_consumption')
        batch_op.drop_column('smoking_status')
        batch_op.drop_column('bmi')
        batch_op.drop_column('weight')
        batch_op.drop_column('height')
