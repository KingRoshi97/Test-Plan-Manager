---
kid: "KID-ITNET-PROCEDURE-0002"
title: "TLS Certificate Rotation Procedure"
type: "procedure"
pillar: "IT_END_TO_END"
domains:
  - "networking"
subdomains: []
tags:
  - "networking"
  - "procedure"
maturity: "reviewed"
use_policy: "pattern_only"
executor_access: "internal_and_external"
license: "internal_owned"
allowed_excerpt:
  max_words: 0
  max_lines: 0
supersedes: ""
deprecated_by: ""
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion-system"
---

# TLS Certificate Rotation Procedure

# TLS Certificate Rotation Procedure

## Summary
This procedure outlines the steps to rotate TLS certificates for secure communication between systems. TLS certificate rotation ensures continued trust and prevents service disruptions due to expired or compromised certificates. The process includes validating prerequisites, replacing certificates, and verifying proper functionality post-rotation.

## When to Use
- When a TLS certificate is nearing expiration.
- When a certificate has been compromised or revoked.
- During routine security maintenance to adhere to organizational policies or compliance requirements.
- When migrating to a new Certificate Authority (CA).

## Do / Don't

### Do:
1. **Do validate the new certificate** before deployment to ensure it matches the required domain names and is signed by a trusted CA.
2. **Do backup existing certificates** and configurations to allow rollback in case of failure.
3. **Do test the new certificate** in a staging environment before deploying it to production.

### Don't:
1. **Don't skip the verification step** after certificate rotation, as this can lead to service outages or security vulnerabilities.
2. **Don't hard-code certificate paths** in application configurations; use dynamic or environment-based configurations where possible.
3. **Don't ignore monitoring tools** that can alert you to certificate expiration or misconfigurations.

## Core Content

### Prerequisites
- Administrative access to the systems where the TLS certificates are installed.
- A valid TLS certificate signed by a trusted CA.
- Access to the private key associated with the certificate.
- Knowledge of the services and applications relying on the certificate.
- Testing environment to validate the new certificate before production deployment.

### Procedure

#### Step 1: Backup Existing Certificates
- **Action**: Create a backup of the current certificate, private key, and configuration files.
- **Expected Outcome**: A complete backup is stored securely, allowing rollback if needed.
- **Failure Mode**: Missing backups can lead to prolonged outages if the new certificate fails.

#### Step 2: Validate the New Certificate
- **Action**: Use tools such as OpenSSL or a certificate validation tool to check the new certificate's domain, expiration date, and CA signature.
- **Expected Outcome**: The certificate is confirmed to be valid and matches the intended domain.
- **Failure Mode**: Deploying an invalid certificate can cause SSL/TLS errors and service disruptions.

#### Step 3: Replace the Certificate
- **Action**: Update the certificate files on the server (e.g., `/etc/ssl/certs/`) and update configuration files to point to the new certificate and private key.
- **Expected Outcome**: The server is configured to use the new certificate.
- **Failure Mode**: Incorrect file paths or permissions can prevent the server from accessing the new certificate.

#### Step 4: Restart Services
- **Action**: Restart services or applications relying on the certificate (e.g., web servers like Apache or Nginx).
- **Expected Outcome**: Services start successfully without TLS-related errors.
- **Failure Mode**: Misconfigured services may fail to start or throw errors.

#### Step 5: Verify Functionality
- **Action**: Test the service endpoints using tools like `curl`, browser access, or SSL/TLS testing tools to confirm the new certificate is being served.
- **Expected Outcome**: Connections to the service are secure, and the new certificate is presented.
- **Failure Mode**: Incorrect configurations or caching issues may cause the old certificate to still be served.

#### Step 6: Monitor Post-Rotation
- **Action**: Use monitoring tools to check for certificate-related alerts and ensure continued functionality.
- **Expected Outcome**: No errors or warnings are reported, and the service operates securely.
- **Failure Mode**: Failure to monitor can delay detection of issues like certificate mismatches or service outages.

## Links
- **TLS Certificate Best Practices**: Guidance on proper certificate management and rotation.
- **OpenSSL Documentation**: Detailed usage instructions for certificate validation and troubleshooting.
- **OWASP Transport Layer Protection Cheat Sheet**: Security recommendations for TLS configurations.
- **RFC 5280**: Internet X.509 Public Key Infrastructure Certificate and CRL Profile.

## Proof / Confidence
This procedure follows industry standards such as RFC 5280 for X.509 certificates and OWASP guidelines for secure TLS configurations. Regular certificate rotation is a widely accepted best practice for maintaining secure communication channels and preventing service disruptions due to expired or compromised certificates.
