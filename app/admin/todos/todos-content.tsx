"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Search, Edit, Clock, CheckCircle2, Circle, AlertCircle, Trash2, RotateCcw, Calendar } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface TodosContentProps {
  todos: any[]
  currentUserId: string
  isDeletedView: boolean
}

export function TodosContent({ todos, currentUserId, isDeletedView }: TodosContentProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [urgencyFilter, setUrgencyFilter] = useState("all")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedTodoId, setSelectedTodoId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const totalTodos = todos.length
  const pendingCount = todos.filter((t) => t.status === "pending").length
  const inProgressCount = todos.filter((t) => t.status === "in_progress").length
  const completedCount = todos.filter((t) => t.status === "completed").length

  const filteredTodos = todos.filter((todo) => {
    const profile = todo.profiles as any
    const matchesSearch =
      searchQuery === "" ||
      todo.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      todo.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      todo.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesDate =
      dateFilter === "" ||
      new Date(todo.created_at).toLocaleDateString().includes(dateFilter) ||
      (todo.due_date && new Date(todo.due_date).toLocaleDateString().includes(dateFilter)) ||
      (todo.completed_at && new Date(todo.completed_at).toLocaleDateString().includes(dateFilter))

    const matchesStatus = statusFilter === "all" || todo.status === statusFilter
    const matchesUrgency = urgencyFilter === "all" || todo.urgency === urgencyFilter

    return matchesSearch && matchesDate && matchesStatus && matchesUrgency
  })

  const handleDelete = async (todoId: string) => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/todos/${todoId}/delete`, {
        method: "POST",
      })

      if (response.ok) {
        router.refresh()
      } else {
        console.error("Failed to delete todo")
      }
    } catch (error) {
      console.error("Error deleting todo:", error)
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setSelectedTodoId(null)
    }
  }

  const handleRestore = async (todoId: string) => {
    try {
      const response = await fetch(`/api/todos/${todoId}/restore`, {
        method: "POST",
      })

      if (response.ok) {
        router.refresh()
      } else {
        console.error("Failed to restore todo")
      }
    } catch (error) {
      console.error("Error restoring todo:", error)
    }
  }

  const getUrgencyBadge = (urgency: string) => {
    const urgencyMap: Record<string, { label: string; variant: "default" | "destructive" | "secondary" | "outline" }> =
      {
        "8_hours": { label: "8 Hours", variant: "destructive" },
        "24_hours": { label: "24 Hours", variant: "destructive" },
        "72_hours": { label: "72 Hours", variant: "default" },
        "7_days": { label: "7 Days", variant: "secondary" },
        "14_days": { label: "14 Days", variant: "secondary" },
        other: { label: "Other", variant: "outline" },
      }

    const config = urgencyMap[urgency] || urgencyMap.other
    return (
      <Badge variant={config.variant}>
        <Clock className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case "in_progress":
        return <Circle className="h-5 w-5 text-blue-600" />
      case "pending":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />
      default:
        return <Circle className="h-5 w-5 text-gray-400" />
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex gap-2">
          <Button asChild variant={!isDeletedView ? "default" : "outline"}>
            <Link href="/admin/todos">Active Tasks</Link>
          </Button>
          <Button asChild variant={isDeletedView ? "default" : "outline"}>
            <Link href="/admin/todos?view=deleted">Deleted Tasks</Link>
          </Button>
        </div>

        {/* Statistics Cards - only show for active view */}
        {!isDeletedView && (
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Tasks</CardDescription>
                <CardTitle className="text-3xl">{totalTodos}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Pending</CardDescription>
                <CardTitle className="text-3xl text-yellow-600">{pendingCount}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>In Progress</CardDescription>
                <CardTitle className="text-3xl text-blue-600">{inProgressCount}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Completed</CardDescription>
                <CardTitle className="text-3xl text-green-600">{completedCount}</CardTitle>
              </CardHeader>
            </Card>
          </div>
        )}

        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title, description, notes, or client..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="relative w-[200px]">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by date..."
                  className="pl-10"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
              </div>
              {!isDeletedView && (
                <>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by urgency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Urgencies</SelectItem>
                      <SelectItem value="8_hours">8 Hours</SelectItem>
                      <SelectItem value="24_hours">24 Hours</SelectItem>
                      <SelectItem value="72_hours">72 Hours</SelectItem>
                      <SelectItem value="7_days">7 Days</SelectItem>
                      <SelectItem value="14_days">14 Days</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* To-Do List */}
        {filteredTodos.length > 0 ? (
          <div className="space-y-4">
            {filteredTodos.map((todo) => {
              const profile = todo.profiles as any
              const isOverdue = todo.due_date && new Date(todo.due_date) < new Date() && todo.status !== "completed"

              return (
                <Card
                  key={todo.id}
                  className={`hover:shadow-md transition-shadow ${isOverdue && !isDeletedView ? "border-red-300" : ""} ${isDeletedView ? "opacity-60" : ""}`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getStatusIcon(todo.status)}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-xl">{todo.title}</CardTitle>
                            {getUrgencyBadge(todo.urgency)}
                            <Badge
                              variant={
                                todo.status === "completed"
                                  ? "default"
                                  : todo.status === "in_progress"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {todo.status.replace("_", " ")}
                            </Badge>
                            {isOverdue && !isDeletedView && (
                              <Badge variant="destructive">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Overdue
                              </Badge>
                            )}
                            {isDeletedView && (
                              <Badge variant="outline">Deleted {new Date(todo.deleted_at).toLocaleDateString()}</Badge>
                            )}
                          </div>
                          {todo.description && <CardDescription className="mb-2">{todo.description}</CardDescription>}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {profile && <span>Client: {profile.full_name || profile.email}</span>}
                            <span>Created: {new Date(todo.created_at).toLocaleDateString()}</span>
                            {todo.due_date && (
                              <span className={isOverdue && !isDeletedView ? "text-red-600 font-medium" : ""}>
                                Due: {new Date(todo.due_date).toLocaleString()}
                              </span>
                            )}
                          </div>
                          {todo.notes && (
                            <div className="mt-3 p-3 bg-muted rounded-md">
                              <p className="text-sm font-medium mb-1">Notes:</p>
                              <p className="text-sm whitespace-pre-wrap">{todo.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {isDeletedView ? (
                          <Button
                            onClick={() => handleRestore(todo.id)}
                            variant="outline"
                            size="sm"
                            className="text-green-600 hover:text-green-700"
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Restore
                          </Button>
                        ) : (
                          <>
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/admin/todos/${todo.id}/edit`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              onClick={() => {
                                setSelectedTodoId(todo.id)
                                setDeleteDialogOpen(true)
                              }}
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <Circle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">
                {searchQuery || dateFilter || statusFilter !== "all" || urgencyFilter !== "all"
                  ? "No matching tasks found"
                  : isDeletedView
                    ? "No deleted tasks"
                    : "No tasks yet"}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {searchQuery || dateFilter || statusFilter !== "all" || urgencyFilter !== "all" ? (
                  "Try adjusting your search or filters"
                ) : !isDeletedView ? (
                  <Button asChild className="mt-4">
                    <Link href="/admin/todos/new">Create your first task</Link>
                  </Button>
                ) : null}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task?</AlertDialogTitle>
            <AlertDialogDescription>
              This task will be moved to deleted tasks. You can restore it later from the Deleted Tasks view.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedTodoId && handleDelete(selectedTodoId)}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
