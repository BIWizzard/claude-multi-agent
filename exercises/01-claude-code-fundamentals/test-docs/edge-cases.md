# Edge Case Testing Document

This document tests various edge cases for role-based filtering.

## Unmarked Section

This section has no role assignments at all - it should be invisible to role-based filters but visible to everyone in general viewing.

### Nested Unmarked Section

This is a subsection with no role markings either.

## Explicitly Both Roles [roles: coordinator, executor]

This section is explicitly marked for both coordinator and executor roles.

### Mixed Role Content [role: coordinator]

This section starts as coordinator-only.

<!-- roles: coordinator, executor -->
But this comment adds executor access too, so now both roles should see it.

## Only Coordinator Section [role: coordinator]

This section is only for coordinators.

### Coordinator Subsection

This subsection inherits no roles from parent (should be unmarked).

## Only Executor Section [role: executor]

This section is only for executors.

### Executor Subsection [role: executor]

This subsection is explicitly marked for executors.

## Multiple Role Markings [role: coordinator] [role: executor]

Testing multiple role tags in the same header.

## Comment-Only Role Assignment

This section has no header role marking.

<!-- role: coordinator -->
But this comment assigns it to coordinator role.

<!-- role: executor -->
And this comment also assigns it to executor role.

## Complex Mixed Scenarios

General section with no initial role assignment.

### Strategic Planning [role: coordinator]

Coordinator-specific subsection.

### Technical Implementation [role: executor]

Executor-specific subsection.

### Shared Workflow [roles: coordinator, executor]

Subsection for both roles.

### Unassigned Workflow

Subsection with no role assignment.

## Empty Role Assignment [roles: ]

Testing what happens with empty role assignment.

## Invalid Role Assignment [role: invalidrole]

Testing with a role that's not coordinator or executor.

## Case Sensitivity Test [role: COORDINATOR] [role: Executor]

Testing if role matching is case-insensitive.