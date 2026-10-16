# Access Token vs Refresh Token Fix

## 1. Security Issue

An **Access Token** is a short-lived JWT presented to protected application
endpoints, normally through the `Authorization: Bearer ...` header. It proves
that the user is authenticated for ordinary API requests.

A **Refresh Token** is a longer-lived JWT submitted to the refresh endpoint to
obtain a new Access Token, and in this application a replacement Refresh Token.
It is used to continue a login session without requiring the user to enter
credentials again.

Before the fix, both token types were signed with the same JWT signing key and
contained the same basic claims: subject, issued-at time, and expiration time.
There was no claim identifying the token's purpose. The refresh flow accepted a
token when its subject matched the user and the token was not expired.

As a result, a valid Access Token could be submitted to
`AuthService.refreshToken(...)` and accepted as if it were a Refresh Token.
The server would then issue a new Access Token and a longer-lived Refresh
Token. This allowed an Access Token to extend the session beyond its intended
short lifetime and violated the separation between the two token purposes.

## 2. Root Cause

The root cause was that the JWT implementation did not encode or validate a
token purpose.

Relevant pre-fix behavior:

- `AuthService.refreshToken(...)` extracted the username and called
  `JwtService.isTokenValid(...)`.
- `JwtService.generateToken(...)` generated the normal Access Token.
- `JwtService.generateRefreshToken(...)` generated the Refresh Token.
- `JwtService.isTokenValid(...)` checked only that the JWT subject matched the
  user and that the expiration time had not passed.

`generateToken(...)` and `generateRefreshToken(...)` differed primarily in
expiration duration. Both used the same signing key and neither added a
token-type claim. Therefore, `isTokenValid(...)` had no reliable way to tell
whether a valid signed JWT was an Access Token or a Refresh Token.

## 3. Attack Scenario

This is a defensive description of the application behavior, not instructions
for abusing an external system.

1. A user logs in.
2. The server returns an Access Token and a Refresh Token.
3. An attacker obtains the user's Access Token.
4. The attacker submits that Access Token to the application's refresh flow.
5. Before the fix, the refresh flow checked the signature-derived claims,
   username, and expiration, but not the token purpose. The Access Token could
   therefore be accepted and replacement tokens could be issued.
6. After the fix, Access Tokens contain `token_type=ACCESS`. The refresh flow
   requires `token_type=REFRESH`, so the Access Token fails validation and is
   rejected. A genuine Refresh Token contains `token_type=REFRESH` and can
   continue through the normal refresh flow when its other validations pass.

## 4. Test-First Approach

The regression test was created before the production fix:

`AuthServiceRefreshTokenTest.refreshToken_AccessToken_ShouldBeRejectedWithoutGeneratingTokens`

The test supplies a token identified by the test as an Access Token, stubs the
user lookup, and verifies that:

- `AuthService.refreshToken(...)` throws `BaseException` with
  `ErrorCode.INVALID_CREDENTIALS`.
- No replacement Access Token is generated.
- No replacement Refresh Token is generated.

Before the production fix, this test was expected to fail because
`AuthService.refreshToken(...)` called the general `isTokenValid(...)` method,
which accepted any valid JWT with the matching username and an unexpired
expiration. The failure proved that the refresh flow did not enforce token
purpose.

The key test behavior is:

```java
BaseException exception = assertThrows(
        BaseException.class,
        () -> authService.refreshToken(accessToken)
);

assertEquals(ErrorCode.INVALID_CREDENTIALS, exception.getErrorCode());
verify(jwtService, never()).generateToken(any());
verify(jwtService, never()).generateRefreshToken(any());
```

## 5. Production Fix

Only the following production files were changed for this security issue:

- `backend/src/main/java/jobfinder/util/JwtService.java`
- `backend/src/main/java/jobfinder/services/implementation/AuthService.java`

In `JwtService`:

- `generateToken(...)` adds the signed claim
  `token_type=ACCESS`.
- `generateRefreshToken(...)` adds the signed claim
  `token_type=REFRESH`.
- `isTokenValid(...)` now requires the `ACCESS` token type in addition to its
  existing username and expiration checks.
- `isRefreshTokenValid(...)` was added. It requires the `REFRESH` token type
  and performs the same username and expiration checks.
- Claims continue to be parsed with `parseClaimsJws(...)` and the configured
  signing key, so signature validation remains enforced.

In `AuthService`:

- `refreshToken(...)` now calls `jwtService.isRefreshTokenValid(...)` instead
  of `jwtService.isTokenValid(...)`.

Because the token type is part of the signed JWT claims, an Access Token cannot
simply claim to be a Refresh Token without failing signature validation. A
normal Access Token has the wrong type for the refresh validator and is
rejected.

## 6. Before vs After

| Area | Before | After |
|---|---|---|
| Access Token identification | No token-purpose claim; identified only by general JWT validity and shorter expiration | Signed `token_type=ACCESS` claim |
| Refresh Token identification | No token-purpose claim; identified only by general JWT validity and longer expiration | Signed `token_type=REFRESH` claim |
| Refresh validation | `AuthService.refreshToken(...)` called `isTokenValid(...)`, which did not distinguish token purposes | `AuthService.refreshToken(...)` calls `isRefreshTokenValid(...)`, which requires `REFRESH` |
| Access-token validation | `isTokenValid(...)` checked username and expiration only | `isTokenValid(...)` requires `ACCESS`, username match, and non-expired status |
| Security behavior | A valid Access Token could be accepted for refresh | An Access Token fails the Refresh Token type check |

