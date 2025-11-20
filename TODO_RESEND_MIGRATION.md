# Migration to Resend for Email Services

Currently, the "Forgot Password" feature uses a mock implementation (`resetPassword` in `app/actions/auth.ts`) that simulates sending an email.

To enable real email sending, follow these steps to integrate **Resend**:

## 1. Sign Up and Get API Key
1. Go to [Resend.com](https://resend.com) and sign up.
2. Create an API Key.
3. Add the API Key to your `.env` file:
   ```env
   RESEND_API_KEY=re_123456789
   ```

## 2. Install Dependencies
Run the following command to install the Resend SDK and React Email:
```bash
npm install resend @react-email/components
```

## 3. Create Email Template
Create a new file `components/emails/ResetPasswordEmail.tsx`:
```tsx
import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface ResetPasswordEmailProps {
  userFirstname?: string;
  resetPasswordLink?: string;
}

export const ResetPasswordEmail = ({
  userFirstname = "User",
  resetPasswordLink = "https://xplorium.com/reset-password",
}: ResetPasswordEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Reset your password</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={text}>Hi {userFirstname},</Text>
          <Text style={text}>
            Someone recently requested a password change for your Xplorium account. If this was you, you can set a new password here:
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={resetPasswordLink}>
              Reset password
            </Button>
          </Section>
          <Text style={text}>
            If you don't want to change your password or didn't request this, just ignore and delete this message.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: "#f6f9fc",
  padding: "10px 0",
};

const container = {
  backgroundColor: "#ffffff",
  border: "1px solid #f0f0f0",
  padding: "45px",
};

const text = {
  fontSize: "16px",
  fontFamily:
    "'Open Sans', 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif",
  fontWeight: "300",
  color: "#404040",
  lineHeight: "26px",
};

const buttonContainer = {
  padding: "27px 0 27px",
};

const button = {
  backgroundColor: "#22d3ee",
  borderRadius: "3px",
  fontWeight: "600",
  color: "#fff",
  fontSize: "15px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "11px 23px",
};
```

## 4. Update Action
Modify `app/actions/auth.ts` to use Resend:

```typescript
import { Resend } from 'resend';
import { ResetPasswordEmail } from '@/components/emails/ResetPasswordEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function resetPassword(email: string) {
  try {
    // ... existing validation ...

    // Generate token (implement token generation logic)
    const token = "generated-token"; 
    const link = `https://xplorium.com/reset-password?token=${token}`;

    await resend.emails.send({
      from: 'Xplorium <onboarding@resend.dev>', // Verify your domain in Resend to use a custom from address
      to: email,
      subject: 'Reset your password',
      react: ResetPasswordEmail({ userFirstname: "User", resetPasswordLink: link }),
    });

    return { success: true, message: "Reset link sent" };
  } catch (error) {
    return { success: false, error: "Failed to send email" };
  }
}
```
