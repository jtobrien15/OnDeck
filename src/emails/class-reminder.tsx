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

interface ClassReminderEmailProps {
  studentName: string;
  courseType: string;
  startDate: string;
  scheduleDetails: string;
  location: string;
}

export default function ClassReminderEmail({
  studentName,
  courseType,
  startDate,
  scheduleDetails,
  location,
}: ClassReminderEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        Your {courseType} class starts in 3 days!
      </Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={headerSection}>
            <Heading style={h1}>Your Class Starts in 3 Days!</Heading>
          </Section>

          <Section style={contentSection}>
            <Text style={text}>Hi {studentName},</Text>
            <Text style={text}>
              This is a reminder that your <strong>{courseType}</strong> class
              is starting soon. Here are the details:
            </Text>

            <Section style={detailsBox}>
              <Text style={detailLabel}>Start Date</Text>
              <Text style={detailValue}>{startDate}</Text>
              <Text style={detailLabel}>Schedule</Text>
              <Text style={detailValue}>{scheduleDetails}</Text>
              <Text style={detailLabel}>Location</Text>
              <Text style={detailValue}>{location}</Text>
            </Section>

            <Hr style={hr} />

            <Heading as="h2" style={h2}>
              Checklist for Your First Day
            </Heading>

            <Section style={checklistBox}>
              <Text style={checklistItem}>
                &#9744; Bring a valid photo ID
              </Text>
              <Text style={checklistItem}>
                &#9744; Arrive at least 15 minutes early
              </Text>
              <Text style={checklistItem}>
                &#9744; Bring a swimsuit and towel
              </Text>
              <Text style={checklistItem}>
                &#9744; Complete all online learning modules (if applicable)
              </Text>
              <Text style={checklistItem}>
                &#9744; Bring any required course materials or textbooks
              </Text>
              <Text style={checklistItem}>
                &#9744; Eat a light meal beforehand and stay hydrated
              </Text>
            </Section>

            <Hr style={hr} />

            <Text style={muted}>
              If you are unable to attend, please contact the Aquatics
              Department at your YMCA branch as soon as possible. We look
              forward to seeing you!
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
  margin: "0 0 12px 0",
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

const checklistBox: React.CSSProperties = {
  backgroundColor: "#f9fafb",
  borderRadius: "6px",
  padding: "16px 20px",
  margin: "12px 0",
};

const checklistItem: React.CSSProperties = {
  color: "#374151",
  fontSize: "15px",
  lineHeight: "1.4",
  margin: "0 0 10px 0",
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
