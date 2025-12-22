import { redirect } from 'next/navigation';
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Upload, FileText, Book, File } from 'lucide-react';
import Link from "next/link";

export default async function ReferenceDocsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  // Get user profile and check if tax agent
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single();

  if (profile?.role !== "tax_agent") {
    redirect("/dashboard");
  }

  // Get reference documents
  const { data: documents } = await supabase
    .from("reference_documents")
    .select("*")
    .order("created_at", { ascending: false });

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case "book":
        return <Book className="h-8 w-8 text-primary" />;
      case "ato_letter":
        return <FileText className="h-8 w-8 text-primary" />;
      case "guide":
        return <File className="h-8 w-8 text-primary" />;
      default:
        return <File className="h-8 w-8 text-primary" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" asChild className="mb-2">
            <Link href="/admin">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin Dashboard
            </Link>
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Reference Documents</h1>
              <p className="text-sm text-muted-foreground">Manage ATO guides and reference materials</p>
            </div>
            <Button asChild>
              <Link href="/admin/reference-docs/upload">
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {documents && documents.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc) => (
                <Card key={doc.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="mb-2">{getDocumentIcon(doc.document_type)}</div>
                    <CardTitle className="text-lg">{doc.title}</CardTitle>
                    <CardDescription className="capitalize">
                      {doc.document_type.replace("_", " ")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {doc.description && (
                      <p className="text-sm text-muted-foreground mb-4">
                        {doc.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mb-4">
                      Uploaded {new Date(doc.created_at).toLocaleDateString()}
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground text-lg mb-4">No reference documents uploaded yet</p>
                <p className="text-sm text-muted-foreground mb-6">
                  Upload ATO guides, books, and reference materials to help with assessments
                </p>
                <Button asChild>
                  <Link href="/admin/reference-docs/upload">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Your First Document
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
