export type ConsentType =
  | 'PERSONAL_INFO_COLLECTION_AND_USE'
  | 'SERVICE_USE_POLICY'
  | 'DISCLAIMER';

export type ConsentStatus = {
  id: number;
  type: ConsentType;
  code: string;
  title: string;
  description: string;
  isRequired: boolean;
  version: number;
  agreed: boolean;
};

export type RequiredConsentCheck = {
  requiredConsentsSatisfied: boolean;
  missingRequiredConsentCodes: string[];
};

export type ConsentSubmitPayload = {
  agreements: Array<{
    type: ConsentType;
    code: string;
    version: number;
    agreed: boolean;
  }>;
};

export type ConsentSubmitResult = {
  requiredConsentsSatisfied: boolean;
  missingRequiredConsentCodes: string[];
  agreedCount: number;
};

export type ConsentApiError = {
  code: string;
  message: string;
  status: number;
};
