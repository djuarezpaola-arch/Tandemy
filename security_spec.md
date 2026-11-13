# Tandemy Firestore Security Specification

## 1. Data Invariants
1. **PII Isolation**: Email, phone, RFC, and student matrícula reside strictly in `/privateAccounts/{uid}`, readable and writable only by `request.auth.uid == uid`. `/profiles/{uid}` contains only non-PII professional profile fields.
2. **Role Integrity**: A user's `role` (`'student'` or `'pyme'`) is immutable after account creation in both `/profiles/{uid}` and `/privateAccounts/{uid}`.
3. **Project Lifecycle**: Only a registered PyME can create a project (`status: 'open'`). Only the owning PyME can select an applicant and transition `'open' -> 'in_progress'`. A project transitions to `'completed'` only when both `pymeConfirmedComplete` and `studentConfirmedComplete` are `true`. Terminal states (`'completed'`, `'closed'`) are locked against edits.
4. **Application Integrity**: Only a registered student can apply to an existing `'open'` project. Only the project's owning PyME can transition a `'pending'` application to `'accepted'` or `'rejected'`.
5. **Payment Escrow Integrity**: A payment starts as `'pending'`, can be paid by the PyME into `'pending_release'` (or `'released'` if project is already completed), and releases to `'released'` only when the referenced project reaches `'completed'` (verified via `getAfter()`).
6. **Certificate Integrity**: A digital certificate can only be created when the referenced project has reached `'completed'` (verified via `getAfter()`), and is immutable once created.
7. **Review Integrity**: Reviews can only be created by the PyME or selected student of a `'completed'` project, reviewing the other participant, and are immutable.
8. **Notification & Message Isolation**: Users can only read/list notifications addressed to `request.auth.uid`, and can only read/list messages where they are `senderId` or `recipientId` on a project they participate in.

## 2. The "Dirty Dozen" Payloads (All Must Return PERMISSION_DENIED)
1. **Unauthenticated project write**: Anonymous user creates `/projects/p1`.
2. **Role spoofing on project create**: Student user creates `/projects/p1`.
3. **Cross-tenant profile hijack**: User A updates `/profiles/userB`.
4. **PII leak**: User A reads or lists `/privateAccounts/userB`.
5. **Role escalation on profile update**: User A updates `/profiles/userA` changing `role` from `'student'` to `'pyme'`.
6. **Shadow field injection**: User A creates `/projects/p1` with extra ghost field `isFeatured: true`.
7. **ID poisoning**: User A creates `/projects/${'a'.repeat(200)}`.
8. **Application impersonation**: Student A submits `/applications/a1` with `studentId: 'studentB'`.
9. **Self-acceptance**: Student A updates `/applications/a1` changing `status` to `'accepted'`.
10. **Premature payment release**: Student A updates `/payments/pay1` to `'released'` while project is `'in_progress'`.
11. **Premature certificate minting**: Student A creates `/certificates/cert1` for an `'in_progress'` project.
12. **Fake review on open project**: User A creates `/reviews/rev1` referencing an `'open'` project.
