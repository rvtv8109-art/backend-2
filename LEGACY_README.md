rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function hasRequiredFields(fields) {
      return request.resource.data.keys().hasAll(fields);
    }
    function isValidRegistration(data) {
      return data.squadName is string && data.squadName.size() > 0 && data.squadName.size() < 50 &&
             data.uids is list && data.uids.size() >= 1 && data.uids.size() <= 4 &&
             data.names is list && data.names.size() >= 1 && data.names.size() <= 4 &&
             data.email is string && data.email.matches('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$') &&
             data.whatsappNumber is string && data.whatsappNumber.size() >= 10 && data.whatsappNumber.size() <= 15 &&
             data.squadNumber is number && data.squadNumber >= 1 &&
             data.createdAt is string &&
             (!('couponCode' in data) || data.couponCode is string) &&
             (!('partnerUid' in data) || data.partnerUid is string) &&
             (!('discount' in data) || data.discount is number) &&
             (!('totalAmount' in data) || data.totalAmount is number);
    }

    function isValidPartner(data) {
      return data.uid is string && data.uid.size() > 0 &&
             data.email is string && data.email.matches('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$') &&
             data.displayName is string &&
             data.couponCode is string && data.couponCode.size() > 0 &&
             data.totalEarnings is number && data.totalEarnings >= 0 &&
             data.balance is number && data.balance >= 0 &&
             data.createdAt is string;
    }

    function isValidReferral(data) {
      return data.partnerUid is string && data.partnerUid.size() > 0 &&
             data.amount is number && data.amount == 50 &&
             data.status in ['pending', 'completed'] &&
             data.createdAt is string &&
             data.usedBy is list;
    }

    function isValidReferralUpdate() {
      return request.resource.data.diff(resource.data).affectedKeys().hasOnly(['usedBy']) &&
             request.resource.data.usedBy.size() == resource.data.usedBy.size() + 1;
    }

    function isValidPayout(data) {
      return data.partnerUid is string && data.partnerUid.size() > 0 &&
             data.partnerEmail is string && data.partnerEmail.matches('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$') &&
             data.amount is number && data.amount >= 500 &&
             data.status in ['pending', 'completed', 'rejected'] &&
             data.createdAt is string;
    }

    function isValidPartnerBalanceUpdate() {
      return request.resource.data.diff(resource.data).affectedKeys().hasOnly(['totalEarnings', 'balance']) &&
             request.resource.data.totalEarnings == resource.data.totalEarnings + 50 &&
             request.resource.data.balance == resource.data.balance + 50;
    }

    function isAdmin() {
      return request.auth != null && (
        request.auth.token.email == 'anubhav45lt@gmail.com' || 
        request.auth.token.email == 'jaiswasanskar@gmail.com' || 
        request.auth.token.email == 'jaislinccorp@gmail.com' ||
        request.auth.token.email.matches('^arenas[u]permacyfederation@gmail\\.com$')
      );
    }

    match /{collection}/{registrationId} {
      allow read: if collection.startsWith('registrations') || collection == 'launch_approved';
      allow create: if (collection.startsWith('registrations') || collection == 'launch_approved') && 
                    hasRequiredFields(['squadName', 'uids', 'names', 'email', 'whatsappNumber', 'squadNumber', 'createdAt']) &&
                    isValidRegistration(request.resource.data);
      allow update, delete: if (collection.startsWith('registrations') || collection == 'launch_approved') && isAdmin();
    }

    match /launch_refer/{referId} {
      allow read: if isAdmin();
      allow create: if true;
    }

    match /partners/{partnerId} {
      // Allow user to read their own partner document
      allow read: if request.auth != null && request.auth.uid == partnerId;
      // Allow creation if user is authenticated and data is valid
      allow create: if request.auth != null && request.auth.uid == partnerId &&
                    hasRequiredFields(['uid', 'email', 'displayName', 'couponCode', 'totalEarnings', 'balance', 'createdAt']) &&
                    isValidPartner(request.resource.data);
      // Allow update for the partner, admin, or during registration (balance update)
      allow update: if (request.auth != null && request.auth.uid == partnerId) ||
                    isAdmin() ||
                    isValidPartnerBalanceUpdate();
      // Allow search by coupon code (for registration validation)
      allow list: if true;
    }

    match /referrals/{referralId} {
      // Allow public get for validation, but restrict list to partner or admin
      allow get: if true;
      allow list: if request.auth != null && (
        (resource == null || resource.data.partnerUid == request.auth.uid) ||
        isAdmin()
      );
      // Allow creation during registration
      allow create: if hasRequiredFields(['partnerUid', 'amount', 'status', 'createdAt', 'usedBy']) &&
                    isValidReferral(request.resource.data);
      // Allow update for admin or during registration (usage tracking)
      allow update: if isAdmin() || isValidReferralUpdate();
    }

    match /payouts/{payoutId} {
      // Allow partner to read their own payouts or admin to read all
      allow read: if request.auth != null && (
        (resource == null || resource.data.partnerUid == request.auth.uid) ||
        isAdmin()
      );
      // Allow creation for authenticated partner
      allow create: if request.auth != null && request.auth.uid == request.resource.data.partnerUid &&
                    hasRequiredFields(['partnerUid', 'partnerEmail', 'amount', 'status', 'createdAt']) &&
                    isValidPayout(request.resource.data);
      // Allow update for admin
      allow update: if isAdmin();
    }

    match /settings/{settingId} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}
