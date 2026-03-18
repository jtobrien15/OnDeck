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

interface PrereqReminderEmailProps {
  studentName: string;
  courseType: string;
  startDate: string;
  prereqDeadline: string;
}

export default function PrereqReminderEmail({
  studentName,
  courseType,
  startDate,
  prereqDeadline,
}: PrereqReminderEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        Reminder: Schedule your prerequisite swim test for {courseType}
      </Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={headerSection}>
            <Heading style={h1}>Prerequisite Swim Test Reminder</Heading>
          </Section>

          <Section style={contentSection}>
            <Text style={text}>Hi {studentName},</Text>
            <Text style={text}>
              This is a friendly reminder that you need to complete your
              prerequisite swim test before your <strong>{courseType}</strong>{" "}
              class begins.
            </Text>

            <Section style={urgentBox}>
              <Text style={urgentText}>
                Your prerequisite swim test must be completed by{" "}
                <strong>{prereqDeadline}</strong>.
              </Text>
              <Text style={{ ...urgentText, margin: "8px 0 0 0" }}>
                Your class starts on <strong>{startDate}</strong>.
              </Text>
            </Section>

            <Text style={text}>
              Please contact your local YMCA branch to schedule your swim test
              as soon as possible. Walk-in availability may be limited.
            </Text>

            <Heading as="h2" style={h2}>
              What to Expect
            </Heading>
            <Text style={text}>
              The prerequisite swim test evaluates your swimming ability to
              ensure you are prepared for the course. You will need to
              demonstrate the required strokes and treading water endurance as
              outlined in your registration materials.
            </Text>

            <Hr style={hr} />

            <Text style={muted}>
              If you have already scheduled or completed your swim test, you can
              disregard this reminder. For questions, contact the Aquatics
              Department at your YMCA branch.
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

const urgentBox: React.CSSProperties = {
  backgroundColor: "#fef3c7",
  borderLeft: "4px solid #f59e0b",
  borderRadius: "0 6px 6px 0",
  padding: "16px 20px",
  margin: "16px 0",
};

const urgentText: React.CSSProperties = {
  color: "#92400e",
  fontSize: "15px",
  lineHeight: "1.5",
  margin: "0",
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
