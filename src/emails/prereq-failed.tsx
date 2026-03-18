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

interface PrereqFailedEmailProps {
  studentName: string;
  courseType: string;
  canRetry: boolean;
  transferInfo?: string;
}

export default function PrereqFailedEmail({
  studentName,
  courseType,
  canRetry,
  transferInfo,
}: PrereqFailedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        Prerequisite swim test update for {courseType}
      </Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={headerSection}>
            <Heading style={h1}>Prerequisite Swim Test Update</Heading>
          </Section>

          <Section style={contentSection}>
            <Text style={text}>Hi {studentName},</Text>
            <Text style={text}>
              We wanted to let you know that your prerequisite swim test for{" "}
              <strong>{courseType}</strong> was not passed. We understand this
              may be disappointing, and we are here to help you with next steps.
            </Text>

            {canRetry ? (
              <Section style={infoBox}>
                <Heading as="h2" style={h2}>
                  You Can Retry
                </Heading>
                <Text style={infoText}>
                  You are eligible to retake the prerequisite swim test. Please
                  contact your local YMCA branch to schedule another attempt.
                  We recommend practicing the required skills before your next
                  test.
                </Text>
              </Section>
            ) : (
              <Section style={alertBox}>
                <Heading as="h2" style={h2Alert}>
                  Next Steps
                </Heading>
                <Text style={alertText}>
                  Unfortunately, a retry is not available at this time. Our
                  team will be in touch with options, which may include
                  transferring to a future class session.
                </Text>
              </Section>
            )}

            {transferInfo && (
              <>
                <Hr style={hr} />
                <Heading as="h2" style={h2}>
                  Transfer Information
                </Heading>
                <Text style={text}>{transferInfo}</Text>
              </>
            )}

            <Hr style={hr} />

            <Text style={muted}>
              If you have questions about your results or next steps, please
              contact the Aquatics Department at your YMCA branch. We are happy
              to help you succeed.
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

const h2Alert: React.CSSProperties = {
  color: "#991b1b",
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

const infoBox: React.CSSProperties = {
  backgroundColor: "#eff6ff",
  border: "1px solid #bfdbfe",
  borderRadius: "6px",
  padding: "20px 24px",
  margin: "16px 0",
};

const infoText: React.CSSProperties = {
  color: "#1e40af",
  fontSize: "15px",
  lineHeight: "1.6",
  margin: "0",
};

const alertBox: React.CSSProperties = {
  backgroundColor: "#fef2f2",
  border: "1px solid #fecaca",
  borderRadius: "6px",
  padding: "20px 24px",
  margin: "16px 0",
};

const alertText: React.CSSProperties = {
  color: "#991b1b",
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
