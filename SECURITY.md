# CampusOS Security Policy & Architecture

## 1. Authentication & Session Security
- **Algorithm:** HMAC-SHA256 JWT (JSON Web Tokens) with 24-hour expiration.
- **Password Storage:** BCrypt password hashing with cost factor 10.
- **Transport Security:** Strict TLS/HTTPS in production with HTTP Strict Transport Security (HSTS) headers.
- **CORS Policies:** Explicit whitelist of origins (`http://localhost:3000`, verified production domains) with restricted HTTP methods and credentials enabled.

---

## 2. Multi-Tenant Authorization (RBAC & Defense-in-Depth)
1. **Role Separation:**
   - `ROLE_STUDENT`: Restricted to enrolled courses, personal attendance, submitted assignments, and public resources.
   - `ROLE_TEACHER`: Restricted to assigned course offerings, roster grading, and resource publishing.
   - `ROLE_ADMIN`: Administrative configuration for departments, institutions, and tenant policies.
2. **Tenant Scoping:** All database read/write queries enforce `institution_id` matching to prevent cross-institution data exfiltration.
3. **Insecure Direct Object Reference (IDOR) Protection:** Path variables such as `/assignments/{id}/submissions` assert caller ownership before rendering student records.

---

## 3. Data Integrity & File Upload Security
- Uploaded course materials are validated for MIME type, file extension, and file size limits (max 50MB).
- Private object storage keys are cryptographically generated UUIDs to prevent directory traversal and public bucket enumeration.
- Database writes for attendance and grade submissions execute within ACID transactions to prevent partial updates.

---

## 4. Vulnerability Reporting
For security disclosures, please email `security@campusos.internal`. All reports are reviewed within 48 hours.
