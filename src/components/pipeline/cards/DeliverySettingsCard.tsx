import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmailInput } from "../inputs";

interface DeliverySettingsCardProps {
  emails: string[];
  setEmails: (emails: string[]) => void;
  emailError: string | null;
  setEmailError: (error: string | null) => void;
}

export const DeliverySettingsCard = ({
  emails,
  setEmails,
  emailError,
  setEmailError
}: DeliverySettingsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Delivery Settings</CardTitle>
        <CardDescription>
          Configure where your content will be delivered.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <EmailInput 
          emails={emails}
          onChange={setEmails}
          error={emailError}
          setError={setEmailError}
        />
      </CardContent>
    </Card>
  );
};
