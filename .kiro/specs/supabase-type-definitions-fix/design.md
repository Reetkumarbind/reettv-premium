# Supabase Type Definitions Bugfix Design

## Overview

The Supabase TypeScript client is generating 14 type errors because the database type definitions in `src/integrations/supabase/types.ts` are empty placeholders. All tables are defined as `never`, preventing TypeScript from recognizing valid database operations on tables like `profiles` and `user_preferences`. The database schema exists and is properly defined in `supabase/migrations/20260309_init_schema.sql`, but the TypeScript types have not been generated from it. The fix requires running the Supabase CLI to generate proper type definitions from the actual database schema, replacing the empty placeholder types with accurate TypeScript interfaces that match the SQL schema.

## Glossary

- **Bug_Condition (C)**: The condition that triggers type errors - when TypeScript encounters database operations on tables that are typed as `never`
- **Property (P)**: The desired behavior - TypeScript should recognize valid table names and their column types based on the actual database schema
- **Preservation**: Existing authentication operations and the overall Supabase client interface that must remain unchanged
- **Database Type Generation**: The process of using Supabase CLI to introspect the database schema and generate TypeScript type definitions
- **`supabase gen types typescript`**: The Supabase CLI command that connects to a database and generates TypeScript types from its schema
- **Empty Type Definitions**: The current state where `Tables`, `Views`, `Functions`, `Enums`, and `CompositeTypes` are all defined as `[_ in never]: never`

## Bug Details

### Bug Condition

The bug manifests when TypeScript type-checks any code that uses the Supabase client to perform database operations (select, insert, update, upsert) on tables that exist in the database schema but are typed as `never` in the type definitions file. The type system rejects these operations because the empty type definitions tell TypeScript that no tables exist.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type SupabaseDatabaseOperation
  OUTPUT: boolean
  
  RETURN input.operation IN ['select', 'insert', 'update', 'upsert', 'delete']
         AND input.tableName IN ['profiles', 'user_preferences', 'favorites', 'watch_history', 'notifications', 'analytics_events']
         AND Database.public.Tables[input.tableName] === never
         AND tableExistsInSchema(input.tableName) === true
