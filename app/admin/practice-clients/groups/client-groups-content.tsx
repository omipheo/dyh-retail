"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Building2, Heart, Edit } from "lucide-react"
import Link from "next/link"

interface ClientGroupsContentProps {
  clientGroups: any[]
  allClients: any[]
}

export function ClientGroupsContent({ clientGroups, allClients }: ClientGroupsContentProps) {
  const getGroupIcon = (type: string) => {
    switch (type) {
      case "family":
        return <Heart className="h-5 w-5" />
      case "business":
        return <Building2 className="h-5 w-5" />
      default:
        return <Users className="h-5 w-5" />
    }
  }

  const getGroupColor = (type: string) => {
    switch (type) {
      case "family":
        return "bg-pink-50 text-pink-700"
      case "business":
        return "bg-blue-50 text-blue-700"
      default:
        return "bg-gray-50 text-gray-700"
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {clientGroups.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">No client groups yet</p>
            <p className="text-sm text-muted-foreground mt-2">Create groups to manage related clients</p>
            <Button asChild className="mt-4">
              <Link href="/admin/practice-clients/groups/new">Create First Group</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {clientGroups.map((group) => {
            const members = group.client_group_members || []
            return (
              <Card key={group.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getGroupColor(group.group_type)}`}>
                        {getGroupIcon(group.group_type)}
                      </div>
                      <div>
                        <CardTitle>{group.group_name}</CardTitle>
                        <CardDescription className="capitalize">{group.group_type} Group</CardDescription>
                      </div>
                    </div>
                    <Badge>
                      {members.length} Member{members.length !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                  {group.description && <p className="text-sm text-muted-foreground mt-2">{group.description}</p>}
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {members.length > 0 ? (
                      <div className="space-y-2">
                        {members.map((member: any) => (
                          <div key={member.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                            <div className="flex-1">
                              <p className="font-medium text-sm">
                                {member.dyh_practice_clients?.client_name || "Unknown"}
                              </p>
                              {member.role_in_group && (
                                <p className="text-xs text-muted-foreground">{member.role_in_group}</p>
                              )}
                            </div>
                            {member.dyh_practice_clients?.client_type && (
                              <Badge variant="outline" className="text-xs">
                                {member.dyh_practice_clients.client_type.replace("_", " ")}
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">No members in this group</p>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
                        <Link href={`/admin/practice-clients/groups/${group.id}/edit`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Group
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
