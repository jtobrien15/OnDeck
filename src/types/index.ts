import type {
  Student,
  Class,
  Enrollment,
  Instructor,
  ClassInstructorAssignment,
  WaitlistEntry,
  EmailLog,
  SystemSettings,
  EnrollmentStatus,
  ClassStatus,
  CourseType,
  Location,
  PrereqResult,
  CourseResult,
  InstructorRole,
} from "@prisma/client";

// Re-export Prisma types
export type {
  Student,
  Class,
  Enrollment,
  Instructor,
  ClassInstructorAssignment,
  WaitlistEntry,
  EmailLog,
  SystemSettings,
  EnrollmentStatus,
  ClassStatus,
  CourseType,
  Location,
  PrereqResult,
  CourseResult,
  InstructorRole,
};

// Extended types with relations
export type EnrollmentWithRelations = Enrollment & {
  student: Student;
  class: Class;
  emailLog?: EmailLog[];
};

export type ClassWithRelations = Class & {
  enrollments: EnrollmentWithRelations[];
  waitlist: WaitlistEntry[];
  instructorAssignments: (ClassInstructorAssignment & {
    instructor: Instructor;
  })[];
};

export type StudentWithEnrollments = Student & {
  enrollments: EnrollmentWithRelations[];
};

// Transition metadata passed to lifecycle.ts
export interface TransitionMetadata {
  prereqResult?: PrereqResult;
  prereqScheduledDate?: Date;
  courseResult?: CourseResult;
  courseResultReason?: string;
  additionalInfo?: string;
  destinationClassId?: string;
  notes?: string;
}

// Email template IDs
export type EmailTemplateId =
  | "E1"
  | "E2"
  | "E3"
  | "E4"
  | "E5"
  | "E6"
  | "E7"
  | "E8"
  | "E9"
  | "E10"
  | "E11"
  | "E12"
  | "E13"
  | "E14";

// Dashboard action item
export interface ActionItem {
  id: string;
  type:
    | "prereq_overdue"
    | "under_enrollment"
    | "transfer_pending"
    | "checklist_overdue"
    | "certification_deadline";
  message: string;
  href: string;
  count: number;
  urgency: "high" | "medium" | "low";
}