END FUNCTION
```

### Examples

- **Query profiles table**: `supabase.from('profiles').select('username')` → TypeScript error: "Argument of type '"profiles"' is not assignable to parameter of type 'never'"
- **Access query result property**: `existingProfile.username` → TypeScript error: "Property 'username' does not exist on type 'never'"
- **Upsert into profiles**: `supabase.from('profiles').upsert({ id: '...', email: '...', username: '...' })` → TypeScript error: "Argument of type '{ id: string; email: string; username: string; }' is not assignable to parameter of type 'never'"
- **Insert into user_preferences**: `supabase.from('user_preferences').insert({ user_id: '...' })` → TypeScript error: "Argument of type '{ user_id: string; }' is not assignable to parameter of type 'never'"
- **Update profiles**: `supabase.from('profiles').update({ username: '...', avatar_url: '...' })` → TypeScript error: "Argument of type '{ username: string; avatar_url: string; }' is not assignable to parameter of type 'never'"
- **Nullable result access**: `profile?.username` → TypeScript error: "'profile' is possibly 'null'" without proper type narrowing from `.maybeSingle()`

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Authentication operations (signUp, signIn, signOut, getSession, getUser, etc.) must continue to work without type errors
- The Supabase client import and initialization must remain unchanged
- Runtime database operations must continue to function identically (only compile-time types are affected)
- Type definitions for all tables in the schema (including those not currently used in authService.ts) must be included

**Scope:**
All code that does NOT involve database table operations should be completely unaffected by this fix. This includes:
- Authentication API calls (`supabase.auth.*`)
- Storage operations (`supabase.storage.*`)
- Realtime subscriptions (`supabase.channel.*`)
- Edge function invocations (`supabase.functions.*`)

## Hypothesized Root Cause

Based on the bug description and examination of the codebase, the root cause is:

1. **Missing Type Generation Step**: The `src/integrations/supabase/types.ts` file contains placeholder types that were never replaced with actual generated types
   - The file has the correct structure for Supabase type definitions
   - But all table definitions are `[_ in never]: never`, indicating no tables exist
   - This is the default output when types are generated without a database connection

2. **No Database Introspection**: The Supabase CLI command `supabase gen types typescript` was never run against the actual database
   - The database schema exists in `supabase/migrations/20260309_init_schema.sql`
   - The schema defines 6 tables: profiles, user_preferences, favorites, watch_history, notifications, analytics_events
   - But TypeScript has no knowledge of these tables because type generation didn't occur

3. **Development Workflow Gap**: The project setup didn't include a step to generate types after creating the database schema
   - Migrations were created and likely applied to the database
   - But the corresponding TypeScript types were not generated
   - This creates a disconnect between runtime (which works) and compile-time (which fails)

4. **Configuration Requirements**: Type generation requires proper Supabase project configuration
   - Need project reference (project ID or local database connection)
   - Need appropriate credentials or local Supabase instance running
   - The `supabase/config.toml` file should contain project configuration

## Correctness Properties

Property 1: Bug Condition - Database Operations Type Correctly

_For any_ database operation where a table name from the schema is used (profiles, user_preferences, favorites, watch_history, notifications, analytics_events), the fixed type definitions SHALL provide accurate TypeScript types that match the SQL schema, allowing TypeScript to accept valid operations and reject invalid ones based on actual column names and types.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7**

Property 2: Preservation - Non-Database Operations Unchanged

_For any_ Supabase client operation that does NOT involve database table queries (authentication, storage, realtime, functions), the fixed type definitions SHALL produce exactly the same TypeScript types as before, preserving all existing type safety for non-database operations.

**Validates: Requirements 3.1, 3.3, 3.4**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**File**: `src/integrations/supabase/types.ts`

**Specific Changes**:
1. **Generate Types from Database Schema**: Run the Supabase CLI command to generate TypeScript types
   - Command: `npx supabase gen types typescript --project-id <project-id> > src/integrations/supabase/types.ts`
   - Alternative for local development: `npx supabase gen types typescript --local > src/integrations/supabase/types.ts`
   - This will replace the empty `[_ in never]: never` definitions with actual table types

2. **Verify Database Connection**: Ensure Supabase project is properly configured
   - Check `supabase/config.toml` for project settings
   - Verify database is accessible (either remote project or local instance)
   - Confirm migrations have been applied to the database

3. **Replace Empty Table Definitions**: The generated types will include proper definitions for:
   - `profiles` table with columns: id, email, username, avatar_url, bio, watch_time_minutes, favorite_count, created_at, updated_at
   - `user_preferences` table with columns: id, user_id, theme, autoplay, quality, volume, notifications_enabled, keyboard_shortcuts, default_language, created_at, updated_at
   - `favorites` table with columns: id, user_id, channel_id, channel_name, channel_logo_url, added_at
   - `watch_history` table with columns: id, user_id, channel_id, channel_name, watched_at, duration_seconds, created_at
   - `notifications` table with columns: id, user_id, title, message, type, read, action_url, created_at, expires_at
   - `analytics_events` table with columns: id, user_id, event_type, event_data, channel_id, duration_seconds, created_at

4. **Preserve Type Helper Utilities**: Ensure the generated file maintains the helper types
   - `Tables<T>` for row types
   - `TablesInsert<T>` for insert operation types
   - `TablesUpdate<T>` for update operation types
   - `Enums<T>` for enum types
   - `CompositeTypes<T>` for composite types

5. **Add Type Generation to Development Workflow**: Document the type generation process
   - Add npm script for regenerating types: `"types:generate": "supabase gen types typescript --local > src/integrations/supabase/types.ts"`
   - Include instructions in README or development documentation
   - Consider adding a pre-commit hook or CI check to ensure types stay in sync

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, verify that the type generation process works correctly and produces valid TypeScript types, then verify that all 14 TypeScript errors are resolved and existing functionality is preserved.

### Exploratory Bug Condition Checking

**Goal**: Verify that the current empty type definitions cause TypeScript errors BEFORE generating proper types. Confirm the root cause by examining the specific error messages.

**Test Plan**: Run TypeScript compiler on `src/services/authService.ts` with the current empty type definitions. Document all type errors to establish a baseline.

**Test Cases**:
1. **Profiles Table Query Error**: Verify `supabase.from('profiles')` produces type error (will fail on unfixed code)
2. **User Preferences Table Query Error**: Verify `supabase.from('user_preferences')` produces type error (will fail on unfixed code)
3. **Property Access Error**: Verify accessing `existingProfile.username` produces type error (will fail on unfixed code)
4. **Upsert Operation Error**: Verify upsert with profile data produces type error (will fail on unfixed code)
5. **Insert Operation Error**: Verify insert with user_preferences data produces type error (will fail on unfixed code)
6. **Update Operation Error**: Verify update with profile data produces type error (will fail on unfixed code)
7. **Nullable Result Error**: Verify `.maybeSingle()` result access produces null-safety errors (will fail on unfixed code)

**Expected Counterexamples**:
- All database table operations produce "not assignable to parameter of type 'never'" errors
- Property access on query results produces "does not exist on type 'never'" errors
- Possible causes: empty type definitions, missing type generation step, no database introspection

### Fix Checking

**Goal**: Verify that after generating proper type definitions, all TypeScript errors are resolved and the types accurately reflect the database schema.

**Pseudocode:**
```
FOR ALL databaseOperation WHERE isBugCondition(databaseOperation) DO
  types := generateTypesFromSchema()
  result := typeCheckOperation(databaseOperation, types)
  ASSERT result.hasNoTypeErrors === true
  ASSERT result.typesMatchSchema === true
