"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, Send, AlertCircle, Clock, CheckCircle, Paperclip } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

interface Message {
  id: string
  subject: string
  message_text: string
  message_type: string
  priority: string
  is_read: boolean
  created_at: string
  read_at: string | null
  attachment_url: string | null
  attachment_name: string | null
  sender: {
    full_name: string
    email: string
    role: string
  }
  recipient: {
    full_name: string
    email: string
    role: string
  } | null
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [unreadMessages, setUnreadMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMessages()
    fetchUnreadMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      const response = await fetch("/api/messages/list")
      const data = await response.json()
      if (data.messages) {
        setMessages(data.messages)
      }
    } catch (error) {
      console.error("[v0] Error fetching messages:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUnreadMessages = async () => {
    try {
      const response = await fetch("/api/messages/list?unreadOnly=true")
      const data = await response.json()
      if (data.messages) {
        setUnreadMessages(data.messages)
      }
    } catch (error) {
      console.error("[v0] Error fetching unread messages:", error)
    }
  }

  const markAsRead = async (messageId: string) => {
    try {
      await fetch("/api/messages/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId }),
      })
      fetchMessages()
      fetchUnreadMessages()
    } catch (error) {
      console.error("[v0] Error marking message as read:", error)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "destructive"
      case "high":
        return "default"
      case "normal":
        return "secondary"
      case "low":
        return "outline"
      default:
        return "secondary"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "system_alert":
        return <AlertCircle className="h-4 w-4" />
      case "client_query":
        return <MessageSquare className="h-4 w-4" />
      case "tax_agent_response":
        return <Send className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="container py-10">
        <div className="flex items-center justify-center">
          <p className="text-muted-foreground">Loading messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Messages</h1>
        <p className="text-muted-foreground">Communication between clients and tax agents</p>
      </div>

      <div className="grid gap-6 mb-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{messages.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadMessages.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Read</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{messages.length - unreadMessages.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Messages ({messages.length})</TabsTrigger>
          <TabsTrigger value="unread">Unread ({unreadMessages.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {messages.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">No messages yet</CardContent>
            </Card>
          ) : (
            messages.map((message) => (
              <Card key={message.id} className={!message.is_read ? "border-primary" : ""}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(message.message_type)}
                      <CardTitle className="text-lg">{message.subject}</CardTitle>
                      {!message.is_read && (
                        <Badge variant="default" className="ml-2">
                          New
                        </Badge>
                      )}
                    </div>
                    <Badge variant={getPriorityColor(message.priority)}>{message.priority}</Badge>
                  </div>
                  <CardDescription className="flex items-center gap-4">
                    <span>
                      From: {message.sender.full_name} ({message.sender.role})
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(message.created_at), "PPp")}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4 whitespace-pre-wrap">{message.message_text}</p>

                  {message.attachment_url && (
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-md mb-4">
                      <Paperclip className="h-4 w-4" />
                      <a
                        href={message.attachment_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        {message.attachment_name || "Download Attachment"}
                      </a>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {!message.is_read && (
                      <Button size="sm" variant="outline" onClick={() => markAsRead(message.id)}>
                        Mark as Read
                      </Button>
                    )}
                    <Button size="sm" variant="default" asChild>
                      <Link href={`/messages/compose?replyTo=${message.id}`}>Reply</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="unread" className="space-y-4">
          {unreadMessages.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">No unread messages</CardContent>
            </Card>
          ) : (
            unreadMessages.map((message) => (
              <Card key={message.id} className="border-primary">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(message.message_type)}
                      <CardTitle className="text-lg">{message.subject}</CardTitle>
                      <Badge variant="default">New</Badge>
                    </div>
                    <Badge variant={getPriorityColor(message.priority)}>{message.priority}</Badge>
                  </div>
                  <CardDescription className="flex items-center gap-4">
                    <span>
                      From: {message.sender.full_name} ({message.sender.role})
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(message.created_at), "PPp")}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4 whitespace-pre-wrap">{message.message_text}</p>

                  {message.attachment_url && (
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-md mb-4">
                      <Paperclip className="h-4 w-4" />
                      <a
                        href={message.attachment_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        {message.attachment_name || "Download Attachment"}
                      </a>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => markAsRead(message.id)}>
                      Mark as Read
                    </Button>
                    <Button size="sm" variant="default" asChild>
                      <Link href={`/messages/compose?replyTo=${message.id}`}>Reply</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      <div className="mt-6">
        <Button asChild size="lg">
          <Link href="/messages/compose">
            <Send className="mr-2 h-4 w-4" />
            Compose New Message
          </Link>
        </Button>
      </div>
    </div>
  )
}
