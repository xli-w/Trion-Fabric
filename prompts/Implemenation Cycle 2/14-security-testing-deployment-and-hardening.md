# Stage 14 — Security, Testing, Deployment and Production Hardening

## Objective

Make the platform dependable enough for serious internal consulting work and eventual controlled client use.

This stage should consolidate and harden the existing application rather than introduce large new features.

## Security

Implement or review:

- Authentication.
- Role-based access.
- Engagement-level permissions.
- Client and site data isolation.
- Secure file references.
- Input validation.
- Output visibility enforcement.
- AI context access controls.
- Secrets management.
- Secure error handling.
- Audit logging.

Test that a user cannot access information merely by changing an identifier in a URL or API request.

## Data integrity

Review:

- Referential integrity.
- Required fields.
- Status transitions.
- Approval transitions.
- Versioning.
- Deletion and archival behaviour.
- Duplicate records.
- Invalid relationships.
- Promotion from preliminary site walk to diagnostic.

Prefer archival or soft deletion for important engagement records where appropriate.

## Testing

Add tests for:

- Domain models.
- Validation.
- Permission rules.
- Visibility rules.
- Engagement promotion.
- Methodology progression.
- Maturity score completeness.
- Opportunity priority logic.
- Output approval.
- Approved-data filtering.
- AI response validation.
- Benefits expected-versus-actual separation.

Add end-to-end tests for the critical workflow:

Client → Site → Preliminary Site Walk → Diagnostic → Opportunity → Roadmap → Approved Output

## Reliability and UX quality

Review every major workflow for:

- Loading states.
- Empty states.
- Error states.
- Retry behaviour.
- Unsaved changes.
- Form validation.
- Accessible controls.
- Keyboard navigation where practical.
- Responsive layouts.
- Clear destructive-action confirmation.

## Deployment

Establish:

- Development environment.
- Test/staging environment.
- Production environment.
- Environment configuration.
- Database migrations.
- Seed data strategy.
- CI checks.
- Build process.
- Deployment process.
- Backup and recovery approach.
- Monitoring and error reporting.

Do not hard-code secrets or environment-specific URLs.

## Production-readiness review

Produce a practical review covering:

- What is ready.
- What is incomplete.
- Known risks.
- Security limitations.
- Data migration considerations.
- AI limitations.
- Recommended next improvements.

## Acceptance criteria

- Critical permissions and visibility rules are tested.
- The core workflow passes end-to-end checks.
- Deployment is repeatable.
- Errors are handled clearly.
- No secrets are committed.
- The platform is stable enough for controlled internal use.
