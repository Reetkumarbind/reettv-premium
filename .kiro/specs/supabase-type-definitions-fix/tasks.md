# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Database Operations Type Correctly
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: Scope the property to concrete failing cases - database operations on tables typed as `never`
  - Test that TypeScript type-checks database operations on tables from the schema (profiles, user_preferences, favorites, watch_history, notifications, analytics_events)
  - The test assertions should verify: TypeScript accepts valid table names, provides correct column types, and rejects invalid operations
  - Run test on UNFIXED code (with empty type definitions in src/integrations/supabase/types.ts)
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found: "Argument of type '"profiles"' is not assignable to parameter of type 'never'", "Property 'username' does not exist on type 'never'", etc.
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Non-Database Operations Unchanged
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-database operations (authentication, storage, realtime, functions)
  - Write property-based tests capturing observed type signatures for: `supabase.auth.signUp`, `signIn`, `signOut`, `getSession`, `getUser`, `signInWithOAuth`, `resetPasswordForEmail`, `updateUser`, `onAuthStateChange`
  - Property-based testing generates many test cases for stronger guarantees that authentication types remain unchanged
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.3, 3.4_

- [x] 3. Fix for empty Supabase type definitions

  - [x] 3.1 Verify Supabase project configuration
    - Check `supabase/config.toml` exists and contains project settings
    - Verify database is accessible (remote project or local instance)
    - Confirm migrations have been applied to the database
    - _Bug_Condition: isBugCondition(input) where input.operation IN ['select', 'insert', 'update', 'upsert', 'delete'] AND Database.public.Tables[input.tableName] === never_
    - _Expected_Behavior: TypeScript accepts valid table names and provides correct column types based on actual database schema_
    - _Preservation: Authentication operations, storage operations, and other non-database Supabase client methods must have identical type signatures_
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 3.2 Generate TypeScript types from database schema
    - Run Supabase CLI command: `npx supabase gen types typescript --project-id <project-id> > src/integrations/supabase/types.ts`
    - Alternative for local development: `npx supabase gen types typescript --local > src/integrations/supabase/types.ts`
    - Verify generated file contains proper table definitions (not `[_ in never]: never`)
    - Verify all 6 tables are included: profiles, user_preferences, favorites, watch_history, notifications, analytics_events
    - Verify type helper utilities are preserved: Tables<T>, TablesInsert<T>, TablesUpdate<T>, Enums<T>, CompositeTypes<T>
    - _Bug_Condition: isBugCondition(input) where tableExistsInSchema(input.tableName) === true but Database.public.Tables[input.tableName] === never_
    - _Expected_Behavior: expectedBehavior(result) where result.hasNoTypeErrors === true AND result.typesMatchSchema === true_
    - _Preservation: Preserve all non-database operation types from Preservation Requirements_
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 3.1, 3.2, 3.3, 3.4_

  - [x] 3.3 Verify TypeScript compilation succeeds
    - Run TypeScript compiler on src/services/authService.ts
    - Verify all 14 type errors are resolved
    - Verify no new type errors are introduced
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

  - [x] 3.4 Add type generation to development workflow
    - Add npm script: `"types:generate": "supabase gen types typescript --local > src/integrations/supabase/types.ts"`
    - Document type generation process in README or development documentation
    - _Requirements: 1.3_

  - [x] 3.5 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Database Operations Type Correctly
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

  - [x] 3.6 Verify preservation tests still pass
    - **Property 2: Preservation** - Non-Database Operations Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all authentication operation types remain unchanged after fix (no regressions)
    - _Requirements: 3.1, 3.3, 3.4_

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
