"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  collection,
  addDoc,
  getDocs,
  doc, // Ensure this import is correct
  updateDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
  increment,
  type Timestamp,
} from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage } from "@/lib/firebase-init"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Heart, MessageSquare, Share2, ImagePlus, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import { formatDistanceToNow } from "date-fns"

// Define the Post type
interface Post {
  id: string
  userId: string
  content: string
  imageUrl?: string
  likes: number
  comments: number
  createdAt: Timestamp
}

// Define the Comment type
interface Comment {
  id: string
  userId: string
  postId: string
  content: string
  createdAt: Timestamp
}

export function SocialFeed({ userId }: { userId?: string }) {
  const [posts, setPosts] = useState<Post[]>([])
  const [newPostContent, setNewPostContent] = useState("")
  const [newCommentContent, setNewCommentContent] = useState("")
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false)
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    if (userId) {
      fetchPosts()
    }
  }, [userId])

  const fetchPosts = async () => {
    if (!userId) return

    setIsLoading(true)
    try {
      const postsRef = collection(db, "social", "posts", "userPosts")
      const q = query(postsRef, orderBy("createdAt", "desc"), limit(20))
      const snapshot = await getDocs(q)

      const fetchedPosts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Post[]

      setPosts(fetchedPosts)
    } catch (error) {
      console.error("Error fetching posts:", error)
      toast({
        title: "Error",
        description: "Failed to load posts. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreatePost = async () => {
    if (!userId) return

    if (!newPostContent.trim()) {
      toast({
        title: "Error",
        description: "Post content cannot be empty.",
        variant: "destructive",
      })
      return
    }

    try {
      const postsRef = collection(db, "social", "posts", "userPosts")

      // Upload image if selected
      let imageUrl: string | undefined
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage, userId)
      }

      // Create the post
      await addDoc(postsRef, {
        userId,
        content: newPostContent,
        imageUrl: imageUrl,
        likes: 0,
        comments: 0,
        createdAt: serverTimestamp(),
      })

      // Reset form and refresh posts
      setNewPostContent("")
      setSelectedImage(null)
      setIsImageDialogOpen(false)
      fetchPosts()

      toast({
        title: "Post created",
        description: "Your post has been shared successfully.",
      })
    } catch (error) {
      console.error("Error creating post:", error)
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleLikePost = async (postId: string) => {
    if (!userId) return

    try {
      const postRef = doc(db, "social", "posts", "userPosts", postId)
      await updateDoc(postRef, {
        likes: increment(1),
      })

      // Update local state
      setPosts(posts.map((post) => (post.id === postId ? { ...post, likes: post.likes + 1 } : post)))
    } catch (error) {
      console.error("Error liking post:", error)
      toast({
        title: "Error",
        description: "Failed to like post. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleOpenCommentDialog = (post: Post) => {
    setSelectedPost(post)
    setNewCommentContent("")
    setIsCommentDialogOpen(true)
  }

  const handleAddComment = async () => {
    if (!userId || !selectedPost) return

    if (!newCommentContent.trim()) {
      toast({
        title: "Error",
        description: "Comment cannot be empty.",
        variant: "destructive",
      })
      return
    }

    try {
      const commentsRef = collection(db, "social", "posts", "userPosts", selectedPost.id, "comments")
      await addDoc(commentsRef, {
        userId,
        content: newCommentContent,
        createdAt: serverTimestamp(),
      })

      // Update post comments count
      const postRef = doc(db, "social", "posts", "userPosts", selectedPost.id)
      await updateDoc(postRef, {
        comments: increment(1),
      })

      // Update local state
      setPosts(posts.map((post) => (post.id === selectedPost.id ? { ...post, comments: post.comments + 1 } : post)))

      // Reset form and close dialog
      setNewCommentContent("")
      setIsCommentDialogOpen(false)

      toast({
        title: "Comment added",
        description: "Your comment has been added successfully.",
      })
    } catch (error) {
      console.error("Error adding comment:", error)
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      setIsImageDialogOpen(true)
    }
  }

  const uploadImage = async (image: File, userId: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, `images/${userId}/${image.name}`)
      const uploadTask = uploadBytes(storageRef, image)

      uploadTask.then(
        async (snapshot) => {
          const downloadURL = await getDownloadURL(snapshot.ref)
          resolve(downloadURL)
        },
        (error) => {
          console.error("Error uploading image:", error)
          reject(error)
        },
      )
    })
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Social Feed</CardTitle>
          <CardDescription>Loading posts...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Social Feed</CardTitle>
          <CardDescription>Share your financial journey and connect with others</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="post-content">Share your thoughts</Label>
            <Textarea
              id="post-content"
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="What are you working on today?"
              className="min-h-[80px]"
            />
            <div className="flex justify-between items-center">
              <Button variant="outline" size="sm" asChild>
                <Label htmlFor="image-upload" className="cursor-pointer">
                  <div className="flex items-center">
                    <ImagePlus className="h-4 w-4 mr-1" />
                    Add Image
                  </div>
                </Label>
              </Button>
              <input type="file" id="image-upload" accept="image/*" className="hidden" onChange={handleImageUpload} />
              <Button onClick={handleCreatePost} className="bg-rose-600 hover:bg-rose-700" size="sm">
                Share Post
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            {posts.map((post) => (
              <Card key={post.id} className="border">
                <CardHeader className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User Avatar" />
                      <AvatarFallback>UN</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-sm font-medium">{post.userId}</CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(post.createdAt.seconds * 1000), { addSuffix: true })}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm">{post.content}</p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleLikePost(post.id)}>
                      <Heart className="h-4 w-4 mr-1" /> Like ({post.likes})
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleOpenCommentDialog(post)}>
                      <MessageSquare className="h-4 w-4 mr-1" /> Comment ({post.comments})
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Share2 className="h-4 w-4 mr-1" /> Share
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comment Dialog */}
      <Dialog open={isCommentDialogOpen} onOpenChange={setIsCommentDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Comment</DialogTitle>
            <DialogDescription>Share your thoughts on this post</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Label htmlFor="comment-content">Comment</Label>
            <Textarea
              id="comment-content"
              value={newCommentContent}
              onChange={(e) => setNewCommentContent(e.target.value)}
              placeholder="Write your comment here..."
              className="min-h-[80px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCommentDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddComment} className="bg-rose-600 hover:bg-rose-700">
              Add Comment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Upload Dialog */}
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Upload Image</DialogTitle>
            <DialogDescription>Add an image to your post</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedImage ? (
              <div className="flex justify-center">
                <img
                  src={URL.createObjectURL(selectedImage) || "/placeholder.svg"}
                  alt="Selected Image"
                  className="max-h-48 max-w-full rounded-md"
                />
              </div>
            ) : (
              <p className="text-muted-foreground">No image selected.</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImageDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePost} className="bg-rose-600 hover:bg-rose-700" disabled={uploadingImage}>
              {uploadingImage ? (
                <>
                  Uploading...
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                </>
              ) : (
                "Create Post"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