## 7. Tests

### Tests created for this vulnerability

All five cases are in
`backend/src/test/java/jobfinder/services/implementation/AuthServiceRefreshTokenTest.java`.

| Test name | Purpose | Expected result | Actual result |
|---|---|---|---|
| `refreshToken_AccessToken_ShouldBeRejectedWithoutGeneratingTokens` | Prevent an Access Token from being exchanged through the refresh flow | Reject with `INVALID_CREDENTIALS`; generate no replacement tokens | Passed |
| `refreshToken_ValidRefreshToken_ShouldSucceed` | Verify a valid Refresh Token still refreshes the session | Return new Access and Refresh Tokens | Passed |
| `refreshToken_ExpiredRefreshToken_ShouldBeRejected` | Verify expired Refresh Tokens are rejected | Reject with `INVALID_CREDENTIALS` | Passed |
| `refreshToken_TamperedRefreshToken_ShouldBeRejected` | Verify an invalid/tampered Refresh Token is rejected by validation | Reject with `INVALID_CREDENTIALS` | Passed |
| `refreshToken_DisabledUser_ShouldBeRejected` | Preserve existing disabled-user behavior | Reject with `ACCOUNT_NOT_ACTIVATED` | Passed |

Focused command:

```text
mvn -Dtest=AuthServiceRefreshTokenTest test
```

Result:

```text
Tests run: 5, Failures: 0, Errors: 0
BUILD SUCCESS
```

### Existing tests that were run

The focused authentication command also ran
`AuthServiceGoogleLoginTest`. All 5 Google Login tests passed, confirming that
the existing Google Login token-generation calls continued to work.

The full backend suite was also run:

```text
mvn test
```

The refresh-token tests passed within that run:

```text
AuthServiceRefreshTokenTest
Tests run: 5, Failures: 0, Errors: 0
```

### Unrelated full-suite failures

The full suite ended with `BUILD FAILURE`:

```text
Tests run: 89, Failures: 3, Errors: 3
```

These failures were unrelated to Access Token vs Refresh Token validation:

- `EmailAlertFeatureTest.shouldScore30ForSkillMatches` expected `10` but
  received `15`.
- `ProfileDataMapperTest.mapAndSave_withFullName_shouldSaveFullNameOnProfile`
  expected `"John Doe"` but received `null`.
- `ProfileDataMapperTest.mapAndSave_withPhoneNumber_shouldSavePhoneOnProfile`
  expected `"+1234567890"` but received `null`.
- Broken-backup `EmailAlertFeatureTest` failed with
  `NoClassDefFoundError: EmailAlertService`.
- Broken-backup `EmailAlertServiceTest` failed because its declared package did
  not match its directory package.
- Broken-backup `JobMatchingServiceTest` failed because its declared package did
  not match its directory package.

## 8. Files Changed

The table includes only files changed for this security issue.

| File | Change | Reason |
|---|---|---|
| `backend/src/main/java/jobfinder/util/JwtService.java` | Added signed Access/Refresh token types and separate validation | Make JWT purpose explicit and enforce type-specific validation |
| `backend/src/main/java/jobfinder/services/implementation/AuthService.java` | Changed the refresh flow to call `isRefreshTokenValid(...)` | Require a Refresh Token in `refreshToken(...)` |
| `backend/src/test/java/jobfinder/services/implementation/AuthServiceRefreshTokenTest.java` | Added regression and validation cases | Prove Access Tokens are rejected and required Refresh Token behavior remains correct |

## 9. Security Guarantees After Fix

The current implementation provides these guarantees for this vulnerability:

- Access Tokens contain the signed type `ACCESS`.
- Refresh Tokens contain the signed type `REFRESH`.
- The refresh flow requires the `REFRESH` token type.
- An Access Token cannot pass Refresh Token validation.
- Bearer Access Token validation requires the `ACCESS` token type.
- A Refresh Token cannot be treated as an Access Token by the normal bearer
  validator.
- JWT signature validation remains enabled through signed-claims parsing with
  the configured signing key.
- Expiration validation remains enabled for both token validators.
- Username matching remains enabled for both token validators.
- Normal username/password login and Google Login continue to call the existing
  Access Token and Refresh Token generation methods.
- No database schema or database model changes were needed.
- No client secret, signing key, password, or other sensitive credential was
  introduced.

## 10. Remaining Concerns

No remaining concern related specifically to the Access Token vs Refresh Token
type-confusion vulnerability was identified in the final review.

Other authentication or cookie concerns are intentionally outside the scope of
this document.

## 11. Developer Learning Summary

A JWT can be correctly signed, unexpired, and issued for the correct user while
still being the wrong kind of token for an operation. Signature validity answers
“was this token issued by us and left unchanged?” It does not answer “is this
token intended for this endpoint?”

For a Java/Spring Boot backend, give tokens explicit signed purposes such as
`ACCESS` and `REFRESH`, then validate the expected purpose at every boundary.
Use the Access Token validator for protected API requests and a dedicated
Refresh Token validator for the refresh endpoint. This prevents a valid token
from being reused in a different security context merely because its signature,
subject, and expiration are valid.
