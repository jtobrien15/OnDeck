export const COURSE_TYPE_LABELS: Record<string, string> = {
  LIFEGUARDING: "Lifeguarding",
  CPR_AED_PRO: "CPR/AED for Professional Rescuers",
  FIRST_AID_CPR_AED: "First Aid/CPR/AED",
  BLS: "Basic Life Support",
  LIFEGUARD_INSTRUCTOR: "Lifeguarding Instructor",
  FA_CPR_AED_INSTRUCTOR: "First Aid/CPR/AED Instructor",
  BLS_INSTRUCTOR: "Basic Life Support Instructor",
  BABYSITTER_TRAINING: "Babysitter's Training",
  WSI: "Water Safety Instructor",
  LGI_IT_RECERT: "LGI/IT Recertification",
};

export const LOCATION_LABELS: Record<string, string> = {
  EMILSON: "Emilson",
  HALE: "Hale",
};

export const ENROLLMENT_STATUS_COLORS: Record<string, string> = {
  REGISTERED: "bg-blue-100 text-blue-700",
  PREREQ_SCHEDULED: "bg-cyan-100 text-cyan-700",
  PREREQ_PASSED: "bg-green-100 text-green-700",
  PREREQ_FAILED: "bg-red-100 text-red-700",
  TRANSFER_PENDING: "bg-orange-100 text-orange-700",
  TRANSFERRED: "bg-gray-100 text-gray-600",
  WAITLISTED: "bg-yellow-100 text-yellow-700",
  ONLINE_PENDING: "bg-indigo-100 text-indigo-700",
  CONFIRMED: "bg-emerald-100 text-emerald-700",
  IN_PROGRESS: "bg-purple-100 text-purple-700",
  COMPLETED: "bg-emerald-100 text-emerald-800",
  DID_NOT_COMPLETE: "bg-red-100 text-red-700",
  CERTIFIED: "bg-green-200 text-green-800",
  CANCELLED: "bg-gray-100 text-gray-500",
  NO_SHOW: "bg-red-100 text-red-600",
};

export const CLASS_STATUS_COLORS: Record<string, string> = {
  SCHEDULED: "bg-gray-100 text-gray-700",
  OPEN_FOR_REGISTRATION: "bg-blue-100 text-blue-700",
  FULL: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-green-100 text-green-700",
  IN_PROGRESS: "bg-purple-100 text-purple-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
};