END FOR
```

**Test Plan**:
1. Run Supabase CLI type generation command
2. Verify generated types file contains proper table definitions
3. Run TypeScript compiler on authService.ts
4. Verify all 14 type errors are resolved
5. Verify type autocomplete works for table names and column names
6. Verify type checking correctly rejects invalid operations (wrong column names, wrong types)

**Test Cases**:
1. **Profiles Table Types**: Verify `from('profiles')` accepts 'profiles' and provides correct column types
2. **User Preferences Table Types**: Verify `from('user_preferences')` accepts 'user_preferences' and provides correct column types
3. **Property Access Types**: Verify accessing `profile.username` is typed as `string`
4. **Upsert Types**: Verify upsert accepts objects matching the profiles table schema
5. **Insert Types**: Verify insert accepts objects matching the user_preferences table schema
6. **Update Types**: Verify update accepts partial objects matching the profiles table schema
7. **Nullable Result Types**: Verify `.maybeSingle()` returns properly typed nullable results
8. **Invalid Operations Rejected**: Verify TypeScript rejects operations with wrong column names or types

### Preservation Checking

**Goal**: Verify that after generating proper type definitions, all non-database operations continue to work with the same types as before.

**Pseudocode:**
```
FOR ALL supabaseOperation WHERE NOT isBugCondition(supabaseOperation) DO
  typesBefore := getCurrentTypes()
  typesAfter := generateTypesFromSchema()
  ASSERT getOperationType(supabaseOperation, typesBefore) === getOperationType(supabaseOperation, typesAfter)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across different Supabase client operations
- It catches edge cases where type generation might inadvertently change non-database types
- It provides strong guarantees that authentication and other operations remain unchanged

**Test Plan**: Verify that authentication operations, storage operations, and other non-database Supabase client methods have identical type signatures before and after type generation.

**Test Cases**:
1. **Authentication Types Preserved**: Verify `supabase.auth.signUp`, `signIn`, `signOut`, etc. have unchanged types
2. **Session Types Preserved**: Verify `getSession()` and `getUser()` return the same types
3. **OAuth Types Preserved**: Verify `signInWithOAuth` accepts the same provider types
4. **Password Reset Types Preserved**: Verify `resetPasswordForEmail` and `updateUser` have unchanged types
5. **Auth State Change Types Preserved**: Verify `onAuthStateChange` callback types are unchanged
6. **Client Import Preserved**: Verify importing `supabase` from the client file works identically

### Unit Tests

- Verify TypeScript compilation succeeds with no errors in authService.ts
- Verify type autocomplete provides correct suggestions for table names
- Verify type autocomplete provides correct suggestions for column names
- Verify type checking rejects invalid table names
- Verify type checking rejects invalid column names
- Verify type checking rejects invalid column types

### Property-Based Tests

- Generate random valid database operations and verify TypeScript accepts them
- Generate random invalid database operations and verify TypeScript rejects them
- Generate random authentication operations and verify types are unchanged
- Test that all table names from the schema are recognized by TypeScript
- Test that all column names for each table are recognized by TypeScript

### Integration Tests

- Run full TypeScript compilation on the entire project
- Verify no new type errors are introduced in other files
- Verify the Supabase client can be imported and used in new files
- Verify IDE autocomplete works correctly for database operations
- Verify the generated types file is valid TypeScript that can be imported
