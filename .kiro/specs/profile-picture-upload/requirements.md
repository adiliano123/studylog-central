# Requirements Document

## Introduction

This document defines the requirements for the Profile Picture Upload and Management feature of the
Online Industrial Practical Training Logbook Management System. The feature allows every
authenticated user (Student, Onsite Supervisor, University Supervisor, and Admin) to upload,
replace, view, and remove a personal profile picture. Images are validated, stored on the server
filesystem, served through a static URL, and displayed everywhere an avatar appears in the
application. A default initials-based avatar is shown whenever no image is set. Administrators
additionally have the ability to remove any user's profile picture through the user management
interface.

---

## Glossary

- **System**: The Online Industrial Practical Training Logbook Management System (backend + frontend combined).
- **Backend**: The Spring Boot 3.5 / Java 17 REST API server.
- **Frontend**: The React 18 / TypeScript / Vite single-page application.
- **Authenticated_User**: Any user with a valid JWT representing one of the four roles: STUDENT, ONSITE_SUPERVISOR, UNIVERSITY_SUPERVISOR, or ADMIN.
- **FileStorageService**: The backend service responsible for validating, writing, and deleting profile picture files on the server filesystem.
- **ProfilePictureController**: The backend REST controller that handles `/api/profile/picture` endpoints.
- **AdminProfileController**: The backend controller responsible for the admin-only `/api/admin/users/{userId}/profile-picture` endpoint.
- **UserService**: The backend service responsible for reading and writing the `profileImageUrl` field on the `users` table.
- **UserAvatar**: The shared React component that renders a user's profile picture or an initials fallback.
- **ProfilePictureUploadModal**: The React dialog component that allows a user to preview, upload, change, or remove their profile picture.
- **useProfilePicture**: The React custom hook that centralises API calls and state for profile picture operations.
- **Upload_Directory**: The server filesystem path `uploads/profile-pictures/`.
- **Allowed_Types**: The set of accepted image MIME types: `image/jpeg`, `image/png`, `image/webp` (corresponding extensions: `.jpg`, `.jpeg`, `.png`, `.webp`).
- **Max_File_Size**: 5 MB (5,242,880 bytes).
- **profileImageUrl**: The `VARCHAR(512) NULL` column added to the `users` database table to store the relative URL path of the stored image.
- **Default_Avatar**: The initials-based fallback avatar rendered when `profileImageUrl` is `null` or when the image fails to load.

---

## Requirements

### Requirement 1: Profile Picture Upload

**User Story:** As an authenticated user, I want to upload a profile picture, so that my avatar is
displayed throughout the application.

#### Acceptance Criteria

1. WHEN an Authenticated_User submits a valid image file to `POST /api/profile/picture`, THE ProfilePictureController SHALL store the file via FileStorageService and return `200 OK` with the new `profileImageUrl`.
2. WHEN FileStorageService stores a new profile picture for a user, THE FileStorageService SHALL delete any previously stored file for that user from the Upload_Directory before writing the new file.
3. WHEN FileStorageService successfully writes a file, THE UserService SHALL update the `profileImageUrl` column in the `users` table with the relative URL path `/uploads/profile-pictures/{userId}_{timestamp}.{ext}`.
4. IF FileStorageService throws an exception during the file write, THEN THE ProfilePictureController SHALL return `500 Internal Server Error` and THE UserService SHALL NOT update the `profileImageUrl` column.
5. WHEN a profile picture is stored, THE FileStorageService SHALL generate the filename as `{userId}_{System.currentTimeMillis()}.{ext}` and SHALL NOT use any filename supplied by the client.
6. THE System SHALL configure `spring.servlet.multipart.max-file-size` and `spring.servlet.multipart.max-request-size` to `5MB` in `application.properties`.

---

### Requirement 2: File Validation

**User Story:** As a system operator, I want all uploaded images to be strictly validated, so that
malicious or unsupported files are rejected before they reach the filesystem.

#### Acceptance Criteria

