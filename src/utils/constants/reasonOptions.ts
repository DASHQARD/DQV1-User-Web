export const DEACTIVATION_OPTIONS = [
  {
    label: 'Failed or incomplete KYC verification',
    value: 'Account suspended due incomplete document',
  },
  {
    label: 'Suspicious or irregular activity detected',
    value: 'Irregular activity detected',
  },
  {
    label: 'Violation of Afri Transfer terms or policy',
    value: 'violation of afri transfer terms or policy',
  },
  {
    label: 'Inactive account for a long period',
    value: 'Account restricted due to inactivity',
  },
  {
    label: 'Duplicate or multiple accounts detected',
    value: 'Account already exist',
  },
  {
    label: 'Customer provided false or unverifiable details',
    value: 'Account restricted due unverified document',
  },
  {
    label: 'Regulatory or compliance directive – Customer To be Informed',
    value: 'Account deactivated based on regulatory directive',
  },
  {
    label: 'Security Agency directive',
    value: 'security agency directive',
  },
  // {
  //   label: 'Other (please specify)',
  //   value: 'other (please specify)',
  // },
]

export const REJECT_REASON_OPTIONS = [
  {
    label: 'Insufficient funds',
    value: 'Insufficient funds',
  },
  {
    label: 'Invalid account number',
    value: 'Invalid account number',
  },
]
