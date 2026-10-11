# Security Specification: Farm Game Cross-Device Cloud Sync

## 1. Data Invariants
1. **User Isolation**: A user can only read, write, update, and delete documents within `/users/{userId}` where `request.auth.uid == userId`.
2. **Path Hardening**: Path variables `{userId}` and `{saveId}` must strictly conform to alphanumeric IDs (`isValidId()`).
3. **Save Ownership**: The `userId` field inside `/users/{userId}/saves/{saveId}` must strictly match `request.auth.uid`.
4. **Data Size Bounds**: The serialized `gameData` string must not exceed 500,000 characters to prevent Denial-of-Wallet resource exhaustion.
5. **No Blanket Reads**: No global collections allow unbounded listing or unauthenticated reads.
6. **Immutable Identity**: During updates to `/users/{userId}/saves/{saveId}`, `userId` cannot be mutated to someone else.

## 2. The "Dirty Dozen" Threat Payloads
1. **Payload 1 (Ghost Write / Unauthenticated)**: Unauthenticated user writes to `/users/user123/saves/current` -> DENIED.
2. **Payload 2 (Cross-User Read)**: Authenticated `userA` attempts to get `/users/userB/saves/current` -> DENIED.
3. **Payload 3 (Cross-User Write)**: Authenticated `userA` attempts to set `/users/userB/saves/current` -> DENIED.
4. **Payload 4 (Identity Spoofing in Body)**: Authenticated `userA` writes to `/users/userA/saves/current` with `userId: "userB"` -> DENIED.
5. **Payload 5 (Path Traversal / Junk ID)**: Attempt write with ID containing illegal characters `user$!@#/` or length > 128 -> DENIED.
6. **Payload 6 (Oversized Game Data)**: Attempt write with `gameData` string exceeding 500,000 characters -> DENIED.
7. **Payload 7 (Missing Required Fields)**: Attempt write to save without `userId`, `gameData`, or `updatedAt` -> DENIED.
8. **Payload 8 (Invalid Field Types)**: Attempt write where `level` is a boolean or `coins` is an array -> DENIED.
9. **Payload 9 (Ownership Mutation)**: Attempt update changing `userId` from `userA` to `userB` -> DENIED.
10. **Payload 10 (Blanket Query Listing)**: Attempt `getDocs(collection(db, 'users'))` without filtering by owner -> DENIED.
11. **Payload 11 (Profile PII Leak)**: Unauthenticated or third-party read of `/users/{userId}` -> DENIED.
12. **Payload 12 (Root Wildcard Bypass)**: Attempt write to `/arbitraryCollection/hack` -> DENIED by default rule.