1. WHEN a file is uploaded, THE FileStorageService SHALL validate the MIME type by reading the file's stream header and SHALL reject any file whose detected MIME type is not in Allowed_Types.
2. WHEN a file is uploaded, THE FileStorageService SHALL reject any file whose extension is not one of `jpg`, `jpeg`, `png`, `webp`.
3. WHEN a file is uploaded with a size exceeding Max_File_Size, THE FileStorageService SHALL reject the file and THE ProfilePictureController SHALL return `400 Bad Request` with the message `"File size must not exceed 5 MB"`.
4. WHEN a file is rejected due to an unsupported format, THE ProfilePictureController SHALL return `400 Bad Request` with the message `"Unsupported file type. Allowed: JPG, JPEG, PNG, WEBP"`.
5. WHEN a request to `POST /api/profile/picture` is received with no file field, THE ProfilePictureController SHALL return `400 Bad Request` with the message `"No file provided"`.
6. IF a client renames a file of an unsupported type (e.g., `.gif` renamed to `.jpg`), THEN THE FileStorageService SHALL detect the true MIME type from the stream header and SHALL reject the file.

---

### Requirement 3: Profile Picture Retrieval

**User Story:** As an authenticated user, I want to retrieve my current profile picture URL, so that
the frontend can display my avatar without re-authenticating.

#### Acceptance Criteria

1. WHEN an Authenticated_User sends `GET /api/profile/picture`, THE ProfilePictureController SHALL return `200 OK` with a JSON body containing the `profileImageUrl` field.
2. WHILE a user has no profile picture set, THE ProfilePictureController SHALL return `{ "profileImageUrl": null }` for `GET /api/profile/picture`.
3. THE System SHALL serve files under `/uploads/profile-pictures/{filename}` as static resources mapped to the `uploads/` directory on the server filesystem.
4. WHEN a static file is served via `GET /uploads/profile-pictures/{filename}`, THE Backend SHALL include a `Cache-Control: max-age=604800` response header.

---

### Requirement 4: Profile Picture Deletion (Self)

**User Story:** As an authenticated user, I want to remove my profile picture, so that I can revert
to the default avatar.

#### Acceptance Criteria

1. WHEN an Authenticated_User sends `DELETE /api/profile/picture`, THE ProfilePictureController SHALL delete the stored file from the Upload_Directory and set `profileImageUrl` to `NULL` in the `users` table.
2. IF the file referenced by `profileImageUrl` does not exist on the filesystem when a delete is requested, THEN THE FileStorageService SHALL complete the operation without error.
3. WHEN a delete operation completes successfully, THE ProfilePictureController SHALL return `200 OK` with `{ "profileImageUrl": null, "message": "Profile picture removed" }`.

---

### Requirement 5: Admin Profile Picture Removal

**User Story:** As an Admin, I want to remove any user's profile picture, so that I can enforce
content policies across all accounts.

#### Acceptance Criteria

1. WHEN a caller with `ROLE_ADMIN` sends `DELETE /api/admin/users/{userId}/profile-picture`, THE AdminProfileController SHALL delete the target user's stored file and set their `profileImageUrl` to `NULL`.
2. WHEN the admin removal succeeds, THE AdminProfileController SHALL return `200 OK` with `{ "message": "Profile picture removed for user {userId}" }`.
3. IF a caller without `ROLE_ADMIN` sends `DELETE /api/admin/users/{userId}/profile-picture`, THEN THE Backend SHALL return `403 Forbidden` without executing any business logic.
4. IF the `{userId}` path parameter does not correspond to an existing user, THEN THE AdminProfileController SHALL return `404 Not Found` with the message `"User not found"`.

---

### Requirement 6: Authentication and Authorization

**User Story:** As a security-conscious operator, I want all profile picture endpoints to require
valid authentication, so that only the rightful owner or an admin can modify picture data.

#### Acceptance Criteria

1. WHEN a request to any `/api/profile/picture` endpoint is received without a valid JWT, THE Backend SHALL return `401 Unauthorized`.
2. THE ProfilePictureController SHALL allow access to `POST`, `GET`, and `DELETE /api/profile/picture` for any Authenticated_User regardless of role.
3. WHEN a JWT is validated, THE ProfilePictureController SHALL resolve the target user solely from the JWT subject and SHALL NOT accept a user identifier from the request body or query parameters for self-service endpoints.

---

### Requirement 7: Database Schema

**User Story:** As a developer, I want a database migration that adds the profile image URL column,
so that the schema is versioned and deployable without manual intervention.

#### Acceptance Criteria

