import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
  Preview,
} from "@react-email/components";
import * as React from "react";

interface WelcomeEmailProps {
  studentName: string;
  courseType: string;
  startDate: string;
  endDate: string;
  scheduleDetails: string;
  location: string;
}

export default function WelcomeEmail({
  studentName,
  courseType,
  startDate,
  endDate,
  scheduleDetails,
  location,
}: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        Welcome to {courseType} - Your registration is confirmed!
      </Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={headerSection}>
            <Heading style={h1}>Registration Confirmed</Heading>
          </Section>

          <Section style={contentSection}>
            <Text style={text}>Hi {studentName},</Text>
            <Text style={text}>
              You have been successfully registered for{" "}
              <strong>{courseType}</strong>. Here are your class details:
            </Text>

            <Section style={detailsBox}>
              <Text style={detailLabel}>Course</Text>
              <Text style={detailValue}>{courseType}</Text>
              <Text style={detailLabel}>Dates</Text>
              <Text style={detailValue}>
                {startDate} &ndash; {endDate}
              </Text>
              <Text style={detailLabel}>Schedule</Text>
              <Text style={detailValue}>{scheduleDetails}</Text>
              <Text style={detailLabel}>Location</Text>
              <Text style={detailValue}>{location}</Text>
            </Section>

            <Hr style={hr} />

            <Heading as="h2" style={h2}>
              Important: Prerequisite Swim Test
            </Heading>
            <Text style={text}>
              You must complete your prerequisite swim test at least 3 days
              before class starts. Please contact your local YMCA branch to
              schedule your swim test as soon as possible.
            </Text>

            <Hr style={hr} />

            <Heading as="h2" style={h2}>
              Online Session Reminder
            </Heading>
            <Text style={text}>
              This course includes an online learning component. You will
              receive a separate email with access to the Red Cross online
              session. Please complete all online modules before your first
              in-person class day.
            </Text>

            <Hr style={hr} />

            <Text style={muted}>
              If you have any questions, please contact the Aquatics Department
              at your YMCA branch.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const body: React.CSSProperties = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
};

const container: React.CSSProperties = {
  maxWidth: "600px",
  margin: "0 auto",
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  overflow: "hidden",
};

const headerSection: React.CSSProperties = {
  backgroundColor: "#2563eb",
  padding: "32px 40px",
};

const h1: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "0",
};

const h2: React.CSSProperties = {
  color: "#1e293b",
  fontSize: "18px",
  fontWeight: "600",
  margin: "0 0 8px 0",
};

const contentSection: React.CSSProperties = {
  padding: "32px 40px",
};

const text: React.CSSProperties = {
  color: "#374151",
  fontSize: "15px",
  lineHeight: "1.6",
  margin: "0 0 16px 0",
};

const detailsBox: React.CSSProperties = {
  backgroundColor: "#f0f7ff",
  borderRadius: "6px",
  padding: "20px 24px",
  margin: "16px 0",
};

const detailLabel: React.CSSProperties = {
  color: "#6b7280",
  fontSize: "12px",
  fontWeight: "600",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  margin: "12px 0 2px 0",
};

const detailValue: React.CSSProperties = {
  color: "#1e293b",
  fontSize: "15px",
  fontWeight: "500",
  margin: "0 0 4px 0",
};

const hr: React.CSSProperties = {
  borderColor: "#e5e7eb",
  margin: "24px 0",
};

const muted: React.CSSProperties = {
  color: "#9ca3af",
  fontSize: "13px",
  lineHeight: "1.5",
  margin: "0",
};
