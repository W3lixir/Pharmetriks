// Maps profile status to the right route to land on.

export type ProfileStatus =
  | 'pending'
  | 'awaiting_payment'
  | 'approved'
  | 'rejected'
  | 'revoked';

export function destinationForStatus(status: ProfileStatus | null | undefined): string {
  switch (status) {
    case 'approved':
      return '/app';
    case 'awaiting_payment':
      return '/pending';
    case 'pending':
      // Profile created but no receipt uploaded yet → send to upload.
      return '/upload-receipt';
    case 'rejected':
    case 'revoked':
      return '/pending'; // page shows the rejected/revoked message
    default:
      return '/upload-receipt';
  }
}

export function statusLabel(status: ProfileStatus | null | undefined): string {
  switch (status) {
    case 'pending':           return 'Account created — upload your receipt';
    case 'awaiting_payment':  return 'Receipt submitted — waiting for approval';
    case 'approved':          return 'Approved — you can use the app';
    case 'rejected':          return 'Application rejected';
    case 'revoked':           return 'Access revoked';
    default:                  return 'Unknown status';
  }
}
