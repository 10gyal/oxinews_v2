import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AuthCardProps {
  title: string;
  description?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function AuthCard({
  title,
  description,
  footer,
  children,
  className,
}: AuthCardProps) {
  return (
    <div className="flex min-h-[80vh] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className={cn("w-full max-w-md", className)}>
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-2">
            <Link href="/" className="flex items-center">
              <Image 
                src="/oxinews_logo.png" 
                alt="OxiNews Logo" 
                width={40}
                height={40}
                className="mr-2"
              />
            </Link>
          </div>
          <CardTitle className="text-2xl font-bold">{title}</CardTitle>
          {description && (
            <CardDescription>{description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>{children}</CardContent>
        {footer && <CardFooter>{footer}</CardFooter>}
      </Card>
    </div>
  );
}