1. THE System SHALL provide a Flyway migration script (e.g., `V3__add_profile_image_url.sql`) that adds a `profile_image_url VARCHAR(512) NULL DEFAULT NULL` column to the `users` table.
2. THE User entity SHALL expose a `profileImageUrl` field mapped to the `profile_image_url` column with a maximum length of 512 characters and nullable semantics.
3. WHEN a new user is created without uploading a picture, THE System SHALL store `NULL` in `profile_image_url` and SHALL NOT store any default image path.

---

### Requirement 8: Frontend Avatar Display

**User Story:** As a user, I want a consistent avatar component displayed across all pages, so that
my profile picture (or a recognisable fallback) is always visible.

#### Acceptance Criteria

1. WHEN `UserAvatar` receives a non-null `profileImageUrl` prop, THE UserAvatar SHALL render an `<img>` element inside a shadcn `<Avatar>` with `src` set to that URL.
2. WHEN `UserAvatar` receives a `null` or `undefined` `profileImageUrl` prop, THE UserAvatar SHALL render an initials-based fallback derived from `firstName` and `lastName`.
3. WHEN the `<img>` element inside `UserAvatar` fires an `onError` event, THE UserAvatar SHALL switch to the initials-based fallback without displaying a broken-image icon.
4. THE UserAvatar SHALL support size variants `sm` (24 px), `md` (32 px), `lg` (40 px), and `xl` (64 px) via a `size` prop.
5. THE UserAvatar SHALL be rendered in the header area of the StudentDashboard, OnsiteSupervisorDashboard, UniversitySupervisorDashboard, and AdminDashboard.

---

### Requirement 9: Frontend Upload Modal

**User Story:** As a user, I want a dialog to preview, upload, and remove my profile picture, so
that I can manage my avatar without leaving the current page.

#### Acceptance Criteria

1. WHEN a user opens the `ProfilePictureUploadModal`, THE ProfilePictureUploadModal SHALL display the current profile picture (or Default_Avatar) and provide a file input accepting `.jpg`, `.jpeg`, `.png`, `.webp` files.
2. WHEN a user selects a valid file in the modal, THE ProfilePictureUploadModal SHALL display a preview of the selected image using the `FileReader.readAsDataURL()` API before any upload is initiated.
3. WHEN a user selects a file whose MIME type is not in Allowed_Types or whose size exceeds Max_File_Size, THE ProfilePictureUploadModal SHALL display a destructive toast error and SHALL NOT send any network request.
4. WHEN a user confirms the upload, THE useProfilePicture hook SHALL call `POST /api/profile/picture` with the selected file and SHALL display a progress indicator during the request.
5. WHEN a user clicks "Remove photo", THE useProfilePicture hook SHALL call `DELETE /api/profile/picture` and, on success, THE ProfilePictureUploadModal SHALL invoke `onSuccess(null)`.
6. WHEN the upload or removal completes successfully, THE ProfilePictureUploadModal SHALL invoke the `onSuccess` callback with the new URL or `null` and SHALL close the dialog.

---

### Requirement 10: AuthContext and State Synchronisation

**User Story:** As a user, I want my new profile picture to appear everywhere immediately after
uploading, so that I do not need to refresh the page.

#### Acceptance Criteria

1. WHEN `POST /api/profile/picture` returns `200 OK`, THE Frontend SHALL update the `profileImageUrl` field in both the `AuthContext` state and the `localStorage` user object.
2. WHEN `DELETE /api/profile/picture` returns `200 OK`, THE Frontend SHALL set `profileImageUrl` to `null` in both `AuthContext` and `localStorage`.
3. WHEN the `AuthContext` user object is updated, THE UserAvatar components rendered across all dashboards SHALL reflect the new value without a full page reload.

---

### Requirement 11: Static File Security

**User Story:** As a security-conscious operator, I want profile picture filenames to be
non-enumerable, so that an attacker cannot iterate over all stored user images.

#### Acceptance Criteria

1. THE FileStorageService SHALL name every stored file using the pattern `{userId}_{System.currentTimeMillis()}.{ext}`, ensuring filenames are not predictable from a username or email alone.
2. THE Backend SHALL NOT expose any endpoint that lists or enumerates filenames in the Upload_Directory to non-admin callers.
3. THE System SHALL serve static files from the Upload_Directory with `Content-Type` set to the actual image MIME type and SHALL NOT execute any server-side code contained within the file.
