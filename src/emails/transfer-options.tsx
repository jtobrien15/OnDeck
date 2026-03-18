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

interface AvailableClass {
  id: string;
  startDate: string;
  location: string;
  scheduleDetails: string;
}

interface TransferOptionsEmailProps {
  studentName: string;
  originalCourseType: string;
  availableClasses: AvailableClass[];
}

export default function TransferOptionsEmail({
  studentName,
  originalCourseType,
  availableClasses,
}: TransferOptionsEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        Transfer options available for {originalCourseType}
      </Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={headerSection}>
            <Heading style={h1}>Transfer Options Available</Heading>
          </Section>

          <Section style={contentSection}>
            <Text style={text}>Hi {studentName},</Text>
            <Text style={text}>
              We have identified the following upcoming{" "}
              <strong>{originalCourseType}</strong> classes that you can
              transfer to. Please review the options below and let us know
              which works best for you.
            </Text>

            {availableClasses.map((cls) => (
              <Section key={cls.id} style={classCard}>
                <Text style={classDate}>{cls.startDate}</Text>
                <Text style={classDetail}>
                  <strong>Location:</strong> {cls.location}
                </Text>
                <Text style={classDetail}>
                  <strong>Schedule:</strong> {cls.scheduleDetails}
                </Text>
              </Section>
            ))}

            {availableClasses.length === 0 && (
              <Section style={emptyBox}>
                <Text style={emptyText}>
                  There are no classes available for transfer at this time. We
                  will follow up when new sessions are scheduled.
                </Text>
              </Section>
            )}

            <Hr style={hr} />

            <Heading as="h2" style={h2}>
              How to Transfer
            </Heading>
            <Text style={text}>
              To request a transfer, please reply to this email or contact the
              Aquatics Department at your YMCA branch with your preferred class
              option. Spots are filled on a first-come, first-served basis.
            </Text>

            <Hr style={hr} />

            <Text style={muted}>
              If none of these options work for you, please let us know and we
              will do our best to accommodate your schedule.
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

const classCard: React.CSSProperties = {
  backgroundColor: "#f0f7ff",
  border: "1px solid #bfdbfe",
  borderRadius: "6px",
  padding: "16px 20px",
  margin: "12px 0",
};

const classDate: React.CSSProperties = {
  color: "#2563eb",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0 0 8px 0",
};

const classDetail: React.CSSProperties = {
  color: "#374151",
  fontSize: "14px",
  lineHeight: "1.5",
  margin: "0 0 4px 0",
};

const emptyBox: React.CSSProperties = {
  backgroundColor: "#f9fafb",
  border: "1px solid #e5e7eb",
  borderRadius: "6px",
  padding: "20px 24px",
  margin: "16px 0",
};

const emptyText: React.CSSProperties = {
  color: "#6b7280",
  fontSize: "15px",
  lineHeight: "1.6",
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
