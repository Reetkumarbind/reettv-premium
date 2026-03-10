# Bugfix Requirements Document

## Introduction

The Supabase TypeScript client in `src/services/authService.ts` is generating 14 type errors because the database type definitions in `src/integrations/supabase/types.ts` are empty (all tables defined as `never`). This prevents TypeScript from recognizing valid database tables like `profiles` and `user_preferences`, causing type checking to fail for all database operations. The database schema exists and is properly defined in `supabase/migrations/20260309_init_schema.sql`, but the TypeScript types are not synchronized with it.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the Supabase client attempts to query the 'profiles' table THEN TypeScript reports "Argument of type '"profiles"' is not assignable to parameter of type 'never'"

1.2 WHEN the Supabase client attempts to query the 'user_preferences' table THEN TypeScript reports "Argument of type '"user_preferences"' is not assignable to parameter of type 'never'"

1.3 WHEN code attempts to access properties on query results from 'profiles' table THEN TypeScript reports "Property 'username' does not exist on type 'never'"

1.4 WHEN code attempts to upsert data into the 'profiles' table THEN TypeScript reports "Argument of type '{ id: string; email: string; username: any; }' is not assignable to parameter of type 'never'"

1.5 WHEN code attempts to insert data into the 'user_preferences' table THEN TypeScript reports "Argument of type '{ user_id: string; }' is not assignable to parameter of type 'never'"

1.6 WHEN code attempts to update the 'profiles' table THEN TypeScript reports "Argument of type '{ username: string; avatar_url: string; }' is not assignable to parameter of type 'never'"

1.7 WHEN query results that use `.maybeSingle()` are accessed THEN TypeScript reports "'existingProfile' is possibly 'null'" and "'profile' is possibly 'null'" without proper type narrowing

### Expected Behavior (Correct)

2.1 WHEN the Supabase client attempts to query the 'profiles' table THEN TypeScript SHALL recognize 'profiles' as a valid table name with proper type definitions

2.2 WHEN the Supabase client attempts to query the 'user_preferences' table THEN TypeScript SHALL recognize 'user_preferences' as a valid table name with proper type definitions

2.3 WHEN code attempts to access properties on query results from 'profiles' table THEN TypeScript SHALL recognize 'username', 'avatar_url', and other profile fields as valid properties with correct types

2.4 WHEN code attempts to upsert data into the 'profiles' table THEN TypeScript SHALL accept objects with 'id', 'email', and 'username' properties matching the table schema

2.5 WHEN code attempts to insert data into the 'user_preferences' table THEN TypeScript SHALL accept objects with 'user_id' property matching the table schema

2.6 WHEN code attempts to update the 'profiles' table THEN TypeScript SHALL accept objects with 'username' and 'avatar_url' properties matching the table schema

2.7 WHEN query results use `.maybeSingle()` THEN TypeScript SHALL properly type the result as nullable and allow safe access with optional chaining

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the Supabase client is used for authentication operations (signUp, signIn, signOut) THEN the system SHALL CONTINUE TO function without type errors

3.2 WHEN the database schema includes tables not used in authService.ts (favorites, watch_history, notifications, analytics_events) THEN the system SHALL CONTINUE TO include type definitions for these tables

3.3 WHEN the Supabase client is imported in other files THEN the system SHALL CONTINUE TO provide the same typed client interface

3.4 WHEN runtime database operations execute THEN the system SHALL CONTINUE TO function identically (only compile-time types are affected)
