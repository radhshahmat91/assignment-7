interface AuthErrorLike {
  code?: string;
  message?: string;
  status?: number;
}

const BY_CODE: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "ইমেইল বা পাসওয়ার্ড সঠিক নয়",
  INVALID_PASSWORD: "পাসওয়ার্ড সঠিক নয়",
  INVALID_EMAIL: "সঠিক একটি ইমেইল দিন",
  USER_NOT_FOUND: "এই ইমেইলে কোনো অ্যাকাউন্ট পাওয়া যায়নি",
  USER_ALREADY_EXISTS: "এই ইমেইল দিয়ে আগেই অ্যাকাউন্ট খোলা হয়েছে",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "এই ইমেইল দিয়ে আগেই অ্যাকাউন্ট খোলা হয়েছে, অন্য ইমেইল ব্যবহার করুন",
  PASSWORD_TOO_SHORT: "পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে",
  PASSWORD_TOO_LONG: "পাসওয়ার্ডটি অনেক বড় হয়ে গেছে",
  EMAIL_NOT_VERIFIED: "ইমেইল যাচাই করা হয়নি",
  SESSION_EXPIRED: "সেশনের মেয়াদ শেষ হয়েছে, আবার সাইন ইন করুন",
  PROVIDER_NOT_FOUND: "এই সোশ্যাল লগইনটি এখনো চালু করা হয়নি",
  CLIENT_ID_AND_SECRET_REQUIRED: "এই সোশ্যাল লগইনটি এখনো কনফিগার করা হয়নি",
  FAILED_TO_CREATE_USER: "অ্যাকাউন্ট তৈরি করা যায়নি, আবার চেষ্টা করুন",
  FAILED_TO_UPDATE_USER: "তথ্য আপডেট করা যায়নি, আবার চেষ্টা করুন",
};

/** Turns a Better Auth error into a short Bangla message for a toast. */
export function authErrorMessage(error: AuthErrorLike | null | undefined): string {
  if (error?.code && BY_CODE[error.code]) return BY_CODE[error.code];
  if (error?.status === 429) return "অনেকবার চেষ্টা করা হয়েছে, কিছুক্ষণ পর আবার চেষ্টা করুন";
  if (error?.status === 401) return "অনুমতি নেই, আবার সাইন ইন করুন";
  if (error?.message) {
    if (/network|fetch|failed to/i.test(error.message)) return "নেটওয়ার্ক সমস্যা, ইন্টারনেট সংযোগ দেখে আবার চেষ্টা করুন";
    return error.message;
  }
  return "কিছু একটা সমস্যা হয়েছে, আবার চেষ্টা করুন";
}
